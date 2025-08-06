export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type UserRole = "USER" | "ADMIN";

export interface CreateUserData {
  id: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
  serviceId: number;
  role?: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  serviceId?: number;
  isActive?: boolean;
  role?: UserRole;
}

export interface CreateServiceData {
  name: string;
  code: string;
  mailType: "IN" | "OUT" | "BOTH";
  isActive?: boolean;
}

export interface ServiceDestination {
  serviceId: number;
  type: "INFO" | "SUIVI";
}
export interface CreateMailInData {
  date: Date;
  subject: string;
  needsMayor?: boolean;
  needsDgs?: boolean;
  serviceDestinations?: ServiceDestination[];
  councilIds?: number[];
  contactIds?: number[];
}

export interface CreateMailOutData {
  date: Date;
  subject: string;
  reference: string;
  serviceId: number;
  userId: string;
  contactIds?: number[];
}
