import React, { useState, useEffect, useMemo } from 'react';
import { ServiceCategory, ServiceItem, Category, Order, OrderStatus, User, Review, GlobalSettings } from './types';
import { TRANSLATIONS, LEGAL_CONTENT } from './constants';
import { getServices, addOrder, getOrdersByEmail, getCurrentUser, setCurrentUserSession, getOrdersByUserId, getReviews, getFavorites, toggleFavorite, getCategories, signOutUser, updateService, getGlobalSettings, cancelOrder } from './services/storageService';
import { ServiceCard } from './components/ServiceCard';
import { HeroCarousel } from './components/HeroCarousel';
import { AdminPanel, AdminTab } from './components/AdminPanel';
import { Modal } from './components/Modal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ReviewSection } from './components/ReviewSection';
import { SettingsPage } from './components/SettingsPage';
import { ChatAssistant } from './components/ChatAssistant';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { LayoutDashboard, ShieldCheck, Shield, Box, Search, ArrowUpDown, Filter, Info, MessageCircle, ShoppingCart, Mail, Phone, FileText, AlertCircle, History, User as UserIcon, ChevronRight, ChevronDown, ArrowLeft, Calendar, Banknote, Tag, HelpCircle, X, SlidersHorizontal, Globe, Menu, LogOut, Home, List, Users, BarChart3, Sparkles, ArrowRight, Sun, Moon, Languages, LogIn, Settings, Heart, FolderTree, Flame, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

type Language = 'en' | 'fr' | 'ar';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // Theme & Language State
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Language>('fr'); 
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Admin View State
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Computed Admin Check
  const isUserAdmin = currentUser?.role === 'admin';

  const [activeCategory, setActiveCategory] = useState<string>('HOME');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
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

  // Terms Acceptance State
  const [termsAccepted, setTermsAccepted] = useState(false);

  // User History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyEmail, setHistoryEmail] = useState('');
  const [userOrders, setUserOrders] = useState<Order[] | null>(null);
  const [viewingHistoryOrder, setViewingHistoryOrder] = useState<Order | null>(null);

  // Reviews State
  const [currentReviews, setCurrentReviews] = useState<Review[]>([]);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>([]);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({ whatsappNumber: '21629292395' });

  // Auth & Profile Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Legal Modal State
  const [activeLegalDoc, setActiveLegalDoc] = useState<keyof typeof LEGAL_CONTENT | null>(null);

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
        const [servicesData, categoriesData, settingsData] = await Promise.all([
            getServices(),
            getCategories(),
            getGlobalSettings()
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
        setGlobalSettings(settingsData);
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

       const matchesSubCategory = !activeSubCategory || s.subcategory === activeSubCategory;

       const matchesFavorites = !showFavoritesOnly || favorites.includes(s.id);

       return matchesCategory && matchesSubCategory && matchesSearch && isActive && matchesPrice && matchesFavorites;
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
    setTermsAccepted(false); // Reset terms acceptance
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
    
    if (!termsAccepted) {
        addToast("Please accept the Terms & Conditions to proceed.", 'error');
        return;
    }

    if (!validateForm()) {
      return;
    }

    const customerInfoString = `Email: ${orderForm.email}\nPhone: ${orderForm.phone}\nDetails: ${orderForm.details}`;
    
    // Use promo price if available
    const finalPrice = (selectedService.promoPrice && selectedService.promoPrice < selectedService.price) 
        ? selectedService.promoPrice 
        : selectedService.price;

    // Generate ID first to use in both DB and WhatsApp
    const newOrderId = crypto.randomUUID();
    const date = new Date().toLocaleDateString();

    await addOrder({
      id: newOrderId,
      userId: currentUser?.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      subcategory: selectedService.subcategory,
      price: finalPrice,
      currency: selectedService.currency,
      customerInfo: customerInfoString,
      customerEmail: orderForm.email,
      customerPhone: orderForm.phone,
      status: 'pending_whatsapp',
      createdAt: Date.now()
    });

    // Modern, Clean, "Ticket" Style Message
    const message = `*ATLASVAULT // ORDER TICKET* 💎\n` +
      `────────────────────\n` +
      `*ID:* \`#${newOrderId.substring(0, 8).toUpperCase()}\`\n` +
      `*DATE:* ${date}\n\n` +
      `*✦ SERVICE SELECTION*\n` +
      `├─ *Item:* ${selectedService.name}\n` +
      `├─ *Category:* ${selectedService.category}\n` +
      `└─ *Total:* ${selectedService.currency} ${finalPrice.toFixed(2)}${selectedService.promoPrice ? ' (PROMO)' : ''}\n\n` +
      `*✦ CLIENT DATA*\n` +
      `├─ *Email:* ${orderForm.email}\n` +
      `├─ *Phone:* ${orderForm.phone}\n` +
      `└─ *Specs:* ${orderForm.details}\n\n` +
      `────────────────────\n` +
      `*PAYMENT:* 💳 All appropriate payment modes are available.\n` +
      `*STATUS:* 🟡 Awaiting Payment/Activation\n` +
      `_Secure Transmission via AtlasVault_`;

    const encodedMessage = encodeURIComponent(message);
    // Use dynamic WhatsApp number from settings
    const whatsappNumber = globalSettings.whatsappNumber || '21629292395'; 
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    addToast('Order initiated! All payment modes are available via WhatsApp.', 'success');
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

  const handleUserCancelOrder = async (orderId: string) => {
      if (window.confirm(t('cancelOrderConfirm'))) {
          try {
              await cancelOrder(orderId);
              // Refresh user orders list
              await handleSearchHistory();
              addToast(t('orderCancelled'), 'success');
          } catch (e) {
              addToast('Failed to cancel order', 'error');
          }
      }
  };

  useEffect(() => {
    if (isHistoryOpen && currentUser) {
        handleSearchHistory();
    }
  }, [isHistoryOpen, currentUser]);


  const handleContactSupport = (order: Order) => {
     const message = `*ATLASVAULT // SUPPORT REQUEST* 🛡️\n` +
        `────────────────────\n` +
        `*REF:* \`#${order.id.substring(0, 8).toUpperCase()}\`\n` +
        `*ITEM:* ${order.serviceName}\n\n` +
        `*✦ ISSUE DESCRIPTION*\n` +
        `Hello, I require assistance with this order.\n` +
        `[Please describe your issue here...]`;

     const encodedMessage = encodeURIComponent(message);
     // Use dynamic WhatsApp number from settings
     const whatsappNumber = globalSettings.whatsappNumber || '21629292395';
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

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-r rtl:border-r-0 rtl:border-l bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800/50">
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
          {/* Menu Items */}
          {isAdminMode ? (
            <>
              {/* Admin Menu */}
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('management')}</p>
              <button
                onClick={() => setActiveAdminTab('dashboard')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeAdminTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <BarChart3 className="h-4 w-4" /> {t('dashboard')}
              </button>
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
              {/* User Menu */}
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">{t('main')}</p>
              <button
                onClick={() => {
                  setActiveCategory('HOME');
                  setActiveSubCategory(null);
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${activeCategory === 'HOME' && !showFavoritesOnly ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Home className={`h-4 w-4 ${activeCategory === 'HOME' && !showFavoritesOnly ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {t('home')}
              </button>

              <button
                onClick={() => {
                  setActiveCategory('ALL_CATEGORIES');
                  setActiveSubCategory(null);
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${activeCategory === 'ALL_CATEGORIES' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Icons.LayoutGrid className={`h-4 w-4 ${activeCategory === 'ALL_CATEGORIES' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {t('categories')}
              </button>

              <div className="mt-8 mb-4 px-3">
                 <div className="h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <button
                onClick={() => {
                  setShowFavoritesOnly(true);
                  setActiveCategory('HOME');
                  setActiveSubCategory(null);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1 ${showFavoritesOnly ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {t('myFavorites')}
              </button>
              
              <button
                onClick={() => {
                  setIsHistoryOpen(true);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              >
                <History className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                {t('myOrders')}
              </button>

              <button
                onClick={() => {
                  setActiveCategory('SETTINGS');
                  setActiveSubCategory(null);
                  setShowFavoritesOnly(false);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${activeCategory === 'SETTINGS' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Settings className={`h-4 w-4 ${activeCategory === 'SETTINGS' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
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
                  
                  {currentUser.role === 'admin' && (
                      <button
                          onClick={() => setIsAdminMode(true)}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-3 py-2 text-xs font-medium text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors mb-1"
                      >
                          <Shield className="h-3.5 w-3.5" />
                          Admin Panel
                      </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                     <button
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                     >
                        <UserIcon className="h-3.5 w-3.5" />
                        {t('profile')}
                     </button>
                     <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/30 transition-colors"
                     >
                        <LogOut className="h-3.5 w-3.5" />
                        {t('logOut')}
                     </button>
                  </div>
              </div>
           ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:scale-[1.02]"
              >
                <LogIn className="h-4 w-4" />
                {t('login')}
              </button>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                 {/* Language Selector */}
                 <div className="relative">
                    <button 
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                    >
                        <span className="text-lg">{currentLangObj.flag}</span>
                        <span className="hidden sm:inline">{currentLangObj.code.toUpperCase()}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                    {isLangMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden">
                            {languages.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => { setLang(l.code as any); setIsLangMenuOpen(false); }}
                                    className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 ${lang === l.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                >
                                    <span>{l.flag}</span> {l.label}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>

                 <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                 >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                 </button>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {isAdminMode ? (
                  <AdminPanel 
                    services={services}
                    categories={categories}
                    onUpdate={refreshData}
                    notify={(msg, type) => addToast(msg, type)}
                    activeTab={activeAdminTab}
                    globalSettings={globalSettings}
                  />
              ) : isSettingsView ? (
                  <SettingsPage 
                    theme={theme} setTheme={setTheme}
                    lang={lang} setLang={setLang}
                    user={currentUser}
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onLogin={() => setIsAuthOpen(true)}
                  />
              ) : (
                  <div className="max-w-7xl mx-auto space-y-8">
                      {/* Hero Section */}
                      {isHomeView && !showFavoritesOnly && (
                          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                              <HeroCarousel 
                                promotedServices={promoServices.length > 0 ? promoServices : services.slice(0, 3)} 
                                onSelectService={handleServiceClick}
                                t={t}
                                lang={lang}
                              />
                          </div>
                      )}

                      {/* Search & Filters */}
                      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-slate-50/95 dark:bg-nexus-900/95 backdrop-blur-sm sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent">
                          {/* Search Input and Filter Buttons ... */}
                          <div className="flex flex-col sm:flex-row gap-4">
                              <div className="relative flex-1">
                                  <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 ${searchIconPosition}`} />
                                  <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                    className={`w-full h-12 rounded-xl border-0 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 ${searchInputPadding}`}
                                  />
                                  {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 ${closeIconPosition}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                  )}
                              </div>
                              <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center justify-center gap-2 px-4 h-12 rounded-xl border font-medium transition-colors ${showFilters ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                              >
                                <SlidersHorizontal className="h-5 w-5" />
                                <span className="hidden sm:inline">{t('filters')}</span>
                              </button>
                          </div>
                          
                          {/* Expanded Filters */}
                          {showFilters && (
                              <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-2">
                                  {/* ... Filter Controls ... */}
                                  <div className="flex flex-wrap gap-4">
                                      {/* Sort */}
                                      <div className="space-y-1">
                                          <label className="text-xs font-semibold text-slate-500 uppercase">{t('sortBy')}</label>
                                          <select 
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                                          >
                                              <option value="newest">{t('newest')}</option>
                                              <option value="popularity-desc">{t('popularity')}</option>
                                              <option value="price-asc">{t('price')} (Low to High)</option>
                                              <option value="price-desc">{t('price')} (High to Low)</option>
                                              <option value="name-asc">{t('nameAz')}</option>
                                          </select>
                                      </div>
                                      {/* Price Range */}
                                      <div className="space-y-1">
                                          <label className="text-xs font-semibold text-slate-500 uppercase">{t('priceRange')}</label>
                                          <div className="flex items-center gap-2">
                                              <input 
                                                type="number" 
                                                placeholder="Min" 
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange(prev => ({...prev, min: e.target.value}))}
                                                className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                                              />
                                              <span className="text-slate-400">-</span>
                                              <input 
                                                type="number" 
                                                placeholder="Max" 
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange(prev => ({...prev, max: e.target.value}))}
                                                className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                                              />
                                          </div>
                                      </div>

                                      {/* Subcategory Filter */}
                                      {CurrentCategoryMeta && CurrentCategoryMeta.subcategories && CurrentCategoryMeta.subcategories.length > 0 && (
                                          <div className="space-y-1">
                                              <label className="text-xs font-semibold text-slate-500 uppercase">{t('subcategory')}</label>
                                              <select 
                                                value={activeSubCategory || ''}
                                                onChange={(e) => setActiveSubCategory(e.target.value || null)}
                                                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                                              >
                                                  <option value="">{t('all')}</option>
                                                  {CurrentCategoryMeta.subcategories.map(sub => {
                                                      const subLabel = lang === 'fr' ? (sub.label_fr || sub.label) : (lang === 'ar' ? (sub.label_ar || sub.label) : sub.label);
                                                      return <option key={sub.id} value={sub.id}>{subLabel}</option>;
                                                  })}
                                              </select>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Services Grid */}
                      <div id="catalog-start">
                          {/* ALL CATEGORIES VIEW */}
                          {activeCategory === 'ALL_CATEGORIES' && (
                              <div className="animate-in fade-in slide-in-from-bottom-4">
                                  <div className="mb-8">
                                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                          <Icons.LayoutGrid className="h-8 w-8 text-indigo-500" />
                                          {t('categories')}
                                      </h2>
                                      <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">
                                          Explore our wide range of digital services and products.
                                      </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                      {categories.map(cat => {
                                          const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
                                          const label = lang === 'fr' ? (cat.label_fr || cat.label) : (lang === 'ar' ? (cat.label_ar || cat.label) : cat.label);
                                          const desc = lang === 'fr' ? (cat.desc_fr || cat.desc) : (lang === 'ar' ? (cat.desc_ar || cat.desc) : cat.desc);
                                          
                                          return (
                                              <button
                                                  key={cat.id}
                                                  onClick={() => {
                                                      setActiveCategory(cat.id);
                                                      setActiveSubCategory(null);
                                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                                  }}
                                                  className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all group text-left h-full"
                                              >
                                                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${cat.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
                                                      <IconComponent className={`h-6 w-6 ${cat.color}`} />
                                                  </div>
                                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                      {label}
                                                  </h3>
                                                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                                      {desc}
                                                  </p>
                                                  <div className="mt-auto flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                                                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                                                  </div>
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          )}

                          {CurrentCategoryMeta && !searchQuery && !showFavoritesOnly && activeCategory !== 'ALL_CATEGORIES' && (
                              <div className="mb-8 animate-in fade-in">
                                  <div className="flex items-center gap-3 mb-2">
                                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                          {(() => {
                                              const Icon = (Icons as any)[CurrentCategoryMeta.icon] || Icons.Box;
                                              return <Icon className={`h-8 w-8 ${CurrentCategoryMeta.color}`} />;
                                          })()}
                                          {lang === 'fr' ? (CurrentCategoryMeta.label_fr || CurrentCategoryMeta.label) : (lang === 'ar' ? (CurrentCategoryMeta.label_ar || CurrentCategoryMeta.label) : CurrentCategoryMeta.label)}
                                      </h2>
                                  </div>
                                  <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mb-6">
                                      {lang === 'fr' ? (CurrentCategoryMeta.desc_fr || CurrentCategoryMeta.desc) : (lang === 'ar' ? (CurrentCategoryMeta.desc_ar || CurrentCategoryMeta.desc) : CurrentCategoryMeta.desc)}
                                  </p>

                                  {/* Subcategories List */}
                                  {CurrentCategoryMeta.subcategories && CurrentCategoryMeta.subcategories.length > 0 ? (
                                      !activeSubCategory ? (
                                          // Grid View of Subcategories (Drill-down)
                                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                                              {CurrentCategoryMeta.subcategories.map(sub => {
                                                  const subLabel = lang === 'fr' ? (sub.label_fr || sub.label) : (lang === 'ar' ? (sub.label_ar || sub.label) : sub.label);
                                                  return (
                                                      <button
                                                          key={sub.id}
                                                          onClick={() => setActiveSubCategory(sub.id)}
                                                          className="relative flex flex-col items-center p-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group text-center h-full overflow-hidden"
                                                      >
                                                          {/* Image Area */}
                                                          <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                                              {sub.image ? (
                                                                  <img src={sub.image} alt={subLabel} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                              ) : (
                                                                  <div className="w-full h-full flex items-center justify-center">
                                                                      <FolderTree className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                                                  </div>
                                                              )}
                                                          </div>
                                                          
                                                          {/* Content Area */}
                                                          <div className="p-4 flex flex-col items-center w-full flex-1">
                                                              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{subLabel}</span>
                                                              {/* Subcategory Description */}
                                                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 px-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                                                  {lang === 'fr' ? (sub.desc_fr || sub.desc) : (lang === 'ar' ? (sub.desc_ar || sub.desc) : sub.desc)}
                                                              </p>
                                                          </div>
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                      ) : (
                                          // Active Subcategory Header & Back Button
                                          <div className="flex items-center gap-4 mt-6 mb-4">
                                              <button 
                                                  onClick={() => setActiveSubCategory(null)}
                                                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                              >
                                                  <ArrowLeft className="h-4 w-4" />
                                                  {t('backToCategories') || 'Back'}
                                              </button>
                                              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                                              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                                  {(() => {
                                                      const sub = CurrentCategoryMeta.subcategories.find(s => s.id === activeSubCategory);
                                                      return sub ? (lang === 'fr' ? (sub.label_fr || sub.label) : (lang === 'ar' ? (sub.label_ar || sub.label) : sub.label)) : '';
                                                  })()}
                                              </span>
                                          </div>
                                      )
                                  ) : null}
                              </div>
                          )}

                          {/* Services Grid - Only show if subcategory is selected OR category has no subcategories OR searching/favorites */}
                          {(activeSubCategory || !CurrentCategoryMeta?.subcategories?.length || searchQuery || showFavoritesOnly) && (
                              <>
                                  {showFavoritesOnly && (
                                      <div className="mb-6">
                                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                              <Heart className="h-6 w-6 text-rose-500" />
                                              {t('myFavorites')}
                                          </h2>
                                      </div>
                                  )}

                                  {displayedServices.length > 0 ? (
                                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                          {displayedServices.map((service, idx) => (
                                              <div key={service.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
                                                  <ServiceCard 
                                                    service={service} 
                                                    onClick={handleServiceClick}
                                                    isFavorite={favorites.includes(service.id)}
                                                    onToggleFavorite={handleToggleFavorite}
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="flex flex-col items-center justify-center py-16 text-center">
                                          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
                                              <Search className="h-8 w-8 text-slate-400" />
                                          </div>
                                          <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('noServices')}</h3>
                                          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('tryAdjusting')}</p>
                                          <button 
                                            onClick={() => { setSearchQuery(''); setPriceRange({min:'',max:''}); }}
                                            className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                                          >
                                            Clear all filters
                                          </button>
                                      </div>
                                  )}
                              </>
                          )}
                      </div>
                  </div>
              )}
              </div>

              {/* Legal Footer */}
              {!isAdminMode && (
                  <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
                      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <p>&copy; {new Date().getFullYear()} ATLASVAULT. {t('rightsReserved')}</p>
                          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                              <button onClick={() => setActiveLegalDoc('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                  {t('terms')}
                              </button>
                              <button onClick={() => setActiveLegalDoc('privacy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                  {t('privacy')}
                              </button>
                              <button onClick={() => setActiveLegalDoc('refund')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                  {t('refundPolicy')}
                              </button>
                              <button onClick={() => setActiveLegalDoc('disclaimer')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                  {t('disclaimer')}
                              </button>
                          </div>
                      </div>
                  </footer>
              )}
          </div>
      </main>

      {/* Modals */}
      <Modal 
         isOpen={!!selectedService} 
         onClose={() => setSelectedService(null)}
         title={selectedService?.name || 'Service Details'}
      >
         {selectedService && (
             <div className="space-y-6">
                 {/* Service Modal Content ... */}
                 <div className="flex flex-col md:flex-row gap-6">
                     <div className="flex-1 space-y-4">
                         <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedService.name}</h3>
                             <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedService.description}</p>
                         </div>
                         
                         <div className="flex flex-wrap gap-2">
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                                 {selectedService.category}
                             </span>
                             {selectedService.badgeLabel && (
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300">
                                     {selectedService.badgeLabel}
                                 </span>
                             )}
                         </div>

                         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
                             <div className="flex items-start gap-3">
                                 <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                 <div>
                                     <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('conditions')}</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">{selectedService.conditions}</p>
                                 </div>
                             </div>
                             <div className="flex items-start gap-3">
                                 <FileText className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                 <div>
                                     <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('requirements')}</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">{selectedService.requiredInfo}</p>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="md:w-72 space-y-6">
                         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                             <p className="text-sm text-slate-500 mb-1">{t('price')}</p>
                             <div className="flex items-baseline gap-2 mb-4">
                                 <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                     {selectedService.currency}{(selectedService.promoPrice || selectedService.price).toFixed(2)}
                                 </span>
                                 {selectedService.promoPrice && (
                                     <span className="text-sm text-slate-400 line-through">
                                         {selectedService.currency}{selectedService.price.toFixed(2)}
                                     </span>
                                 )}
                             </div>

                             <div className="space-y-3">
                                 <div>
                                     <label className="block text-xs font-medium text-slate-500 mb-1">{t('email')}</label>
                                     <input 
                                         type="email"
                                         name="email" 
                                         value={orderForm.email}
                                         onChange={handleInputChange}
                                         className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white ${formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                     />
                                     {formErrors.email && <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>}
                                 </div>
                                 <div>
                                     <label className="block text-xs font-medium text-slate-500 mb-1">{t('phone')}</label>
                                     <input 
                                         type="tel" 
                                         name="phone"
                                         value={orderForm.phone}
                                         onChange={handleInputChange}
                                         className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white ${formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                     />
                                     {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
                                 </div>
                                 <div>
                                     <label className="block text-xs font-medium text-slate-500 mb-1">{t('details')}</label>
                                     <textarea 
                                         name="details"
                                         value={orderForm.details}
                                         onChange={handleInputChange}
                                         rows={2}
                                         className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white ${formErrors.details ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                     />
                                     {formErrors.details && <p className="text-xs text-rose-500 mt-1">{formErrors.details}</p>}
                                 </div>
                             </div>

                             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                        I agree to the <button type="button" onClick={(e) => { e.preventDefault(); setActiveLegalDoc('terms'); }} className="underline hover:text-indigo-600 dark:hover:text-indigo-400">Terms</button> & <button type="button" onClick={(e) => { e.preventDefault(); setActiveLegalDoc('privacy'); }} className="underline hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</button>
                                    </span>
                                </label>
                             </div>

                             <button 
                                 onClick={handleOrderViaWhatsApp}
                                 disabled={!termsAccepted}
                                 className={`w-full mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-all shadow-lg ${
                                     termsAccepted 
                                     ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 cursor-pointer' 
                                     : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70'
                                 }`}
                             >
                                 <MessageCircle className="h-4 w-4" />
                                 {t('orderWhatsApp')}
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* Reviews */}
                 <ReviewSection 
                    serviceId={selectedService.id} 
                    reviews={currentReviews} 
                    user={currentUser} 
                    onReviewAdded={handleReviewAdded}
                    lang={lang}
                 />

                 {/* Similar Services */}
                 {similarServices.length > 0 && (
                     <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                         <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('similarServices')}</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {similarServices.map(s => (
                                 <ServiceCard 
                                    key={s.id} 
                                    service={s} 
                                    onClick={handleServiceClick}
                                    isFavorite={favorites.includes(s.id)}
                                    onToggleFavorite={handleToggleFavorite}
                                 />
                             ))}
                         </div>
                     </div>
                 )}
             </div>
         )}
      </Modal>

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

      <Modal
         isOpen={isProfileOpen && !!currentUser}
         onClose={() => setIsProfileOpen(false)}
         title={t('profile')}
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

      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={t('myOrders')}
      >
          <div className="space-y-4">
              {!currentUser && (
                  <div className="flex gap-2 mb-4">
                      <input 
                        type="email" 
                        value={historyEmail}
                        onChange={(e) => setHistoryEmail(e.target.value)}
                        placeholder="Enter email to search..."
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                      <button 
                        onClick={handleSearchHistory}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                      >
                        Search
                      </button>
                  </div>
              )}
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 {userOrders && userOrders.length > 0 ? (
                     userOrders.map(order => (
                         <div key={order.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <h4 className="font-bold text-slate-900 dark:text-white">{order.serviceName}</h4>
                                     <p className="text-xs text-slate-500">#{order.id.substring(0,8)} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                     {getStatusLabel(order.status)}
                                 </span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="font-mono">{order.currency}{order.price.toFixed(2)}</span>
                                 <div className="flex gap-2">
                                     {order.status === 'pending_whatsapp' && (
                                         <button 
                                            onClick={() => handleUserCancelOrder(order.id)}
                                            className="text-rose-500 hover:underline text-xs"
                                         >
                                             {t('cancel')}
                                         </button>
                                     )}
                                     <button 
                                        onClick={() => handleContactSupport(order)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                     >
                                         <HelpCircle className="h-3 w-3" /> Support
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))
                 ) : userOrders ? (
                     <div className="text-center py-8 text-slate-500">
                         {t('noOrders')}
                     </div>
                 ) : (
                     <div className="text-center py-8 text-slate-500">
                         {currentUser ? 'Loading...' : t('enterEmail')}
                     </div>
                 )}
              </div>
          </div>
      </Modal>

      {/* Legal Documents Modal */}
      <Modal
        isOpen={!!activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
        title={activeLegalDoc ? LEGAL_CONTENT[activeLegalDoc].title : ''}
      >
        <div className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {activeLegalDoc ? LEGAL_CONTENT[activeLegalDoc].content : ''}
        </div>
      </Modal>

      {/* Chat Assistant */}
      {!isAdminMode && (
          <ChatAssistant services={services} categories={categories} />
      )}
    </div>
  );
};

export default App;