export type InvitationListItem = {
  email: string;
  invitationCount: number;
  lastExpiresAt: string | null;
  status: "accepted" | "pending";
  acceptedUserName: string | null;
};

export type UsersListResponse = {
  users: any[];
  total: number;
  pages: number;
};

export type InvitationsListResponse = {
  items: InvitationListItem[];
  total: number;
  pages: number;
  page: number;
  limit: number;
};
