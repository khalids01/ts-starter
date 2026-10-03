import { expect, it } from "bun:test";
import nodemailer from "nodemailer";
import { passwordResetEmailTemplate } from "../../../packages/email/src/templates/security";

it("renders the application reset template and composes MIME without an SMTP connection", async () => {
  const html = await passwordResetEmailTemplate("https://shop.example.test/reset-password?token=fictional-token");
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
  const result = await transport.sendMail({
    from: "Fictional Shop <noreply@shop.example.test>", to: "Fictional Buyer <buyer@northstar.example.test>",
    subject: "Fictional password reset", html,
  });
  expect(result.envelope.to).toEqual(["buyer@northstar.example.test"]);
  expect(result.message.toString()).toContain("Content-Type: text/html");
  expect(html).toContain("fictional-token");
  transport.close();
});
