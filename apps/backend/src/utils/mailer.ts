import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import type { SendMailOptions } from '@repo/shared';
import { env } from '../lib/env';

const emailUser = process.env['EMAIL_USER']; // kept only for dev recipient routing

/** Resend used when API key exists; otherwise emails are only logged. */
export const hasResend = Boolean(env.RESEND_API_KEY);
export const isMockEmailTransport = !hasResend;

const resend = hasResend ? new Resend(env.RESEND_API_KEY) : null;

/** Dev/test mock: nodemailer stream transport, buffers mail so we can log it. */
const mockTransporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true,
});

export const sendMail = async (opts: SendMailOptions): Promise<void> => {
  if (resend) {
    const response = await resend.emails.send({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (response.error) {
      throw new Error(`Resend failed: ${response.error.message}`);
    }
    return;
  }

  // Mock: no API key -> just buffer + log, never throws on transport.
  await mockTransporter.sendMail(opts);
};

export const resolveMailRecipient = (accountEmail: string): string => {
  if (env.NODE_ENV === 'production') {
    return accountEmail;
  }
  return emailUser ?? accountEmail;
};

/** Must be an address on the Resend-verified domain (lydurh.com). */
export const getMailFrom = (): string => env.RESEND_FROM;
