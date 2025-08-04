export interface DashboardStats {
  totalMailsIn: number;
  totalMailsOut: number;
  totalUsers: number;
  totalServices: number;
  totalContactsIn: number;
  totalContactsOut: number;
  totalCouncil: number;
  recentMailsIn: any[];
  recentMailsOut: any[];
  serviceStats: any[];
  monthlyTrends: any[];
  allMailsIn?: any[];
  allMailsOut?: any[];
}

export interface MailInFormData {
  date: string;
  subject: string;
  needsMayor: boolean;
  needsDgs: boolean;
  serviceIds: string;
  councilIds: string;
  contactIds: string;
}

export interface MailOutFormData {
  date: string;
  subject: string;
  reference: string;
  serviceId: string;
  contactIds: string;
}

export interface ViewMailDialog {
  open: boolean;
  mail: any;
  type: "in" | "out";
}

export interface ServiceData {
  id: number;
  name: string;
  code: string;
}

export interface ContactData {
  id: number;
  name: string;
}
