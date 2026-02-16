export const magicLinkTemplate = (url: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sign in to TS Starter</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f7;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #000;
      margin-bottom: 24px;
      text-align: center;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .button-container {
      text-align: center;
      margin-bottom: 32px;
    }
    .button {
      background-color: #000000;
      color: #ffffff !important;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      display: inline-block;
    }
    .footer {
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    .link-alt {
      word-break: break-all;
      color: #555;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">TS Starter</div>
    <div class="content">
      <p>Hello,</p>
      <p>Click the button below to sign in to your account. This link will expire in 10 minutes.</p>
    </div>
    <div class="button-container">
      <a href="${url}" class="button">Sign In</a>
    </div>
    <div class="content">
      <p>Or copy and paste this link into your browser:</p>
      <p class="link-alt">${url}</p>
    </div>
    <div class="footer">
      <p>If you didn't request this email, you can safely ignore it.</p>
      <p>&copy; ${new Date().getFullYear()} TS Starter. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
