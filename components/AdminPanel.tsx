import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ServiceItem, ServiceFormData, Order, OrderStatus, Category, User, GlobalSettings, Subcategory, SecondSubcategory } from '../types';
import { addService, updateService, deleteService, toggleServiceStatus, getOrders, updateOrder, addCategory, updateCategory, deleteCategory, getUsers, deleteUser, addUserByAdmin, updateUser, getCurrentUser, updateGlobalSettings, addSubcategory, updateSubcategory, deleteSubcategory, addSecondSubcategory, updateSecondSubcategory, deleteSecondSubcategory, toggleUserStatus } from '../services/storageService';
import { ServiceForm } from './ServiceForm';
import { CategoryForm } from './CategoryForm';
import { SubcategoryForm } from './SubcategoryForm';
import { SecondSubcategoryForm } from './SecondSubcategoryForm';
import { UserForm } from './UserForm';
import { Modal } from './Modal';
import { ConfirmModal } from './ConfirmModal';
import { Plus, Edit2, Trash2, Power, Search, ShoppingCart, List, ExternalLink, FileText, Save, Clock, User as UserIcon, Banknote, Tag, CheckCircle2, AlertCircle, XCircle, Truck, PlayCircle, BarChart3, Users, TrendingUp, PieChart, ArrowUpRight, FolderTree, Smartphone, Settings, Filter, Calendar, ChevronDown, ShoppingBag, X } from 'lucide-react';
import * as Icons from 'lucide-react';

export type AdminTab = 'dashboard' | 'categories' | 'subcategories' | 'level3_subcategories' | 'services' | 'orders' | 'users';

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
  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false);
  const [isSecondSubcategoryFormOpen, setIsSecondSubcategoryFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editingSecondSubcategory, setEditingSecondSubcategory] = useState<SecondSubcategory | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderDateRange, setOrderDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Bulk Actions State
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isBulkActionMenuOpen, setIsBulkActionMenuOpen] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  // Advanced Service Filters
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [serviceSubcategoryFilter, setServiceSubcategoryFilter] = useState<string>('all');
  const [serviceSecondSubcategoryFilter, setServiceSecondSubcategoryFilter] = useState<string>('all');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('all');
  const [serviceDateRange, setServiceDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
      if (activeTab === 'users' || activeTab === 'dashboard') {
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

    const recentOrders = [...orders]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return { totalRevenue, totalOrders, pendingOrders, activeServices, topServices, categoryStats, recentOrders };
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
  
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
    
    const matchesSubcategory = serviceSubcategoryFilter === 'all' || s.subcategory === serviceSubcategoryFilter;
    
    const matchesSecondSubcategory = serviceSecondSubcategoryFilter === 'all' || s.second_subcategory_id === serviceSecondSubcategoryFilter;
    
    const matchesStatus = serviceStatusFilter === 'all' || 
                         (serviceStatusFilter === 'active' ? s.active : !s.active);
    
    const matchesDate = (!serviceDateRange.start || s.createdAt >= new Date(serviceDateRange.start).getTime()) &&
                       (!serviceDateRange.end || s.createdAt <= new Date(serviceDateRange.end).getTime() + 86400000);

    return matchesSearch && matchesCategory && matchesSubcategory && matchesSecondSubcategory && matchesStatus && matchesDate;
  });

  const sortedSubcategories = useMemo(() => {
    const flatList = categories.flatMap(cat => (cat.subcategories || []).map(sub => ({
      ...sub, 
      category_id: cat.id, 
      category_label: cat.label
    })));

    // Group by category
    const byCategory: Record<string, typeof flatList> = {};
    flatList.forEach(sub => {
      if (!byCategory[sub.category_id]) byCategory[sub.category_id] = [];
      byCategory[sub.category_id].push(sub);
    });

    const result: (typeof flatList[0] & { level: number })[] = [];
    
    // Process each category
    Object.values(byCategory).forEach(subs => {
      const roots = subs.filter(s => !s.parent_id);
      const children = subs.filter(s => s.parent_id);
      
      const processNode = (node: any, level: number) => {
        result.push({ ...node, level }); 
        const nodeChildren = children.filter(c => c.parent_id === node.id);
        nodeChildren.forEach(child => processNode(child, level + 1));
      };
      
      roots.forEach(root => processNode(root, 0));
    });
    
    return result;
  }, [categories]);

  const secondSubcategories = useMemo(() => {
    return categories.flatMap(cat => 
        (cat.subcategories || []).flatMap(sub => 
            (sub.second_subcategories || []).map(ss => ({
                ...ss,
                subcategory_label: sub.label,
                category_label: cat.label
            }))
        )
    );
  }, [categories]);

  const filteredOrders = useMemo(() => {
     return orders.filter(o => {
        const q = orderSearchTerm.toLowerCase();
        const matchesSearch = o.id.toLowerCase().includes(q) || 
               o.serviceName.toLowerCase().includes(q) || 
               o.customerEmail?.toLowerCase().includes(q) ||
               o.status.toLowerCase().includes(q);
        
        const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
        
        let matchesDate = true;
        if (orderDateRange.start) {
            matchesDate = matchesDate && o.createdAt >= new Date(orderDateRange.start).getTime();
        }
        if (orderDateRange.end) {
            // Add 23:59:59 to end date to include the whole day
            const endDate = new Date(orderDateRange.end);
            endDate.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && o.createdAt <= endDate.getTime();
        }

        return matchesSearch && matchesStatus && matchesDate;
     }).sort((a,b) => b.createdAt - a.createdAt);
  }, [orders, orderSearchTerm, orderStatusFilter, orderDateRange]);

  const filteredUsers = useMemo(() => {
     return allUsersList.filter(u => {
        const q = userSearchTerm.toLowerCase();
        return u.email.toLowerCase().includes(q) || 
               u.phone.toLowerCase().includes(q) ||
               (u.name && u.name.toLowerCase().includes(q));
     });
  }, [allUsersList, userSearchTerm]);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending_whatsapp' || o.status === 'pending').length;
    const completed = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    const revenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    
    return { total, pending, completed, revenue };
  }, [orders]);

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
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteService(id);
          onUpdate();
          notify('Service deleted successfully.', 'info');
        } catch (e: any) {
          console.error("Delete service error:", e);
          notify(e.message || 'Failed to delete service. It might be linked to existing orders.', 'error');
        }
      }
    });
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
        console.error('Error saving service:', e);
        notify('Failed to save service.', 'error');
    }
  };

  // --- Category Handlers ---
  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleAddSubcategoryToCategory = (categoryId: string) => {
    setEditingSubcategory({
      id: '',
      parent_id: categoryId,
      label: '',
      label_fr: '',
      label_ar: '',
      desc: '',
      desc_fr: '',
      desc_ar: '',
      icon: 'Layers',
      color: 'text-indigo-500',
      fee: 0,
      order: 0
    } as any);
    setIsSubcategoryFormOpen(true);
  };

  const handleAddSecondSubcategoryToSubcategory = (subcategoryId: string) => {
    setEditingSecondSubcategory({
      id: '',
      subcategory_id: subcategoryId,
      label: '',
      label_fr: '',
      label_ar: '',
      desc: '',
      desc_fr: '',
      desc_ar: '',
      icon: 'Layers',
      color: 'text-indigo-500',
      fee: 0,
      order: 0
    } as any);
    setIsSecondSubcategoryFormOpen(true);
  };

  const handleAddServiceToHierarchy = (categoryId: string, subcategoryId?: string, secondSubcategoryId?: string) => {
    setEditingService({
      id: '',
      name: '',
      name_fr: '',
      name_ar: '',
      category: categoryId,
      subcategory: subcategoryId || '',
      second_subcategory_id: secondSubcategoryId || '',
      description: '',
      description_fr: '',
      description_ar: '',
      price: 0,
      currency: 'TND',
      conditions: '',
      requiredInfo: '',
      active: true,
      createdAt: Date.now(),
      popularity: 0,
      options: []
    } as any);
    setIsFormOpen(true);
  };

  const handleDuplicateService = (service: ServiceItem) => {
    const { id, createdAt, popularity, ...rest } = service;
    setEditingService({
      ...rest,
      id: '',
      name: `${service.name} (Copy)`,
      name_fr: service.name_fr ? `${service.name_fr} (Copie)` : '',
      name_ar: service.name_ar ? `${service.name_ar} (نسخة)` : '',
      active: false,
      createdAt: Date.now(),
      popularity: 0
    } as any);
    setIsFormOpen(true);
    notify('Service duplicated. Review and save to publish.', 'info');
  };

  const handleToggleBulkAction = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleBulkStatusUpdate = async (active: boolean) => {
    if (selectedServices.length === 0) return;
    try {
      await Promise.all(selectedServices.map(id => toggleServiceStatus(id, active)));
      setSelectedServices([]);
      onUpdate();
      notify(`${selectedServices.length} services ${active ? 'activated' : 'deactivated'}.`, 'success');
    } catch (e) {
      notify('Failed to update some services.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedServices.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete Services',
      message: `Are you sure you want to delete ${selectedServices.length} services? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(selectedServices.map(id => deleteService(id)));
          setSelectedServices([]);
          onUpdate();
          notify(`${selectedServices.length} services deleted.`, 'info');
        } catch (e) {
          notify('Failed to delete some services.', 'error');
        }
      }
    });
  };

  const handleBulkUserStatusUpdate = async (active: boolean) => {
    if (selectedUsers.length === 0) return;
    try {
      await Promise.all(selectedUsers.map(id => toggleUserStatus(id, active)));
      setSelectedUsers([]);
      onUpdate();
      notify(`${selectedUsers.length} users ${active ? 'activated' : 'deactivated'}.`, 'success');
    } catch (e) {
      notify('Failed to update some users.', 'error');
    }
  };

  const handleBulkUserDelete = async () => {
    if (selectedUsers.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete Users',
      message: `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(selectedUsers.map(id => deleteUser(id)));
          setSelectedUsers([]);
          onUpdate();
          notify(`${selectedUsers.length} users deleted.`, 'info');
        } catch (e) {
          notify('Failed to delete some users.', 'error');
        }
      }
    });
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategoryClick = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure? Deleting a category usually requires deleting associated services first.',
      type: 'danger',
      onConfirm: async () => {
        try {
            await deleteCategory(id);
            onUpdate();
            notify('Category deleted.', 'info');
        } catch (e) {
            notify('Failed to delete category. Ensure no services are linked to it.', 'error');
        }
      }
    });
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

  // --- Subcategory Handlers ---
  const handleAddSubcategoryClick = () => {
    setEditingSubcategory(null);
    setIsSubcategoryFormOpen(true);
  };

  const handleEditSubcategoryClick = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setIsSubcategoryFormOpen(true);
  };

  const handleDeleteSubcategoryClick = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subcategory',
      message: 'Are you sure you want to delete this subcategory?',
      type: 'danger',
      onConfirm: async () => {
        try {
            await deleteSubcategory(id);
            onUpdate();
            notify('Subcategory deleted.', 'info');
        } catch (e) {
            notify('Failed to delete subcategory.', 'error');
        }
      }
    });
  };

  const handleSubcategorySubmit = async (data: Subcategory) => {
    try {
        if (editingSubcategory) {
            await updateSubcategory(data);
            notify('Subcategory updated.', 'success');
        } else {
            await addSubcategory(data);
            notify('New subcategory added.', 'success');
        }
        setIsSubcategoryFormOpen(false);
        onUpdate();
    } catch (e) {
        console.error(e);
        notify('Failed to save subcategory.', 'error');
    }
  };

  // --- Second Subcategory Handlers ---
  const handleAddSecondSubcategoryClick = () => {
    setEditingSecondSubcategory(null);
    setIsSecondSubcategoryFormOpen(true);
  };

  const handleEditSecondSubcategoryClick = (ss: SecondSubcategory) => {
    setEditingSecondSubcategory(ss);
    setIsSecondSubcategoryFormOpen(true);
  };

  const handleDeleteSecondSubcategoryClick = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Level 2 Subcategory',
      message: 'Are you sure you want to delete this level 2 subcategory?',
      type: 'danger',
      onConfirm: async () => {
        try {
            await deleteSecondSubcategory(id);
            onUpdate();
            notify('Level 2 subcategory deleted.', 'info');
        } catch (e) {
            notify('Failed to delete level 2 subcategory.', 'error');
        }
      }
    });
  };

  const handleSecondSubcategorySubmit = async (data: SecondSubcategory) => {
    try {
        if (editingSecondSubcategory) {
            await updateSecondSubcategory(data);
            notify('Level 2 subcategory updated.', 'success');
        } else {
            await addSecondSubcategory(data);
            notify('New level 2 subcategory added.', 'success');
        }
        setIsSecondSubcategoryFormOpen(false);
        onUpdate();
    } catch (e) {
        console.error(e);
        notify('Failed to save level 2 subcategory.', 'error');
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

  const handleDeleteService = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteService(id);
          onUpdate();
          notify('Service deleted successfully.', 'info');
        } catch (e) {
          notify('Failed to delete service.', 'error');
        }
      }
    });
  };

  const handleDeleteUserClick = async (user: User) => {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === user.id) {
          notify('You cannot delete your own admin account.', 'error');
          return;
      }

      setConfirmModal({
        isOpen: true,
        title: 'Delete User',
        message: `Are you sure you want to delete user ${user.name}? This action cannot be undone.`,
        type: 'danger',
        onConfirm: async () => {
          try {
              await deleteUser(user.id);
              await loadUsers();
              notify('User deleted successfully.', 'info');
          } catch (e) {
              console.error(e);
              notify('Failed to delete user.', 'error');
          }
        }
      });
  };

  const handleToggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id, !currentStatus);
      await loadUsers();
      notify(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully.`, 'success');
    } catch (e) {
      notify('Failed to update user status.', 'error');
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
        <div className="animate-in fade-in duration-500 space-y-10">
            {/* Quick Actions Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Add Service', icon: Icons.Plus, onClick: () => { setEditingService(null); setIsFormOpen(true); }, color: 'bg-indigo-600' },
                    { label: 'Add Category', icon: Icons.FolderTree, onClick: handleAddCategoryClick, color: 'bg-emerald-600' },
                    { label: 'Add User', icon: Icons.UserPlus, onClick: handleAddUserClick, color: 'bg-purple-600' },
                    { label: 'View Orders', icon: Icons.ShoppingBag, onClick: () => {}, color: 'bg-amber-600', isLink: true, tab: 'orders' }
                ].map((action, i) => (
                    <button
                        key={i}
                        onClick={() => action.isLink ? (window as any).setAdminTab?.(action.tab) : action.onClick()}
                        className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl hover:border-indigo-500 transition-all active:scale-95"
                    >
                        <div className={`h-12 w-12 rounded-2xl ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <action.icon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Global Config Section */}
            <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Icons.Settings className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Global Configuration</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Manage system-wide settings and integrations.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Icons.Smartphone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="WhatsApp Number"
                                className="h-14 w-full rounded-2xl border-none bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-bold shadow-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={whatsappNum}
                                onChange={(e) => setWhatsappNum(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleUpdateSettings}
                            className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Revenue', value: `${stats.totalRevenue.toFixed(2)} TND`, icon: Icons.Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', shadow: 'shadow-emerald-500/10' },
                    { label: 'Total Orders', value: stats.totalOrders, icon: Icons.ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', shadow: 'shadow-indigo-500/10' },
                    { label: 'Pending Orders', value: stats.pendingOrders, icon: Icons.AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', shadow: 'shadow-amber-500/10' },
                    { label: 'Active Services', value: stats.activeServices, icon: Icons.Tag, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', shadow: 'shadow-rose-500/10' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`group relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl ${stat.shadow}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h4>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="flex h-5 items-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2 text-[10px] font-black text-emerald-600">+12%</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">vs last month</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Services</h4>
                        <Icons.TrendingUp className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="space-y-6">
                        {stats.topServices.length > 0 ? (
                            stats.topServices.map((service, i) => (
                                <div key={i} className="group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{service.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{service.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{service.count} Orders</p>
                                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div 
                                                className="h-full bg-indigo-600 transition-all duration-1000" 
                                                style={{ width: `${(service.count / stats.topServices[0].count) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Icons.PieChart className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold">No data available yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Category Distribution</h4>
                        <Icons.PieChart className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="space-y-6">
                        {stats.categoryStats.length > 0 ? (
                            stats.categoryStats.map(([cat, count], i) => {
                                const percentage = Math.round((count / stats.totalOrders) * 100);
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-500">{cat}</span>
                                            <span className="text-slate-900 dark:text-white">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full rounded-full ${
                                                    i === 0 ? 'bg-indigo-600' : 
                                                    i === 1 ? 'bg-emerald-500' : 
                                                    i === 2 ? 'bg-amber-500' : 'bg-slate-400'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Icons.PieChart className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold">No data available yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Icons.Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Orders</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest 5 transactions</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => (window as any).setAdminTab?.('orders')}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                        View All Orders
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-50 dark:border-slate-800">
                            <tr>
                                <th className="pb-4">Order ID</th>
                                <th className="pb-4">Customer</th>
                                <th className="pb-4">Service</th>
                                <th className="pb-4">Price</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {stats.recentOrders.map((order) => (
                                <tr key={order.id} className="group">
                                    <td className="py-4 font-mono text-[10px] text-slate-400">#{order.id.slice(0, 8)}</td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white">{order.customerEmail?.split('@')[0]}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold text-slate-600 dark:text-slate-400">{order.serviceName}</td>
                                    <td className="py-4 font-black text-slate-900 dark:text-white">{order.price} {order.currency}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button 
                                            onClick={() => handleViewOrder(order)}
                                            className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            <Icons.ExternalLink className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold italic">No orders yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* --- SERVICES TAB --- */}
       {activeTab === 'services' && (
        <div className="animate-in fade-in duration-500 space-y-8">
          {/* Bulk Actions Bar */}
          {selectedServices.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-4 z-30 flex items-center justify-between p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
                  {selectedServices.length}
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Services Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleBulkStatusUpdate(true)}
                  className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Activate
                </button>
                <button 
                  onClick={() => handleBulkStatusUpdate(false)}
                  className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Deactivate
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="h-10 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Delete
                </button>
                <div className="w-px h-6 bg-white/20 mx-2" />
                <button 
                  onClick={() => setSelectedServices([])}
                  className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search services..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`h-14 w-14 flex items-center justify-center rounded-2xl border-2 transition-all ${showAdvancedFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500'}`}
                title="Advanced Filters"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Tag className="h-3 w-3" />
                {filteredServices.length} Services
              </div>
              <button 
                onClick={handleAddClick}
                className="flex-1 md:flex-none flex h-14 items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Add Service
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select 
                    value={serviceCategoryFilter}
                    onChange={(e) => {
                      setServiceCategoryFilter(e.target.value);
                      setServiceSubcategoryFilter('all');
                      setServiceSecondSubcategoryFilter('all');
                    }}
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategory (L1)</label>
                  <select 
                    value={serviceSubcategoryFilter}
                    onChange={(e) => {
                      setServiceSubcategoryFilter(e.target.value);
                      setServiceSecondSubcategoryFilter('all');
                    }}
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Subcategories</option>
                    {categories
                      .find(c => c.label === serviceCategoryFilter)
                      ?.subcategories?.map(sub => (
                        <option key={sub.id} value={sub.label}>{sub.label}</option>
                      ))}
                    {serviceCategoryFilter === 'all' && categories.flatMap(c => c.subcategories || []).map(sub => (
                      <option key={sub.id} value={sub.label}>{sub.label} ({categories.find(c => c.id === sub.category_id)?.label})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategory (L2)</label>
                  <select 
                    value={serviceSecondSubcategoryFilter}
                    onChange={(e) => setServiceSecondSubcategoryFilter(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Level 2 Subcategories</option>
                    {categories
                      .flatMap(c => c.subcategories || [])
                      .find(s => s.label === serviceSubcategoryFilter)
                      ?.second_subcategories?.map(ss => (
                        <option key={ss.id} value={ss.id}>{ss.label}</option>
                      ))}
                    {serviceSubcategoryFilter === 'all' && categories.flatMap(c => c.subcategories || []).flatMap(s => s.second_subcategories || []).map(ss => (
                      <option key={ss.id} value={ss.id}>{ss.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={serviceStatusFilter}
                    onChange={(e) => setServiceStatusFilter(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creation Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      value={serviceDateRange.start}
                      onChange={(e) => setServiceDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                    <input 
                      type="date" 
                      value={serviceDateRange.end}
                      onChange={(e) => setServiceDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400">
                  Showing {filteredServices.length} of {services.length} services
                </p>
                <button 
                  onClick={() => {
                    setServiceCategoryFilter('all');
                    setServiceSubcategoryFilter('all');
                    setServiceSecondSubcategoryFilter('all');
                    setServiceStatusFilter('all');
                    setServiceDateRange({start: '', end: ''});
                    setSearchTerm('');
                  }}
                  className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div 
                key={service.id} 
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl border transition-all hover:-translate-y-1 ${
                  selectedServices.includes(service.id) 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-2xl' 
                    : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl'
                } p-6`}
              >
                {/* Selection Checkbox */}
                <button 
                  onClick={() => handleToggleBulkAction(service.id)}
                  className={`absolute top-4 left-4 z-10 h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                    selectedServices.includes(service.id)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedServices.includes(service.id) && <Icons.Check className="h-4 w-4" />}
                </button>

                <div className="flex justify-between items-start mb-6 pl-8">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${service.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Tag className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{service.category}</span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-1">{service.name}</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleClick(service.id)}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${service.active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    <Power className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {service.promoPrice || service.price} TND
                      </span>
                      {service.promoPrice && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          {service.price} TND
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDuplicateService(service)}
                      className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-all"
                      title="Duplicate Service"
                    >
                      <Icons.Copy className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditClick(service)}
                      className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                      title="Edit Service"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(service.id)}
                      className="h-10 w-10 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                      title="Delete Service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {service.badgeLabel && (
                  <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {service.badgeLabel}
                  </div>
                )}
              </div>
            ))}
            
            {filteredServices.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Search className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-lg font-bold">No services found matching your search</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-bold hover:underline">Clear search</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CATEGORIES TAB --- */}
      {activeTab === 'categories' && (
        <div className="animate-in fade-in duration-500 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Categories Management</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Manage your root categories (L0).</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <button 
                        onClick={handleAddCategoryClick}
                        className="h-12 flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        New Category
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories
                    .filter(cat => 
                        cat.label.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        (cat.desc || '').toLowerCase().includes(catalogSearch.toLowerCase())
                    )
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((cat) => {
                    const Icon = (Icons as any)[cat.icon] || Icons.Box;
                    return (
                        <div key={cat.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden hover:border-indigo-500 transition-all">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-lg ${cat.color.replace('text-', 'bg-').replace('500', '500/10')} ${cat.color}`}>
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => handleEditCategoryClick(cat)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                                            title="Edit Category"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCategoryClick(cat.id)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                                            title="Delete Category"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat.label}</h4>
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-widest">#{cat.id}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{cat.desc || 'No description provided for this category.'}</p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{cat.order || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategories</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{cat.subcategories?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* --- SUBCATEGORIES TAB --- */}
      {activeTab === 'subcategories' && (
        <div className="animate-in fade-in duration-500 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Subcategories</h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Hierarchical structure of your services.</p>
                </div>
                <button 
                  onClick={handleAddSubcategoryClick}
                  className="w-full md:w-auto flex h-14 items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  Add Subcategory
                </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th className="px-8 py-6 text-center">Icon</th>
                        <th className="px-8 py-6">Structure & Label</th>
                        <th className="px-8 py-6">Root Category</th>
                        <th className="px-8 py-6">Fee</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {sortedSubcategories.map((sub) => {
                        const Icon = (Icons as any)[sub.icon || 'Box'] || Icons.Box;
                        const parentSub = sub.parent_id 
                            ? categories.find(c => c.id === sub.category_id)?.subcategories?.find(s => s.id === sub.parent_id) 
                            : null;
                        
                        return (
                            <tr key={`${sub.category_id}-${sub.id}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-6 text-center">
                                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${sub.color?.replace('text-', 'bg-').replace('500', '500/10') || 'bg-slate-100 dark:bg-slate-800'} ${sub.color || 'text-slate-500'}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col" style={{ paddingLeft: `${sub.level * 32}px` }}>
                                        <div className="flex items-center gap-3">
                                            {sub.level > 0 && <Icons.CornerDownRight className="h-5 w-5 text-slate-300" />}
                                            <span className="text-base font-black text-slate-900 dark:text-white">{sub.label}</span>
                                            <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded">#{sub.id}</span>
                                        </div>
                                        {parentSub && (
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-8">
                                                Child of {parentSub.label}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="inline-flex items-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                                        {sub.category_label}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                      <span className="text-base font-black text-slate-900 dark:text-white">{sub.fee ? `${sub.fee}%` : '0%'}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Service Fee</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <button 
                                            onClick={() => handleEditSubcategoryClick(sub)}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSubcategoryClick(sub.id)}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {sortedSubcategories.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">
                          <div className="flex flex-col items-center">
                            <Icons.FolderTree className="h-16 w-16 mb-4 opacity-10" />
                            <p className="text-lg">No subcategories found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {/* --- LEVEL 3 SUBCATEGORIES TAB --- */}
      {activeTab === 'level3_subcategories' && (
        <div className="animate-in fade-in duration-500 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Level 3 Subcategories</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Deeply nested service classifications.</p>
                </div>
                <button 
                  onClick={handleAddSecondSubcategoryClick}
                  className="w-full md:w-auto flex h-14 items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  Add Level 3
                </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th className="px-8 py-6 text-center">Icon</th>
                        <th className="px-8 py-6">Label</th>
                        <th className="px-8 py-6">Parent Subcategory</th>
                        <th className="px-8 py-6">Root Category</th>
                        <th className="px-8 py-6">Fee</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {secondSubcategories.map((ss) => {
                        const Icon = (Icons as any)[ss.icon || 'Box'] || Icons.Box;
                        return (
                            <tr key={ss.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-6 text-center">
                                    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${ss.color?.replace('text-', 'text-') || 'text-slate-500'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 dark:text-white">{ss.label}</span>
                                        <span className="text-[10px] font-mono text-slate-400">#{ss.id}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <Icons.CornerDownRight className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ss.subcategory_label}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                        {ss.category_label}
                                    </span>
                                </td>
                                <td className="px-8 py-6 font-black text-slate-900 dark:text-white">{ss.fee ? `${ss.fee}%` : '0%'}</td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => handleEditSecondSubcategoryClick(ss)}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSecondSubcategoryClick(ss.id)}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {secondSubcategories.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">
                                No Level 3 subcategories found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Orders', value: orderStats.total, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Pending', value: orderStats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Completed', value: orderStats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Revenue', value: `$${orderStats.revenue.toLocaleString()}`, icon: Banknote, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Management</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Track and process customer service requests.</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search orders..."
                            className="h-14 w-full rounded-2xl border-none bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-bold shadow-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={orderSearchTerm}
                            onChange={(e) => setOrderSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-44 group">
                            <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <select 
                                className="h-14 w-full appearance-none rounded-2xl border-none bg-white dark:bg-slate-900 pl-10 pr-10 text-[10px] font-black uppercase tracking-widest shadow-xl focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                value={orderStatusFilter}
                                onChange={(e) => setOrderStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending_whatsapp">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl px-4 h-14 border border-transparent focus-within:border-indigo-500 transition-all">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 w-24 dark:text-white"
                                value={orderDateRange.start}
                                onChange={(e) => setOrderDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <span className="text-slate-300">/</span>
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 w-24 dark:text-white"
                                value={orderDateRange.end}
                                onChange={(e) => setOrderDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                            {(orderDateRange.start || orderDateRange.end) && (
                                <button 
                                    onClick={() => setOrderDateRange({ start: '', end: '' })}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th className="px-8 py-8">Order Info</th>
                        <th className="px-8 py-8">Customer</th>
                        <th className="px-8 py-8">Service</th>
                        <th className="px-8 py-8">Total</th>
                        <th className="px-8 py-8">Status</th>
                        <th className="px-8 py-8 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredOrders.map((order) => (
                        <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                            <td className="px-8 py-6">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">#{order.id.slice(0, 8)}</span>
                                        {order.internalNotes && (
                                            <div className="h-4 w-4 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400" title="Has internal notes">
                                                <FileText className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-sm">
                                        {order.customerEmail?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">{order.customerEmail}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.customerPhone || 'No Phone'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{order.serviceName}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.category}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col">
                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{order.currency}{(order.totalPrice || order.price).toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Due</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`inline-flex items-center rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button 
                                    onClick={() => handleViewOrder(order)}
                                    className="group/btn relative h-12 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 overflow-hidden"
                                >
                                    <span className="relative z-10">View Details</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-8 py-32 text-center text-slate-400 font-bold">
                                <div className="flex flex-col items-center">
                                    <div className="h-24 w-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                        <Icons.ShoppingBag className="h-10 w-10 opacity-20" />
                                    </div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No orders found</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Try adjusting your filters or search term.</p>
                                </div>
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
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Bulk Actions Bar for Users */}
            {selectedUsers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-4 z-30 flex items-center justify-between p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
                    {selectedUsers.length}
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">Users Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleBulkUserStatusUpdate(true)}
                    className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Activate
                  </button>
                  <button 
                    onClick={() => handleBulkUserStatusUpdate(false)}
                    className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Ban
                  </button>
                  <button 
                    onClick={handleBulkUserDelete}
                    className="h-10 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Delete
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-2" />
                  <button 
                    onClick={() => setSelectedUsers([])}
                    className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* User Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: dbUsers.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Active Users', value: dbUsers.filter(u => u.active !== false).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Admins', value: dbUsers.filter(u => u.role === 'admin').length, icon: Settings, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">User Management</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Manage registered users and view their activity.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="h-14 w-full rounded-2xl border-none bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-bold shadow-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleAddUserClick}
                        className="h-14 flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Add User
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th className="px-8 py-6">User Profile</th>
                        <th className="px-8 py-6">Role</th>
                        <th className="px-8 py-6 text-center">Activity</th>
                        <th className="px-8 py-6">Total Spent</th>
                        <th className="px-8 py-6">Joined</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredUsers.map((user, idx) => (
                        <tr 
                          key={idx} 
                          className={`group transition-colors ${
                            selectedUsers.includes(user.originalUser.id) 
                              ? 'bg-indigo-50/50 dark:bg-indigo-900/10' 
                              : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <button 
                                      onClick={() => {
                                        setSelectedUsers(prev => 
                                          prev.includes(user.originalUser.id) 
                                            ? prev.filter(id => id !== user.originalUser.id) 
                                            : [...prev, user.originalUser.id]
                                        );
                                      }}
                                      className={`h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                                        selectedUsers.includes(user.originalUser.id)
                                          ? 'bg-indigo-600 border-indigo-600 text-white'
                                          : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100'
                                      }`}
                                    >
                                      {selectedUsers.includes(user.originalUser.id) && <Icons.Check className="h-4 w-4" />}
                                    </button>
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
                                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{user.email}</span>
                                            {user.originalUser.active === false && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest">Banned</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {user.name || 'Anonymous User'} {user.phone && user.phone !== 'N/A' ? `• ${user.phone}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                                    user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30' : 
                                    user.role === 'guest' ? 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : 
                                    'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-slate-900 dark:text-white">{user.count}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Orders</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{user.spent.toFixed(2)} TND</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Value</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        {user.isRegistered ? new Date(user.lastOrder).toLocaleDateString() : 'Guest'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Last Active</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                {user.isRegistered && (
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <button 
                                            onClick={() => handleToggleUserStatus(user.originalUser.id, user.originalUser.active !== false)}
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                                                user.originalUser.active !== false 
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                            }`}
                                            title={user.originalUser.active !== false ? 'Deactivate User' : 'Activate User'}
                                        >
                                            <Power className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditUserClick(user.originalUser)}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                                            title="Edit User"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUserClick(user.originalUser)}
                                            className="h-10 w-10 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
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
                            <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">
                                <div className="flex flex-col items-center">
                                    <Icons.Users className="h-16 w-16 mb-4 opacity-10" />
                                    <p className="text-lg">No users found matching your search.</p>
                                </div>
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

      {/* Subcategory Modal */}
      <Modal
        isOpen={isSubcategoryFormOpen}
        onClose={() => setIsSubcategoryFormOpen(false)}
        title={editingSubcategory ? 'Edit Level 1 Subcategory' : 'Add Level 1 Subcategory'}
      >
        <SubcategoryForm
            initialData={editingSubcategory || undefined}
            categories={categories}
            onSubmit={handleSubcategorySubmit}
            onCancel={() => setIsSubcategoryFormOpen(false)}
        />
      </Modal>

      {/* Second Subcategory Modal */}
      <Modal
        isOpen={isSecondSubcategoryFormOpen}
        onClose={() => setIsSecondSubcategoryFormOpen(false)}
        title={editingSecondSubcategory ? 'Edit Level 2 Subcategory' : 'Add Level 2 Subcategory'}
      >
        <SecondSubcategoryForm
            initialData={editingSecondSubcategory || undefined}
            categories={categories}
            onSubmit={handleSecondSubcategorySubmit}
            onCancel={() => setIsSecondSubcategoryFormOpen(false)}
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
          <div className="space-y-8 p-2">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Order #{viewingOrder.id.slice(0, 8)}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(viewingOrder.id);
                        notify('Order ID copied to clipboard', 'info');
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
                    title="Copy Order ID"
                >
                    <Icons.Copy className="h-4 w-4" />
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Tag className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Details</p>
                            <p className="text-base font-black text-slate-900 dark:text-white leading-tight">{viewingOrder.serviceName}</p>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter mt-1">{viewingOrder.category}</p>
                        </div>
                      </div>
                   </div>

                   <div className="group relative overflow-hidden rounded-3xl bg-emerald-50/50 dark:bg-emerald-900/10 p-6 border border-emerald-100 dark:border-emerald-900/20 transition-all hover:shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Banknote className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Summary</p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{viewingOrder.currency}{(viewingOrder.totalPrice || viewingOrder.price).toFixed(2)}</p>
                            <p className="text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest mt-1">Total Amount Due</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white break-all">{viewingOrder.customerEmail || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{viewingOrder.customerPhone || 'N/A'}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Specifics</p>
                           <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {viewingOrder.customerInfo.split('Details:')[1]?.trim() || viewingOrder.customerInfo}
                           </div>
                        </div>
                        
                        {viewingOrder.selectedOptions && viewingOrder.selectedOptions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Options</p>
                             <div className="space-y-2">
                                {viewingOrder.selectedOptions.map((opt, idx) => (
                                   <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20">
                                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{opt.optionLabel}</span>
                                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{opt.valueLabel || opt.textValue || 'N/A'}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Status Management */}
             <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <CheckCircle2 className="h-4 w-4" />
                   </div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Order Status</label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
                         className={`group flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                            selectedStatus === status.id 
                            ? getStatusColor(status.id as OrderStatus).replace('bg-', 'bg-opacity-20 bg-') + ' border-current scale-105 shadow-lg'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                         }`}
                       >
                         <status.icon className={`h-6 w-6 mb-2 transition-transform group-hover:scale-110 ${selectedStatus === status.id ? 'animate-bounce' : ''}`} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                       </button>
                    ))}
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                    <FileText className="h-4 w-4" />
                   </div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Admin Notes</label>
                </div>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                  rows={4}
                  placeholder="Add notes about this order here (e.g. processed, customer contacted, special requirements)..."
                />
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
               <button
                 onClick={() => setViewingOrder(null)}
                 className="group flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
               >
                 <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
                 Discard
               </button>
               <button
                 onClick={handleSaveOrderChanges}
                 className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-1 active:translate-y-0 transition-all"
               >
                 <Save className="h-5 w-5" />
                 Save Changes
               </button>
             </div>
          </div>
        )}
      </Modal>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};
