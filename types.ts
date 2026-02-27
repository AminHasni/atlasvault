
export enum ServiceCategory {
  THE_VAULT = 'The Vault',
  TELECOM_HUB = 'Telecom Hub',
  GAMING_CORNER = 'Gaming Corner',
  BUSINESS_SUITE = 'Business Suite',
}

export interface SecondSubcategory {
  id: string;
  subcategory_id: string;
  label: string;
  label_fr: string;
  label_ar: string;
  desc?: string;
  desc_fr?: string;
  desc_ar?: string;
  icon?: string;
  color?: string;
  fee?: number;
  order?: number;
}

export interface Subcategory {
  id: string;
  category_id?: string; 
  parent_id?: string; 
  label: string;
  label_fr: string;
  label_ar: string;
  desc?: string;
  desc_fr?: string;
  desc_ar?: string;
  icon?: string;
  color?: string;
  fee?: number;
  order?: number;
  second_subcategories?: SecondSubcategory[];
}

export interface Category {
  id: string; // Matches ServiceCategory values
  label: string;
  label_fr: string; 
  label_ar: string; 
  icon: string; 
  color: string;
  desc: string;
  desc_fr: string; 
  desc_ar: string; 
  order: number;
  subcategories?: Subcategory[];
}

// Keeping CategoryMeta for backward compat if needed, but Category replaces it mostly
export type CategoryMeta = Category;

export interface ServiceItem {
  id: string;
  name: string;
  category: string; // Changed from enum to string to support dynamic categories from DB
  description: string;
  price: number;
  currency: string;
  conditions: string;
  requiredInfo: string;
  active: boolean;
  createdAt: number;
  popularity: number;
  promoPrice?: number; // New field for discounted price
  badgeLabel?: string; // New field for marketing badge (e.g. "50% OFF")
  videoUri?: string; // New field for Veo video URI
  subcategory?: string; // New field for subcategory filtering
  second_subcategory_id?: string; // New field for Level 3 subcategory
}

export type ServiceFormData = Omit<ServiceItem, 'id' | 'createdAt'>;

export type OrderStatus = 'pending_whatsapp' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId?: string; 
  serviceId: string;
  serviceName: string;
  category: string;
  subcategory?: string; // Added subcategory to Order
  price: number;
  currency: string;
  customerInfo: string; 
  customerEmail?: string; 
  customerPhone?: string; 
  status: OrderStatus;
  createdAt: number;
  internalNotes?: string; // Field for admin internal notes
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password: string; 
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: number;
  provider?: 'email' | 'google';
}

export interface AuthResponse {
  user: User;
  token: string; 
}

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number; 
  comment: string;
  createdAt: number;
}

export interface GlobalSettings {
  whatsappNumber: string;
}
