import prisma from "@db";
import type { AdminInvitationQuery } from "./invitations.dto";

type InvitationListItem = {
  email: string;
  invitationCount: number;
  lastExpiresAt: string | null;
  status: "accepted" | "pending";
  acceptedUserName: string | null;
};

function normalizeDateRange(dateFrom?: string, dateTo?: string) {
  const range: { gte?: Date; lte?: Date } = {};

  if (dateFrom) {
    range.gte = new Date(`${dateFrom}T00:00:00.000Z`);
  }

  if (dateTo) {
    range.lte = new Date(`${dateTo}T23:59:59.999Z`);
  }

  return range;
}

export class AdminInvitationsService {
  async listInvitations(query: AdminInvitationQuery) {
    const { page = 1, limit = 10, search, status, dateFrom, dateTo } = query;

    const expiresAtRange = normalizeDateRange(dateFrom, dateTo);

    const baseWhere: {
      email?: { contains: string; mode: "insensitive" };
      expiresAt?: { gte?: Date; lte?: Date };
    } = {};

    if (search) {
      baseWhere.email = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (expiresAtRange.gte || expiresAtRange.lte) {
      baseWhere.expiresAt = expiresAtRange;
    }

    const [groupedInvitations, acceptedGroups] = await Promise.all([
      prisma.invitation.groupBy({
        by: ["email"],
        where: baseWhere,
        _count: {
          _all: true,
        },
        _max: {
          expiresAt: true,
        },
      }),
      prisma.invitation.groupBy({
        by: ["email"],
        where: {
          ...baseWhere,
          status: "accepted",
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const acceptedEmailSet = new Set(acceptedGroups.map((group) => group.email));

    const items: InvitationListItem[] = groupedInvitations.map((group) => ({
      email: group.email,
      invitationCount: group._count._all,
      lastExpiresAt: group._max.expiresAt?.toISOString() ?? null,
      status: acceptedEmailSet.has(group.email) ? "accepted" : "pending",
      acceptedUserName: null,
    }));

    const statusFilteredItems = status
      ? items.filter((item) => item.status === status)
      : items;

    statusFilteredItems.sort((a, b) => {
      const aTime = a.lastExpiresAt ? new Date(a.lastExpiresAt).getTime() : 0;
      const bTime = b.lastExpiresAt ? new Date(b.lastExpiresAt).getTime() : 0;
      return bTime - aTime;
    });

    const acceptedEmails = statusFilteredItems
      .filter((item) => item.status === "accepted")
      .map((item) => item.email);

    let acceptedNameByEmail = new Map<string, string>();
    if (acceptedEmails.length > 0) {
      const acceptedUsers = await prisma.user.findMany({
        where: {
          email: {
            in: acceptedEmails,
          },
        },
        select: {
          email: true,
          name: true,
        },
      });

      acceptedNameByEmail = new Map(
        acceptedUsers.map((user) => [user.email, user.name]),
      );
    }

    const withAcceptedUser = statusFilteredItems.map((item) => ({
      ...item,
      acceptedUserName:
        item.status === "accepted"
          ? acceptedNameByEmail.get(item.email) ?? null
          : null,
    }));

    const total = withAcceptedUser.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const boundedPage = Math.min(Math.max(page, 1), pages);
    const start = (boundedPage - 1) * limit;
    const end = start + limit;

    return {
      items: withAcceptedUser.slice(start, end),
      total,
      pages,
      page: boundedPage,
      limit,
    };
  }
}

export const adminInvitationsService = new AdminInvitationsService();

