import { supabase, isDbConnected } from './supabaseClient';
import { ServiceItem, Order, User, Review, Category } from '../types';

// This service handles the direct DB communication

export const db = {
  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data as Category[];
  },

  async addCategory(category: Category): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async updateCategory(category: Category): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', category.id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Services ---
  async getServices(): Promise<ServiceItem[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('DB Error:', error);
      return [];
    }
    
    // Ensure numeric types are actually numbers
    return (data || []).map((item: any) => ({
        ...item,
        price: Number(item.price),
        promoPrice: item.promoPrice ? Number(item.promoPrice) : undefined,
        createdAt: Number(item.createdAt),
        popularity: Number(item.popularity)
    })) as ServiceItem[];
  },

  async addService(service: ServiceItem): Promise<ServiceItem> {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();

    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        price: Number(item.price),
        promoPrice: item.promoPrice ? Number(item.promoPrice) : undefined,
        createdAt: Number(item.createdAt),
        popularity: Number(item.popularity)
    };
  },

  async updateService(service: ServiceItem): Promise<ServiceItem> {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', service.id)
      .select()
      .single();

    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        price: Number(item.price),
        promoPrice: item.promoPrice ? Number(item.promoPrice) : undefined,
        createdAt: Number(item.createdAt),
        popularity: Number(item.popularity)
    };
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
      
    if (error) return [];
    
    return (data || []).map((item: any) => ({
        ...item,
        price: Number(item.price),
        createdAt: Number(item.createdAt)
    })) as Order[];
  },

  async addOrder(order: Order): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        price: Number(item.price),
        createdAt: Number(item.createdAt)
    };
  },

  async updateOrder(order: Order): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', order.id)
      .select()
      .single();

    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        price: Number(item.price),
        createdAt: Number(item.createdAt)
    };
  },

  // --- Users (Profiles) ---
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    
    return (data || []).map((item: any) => ({
        ...item,
        createdAt: Number(item.createdAt)
    })) as User[];
  },

  async addUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        createdAt: Number(item.createdAt)
    };
  },

  async updateUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(user)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        createdAt: Number(item.createdAt)
    };
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Reviews ---
  async getReviews(serviceId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('serviceId', serviceId)
      .order('createdAt', { ascending: false });

    if (error) return [];
    
    return (data || []).map((item: any) => ({
        ...item,
        rating: Number(item.rating),
        createdAt: Number(item.createdAt)
    })) as Review[];
  },

  async addReview(review: Review): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    
    const item = data as any;
    return {
        ...item,
        rating: Number(item.rating),
        createdAt: Number(item.createdAt)
    };
  }
};