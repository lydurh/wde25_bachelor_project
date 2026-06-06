import * as nodemailer from 'nodemailer';
import { env } from '../lib/env';

const emailUser = process.env['EMAIL_USER'];
const emailPass = process.env['EMAIL_PASS'];

/** Tests must never deliver: bun sets NODE_ENV=test, forcing the stream transport. */
const isTest = process.env['NODE_ENV'] === 'test';

/** Gmail is used when credentials exist; otherwise emails are only logged. */
export const hasSmtpCredentials = Boolean(emailUser && emailPass);

/** Stream transport buffers to memory and opens no socket — no email leaves. */
export const isMockEmailTransport = !hasSmtpCredentials || isTest;

export const transporter: nodemailer.Transporter = isMockEmailTransport
  ? nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    })
  : nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
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
