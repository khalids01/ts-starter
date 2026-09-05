import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { renderEmailTemplate } from "../render.server";

function SecurityLinkEmail({
  preview,
  title,
  description,
  buttonLabel,
  url,
}: {
  preview: string;
  title: string;
  description: string;
  buttonLabel: string;
  url: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="m-0 bg-gray-100 p-0 text-gray-800">
          <Container className="my-10 rounded-lg border border-gray-200 bg-white px-10 py-10">
            <Text className="m-0 mb-6 text-center text-2xl font-bold text-black">TS Starter</Text>
            <Text className="m-0 mb-3 text-xl font-semibold text-black">{title}</Text>
            <Text className="m-0 mb-5 text-base leading-[1.6] text-gray-800">{description}</Text>
            <Section className="my-5 mb-8 text-center">
              <Button href={url} className="rounded-md bg-black px-6 py-3 text-sm font-semibold text-white no-underline">
                {buttonLabel}
              </Button>
            </Section>
            <Text className="m-0 break-all text-sm leading-[1.5] text-gray-600">{url}</Text>
            <Text className="mt-6 text-center text-xs text-gray-500">If you did not request this, you can safely ignore it.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function TwoFactorCodeEmail({ otp }: { otp: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your TS Starter verification code</Preview>
      <Tailwind>
        <Body className="m-0 bg-gray-100 p-0 text-gray-800">
          <Container className="my-10 rounded-lg border border-gray-200 bg-white px-10 py-10 text-center">
            <Text className="m-0 mb-6 text-2xl font-bold text-black">TS Starter</Text>
            <Text className="text-base">Enter this code to complete verification:</Text>
            <Text className="my-6 text-4xl font-bold tracking-[0.35em] text-black">{otp}</Text>
            <Text className="text-xs text-gray-500">The code expires in 5 minutes. If you did not request it, you can ignore this email.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export const verificationEmailTemplate = async (url: string) =>
  renderEmailTemplate(
    <SecurityLinkEmail
      preview="Verify your TS Starter email"
      title="Verify your email"
      description="Confirm this email address to finish setting up your account."
      buttonLabel="Verify email"
      url={url}
    />,
  );

export const passwordResetEmailTemplate = async (url: string) =>
  renderEmailTemplate(
    <SecurityLinkEmail
      preview="Reset your TS Starter password"
      title="Reset your password"
      description="Use this secure link to choose a new password."
      buttonLabel="Reset password"
      url={url}
    />,
  );

export const twoFactorCodeEmailTemplate = async (otp: string) =>
  renderEmailTemplate(<TwoFactorCodeEmail otp={otp} />);
