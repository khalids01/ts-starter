import type { Prisma } from "@db/server";

export function normalizeCustomerEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function upsertCheckoutCustomer(
  tx: Prisma.TransactionClient,
  input: { userId?: string; name: string; email: string; phone?: string | null },
) {
  const normalizedEmail = normalizeCustomerEmail(input.email);
  const existing = await tx.ecommerceCustomer.findUnique({ where: { normalizedEmail } });
  if (existing) {
    const userProfile = existing.userId || !input.userId
      ? null
      : await tx.ecommerceCustomer.findUnique({ where: { userId: input.userId } });
    return tx.ecommerceCustomer.update({
      where: { id: existing.id },
      data: {
        email: input.email.trim(),
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        ...(existing.userId || userProfile || !input.userId ? {} : { userId: input.userId }),
      },
    });
  }

  const userProfile = input.userId
    ? await tx.ecommerceCustomer.findUnique({ where: { userId: input.userId } })
    : null;
  return tx.ecommerceCustomer.create({
    data: {
      normalizedEmail,
      email: input.email.trim(),
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      userId: userProfile ? null : input.userId ?? null,
    },
  });
}
