import * as nodemailer from 'nodemailer';
import { env } from '../lib/env';

const emailUser = process.env['EMAIL_USER'];
const emailPass = process.env['EMAIL_PASS'];

/** Gmail is used when credentials exist; otherwise emails are only logged. */
export const hasSmtpCredentials = Boolean(emailUser && emailPass);

export const isMockEmailTransport = !hasSmtpCredentials;

export const transporter: nodemailer.Transporter = hasSmtpCredentials
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })
  : nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });

/**
 * School / dev: deliver auth emails to EMAIL_USER so any signup address (e.g. b@b.com) works.
 * Production: send to the user's real address.
 */
export const resolveMailRecipient = (accountEmail: string): string => {
  if (env.NODE_ENV === 'production') {
    return accountEmail;
  }
  return emailUser ?? accountEmail;
};

export const getMailFrom = (): string => emailUser ?? 'noreply@localhost';
