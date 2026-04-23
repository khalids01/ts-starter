import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { siteConfig } from "@config";

import { renderEmailTemplate } from "../render";

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

export function InvitationEmail({
  inviteUrl,
  inviterName,
  invitedEmail,
  invitedRole,
  expiresInDays = 7,
}: InvitationTemplateInput) {
  const roleLabel = formatRole(invitedRole);

  return (
    <Html>
      <Head />
      <Preview>{`Invitation: Join ${siteConfig.name} as ${roleLabel}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>{siteConfig.name}</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>{`You are invited to join ${siteConfig.name}`}</Heading>
            <Text style={paragraph}>Hello,</Text>
            <Text style={paragraph}>
              <strong>{inviterName}</strong> invited <strong>{invitedEmail}</strong> to
              join the workspace as <strong>{roleLabel}</strong>.
            </Text>

            <Section style={metaBox}>
              <Text style={metaRow}>
                <span style={metaLabel}>Role:</span> {roleLabel}
              </Text>
              <Text style={metaRow}>
                <span style={metaLabel}>Email:</span> {invitedEmail}
              </Text>
              <Text style={metaRowLast}>
                <span style={metaLabel}>Expires:</span> This invitation expires in{" "}
                {expiresInDays} days.
              </Text>
            </Section>

            <Text style={paragraph}>
              Click the button below to accept this invitation and complete account
              setup.
            </Text>

            <Section style={buttonContainer}>
              <Button href={inviteUrl} style={button}>
                Accept Invitation
              </Button>
            </Section>

            <Section style={fallbackBox}>
              <Text style={fallbackText}>
                If the button does not work, copy and paste this URL into your browser:
              </Text>
              <Text style={fallbackUrl}>{inviteUrl}</Text>
            </Section>

            <Text style={smallParagraph}>
              If you did not expect this invitation, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={footerRule} />
          <Section style={footer}>
            <Text style={footerText}>
              {`© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

InvitationEmail.PreviewProps = {
  inviteUrl: "https://example.com/accept-invitation?id=inv_123",
  inviterName: "A team member",
  invitedEmail: "invitee@example.com",
  invitedRole: "USER",
  expiresInDays: 7,
} satisfies InvitationTemplateInput;

export const invitationTemplate = (input: InvitationTemplateInput) =>
  renderEmailTemplate(<InvitationEmail {...input} />);

const main = {
  margin: "0",
  padding: "0",
  backgroundColor: "#f3f4f6",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  color: "#111827",
};

const container = {
  maxWidth: "600px",
  margin: "24px auto",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  overflow: "hidden",
};

const header = {
  padding: "26px 30px",
  backgroundColor: "#0f172a",
};

const brand = {
  margin: "0",
  color: "#f9fafb",
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "1.2",
};

const content = {
  padding: "30px",
};

const heading = {
  margin: "0 0 12px",
  color: "#0f172a",
  fontSize: "24px",
  lineHeight: "1.3",
};

const paragraph = {
  margin: "0 0 14px",
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.55",
};

const metaBox = {
  margin: "20px 0 22px",
  padding: "14px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  backgroundColor: "#f8fafc",
};

const metaRow = {
  margin: "0 0 6px",
  color: "#334155",
  fontSize: "14px",
  lineHeight: "1.5",
};

const metaRowLast = {
  ...metaRow,
  margin: "0",
};

const metaLabel = {
  display: "inline-block",
  minWidth: "68px",
  color: "#64748b",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "26px 0 20px",
};

const button = {
  backgroundColor: "#111827",
  color: "#ffffff",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
};

const fallbackBox = {
  marginTop: "22px",
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  border: "1px dashed #cbd5e1",
};

const fallbackText = {
  margin: "0 0 8px",
  color: "#475569",
  fontSize: "13px",
  lineHeight: "1.5",
};

const fallbackUrl = {
  margin: "0",
  color: "#0f172a",
  fontSize: "13px",
  lineHeight: "1.4",
  wordBreak: "break-all" as const,
};

const smallParagraph = {
  margin: "18px 0 0",
  color: "#475569",
  fontSize: "14px",
  lineHeight: "1.55",
};

const footerRule = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const footer = {
  padding: "18px 30px 22px",
  textAlign: "center" as const,
};

const footerText = {
  margin: "0",
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.4",
};
