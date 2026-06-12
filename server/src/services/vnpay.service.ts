import crypto from 'crypto';
import querystring from 'qs';

// VNPay Configuration — loaded from environment variables
const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'CGXZLS0Z';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:3000/api/v1/vnpay/return';

/**
 * Sort object keys alphabetically (required by VNPay)
 */
function sortObject(obj: Record<string, string | number>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = String(obj[key]);
  }
  return sorted;
}

/**
 * Format date as YYYYMMDDHHmmss (VNPay format)
 */
function formatVnpDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

export interface VnpayPaymentResult {
  isSuccess: boolean;
  orderId: string;
  transactionNo: string;
  amount: number;
  bankCode: string;
  responseCode: string;
  message: string;
}

export class VnpayService {
  /**
   * Create a VNPay payment URL for an order
   * @param orderId - Order ID (used as vnp_TxnRef)
   * @param amount - Amount in VND (will be multiplied by 100 for VNPay)
   * @param orderInfo - Description of the order
   * @param ipAddr - Client IP address
   * @returns Full VNPay payment URL
   */
  createPaymentUrl(
    orderId: string,
    amount: number,
    orderInfo: string,
    ipAddr: string
  ): string {
    const createDate = formatVnpDate(new Date());

    // Build VNPay params
    const vnpParams: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(amount * 100), // VNPay requires amount * 100
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort params alphabetically
    const sorted = sortObject(vnpParams);

    // Create HMAC-SHA512 signature
    const signData = querystring.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Append signature and build final URL
    sorted['vnp_SecureHash'] = signed;
    const paymentUrl = `${VNP_URL}?${querystring.stringify(sorted, { encode: false })}`;

    return paymentUrl;
  }

  /**
   * Verify the checksum from VNPay return/IPN callback
   * @param vnpParams - Query params from VNPay callback
   * @returns Verification result with order details
   */
  verifyCallback(vnpParams: Record<string, string>): VnpayPaymentResult {
    // Extract and remove the secure hash from params before verification
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Sort remaining params
    const sorted = sortObject(vnpParams as Record<string, string | number>);

    // Recalculate the signature
    const signData = querystring.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const responseCode = vnpParams['vnp_ResponseCode'] || '';
    const isChecksumValid = secureHash === checkSum;
    const isPaymentSuccess = responseCode === '00';

    return {
      isSuccess: isChecksumValid && isPaymentSuccess,
      orderId: vnpParams['vnp_TxnRef'] || '',
      transactionNo: vnpParams['vnp_TransactionNo'] || '',
      amount: parseInt(vnpParams['vnp_Amount'] || '0', 10) / 100, // Convert back from VNPay format
      bankCode: vnpParams['vnp_BankCode'] || '',
      responseCode,
      message: isChecksumValid
        ? isPaymentSuccess
          ? 'Thanh toán thành công'
          : this.getResponseMessage(responseCode)
        : 'Chữ ký không hợp lệ',
    };
  }

  /**
   * Map VNPay response codes to Vietnamese messages
   */
  private getResponseMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản bị khóa.',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Khách hàng hủy giao dịch.',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Lỗi không xác định.',
    };
    return messages[code] || `Giao dịch thất bại (Mã lỗi: ${code})`;
  }
}
