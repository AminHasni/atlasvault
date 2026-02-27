import { supabase, isDbConnected } from './supabaseClient';
import { ServiceItem, Order, User, Review, Category, Subcategory, SecondSubcategory } from '../types';

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
        return categories as Category[];
    }

    const { data: secondSubcategories, error: secondSubError } = await supabase
      .from('second_subcategories')
      .select('*')
      .order('order', { ascending: true });

    if (secondSubError) {
        console.error('Error fetching second subcategories:', secondSubError);
    }

    // Map subcategories and second subcategories
    return (categories as Category[]).map(cat => {
        const catSubs = (subcategories as any[])
            .filter(sub => sub.category_id === cat.id)
            .map(sub => ({
                ...sub,
                second_subcategories: (secondSubcategories || [])
                    .filter((ss: any) => ss.subcategory_id === sub.id)
            }));
            
        return {
            ...cat,
            subcategories: catSubs
        };
    });
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
            parent_id: sub.parent_id,
            label: sub.label,
            label_fr: sub.label_fr,
            label_ar: sub.label_ar,
            desc: sub.desc,
            desc_fr: sub.desc_fr,
            desc_ar: sub.desc_ar,
            icon: sub.icon,
            color: sub.color,
            fee: sub.fee,
            order: sub.order
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
            parent_id: sub.parent_id,
            label: sub.label,
            label_fr: sub.label_fr,
            label_ar: sub.label_ar,
            desc: sub.desc,
            desc_fr: sub.desc_fr,
            desc_ar: sub.desc_ar,
            icon: sub.icon,
            color: sub.color,
            fee: sub.fee,
            order: sub.order
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

  // --- Subcategories ---
  async getSubcategories(): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
        ...item,
        fee: Number(item.fee)
    })) as Subcategory[];
  },

  async addSubcategory(subcategory: Subcategory): Promise<Subcategory> {
    const id = subcategory.id || `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!subcategory.category_id) {
        throw new Error('Category ID is required to create a subcategory.');
    }

    const { data, error } = await supabase
      .from('subcategories')
      .insert([{
        id: id,
        category_id: subcategory.category_id,
        parent_id: subcategory.parent_id || null,
        label: subcategory.label || '',
        label_fr: subcategory.label_fr || '',
        label_ar: subcategory.label_ar || '',
        desc: subcategory.desc || '',
        desc_fr: subcategory.desc_fr || '',
        desc_ar: subcategory.desc_ar || '',
        icon: subcategory.icon || 'Box',
        color: subcategory.color || 'text-slate-500',
        fee: subcategory.fee || 0,
        order: subcategory.order || 0
      }])
      .select()
      .single();

    if (error) {
        console.error('Supabase error adding subcategory:', error);
        throw error;
    }
    
    if (!data) {
        throw new Error('No data returned from subcategory insertion');
    }

    const item = data as any;
    return {
        ...item,
        fee: Number(item.fee)
    };
  },

  async updateSubcategory(subcategory: Subcategory): Promise<Subcategory> {
    const { data, error } = await supabase
      .from('subcategories')
      .update({
        category_id: subcategory.category_id,
        parent_id: subcategory.parent_id || null, // Convert empty string to null
        label: subcategory.label,
        label_fr: subcategory.label_fr,
        label_ar: subcategory.label_ar,
        desc: subcategory.desc,
        desc_fr: subcategory.desc_fr,
        desc_ar: subcategory.desc_ar,
        icon: subcategory.icon,
        color: subcategory.color,
        fee: subcategory.fee,
        order: subcategory.order
      })
      .eq('id', subcategory.id)
      .select()
      .single();

    if (error) {
        console.error('Error updating subcategory:', error);
        throw error;
    }
    
    const item = data as any;
    return {
        ...item,
        fee: Number(item.fee)
    };
  },

  async deleteSubcategory(id: string): Promise<void> {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Second Subcategories (Level 3) ---
  async getSecondSubcategories(): Promise<SecondSubcategory[]> {
    const { data, error } = await supabase
      .from('second_subcategories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching second subcategories:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
        ...item,
        fee: Number(item.fee)
    })) as SecondSubcategory[];
  },

  async addSecondSubcategory(ss: SecondSubcategory): Promise<SecondSubcategory> {
    const id = ss.id || `SUB2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!ss.subcategory_id) {
        throw new Error('Parent subcategory ID is required to create a level 2 subcategory.');
    }

    const { data, error } = await supabase
      .from('second_subcategories')
      .insert([{
        id: id,
        subcategory_id: ss.subcategory_id,
        label: ss.label || '',
        label_fr: ss.label_fr || '',
        label_ar: ss.label_ar || '',
        desc: ss.desc || '',
        desc_fr: ss.desc_fr || '',
        desc_ar: ss.desc_ar || '',
        icon: ss.icon || 'Box',
        color: ss.color || 'text-slate-500',
        fee: ss.fee || 0,
        order: ss.order || 0
      }])
      .select()
      .single();

    if (error) {
        console.error('Supabase error adding second subcategory:', error);
        throw error;
    }
    
    if (!data) {
        throw new Error('No data returned from second subcategory insertion');
    }

    const item = data as any;
    return {
        ...item,
        fee: Number(item.fee)
    };
  },

  async updateSecondSubcategory(ss: SecondSubcategory): Promise<SecondSubcategory> {
    const { data, error } = await supabase
      .from('second_subcategories')
      .update(ss)
      .eq('id', ss.id)
      .select()
      .single();

    if (error) {
        console.error('Error updating second subcategory:', error);
        throw error;
    }
    
    const item = data as any;
    return {
        ...item,
        fee: Number(item.fee)
    };
  },

  async deleteSecondSubcategory(id: string): Promise<void> {
    const { error } = await supabase.from('second_subcategories').delete().eq('id', id);
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
    // Ensure empty strings for optional foreign keys are null
    const serviceToInsert = {
        ...service,
        subcategory: service.subcategory || null,
        second_subcategory_id: service.second_subcategory_id || null,
        promoPrice: service.promoPrice || null
    };

    const { data, error } = await supabase
      .from('services')
      .insert([serviceToInsert])
      .select()
      .single();

    if (error) {
        console.error('Error adding service:', error);
        throw error;
    }
    
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
    // Ensure empty strings for optional foreign keys are null
    const serviceToUpdate = {
        ...service,
        subcategory: service.subcategory || null,
        second_subcategory_id: service.second_subcategory_id || null,
        promoPrice: service.promoPrice || null
    };

    const { data, error } = await supabase
      .from('services')
      .update(serviceToUpdate)
      .eq('id', service.id)
      .select()
      .single();

    if (error) {
        console.error('Error updating service:', error);
        throw error;
    }
    
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