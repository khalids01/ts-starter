import prisma from "@db";
import type { Role } from "@db";

type InvitationErrorCode =
  | "INVITATION_NOT_FOUND"
  | "INVITATION_EXPIRED"
  | "INVITATION_ALREADY_ACCEPTED"
  | "INVITATION_NOT_PENDING"
  | "EMAIL_MISMATCH";

type InvitationError = {
  status: 403 | 404 | 409 | 410;
  code: InvitationErrorCode;
  message: string;
};

type InvitationForView = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  inviterName: string;
};

type AcceptResult =
  | {
    success: false;
    error: InvitationError;
  }
  | {
    success: true;
    data: {
      redirectTo: "/onboarding" | "/dashboard";
    };
  };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function invitationNotFound(): InvitationError {
  return {
    status: 404,
    code: "INVITATION_NOT_FOUND",
    message: "Invitation not found.",
  };
}

function invitationExpired(): InvitationError {
  return {
    status: 410,
    code: "INVITATION_EXPIRED",
    message: "Invitation has expired.",
  };
}

function invitationNotPending(status: string): InvitationError {
  if (status === "accepted") {
    return {
      status: 409,
      code: "INVITATION_ALREADY_ACCEPTED",
      message: "Invitation was already accepted.",
    };
  }

  return {
    status: 409,
    code: "INVITATION_NOT_PENDING",
    message: "Invitation is no longer pending.",
  };
}

export class InvitationsService {
  async getInvitationById(id: string): Promise<InvitationForView | InvitationError> {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return invitationNotFound();
    }

    if (invitation.status !== "pending") {
      return invitationNotPending(invitation.status);
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      return invitationExpired();
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      inviterName: invitation.user.name,
    };
  }

  async acceptInvitation(args: {
    invitationId: string;
    userId: string;
    userEmail: string;
  }): Promise<AcceptResult> {
    const invitationLookup = await this.getInvitationById(args.invitationId);

    if ("code" in invitationLookup) {
      return {
        success: false,
        error: invitationLookup,
      };
    }

    if (normalizeEmail(args.userEmail) !== normalizeEmail(invitationLookup.email)) {
      return {
        success: false,
        error: {
          status: 403,
          code: "EMAIL_MISMATCH",
          message: "Please sign in with the invited email address.",
        },
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedInvitation = await tx.invitation.updateMany({
        where: {
          id: args.invitationId,
          status: "pending",
        },
        data: {
          status: "accepted",
        },
      });

      if (updatedInvitation.count === 0) {
        return null;
      }

      await tx.user.update({
        where: { id: args.userId },
        data: { role: invitationLookup.role as Role },
      });

      const user = await tx.user.findUnique({
        where: { id: args.userId },
        select: { onboardingComplete: true },
      });

      return {
        redirectTo: user?.onboardingComplete ? "/dashboard" : "/onboarding",
      } as const;
    });

    if (!result) {
      return {
        success: false,
        error: invitationNotPending("accepted"),
      };
    }

    return {
      success: true,
      data: {
        redirectTo: result.redirectTo,
      },
    };
  }
}

export const invitationsService = new InvitationsService();
