export const env = {
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    SMTP_USER: process.env.SMTP_USER || process.env.EMAIL,
    SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
};