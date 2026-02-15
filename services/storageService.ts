import { ServiceItem, Order, User, Review, Category } from '../types';
import { INITIAL_SERVICES, CATEGORIES as DEFAULT_CATEGORIES } from '../constants';
import { db } from './db';
import { isDbConnected } from './supabaseClient';

const STORAGE_KEY = 'service_nexus_catalog';
const ORDERS_KEY = 'service_nexus_orders';
const USERS_KEY = 'service_nexus_users';
const CURRENT_USER_KEY = 'service_nexus_current_user';
const REVIEWS_KEY = 'service_nexus_reviews';
const FAVORITES_KEY = 'service_nexus_favorites';
const CATEGORIES_KEY = 'service_nexus_categories';

// Helper for local storage access
const getLocal = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setLocal = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
    if (isDbConnected()) {
        const categories = await db.getCategories();
        if (categories && categories.length > 0) return categories;
    }
    // Fallback to local or constants
    const local = getLocal<Category[]>(CATEGORIES_KEY, []);
    return local.length > 0 ? local : DEFAULT_CATEGORIES;
};

export const addCategory = async (category: Category): Promise<Category[]> => {
  if (isDbConnected()) {
    await db.addCategory(category);
    return getCategories();
  }
  const current = await getCategories();
  const updated = [...current, category];
  setLocal(CATEGORIES_KEY, updated);
  return updated;
};

export const updateCategory = async (category: Category): Promise<Category[]> => {
  if (isDbConnected()) {
    await db.updateCategory(category);
    return getCategories();
  }
  const current = await getCategories();
  const updated = current.map(c => c.id === category.id ? category : c);
  setLocal(CATEGORIES_KEY, updated);
  return updated;
};

export const deleteCategory = async (id: string): Promise<Category[]> => {
  if (isDbConnected()) {
    await db.deleteCategory(id);
    return getCategories();
  }
  const current = await getCategories();
  const updated = current.filter(c => c.id !== id);
  setLocal(CATEGORIES_KEY, updated);
  return updated;
};

// --- User Management ---

export const getUsers = async (): Promise<User[]> => {
  if (isDbConnected()) return db.getUsers();

  const users = getLocal<User[]>(USERS_KEY, []);
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: 'admin-1',
      email: 'admin@nexus.com',
      password: 'admin',
      name: 'Nexus Admin',
      role: 'admin',
      createdAt: Date.now(),
      phone: '123-456-7890',
      provider: 'email'
    };
    setLocal(USERS_KEY, [defaultAdmin]);
    return [defaultAdmin];
  }
  return users;
};

export const registerUser = async (userData: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<User> => {
  if (isDbConnected()) {
      // For email registration, we still use the profile table manually for this demo app 
      // unless we implement full Supabase Auth email signup flow.
      const users = await getUsers();
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already registered');
      }
      
      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        role: 'user',
        provider: 'email'
      };
      
      return db.addUser(newUser);
  }

  const users = await getUsers();
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    role: 'user',
    provider: 'email'
  };

  users.push(newUser);
  setLocal(USERS_KEY, users);
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simple check against our custom profiles table
  const users = await getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  return user;
};

export const signOutUser = async () => {
    // Just clear local session since we are using custom auth
    setCurrentUserSession(null);
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  if (isDbConnected()) {
    const user = await db.updateUser(updatedUser);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
        setCurrentUserSession(user);
    }
    return user;
  }

  const users = await getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    setLocal(USERS_KEY, users);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUserSession(updatedUser);
    }
    
    return updatedUser;
  }
  throw new Error('User not found');
};

export const deleteUser = async (id: string): Promise<void> => {
  if (isDbConnected()) {
    await db.deleteUser(id);
    return;
  }

  const users = await getUsers();
  const updated = users.filter(u => u.id !== id);
  setLocal(USERS_KEY, updated);
};

export const addUserByAdmin = async (user: User): Promise<User> => {
    if(isDbConnected()) {
        const users = await getUsers();
        if (users.some(u => u.email === user.email)) {
            throw new Error('Email already registered');
        }
        return db.addUser(user);
    }

    const users = await getUsers();
    if (users.some(u => u.email === user.email)) {
        throw new Error('Email already registered');
    }
    users.push(user);
    setLocal(USERS_KEY, users);
    return user;
};

// Sync because this is session management (browser specific)
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUserSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// --- Services Management ---

export const getServices = async (): Promise<ServiceItem[]> => {
  if (isDbConnected()) return db.getServices();

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    setLocal(STORAGE_KEY, INITIAL_SERVICES);
    return INITIAL_SERVICES;
  }
  return JSON.parse(stored);
};

export const addService = async (service: ServiceItem): Promise<ServiceItem[]> => {
  if (isDbConnected()) {
    await db.addService(service);
    return getServices();
  }

  const current = await getServices();
  const updated = [service, ...current];
  setLocal(STORAGE_KEY, updated);
  return updated;
};

export const updateService = async (updatedService: ServiceItem): Promise<ServiceItem[]> => {
  if (isDbConnected()) {
    await db.updateService(updatedService);
    return getServices();
  }

  const current = await getServices();
  const updated = current.map(s => s.id === updatedService.id ? updatedService : s);
  setLocal(STORAGE_KEY, updated);
  return updated;
};

export const deleteService = async (id: string): Promise<ServiceItem[]> => {
  if (isDbConnected()) {
    await db.deleteService(id);
    return getServices();
  }

  const current = await getServices();
  const updated = current.filter(s => s.id !== id);
  setLocal(STORAGE_KEY, updated);
  return updated;
};

export const toggleServiceStatus = async (id: string): Promise<ServiceItem[]> => {
  const current = await getServices();
  const service = current.find(s => s.id === id);
  if (service) {
      const updatedService = { ...service, active: !service.active };
      return updateService(updatedService);
  }
  return current;
};

// --- Orders Management ---

export const getOrders = async (): Promise<Order[]> => {
  if (isDbConnected()) return db.getOrders();
  return getLocal<Order[]>(ORDERS_KEY, []);
};

export const getOrdersByEmail = async (email: string): Promise<Order[]> => {
  const allOrders = await getOrders();
  return allOrders.filter(o => 
    o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase()
  );
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  const allOrders = await getOrders();
  return allOrders.filter(o => o.userId === userId);
}

export const addOrder = async (order: Order): Promise<Order[]> => {
  if (isDbConnected()) {
    await db.addOrder(order);
    return getOrders();
  }

  const current = await getOrders();
  const updated = [order, ...current];
  setLocal(ORDERS_KEY, updated);
  return updated;
};

export const updateOrder = async (updatedOrder: Order): Promise<Order[]> => {
  if (isDbConnected()) {
    await db.updateOrder(updatedOrder);
    return getOrders();
  }

  const current = await getOrders();
  const updated = current.map(o => o.id === updatedOrder.id ? updatedOrder : o);
  setLocal(ORDERS_KEY, updated);
  return updated;
};

// --- Reviews Management ---

export const getReviews = async (serviceId: string): Promise<Review[]> => {
  if (isDbConnected()) return db.getReviews(serviceId);

  const allReviews = getLocal<Review[]>(REVIEWS_KEY, []);
  return allReviews.filter(r => r.serviceId === serviceId).sort((a,b) => b.createdAt - a.createdAt);
};

export const addReview = async (review: Review): Promise<Review[]> => {
  if (isDbConnected()) {
    await db.addReview(review);
    return getReviews(review.serviceId);
  }

  const allReviews = getLocal<Review[]>(REVIEWS_KEY, []);
  const updated = [review, ...allReviews];
  setLocal(REVIEWS_KEY, updated);
  return updated; // This returns all reviews, not filtered, but frontend usually refetches or filters
};

// --- Favorites (Local Only for now, could be DB profile preference) ---
export const getFavorites = (userId: string): string[] => {
  const favMap = getLocal<Record<string, string[]>>(FAVORITES_KEY, {});
  return favMap[userId] || [];
};

export const toggleFavorite = (userId: string, serviceId: string): boolean => {
  const favMap = getLocal<Record<string, string[]>>(FAVORITES_KEY, {});
  const userFavs = favMap[userId] || [];
  let isAdded = false;

  if (userFavs.includes(serviceId)) {
    favMap[userId] = userFavs.filter(id => id !== serviceId);
    isAdded = false;
  } else {
    favMap[userId] = [...userFavs, serviceId];
    isAdded = true;
  }
  
  setLocal(FAVORITES_KEY, favMap);
  return isAdded;
};