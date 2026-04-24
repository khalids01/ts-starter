import type { BetterAuthPlugin, User } from "better-auth";
import prisma from "@db";

import { polarClient } from "./payments";

type AuthUser = Partial<User> & {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  isAnonymous?: boolean | null;
};

const BILLING_ROLE = "USER";
const NON_BILLING_ROLES = ["ADMIN", "OWNER"] as const;

async function getPendingInvitationRole(email: string) {
  const invitation = await prisma.invitation.findFirst({
    where: {
      email: {
        equals: email.trim(),
        mode: "insensitive",
      },
      status: "pending",
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      role: true,
    },
  });

  return invitation?.role ?? null;
}

async function isBillingUser(user: AuthUser) {
  if (user.isAnonymous || !user.email) {
    return false;
  }

  const invitedRole = await getPendingInvitationRole(user.email);
  if (
    invitedRole &&
    NON_BILLING_ROLES.includes(invitedRole as (typeof NON_BILLING_ROLES)[number])
  ) {
    return false;
  }

  return (user.role ?? BILLING_ROLE) === BILLING_ROLE;
}

async function ensurePolarCustomer(user: AuthUser) {
  if (!user.id || !user.email || !(await isBillingUser(user))) {
    return;
  }

  const { result: existingCustomers } = await polarClient.customers.list({
    email: user.email,
  });
  const existingCustomer = existingCustomers.items[0];

  if (!existingCustomer) {
    const customer = await polarClient.customers.create({
      email: user.email,
      name: user.name,
      externalId: user.id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { polarCustomerId: customer.id },
    });
    return;
  }

  const customer =
    existingCustomer.externalId === user.id
      ? existingCustomer
      : await polarClient.customers.update({
          id: existingCustomer.id,
          customerUpdate: {
            externalId: user.id,
          },
        });

  await prisma.user.update({
    where: { id: user.id },
    data: { polarCustomerId: customer.id },
  });
}

async function updatePolarCustomer(user: AuthUser) {
  if (!user.id || !user.email || !(await isBillingUser(user))) {
    return;
  }

  await polarClient.customers.updateExternal({
    externalId: user.id,
    customerUpdateExternalID: {
      email: user.email,
      name: user.name,
    },
  });
}

async function deletePolarCustomer(user: AuthUser) {
  if (!user.email) {
    return;
  }

  const { result: existingCustomers } = await polarClient.customers.list({
    email: user.email,
  });
  const existingCustomer = existingCustomers.items[0];

  if (existingCustomer) {
    await polarClient.customers.delete({
      id: existingCustomer.id,
    });
  }
}

export function polarCustomersForBillingUsers(): BetterAuthPlugin {
  return {
    id: "polar-customers-for-billing-users",
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                after: ensurePolarCustomer,
              },
              update: {
                after: updatePolarCustomer,
              },
              delete: {
                after: deletePolarCustomer,
              },
            },
          },
        },
      };
    },
  };
}
