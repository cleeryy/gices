export interface AdminStats {
  totalUsers: number;
  totalMailsIn: number;
  totalMailsOut: number;
  totalServices: number;
  totalContactsIn: number;
  totalContactsOut: number;
  totalCouncil: number;
  recentActivity: any[];
  monthlyMailsGrowth: number;
  weeklyActivity: any[];
}

export interface AdminSection {
  id: string;
  label: string;
  icon: any;
  count?: number;
}

export interface TableData {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
