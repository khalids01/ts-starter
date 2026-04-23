import { siteConfig } from "@config";

export type InvitationTemplateInput = {
  inviteUrl: string;
  inviterName: string;
  invitedEmail: string;
  invitedRole: "USER" | "ADMIN";
  expiresInDays?: number;
};

function formatRole(role: "USER" | "ADMIN") {
  return role === "ADMIN" ? "Admin" : "User";
}

export const invitationTemplate = ({
  inviteUrl,
  inviterName,
  invitedEmail,
  invitedRole,
  expiresInDays = 7,
}: InvitationTemplateInput) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${siteConfig.name}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      line-height: 1.55;
      color: #111827;
    }
    .container {
      max-width: 600px;
      margin: 24px auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      overflow: hidden;
    }
    .header {
      padding: 26px 30px;
      background: #0f172a;
      color: #f9fafb;
    }
    .brand {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .content {
      padding: 30px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 24px;
      line-height: 1.3;
      color: #0f172a;
    }
    p {
      margin: 0 0 14px;
      color: #334155;
      font-size: 16px;
    }
    .meta {
      margin: 20px 0 22px;
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
    }
    .meta-row {
      margin: 0 0 6px;
      font-size: 14px;
      color: #334155;
    }
    .meta-row:last-child {
      margin-bottom: 16px;
    }
    .meta-label {
      display: inline-block;
      min-width: 68px;
      color: #64748b;
    }
    .button-container {
      text-align: center;
      margin: 26px 0 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #111827;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .fallback {
      margin-top: 22px;
      padding: 12px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      font-size: 13px;
      color: #475569;
      word-break: break-all;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding: 18px 30px 22px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">${siteConfig.name}</div>
    </div>
    <div class="content">
      <h1>You are invited to join ${siteConfig.name}</h1>
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> invited <strong>${invitedEmail}</strong> to join the workspace as <strong>${formatRole(invitedRole)}</strong>.</p>
      <div class="meta">
        <p class="meta-row"><span class="meta-label">Role:</span> ${formatRole(invitedRole)}</p>
        <p class="meta-row"><span class="meta-label">Email:</span> ${invitedEmail}</p>
        <p class="meta-row"><span class="meta-label">Expires:</span> This invitation expires in ${expiresInDays} days.</p>
      </div>
      <p>Click the button below to accept this invitation and complete account setup.</p>
      <div class="button-container">
        <a href="${inviteUrl}" class="button">Accept Invitation</a>
      </div>
      <div class="fallback">
        If the button does not work, copy and paste this URL into your browser:<br />
        <a href="${inviteUrl}">${inviteUrl}</a>
      </div>
      <p style="margin-top: 18px; font-size: 14px;">If you did not expect this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
