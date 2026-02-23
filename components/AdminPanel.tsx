import React, { useState, useEffect, useMemo } from 'react';
import { ServiceItem, ServiceFormData, Order, OrderStatus, Category, User, GlobalSettings } from '../types';
import { addService, updateService, deleteService, toggleServiceStatus, getOrders, updateOrder, addCategory, updateCategory, deleteCategory, getUsers, deleteUser, addUserByAdmin, updateUser, getCurrentUser, updateGlobalSettings } from '../services/storageService';
import { ServiceForm } from './ServiceForm';
import { CategoryForm } from './CategoryForm';
import { UserForm } from './UserForm';
import { Modal } from './Modal';
import { Plus, Edit2, Trash2, Power, Search, ShoppingCart, List, ExternalLink, FileText, Save, Clock, User as UserIcon, Banknote, Tag, CheckCircle2, AlertCircle, XCircle, Truck, PlayCircle, BarChart3, Users, TrendingUp, PieChart, ArrowUpRight, FolderTree, Smartphone, Settings } from 'lucide-react';
import * as Icons from 'lucide-react';

export type AdminTab = 'dashboard' | 'services' | 'categories' | 'orders' | 'users';

interface AdminPanelProps {
  services: ServiceItem[];
  categories: Category[];
  onUpdate: () => void;
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
  activeTab: AdminTab;
  globalSettings: GlobalSettings;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending_whatsapp': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'processing': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'delivered': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'cancelled': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'pending_whatsapp': return 'Pending (WhatsApp)';
    case 'confirmed': return 'Confirmed';
    case 'processing': return 'Processing';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ services, categories, onUpdate, notify, activeTab, globalSettings }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [dbUsers, setDbUsers] = useState<User[]>([]); // Store real users
  
  // Order Detail View State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending_whatsapp');

  // Settings State
  const [whatsappNum, setWhatsappNum] = useState(globalSettings.whatsappNumber);

  useEffect(() => {
      setWhatsappNum(globalSettings.whatsappNumber);
  }, [globalSettings]);

  useEffect(() => {
    // Load orders async
    const loadOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (e) {
            console.error("Failed to load orders", e);
        }
    };
    loadOrders();
  }, [activeTab]);

  // Load Users when tab is active
  const loadUsers = async () => {
      try {
          const data = await getUsers();
          setDbUsers(data);
      } catch (e) {
          console.error("Failed to load users", e);
      }
  };

  useEffect(() => {
      if (activeTab === 'users') {
          loadUsers();
      }
  }, [activeTab]);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.price : acc, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending_whatsapp' || o.status === 'confirmed').length;
    const activeServices = services.filter(s => s.active).length;

    // Top Services
    const serviceCounts: Record<string, number> = {};
    orders.forEach(o => {
      serviceCounts[o.serviceName] = (serviceCounts[o.serviceName] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    orders.forEach(o => {
      categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
    });
    const categoryStats = Object.entries(categoryCounts)
       .sort(([, a], [, b]) => b - a);

    return { totalRevenue, totalOrders, pendingOrders, activeServices, topServices, categoryStats };
  }, [orders, services]);

  // --- Users Derivation ---
  // Combine Registered Users from DB with aggregated order stats
  const allUsersList = useMemo(() => {
    // Map registered users
    const usersMap = new Map<string, any>();
    
    // Initialize with registered users
    dbUsers.forEach(u => {
        usersMap.set(u.email.toLowerCase(), {
            id: u.id,
            email: u.email,
            name: u.name,
            phone: u.phone || 'N/A',
            role: u.role,
            provider: u.provider,
            count: 0,
            spent: 0,
            lastOrder: u.createdAt, // Fallback to registration date
            isRegistered: true,
            // Keep full user object for editing
            originalUser: u
        });
    });

    // Merge order data
    orders.forEach(order => {
      if (!order.customerEmail) return;
      const email = order.customerEmail.toLowerCase();
      let user = usersMap.get(email);
      
      if (!user) {
        // This is a guest user (ordered but not registered in our system yet, or different email)
        user = {
          id: 'guest',
          email: order.customerEmail,
          name: 'Guest User',
          phone: order.customerPhone || 'N/A',
          role: 'guest',
          provider: 'n/a',
          count: 0,
          spent: 0,
          lastOrder: 0,
          isRegistered: false
        };
        usersMap.set(email, user);
      } else {
          // If registered user, assume phone from latest order might be more current if missing
          if (user.phone === 'N/A' && order.customerPhone) {
              user.phone = order.customerPhone;
          }
      }
      
      user.count += 1;
      user.spent += (order.status !== 'cancelled' ? order.price : 0);
      user.lastOrder = Math.max(user.lastOrder, order.createdAt);
    });

    return Array.from(usersMap.values()).sort((a, b) => b.lastOrder - a.lastOrder);
  }, [orders, dbUsers]);

  // --- Filtering ---
  
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = useMemo(() => {
     return orders.filter(o => {
        const q = orderSearchTerm.toLowerCase();
        return o.id.toLowerCase().includes(q) || 
               o.serviceName.toLowerCase().includes(q) || 
               o.customerEmail?.toLowerCase().includes(q) ||
               o.status.toLowerCase().includes(q);
     }).sort((a,b) => b.createdAt - a.createdAt);
  }, [orders, orderSearchTerm]);

  const filteredUsers = useMemo(() => {
     return allUsersList.filter(u => {
        const q = userSearchTerm.toLowerCase();
        return u.email.toLowerCase().includes(q) || 
               u.phone.toLowerCase().includes(q) ||
               (u.name && u.name.toLowerCase().includes(q));
     });
  }, [allUsersList, userSearchTerm]);

  // --- Handlers ---

  const handleUpdateSettings = async () => {
      try {
          await updateGlobalSettings({ whatsappNumber: whatsappNum });
          notify('Settings updated successfully. Order number changed.', 'success');
          onUpdate(); // Trigger app refresh
      } catch (e) {
          notify('Failed to update settings.', 'error');
      }
  };

  const handleAddClick = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (service: ServiceItem) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id);
        onUpdate();
        notify('Service deleted successfully.', 'info');
      } catch (e: any) {
        console.error("Delete service error:", e);
        notify(e.message || 'Failed to delete service. It might be linked to existing orders.', 'error');
      }
    }
  };

  const handleToggleClick = async (id: string) => {
    await toggleServiceStatus(id);
    onUpdate();
    notify('Service status toggled.', 'info');
  };

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
        if (editingService) {
            await updateService({ ...data, id: editingService.id, createdAt: editingService.createdAt });
            notify('Service updated successfully.', 'success');
        } else {
            await addService({ ...data, id: crypto.randomUUID(), createdAt: Date.now() });
            notify('New service added to catalog.', 'success');
        }
        setIsFormOpen(false);
        onUpdate();
    } catch (e) {
        notify('Failed to save service.', 'error');
    }
  };

  // --- Category Handlers ---
  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategoryClick = async (id: string) => {
    if (window.confirm('Are you sure? Deleting a category usually requires deleting associated services first.')) {
        try {
            await deleteCategory(id);
            onUpdate();
            notify('Category deleted.', 'info');
        } catch (e) {
            notify('Failed to delete category. Ensure no services are linked to it.', 'error');
        }
    }
  };

  const handleCategorySubmit = async (data: Category) => {
    try {
        if (editingCategory) {
            await updateCategory(data);
            notify('Category updated.', 'success');
        } else {
            await addCategory(data);
            notify('New category added.', 'success');
        }
        setIsCategoryFormOpen(false);
        onUpdate();
    } catch (e) {
        console.error(e);
        notify('Failed to save category.', 'error');
    }
  };

  // --- User Handlers ---
  const handleAddUserClick = () => {
      setEditingUser(null);
      setIsUserFormOpen(true);
  };

  const handleEditUserClick = (user: User) => {
      setEditingUser(user);
      setIsUserFormOpen(true);
  };

  const handleDeleteUserClick = async (user: User) => {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === user.id) {
          notify('You cannot delete your own admin account.', 'error');
          return;
      }

      if (window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
          try {
              await deleteUser(user.id);
              await loadUsers();
              notify('User deleted successfully.', 'info');
          } catch (e) {
              console.error(e);
              notify('Failed to delete user.', 'error');
          }
      }
  };

  const handleUserSubmit = async (data: User) => {
      try {
          if (editingUser) {
              await updateUser({ ...editingUser, ...data });
              notify('User updated successfully.', 'success');
          } else {
              await addUserByAdmin({
                  ...data,
                  id: crypto.randomUUID(),
                  createdAt: Date.now(),
                  provider: 'email'
              });
              notify('User created successfully.', 'success');
          }
          setIsUserFormOpen(false);
          await loadUsers();
      } catch (e: any) {
          notify(e.message || 'Failed to save user.', 'error');
      }
  };

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setInternalNotes(order.internalNotes || '');
    setSelectedStatus(order.status);
  };

  const handleSaveOrderChanges = async () => {
    if (!viewingOrder) return;
    const updated = { 
      ...viewingOrder, 
      internalNotes: internalNotes,
      status: selectedStatus
    };
    
    await updateOrder(updated);
    
    // Refresh orders
    const data = await getOrders();
    setOrders(data);
    
    // Notification logic
    if (updated.status !== viewingOrder.status) {
       notify(`Order status updated to ${getStatusLabel(updated.status)}`, 'success');
    } else {
       notify('Order details saved', 'success');
    }
    
    setViewingOrder(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
        </h2>
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {/* Global Configuration */}
           <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                    <Settings className="h-5 w-5 text-indigo-500" /> Global Configuration
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                            Order WhatsApp Number (include country code, no +)
                        </label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={whatsappNum}
                                onChange={(e) => setWhatsappNum(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. 21629292395"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpdateSettings}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors h-10"
                    >
                        <Save className="h-4 w-4" /> Save Config
                    </button>
                </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                    <Banknote className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                 </div>
                 <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.totalRevenue.toFixed(2)} TND</p>
                 <p className="text-xs text-slate-500 dark:text-slate-500">All time earnings</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</p>
                    <ShoppingCart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                 </div>
                 <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-500">Across all categories</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Actions</p>
                    <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                 </div>
                 <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-500">Orders needing attention</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Services</p>
                    <Tag className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                 </div>
                 <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.activeServices}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-500">Currently listed in catalog</p>
              </div>
           </div>

           {/* Analytical Sections */}
           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Services */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                 <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Most Requested Services
                 </h3>
                 <div className="space-y-4">
                    {stats.topServices.length > 0 ? (
                       stats.topServices.map((item, index) => (
                          <div key={index} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0 last:pb-0">
                             <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[70%]">{item.name}</span>
                             <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-900 dark:text-white">{item.count} orders</span>
                          </div>
                       ))
                    ) : (
                       <p className="text-sm text-slate-500">No data available yet.</p>
                    )}
                 </div>
              </div>

              {/* Categories */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
                 <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                    <PieChart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" /> Orders by Category
                 </h3>
                 <div className="space-y-4">
                    {stats.categoryStats.length > 0 ? (
                       stats.categoryStats.map(([cat, count], index) => {
                          const percentage = Math.round((count / stats.totalOrders) * 100);
                          return (
                             <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                   <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                                   <span className="text-slate-500">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                   <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }}></div>
                                </div>
                             </div>
                          );
                       })
                    ) : (
                       <p className="text-sm text-slate-500">No data available yet.</p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- SERVICES TAB --- */}
      {activeTab === 'services' && (
        <div className="animate-in fade-in duration-300 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search services..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <button 
              onClick={handleAddClick}
              className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Service Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                         <button 
                           onClick={() => handleToggleClick(service.id)}
                           title="Toggle Status"
                           className={`rounded-full p-1.5 transition-colors ${service.active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'}`}
                         >
                            <Power className="h-4 w-4" />
                         </button>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{service.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{service.currency}{service.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(service)}
                            className="rounded-lg p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(service.id)}
                            className="rounded-lg p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No services found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- CATEGORIES TAB --- */}
      {activeTab === 'categories' && (
        <div className="animate-in fade-in duration-300 space-y-4">
            <div className="flex justify-end">
                <button 
                onClick={handleAddCategoryClick}
                className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                <Plus className="h-4 w-4" />
                Add Category
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-center">Icon</th>
                        <th className="px-6 py-4 font-semibold">ID</th>
                        <th className="px-6 py-4 font-semibold">Label (EN)</th>
                        <th className="px-6 py-4 font-semibold">Subcategories</th>
                        <th className="px-6 py-4 font-semibold">Order</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {categories.map((cat) => {
                        const Icon = (Icons as any)[cat.icon] || Icons.Box;
                        return (
                            <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-center">
                                    <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 ${cat.color.replace('text-', 'text-')}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{cat.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cat.label}</td>
                                <td className="px-6 py-4 text-slate-500">{cat.subcategories ? cat.subcategories.length : 0}</td>
                                <td className="px-6 py-4">{cat.order}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleEditCategoryClick(cat)}
                                            className="rounded-lg p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCategoryClick(cat.id)}
                                            className="rounded-lg p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-300">
           <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search orders (ID, email, service)..." 
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
           </div>

           <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                   <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                     <tr>
                       <th className="px-6 py-4 font-semibold">Date</th>
                       <th className="px-6 py-4 font-semibold">Service</th>
                       <th className="px-6 py-4 font-semibold">Customer</th>
                       <th className="px-6 py-4 font-semibold">Status</th>
                       <th className="px-6 py-4 font-semibold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                     {filteredOrders.map((order) => (
                       <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap">
                           {new Date(order.createdAt).toLocaleDateString()} <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-900 dark:text-white">{order.serviceName}</div>
                           <div className="text-xs text-indigo-600 dark:text-indigo-400">{order.category}</div>
                         </td>
                         <td className="px-6 py-4 max-w-xs">
                           <div className="font-medium text-slate-700 dark:text-slate-200">{order.customerEmail || 'N/A'}</div>
                           <div className="text-xs text-slate-500">{order.customerPhone}</div>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                             {getStatusLabel(order.status)}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="rounded-lg p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                              title="View Details & Notes"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                         </td>
                       </tr>
                     ))}
                     {filteredOrders.length === 0 && (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                           No orders found matching your search.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
           </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-300">
           <div className="flex items-center justify-between gap-4">
               <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search users (email, phone, name)..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500"
                  />
               </div>
               <button 
                  onClick={handleAddUserClick}
                  className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </button>
           </div>

           <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                   <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                     <tr>
                       <th className="px-6 py-4 font-semibold">User Info</th>
                       <th className="px-6 py-4 font-semibold">Role</th>
                       <th className="px-6 py-4 font-semibold text-center">Total Orders</th>
                       <th className="px-6 py-4 font-semibold">Total Spent</th>
                       <th className="px-6 py-4 font-semibold">Registered</th>
                       <th className="px-6 py-4 font-semibold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                     {filteredUsers.map((user, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                               <div className="h-8 w-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                                  {user.name ? user.name.charAt(0) : <UserIcon className="h-4 w-4" />}
                               </div>
                               <div>
                                   <div className="text-sm">{user.email}</div>
                                   <div className="text-xs text-slate-500">{user.name || 'No Name'} {user.phone && user.phone !== 'N/A' ? `• ${user.phone}` : ''}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                             <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                 user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 
                                 user.role === 'guest' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                             }`}>
                                 {user.role}
                             </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-white">
                              {user.count}
                            </span>
                         </td>
                         <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">{user.spent.toFixed(2)} TND</td>
                         <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                           {user.isRegistered ? new Date(user.lastOrder).toLocaleDateString() : 'Guest'}
                         </td>
                         <td className="px-6 py-4 text-right">
                            {user.isRegistered && (
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleEditUserClick(user.originalUser)}
                                        className="rounded-lg p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                        title="Edit User"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUserClick(user.originalUser)}
                                        className="rounded-lg p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                         </td>
                       </tr>
                     ))}
                     {filteredUsers.length === 0 && (
                       <tr>
                         <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                           No users found.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
           </div>
        </div>
      )}

      {/* Service Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <ServiceForm 
          initialData={editingService || undefined} 
          categories={categories} // Passed from App
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <CategoryForm
            initialData={editingCategory || undefined}
            onSubmit={handleCategorySubmit}
            onCancel={() => setIsCategoryFormOpen(false)}
        />
      </Modal>

      {/* User Modal */}
      <Modal
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
            initialData={editingUser || undefined}
            onSubmit={handleUserSubmit}
            onCancel={() => setIsUserFormOpen(false)}
        />
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        title="Manage Order"
      >
        {viewingOrder && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-800">
                      <Tag className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Service</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{viewingOrder.serviceName}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">{viewingOrder.category}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-800">
                      <Banknote className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Price</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{viewingOrder.currency}{viewingOrder.price.toFixed(2)}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-800">
                      <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Timestamp</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-800 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Customer Info</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <p><span className="text-slate-500">Email:</span> <span className="text-slate-900 dark:text-white">{viewingOrder.customerEmail || 'N/A'}</span></p>
                        <p><span className="text-slate-500">Phone:</span> <span className="text-slate-900 dark:text-white">{viewingOrder.customerPhone || 'N/A'}</span></p>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                           <p className="text-xs text-slate-500 mb-1">Provided Details:</p>
                           <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{viewingOrder.customerInfo.split('Details:')[1]?.trim() || viewingOrder.customerInfo}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Status Management */}
             <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4" /> Order Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {[
                      { id: 'pending_whatsapp', label: 'Pending', icon: AlertCircle },
                      { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
                      { id: 'processing', label: 'Processing', icon: PlayCircle },
                      { id: 'delivered', label: 'Delivered', icon: Truck },
                      { id: 'cancelled', label: 'Cancelled', icon: XCircle }
                    ].map((status) => (
                       <button
                         key={status.id}
                         onClick={() => setSelectedStatus(status.id as OrderStatus)}
                         className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                            selectedStatus === status.id 
                            ? getStatusColor(status.id as OrderStatus) + ' ring-1 ring-offset-1 ring-slate-500 dark:ring-offset-slate-900'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-300'
                         }`}
                       >
                         <status.icon className="h-5 w-5 mb-1" />
                         <span className="text-xs font-medium">{status.label}</span>
                       </button>
                    ))}
                </div>
             </div>

             <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                   <FileText className="h-4 w-4" /> Internal Admin Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Add notes about this order here (e.g. processed, customer contacted, special requirements)..."
                />
             </div>

             <div className="flex justify-end gap-3 pt-4">
               <button
                 onClick={() => setViewingOrder(null)}
                 className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
               >
                 Close
               </button>
               <button
                 onClick={handleSaveOrderChanges}
                 className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
               >
                 <Save className="h-4 w-4" />
                 Save Changes
               </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
