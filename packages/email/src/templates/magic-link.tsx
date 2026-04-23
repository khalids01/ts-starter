import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { renderEmailTemplate } from "../render";

type MagicLinkEmailProps = {
  url: string;
};

export function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to TS Starter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>TS Starter</Text>
          <Section style={content}>
            <Text style={paragraph}>Hello,</Text>
            <Text style={paragraph}>
              Click the button below to sign in to your account. This link will
              expire in 10 minutes.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button href={url} style={button}>
              Sign In
            </Button>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Or copy and paste this link into your browser:</Text>
            <Text style={linkAlt}>{url}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>If you didn&apos;t request this email, you can safely ignore it.</Text>
            <Text style={footerText}>{`© ${new Date().getFullYear()} TS Starter. All rights reserved.`}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

MagicLinkEmail.PreviewProps = {
  url: "https://example.com/auth/magic-link?token=example",
} satisfies MagicLinkEmailProps;

export const magicLinkTemplate = (url: string) =>
  renderEmailTemplate(<MagicLinkEmail url={url} />);

const main = {
  margin: "0",
  padding: "0",
  backgroundColor: "#f4f4f7",
  color: "#333333",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const logo = {
  margin: "0 0 24px",
  textAlign: "center" as const,
  color: "#000000",
  fontSize: "24px",
  fontWeight: "700",
};

const content = {
  margin: "0 0 16px",
};

const paragraph = {
  margin: "0 0 12px",
  color: "#333333",
  fontSize: "16px",
  lineHeight: "1.6",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "20px 0 32px",
};

const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "600",
  padding: "12px 24px",
};

const linkAlt = {
  margin: "0",
  color: "#555555",
  fontSize: "14px",
  lineHeight: "1.5",
  wordBreak: "break-all" as const,
};

const footer = {
  marginTop: "24px",
  textAlign: "center" as const,
};

const footerText = {
  margin: "0 0 6px",
  color: "#888888",
  fontSize: "12px",
  lineHeight: "1.4",
};
