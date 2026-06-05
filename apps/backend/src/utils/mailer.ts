import * as nodemailer from 'nodemailer';

import { env } from '../lib/env';

const EMAIL_SENDER_NAME = 'Lydurh';

const emailUser = env.EMAIL_USER ?? '';
const emailPass = env.EMAIL_PASS ?? '';

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

export const resolveMailRecipient = (accountEmail: string): string =>
  accountEmail;

export const getMailFrom = (): string =>
  emailUser ? `${EMAIL_SENDER_NAME} <${emailUser}>` : 'noreply@localhost';

export const getReplyTo = (): string => emailUser || 'noreply@localhost';

export const createSimpleEmailMessage = (params: {
  greeting: string;
  intro: string;
  actionLabel: string;
  link: string;
}): { text: string; html: string } => {
  const { greeting, intro, actionLabel, link } = params;

  const text = [
    `${greeting}`,
    '',
    intro,
    '',
    `${actionLabel}: ${link}`,
    '',
    'If the link does not open, copy and paste it into your browser.',
  ].join('\n');

  const html = `
<!doctype html>
<html lang="en">
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
    <p>${greeting}</p>
    <p>${intro}</p>
    <p><a href="${link}" style="color: #111827;">${actionLabel}</a></p>
    <p style="font-size: 12px; color: #4b5563;">${link}</p>
  </body>
</html>
  `.trim();

  return { text, html };
};
