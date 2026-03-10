import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Creates a nodemailer transport using SMTP credentials from environment variables
function createTransport(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// Sends a transactional email — silently logs errors without crashing the app
export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('Email not configured — skipping email send');
    return;
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: env.EMAIL_FROM ?? 'ProManagement <noreply@promanagement.app>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
  }
}

// Builds the HTML email body for a project invitation
export function buildInviteEmail(params: {
  inviteeName: string;
  projectName: string;
  role: string;
  loginUrl: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You have been invited to ${params.projectName}</h2>
      <p>Hello ${params.inviteeName},</p>
      <p>You have been added to <strong>${params.projectName}</strong> as a <strong>${params.role}</strong>.</p>
      <p>Click the button below to log in and get started.</p>
      <a href="${params.loginUrl}"
        style="display: inline-block; padding: 12px 24px; background: #6366f1;
        color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Go to Dashboard
      </a>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        If you did not expect this invitation, you can ignore this email.
      </p>
    </div>
  `;
}