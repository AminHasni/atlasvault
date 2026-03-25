import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceCategory, ServiceItem, Category, Order, OrderStatus, User, Review, GlobalSettings, Subcategory, SecondSubcategory, SelectedOption, CartItem } from './types';
import { TRANSLATIONS, LEGAL_CONTENT } from './constants';
import { getServices, addOrder, getOrdersByEmail, getCurrentUser, setCurrentUserSession, getOrdersByUserId, getReviews, getFavorites, toggleFavorite, getCategories, signOutUser, updateService, getGlobalSettings, cancelOrder, getOrders } from './services/storageService';
import { ServiceCard } from './components/ServiceCard';
import { HeroCarousel } from './components/HeroCarousel';
import { FeaturesSection } from './components/FeaturesSection';
import { TrendingSection } from './components/TrendingSection';
import { TrustSection } from './components/TrustSection';
import { NewsletterSection } from './components/NewsletterSection';
import { AdminPanel, AdminTab } from './components/AdminPanel';
import { Modal } from './components/Modal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ReviewSection } from './components/ReviewSection';
import { SettingsPage } from './components/SettingsPage';
import { ChatAssistant } from './components/ChatAssistant';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { LayoutDashboard, ShieldCheck, Shield, Box, Search, ArrowUpDown, Filter, Info, MessageCircle, ShoppingCart, Mail, Phone, FileText, AlertCircle, History, User as UserIcon, ChevronRight, ChevronLeft, ChevronDown, ArrowLeft, Calendar, Banknote, Tag, HelpCircle, X, SlidersHorizontal, Globe, Menu, LogOut, Home, List, Users, BarChart3, Sparkles, ArrowRight, Sun, Moon, Languages, LogIn, Settings, Heart, FolderTree, Flame, Check, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Logo } from './components/Logo';
import * as Icons from 'lucide-react';

type Language = 'en' | 'fr' | 'ar';
type Theme = 'light' | 'dark';

const SidebarLink = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {active && (
      <motion.div
        layoutId="sidebar-active-indicator"
        className="absolute inset-0 rounded-xl bg-indigo-600 -z-10"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
      active ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-100 dark:bg-slate-800/50 group-hover:bg-slate-200 dark:group-hover:bg-slate-800'
    }`}>
      <Icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
    </div>
    <span className="truncate tracking-tight">{label}</span>
    {active && (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="ms-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
      />
    )}
  </motion.button>
);

const App: React.FC = () => {
  // Theme & Language State
  const [theme, setTheme] = useState<Theme>('light');
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
  const [activeSubCategoryPath, setActiveSubCategoryPath] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Dynamic Categories
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
  const [searchScope, setSearchScope] = useState<'all' | 'title' | 'description'>('all');
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [minRating, setMinRating] = useState(0);

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

  // Service Options State
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({ whatsappNumber: '21629292395' });

  // User Preferences State
  const [glassmorphism, setGlassmorphism] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Auth & Profile Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Legal Modal State
  const [activeLegalDoc, setActiveLegalDoc] = useState<keyof typeof LEGAL_CONTENT | null>(null);

  // Dynamic Background Color for Subcategories
  const activeSubCategoryColor = useMemo(() => {
    if (activeSubCategoryPath.length === 0 || isAdminMode) return null;
    
    const CurrentCategoryMeta = categories.find(c => c.id === activeCategory);
    if (!CurrentCategoryMeta) return null;

    const subId = activeSubCategoryPath[0];
    const sub = CurrentCategoryMeta.subcategories?.find(s => s.id === subId);
    if (!sub) return null;

    if (activeSubCategoryPath.length === 1) return sub.color;

    const secondSubId = activeSubCategoryPath[1];
    const secondSub = sub.second_subcategories?.find(ss => ss.id === secondSubId);
    return secondSub?.color || sub.color;
  }, [activeSubCategoryPath, activeCategory, categories, isAdminMode]);

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
        const [servicesData, categoriesData, settingsData, ordersData] = await Promise.all([
            getServices(),
            getCategories(),
            getGlobalSettings(),
            getOrders()
        ]);

        // Compute order counts to determine true popularity
        const orderCounts: Record<string, number> = {};
        ordersData.forEach(order => {
            orderCounts[order.serviceId] = (orderCounts[order.serviceId] || 0) + 1;
        });

        // Update services with actual popularity
        // We multiply order counts by 1000 to ensure actual orders always rank higher than default popularity
        const updatedServices = servicesData.map(service => ({
            ...service,
            popularity: (orderCounts[service.id] || 0) * 1000 + (service.popularity || 0)
        }));

        setServices(updatedServices);
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
    if (currentUser?.role !== 'admin') {
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
      setSelectedOptions([]); // Reset options when service changes
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
       let matchesSearch = true;
       if (q.trim().length > 0) {
         const inTitle = s.name.toLowerCase().includes(q);
         const inDesc = s.description.toLowerCase().includes(q);
         if (searchScope === 'title') matchesSearch = inTitle;
         else if (searchScope === 'description') matchesSearch = inDesc;
         else matchesSearch = inTitle || inDesc;
       }
       
       const isActive = isAdminMode || s.active;

       const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
       const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
       const matchesPrice = s.price >= min && s.price <= max;

       const matchesPromos = !onlyPromos || (s.promoPrice !== undefined && s.promoPrice > 0);

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

       const activeSubCategory = activeSubCategoryPath.length > 0 ? activeSubCategoryPath[activeSubCategoryPath.length - 1] : null;
       const isLevel2 = activeSubCategoryPath.length === 2;
       const activeSubCategoryPath0 = activeSubCategoryPath[0];
       
       let matchesSubCategory = true;
       if (activeSubCategory) {
           if (isLevel2) {
               matchesSubCategory = s.subcategory === activeSubCategoryPath0 && s.second_subcategory_id === activeSubCategory;
           } else {
               matchesSubCategory = s.subcategory === activeSubCategory && !s.second_subcategory_id;
           }
       }

       const matchesFavorites = !showFavoritesOnly || favorites.includes(s.id);

       return matchesCategory && matchesSubCategory && matchesSearch && isActive && matchesPrice && matchesFavorites && matchesPromos;
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
  }, [services, activeCategory, activeSubCategoryPath, isAdminMode, searchQuery, sortOption, searchGlobal, priceRange, favorites, showFavoritesOnly]);

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
    setSelectedOptions([]);
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

    setFormErrors(errors);
    return isValid;
  };

  const handleOptionChange = (optionId: string, optionLabel: string, valueId?: string, valueLabel?: string, textValue?: string, priceModifier: number = 0, isCheckbox: boolean = false) => {
    setSelectedOptions(prev => {
      if (isCheckbox) {
        const existing = prev.find(o => o.optionId === optionId && o.valueId === valueId);
        if (existing) {
          return prev.filter(o => !(o.optionId === optionId && o.valueId === valueId));
        } else {
          return [...prev, { optionId, optionLabel, valueId, valueLabel, priceModifier }];
        }
      } else {
        const filtered = prev.filter(o => o.optionId !== optionId);
        if (valueId || textValue !== undefined) {
          return [...filtered, { optionId, optionLabel, valueId, valueLabel, textValue, priceModifier }];
        }
        return filtered;
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedService) return;

    // Check for required options
    const missingRequired = selectedService.options?.filter(opt => 
      opt.required && !selectedOptions.some(so => so.optionId === opt.id)
    );

    if (missingRequired && missingRequired.length > 0) {
      addToast(`Please select required options: ${missingRequired.map(o => o.label).join(', ')}`, 'error');
      return;
    }

    // Use promo price if available
    const basePrice = (selectedService.promoPrice && selectedService.promoPrice < selectedService.price) 
        ? selectedService.promoPrice 
        : selectedService.price;

    const optionsTotal = selectedOptions.reduce((acc, curr) => acc + curr.priceModifier, 0);
    const finalPrice = basePrice + optionsTotal;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      service: selectedService,
      selectedOptions: [...selectedOptions],
      basePrice,
      optionsTotal,
      finalPrice
    };

    setCart([...cart, newItem]);
    addToast(lang === 'fr' ? 'Ajouté au panier' : lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart', 'success');
    setSelectedService(null);
    setSelectedOptions([]);
  };

  const handleCheckoutViaWhatsApp = async () => {
    if (cart.length === 0) return;
    
    if (!termsAccepted) {
        addToast("Please accept the Terms & Conditions to proceed.", 'error');
        return;
    }

    if (!validateForm()) {
      return;
    }

    const date = new Date().toLocaleDateString();
    const grandTotal = cart.reduce((acc, item) => acc + item.finalPrice, 0);
    const currency = cart[0]?.service.currency || 'TND';

    // Generate IDs and save orders
    for (const item of cart) {
      const newOrderId = crypto.randomUUID();

      const optionsString = item.selectedOptions.map(so => 
        `• ${so.optionLabel}: ${so.valueLabel || so.textValue || 'N/A'}${so.priceModifier !== 0 ? ` (${so.priceModifier > 0 ? '+' : ''}${so.priceModifier} TND)` : ''}`
      ).join('\n');

      const customerInfoString = `Email: ${orderForm.email}\nPhone: ${orderForm.phone}\nDetails: ${orderForm.details}${optionsString ? `\n\nOptions:\n${optionsString}` : ''}`;

      await addOrder({
        id: newOrderId,
        userId: currentUser?.id,
        serviceId: item.service.id,
        serviceName: item.service.name,
        category: item.service.category,
        subcategory: item.service.subcategory,
        price: item.basePrice,
        currency: item.service.currency,
        customerInfo: customerInfoString,
        customerEmail: orderForm.email,
        customerPhone: orderForm.phone,
        status: 'pending_whatsapp',
        createdAt: Date.now(),
        selectedOptions: item.selectedOptions,
        totalPrice: item.finalPrice
      });
    }

    // WhatsApp Message
    let itemsSection = '';
    cart.forEach((item, index) => {
      itemsSection += `\n*${index + 1}. ${item.service.name}* - ${item.finalPrice.toFixed(2)} ${item.service.currency}\n`;
      if (item.selectedOptions.length > 0) {
        itemsSection += item.selectedOptions.map(so => `  ├─ ${so.optionLabel}: ${so.valueLabel || so.textValue || 'N/A'}`).join('\n') + '\n';
      }
    });

    const message = `*ATLASVAULT // ORDER TICKET* 💎\n` +
      `────────────────────\n` +
      `*DATE:* ${date}\n` +
      `*ITEMS:* ${cart.length}\n\n` +
      `*✦ CART SELECTION*\n` +
      itemsSection +
      `\n*GRAND TOTAL:* ${grandTotal.toFixed(2)} ${currency}\n\n` +
      `*✦ CLIENT DATA*\n` +
      `├─ *Email:* ${orderForm.email}\n` +
      `├─ *Phone:* ${orderForm.phone}\n` +
      `└─ *Specs:* ${orderForm.details}\n\n` +
      `────────────────────\n` +
      `*PAYMENT:* 💳 All appropriate payment modes are available.\n` +
      `*STATUS:* 🟡 Awaiting Payment/Activation\n` +
      `_Secure Transmission via AtlasVault_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = globalSettings.whatsappNumber || '21629292395'; 
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    addToast('Order initiated! All payment modes are available via WhatsApp.', 'success');
    window.open(url, '_blank');
    setCart([]);
    setOrderForm({ email: '', phone: '', details: '' });
    setTermsAccepted(false);
    setIsCartOpen(false);
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

      {/* Sidebar Overlay & Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md lg:hidden"
            />

            {/* Sliding Sidebar Panel */}
            <motion.aside 
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className={`fixed inset-y-0 start-0 z-50 flex w-72 flex-col ${glassmorphism ? 'bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl' : 'bg-white dark:bg-[#0B1120]'} border-r border-slate-200/60 dark:border-slate-800/40 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-none lg:shadow-none`}
            >
              {/* Sidebar Header */}
              <div className="flex h-24 shrink-0 items-center gap-4 px-6 border-b border-slate-100 dark:border-slate-800/30">
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30"
                >
                  <Logo className="h-7 w-7 text-white" />
                </motion.div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">AtlasVault</h1>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[0.2em]">
                      {isAdminMode ? t('adminConsole') : t('serviceCatalog')}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="ms-auto p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1 custom-scrollbar">
                {isAdminMode ? (
                  <>
                    <div className="px-4 mb-4 mt-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{t('management')}</p>
                    </div>
                    <div className="space-y-1">
                      <SidebarLink 
                        active={activeAdminTab === 'dashboard'} 
                        onClick={() => setActiveAdminTab('dashboard')} 
                        icon={BarChart3} 
                        label={t('dashboard')} 
                      />
                      <SidebarLink 
                        active={activeAdminTab === 'categories'} 
                        onClick={() => setActiveAdminTab('categories')} 
                        icon={FolderTree} 
                        label={t('categories')} 
                      />
                      <SidebarLink 
                        active={activeAdminTab === 'subcategories'} 
                        onClick={() => setActiveAdminTab('subcategories')} 
                        icon={Icons.Layers} 
                        label={t('subcategories')} 
                      />
                      <SidebarLink 
                        active={activeAdminTab === 'level3_subcategories'} 
                        onClick={() => setActiveAdminTab('level3_subcategories')} 
                        icon={Icons.Network} 
                        label={t('secondSubcategory')} 
                      />
                      <SidebarLink 
                        active={activeAdminTab === 'orders'} 
                        onClick={() => setActiveAdminTab('orders')} 
                        icon={ShoppingCart} 
                        label={t('orders')} 
                      />
                      <SidebarLink 
                        active={activeAdminTab === 'services'} 
                        onClick={() => setActiveAdminTab('services')} 
                        icon={List} 
                        label={t('catalogServices')} 
                      />
                      <SidebarLink 
                        active={activeAdminTab === 'users'} 
                        onClick={() => setActiveAdminTab('users')} 
                        icon={Users} 
                        label={t('userDirectory')} 
                      />
                    </div>
                    
                    <div className="pt-6 px-4">
                      <div className="h-px bg-slate-100 dark:bg-slate-800/30 mb-6" />
                      <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => {
                          setIsAdminMode(false); 
                          setActiveCategory('HOME');
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all"
                      >
                        <ArrowLeft className="h-4 w-4 shrink-0" />
                        <span>{t('exitAdmin')}</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 mb-4 mt-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{t('main')}</p>
                    </div>
                    <div className="space-y-1">
                      <SidebarLink 
                        active={activeCategory === 'HOME' && !showFavoritesOnly} 
                        onClick={() => {
                          setActiveCategory('HOME');
                          setActiveSubCategoryPath([]);
                          setSearchQuery('');
                          setShowFavoritesOnly(false);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }} 
                        icon={Home} 
                        label={t('home')} 
                      />
                      <SidebarLink 
                        active={activeCategory === 'ALL_CATEGORIES'} 
                        onClick={() => {
                          setActiveCategory('ALL_CATEGORIES');
                          setActiveSubCategoryPath([]);
                          setSearchQuery('');
                          setShowFavoritesOnly(false);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }} 
                        icon={Icons.LayoutGrid} 
                        label={t('categories')} 
                      />
                    </div>

                    <div className="my-8 px-4">
                      <div className="h-px bg-slate-100 dark:bg-slate-800/30" />
                    </div>

                    <div className="space-y-1">
                      <SidebarLink 
                        active={showFavoritesOnly} 
                        onClick={() => {
                          setShowFavoritesOnly(true);
                          setActiveCategory('HOME');
                          setActiveSubCategoryPath([]);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }} 
                        icon={Heart} 
                        label={t('myFavorites')} 
                      />
                      <SidebarLink 
                        active={isHistoryOpen} 
                        onClick={() => {
                          setIsHistoryOpen(true);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }} 
                        icon={History} 
                        label={t('myOrders')} 
                      />
                      <SidebarLink 
                        active={isCartOpen} 
                        onClick={() => {
                          setIsCartOpen(true);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }} 
                        icon={ShoppingCart} 
                        label={lang === 'fr' ? 'Mon Panier' : lang === 'ar' ? 'سلة التسوق' : 'My Cart'} 
                      />
                      <SidebarLink 
                        active={activeCategory === 'SETTINGS'} 
                        onClick={() => {
                          setActiveCategory('SETTINGS');
                          setActiveSubCategoryPath([]);
                          setShowFavoritesOnly(false);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }} 
                        icon={Settings} 
                        label={t('settings')} 
                      />
                    </div>
                  </>
                )}
              </nav>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800/30 bg-slate-50/50 dark:bg-slate-900/40">
                {currentUser ? (
                  <div className="space-y-5">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setIsProfileOpen(true)}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 shadow-sm cursor-pointer hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{currentUser.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-1 uppercase tracking-wider">{currentUser.role}</p>
                      </div>
                      <ChevronRight className="ms-auto h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                    </motion.div>
                    
                    {currentUser.role === 'admin' && !isAdminMode && !isHomeView && (
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsAdminMode(true);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-3 rounded-xl bg-slate-900 dark:bg-white py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                      >
                        <Shield className="h-4 w-4 text-indigo-500" />
                        <span>{t('adminConsole')}</span>
                      </motion.button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800/30 p-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>{t('profile')}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 p-3 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t('logOut')}</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('login')}</span>
                  </motion.button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Admin Quick Access Floating Button */}
      <AnimatePresence>
        {currentUser?.role === 'admin' && !isAdminMode && !isHomeView && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdminMode(true)}
            className={`fixed bottom-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-white/10 border border-slate-800 dark:border-slate-200 ${lang === 'ar' ? 'left-8' : 'right-8'}`}
          >
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            {t('adminConsole')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle Button (Hamburger) - Positioned at top-left */}
      
      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-500 ${isSidebarOpen ? 'lg:ms-72' : 'ms-0'}`}>
          {/* Header */}
          <header className={`h-16 border-b border-slate-200/60 dark:border-slate-800/40 ${glassmorphism ? 'bg-white/80 dark:bg-nexus-900/80 backdrop-blur-md' : 'bg-white dark:bg-nexus-900'} flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0`}>
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`group relative p-2.5 rounded-xl transition-all duration-300 border flex items-center justify-center ${
                    isSidebarOpen 
                      ? 'text-indigo-600 border-indigo-200 bg-indigo-50/50 dark:text-indigo-400 dark:border-indigo-500/20 dark:bg-indigo-500/10' 
                      : 'text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  aria-label="Toggle Sidebar"
                >
                  <div className="relative h-6 w-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isSidebarOpen ? 'open' : 'closed'}
                        initial={{ opacity: 0, rotate: isSidebarOpen ? -90 : 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: isSidebarOpen ? 90 : -90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: "backOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {isSidebarOpen ? <PanelLeftClose className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Sleek Tooltip */}
                  <div className={`absolute top-full mt-3 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-2xl z-50 border border-slate-800 dark:border-slate-700 ${lang === 'ar' ? 'right-0' : 'left-0'}`}>
                    {isSidebarOpen ? t('collapse') : t('expand')}
                    <div className={`absolute -top-1 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-t border-slate-800 dark:border-slate-700 ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
                  </div>
                </motion.button>

                {/* Mobile Logo (only visible when sidebar is closed) */}
                {!isSidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 lg:hidden"
                  >
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Logo className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-sm tracking-tight dark:text-white">AtlasVault</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                 {/* Cart Button */}
                 <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 rounded-xl transition-all"
                 >
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/30 border-2 border-white dark:border-nexus-900"
                        >
                            {cart.length}
                        </motion.span>
                    )}
                 </motion.button>

                 {/* Language Selector */}
                 <div className="relative">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-bold transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <span className="text-lg leading-none">{currentLangObj.flag}</span>
                        <span className="hidden sm:inline uppercase tracking-wider text-xs">{currentLangObj.code}</span>
                        <ChevronDown className={`h-3.5 w-3.5 opacity-50 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </motion.button>
                    <AnimatePresence>
                      {isLangMenuOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 py-2 overflow-hidden z-50"
                          >
                              {languages.map(l => (
                                  <button
                                      key={l.code}
                                      onClick={() => { setLang(l.code as any); setIsLangMenuOpen(false); }}
                                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${lang === l.code ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                                  >
                                      <span className="text-lg leading-none">{l.flag}</span>
                                      <span className="flex-1 text-start">{l.label}</span>
                                      {lang === l.code && <Check className="h-4 w-4" />}
                                  </button>
                              ))}
                          </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                 >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                 </button>
              </div>
          </header>

          <motion.div 
            animate={{ 
              backgroundColor: activeSubCategoryColor 
                ? (theme === 'dark' ? 'rgba(11, 17, 32, 0.98)' : 'rgba(255, 255, 255, 0.98)') 
                : (theme === 'dark' ? 'rgba(15, 23, 42, 1)' : 'rgba(248, 250, 252, 1)')
            }}
            className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative"
          >
              {/* Dynamic Background Overlay - Immersive Atmosphere */}
              <AnimatePresence>
                {activeSubCategoryColor && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                  >
                    {/* Base Tint */}
                    <div className={`absolute inset-0 ${activeSubCategoryColor.replace('text-', 'bg-').replace('500', '500/10')} dark:${activeSubCategoryColor.replace('text-', 'bg-').replace('500', '500/20')}`} />
                    
                    {/* Atmospheric Glows */}
                    <div className={`absolute -top-48 -right-48 w-[600px] h-[600px] blur-[150px] rounded-full opacity-30 dark:opacity-40 ${activeSubCategoryColor.replace('text-', 'bg-')}`} />
                    <div className={`absolute top-1/3 -left-48 w-[400px] h-[400px] blur-[120px] rounded-full opacity-20 dark:opacity-30 ${activeSubCategoryColor.replace('text-', 'bg-')}`} />
                    <div className={`absolute -bottom-48 right-1/4 w-[500px] h-[500px] blur-[140px] rounded-full opacity-15 dark:opacity-25 ${activeSubCategoryColor.replace('text-', 'bg-')}`} />
                    
                    {/* Subtle Gradient Overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 dark:to-black/20" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex-1 ${compactMode ? 'p-3 sm:p-4 lg:p-6' : 'p-4 sm:p-6 lg:p-8'} relative z-10`}>
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
                    glassmorphism={glassmorphism}
                    setGlassmorphism={setGlassmorphism}
                    compactMode={compactMode}
                    setCompactMode={setCompactMode}
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
                                className={`flex items-center justify-center gap-2 px-4 h-12 rounded-xl border font-bold transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600'}`}
                              >
                                <SlidersHorizontal className="h-5 w-5" />
                                <span className="hidden sm:inline">{t('filters')}</span>
                                {showFilters ? <ChevronDown className="h-4 w-4 rotate-180 transition-transform" /> : <ChevronDown className="h-4 w-4 transition-transform" />}
                              </button>
                          </div>
                          
                          {/* Expanded Filters */}
                          <AnimatePresence>
                              {showFilters && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                  >
                                      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl relative">
                                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                              <SlidersHorizontal className="h-24 w-24" />
                                          </div>

                                          <div className="relative z-10 space-y-6">
                                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                  {/* Sort */}
                                                  <div className="space-y-2">
                                                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                          <ArrowUpDown className="h-3 w-3" />
                                                          {t('sortBy')}
                                                      </label>
                                                      <select 
                                                        value={sortOption}
                                                        onChange={(e) => setSortOption(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                      >
                                                          <option value="newest">{t('newest')}</option>
                                                          <option value="popularity-desc">{t('popularity')}</option>
                                                          <option value="price-asc">{t('price')} (Low to High)</option>
                                                          <option value="price-desc">{t('price')} (High to Low)</option>
                                                          <option value="name-asc">{t('nameAz')}</option>
                                                      </select>
                                                  </div>

                                                  {/* Search Scope */}
                                                  <div className="space-y-2">
                                                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                          <Search className="h-3 w-3" />
                                                          {t('searchScope')}
                                                      </label>
                                                      <select 
                                                        value={searchScope}
                                                        onChange={(e) => setSearchScope(e.target.value as any)}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                      >
                                                          <option value="all">{t('both')}</option>
                                                          <option value="title">{t('titleOnly')}</option>
                                                          <option value="description">{t('descriptionOnly')}</option>
                                                      </select>
                                                  </div>

                                                  {/* Price Range */}
                                                  <div className="space-y-2">
                                                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                          <Banknote className="h-3 w-3" />
                                                          {t('priceRange')}
                                                      </label>
                                                      <div className="flex items-center gap-2">
                                                          <input 
                                                            type="number" 
                                                            placeholder="Min" 
                                                            value={priceRange.min}
                                                            onChange={(e) => setPriceRange(prev => ({...prev, min: e.target.value}))}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                          />
                                                          <span className="text-slate-400">-</span>
                                                          <input 
                                                            type="number" 
                                                            placeholder="Max" 
                                                            value={priceRange.max}
                                                            onChange={(e) => setPriceRange(prev => ({...prev, max: e.target.value}))}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                          />
                                                      </div>
                                                  </div>

                                                  {/* Subcategory Filter (Contextual) */}
                                                  {CurrentCategoryMeta && CurrentCategoryMeta.subcategories && CurrentCategoryMeta.subcategories.length > 0 && (
                                                      <div className="space-y-2">
                                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                              <FolderTree className="h-3 w-3" />
                                                              {t('subcategory')}
                                                          </label>
                                                          <select 
                                                            value={activeSubCategoryPath.length > 0 ? activeSubCategoryPath[activeSubCategoryPath.length - 1] : ''}
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setActiveSubCategoryPath([e.target.value]);
                                                                } else {
                                                                    setActiveSubCategoryPath([]);
                                                                }
                                                            }}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
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

                                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                  <div className="flex items-center gap-6">
                                                      <label className="flex items-center gap-3 cursor-pointer group">
                                                          <div className="relative">
                                                              <input 
                                                                  type="checkbox" 
                                                                  checked={onlyPromos}
                                                                  onChange={(e) => setOnlyPromos(e.target.checked)}
                                                                  className="sr-only peer"
                                                              />
                                                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                                          </div>
                                                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{t('onlyPromos')}</span>
                                                      </label>

                                                      <label className="flex items-center gap-3 cursor-pointer group">
                                                          <div className="relative">
                                                              <input 
                                                                  type="checkbox" 
                                                                  checked={showFavoritesOnly}
                                                                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                                                  className="sr-only peer"
                                                              />
                                                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-500"></div>
                                                          </div>
                                                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-rose-500 transition-colors">{t('myFavorites')}</span>
                                                      </label>
                                                  </div>

                                                  <button 
                                                      onClick={() => {
                                                          setSearchQuery('');
                                                          setPriceRange({ min: '', max: '' });
                                                          setSortOption('newest');
                                                          setSearchScope('all');
                                                          setOnlyPromos(false);
                                                          setShowFavoritesOnly(false);
                                                      }}
                                                      className="px-6 py-2.5 text-sm font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all flex items-center gap-2"
                                                  >
                                                      <X className="h-4 w-4" />
                                                      {t('clearFilters')}
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>

                      {/* Services Grid */}
                      <div id="catalog-start">
                          {/* ALL CATEGORIES VIEW */}
                          {activeCategory === 'ALL_CATEGORIES' && (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8"
                              >
                                  <div className="mb-8">
                                      <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                                          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                                            <Icons.LayoutGrid className="h-8 w-8" />
                                          </div>
                                          {t('categories')}
                                      </h2>
                                      <p className="text-slate-500 dark:text-slate-400 text-lg mt-3 max-w-2xl">
                                          Explore our wide range of digital services and products, organized to help you find exactly what you need.
                                      </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                      {categories.map((cat, idx) => {
                                          const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
                                          const label = lang === 'fr' ? (cat.label_fr || cat.label) : (lang === 'ar' ? (cat.label_ar || cat.label) : cat.label);
                                          const desc = lang === 'fr' ? (cat.desc_fr || cat.desc) : (lang === 'ar' ? (cat.desc_ar || cat.desc) : cat.desc);
                                          
                                          return (
                                              <motion.button
                                                  key={cat.id}
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                                  onClick={() => {
                                                      setActiveCategory(cat.id);
                                                      setActiveSubCategoryPath([]);
                                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                                  }}
                                                  className="flex flex-col items-start p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group text-left h-full relative overflow-hidden"
                                              >
                                                  {/* Decorative background element */}
                                                  <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${cat.color.replace('text-', 'bg-')}`}></div>
                                                  
                                                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 duration-300 ${cat.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-10`}>
                                                      <IconComponent className={`h-7 w-7 ${cat.color}`} />
                                                  </div>
                                                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                      {label}
                                                  </h3>
                                                  <p className="text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                                                      {desc}
                                                  </p>
                                                  <div className="mt-auto flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                                                      {t('explore') || 'Explore'} <ArrowRight className="h-4 w-4" />
                                                  </div>
                                              </motion.button>
                                          );
                                      })}
                                  </div>
                              </motion.div>
                          )}

                          {CurrentCategoryMeta && !searchQuery && !showFavoritesOnly && activeCategory !== 'ALL_CATEGORIES' && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="mb-12"
                              >
                                  {/* Breadcrumbs */}
                                  <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                                      <button 
                                        onClick={() => {
                                            setActiveCategory('ALL_CATEGORIES');
                                            setActiveSubCategoryPath([]);
                                        }}
                                        className="hover:text-indigo-600 transition-colors flex items-center gap-1"
                                      >
                                          <Icons.Home className="h-3.5 w-3.5" />
                                          {t('home') || 'Home'}
                                      </button>
                                      <ChevronRight className="h-3 w-3 opacity-50" />
                                      <button 
                                        onClick={() => setActiveSubCategoryPath([])}
                                        className={`${activeSubCategoryPath.length === 0 ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'} transition-colors`}
                                      >
                                          {lang === 'fr' ? (CurrentCategoryMeta.label_fr || CurrentCategoryMeta.label) : (lang === 'ar' ? (CurrentCategoryMeta.label_ar || CurrentCategoryMeta.label) : CurrentCategoryMeta.label)}
                                      </button>
                                      
                                      {activeSubCategoryPath.map((pathId, idx) => {
                                          let label = '';
                                          if (idx === 0) {
                                              const sub = CurrentCategoryMeta.subcategories?.find(s => s.id === pathId);
                                              label = sub ? (lang === 'fr' ? (sub.label_fr || sub.label) : (lang === 'ar' ? (sub.label_ar || sub.label) : sub.label)) : '';
                                          } else if (idx === 1) {
                                              const parentSub = CurrentCategoryMeta.subcategories?.find(s => s.id === activeSubCategoryPath[0]);
                                              const sub = parentSub?.second_subcategories?.find(ss => ss.id === pathId);
                                              label = sub ? (lang === 'fr' ? (sub.label_fr || sub.label) : (lang === 'ar' ? (sub.label_ar || sub.label) : sub.label)) : '';
                                          }
                                          
                                          return (
                                              <React.Fragment key={pathId}>
                                                  <ChevronRight className="h-3 w-3 opacity-50" />
                                                  <button 
                                                    onClick={() => setActiveSubCategoryPath(activeSubCategoryPath.slice(0, idx + 1))}
                                                    className={`${idx === activeSubCategoryPath.length - 1 ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'} transition-colors`}
                                                  >
                                                      {label}
                                                  </button>
                                              </React.Fragment>
                                          );
                                      })}
                                  </nav>

                                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                                      <div className="space-y-3">
                                          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                                              {(() => {
                                                  const Icon = (Icons as any)[CurrentCategoryMeta.icon] || Icons.Box;
                                                  return (
                                                    <div className={`p-3 rounded-2xl ${CurrentCategoryMeta.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-10`}>
                                                        <Icon className={`h-8 w-8 ${CurrentCategoryMeta.color}`} />
                                                    </div>
                                                  );
                                              })()}
                                              {lang === 'fr' ? (CurrentCategoryMeta.label_fr || CurrentCategoryMeta.label) : (lang === 'ar' ? (CurrentCategoryMeta.label_ar || CurrentCategoryMeta.label) : CurrentCategoryMeta.label)}
                                          </h2>
                                          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
                                              {lang === 'fr' ? (CurrentCategoryMeta.desc_fr || CurrentCategoryMeta.desc) : (lang === 'ar' ? (CurrentCategoryMeta.desc_ar || CurrentCategoryMeta.desc) : CurrentCategoryMeta.desc)}
                                          </p>
                                      </div>
                                  </div>

                                  {/* Subcategories List */}
                                  {(() => {
                                      let currentSubs: (Subcategory | SecondSubcategory)[] = CurrentCategoryMeta?.subcategories || [];
                                      let currentSubMeta: Subcategory | SecondSubcategory | null = null;
                                      
                                      // Drill down through the path
                                      if (activeSubCategoryPath.length > 0) {
                                          const subId = activeSubCategoryPath[0];
                                          const found = (CurrentCategoryMeta?.subcategories || []).find(s => s.id === subId);
                                          if (found) {
                                              currentSubMeta = found;
                                              currentSubs = found.second_subcategories || [];
                                              
                                              if (activeSubCategoryPath.length > 1) {
                                                  const secondSubId = activeSubCategoryPath[1];
                                                  const foundSecond = (found.second_subcategories || []).find(ss => ss.id === secondSubId);
                                                  if (foundSecond) {
                                                      currentSubMeta = foundSecond;
                                                      currentSubs = []; // No more levels
                                                  }
                                              }
                                          }
                                      }

                                      return (
                                          <AnimatePresence mode="wait">
                                              <motion.div
                                                key={activeSubCategoryPath.join('-')}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                              >
                                                  {currentSubs.length > 0 ? (
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                                          {currentSubs.map((sub, idx) => {
                                                              const subLabel = lang === 'fr' ? (sub.label_fr || sub.label) : (lang === 'ar' ? (sub.label_ar || sub.label) : sub.label);
                                                              return (
                                                                  <motion.button
                                                                      key={sub.id}
                                                                      initial={{ opacity: 0, scale: 0.95 }}
                                                                      animate={{ opacity: 1, scale: 1 }}
                                                                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                                                                      whileHover={{ y: -5 }}
                                                                      onClick={() => setActiveSubCategoryPath([...activeSubCategoryPath, sub.id])}
                                                                      className="relative flex flex-col items-center p-0 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all group text-center h-full overflow-hidden"
                                                                  >
                                                                      {/* Image/Icon Area */}
                                                                      <div className={`w-full h-40 relative overflow-hidden flex items-center justify-center ${sub.color ? sub.color.replace('text-', 'bg-').replace('500', '500/10') : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                                          {/* Abstract background pattern inspired by color */}
                                                                          <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${sub.color ? `from-${sub.color.replace('text-', '').replace('-500', '')}-400 via-transparent to-transparent` : 'from-slate-400 via-transparent to-transparent'}`}></div>
                                                                          
                                                                          {(() => {
                                                                              const SubIcon = (Icons as any)[sub.icon || 'Box'] || Icons.Box;
                                                                              return <SubIcon className={`h-16 w-16 relative z-10 group-hover:scale-110 transition-transform duration-500 ${sub.color || 'text-slate-500'}`} />;
                                                                          })()}
                                                                          
                                                                          {(() => {
                                                                              const subServiceCount = services.filter(s => 
                                                                                  s.active && (
                                                                                      activeSubCategoryPath.length === 0 
                                                                                      ? (s.subcategory === sub.id && !s.second_subcategory_id) 
                                                                                      : s.second_subcategory_id === sub.id
                                                                                  )
                                                                              ).length;
                                                                              return subServiceCount > 0 ? (
                                                                                  <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20">
                                                                                      {subServiceCount} {subServiceCount === 1 ? 'Service' : 'Services'}
                                                                                  </div>
                                                                              ) : null;
                                                                          })()}
                                                                          
                                                                          {sub.fee !== undefined && sub.fee > 0 && (
                                                                              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 shadow-lg border border-white/20 z-20">
                                                                                  Fee: {sub.fee}%
                                                                              </div>
                                                                          )}
                                                                      </div>
                                                                      
                                                                      {/* Content Area */}
                                                                      <div className="p-6 flex flex-col items-center w-full flex-1">
                                                                          <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{subLabel}</span>
                                                                          {/* Subcategory Description */}
                                                                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 px-1 leading-relaxed">
                                                                              {lang === 'fr' ? (sub.desc_fr || sub.desc) : (lang === 'ar' ? (sub.desc_ar || sub.desc) : sub.desc)}
                                                                          </p>
                                                                      </div>
                                                                  </motion.button>
                                                              );
                                                          })}
                                                      </div>
                                                  ) : null}

                                                  {/* Active Subcategory Header & Back Button */}
                                                  {activeSubCategoryPath.length > 0 && (
                                                      <div className="flex flex-col gap-6 mt-10 mb-6">
                                                          <div className="flex items-center gap-4">
                                                              <button 
                                                                  onClick={() => setActiveSubCategoryPath(activeSubCategoryPath.slice(0, -1))}
                                                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                                              >
                                                                  <ArrowLeft className="h-4 w-4" />
                                                                  {t('back') || 'Back'}
                                                              </button>
                                                              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                              <div className="flex flex-col">
                                                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                                      {activeSubCategoryPath.length === 1 ? t('subcategory') : t('secondSubcategory') || 'Level 2 Subcategory'}
                                                                  </span>
                                                                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                                                      {currentSubMeta ? (lang === 'fr' ? (currentSubMeta.label_fr || currentSubMeta.label) : (lang === 'ar' ? (currentSubMeta.label_ar || currentSubMeta.label) : currentSubMeta.label)) : ''}
                                                                  </span>
                                                              </div>
                                                          </div>
                                                          
                                                          {/* Fee Explanation Section */}
                                                          {currentSubMeta && currentSubMeta.fee !== undefined && currentSubMeta.fee > 0 && (
                                                              <motion.div 
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border-l-8 border-amber-400 text-white shadow-2xl relative overflow-hidden"
                                                              >
                                                                  <div className="absolute top-0 right-0 p-8 opacity-10">
                                                                      <Icons.Info className="h-32 w-32" />
                                                                  </div>
                                                                  <div className="relative z-10">
                                                                      <h3 className="font-black text-2xl mb-4 flex items-center gap-3">
                                                                          <Icons.AlertCircle className="h-6 w-6 text-amber-400" />
                                                                          Important: Payment Fees
                                                                      </h3>
                                                                      <p className="text-slate-300 text-lg mb-6 max-w-2xl">
                                                                          To provide the best service, we apply a small processing fee depending on your chosen payment method.
                                                                      </p>
                                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                                          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                                              <span className="block text-xs font-bold text-amber-400 uppercase mb-1">D17 / Sobflous</span>
                                                                              <span className="text-xl font-bold">Fee: {currentSubMeta.fee}%</span>
                                                                          </div>
                                                                          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                                              <span className="block text-xs font-bold text-indigo-400 uppercase mb-1">Bank Transfer</span>
                                                                              <span className="text-xl font-bold">Fee: 0%</span>
                                                                          </div>
                                                                      </div>
                                                                      <div className="flex items-center gap-2 text-sm text-slate-400 italic">
                                                                          <Icons.Check className="h-4 w-4 text-emerald-500" />
                                                                          Fees are automatically calculated at checkout.
                                                                      </div>
                                                                  </div>
                                                              </motion.div>
                                                          )}
                                                      </div>
                                                  )}
                                              </motion.div>
                                          </AnimatePresence>
                                      );
                                    })()}
                              </motion.div>
                          )}

                          {/* Services Grid - Only show if subcategory is selected OR category has no subcategories OR searching/favorites */}
                          {activeCategory !== 'ALL_CATEGORIES' && (activeSubCategoryPath.length > 0 || (CurrentCategoryMeta && !CurrentCategoryMeta.subcategories?.length) || searchQuery || showFavoritesOnly) && (
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
                                                    lang={lang}
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                  ) : (activeSubCategoryPath.length === 2 || (CurrentCategoryMeta && !CurrentCategoryMeta.subcategories?.length) || searchQuery || showFavoritesOnly) ? (
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
                                  ) : null}
                              </>
                          )}
                      </div>
                      
                      {/* Trending & Features (Home View Only) */}
                      {isHomeView && !showFavoritesOnly && (
                          <div className="mt-16 space-y-16">
                              <TrendingSection 
                                  services={services}
                                  lang={lang}
                                  t={t}
                                  onSelectService={handleServiceClick}
                                  favorites={favorites}
                                  onToggleFavorite={handleToggleFavorite}
                              />
                              <TrustSection lang={lang} />
                              <FeaturesSection lang={lang} />
                              <NewsletterSection lang={lang} />
                          </div>
                      )}
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
          </motion.div>
      </main>

      {/* Modals */}
      <Modal 
         isOpen={!!selectedService} 
         onClose={() => setSelectedService(null)}
         title={selectedService?.name || 'Service Details'}
         maxWidth="max-w-4xl"
      >
         {selectedService && (
             <div className="space-y-6">
                 {/* Service Modal Content ... */}
                 <div className="flex flex-col md:flex-row gap-6">
                     <div className="flex-1 space-y-6">
                         <div>
                             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">{selectedService.name}</h3>
                             <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">{selectedService.description}</p>
                         </div>
                         
                         <div className="flex flex-wrap gap-2">
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                 {selectedService.category}
                             </span>
                             {selectedService.badgeLabel && (
                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                                     {selectedService.badgeLabel}
                                 </span>
                             )}
                         </div>

                          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 space-y-5 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-start gap-4">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                      <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('conditions')}</p>
                                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{selectedService.conditions}</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-4">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                      <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('requirements')}</p>
                                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{selectedService.requiredInfo}</p>
                                  </div>
                              </div>
                          </div>

                          {/* Options Rendering */}
                          {selectedService.options && selectedService.options.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                                    {lang === 'fr' ? 'Options de Service' : lang === 'ar' ? 'خيارات الخدمة' : 'Service Options'}
                                </h4>
                                <div className="space-y-4">
                                    {selectedService.options.map(option => (
                                        <div key={option.id} className="space-y-2">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                                                {lang === 'fr' ? (option.label_fr || option.label) : lang === 'ar' ? (option.label_ar || option.label) : option.label}
                                                {option.required && <span className="text-rose-500 ml-1">*</span>}
                                            </label>
                                            
                                            {option.type === 'select' && (
                                                <select 
                                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                                    value={selectedOptions.find(so => so.optionId === option.id)?.valueId || ''}
                                                    onChange={(e) => {
                                                        const val = option.values?.find(v => v.id === e.target.value);
                                                        handleOptionChange(
                                                            option.id, 
                                                            lang === 'fr' ? (option.label_fr || option.label) : lang === 'ar' ? (option.label_ar || option.label) : option.label,
                                                            val?.id,
                                                            val ? (lang === 'fr' ? (val.label_fr || val.label) : lang === 'ar' ? (val.label_ar || val.label) : val.label) : '',
                                                            undefined,
                                                            val?.priceModifier || 0
                                                        );
                                                    }}
                                                >
                                                    <option value="">{lang === 'fr' ? 'Choisir une option...' : lang === 'ar' ? 'اختر خياراً...' : 'Select an option...'}</option>
                                                    {option.values?.map(val => (
                                                        <option key={val.id} value={val.id}>
                                                            {lang === 'fr' ? (val.label_fr || val.label) : lang === 'ar' ? (val.label_ar || val.label) : val.label} 
                                                            {val.priceModifier !== 0 && ` (${val.priceModifier > 0 ? '+' : ''}${val.priceModifier} TND)`}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {option.type === 'checkbox' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {option.values?.map(val => {
                                                        const isSelected = selectedOptions.some(so => so.optionId === option.id && so.valueId === val.id);
                                                        return (
                                                            <button
                                                                key={val.id}
                                                                type="button"
                                                                onClick={() => handleOptionChange(
                                                                    option.id,
                                                                    lang === 'fr' ? (option.label_fr || option.label) : lang === 'ar' ? (option.label_ar || option.label) : option.label,
                                                                    val.id,
                                                                    lang === 'fr' ? (val.label_fr || val.label) : lang === 'ar' ? (val.label_ar || val.label) : val.label,
                                                                    undefined,
                                                                    val.priceModifier,
                                                                    true
                                                                )}
                                                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-left ${
                                                                    isSelected 
                                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                                                }`}
                                                            >
                                                                <span className="text-xs font-bold">{lang === 'fr' ? (val.label_fr || val.label) : lang === 'ar' ? (val.label_ar || val.label) : val.label}</span>
                                                                {val.priceModifier !== 0 && (
                                                                    <span className="text-[10px] font-black opacity-60">
                                                                        {val.priceModifier > 0 ? '+' : ''}{val.priceModifier}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {option.type === 'pricing-table' && (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {option.values?.map((val, idx) => {
                                                        const isSelected = selectedOptions.some(so => so.optionId === option.id && so.valueId === val.id);
                                                        const basePrice = (selectedService.promoPrice && selectedService.promoPrice < selectedService.price) 
                                                            ? selectedService.promoPrice 
                                                            : selectedService.price;
                                                        const totalPrice = basePrice + val.priceModifier;
                                                        
                                                        return (
                                                            <motion.button
                                                                key={val.id}
                                                                whileHover={{ scale: 1.01 }}
                                                                whileTap={{ scale: 0.99 }}
                                                                onClick={() => handleOptionChange(
                                                                    option.id,
                                                                    lang === 'fr' ? (option.label_fr || option.label) : lang === 'ar' ? (option.label_ar || option.label) : option.label,
                                                                    val.id,
                                                                    lang === 'fr' ? (val.label_fr || val.label) : lang === 'ar' ? (val.label_ar || val.label) : val.label,
                                                                    undefined,
                                                                    val.priceModifier
                                                                )}
                                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group ${
                                                                    isSelected 
                                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10' 
                                                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                        isSelected 
                                                                        ? 'border-indigo-600 bg-indigo-600' 
                                                                        : 'border-slate-200 dark:border-slate-700'
                                                                    }`}>
                                                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                                                    </div>
                                                                    <div>
                                                                        <span className={`block text-sm font-black transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                                                                            {lang === 'fr' ? (val.label_fr || val.label) : lang === 'ar' ? (val.label_ar || val.label) : val.label}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`block text-lg font-black ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                                                        {totalPrice.toFixed(0)} {selectedService.currency}
                                                                    </span>
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {option.type === 'text' && (
                                                <input 
                                                    type="text"
                                                    placeholder={lang === 'fr' ? 'Saisir ici...' : lang === 'ar' ? 'اكتب هنا...' : 'Type here...'}
                                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    value={selectedOptions.find(so => so.optionId === option.id)?.textValue || ''}
                                                    onChange={(e) => handleOptionChange(
                                                        option.id,
                                                        lang === 'fr' ? (option.label_fr || option.label) : lang === 'ar' ? (option.label_ar || option.label) : option.label,
                                                        undefined,
                                                        undefined,
                                                        e.target.value,
                                                        0
                                                    )}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                          )}
                     </div>

                     <div className="md:w-80 shrink-0">
                         <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm sticky top-6">
                             <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">{t('price')}</p>
                             <div className="flex items-baseline gap-2 mb-6">
                                 <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                     {selectedService.currency}{(
                                          (() => {
                                              const base = (selectedService.promoPrice && selectedService.promoPrice < selectedService.price) 
                                                ? selectedService.promoPrice 
                                                : selectedService.price;
                                              return base + selectedOptions.reduce((acc, curr) => acc + curr.priceModifier, 0);
                                          })()
                                       ).toFixed(2)}
                                 </span>
                                 {selectedService.promoPrice && selectedService.promoPrice < selectedService.price && (
                                     <span className="text-sm font-medium text-slate-400 line-through">
                                         {selectedService.currency}{selectedService.price.toFixed(2)}
                                     </span>
                                 )}
                             </div>

                             {selectedOptions.length > 0 && (
                                 <div className="mb-6 space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'fr' ? 'Options sélectionnées' : lang === 'ar' ? 'الخيارات المختارة' : 'Selected Options'}</p>
                                     <div className="space-y-1.5">
                                         {selectedOptions.map((so, idx) => (
                                             <div key={idx} className="flex justify-between items-start gap-2 text-xs">
                                                 <span className="text-slate-500 dark:text-slate-400 font-medium">{so.optionLabel}:</span>
                                                 <span className="text-slate-900 dark:text-white font-bold text-right">{so.valueLabel || so.textValue}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                             <button 
                                 onClick={handleAddToCart}
                                 className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 cursor-pointer"
                             >
                                 <ShoppingCart className="h-5 w-5" />
                                 {lang === 'fr' ? 'Ajouter au panier' : lang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
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
                onAdminClick={() => {
                   setIsAdminMode(true);
                   setIsProfileOpen(false);
                   if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
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
                                 <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{order.currency}{(order.totalPrice || order.price).toFixed(2)}</span>
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
                             {order.selectedOptions && order.selectedOptions.length > 0 && (
                                 <div className="mt-2 flex flex-wrap gap-1">
                                     {order.selectedOptions.map((opt, idx) => (
                                         <span key={idx} className="text-[10px] bg-white/50 dark:bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                                             {opt.optionLabel}: {opt.valueLabel || opt.textValue}
                                         </span>
                                     ))}
                                 </div>
                             )}
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

      {/* Cart Modal */}
      <Modal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          title={lang === 'fr' ? 'Votre Panier' : lang === 'ar' ? 'سلة التسوق' : 'Your Cart'}
      >
          <div className="space-y-6">
              {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-3">
                      <ShoppingCart className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                      <p>{lang === 'fr' ? 'Votre panier est vide' : lang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</p>
                  </div>
              ) : (
                  <>
                      <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                          {cart.map((item, index) => (
                              <div key={index} className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative group">
                                  <button 
                                      onClick={() => setCart(cart.filter((_, i) => i !== index))}
                                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                      <X className="h-4 w-4" />
                                  </button>
                                  <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0 text-3xl shadow-sm">
                                      {item.service.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-slate-900 dark:text-white truncate pr-6">{item.service.title}</h4>
                                      <div className="flex items-baseline gap-2 mt-1">
                                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                              {item.service.currency}{item.finalPrice.toFixed(2)}
                                          </span>
                                      </div>
                                      {item.selectedOptions.length > 0 && (
                                          <div className="mt-2 space-y-1">
                                              {item.selectedOptions.map((opt, idx) => (
                                                  <div key={idx} className="text-[10px] flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                      <span className="font-medium">{opt.optionLabel}:</span>
                                                      <span className="text-slate-700 dark:text-slate-300">{opt.valueLabel || opt.textValue}</span>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                          <div className="flex justify-between items-center mb-6">
                              <span className="text-slate-500 font-medium">{lang === 'fr' ? 'Total' : lang === 'ar' ? 'المجموع' : 'Total'}</span>
                              <span className="text-2xl font-black text-slate-900 dark:text-white">
                                  {cart[0]?.service.currency || 'TND'}
                                  {cart.reduce((sum, item) => sum + item.finalPrice, 0).toFixed(2)}
                              </span>
                          </div>

                          <div className="space-y-3 mb-6">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                                  {lang === 'fr' ? 'Vos coordonnées' : lang === 'ar' ? 'معلوماتك' : 'Your Details'}
                              </h4>
                              <div>
                                  <input 
                                      type="email"
                                      name="email" 
                                      placeholder={t('email')}
                                      value={orderForm.email}
                                      onChange={handleInputChange}
                                      className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white ${formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                  />
                                  {formErrors.email && <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>}
                              </div>
                              <div>
                                  <input 
                                      type="tel" 
                                      name="phone"
                                      placeholder={t('phone')}
                                      value={orderForm.phone}
                                      onChange={handleInputChange}
                                      className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white ${formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                  />
                                  {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
                              </div>
                              <div>
                                  <textarea 
                                      name="details"
                                      placeholder={t('details')}
                                      value={orderForm.details}
                                      onChange={handleInputChange}
                                      rows={2}
                                      className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white ${formErrors.details ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                  />
                                  {formErrors.details && <p className="text-xs text-rose-500 mt-1">{formErrors.details}</p>}
                              </div>
                          </div>

                          <div className="mb-6">
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
                              onClick={handleCheckoutViaWhatsApp}
                              disabled={!termsAccepted}
                              className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white transition-all shadow-lg ${
                                  termsAccepted 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 cursor-pointer' 
                                  : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70'
                              }`}
                          >
                              <MessageCircle className="h-5 w-5" />
                              {lang === 'fr' ? 'Commander via WhatsApp' : lang === 'ar' ? 'اطلب عبر واتساب' : 'Checkout via WhatsApp'}
                          </button>
                      </div>
                  </>
              )}
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
          <ChatAssistant whatsappNumber={globalSettings.whatsappNumber} />
      )}
    </div>
  );
};

export default App;