import { supabase, isDbConnected } from './supabaseClient';
import { ServiceItem, Order, User, Review, Category } from '../types';

// This service handles the direct DB communication

export const db = {
  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (catError) {
        console.error('Error fetching categories:', catError);
        return [];
    }

    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*')
      .order('order', { ascending: true });

    if (subError) {
        console.error('Error fetching subcategories:', subError);
        // Return categories without subcategories if sub fetch fails
        return categories as Category[];
    }

    // Map subcategories to their parent categories
    return (categories as Category[]).map(cat => ({
        ...cat,
        subcategories: (subcategories as any[]).filter(sub => sub.category_id === cat.id)
    }));
  },

  async addCategory(category: Category): Promise<Category> {
    // 1. Insert Category
    const { subcategories, ...catData } = category;
    const { data: newCat, error } = await supabase
      .from('categories')
      .insert([catData])
      .select()
      .single();

    if (error) throw error;

    // 2. Insert Subcategories if any
    if (subcategories && subcategories.length > 0) {
        const subsToInsert = subcategories.map(sub => ({
            id: sub.id,
            category_id: newCat.id,
            label: sub.label,
            label_fr: sub.label_fr,
            label_ar: sub.label_ar,
            desc: sub.desc,
            desc_fr: sub.desc_fr,
            desc_ar: sub.desc_ar,
            image: sub.image
        }));
        
        const { error: subError } = await supabase
            .from('subcategories')
            .insert(subsToInsert);
            
        if (subError) console.error('Error adding subcategories:', subError);
    }

    // Return full object by re-fetching or constructing
    return this.getCategories().then(cats => cats.find(c => c.id === newCat.id) || newCat as Category);
  },

  async updateCategory(category: Category): Promise<Category> {
    const { subcategories, ...catData } = category;
    
    // 1. Update Category
    const { error } = await supabase
      .from('categories')
      .update(catData)
      .eq('id', category.id);

    if (error) throw error;

    // 2. Sync Subcategories (Delete all and re-insert is simplest for now, or diffing)
    // For simplicity in this demo: Delete all for this category and re-insert
    await supabase.from('subcategories').delete().eq('category_id', category.id);
    
    if (subcategories && subcategories.length > 0) {
        const subsToInsert = subcategories.map(sub => ({
            id: sub.id,
            category_id: category.id,
            label: sub.label,
            label_fr: sub.label_fr,
            label_ar: sub.label_ar,
            desc: sub.desc,
            desc_fr: sub.desc_fr,
            desc_ar: sub.desc_ar,
            image: sub.image
        }));
        
        await supabase.from('subcategories').insert(subsToInsert);
    }

    return this.getCategories().then(cats => cats.find(c => c.id === category.id) as Category);
  },

  async deleteCategory(id: string): Promise<void> {
    // Subcategories cascade delete due to FK constraint, but good to be explicit or rely on DB
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
    // 1. Handle reviews (cascade delete)
    await supabase.from('reviews').delete().eq('serviceId', id);
    
    // 2. Handle orders (set serviceId to null to preserve history)
    await supabase.from('orders').update({ serviceId: null }).eq('serviceId', id);

    // 3. Delete the service
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