import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

  private transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kuchanwarsanchet@gmail.com',      // your Gmail address
    pass: 'itii vcjc tyou gkew',   // 16-digit Gmail App Password (NOT your normal password)
  },
});


  async sendVerificationEmail(email: string, token: string) {
    try {

      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

      await this.transporter.sendMail({
        from: `"Appointment App" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Welcome to Appointment App 👋</p>
            <p>Please click the button below to verify your account:</p>

            <a href="${verificationUrl}" 
               style="display:inline-block;
                      padding:10px 20px;
                      background-color:#007bff;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:5px;">
              Verify Email
            </a>

            <p style="margin-top:20px;">
              If you did not register, please ignore this email.
            </p>
          </div>
        `,
      });

      return { message: 'Verification email sent successfully' };

    } catch (error) {
      console.error('Email sending failed:', error);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }
}
