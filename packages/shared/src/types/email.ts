/** Args for sending a transactional email. */
export type SendMailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};
