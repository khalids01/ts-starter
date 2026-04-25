export type Segment = "humans" | "bots" | "all";
export type VisitorType = "all" | "new" | "returning";

export type VisitorsOverviewResponse = {
  filters: {
    dateFrom: string;
    dateTo: string;
    segment: Segment;
    type: VisitorType;
  };
  cards: {
    activeNow: number;
    totalVisits: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    botVisits: number;
  };
  series: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    botVisits: number;
  }>;
};

export type VisitorItem = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSeenInRange: string;
  visitsCount: number;
  lastPath: string;
  isLoggedIn: boolean;
  userName: string | null;
  userEmail: string | null;
  deviceType: string | null;
  country: string | null;
  isBot: boolean;
};

export type VisitorsListResponse = {
  items: VisitorItem[];
  total: number;
  pages: number;
  page: number;
  limit: number;
};

export type VisitorsFilters = {
  dateFrom: string;
  dateTo: string;
  segment: Segment;
  type: VisitorType;
  page: number;
  limit: number;
};
