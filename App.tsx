import React, { useState, useEffect, useMemo } from 'react';
import { ServiceCategory, ServiceItem, Category, Order, OrderStatus, User, Review } from './types';
import { TRANSLATIONS } from './constants';
import { getServices, addOrder, getOrdersByEmail, getCurrentUser, setCurrentUserSession, getOrdersByUserId, getReviews, getFavorites, toggleFavorite, getCategories, signOutUser, updateService } from './services/storageService';
import { ServiceCard } from './components/ServiceCard';
import { HeroCarousel } from './components/HeroCarousel';
import { AdminPanel, AdminTab } from './components/AdminPanel';
import { Modal } from './components/Modal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ReviewSection } from './components/ReviewSection';
import { SettingsPage } from './components/SettingsPage';
import { ChatAssistant } from './components/ChatAssistant'; // Import ChatAssistant
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { LayoutDashboard, ShieldCheck, Box, Search, ArrowUpDown, Filter, Info, MessageCircle, ShoppingCart, Mail, Phone, FileText, AlertCircle, History, User as UserIcon, ChevronRight, ChevronDown, ArrowLeft, Calendar, Banknote, Tag, HelpCircle, X, SlidersHorizontal, Globe, Menu, LogOut, Home, List, Users, BarChart3, Sparkles, ArrowRight, Sun, Moon, Languages, LogIn, Settings, Heart, FolderTree, Flame, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

type Language = 'en' | 'fr' | 'ar';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // Theme & Language State
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Language>('fr'); 
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Admin View State
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Computed Admin Check
  const isUserAdmin = currentUser?.role === 'admin';

  const [activeCategory, setActiveCategory] = useState<string>('HOME');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Dynamic Categories
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Admin Navigation State
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // Advanced Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [searchGlobal, setSearchGlobal] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // State for structured order input
  const [orderForm, setOrderForm] = useState({
    email: '',
    phone: '',
    details: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    phone: '',
    details: ''
  });

  // User History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyEmail, setHistoryEmail] = useState('');
  const [userOrders, setUserOrders] = useState<Order[] | null>(null);
  const [viewingHistoryOrder, setViewingHistoryOrder] = useState<Order | null>(null);

  // Reviews State
  const [currentReviews, setCurrentReviews] = useState<Review[]>([]);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>([]);

  // Auth & Profile Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  // ASYNC DATA LOADING
  useEffect(() => {
    loadData();
    
    // Check for existing session (manual)
    const sessionUser = getCurrentUser();
    if (sessionUser) {
        setCurrentUser(sessionUser);
        setHistoryEmail(sessionUser.email);
    }
  }, []);

  const loadData = async () => {
    try {
        const [servicesData, categoriesData] = await Promise.all([
            getServices(),
            getCategories()
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
    } catch (e) {
        console.error("Failed to load initial data", e);
    }
  };

  // Update favorites when user changes
  useEffect(() => {
    const userId = currentUser ? currentUser.id : 'guest';
    setFavorites(getFavorites(userId));
  }, [currentUser]);

  // Update admin mode when user changes
  useEffect(() => {
    if (currentUser?.role === 'admin') {
       setIsAdminMode(true);
    } else {
       setIsAdminMode(false);
    }
  }, [currentUser]);

  // Update order form when user logs in
  useEffect(() => {
    if (currentUser) {
        setOrderForm(prev => ({
            ...prev,
            email: currentUser.email,
            phone: currentUser.phone || ''
        }));
        setHistoryEmail(currentUser.email);
    } else {
        // Clear sensitive fields on logout
        setOrderForm(prev => ({ ...prev, email: '', phone: '' }));
        setHistoryEmail('');
    }
  }, [currentUser]);

  // Load reviews when a service is selected
  useEffect(() => {
    if (selectedService) {
      const loadReviews = async () => {
          const reviews = await getReviews(selectedService.id);
          setCurrentReviews(reviews);
      };
      loadReviews();
    }
  }, [selectedService]);

  // Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Language/Direction Effect
  useEffect(() => {
    const root = document.documentElement;
    if (lang === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', lang);
    }
  }, [lang]);

  // Translation Helper
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  const refreshData = async () => {
    await loadData();
  };

  const addToast = (message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Auth Handlers ---

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentUserSession(user);
    setIsAuthOpen(false);
    addToast(t('loginSuccess'), 'success');
  };

  const handleLogout = () => {
    signOutUser();
    setCurrentUser(null);
    setCurrentUserSession(null);
    setUserOrders(null);
    setActiveAdminTab('dashboard'); 
    setIsAdminMode(false);
    addToast('Logged out successfully', 'info');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setIsProfileOpen(false);
    addToast(t('profileUpdated'), 'success');
  };

  // --- Filtering & Rendering ---

  const displayedServices = useMemo(() => {
    let filtered = services.filter(s => {
       const q = searchQuery.toLowerCase();
       const matchesSearch = s.name.toLowerCase().includes(q) || 
                             s.description.toLowerCase().includes(q);
       
       const isActive = isAdminMode || s.active;

       const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
       const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
       const matchesPrice = s.price >= min && s.price <= max;

       let matchesCategory = false;
       
       if (searchQuery.trim().length > 0) {
           if (activeCategory === 'HOME' || activeCategory === 'SETTINGS' || searchGlobal) {
               matchesCategory = true;
           } else {
               matchesCategory = s.category === activeCategory;
           }
       } else {
           if (activeCategory === 'HOME' || activeCategory === 'SETTINGS') {
               matchesCategory = true;
           } else {
               matchesCategory = s.category === activeCategory;
           }
       }

       const matchesFavorites = !showFavoritesOnly || favorites.includes(s.id);

       return matchesCategory && matchesSearch && isActive && matchesPrice && matchesFavorites;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'popularity-desc': return (b.popularity || 0) - (a.popularity || 0);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'newest': return b.createdAt - a.createdAt;
        default: return 0;
      }
    });
  }, [services, activeCategory, isAdminMode, searchQuery, sortOption, searchGlobal, priceRange, favorites, showFavoritesOnly]);

  const similarServices = useMemo(() => {
    if (!selectedService) return [];
    return services
        .filter(s => s.category === selectedService.category && s.id !== selectedService.id && s.active)
        .slice(0, 2);
  }, [selectedService, services]);

  const CurrentCategoryMeta = (activeCategory === 'HOME' || activeCategory === 'SETTINGS') ? null : categories.find(c => c.id === activeCategory);

  // New logic for Promo/Offers
  const promoServices = useMemo(() => {
      return services.filter(s => 
          s.active && 
          ((s.promoPrice && s.promoPrice < s.price) || s.badgeLabel)
      ).slice(0, 3); // Take top 3 for the horizontal scroller
  }, [services]);

  const handleServiceClick = (service: ServiceItem) => {
    setSelectedService(service);
    setOrderForm(prev => ({ 
        ...prev, 
        details: '' 
    })); 
    setFormErrors({ email: '', phone: '', details: '' });
  };

  const handleToggleFavorite = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    const userId = currentUser ? currentUser.id : 'guest';
    toggleFavorite(userId, serviceId);
    setFavorites(getFavorites(userId));
  };

  const handleReviewAdded = async () => {
    if (selectedService) {
       const reviews = await getReviews(selectedService.id);
       setCurrentReviews(reviews);
       addToast(t('reviewAdded'), 'success');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', phone: '', details: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!orderForm.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(orderForm.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!orderForm.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!orderForm.details.trim()) {
      errors.details = 'Required information is missing';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleOrderViaWhatsApp = async () => {
    if (!selectedService) return;
    
    if (!validateForm()) {
      return;
    }

    const customerInfoString = `Email: ${orderForm.email}\nPhone: ${orderForm.phone}\nDetails: ${orderForm.details}`;
    
    // Use promo price if available
    const finalPrice = (selectedService.promoPrice && selectedService.promoPrice < selectedService.price) 
        ? selectedService.promoPrice 
        : selectedService.price;

    await addOrder({
      id: crypto.randomUUID(),
      userId: currentUser?.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      price: finalPrice,
      currency: selectedService.currency,
      customerInfo: customerInfoString,
      customerEmail: orderForm.email,
      customerPhone: orderForm.phone,
      status: 'pending_whatsapp',
      createdAt: Date.now()
    });

    const message = `*New Order Request*\n\n` +
      `*Service:* ${selectedService.name}\n` +
      `*Category:* ${selectedService.category}\n` +
      `*Price:* ${selectedService.currency}${finalPrice} ${selectedService.promoPrice ? '(Promo)' : ''}\n\n` +
      `*Customer Information:*\n` +
      `------------------\n` +
      `*Email:* ${orderForm.email}\n` +
      `*Phone:* ${orderForm.phone}\n` +
      `*Required Details:* ${orderForm.details}\n\n` +
      `_Sent via ATLASVAULT App_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '15550199090'; 
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    addToast('Order initiated successfully! WhatsApp opened.', 'success');
    window.open(url, '_blank');
    setSelectedService(null);
  };

  const handleSearchHistory = async () => {
    if (currentUser) {
        const orders = await getOrdersByUserId(currentUser.id);
        setUserOrders(orders);
    } else {
        if (!historyEmail.trim()) return;
        const orders = await getOrdersByEmail(historyEmail);
        setUserOrders(orders);
    }
    setViewingHistoryOrder(null);
  };

  useEffect(() => {
    if (isHistoryOpen && currentUser) {
        handleSearchHistory();
    }
  }, [isHistoryOpen, currentUser]);


  const handleContactSupport = (order: Order) => {
     const message = `Hello, I need assistance regarding my order #${order.id.substring(0, 8)} for ${order.serviceName}.`;
     const encodedMessage = encodeURIComponent(message);
     const whatsappNumber = '15550199090';
     const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
     window.open(url, '_blank');
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending_whatsapp': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'processing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending_whatsapp': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const isHomeView = activeCategory === 'HOME' && searchQuery.trim() === '';
  const isSettingsView = activeCategory === 'SETTINGS';
  const searchIconPosition = lang === 'ar' ? 'right-3' : 'left-3';
  const closeIconPosition = lang === 'ar' ? 'left-3' : 'right-3';
  const searchInputPadding = lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-nexus-900 text-slate-900 dark:text-slate-200 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar and rest of layout... */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-r rtl:border-r-0 rtl:border-l bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
        {/* ... Sidebar Content ... */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Box className="h-5 w-5 text-white" />
           </div>
           <div>
             <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">ATLASVAULT</h1>
             <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                {isAdminMode ? t('adminConsole') : t('serviceCatalog')}
             </p>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(false)}
             className="ms-auto lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white"
           >
             <X className="h-5 w-5" />
           </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {/* ... (Menu items unchanged) ... */}
          {isAdminMode ? (
            <>
              {/* ... Admin Menu ... */}
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('management')}</p>
              <button
                onClick={() => setActiveAdminTab('dashboard')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeAdminTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <BarChart3 className="h-4 w-4" /> {t('dashboard')}
              </button>
              {/* ... other admin buttons ... */}
              <button
                onClick={() => setActiveAdminTab('categories')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeAdminTab === 'categories' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FolderTree className="h-4 w-4" /> {t('categories')}
              </button>
              <button
                onClick={() => setActiveAdminTab('services')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeAdminTab === 'services' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <List className="h-4 w-4" /> {t('catalogServices')}
              </button>
              <button
                onClick={() => setActiveAdminTab('orders')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeAdminTab === 'orders' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <ShoppingCart className="h-4 w-4" /> {t('orders')}
              </button>
              <button
                onClick={() => setActiveAdminTab('users')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeAdminTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Users className="h-4 w-4" /> {t('userDirectory')}
              </button>
              
              <div className="mt-6"></div>
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('main')}</p>
              <button
                onClick={() => {
                  setIsAdminMode(false); 
                  setActiveCategory('HOME');
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors`}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('exitAdmin')}
              </button>
            </>
          ) : (
            <>
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('main')}</p>
              <button
                onClick={() => {
                  setActiveCategory('HOME');
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeCategory === 'HOME' && !showFavoritesOnly ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Home className="h-4 w-4" />
                {t('home')}
              </button>

              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">{t('categories')}</p>
              {categories.map((cat) => {
                const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
                const isActive = activeCategory === cat.id && !showFavoritesOnly;
                const label = lang === 'fr' ? (cat.label_fr || cat.label) : (lang === 'ar' ? (cat.label_ar || cat.label) : cat.label);
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery('');
                      setShowFavoritesOnly(false);
                      if (!searchQuery) setSearchGlobal(false);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <IconComponent className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {label}
                  </button>
                );
              })}

              <div className="mt-8 mb-4 px-3">
                 <div className="h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <button
                onClick={() => {
                  setShowFavoritesOnly(true);
                  setActiveCategory('HOME');
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1 ${showFavoritesOnly ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Heart className="h-4 w-4" />
                {t('myFavorites')}
              </button>
              
              <button
                onClick={() => {
                  setIsHistoryOpen(true);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <History className="h-4 w-4" />
                {t('myOrders')}
              </button>

              <button
                onClick={() => {
                  setActiveCategory('SETTINGS');
                  setShowFavoritesOnly(false);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeCategory === 'SETTINGS' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Settings className="h-4 w-4" />
                {t('settings')}
              </button>
            </>
          )}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
           {currentUser ? (
              <div className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                     <button
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                     >
                        <Settings className="h-3.5 w-3.5" />
                        {t('profile')}
                     </button>
                     <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-2 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                     >
                        <LogOut className="h-3.5 w-3.5" />
                        {t('logOut')}
                     </button>
                  </div>
                  
                  {isUserAdmin && !isAdminMode && (
                      <button
                        onClick={() => {
                            setIsAdminMode(true);
                            setActiveAdminTab('dashboard');
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600/10 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/20 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t('switchToAdmin')}
                      </button>
                  )}
                  {isUserAdmin && isAdminMode && (
                    <button
                        onClick={() => setIsAdminMode(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600/10 px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-600/20 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t('exitAdmin')}
                      </button>
                  )}
              </div>
           ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {t('login')} / {t('register')}
              </button>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-nexus-900 transition-colors duration-300">
        {/* ... (Header and Main Content unchanged) ... */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-nexus-900/80 px-4 backdrop-blur-md lg:hidden z-30">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
           >
              <Menu className="h-6 w-6" />
           </button>
           <span className="font-semibold text-slate-900 dark:text-white">ATLASVAULT</span>
           <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {isAdminMode ? (
              <AdminPanel 
                 services={services} 
                 categories={categories}
                 onUpdate={refreshData} 
                 notify={addToast}
                 activeTab={activeAdminTab}
              />
            ) : isSettingsView ? (
                <SettingsPage 
                    theme={theme}
                    setTheme={setTheme}
                    lang={lang}
                    setLang={setLang}
                    user={currentUser}
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onLogin={() => setIsAuthOpen(true)}
                />
            ) : (
              <div className="space-y-8">
                 {/* ... (Existing Main Content) ... */}
                 {/* Search & Filter Header (Unchanged) */}
                 <div className="sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-white/95 dark:bg-nexus-900/95 backdrop-blur-sm py-4 border-b border-slate-200 dark:border-slate-800/50">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                          <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500 ${searchIconPosition}`} />
                          <input 
                            type="text"
                            placeholder={activeCategory === 'HOME' ? t('searchAll') : t('searchCategoryPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm ${searchInputPadding}`}
                          />
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')}
                              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white ${closeIconPosition}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                              showFilters 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('filters')}</span>
                          </button>
                          
                          <button
                            onClick={toggleTheme}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition-all"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                          >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          </button>

                          {/* Language Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition-all"
                            >
                              <span>{currentLangObj.flag}</span>
                              <span className="hidden sm:inline">{currentLangObj.label}</span>
                              <span className="sm:hidden">{currentLangObj.code.toUpperCase()}</span>
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </button>

                            {isLangMenuOpen && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsLangMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 z-40 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-xl">
                                  {languages.map((l) => (
                                    <button
                                      key={l.code}
                                      onClick={() => {
                                        setLang(l.code as any);
                                        setIsLangMenuOpen(false);
                                      }}
                                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        lang === l.code
                                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                      }`}
                                    >
                                      <span>{l.flag}</span>
                                      {l.label}
                                      {lang === l.code && <Check className="ml-auto h-3 w-3" />}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                    </div>

                    {showFilters && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-200 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 space-y-4 shadow-sm">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                  <ArrowUpDown className="h-3 w-3" /> {t('sortBy')}
                                </label>
                                <select
                                  value={sortOption}
                                  onChange={(e) => setSortOption(e.target.value)}
                                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                                >
                                  <option value="newest">{t('newest')}</option>
                                  <option value="popularity-desc">{t('popularity')}: High to Low</option>
                                  <option value="price-asc">{t('price')}: Low to High</option>
                                  <option value="price-desc">{t('price')}: High to Low</option>
                                  <option value="name-asc">{t('nameAz')}</option>
                                </select>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                  <Banknote className="h-3 w-3" /> {t('priceRange')}
                                </label>
                                <div className="flex gap-2">
                                  <input
                                      type="number"
                                      placeholder="Min"
                                      value={priceRange.min}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                                  />
                                  <input
                                      type="number"
                                      placeholder="Max"
                                      value={priceRange.max}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                                  />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                  <Globe className="h-3 w-3" /> {t('searchScope')}
                                </label>
                                <button 
                                  onClick={() => setSearchGlobal(!searchGlobal)}
                                  className={`flex w-full h-9 items-center justify-between rounded-md border px-3 text-sm transition-all ${
                                    searchGlobal 
                                        ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' 
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                                >
                                  <span>{t('searchAllCategories')}</span>
                                  <div className={`h-4 w-4 rounded border ${searchGlobal ? 'border-indigo-500 bg-indigo-500' : 'border-slate-400 dark:border-slate-600'}`}>
                                      {searchGlobal && <Icons.Check className="h-3.5 w-3.5 text-white" />}
                                  </div>
                                </button>
                            </div>
                          </div>
                      </div>
                    )}
                 </div>

                 {isHomeView ? (
                   <div className="space-y-12 animate-in fade-in duration-500">
                      {!showFavoritesOnly && (
                        <>
                            {/* NEW HERO CAROUSEL REPLACING STATIC HERO */}
                            <HeroCarousel 
                                promotedServices={promoServices}
                                onSelectService={handleServiceClick}
                                t={t}
                                lang={lang}
                                isAdmin={isAdminMode}
                            />

                            {/* SPECIAL OFFERS / PROMOS SECTION (Grid List below carousel) */}
                            {promoServices.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 px-1">
                                        <Flame className="h-5 w-5 fill-rose-500" />
                                        <h3 className="text-lg font-bold uppercase tracking-wider">Hot Deals & Offers</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {promoServices.map(service => (
                                            <ServiceCard 
                                                key={service.id} 
                                                service={service} 
                                                onClick={handleServiceClick} 
                                                isAdmin={false}
                                                isFavorite={favorites.includes(service.id)}
                                                onToggleFavorite={handleToggleFavorite}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-8 mb-4 px-3">
                                        <div className="h-px bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                </div>
                            )}
                        </>
                      )}

                      <div id="catalog-start"></div>

                      {showFavoritesOnly ? (
                           <div className="space-y-6">
                              <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                  <div className="flex items-center gap-4">
                                     <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm`}>
                                        <Heart className={`h-6 w-6 text-rose-500 fill-rose-500`} />
                                     </div>
                                     <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('favorites')}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('myFavorites')}</p>
                                     </div>
                                  </div>
                              </div>
                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                  {displayedServices.map(service => (
                                    <ServiceCard 
                                      key={service.id} 
                                      service={service} 
                                      onClick={handleServiceClick} 
                                      isAdmin={false}
                                      isFavorite={true}
                                      onToggleFavorite={handleToggleFavorite}
                                    />
                                  ))}
                              </div>
                              {displayedServices.length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <Heart className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                                    <p className="text-slate-500 font-medium">No favorites yet.</p>
                                </div>
                              )}
                           </div>
                      ) : (
                          categories.map((category) => {
                             const categoryServices = displayedServices.filter(s => s.category === category.id);
                             const Icon = (Icons as any)[category.icon] || Icons.HelpCircle;
                             const label = lang === 'fr' ? (category.label_fr || category.label) : (lang === 'ar' ? (category.label_ar || category.label) : category.label);
                             const desc = lang === 'fr' ? (category.desc_fr || category.desc) : (lang === 'ar' ? (category.desc_ar || category.desc) : category.desc);

                             if (categoryServices.length === 0) return null;

                             return (
                                <div key={category.id} className="space-y-6">
                                   <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                      <div className="flex items-center gap-4">
                                         <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm`}>
                                            <Icon className={`h-6 w-6 ${category.color}`} />
                                         </div>
                                         <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{label}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
                                         </div>
                                      </div>
                                      <button 
                                        onClick={() => {
                                           setActiveCategory(category.id);
                                           window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="hidden sm:flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white transition-colors"
                                      >
                                        {t('viewAll')} <ArrowRight className={`h-3 w-3 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                                      </button>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                      {categoryServices.map(service => (
                                        <ServiceCard 
                                          key={service.id} 
                                          service={service} 
                                          onClick={handleServiceClick} 
                                          isAdmin={false}
                                          isFavorite={favorites.includes(service.id)}
                                          onToggleFavorite={handleToggleFavorite}
                                        />
                                      ))}
                                   </div>
                                </div>
                             );
                          })
                      )}
                      
                      {!showFavoritesOnly && displayedServices.length === 0 && (
                        <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Search className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                            <p className="text-slate-500 font-medium">{t('noServices')}</p>
                        </div>
                      )}
                   </div>
                 ) : (
                   <div className="animate-in fade-in duration-300">
                     <div className="mb-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 backdrop-blur-sm overflow-hidden p-8">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
                              {(() => {
                                  const Icon = (Icons as any)[CurrentCategoryMeta?.icon || 'Search'] || Icons.Search;
                                  return <Icon className={`h-8 w-8 ${CurrentCategoryMeta?.color || 'text-slate-400'}`} />
                              })()}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                   {searchQuery.trim() !== '' 
                                      ? (searchGlobal || activeCategory === 'HOME' ? t('globalSearch') : `${t('searching')}: ${lang === 'fr' ? (CurrentCategoryMeta?.label_fr || CurrentCategoryMeta?.label) : (lang === 'ar' ? (CurrentCategoryMeta?.label_ar || CurrentCategoryMeta?.label) : CurrentCategoryMeta?.label)}`) 
                                      : (lang === 'fr' ? (CurrentCategoryMeta?.label_fr || CurrentCategoryMeta?.label) : (lang === 'ar' ? (CurrentCategoryMeta?.label_ar || CurrentCategoryMeta?.label) : CurrentCategoryMeta?.label))
                                   }
                                </h2>
                                <p className="mt-2 text-slate-500 dark:text-slate-400">
                                   {searchQuery.trim() !== '' 
                                      ? `${t('showingResults')} "${searchQuery}"`
                                      : (lang === 'fr' ? (CurrentCategoryMeta?.desc_fr || CurrentCategoryMeta?.desc) : (lang === 'ar' ? (CurrentCategoryMeta?.desc_ar || CurrentCategoryMeta?.desc) : CurrentCategoryMeta?.desc))
                                   }
                                </p>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {displayedServices.map(service => (
                          <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onClick={handleServiceClick} 
                            isAdmin={false}
                            isFavorite={favorites.includes(service.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                        {displayedServices.length === 0 && (
                          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                              <Search className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                              <p className="text-slate-500 font-medium">{t('noServices')}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{t('tryAdjusting')}</p>
                          </div>
                        )}
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CHAT ASSISTANT COMPONENT */}
      {!isAdminMode && (
        <ChatAssistant services={services} categories={categories} />
      )}

      <Modal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        title={t('login')}
      >
        <AuthModal 
            onSuccess={handleLoginSuccess}
            onCancel={() => setIsAuthOpen(false)}
            lang={lang}
        />
      </Modal>

      {/* ... (Existing Modals unchanged) ... */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={t('updateProfile')}
      >
        {currentUser && (
            <ProfileModal 
                user={currentUser}
                onUpdate={handleProfileUpdate}
                onCancel={() => setIsProfileOpen(false)}
                lang={lang}
            />
        )}
      </Modal>

      {/* Service Details Modal */}
      {selectedService && (
        <Modal 
          isOpen={!!selectedService} 
          onClose={() => setSelectedService(null)} 
          title="Service Details"
        >
          {/* ... Service Details Content (unchanged) ... */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedService.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {selectedService.category}
                    </span>
                    {selectedService.badgeLabel && (
                        <span className="inline-flex items-center rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-500">
                            <Tag className="h-3 w-3 mr-1" /> {selectedService.badgeLabel}
                        </span>
                    )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                    {selectedService.promoPrice && selectedService.promoPrice < selectedService.price && (
                        <span className="text-sm text-slate-400 line-through decoration-slate-400/50">
                            {selectedService.currency}{selectedService.price.toFixed(2)}
                        </span>
                    )}
                    <p className={`text-3xl font-bold ${selectedService.promoPrice ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {selectedService.currency}
                        {(selectedService.promoPrice && selectedService.promoPrice < selectedService.price 
                            ? selectedService.promoPrice 
                            : selectedService.price).toFixed(2)}
                    </p>
                </div>
                <p className="text-xs text-slate-500">{t('pricePerUnit')}</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-800">
                  <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                     <Info className="h-4 w-4" /> {t('description')}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{selectedService.description}</p>
               </div>

               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-800">
                     <h4 className="mb-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t('conditions')}</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-400">{selectedService.conditions}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-800">
                     <h4 className="mb-2 text-sm font-semibold text-amber-600 dark:text-amber-400">{t('requirements')}</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-400">{selectedService.requiredInfo}</p>
                  </div>
               </div>

               <ReviewSection 
                 serviceId={selectedService.id}
                 reviews={currentReviews}
                 user={currentUser}
                 onReviewAdded={handleReviewAdded}
                 lang={lang}
               />

               <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg shadow-black/5 dark:shadow-black/20">
                  <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                     <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> {t('startOrder')}
                  </h4>

                  {!currentUser && (
                     <div className="mb-4 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 p-3 flex items-center justify-between text-sm">
                        <span className="text-indigo-600 dark:text-indigo-300">{t('loginToAccess')}</span>
                        <button 
                            onClick={() => {
                                setSelectedService(null);
                                setIsAuthOpen(true);
                            }}
                            className="text-xs font-semibold underline text-indigo-700 dark:text-indigo-400"
                        >
                            {t('login')}
                        </button>
                     </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {t('email')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={orderForm.email}
                        onChange={handleInputChange}
                        readOnly={!!currentUser}
                        className={`w-full rounded-lg border bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 ${formErrors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'} ${!!currentUser ? 'opacity-75 cursor-not-allowed' : ''}`}
                        placeholder="your@email.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" /> {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {t('phone')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={orderForm.phone}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 ${formErrors.phone ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'}`}
                        placeholder="+1 (555) 000-0000"
                      />
                      {formErrors.phone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" /> {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> {t('details')} <span className="text-rose-500">*</span>
                      </label>
                      <p className="mb-2 text-xs text-slate-500 italic">
                         Requested: {selectedService.requiredInfo}
                      </p>
                      <textarea
                        name="details"
                        value={orderForm.details}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full rounded-lg border bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 ${formErrors.details ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'}`}
                        placeholder="e.g. Username: PlayerOne, Account Email: user@example.com..."
                      />
                      {formErrors.details && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" /> {formErrors.details}
                        </p>
                      )}
                    </div>
                  </div>
               </div>
            </div>

            {similarServices.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{t('similarServices')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarServices.map(similar => (
                    <div 
                      key={similar.id}
                      onClick={() => handleServiceClick(similar)}
                      className="group cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <h5 className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">{similar.name}</h5>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500 truncate max-w-[70%]">{similar.description}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {similar.currency}
                            {(similar.promoPrice && similar.promoPrice < similar.price ? similar.promoPrice : similar.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button 
                onClick={handleOrderViaWhatsApp}
                className="flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20"
              >
                <MessageCircle className="h-4 w-4" />
                {t('orderWhatsApp')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* History Modal - unchanged */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={viewingHistoryOrder ? t('orders') : t('myOrders')}
      >
        {/* ... History Modal Content ... */}
        <div className="space-y-6">
          {!userOrders ? (
            <div className="space-y-4">
               {/* ... (History Login Form) ... */}
               <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-800 text-center">
                 <div className="mx-auto w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <UserIcon className="h-6 w-6 text-slate-400" />
                 </div>
                 {currentUser ? (
                    <>
                         <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('welcomeBack')}, {currentUser.name}</h3>
                         <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('loginSuccess')}</p>
                         <button
                             onClick={handleSearchHistory}
                             className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                         >
                             View My Orders
                         </button>
                    </>
                 ) : (
                    <>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('guestMode')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('enterEmail')}</p>
                        <div className="flex gap-2 max-w-sm mx-auto">
                        <input
                            type="email"
                            value={historyEmail}
                            onChange={(e) => setHistoryEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleSearchHistory}
                            disabled={!historyEmail.trim()}
                            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('access')}
                        </button>
                        </div>
                    </>
                 )}
               </div>
            </div>
          ) : viewingHistoryOrder ? (
            <div className="space-y-6">
               <button 
                 onClick={() => setViewingHistoryOrder(null)}
                 className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
               >
                 <ArrowLeft className="h-3 w-3" /> {t('viewAll')}
               </button>

               <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                  <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                     <div>
                       <h3 className="font-bold text-slate-900 dark:text-white text-lg">{viewingHistoryOrder.serviceName}</h3>
                       <p className="text-xs text-indigo-600 dark:text-indigo-400">{viewingHistoryOrder.category}</p>
                     </div>
                     <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(viewingHistoryOrder.status)}`}>
                        {getStatusLabel(viewingHistoryOrder.status)}
                     </span>
                  </div>
                  
                  <div className="p-4 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                           <p className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-1">
                             <Calendar className="h-3 w-3" /> {t('date')}
                           </p>
                           <p className="text-sm text-slate-900 dark:text-white font-medium">
                             {new Date(viewingHistoryOrder.createdAt).toLocaleDateString()}
                             <span className="text-slate-500 text-xs ml-1">
                               {new Date(viewingHistoryOrder.createdAt).toLocaleTimeString()}
                             </span>
                           </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                           <p className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-1">
                             <Banknote className="h-3 w-3" /> {t('price')}
                           </p>
                           <p className="text-sm text-slate-900 dark:text-white font-medium">
                             {viewingHistoryOrder.currency}{viewingHistoryOrder.price.toFixed(2)}
                           </p>
                        </div>
                     </div>

                     <div className="bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2">
                          <Tag className="h-3 w-3" /> {t('details')}
                        </p>
                        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          <p>ID: <span className="font-mono text-xs text-slate-500">{viewingHistoryOrder.id}</span></p>
                          <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
                             <p className="whitespace-pre-wrap">{viewingHistoryOrder.customerInfo}</p>
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="flex justify-end pt-2">
                 <button 
                    onClick={() => handleContactSupport(viewingHistoryOrder)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20"
                 >
                    <MessageCircle className="h-5 w-5" />
                    {t('orderWhatsApp')}
                 </button>
               </div>
            </div>
          ) : (
             <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                   <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      {t('dashboard')}: <span className="text-slate-600 dark:text-slate-300">{historyEmail || 'Guest'}</span>
                   </h3>
                   <button 
                     onClick={() => setUserOrders(null)}
                     className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
                   >
                     {t('cancel')}
                   </button>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                   {userOrders.length > 0 ? (
                      userOrders.sort((a,b) => b.createdAt - a.createdAt).map(order => (
                        <div 
                          key={order.id} 
                          onClick={() => setViewingHistoryOrder(order)}
                          className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-500/50 transition-all"
                        >
                           <div className="flex items-start justify-between mb-2">
                              <div>
                                 <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{order.serviceName}</h4>
                                 <p className="text-xs text-indigo-600 dark:text-indigo-400">{order.category}</p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(order.status)}`}>
                                   {getStatusLabel(order.status)}
                                </span>
                              </div>
                           </div>
                           <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-3 mt-2">
                              <span className="flex items-center gap-1.5">
                                 <Icons.Clock className="h-3 w-3" />
                                 {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{order.currency}{order.price.toFixed(2)}</span>
                                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                              </div>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/20">
                         <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                           <ShoppingCart className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                         </div>
                         <h4 className="text-slate-900 dark:text-white font-medium mb-1">{t('noOrders')}</h4>
                      </div>
                   )}
                </div>
             </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default App;