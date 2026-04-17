import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lunarofmoon@gmail.com',
        pass: 'idektxbqqwdavxou',
      },
    });
  }

  /**
   * Generate a random 6-digit OTP code
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP verification email for order confirmation
   */
  async sendOrderOTP(
    to: string,
    otp: string,
    orderNumber: string,
    total: number
  ): Promise<void> {
    const formattedTotal = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(total);

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #000000; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 3px; font-weight: 700;">
            BADMINTONPRO
          </h1>
        </div>
        
        <div style="padding: 40px 32px;">
          <h2 style="color: #111; margin: 0 0 8px 0; font-size: 22px;">Xác nhận đơn hàng</h2>
          <p style="color: #666; margin: 0 0 32px 0; font-size: 14px;">
            Đơn hàng <strong>${orderNumber}</strong> • Tổng: <strong>${formattedTotal}</strong>
          </p>
          
          <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
            <p style="color: #666; margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
              Mã xác nhận của bạn
            </p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #000; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #999; margin: 16px 0 0 0; font-size: 12px;">
              Mã có hiệu lực trong 10 phút
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            Vui lòng nhập mã trên để xác nhận đơn hàng. Nếu bạn không thực hiện giao dịch này, bạn có thể bỏ qua email này.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} BadmintonPro. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BadmintonPro" <${process.env.SMTP_USER}>`,
      to,
      subject: `[BadmintonPro] Mã xác nhận đơn hàng ${orderNumber}`,
      html: htmlContent,
    });
  }
}
