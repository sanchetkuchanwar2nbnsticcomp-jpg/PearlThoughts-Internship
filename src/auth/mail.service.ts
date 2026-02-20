import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yourgmail@gmail.com',
      pass: 'your-app-password',
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"Appointment App" <yourgmail@gmail.com>',
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  }
}
