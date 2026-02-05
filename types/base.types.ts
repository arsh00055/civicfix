export interface BaseUser {
    id: string;
    email: string;
    name: string;
    role: 'citizen' | 'volunteer' | 'admin';
    avatar?: string | null;
    phone?: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }
  
  export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }