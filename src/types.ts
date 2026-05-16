export interface ProductOption {
  name: string;
  price: number;
}

export interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  subCategoryL1?: string | null;
  subCategoryL2?: string | null;
  image: string;
  imageUrl?: string;
  rating: number;
  description?: string;
  features?: string[];
  duration?: string;
  badge?: string;
  options?: ProductOption[];
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  imageUrl?: string;
  color: string;
  parentId?: string | null;
  level: number;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  balance: number;
  createdAt: any;
  updatedAt: any;
  isAdmin?: boolean;
  fcmToken?: string;
  cart?: any[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase' | 'refund';
  description: string;
  createdAt: any;
}

export interface GiftCode {
  id: string; // The code itself or the document ID
  code: string;
  type?: 'discount' | 'credit'; // discount or credit
  value: number; // Discount value or credit amount
  status: 'active' | 'used' | 'expired';
  usedBy?: string; // userId if used
  createdAt: any;
}

export interface AccountCategory {
  id: string; // Document ID
  title: string;
  icon: string; // We will store icon name and map it dynamically, or just let users type it
  imageUrl?: string;
  color: string;
  bg: string;
  count: number;
  desc: string;
  createdAt: any;
}

export interface ServiceRequest {
  id?: string;
  userId: string;
  userEmail?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: any;
  unreadMessagesAdmin?: number;
  unreadMessagesUser?: number;
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: any;
}

export interface OrderItem {
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  imageUrl?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  userEmail?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  unreadMessagesAdmin?: number;
  unreadMessagesUser?: number;
}

export interface Wishlist {
  userId: string;
  productIds: (string | number)[];
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  isAdmin: boolean;
  createdAt: any;
  attachment?: Attachment;
  isSystemMessage?: boolean;
}
