import { Request, Response } from 'express';
import { VnpayService } from '../services/vnpay.service';
import { OrderService } from '../services/order.service';
import { AppError } from '../middlewares/error.middleware';

const vnpayService = new VnpayService();
const orderService = new OrderService();

// Client URL for redirecting after payment
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

export class VnpayController {
  /**
   * POST /api/v1/vnpay/create-payment
   * Create a VNPay payment URL for an existing order
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    const { orderId } = req.body;

    if (!orderId) {
      throw new AppError('Thiếu orderId', 400);
    }

    // Find the order
    const order = await orderService.findById(orderId);
    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404);
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      throw new AppError('Đơn hàng đã được thanh toán', 400);
    }

    // Get client IP
    const ipAddr =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    // Create payment URL
    const amount = Number(order.total);
    const orderInfo = `Thanh toan don hang ${order.order_number}`;
    const paymentUrl = vnpayService.createPaymentUrl(
      order.id,
      amount,
      orderInfo,
      ipAddr
    );

    res.json({
      success: true,
      data: { paymentUrl },
    });
  }

  /**
   * GET /api/v1/vnpay/return
   * VNPay redirects user here after payment
   * Verify checksum → update order → redirect to client
   */
  async vnpayReturn(req: Request, res: Response): Promise<void> {
    const vnpParams = { ...req.query } as Record<string, string>;

    const result = vnpayService.verifyCallback(vnpParams);

    if (result.isSuccess) {
      // Update order payment status to paid
      try {
        await orderService.update(result.orderId, {
          payment_status: 'paid',
          status: 'confirmed',
        });
      } catch (err) {
        console.error('Failed to update order after VNPay payment:', err);
      }

      // Redirect to client success page
      const redirectUrl = `${CLIENT_URL}/checkout/vnpay-return?status=success&orderId=${encodeURIComponent(result.orderId)}&transactionNo=${encodeURIComponent(result.transactionNo)}&amount=${result.amount}`;
      res.redirect(redirectUrl);
    } else {
      // Redirect to client with error
      const redirectUrl = `${CLIENT_URL}/checkout/vnpay-return?status=failed&orderId=${encodeURIComponent(result.orderId)}&code=${encodeURIComponent(result.responseCode)}&message=${encodeURIComponent(result.message)}`;
      res.redirect(redirectUrl);
    }
  }

  /**
   * GET /api/v1/vnpay/ipn
   * VNPay server-to-server IPN callback
   * Must return { RspCode: '00', Message: 'success' } format
   */
  async vnpayIPN(req: Request, res: Response): Promise<void> {
    const vnpParams = { ...req.query } as Record<string, string>;

    const result = vnpayService.verifyCallback(vnpParams);

    if (!result.orderId) {
      res.json({ RspCode: '01', Message: 'Order not found' });
      return;
    }

    // Verify order exists
    const order = await orderService.findById(result.orderId);
    if (!order) {
      res.json({ RspCode: '01', Message: 'Order not found' });
      return;
    }

    // Check if order amount matches
    if (Number(order.total) !== result.amount) {
      res.json({ RspCode: '04', Message: 'Amount invalid' });
      return;
    }

    // Check if order is already paid (avoid double processing)
    if (order.payment_status === 'paid') {
      res.json({ RspCode: '02', Message: 'Order already confirmed' });
      return;
    }

    if (result.isSuccess) {
      // Update order payment status
      try {
        await orderService.update(result.orderId, {
          payment_status: 'paid',
          status: 'confirmed',
        });
        res.json({ RspCode: '00', Message: 'Confirm Success' });
      } catch (err) {
        console.error('IPN update error:', err);
        res.json({ RspCode: '99', Message: 'Unknown error' });
      }
    } else {
      res.json({ RspCode: '00', Message: 'Confirm Success' });
    }
  }
}
