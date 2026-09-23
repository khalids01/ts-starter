import { describe, expect, it, mock } from "bun:test";
import { upsertCheckoutCustomer } from "../src/modules/ecommerce/customers/customer-identity.service";

function transaction(existingByEmail: any = null, existingByUser: any = null) {
  const findUnique = mock(async ({ where }: any) => where.normalizedEmail ? existingByEmail : existingByUser);
  const update = mock(async (args: any) => ({ id: args.where.id, ...args.data }));
  const create = mock(async (args: any) => ({ id: "created", ...args.data }));
  return { tx: { ecommerceCustomer: { findUnique, update, create } } as any, findUnique, update, create };
}

describe("checkout customer identity", () => {
  it("updates an existing email identity and links a new authenticated user", async () => {
    const fixture = transaction({ id: "customer-1", userId: null }, null);
    await upsertCheckoutCustomer(fixture.tx, {
      userId: "user-1",
      name: "  Nusrat  ",
      email: "  NUSRAT@example.test  ",
      phone: "  +8801700000000  ",
    });
    expect(fixture.update).toHaveBeenCalledWith({
      where: { id: "customer-1" },
      data: { email: "NUSRAT@example.test", name: "Nusrat", phone: "+8801700000000", userId: "user-1" },
    });
  });

  it("does not steal an existing user relation", async () => {
    const fixture = transaction({ id: "customer-1", userId: null }, { id: "customer-2" });
    await upsertCheckoutCustomer(fixture.tx, { userId: "user-1", name: "Nusrat", email: "nusrat@example.test" });
    expect(fixture.update.mock.calls[0]?.[0].data).not.toHaveProperty("userId");
  });

  it("creates guest and signed-in identities without duplicate user links", async () => {
    const guest = transaction();
    await upsertCheckoutCustomer(guest.tx, { name: "Guest", email: " Guest@Example.Test ", phone: " " });
    expect(guest.create.mock.calls[0]?.[0].data).toMatchObject({ normalizedEmail: "guest@example.test", userId: null, phone: null });

    const signedIn = transaction(null, { id: "existing-user-customer" });
    await upsertCheckoutCustomer(signedIn.tx, { userId: "user-1", name: "User", email: "user@example.test" });
    expect(signedIn.create.mock.calls[0]?.[0].data.userId).toBeNull();
  });
});
