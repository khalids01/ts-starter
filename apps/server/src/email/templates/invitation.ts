import { siteConfig } from "@ts-starter/config";

export const invitationTemplate = (inviteUrl: string, inviterName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${siteConfig.name}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 40px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #000;
      margin-bottom: 32px;
      text-align: center;
    }
    .content {
      margin-bottom: 32px;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }
    p {
      margin-bottom: 16px;
      color: #4b5563;
    }
    .button-container {
      text-align: center;
      margin-top: 32px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #333;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #9ca3af;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">${siteConfig.name}</div>
    <div class="content">
      <h1>Join our team</h1>
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${siteConfig.name}</strong>.</p>
      <p>Click the button below to accept the invitation and set up your account.</p>
      <div class="button-container">
        <a href="${inviteUrl}" class="button">Accept Invitation</a>
      </div>
      <p style="margin-top: 32px; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
