import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
   
  
  UserCircle,
  CreditCard,
  Gamepad2,
  Tv,
  Cpu,
  Star,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Layout,
  Palette,
  Laptop,
  ArrowRight,
  Heart,
  LogOut,
  Shield,
  BarChart3,
  User as UserIcon,
  Settings,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
  Gift,
  Mail,
  HelpCircle,
  LogIn,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Phone,
  Instagram,
  Facebook,
  Sparkles,
  Ticket,
  Monitor,
  Trash,
  Edit2,
  MessageSquare,
  Bell,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AtlasLogo } from './components/Logo';
import { ProductAdminModal } from './components/ProductAdminModal';
import { CategoryAdminModal } from './components/CategoryAdminModal';
import { GiftAdminModal } from './components/GiftAdminModal';
import { AccountAdminModal } from './components/AccountAdminModal';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { OrderChatModal } from './components/OrderChatModal';
import { RequestChatModal } from './components/RequestChatModal';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, db, setDoc, getDoc, updateDoc, deleteDoc, doc, collection, query, where, onSnapshot, addDoc, serverTimestamp, increment, OperationType, handleFirestoreError, getDocs } from './lib/firebase';
import { Product, UserProfile, Order, Category, Transaction, GiftCode, AccountCategory, ServiceRequest, AppNotification } from './types';
import { Joyride, Step, STATUS } from 'react-joyride';
import type { EventData } from 'react-joyride';

// Types and Interfaces moved to types.ts or defined below if local

const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-fg/[0.02] border border-fg/5 rounded-[2rem] overflow-hidden transition-all hover:bg-fg/[0.04]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-right p-6 flex justify-between items-center"
      >
        <span className="font-bold text-lg pl-4">{question}</span>
        <div className={`p-2 rounded-full transition-all shrink-0 ${isOpen ? 'bg-violet-500 text-white rotate-180' : 'bg-fg/5 text-fg/40'}`}>
           <ChevronDown size={20} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="px-6 pb-6 text-fg/60 leading-relaxed font-medium"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const initialProducts: Product[] = [
  // --- AI SERVICES ---
  { 
    id: 1, 
    name: 'شات جي بي تي بلاص', 
    price: 75, 
    category: 'ذكاء اصطناعي', 
    image: '✨', 
    rating: 4.9,
    badge: 'الأكثر طلباً',
    description: 'أقوى نسخة من الذكاء الاصطناعي في العالم بين يديك. تمتع بالسرعة و الذكاء الخارق.',
    features: ['دخول حصري لـ GPT-4o', 'سرعة استجابة فائقة', 'استخدام الأدوات المتقدمة (DALL-E, Analysis)', 'دعم فني متواصل'],
    duration: 'شهر واحد',
    options: [
      { name: 'حساب مشترك', price: 45 },
      { name: 'حساب خاص (شهر)', price: 75 },
      { name: 'حساب خاص (6 أشهر)', price: 400 },
    ]
  },
  { 
    id: 3, 
    name: 'كلود AI برو', 
    price: 70, 
    category: 'ذكاء اصطناعي', 
    image: '🤖', 
    rating: 4.7, 
    badge: 'الجديد',
    features: ['Claude 3.5 Sonnet', '200k Context Window', 'Priority Access'] ,
    options: [
      { name: 'حساب مشترك', price: 35 },
      { name: 'حساب خاص', price: 70 },
    ]
  },
  { id: 12, name: 'ميدجورني برو', price: 95, category: 'ذكاء اصطناعي', image: '🖼️', rating: 4.9, features: ['Fast Generations', 'Relax Mode', 'Commercial License'] },
  { id: 13, name: 'يوتيوب بريميوم', price: 15, category: 'ذكاء اصطناعي', image: '🔴', rating: 4.9, duration: 'شهر واحد', features: ['No Ads', 'Background Play', 'YouTube Music'] },

  // --- STREAMING ---
  { 
    id: 2, 
    name: 'نتفليكس بريميوم', 
    price: 12, 
    category: 'ستريمينغ', 
    image: '🎥', 
    rating: 4.8,
    badge: 'تفعيل فوري',
    description: 'تفرج في أقوى الأفلام و المسلسلات بأعلى جودة ممكنة 4K Ultra HD.',
    features: ['جودة 4K + HDR', 'إمكانية المشاهدة على 4 أجهزة', 'تنزيل المحتوى للمشاهدة بدون أنترنات', 'بدون إعلانات'],
    duration: 'شهر واحد',
    options: [
      { name: 'شاشة واحدة (Ultra HD)', price: 12 },
      { name: 'شاشتين (Ultra HD)', price: 20 },
      { name: '5 شاشات (Ultra HD)', price: 45 },
    ]
  },
  { id: 5, name: 'سبوتيفاي فردي', price: 8, category: 'ستريمينغ', image: '🎵', rating: 4.9, duration: 'شهر واحد', features: ['Ad-free music', 'Offline playback', 'High quality audio'] },
  { id: 14, name: 'ديزني بلوس', price: 10, category: 'ستريمينغ', image: '🏰', rating: 4.7, duration: 'شهر واحد', features: ['Marvel & Star Wars', '4K Quality', '4 Devices'] },
  { id: 15, name: 'شاهد VIP', price: 18, category: 'ستريمينغ', image: '📺', rating: 4.8, features: ['Original content', 'Sports channels', 'No ads'] },

  // --- GAMING ---
  { id: 4, name: 'فري فاير 100 ديامو', price: 3.5, category: 'ألعاب', image: '💎', rating: 4.5, features: ['Garena Official', 'Instant Top-up', 'Bonus Diamonds'] },
  { id: 6, name: 'ببجي موبايل UC', price: 5, category: 'ألعاب', image: '🪖', rating: 4.6, features: ['60 UC Package', 'Safe Login', 'Instant delivery'] },
  { id: 16, name: 'فورتنايت في-باكس', price: 25, category: 'ألعاب', image: '🕺', rating: 4.8, features: ['1000 V-Bucks', 'Safe Top-up', 'All Platforms'] },
  { id: 17, name: 'بلايستيشن بلوس', price: 35, category: 'ألعاب', image: '💙', rating: 4.9, features: ['Monthly Games', 'Online Multiplayer', 'Extra Discounts'] },
  { id: 18, name: 'ستيم واليت 10$', price: 38, category: 'ألعاب', image: '☁️', rating: 4.7, features: ['Digital Wallet', 'Global Access', 'Store Games'] },

  // --- CARDS ---
  { id: 7, name: 'كارت بلايستيشن 10$', price: 45, category: 'كوارط', image: '🎮', rating: 4.8, features: ['Region: US/FR', 'Instant Code', 'Full Value'] },
  { id: 8, name: 'كارت جوجل بلاي 10$', price: 35, category: 'كوارط', image: '📱', rating: 4.7, features: ['Instant Digital Code', 'Safe Checkout'] },
  { id: 19, name: 'أيتونز 10$', price: 42, category: 'كوارط', image: '🍎', rating: 4.8, features: ['Apple Music/Apps', 'Instant Email', 'Global Region'] },
  { id: 20, name: 'ريزر جولد 5$', price: 18, category: 'كوارط', image: '🐍', rating: 4.6, features: ['Gaming Credits', 'Secure Code', 'International'] },

  // --- SOFTWARE ---
  { id: 10, name: 'ويندوز 11 برو', price: 25, category: 'برامج', image: '💻', rating: 4.8, features: ['Lifetime Activation', 'Official Microsoft Key', 'Global Version'] },
  { id: 21, name: 'كاسبرسكي توتال', price: 30, category: 'برامج', image: '🛡️', rating: 4.9, features: ['Full Protection', '3 Devices / 1 Year', 'Anti-Virus & VPN'] },
  { id: 22, name: 'نورد في بي ان', price: 45, category: 'برامج', image: '🌐', rating: 4.8, features: ['Secure Browsing', 'Unblock Content', '6 Devices'] },

  // --- DESIGN ---
  { id: 9, name: 'أدوبي كرييتيف كلاود', price: 120, category: 'تصميم', image: '🖌️', rating: 4.9, features: ['All 20+ Apps', '100GB Cloud Storage', 'Adobe Fonts'] },
  { id: 11, name: 'كانفا برو', price: 15, category: 'تصميم', image: '🎨', rating: 4.7, badge: 'عرض خاص', features: ['All Templates', 'Brand Kit', 'AI Design Tools'] },
  { id: 23, name: 'فري بيك بريميوم', price: 20, category: 'تصميم', image: '📦', rating: 4.6, features: ['Daily Downloads', 'Vectors & Photos', 'No Attribution'] },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [accountCategories, setAccountCategories] = useState<AccountCategory[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [allServiceRequests, setAllServiceRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingGiftCode, setEditingGiftCode] = useState<Partial<GiftCode> | null>(null);
  const [editingAccountCat, setEditingAccountCat] = useState<Partial<AccountCategory> | null>(null);
  const [selectedOrderChat, setSelectedOrderChat] = useState<Order | null>(null);
  const [selectedRequestChat, setSelectedRequestChat] = useState<ServiceRequest | null>(null);
  const [adminTab, setAdminTab] = useState('orders'); // orders, products, users, categories
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [activeSubL1, setActiveSubL1] = useState<string | null>(null);
  const [activeSubL2, setActiveSubL2] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('home'); // home, shop, profile
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [cart, setCart] = useState<{product: Product, quantity: number, selectedOption?: {name: string, price: number}}[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [runTour, setRunTour] = useState(() => {
    return localStorage.getItem('tourCompleted') !== 'true';
  });

  const tourSteps: Step[] = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    // Filter steps based on whether they are available on mobile/desktop
    return [
      {
        target: '.tour-logo',
        content: 'مرحباً بك في أطلس! صفحتك الرئيسية.',
        disableBeacon: true,
        placement: 'bottom' as const,
      },
      {
        target: isMobile ? '.mobile-tour-search' : '.tour-search',
        content: 'يمكنك البحث عن ما تريد من خلال شريط البحث.',
        placement: 'bottom' as const,
      },
      // Theme switcher is hidden on mobile currently, so we skip it if on mobile
      ...(!isMobile ? [{
        target: '.tour-theme',
        content: 'تغيير المظهر (داكن أو فاتح) حسب رغبتك.',
        placement: 'bottom' as const,
      }] : []),
      {
        target: '.tour-cart',
        content: 'هنا قفتك (سلة المشتريات)، راجع ما أضفته بسهولة.',
        placement: 'bottom-start' as const,
      },
      {
        target: '.tour-login', // Desktop and mobile login use same class now!
        content: 'هذا فضاء حسابك، تنجم تسجل الدخول من هنا و تتابع طلبياتك.',
        placement: 'bottom' as const,
      },
      {
        target: isMobile ? '.tour-nav-shop.mobile-nav' : '.tour-nav-shop.desktop-nav',
        content: 'من هنا يمكنك تصفح الدكان وشراء احتياجاتك من خدمات وبطاقات.',
        placement: isMobile ? ('top' as const) : ('bottom' as const),
      }
    ];
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('tourCompleted', 'true');
    }
  };

  useEffect(() => {
    let activeListeners: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Unsubscribe from previous listeners
      activeListeners.forEach(unsub => unsub());
      activeListeners = [];

      // Global Products Listener
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(doc => doc.data() as Product);
          setProducts(fetched.sort((a, b) => a.id - b.id));
        } else {
          setProducts(initialProducts);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'products'));
      activeListeners.push(unsubProducts);

      // Category Listener
      const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(doc => doc.data() as Category);
          setDynamicCategories(fetched);
        } else {
          // Seed initial categories if none exist
          const initialCats: Category[] = [
            { slug: 'ai', name: 'ذكاء اصطناعي', icon: '🤖', color: 'bg-purple-500/10 text-purple-500', level: 0 },
            { slug: 'streaming', name: 'ستريمينغ', icon: '🎬', color: 'bg-indigo-500/10 text-indigo-500', level: 0 },
            { slug: 'gaming', name: 'ألعاب', icon: '🎮', color: 'bg-fuchsia-500/10 text-fuchsia-500', level: 0 },
            { slug: 'cards', name: 'كوارط', icon: '💳', color: 'bg-blue-500/10 text-blue-500', level: 0 },
            { slug: 'software', name: 'برامج', icon: '💻', color: 'bg-emerald-500/10 text-emerald-500', level: 0 },
            { slug: 'design', name: 'تصميم', icon: '🎨', color: 'bg-amber-500/10 text-amber-500', level: 0 },
          ];
          setDynamicCategories(initialCats);
        }
      });
      activeListeners.push(unsubCategories);

      // Account Categories Listener
      const unsubAccountCats = onSnapshot(collection(db, 'accountCategories'), (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountCategory));
          setAccountCategories(fetched);
        } else {
          // Seed initial account categories
          setAccountCategories([
             { id: 'netflix', title: 'حسابات نتفليكس', icon: 'Tv', color: 'text-red-500', bg: 'bg-red-500/10', count: 120, desc: 'حسابات بريميوم 4K خاصة ومشتركة', createdAt: new Date() },
             { id: 'games', title: 'حسابات ألعاب', icon: 'Gamepad2', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', count: 85, desc: 'فالورانت، فري فاير، ببجي وغيرها', createdAt: new Date() },
             { id: 'spotify', title: 'حسابات سبوتيفاي', icon: 'Users', color: 'text-emerald-500', bg: 'bg-emerald-500/10', count: 40, desc: 'اشتراكات بريميوم فردية وعائلية', createdAt: new Date() },
             { id: 'chatgpt', title: 'حسابات شات جي بي تي', icon: 'Sparkles', color: 'text-violet-500', bg: 'bg-violet-500/10', count: 65, desc: 'حسابات بلس خاصة ومشتركة', createdAt: new Date() },
             { id: 'canva', title: 'حسابات كانفا', icon: 'Palette', color: 'text-cyan-500', bg: 'bg-cyan-500/10', count: 200, desc: 'كانفا برو بمدد مختلفة', createdAt: new Date() },
             { id: 'psn', title: 'حسابات بلايستيشن', icon: 'Monitor', color: 'text-blue-500', bg: 'bg-blue-500/10', count: 30, desc: 'حسابات PSN بها ألعاب و بلص', createdAt: new Date() }
          ]);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'accountCategories'));
      activeListeners.push(unsubAccountCats);

      setUser(currentUser);
      if (currentUser) {
        try {
          // Sync Profile
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'مستخدم Atlas',
              photoURL: currentUser.photoURL || '',
              balance: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }

          // Profile Listener
          const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              // Check admin status
              try {
                const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
                const isAdminUser = adminDoc.exists();
                setProfile({ ...data, isAdmin: isAdminUser });

                const userIdsToListen = isAdminUser ? ['admin', currentUser.uid] : [currentUser.uid];
                const notifQuery = query(collection(db, 'notifications'), where('userId', 'in', userIdsToListen));
                const unsubNotifs = onSnapshot(notifQuery, (snapshot) => {
                  const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
                  fetchedNotifications.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                  setNotifications(fetchedNotifications);
                }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));
                activeListeners.push(unsubNotifs);

                if (isAdminUser) {
                  // Admin specific listeners
                  const unsubAllOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
                    const fetched = snapshot.docs.map(doc => ({ orderId: doc.id, ...doc.data() } as Order));
                    setAllOrders(fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
                  }, (err) => handleFirestoreError(err, OperationType.GET, 'orders (admin)'));
                  activeListeners.push(unsubAllOrders);

                  const unsubAllUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
                    const fetched = snapshot.docs.map(doc => doc.data() as UserProfile);
                    setAllUsers(fetched);
                  }, (err) => handleFirestoreError(err, OperationType.GET, 'users (admin)'));
                  activeListeners.push(unsubAllUsers);
                  
                  const unsubGiftCodes = onSnapshot(collection(db, 'giftCodes'), (snapshot) => {
                    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GiftCode));
                    setGiftCodes(fetched);
                  }, (err) => handleFirestoreError(err, OperationType.GET, 'giftCodes (admin)'));
                  activeListeners.push(unsubGiftCodes);

                  const unsubAllServiceRequests = onSnapshot(collection(db, 'serviceRequests'), (snapshot) => {
                    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
                    fetched.sort((a, b) => {
                      const dateA = a.createdAt?.seconds || 0;
                      const dateB = b.createdAt?.seconds || 0;
                      return dateB - dateA;
                    });
                    setAllServiceRequests(fetched);
                  }, (err) => handleFirestoreError(err, OperationType.LIST, 'serviceRequests (admin)'));
                  activeListeners.push(unsubAllServiceRequests);
                }
              } catch (adminErr) {
                console.error("Admin check error:", adminErr);
                setProfile(data);
              }
            }
          }, (err) => handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`));
          activeListeners.push(unsubProfile);

          // Listen for Orders
          const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
          const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ orderId: doc.id, ...doc.data() } as Order));
            fetchedOrders.sort((a, b) => {
              const dateA = a.createdAt?.seconds || 0;
              const dateB = b.createdAt?.seconds || 0;
              return dateB - dateA;
            });
            setOrders(fetchedOrders);
          }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
          activeListeners.push(unsubOrders);

          const userRequestsQuery = query(collection(db, 'serviceRequests'), where('userId', '==', currentUser.uid));
          const unsubUserRequests = onSnapshot(userRequestsQuery, (snapshot) => {
             const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
             fetched.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
             });
             setServiceRequests(fetched);
          }, (err) => handleFirestoreError(err, OperationType.LIST, 'serviceRequests'));
          activeListeners.push(unsubUserRequests);

        } catch (error) {
          console.error("Setup error:", error);
        }
      } else {
        setProfile(null);
        setOrders([]);
      }
    });

    return () => {
      unsubscribeAuth();
      activeListeners.forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    {
      title: "Next - Gen \n Atlas Marketplace",
      subtitle: "اكتشف قوة البساطة والكفاءة مع منصتنا الرقمية الجديدة. مصممة لتبسيط اشتراكاتك الرقمية وتعزيز انتاجيتك.",
      emojis: ['✨', '🤖', '🎮', '🎵'],
      accent: 'from-violet-500 to-fuchsia-500',
      bg: 'bg-violet-600/10'
    },
    {
      title: "Premium AI \n For Everyone",
      subtitle: "أقوى اشتراكات الذكاء الاصطناعي بين يديك. ChatGPT، Claude و غيرهم بأسعار خيالية و تفعيل فوري.",
      emojis: ['🧠', '⚡', '🤖', '🔍'],
      accent: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-600/10'
    },
    {
      title: "Extreme Gaming \n Top-ups",
      subtitle: "اشحن ألعابك المفضلة في ثواني. Free Fire, PUBG, PlayStation و غيرهم بأفضل سوم في تونس.",
      emojis: ['🎮', '🔥', '💎', '🎯'],
      accent: 'from-orange-500 to-red-500',
      bg: 'bg-orange-600/10'
    }
  ];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTab('shop');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      handleLogin();
      return;
    }
    
    setIsProcessing(true);
    try {
      // Create Order
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.selectedOption ? `${item.product.name} (${item.selectedOption.name})` : item.product.name,
          price: item.selectedOption?.price ?? item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          imageUrl: item.product.imageUrl || ''
        })),
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Notify Admin
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          title: 'طلب جديد',
          message: `طلب جديد بقيمة ${cartTotal} د.ت من ${user.email || 'مستخدم'}`,
          isRead: false,
          link: 'admin-orders',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to notify admin", err);
      }

      setCart([]);
      setIsCartOpen(false);
      setCurrentTab('orders');
      
      // Auto-open chat for the newly created order
      setSelectedOrderChat({
        orderId: orderRef.id,
        ...orderData,
        createdAt: { toDate: () => new Date() } // Best-effort mock for instant UI
      } as any);

      // We don't alert anymore because the chat opens immediately
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setIsProcessing(false);
    }
  };

  const mockReviews = [
    { user: "محمد أمين", rating: 5, comment: "خدمة ممتازة و التوصيل في لحظة!", date: "منذ ساعتين" },
    { user: "سارة ب.", rating: 4, comment: "الاشتراك يخدم مريغل، شكرا AtlasVault.", date: "منذ يوم" },
    { user: "ياسين ك.", rating: 5, comment: "أحسن أسوام في تونس بصراحة.", date: "منذ 3 أيام" },
  ];

  const banners = [
    {
      id: 1,
      title: 'مرحبا بيك في AtlasVault',
      subtitle: 'أقوى العروض تستنى فيك',
      label: 'اكتشف المتجر',
      icon: '💎',
      color: 'from-violet-600 to-indigo-600',
      action: () => { setActiveCategory('الكل'); setCurrentTab('shop'); }
    },
    {
      id: 2,
      title: 'تخفيضات Gaming',
      subtitle: 'رمضان مبروك مع أقوى Packs',
      label: 'شوف العروض',
      icon: '🎮',
      color: 'from-fuchsia-600 to-pink-600',
      action: () => { setActiveCategory('ألعاب'); setCurrentTab('shop'); }
    },
    {
      id: 3,
      title: 'عروض حصرية',
      subtitle: 'أفضل الأسعار في السوق التونسية',
      label: 'اكتشف العروض',
      icon: '🔥',
      color: 'from-emerald-600 to-teal-600',
      action: () => setCurrentTab('shop')
    }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'الكل' || p.category === activeCategory;
      const matchesSubL1 = !activeSubL1 || p.subCategoryL1 === activeSubL1;
      const matchesSubL2 = !activeSubL2 || p.subCategoryL2 === activeSubL2;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSubL1 && matchesSubL2 && matchesSearch;
    });
  }, [activeCategory, activeSubL1, activeSubL2, searchQuery, products]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [allUsers, userSearchQuery]);

  const addToCart = (product: Product, option?: {name: string, price: number}) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedOption?.name === (option?.name));
      if (existing) {
        return prev.map(item => (item.product.id === product.id && item.selectedOption?.name === option?.name) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedOption: option }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, optionName?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === id && item.selectedOption?.name === optionName)));
  };

  const updateQuantity = (id: number, optionName: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id && item.selectedOption?.name === optionName) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + ((item.selectedOption?.price ?? item.product.price) * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const baseNavItems = [
    { id: 'home', label: 'الإستقبال', icon: Home },
    { id: 'shop', label: 'البوتيك', icon: ShoppingBag, badge: 'جديد' },
    { id: 'accounts', label: 'حسابات', icon: Users, badge: 'جديد' },
    { id: 'gift', label: 'كادو', icon: Gift },
    { id: 'contact', label: 'تواصل', icon: Mail },
    { id: 'faq', label: 'الأسئلة', icon: HelpCircle },
    { id: 'profile', label: 'حسابي', icon: UserIcon },
  ];

  const navItems = profile?.isAdmin 
    ? [...baseNavItems, { id: 'admin', label: 'الإدارة', icon: Shield }]
    : baseNavItems;

  return (
    <div className="min-h-screen bg-bg text-fg font-sans selection:bg-purple-500/30 overflow-x-hidden pb-24 lg:pb-0 transition-colors duration-300" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 dark:bg-violet-600/10 blur-[120px] rounded-full opacity-50 dark:opacity-100" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-[120px] rounded-full opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        onEvent={handleJoyrideCallback}
        locale={{
          back: 'السابق',
          close: 'إغلاق',
          last: 'إنهاء',
          next: 'التالي',
          skip: 'تخطي',
        }}
        options={{
          arrowColor: isDarkMode ? '#0a0a0a' : '#fff',
          backgroundColor: isDarkMode ? '#0a0a0a' : '#fff',
          primaryColor: '#7c3aed',
          textColor: isDarkMode ? '#fff' : '#000',
          zIndex: 1000,
          showProgress: true,
          buttons: ['back', 'close', 'primary', 'skip']
        }}
        styles={{
          tooltip: {
            borderRadius: '24px',
            fontFamily: 'inherit',
          },
          buttonPrimary: {
            borderRadius: '12px',
            padding: '8px 16px',
            fontWeight: 'bold',
          },
          buttonBack: {
            marginRight: 'auto',
          },
        }}
      />

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-panel border-l border-fg/5 z-[70] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-violet-500" />
                  <h2 className="text-xl font-bold tracking-tight">قفّتك ({cartCount})</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-fg/5 rounded-full"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-fg/5 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag size={40} className="text-fg/20" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">قفّتك فارغة</h3>
                    <p className="text-fg/40 mb-8">أعمل طلّة على المتجر و عبي قفتك بأقوى العروض !</p>
                    <button onClick={() => setIsCartOpen(false)} className="px-8 py-3 bg-fg text-bg font-semibold rounded-full transition-colors">الحانوت</button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="flex gap-4 p-4 rounded-2xl bg-fg/5 border border-fg/5 group">
                      <div className="w-20 h-20 bg-fg/10 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          item.product.image
                        )}
                      </div>
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-sm tracking-tight leading-tight truncate">
                            {item.product.name}
                            {item.selectedOption && <span className="block text-[10px] text-fg/50 font-normal mt-1">{item.selectedOption.name}</span>}
                          </h4>
                          <button onClick={() => removeFromCart(item.product.id, item.selectedOption?.name)} className="text-fg/20 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                        </div>
                        <p className="text-violet-400 font-bold mt-1 text-lg">{item.selectedOption?.price ?? item.product.price} DT</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2 bg-fg/5 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.product.id, item.selectedOption?.name, -1)} className="p-1 hover:bg-fg/10 rounded active:scale-95 transition-all"><Minus size={14} /></button>
                            <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.selectedOption?.name, 1)} className="p-1 hover:bg-fg/10 rounded active:scale-95 transition-all"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-8 pt-8 border-t border-fg/5 space-y-4">
                  <div className="flex justify-between text-fg/40">
                    <span>المجموع</span>
                    <span>{cartTotal} DT</span>
                  </div>
                  <div className="flex justify-between items-center text-3xl font-bold">
                    <span>الكل</span>
                    <span className="text-violet-400">{cartTotal} DT</span>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold tracking-wide rounded-2xl hover:brightness-110 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? 'جاري المعالجة...' : 'تعدّى للدفع'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-fg/5 bg-panel/80 backdrop-blur-3xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center">
          {/* Right Section: Logo */}
          <div className="flex-1 flex items-center justify-start overflow-hidden">
            <div className="flex items-center gap-3 group cursor-pointer tour-logo shrink-0" onClick={() => setCurrentTab('home')}>
              <AtlasLogo className="w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:rotate-12" />
              <div className="flex flex-col leading-none hidden xl:block">
                <span className="text-xl font-black tracking-tighter text-fg">ATLASVAULT</span>
              </div>
            </div>
          </div>

          {/* Center Section: Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-none px-4">
            <div className="flex items-center gap-1 h-full">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`tour-nav-${item.id} desktop-nav flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all relative ${
                    currentTab === item.id ? 'text-amber-400 bg-fg/5' : 'text-fg/60 hover:text-fg hover:bg-fg/5'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-[8px] text-white font-black rounded-md shadow-lg">
                      {item.badge}
                    </span>
                  )}
                  {currentTab === item.id && (
                    <motion.div layoutId="nav-line" className="absolute bottom-[-10px] left-2 right-2 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Left Section: Search & Actions */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4 overflow-hidden">
            {/* Search - only visible on wide screens in this spot */}
            <div className="hidden sm:flex items-center flex-1 max-w-[200px] xl:max-w-xs px-2">
              <div className="relative w-full group text-right tour-search">
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-fg/20 group-focus-within:text-amber-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="بحث..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-fg/[0.03] border border-fg/10 rounded-2xl py-2 px-10 text-[10px] xl:text-xs outline-none focus:border-amber-400/50 focus:bg-fg/[0.07] transition-all placeholder:text-fg/20 text-right" 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {!user ? (
                <button 
                  onClick={handleLogin}
                  className="tour-login flex items-center gap-2 px-4 py-2 bg-fg/5 border border-fg/10 text-fg text-xs font-bold rounded-xl hover:bg-fg/10 transition-all active:scale-95"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:block">دخول</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="tour-login flex items-center gap-2 px-3 py-2 bg-fg/5 border border-fg/10 text-fg text-xs font-bold rounded-xl hover:bg-fg/10 transition-all active:scale-95 shrink-0"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                  ) : (
                    <UserCircle size={18} />
                  )}
                  <span className="hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                    {profile?.displayName || 'حسابي'}
                  </span>
                </button>
              )}
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hidden sm:flex p-2.5 bg-fg/5 border border-fg/10 rounded-xl hover:bg-fg/10 transition-all group tour-theme"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Moon size={18} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  )}
                </button>

                {user && (
                  <div className="relative isolate">
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2.5 bg-fg/5 border border-fg/10 rounded-xl hover:bg-fg/10 transition-all relative group"
                    >
                      <Bell size={18} className="text-fg group-hover:scale-110 transition-transform" />
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-bg shadow-lg">
                          {notifications.filter(n => !n.isRead).length}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 top-full mt-3 w-80 bg-panel border-fg/10 border rounded-3xl shadow-2xl overflow-hidden z-50 text-right"
                          dir="rtl"
                        >
                          <div className="p-4 border-b border-fg/10 flex items-center justify-between bg-fg/[0.02]">
                            <h3 className="font-bold">الإشعارات</h3>
                            {notifications.filter(n => !n.isRead).length > 0 && (
                              <button 
                                onClick={async () => {
                                  try {
                                    const unread = notifications.filter(n => !n.isRead);
                                    for (const notif of unread) {
                                      await updateDoc(doc(db, 'notifications', notif.id!), { isRead: true });
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="text-[10px] text-amber-500 hover:bg-amber-500/10 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1"
                              >
                                <Check size={12} /> تحديد الكل كمقروء
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto no-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-fg/40 text-sm">
                                لا توجد إشعارات حاليا
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div 
                                  key={notif.id}
                                  onClick={async () => {
                                    if (!notif.isRead) {
                                      try {
                                        await updateDoc(doc(db, 'notifications', notif.id!), { isRead: true });
                                      } catch (err) {}
                                    }
                                    setIsNotificationsOpen(false);
                                    if (notif.link) {
                                      if (notif.link.startsWith('admin-')) {
                                        setCurrentTab('admin');
                                        setAdminTab(notif.link.replace('admin-', ''));
                                      } else {
                                        setCurrentTab(notif.link);
                                      }
                                    }
                                  }}
                                  className={`p-4 border-b border-fg/5 hover:bg-fg/5 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-amber-500/[0.02]' : ''}`}
                                >
                                  <div className={`w-2 h-2 mt-1.5 shrink-0 rounded-full ${!notif.isRead ? 'bg-amber-500' : 'bg-transparent'}`} />
                                  <div>
                                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-medium text-fg/80'}`}>{notif.title}</h4>
                                    <p className="text-xs text-fg/60 mt-1 line-clamp-2">{notif.message}</p>
                                    <span className="text-[10px] text-fg/40 mt-2 block font-mono">
                                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString('ar-TN', { hour: 'numeric', minute: 'numeric' }) : 'الآن'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="p-2.5 bg-fg/5 border border-fg/10 rounded-xl hover:bg-fg/10 transition-all relative group tour-cart"
                >
                  <ShoppingBag size={18} className="text-fg group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-black text-[8px] font-black rounded-full flex items-center justify-center border-2 border-bg shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className="p-2.5 lg:hidden hover:bg-fg/5 rounded-2xl transition-colors mobile-tour-search"
                >
                  {isMobileSearchOpen ? <X size={20} className="text-fg/80" /> : <Search size={20} className="text-fg/80" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Search Input */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 70, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-fg/5 bg-panel overflow-hidden"
            >
              <div className="p-4 relative">
                <Search size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-fg/20" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="على شنوا تلوج؟" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-fg/[0.03] border border-fg/10 rounded-2xl py-3 pr-12 pl-4 text-sm outline-none focus:border-amber-400/50 focus:bg-fg/[0.07] transition-all placeholder:text-fg/20 text-right" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-panel/80 backdrop-blur-3xl border border-fg/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`tour-nav-${item.id} mobile-nav flex flex-col items-center gap-1 p-3 rounded-3xl transition-all relative ${
              currentTab === item.id ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 grow' : 'text-fg/30'
            }`}
          >
            <item.icon size={20} />
            <span className={`text-[10px] font-bold ${currentTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
            {item.badge && (
               <span className="absolute top-1 right-1 px-1 py-0.5 bg-red-500 text-[6px] text-white font-black rounded-md">
                 {item.badge}
               </span>
            )}
          </button>
        ))}
      </nav>

      <main className="pt-28 lg:pt-32 pb-20">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-7xl mx-auto px-4 py-8 md:py-12"
            >
              {/* Hero Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-fg/10 rounded-[3rem] p-12 mb-16 text-center">
                <div className="absolute top-0 left-0 w-full h-full -z-10 blur-[80px] opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500 rounded-full" />
                  <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-500 rounded-full" />
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <AtlasLogo className="w-24 h-24 mb-8" />
                  <span className="inline-block px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase mb-6 tracking-widest">
                    مرحباً بك في ATLASVAULT
                  </span>
                  <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                    وجهتك الأولى لجميع <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">الإشتراكات الرقمية</span>
                  </h1>
                  <p className="text-xl text-fg/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                    استمتع بأفضل الأسعار وأسرع خدمة في تونس مع ATLASVAULT. نوفر لك جميع بطاقات الهدايا، اشتراكات البث، وألعاب الفيديو بجودة عالية وضمان كامل.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <button 
                      onClick={() => setCurrentTab('shop')}
                      className="px-10 py-5 bg-amber-400 text-black font-black rounded-2xl hover:bg-amber-300 transition-all active:scale-95 text-lg shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)]"
                    >
                      تسوق الآن
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-right">
                {[
                  {
                    icon: Zap,
                    title: "تسليم فوري",
                    desc: "توصل بالكود متاعك في اللحظة بعد ما يكمل الدفع. ما تستنى حد.",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10"
                  },
                  {
                    icon: ShieldCheck,
                    title: "حماية كاملة",
                    desc: "جميع معاملاتك و بياناتك محمية بأعلى معايير الأمان العالمية.",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10"
                  },
                  {
                    icon: MessageCircle,
                    title: "دعم 24/7",
                    desc: "فريقنا موجود ديما باش يعاونك في أي وقت و يجاوب على كل استفساراتك.",
                    color: "text-violet-400",
                    bg: "bg-violet-500/10"
                  }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-8 bg-fg/[0.02] border border-fg/5 rounded-[2.5rem] hover:bg-fg/[0.04] transition-all group"
                  >
                    <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={feature.color} size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-fg/40 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats Section */}
              <div className="bg-fg/[0.02] border border-fg/5 rounded-[3rem] p-12 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "مستخدم نشط", value: "+10K" },
                    { label: "بطاقة رقمية", value: "500+" },
                    { label: "تقييم إيجابي", value: "4.9/5" },
                    { label: "عملية ناجحة", value: "+50K" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl md:text-4xl font-black text-fg mb-2">{stat.value}</p>
                      <p className="text-xs text-fg/30 font-bold uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black mb-4">طرق الدفع المتوفرة</h2>
                  <p className="text-fg/40 max-w-2xl mx-auto tracking-tight">نوفروولك برشا طرق باش تسهلك عملية الشراء و تخلص كيف ما تحب.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {[
                    { name: 'PayPal', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', color: 'bg-fg/5' },
                    { name: 'D17', icon: 'https://files.oaiusercontent.com/file-7L3r-D17-Digipost-Bank-Logo', color: 'bg-fg/5' },
                    { name: 'Ooredoo', icon: 'https://files.oaiusercontent.com/file-7L3r-Ooredoo-Logo', color: 'bg-fg/5' },
                    { name: 'Flouci', icon: 'https://files.oaiusercontent.com/file-7L3r-Flouci-Logo', color: 'bg-fg/5' },
                    { name: 'Crypto', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg', color: 'bg-fg/5' }
                  ].map((method) => (
                    <motion.div 
                      key={method.name} 
                      whileHover={{ y: -10, scale: 1.02 }}
                      className={`p-10 rounded-[2.5rem] ${method.color} border border-fg/5 flex flex-col items-center justify-center gap-6 group cursor-default transition-all hover:bg-fg/10`}
                    >
                      <div className="w-full h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={method.icon} 
                            alt={method.name} 
                            referrerPolicy="no-referrer"
                            className="max-w-[80%] max-h-full object-contain transition-all group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const text = document.createElement('span');
                                text.innerText = method.name;
                                text.className = "text-2xl font-bold text-fg/40 group-hover:text-fg transition-colors text-center";
                                parent.appendChild(text);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-black text-xs tracking-[0.2em] text-fg/20 group-hover:text-amber-400 transition-colors uppercase">{method.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto"
            >
              {/* Modern SaaS Hero Section - Carousel Version */}
              <section className="relative pt-20 pb-32 px-4 overflow-hidden min-h-[75vh] flex items-center justify-center mb-16">
                {/* Background Decorative Elements - Dynamic based on slide */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] ${heroSlides[activeSlide].bg} blur-[120px] rounded-full -z-10`} 
                  />
                </AnimatePresence>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fg/5 blur-[100px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto w-full relative">
                  <div className="flex flex-col items-center text-center max-w-4xl mx-auto z-10 relative">
                    <div className="overflow-hidden w-full">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeSlide}
                          initial={{ opacity: 0, scale: 0.95, y: 30 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 1.05, y: -30 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="flex flex-col items-center"
                        >
                          <AtlasLogo className="w-16 h-16 mb-8" />
                          <div className="flex -space-x-4 mb-10">
                            {heroSlides[activeSlide].emojis.map((emoji, i) => (
                              <motion.div 
                                key={i}
                                initial={{ x: 20 * (i + 1), opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-16 h-16 rounded-full border-4 border-bg bg-gradient-to-br ${heroSlides[activeSlide].accent} flex items-center justify-center text-2xl shadow-xl ring-2 ring-white/5`}
                              >
                                {emoji}
                              </motion.div>
                            ))}
                          </div>

                          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight whitespace-pre-line bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                            {heroSlides[activeSlide].title}
                          </h1>

                          <p className="text-lg md:text-xl text-fg/40 mb-12 max-w-2xl font-medium leading-relaxed">
                            {heroSlides[activeSlide].subtitle}
                          </p>

                          <div className="flex flex-wrap items-center justify-center gap-6">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const el = document.getElementById('products-grid');
                                el?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="px-10 py-5 bg-violet-600 text-white font-bold rounded-2xl shadow-[0_20px_50px_-10px_rgba(139,92,246,0.5)] relative group overflow-hidden"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                Start Exploring <ArrowRight size={20} className="group-hover:-translate-x-2 transition-transform scale-x-[-1]" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </motion.button>
                            
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-10 py-5 bg-fg/5 border border-fg/10 text-fg font-bold rounded-2xl hover:bg-fg/10 transition-colors"
                            >
                              View Deals
                            </motion.button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-3 mt-16">
                      {heroSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`h-2 rounded-full transition-all duration-500 ${
                            activeSlide === i ? 'w-12 bg-violet-500' : 'w-2 bg-fg/20 hover:bg-fg/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floating Widgets Interface Mockup */}
                  <div className="hidden xl:block">
                    {/* Total Earned Card */}
                    <motion.div 
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-10 -left-20 p-6 bg-fg/[0.03] backdrop-blur-3xl border border-fg/10 rounded-[2.5rem] w-64 shadow-2xl"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-right">
                          <p className="text-[10px] text-fg/40 font-bold uppercase tracking-widest">Total Earned</p>
                          <p className="text-2xl font-black">$4,329</p>
                        </div>
                        <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                          <Zap size={16} />
                        </div>
                      </div>
                      <div className="h-16 flex items-end gap-1 px-1">
                        {[40, 70, 45, 90, 65, 85, 55, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-violet-500/20 rounded-t-sm relative overflow-hidden h-full">
                            <div className="absolute bottom-0 inset-x-0 bg-violet-500 rounded-t-sm transition-all" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Income Bar Chart */}
                    <motion.div 
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-20 left-10 p-6 bg-panel/80 backdrop-blur-3xl border border-fg/10 rounded-[2.5rem] w-72 shadow-2xl"
                    >
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                            <BarChart3 size={20} />
                         </div>
                         <div>
                           <p className="text-[10px] text-fg/40 font-bold uppercase">income</p>
                           <p className="font-bold">Growth Tracking</p>
                         </div>
                      </div>
                      <div className="flex items-end gap-2 h-20">
                        {[1, 0.6, 0.8, 0.4, 0.9, 0.7].map((s, i) => (
                          <div key={i} className="flex-1 bg-fg/5 rounded-full relative h-full">
                            <div className="absolute bottom-0 inset-x-0 bg-fg/20 rounded-full" style={{ height: `${s * 100}%` }} />
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Activity Mini-Card */}
                    <motion.div 
                      animate={{ x: [0, 15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/2 -left-32 -translate-y-1/2 p-4 bg-fg/[0.03] backdrop-blur-2xl border border-fg/10 rounded-2xl flex items-center gap-4 w-72 shadow-2xl"
                    >
                      <div className="w-12 h-12 bg-fg/10 rounded-xl flex items-center justify-center text-xl">🛒</div>
                      <div className="flex-1">
                        <p className="font-black text-sm">Amazon Order</p>
                        <p className="text-[10px] text-fg/40">Online pay - $99.99</p>
                      </div>
                      <div className="text-red-400 font-bold text-xs">-$99</div>
                    </motion.div>

                    {/* Yellow Wallet Card */}
                    <motion.div 
                      animate={{ rotate: [-3, 3, -3] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-10 right-0 p-8 bg-[#facc15] text-black rounded-[3rem] w-64 shadow-2xl transform rotate-3"
                    >
                      <div className="flex justify-between items-start mb-10">
                         <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                            <Cpu size={24} fill="currentColor" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-tighter">Atlas Safe Protocol</span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-3xl font-black">18.73 ETH</p>
                         <p className="text-[10px] font-bold opacity-60">0xF1 **** c8822</p>
                      </div>
                    </motion.div>

                    {/* Frosted Balance Card */}
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-10 -right-20 p-10 bg-fg/5 backdrop-blur-md border border-fg/20 rounded-[3.5rem] shadow-2xl"
                    >
                       <p className="text-[10px] text-fg/60 font-black uppercase tracking-[0.2em] mb-2">Acc balance</p>
                       <p className="text-5xl font-black tracking-tighter">$3,853.65</p>
                       <div className="mt-8 flex gap-2">
                          <div className="w-8 h-2 bg-fg/20 rounded-full" />
                          <div className="w-2 h-2 bg-fg/20 rounded-full" />
                          <div className="w-2 h-2 bg-fg/20 rounded-full" />
                       </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Luxury Category Selection Section */}
              <section className="max-w-7xl mx-auto px-4 mb-20">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h2 className="text-3xl font-black tracking-tight mb-2">تسوق حسب الصنف</h2>
                      <p className="text-fg/40 text-sm">اختر الفئة اللي تحب عليها و اكتشف عروضنا</p>
                   </div>
                   <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                       <div className="w-2 h-2 rounded-full bg-fg/20" />
                       <div className="w-2 h-2 rounded-full bg-fg/20" />
                   </div>
                </div>

                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto pb-6 px-2 scrollbar-hide no-scrollbar">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { 
                        setActiveCategory('الكل');
                        setActiveSubL1(null);
                        setActiveSubL2(null);
                      }}
                      className={`group relative px-8 py-6 rounded-[2.5rem] flex flex-col items-center gap-4 whitespace-nowrap transition-all border overflow-hidden min-w-[150px] ${
                        activeCategory === 'الكل' 
                        ? 'bg-violet-600 border-violet-400 text-white shadow-[0_20px_40px_-10px_rgba(139,92,246,0.5)] scale-105 z-10' 
                        : 'bg-fg/[0.03] border-fg/5 text-fg/50 hover:bg-fg/5 hover:border-fg/20 hover:scale-105'
                      }`}
                    >
                       <span className="text-3xl">🌟</span>
                       <span className="font-black text-sm uppercase tracking-widest text-current">الكل</span>
                    </motion.button>
                    {dynamicCategories.filter(c => (c.level === 0 || c.level === undefined)).map((category, idx) => (
                      <motion.button
                        key={category.slug}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { 
                          setActiveCategory(category.name);
                          setActiveSubL1(null);
                          setActiveSubL2(null);
                        }}
                        className={`group relative px-8 py-6 rounded-[2.5rem] flex flex-col items-center gap-4 whitespace-nowrap transition-all border overflow-hidden min-w-[150px] ${
                          activeCategory === category.name 
                          ? 'bg-violet-600 border-violet-400 text-white shadow-[0_20px_40px_-10px_rgba(139,92,246,0.5)] scale-105 z-10' 
                          : 'bg-fg/[0.03] border-fg/5 text-fg/50 hover:bg-fg/5 hover:border-fg/20 hover:scale-105'
                        }`}
                      >
                        {/* Interactive Background Glow */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${category.color?.split(' ')[0].replace('bg-', '') || 'from-violet-500 to-fuchsia-500'}`} />
                        
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-lg overflow-hidden ${
                          activeCategory === category.name 
                          ? 'bg-fg/20 rotate-[15deg] scale-110' 
                          : `${category.color || 'bg-fg/5 text-white'} group-hover:rotate-[-10deg]`
                        }`}>
                          {category.imageUrl ? (
                            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{category.icon}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-1.5 text-current">
                          <span className={`text-sm font-black tracking-tight ${activeCategory === category.name ? 'text-white' : 'group-hover:text-fg transition-colors'}`}>
                            {category.name}
                          </span>
                          {activeCategory === category.name && (
                            <motion.div 
                              layoutId="active-nav-indicator"
                              className="w-8 h-1 bg-white rounded-full shadow-[0_0_15px_white]" 
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sub-Category L1 Navigation */}
                {activeCategory !== 'الكل' && (
                   <div className="mt-8 flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setActiveSubL1(null); setActiveSubL2(null); }}
                        className={`px-8 py-4 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                          !activeSubL1 ? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-500/20' : 'bg-fg/5 border-fg/10 text-fg/40 hover:bg-fg/10'
                        }`}
                      >
                         الكل في {activeCategory}
                      </motion.button>
                      {dynamicCategories
                        .filter(c => c.level === 1 && c.parentId === dynamicCategories.find(root => root.name === activeCategory)?.slug)
                        .map(sub => (
                           <motion.button 
                             key={sub.slug}
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                             onClick={() => { setActiveSubL1(sub.slug); setActiveSubL2(null); }}
                             className={`px-8 py-4 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-3 ${
                               activeSubL1 === sub.slug ? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-500/20 text-white' : 'bg-fg/5 border-fg/10 text-fg/40 hover:bg-fg/10'
                             }`}
                           >
                              <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                                {sub.imageUrl ? (
                                  <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                  <span className="text-xl">{sub.icon}</span>
                                )}
                              </div>
                              {sub.name}
                           </motion.button>
                        ))}
                   </div>
                )}

                {/* Sub-Category L2 Navigation */}
                {activeSubL1 && (
                   <div className="mt-4 flex gap-3 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSubL2(null)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                          !activeSubL2 ? 'bg-fg border-fg text-bg font-black' : 'bg-fg/5 border-fg/10 text-fg/40 hover:bg-fg/10'
                        }`}
                      >
                         الكل
                      </motion.button>
                      {dynamicCategories
                        .filter(c => c.level === 2 && c.parentId === activeSubL1)
                        .map(sub => (
                           <motion.button 
                             key={sub.slug}
                             whileHover={{ scale: 1.02 }}
                             whileTap={{ scale: 0.98 }}
                             onClick={() => setActiveSubL2(sub.slug)}
                             className={`px-6 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                               activeSubL2 === sub.slug ? 'bg-fg border-fg text-bg font-black' : 'bg-fg/5 border-fg/10 text-fg/40 hover:bg-fg/10'
                             }`}
                           >
                              <div className="w-4 h-4 flex items-center justify-center overflow-hidden">
                                {sub.imageUrl ? (
                                  <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover rounded-sm" />
                                ) : (
                                  <span>{sub.icon}</span>
                                )}
                              </div>
                              {sub.name}
                           </motion.button>
                        ))}
                   </div>
                )}
              </section>

              {/* Dynamic Products Grid */}
              <section id="products-grid" className="max-w-7xl mx-auto px-4 py-8 mb-20 relative z-10">
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="inline-flex p-6 bg-fg/5 rounded-full mb-4">
                      <Search size={48} className="text-fg/20" />
                    </div>
                    <h3 className="text-2xl font-bold">حتى شي ما فمّة</h3>
                    <p className="text-fg/40 mt-2">جرب لوّج على حاجة اخرى.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => { setSelectedProduct(product); setSelectedOptionIndex(0); }}
                          className="p-6 rounded-[2.5rem] bg-fg/[0.03] border border-fg/5 flex flex-col group hover:border-violet-500/30 transition-all hover:translate-y-[-8px] hover:shadow-[0_20px_40px_-20px_rgba(139,92,246,0.3)] shadow-2xl overflow-hidden relative cursor-pointer"
                        >
                          <div className="aspect-square bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 rounded-3xl flex items-center justify-center text-6xl mb-6 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
                            {product.badge && (
                              <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-violet-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg border border-fg/20">
                                {product.badge}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-fg/5 flex items-center justify-center border border-fg/10 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Zap size={12} className="text-violet-400" />
                            </div>
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              product.image
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <div className="flex items-center justify-between mb-2">
                               <span className="px-2.5 py-1 bg-fg/5 rounded-lg border border-fg/5 text-[10px] font-bold text-violet-400/80 font-mono tracking-wider">{product.category}</span>
                               <div className="flex items-center gap-1.5 text-yellow-500">
                                 <Star size={12} fill="currentColor" />
                                 <span className="text-[10px] font-black text-white">{product.rating}</span>
                               </div>
                            </div>
                            <h3 className="font-bold text-xl group-hover:text-violet-400 transition-colors tracking-tight truncate leading-none mb-4">{product.name}</h3>
                            <div className="flex flex-wrap gap-1.5 justify-end">
                               {product.features?.slice(0, 2).map((f, i) => (
                                 <span key={i} className="text-[9px] text-fg/30 border border-fg/5 px-2 py-0.5 rounded-md">{f}</span>
                               ))}
                            </div>
                          </div>
                          <div className="mt-8 flex items-center justify-between gap-2 border-t border-fg/5 pt-6">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (product.options && product.options.length > 0) {
                                  addToCart(product, product.options[0]);
                                } else {
                                  addToCart(product);
                                }
                              }}
                              className="bg-violet-600 text-white p-4 rounded-2xl hover:bg-violet-500 transition-all shadow-xl active:scale-90 hover:shadow-violet-600/40"
                            >
                              <Plus size={22} strokeWidth={3} />
                            </button>
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] text-fg/40 font-bold uppercase opacity-60 tracking-wider">السعر</span>
                              <span className="text-2xl font-black">{product.price.toFixed(3)} <span className="text-xs text-violet-400 opacity-80">DT</span></span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>


            </motion.div>
          )}

          {currentTab === 'admin' && profile?.isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-7xl mx-auto px-4 py-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-violet-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_-5px_rgba(139,92,246,0.5)]">
                    <Shield size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">لوحة التحكم الإدارية</h2>
                    <p className="text-fg/40 font-medium">مرحباً بك مجدداً، {profile.displayName}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-4 bg-fg/5 border border-fg/10 rounded-2xl text-center min-w-[120px]">
                    <p className="text-[10px] text-fg/40 font-bold uppercase mb-1">إجمالي الطلبات</p>
                    <p className="text-2xl font-black">{allOrders.length}</p>
                  </div>
                  <div className="p-4 bg-violet-600/20 border border-violet-500/20 rounded-2xl text-center min-w-[120px]">
                    <p className="text-[10px] text-violet-400 font-bold uppercase mb-1">المبيعات</p>
                    <p className="text-2xl font-black text-violet-400">{allOrders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Admin Sidebar */}
                <div className="flex gap-2 lg:flex-col lg:w-64 lg:space-y-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar snap-x">
                  {[
                    { id: 'orders', label: 'الطلبات', icon: Zap, count: allOrders.length },
                    { id: 'requests', label: 'طلبات الخدمات', icon: MessageSquare, count: allServiceRequests.length },
                    { id: 'products', label: 'المنتجات', icon: ShoppingBag, count: products.length },
                    { id: 'categories', label: 'الأصناف', icon: Layout, count: dynamicCategories.length },
                    { id: 'users', label: 'المستخدمين', icon: Users, count: allUsers.length },
                    { id: 'gifts', label: 'كودات الهدايا', icon: Ticket, count: giftCodes.length },
                    { id: 'accounts', label: 'الحسابات', icon: Monitor, count: accountCategories.length },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`min-w-[140px] lg:min-w-0 lg:w-full p-4 rounded-2xl flex items-center justify-between border transition-all snap-start ${
                        adminTab === item.id 
                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg' 
                        : 'bg-fg/[0.03] border-fg/5 text-fg/40 hover:bg-fg/5 hover:border-fg/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        <span className="font-bold text-sm">{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          adminTab === item.id ? 'bg-fg/20' : 'bg-fg/10 text-fg/40'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                  
                  <button
                    onClick={async () => {
                      if (!confirm('هل أنت متأكد من رغبتك في مزامنة البيانات الأساسية مع السيرفر؟')) return;
                      try {
                        const initialCats = [
                          { slug: 'ai', name: 'ذكاء اصطناعي', icon: '🤖', color: 'bg-purple-500/10 text-purple-500', level: 0 },
                          { slug: 'streaming', name: 'ستريمينغ', icon: '🎬', color: 'bg-indigo-500/10 text-indigo-500', level: 0 },
                          { slug: 'gaming', name: 'ألعاب', icon: '🎮', color: 'bg-fuchsia-500/10 text-fuchsia-500', level: 0 },
                          { slug: 'cards', name: 'كوارط', icon: '💳', color: 'bg-blue-500/10 text-blue-500', level: 0 },
                          { slug: 'software', name: 'برامج', icon: '💻', color: 'bg-emerald-500/10 text-emerald-500', level: 0 },
                          { slug: 'design', name: 'تصميم', icon: '🎨', color: 'bg-amber-500/10 text-amber-500', level: 0 },
                        ];
                        for (const c of initialCats) { await setDoc(doc(db, 'categories', c.slug), c); }
                        for (const p of initialProducts) { await setDoc(doc(db, 'products', String(p.id)), p); }
                        alert('تمت مزامنة البيانات بنجاح!');
                      } catch (err) {
                        alert('خطأ في المزامنة');
                      }
                    }}
                    className="w-full mt-4 p-4 rounded-2xl flex items-center justify-center gap-3 bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all font-bold text-sm"
                  >
                    <RefreshCw size={18} />
                    مزامنة البيانات الأساسية
                  </button>
                </div>

                {/* Admin Content Area */}
                <div className="flex-1 bg-fg/[0.02] border border-fg/5 rounded-[3rem] p-8 min-h-[600px]">
                  <AnimatePresence mode="wait">
                    {adminTab === 'requests' && (
                      <motion.div
                        key="requests-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <h3 className="text-2xl font-black">طلبات الخدمات الإضافية</h3>
                         <div className="space-y-4">
                           {allServiceRequests.map((req) => (
                              <div key={req.id} className="bg-panel border border-fg/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative group">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-lg">{req.title}</h4>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                       req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                       req.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                       req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                       'bg-red-500/10 text-red-500'
                                    }`}>
                                      {req.status === 'pending' ? 'معلق' :
                                       req.status === 'in-progress' ? 'قيد التنفيذ' :
                                       req.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-fg/60 mb-2">{req.description}</p>
                                  <p className="text-xs text-fg/40 font-mono">User: {req.userEmail || req.userId} • {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : 'الآن'}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                   <select 
                                      value={req.status}
                                      onChange={async (e) => {
                                        const newStatus = e.target.value as any;
                                        try {
                                          await updateDoc(doc(db, 'serviceRequests', req.id!), { status: newStatus });
                                          await addDoc(collection(db, 'notifications'), {
                                            userId: req.userId,
                                            title: 'تحديث حالة طلب الخدمة',
                                            message: `تم تغيير حالة طلبك (${req.title}) إلى ${newStatus}`,
                                            isRead: false,
                                            link: 'requests',
                                            createdAt: serverTimestamp(),
                                          });
                                        } catch (err) {
                                          handleFirestoreError(err, OperationType.UPDATE, `serviceRequests/${req.id}`);
                                        }
                                      }}
                                      className="bg-fg/5 outline-none rounded-xl px-3 py-2 text-sm font-bold border border-transparent hover:border-fg/10 cursor-pointer text-fg"
                                   >
                                      <option value="pending" className="bg-background">معلق</option>
                                      <option value="in-progress" className="bg-background">قيد التنفيذ</option>
                                      <option value="completed" className="bg-background">مكتمل</option>
                                      <option value="rejected" className="bg-background">مرفوض</option>
                                   </select>
                                   <button 
                                      onClick={() => setSelectedRequestChat(req)}
                                      className="relative p-2 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-colors"
                                   >
                                      <MessageSquare size={16} />
                                      {req.unreadMessagesAdmin ? (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                                          {req.unreadMessagesAdmin}
                                        </span>
                                      ) : null}
                                   </button>
                                   <button 
                                      onClick={async () => {
                                        if(confirm('حذف هذا الطلب؟')) {
                                          try {
                                            await deleteDoc(doc(db, 'serviceRequests', req.id!));
                                          } catch (err) {
                                            handleFirestoreError(err, OperationType.DELETE, `serviceRequests/${req.id}`);
                                          }
                                        }
                                      }}
                                      className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                                   >
                                      <Trash size={16} />
                                   </button>
                                </div>
                              </div>
                           ))}
                           {allServiceRequests.length === 0 && (
                              <div className="py-20 text-center text-fg/40 border-2 border-dashed border-fg/10 rounded-3xl">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                <p>لا توجد طلبات خدمات حاليا</p>
                              </div>
                           )}
                         </div>
                      </motion.div>
                    )}

                    {adminTab === 'orders' && (
                      <motion.div
                        key="orders-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <h3 className="text-2xl font-black mb-8">إدارة الطلبات</h3>
                         <div className="space-y-4">
                            {allOrders.length === 0 ? (
                              <div className="p-20 text-center">لا يوجد طلبات حالياً</div>
                            ) : (
                              allOrders.map(order => (
                                <div key={order.orderId} className="bg-fg/[0.03] border border-fg/5 rounded-3xl p-6 hover:bg-fg/[0.05] transition-all">
                                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-fg/5 rounded-full flex items-center justify-center font-mono text-xs text-fg/40">
                                         #{order.orderId.slice(-4)}
                                       </div>
                                       <div>
                                         <p className="font-bold text-sm truncate max-w-[200px]">{(order as any).userEmail || order.userId}</p>
                                         <p className="text-[10px] text-fg/20">{order.createdAt?.toDate?.().toLocaleString()}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <span className="text-lg font-black text-violet-400">{(Number(order.total) || 0).toFixed(3)} DT</span>
                                       <div className="flex gap-2">
                                          <select 
                                            value={order.status}
                                            onChange={async (e) => {
                                              const newStatus = e.target.value as any;
                                              await updateDoc(doc(db, 'orders', order.orderId), { status: newStatus, updatedAt: serverTimestamp() });
                                              try {
                                                await addDoc(collection(db, 'notifications'), {
                                                  userId: order.userId,
                                                  title: 'تحديث حالة الطلب',
                                                  message: `تم تغيير حالة طلبك إلى ${newStatus}`,
                                                  isRead: false,
                                                  link: 'orders',
                                                  createdAt: serverTimestamp(),
                                                });
                                              } catch (err) {
                                                console.error("Failed to notify user", err);
                                              }
                                            }}
                                            className="bg-black border border-fg/10 rounded-xl text-xs px-4 py-2 outline-none focus:border-violet-500"
                                          >
                                            <option value="pending">⏳ قيد الانتظار</option>
                                            <option value="paid">💳 تم الدفع (بانتظار التأكيد)</option>
                                            <option value="completed">✅ مكتمل</option>
                                            <option value="cancelled">❌ ملغي</option>
                                          </select>
                                          <button
                                            onClick={async () => {
                                              if (confirm('هل أنت متأكد أنك تريد حذف هذا الطلب نهائياً؟')) {
                                                await deleteDoc(doc(db, 'orders', order.orderId));
                                              }
                                            }}
                                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs px-3 py-2 transition-all"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                          <button
                                            onClick={() => setSelectedOrderChat(order)}
                                            className="relative bg-fg/5 text-fg border border-fg/10 hover:bg-fg/10 rounded-xl text-xs px-4 py-2 transition-all font-bold"
                                          >
                                            المحادثة
                                            {order.unreadMessagesAdmin ? (
                                              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                                                {order.unreadMessagesAdmin}
                                              </span>
                                            ) : null}
                                          </button>
                                       </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {order.items.map((item, i) => (
                                      <div key={i} className="flex items-center gap-2 bg-fg/5 px-3 py-1.5 rounded-full border border-fg/5 whitespace-nowrap overflow-hidden">
                                        {item.imageUrl ? (
                                          <img src={item.imageUrl} alt={item.name} className="w-6 h-6 object-cover rounded-md" />
                                        ) : (
                                          <span className="text-lg">{item.image}</span>
                                        )}
                                        <span className="text-[10px] font-bold">{item.name} x{item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                         </div>
                      </motion.div>
                    )}

                    {adminTab === 'products' && (
                      <motion.div
                        key="products-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black">إدارة المنتجات</h3>
                          <button 
                            onClick={() => setEditingProduct({})}
                            className="px-6 py-3 bg-violet-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-violet-500"
                          >
                            <Plus size={18} /> إضافة منتج جديد
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {products.map(p => (
                            <div key={p.id} className="p-4 bg-fg/5 rounded-3xl border border-fg/5 flex items-center justify-between group hover:border-violet-500/50 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-fg/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform overflow-hidden">
                                    {p.imageUrl ? (
                                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                      p.image
                                    )}
                                  </div>
                                  <div>
                                     <p className="font-bold text-sm">{p.name}</p>
                                     <p className="text-[10px] text-fg/30">{p.category}</p>
                                     <p className="text-xs font-black text-violet-400 mt-0.5">{(Number(p.price) || 0).toFixed(3)} DT</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <button 
                                   onClick={() => setEditingProduct(p)}
                                   className="p-2.5 text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all"
                                 >
                                    <Settings size={18} />
                                 </button>
                                 <button 
                                   onClick={async () => {
                                     if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                       try {
                                         await deleteDoc(doc(db, 'products', String(p.id)));
                                       } catch (e) {
                                         alert('حدث خطأ أثناء الحذف');
                                       }
                                     }
                                   }}
                                   className="p-2.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                               </div>
                            </div>
                          ))}
                        </div>
                        
                        {editingProduct && (
                           <ProductAdminModal 
                              product={Object.keys(editingProduct).length === 0 ? null : editingProduct} 
                              categories={dynamicCategories} 
                              onClose={() => setEditingProduct(null)} 
                              onSave={() => setEditingProduct(null)} 
                           />
                        )}
                      </motion.div>
                    )}

                    {adminTab === 'categories' && (
                      <motion.div
                        key="categories-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black">إدارة الأصناف</h3>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => setEditingCategory({} as any)}
                                 className="px-6 py-3 bg-violet-600 rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-lg"
                               >
                                 + إضافة صنف جديد
                               </button>
                            </div>
                         </div>

                         <div className="space-y-12">
                            {dynamicCategories.filter(c => c.level === 0 || !c.level).map(root => (
                               <div key={root.slug} className="bg-fg/[0.02] border border-fg/5 rounded-[2.5rem] p-6 space-y-6">
                                  <div className="flex items-center justify-between border-b border-fg/5 pb-4">
                                     <div className="flex items-center gap-4">
                                                                                 <div className="w-16 h-16 shrink-0 bg-fg/5 rounded-2xl flex items-center justify-center text-3xl overflow-hidden">
                                           {root.imageUrl ? (
                                             <img src={root.imageUrl} alt={root.name} className="w-full h-full object-cover" />
                                           ) : (
                                             root.icon
                                           )}
                                         </div>
                                        <div>
                                           <h4 className="text-xl font-black">{root.name}</h4>
                                           <p className="text-[10px] text-fg/20 uppercase tracking-widest font-bold">صنف أساسي</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-2">
                                        <button 
                                          onClick={() => setEditingCategory(root)}
                                          className="p-2 text-fg/20 hover:text-fg transition-colors"
                                        >
                                          <Settings size={18} />
                                        </button>
                                        <button 
                                          onClick={async () => {
                                            if (confirm('هل تريد حذف هذا الصنف و جميع تفرعاته؟')) {
                                              await deleteDoc(doc(db, 'categories', root.slug));
                                              // Clean L1 and L2
                                              const l1s = dynamicCategories.filter(c => c.parentId === root.slug);
                                              for (const l1 of l1s) {
                                                await deleteDoc(doc(db, 'categories', l1.slug));
                                                const l2s = dynamicCategories.filter(c => c.parentId === l1.slug);
                                                for (const l2 of l2s) await deleteDoc(doc(db, 'categories', l2.slug));
                                              }
                                            }
                                          }}
                                          className="p-2 text-red-500/20 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {dynamicCategories.filter(c => c.level === 1 && c.parentId === root.slug).map(l1 => (
                                        <div key={l1.slug} className="p-5 bg-fg/5 rounded-3xl border border-fg/10 space-y-4">
                                           <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-lg bg-fg/5 flex items-center justify-center text-xl overflow-hidden">
                                                   {l1.imageUrl ? (
                                                     <img src={l1.imageUrl} alt={l1.name} className="w-full h-full object-cover" />
                                                   ) : (
                                                     <span>{l1.icon}</span>
                                                   )}
                                                 </div>
                                                 <span className="font-bold text-sm tracking-tight">{l1.name}</span>
                                              </div>
                                              <div className="flex gap-2">
                                                 <button 
                                                   onClick={() => setEditingCategory(l1)}
                                                   className="text-fg/20 hover:text-fg"
                                                 ><Settings size={14} /></button>
                                                 <button 
                                                   onClick={async () => {
                                                      if (confirm('حذف هذا الصنف؟')) await deleteDoc(doc(db, 'categories', l1.slug));
                                                   }}
                                                   className="text-red-500/20 hover:text-red-500"
                                                 ><Trash2 size={14} /></button>
                                              </div>
                                           </div>
                                           <div className="flex flex-wrap gap-2">
                                              {dynamicCategories.filter(c => c.level === 2 && c.parentId === l1.slug).map(l2 => (
                                                 <div key={l2.slug} className="px-3 py-1.5 bg-fg/10 border border-fg/5 rounded-xl flex items-center gap-2 group/l2">
                                                    <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                                                      {l2.imageUrl ? (
                                                        <img src={l2.imageUrl} alt={l2.name} className="w-full h-full object-cover rounded-sm" />
                                                      ) : (
                                                        <span className="text-xs">{l2.icon}</span>
                                                      )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-fg/50">{l2.name}</span>
                                                    <div className="flex gap-1">
                                                        <button 
                                                          onClick={() => setEditingCategory(l2)}
                                                          className="opacity-0 group-hover/l2:opacity-100 text-fg/20 hover:text-fg"
                                                        ><Settings size={10} /></button>
                                                        <button 
                                                          onClick={async () => {
                                                             if (confirm('حذف؟')) await deleteDoc(doc(db, 'categories', l2.slug));
                                                          }}
                                                          className="opacity-0 group-hover/l2:opacity-100 text-red-500/50 hover:text-red-500"
                                                        ><X size={10} /></button>
                                                    </div>
                                                 </div>
                                              ))}
                                              <button 
                                                onClick={() => setEditingCategory({ level: 2, parentId: l1.slug } as any)}
                                                className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-[10px] font-bold text-violet-400 hover:bg-violet-500/20"
                                              >
                                                + إضافة
                                              </button>
                                           </div>
                                        </div>
                                     ))}
                                     <button 
                                       onClick={() => setEditingCategory({ level: 1, parentId: root.slug } as any)}
                                       className="p-5 border-2 border-dashed border-fg/10 rounded-3xl flex items-center justify-center gap-2 text-fg/20 hover:text-violet-400 hover:border-violet-500/30 transition-all group"
                                     >
                                        <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-bold text-sm">إضافة صنف مستوى 1 لـ {root.name}</span>
                                     </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                         
                         {editingCategory && (
                            <CategoryAdminModal 
                               category={Object.keys(editingCategory).length === 0 || editingCategory.level !== undefined && !editingCategory.slug ? editingCategory : editingCategory}
                               categories={dynamicCategories} 
                               onClose={() => setEditingCategory(null)} 
                               onSave={() => setEditingCategory(null)} 
                            />
                         )}
                      </motion.div>
                    )}

                    {adminTab === 'users' && (
                      <motion.div
                        key="users-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-2xl font-black">إدارة المستخدمين</h3>
                        <div className="relative">
                           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-fg/20" size={18} />
                           <input 
                             type="text" 
                             value={userSearchQuery}
                             onChange={(e) => setUserSearchQuery(e.target.value)}
                             placeholder="ابحث بالاسم أو البريد الإلكتروني..." 
                             className="w-full bg-fg/5 border border-fg/10 rounded-2xl py-4 pr-12 pl-4 text-sm focus:border-violet-500 outline-none transition-all"
                           />
                        </div>

                        <div className="space-y-4">
                          {filteredUsers.map(u => (
                            <div key={u.userId} className="p-6 bg-fg/[0.03] rounded-3xl border border-fg/5 flex flex-wrap items-center justify-between gap-6 hover:bg-fg/[0.05] transition-all">
                              <div className="flex items-center gap-4">
                                 <img src={u.photoURL} alt="" className="w-14 h-14 rounded-2xl border-2 border-fg/10" />
                                 <div>
                                   <p className="font-bold text-lg">{u.displayName}</p>
                                   <p className="text-xs text-fg/30">{u.email}</p>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-8">
                                <div>
                                  {user?.uid !== u.userId && (
                                    <button
                                      onClick={async () => {
                                        const adminDocRef = doc(db, 'admins', u.userId);
                                        const adminSnap = await getDoc(adminDocRef);
                                        if (adminSnap.exists()) {
                                          if (confirm('نزع صلاحيات المسؤول من هذا المستخدم؟')) {
                                            await deleteDoc(adminDocRef);
                                            alert('تم نزع الصلاحيات بنجاح');
                                          }
                                        } else {
                                          if (confirm('ترقية هذا المستخدم ليكون مسؤول؟')) {
                                            await setDoc(adminDocRef, { email: u.email, assignedAt: serverTimestamp() });
                                            alert('تمت الترقية بنجاح');
                                          }
                                        }
                                      }}
                                      className="text-xs px-4 py-2 border border-violet-500/20 text-violet-500 font-bold rounded-xl hover:bg-violet-500/10 transition-all"
                                    >
                                      التحكم في الصلاحيات
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {adminTab === 'gifts' && (
                      <motion.div
                        key="gifts-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-black">كودات الهدايا</h3>
                          <button
                            onClick={() => setEditingGiftCode({})} 
                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                          >
                            إضافة كود جديد
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {giftCodes.map((g) => (
                             <div key={g.id} className="bg-panel border border-fg/10 rounded-2xl p-6 hover:shadow-xl transition-all group relative">
                                <h3 className="font-mono font-black text-2xl mb-1 text-center tracking-[0.2em] text-rose-400">{g.code}</h3>
                                <p className="text-sm text-center font-bold text-fg/60 mb-6">{g.type === 'discount' ? `تخفيض ${g.value}%` : `رصيد ${g.value} د.ت`}</p>
                                <div className="flex justify-center">
                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${g.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-fg/5 text-fg/40'}`}>
                                    {g.status === 'active' ? 'فعال' : (g.status === 'used' ? 'مستعمل' : 'منتهي')}
                                  </span>
                                </div>
                                <button onClick={async () => {
                                  if (confirm('حذف هذا الكود؟')) {
                                    try {
                                      await deleteDoc(doc(db, 'giftCodes', g.id));
                                    } catch (e) {
                                      handleFirestoreError(e, OperationType.DELETE, `giftCodes/${g.id}`);
                                    }
                                  }
                                }} className="absolute top-4 right-4 p-2 bg-fg/5 rounded-xl hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash size={16} />
                                </button>
                             </div>
                          ))}
                          {giftCodes.length === 0 && (
                            <div className="col-span-full py-12 text-center text-fg/40 border-2 border-dashed border-fg/10 rounded-3xl">
                              <Ticket size={48} className="mx-auto mb-4 opacity-20" />
                              <p>لا توجد كودات هدايا حاليا</p>
                            </div>
                          )}
                        </div>
                         {editingGiftCode && (
                            <GiftAdminModal 
                               giftCode={Object.keys(editingGiftCode).length === 0 ? null : editingGiftCode}
                               onClose={() => setEditingGiftCode(null)}
                               onSave={() => setEditingGiftCode(null)}
                            />
                         )}
                      </motion.div>
                    )}

                    {adminTab === 'accounts' && (
                      <motion.div
                        key="accounts-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">إدارة الأصناف والحسابات</h3>
                            <button
                              onClick={() => setEditingAccountCat({})}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                            >
                              إضافة صنف جديد
                            </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {accountCategories.map((ac) => (
                              <div key={ac.id} className="bg-panel border border-fg/10 rounded-3xl p-6 hover:shadow-xl transition-all relative group flex flex-col justify-between">
                                 <div>
                                    <div className="flex items-center gap-4 mb-4">
                                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${ac.bg} ${ac.color}`}>
                                          {ac.imageUrl ? (
                                            <img src={ac.imageUrl} alt={ac.title} className="w-full h-full object-cover" />
                                          ) : (
                                            <Monitor size={24} />
                                          )}
                                       </div>
                                       <div>
                                          <h3 className="font-bold text-lg leading-tight">{ac.title}</h3>
                                          <span className="text-xs text-fg/40 font-bold">{ac.count} حساب متوفر</span>
                                       </div>
                                    </div>
                                    <p className="text-sm text-fg/60 leading-relaxed mb-6 line-clamp-2">{ac.desc}</p>
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={() => setEditingAccountCat(ac)} className="grow p-3 bg-fg/5 rounded-xl hover:bg-fg/10 transition-colors font-bold text-sm flex items-center justify-center gap-2">
                                       <Edit2 size={16} />
                                       تعديل
                                     </button>
                                     <button onClick={async () => {
                                        if (confirm('تحذير: سيتم حذف هذا الصنف من واجهة الحسابات نهائيا. متأكد؟')) {
                                          try {
                                             await deleteDoc(doc(db, 'accountCategories', ac.id));
                                          } catch (e) {
                                            handleFirestoreError(e, OperationType.DELETE, `accountCategories/${ac.id}`);
                                          }
                                        }
                                     }} className="p-3 bg-fg/5 rounded-xl hover:bg-red-500 hover:text-white transition-colors text-red-500">
                                       <Trash size={16} />
                                     </button>
                                 </div>
                              </div>
                           ))}
                           {accountCategories.length === 0 && (
                              <div className="col-span-full py-12 text-center text-fg/40 border-2 border-dashed border-fg/10 rounded-3xl">
                                <Monitor size={48} className="mx-auto mb-4 opacity-20" />
                                <p>قم بإضافة أصناف حسابات جديدة للبيع</p>
                              </div>
                           )}
                         </div>
                         {editingAccountCat && (
                            <AccountAdminModal 
                               accountCat={Object.keys(editingAccountCat).length === 0 ? null : editingAccountCat}
                               onClose={() => setEditingAccountCat(null)}
                               onSave={() => setEditingAccountCat(null)}
                            />
                         )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'requests' && (
            <motion.div
              key="user-requests"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-7xl mx-auto px-4 py-8 mb-20 space-y-6"
            >
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                      <MessageSquare className="text-amber-400" />
                      طلباتي
                    </h2>
                    <p className="text-fg/40 text-sm">تابع حالة طلباتك للخدمات الإضافية</p>
                 </div>
                 <button onClick={() => setIsRequestModalOpen(true)} className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <Plus size={18} />
                    طلب خدمة جديدة
                 </button>
              </div>

              {serviceRequests.length === 0 ? (
                <div className="py-20 text-center bg-fg/[0.02] border border-fg/5 rounded-[3rem]">
                   <MessageSquare className="w-20 h-20 mx-auto mb-6 text-fg/20" />
                   <h3 className="text-xl font-bold mb-2">ما عندك حتى طلب حاليا</h3>
                   <p className="text-fg/40 mb-8 max-w-sm mx-auto">إذا كنت تفركس على خدمة مش موجودة في الموقع، تنجم تطلبها منا واحنا نوفروهالك.</p>
                   <button onClick={() => setIsRequestModalOpen(true)} className="bg-amber-400 text-black font-bold px-8 py-3 rounded-2xl">أطلب خدمة</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.map(req => (
                    <div key={req.id} className="bg-panel border border-fg/10 rounded-2xl px-6 py-5 hover:border-amber-500/50 transition-colors flex flex-col md:flex-row gap-4 justify-between md:items-center">
                       <div>
                         <h3 className="font-bold text-lg mb-1">{req.title}</h3>
                         <p className="text-sm text-fg/60 line-clamp-1">{req.description}</p>
                       </div>
                       <div className="flex items-center gap-4 shrink-0">
                         <span className="text-xs text-fg/40 font-mono">
                           {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'الآن'}
                         </span>
                         <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                            req.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                            req.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                            req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-red-500/10 text-red-500'
                         }`}>
                           {req.status === 'pending' ? 'قيد المراجعة' :
                            req.status === 'in-progress' ? 'قيد التنفيذ' :
                            req.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                         </span>
                         <button onClick={() => setSelectedRequestChat(req)} className="relative p-2 ml-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-xl transition-colors shrink-0">
                           <MessageSquare size={18} />
                           {req.unreadMessagesUser ? (
                             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                               {req.unreadMessagesUser}
                             </span>
                           ) : null}
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentTab === 'orders' && (
            <motion.div
              key="user-orders"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-7xl mx-auto px-4 py-8 mb-20"
            >
               <div className="flex items-center gap-4 mb-10">
                 <button onClick={() => setCurrentTab('profile')} className="w-12 h-12 bg-fg/5 hover:bg-fg/10 rounded-2xl flex items-center justify-center transition-all">
                   <ChevronRight size={24} />
                 </button>
                 <div>
                   <h2 className="text-3xl font-black">قائمة طلبياتي</h2>
                   <p className="text-fg/40 text-sm mt-1">يمكنك متابعة حالة الطلبيات الخاصة بك هنا</p>
                 </div>
               </div>

               {!user ? (
                  <div className="py-20 text-center bg-fg/[0.02] border border-fg/5 rounded-[3rem]">
                     <h2 className="text-xl font-bold mb-4">الرجاء تسجيل الدخول أولاً</h2>
                     <button onClick={handleLogin} className="px-8 py-3 bg-fg text-bg font-bold rounded-2xl hover:bg-violet-400 hover:text-white transition-all">تسجيل الدخول</button>
                  </div>
               ) : orders.length === 0 ? (
                  <div className="py-20 text-center bg-fg/[0.02] border border-fg/5 rounded-[3rem]">
                     <ShoppingBag size={48} className="mx-auto text-fg/20 mb-6" />
                     <h2 className="text-xl font-bold mb-4">ما عندك حتى طلبية حالياً</h2>
                     <button onClick={() => setCurrentTab('shop')} className="px-8 py-3 bg-violet-600 border border-violet-500 font-bold rounded-2xl hover:bg-violet-500 transition-all shadow-lg text-white">تسوق الآن</button>
                  </div>
               ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                       <div key={order.orderId} className="bg-fg/[0.02] border border-fg/5 rounded-[2.5rem] p-6 hover:bg-fg/[0.04] transition-all">
                          <div className="flex flex-wrap items-start justify-between gap-6 mb-6 pb-6 border-b border-fg/5">
                             <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-fg/40 mb-1">الطلب # {order.orderId.slice(-6)}</p>
                                <p className="font-bold">{order.createdAt?.toDate?.().toLocaleDateString('ar-TN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             <div className="text-left flex flex-col items-end gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                  order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                  order.status === 'paid' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                  'bg-violet-500/10 text-violet-500 border border-violet-500/20'
                                }`}>
                                  {order.status === 'completed' ? 'تم التنفيذ ✅' : 
                                   order.status === 'cancelled' ? 'ملغى ❌' : 
                                   order.status === 'paid' ? 'بانتظار التأكيد ⏳' : 
                                   'بانتظار الدفع 💳'}
                                </span>
                                <div className="mt-1 text-2xl font-black text-violet-400">
                                   {(Number(order.total) || 0).toFixed(3)}
                                   <span className="text-sm border-t-0 font-bold ml-1">DT</span>
                                </div>
                                <button
                                  onClick={() => setSelectedOrderChat(order)}
                                  className="w-full relative px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
                                >
                                  المحادثة
                                  {order.unreadMessagesUser ? (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                                      {order.unreadMessagesUser}
                                    </span>
                                  ) : null}
                                </button>
                             </div>
                          </div>
                          <div className="space-y-3">
                             {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-fg/5 rounded-2xl p-3">
                                   <div className="w-12 h-12 bg-fg/5 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                                      {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        item.image
                                      )}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="font-bold text-sm truncate">{item.name}</p>
                                      <p className="text-xs text-fg/40">الكمية: {item.quantity}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    ))}
                  </div>
               )}
            </motion.div>
          )}

          {currentTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-8 mb-20"
            >
              <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">حسابات</span> للبيع</h2>
                 <p className="text-fg/40 text-lg">أفضل الحسابات الجاهزة بأرخص الأسعار و التسليم فوري</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {accountCategories.map((cat, i) => (
                    <div key={i} className="bg-panel border border-fg/10 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-xl transition-all cursor-pointer group flex items-center gap-4">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                               <Monitor size={32} />
                            </div>
                          )}
                       </div>
                       <div>
                          <h3 className="font-black text-xl mb-1">{cat.title}</h3>
                          <p className="text-sm text-fg/40 mb-2">{cat.desc}</p>
                          <span className="text-xs font-bold px-2 py-1 bg-fg/5 rounded-lg">{cat.count} حساب متوفر</span>
                       </div>
                    </div>
                 ))}
                 {accountCategories.length === 0 && (
                   <div className="col-span-full py-12 text-center text-fg/40 border-2 border-dashed border-fg/10 rounded-3xl">
                     <p>لا توجد أصناف حاليا</p>
                   </div>
                 )}
              </div>

              <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                 <div className="relative z-10 space-y-4 max-w-xl">
                    <h3 className="text-3xl font-black">تحب تبيع حسابك؟</h3>
                    <p className="text-white/70 leading-relaxed text-sm">إذا كان عندك حساب تحب تبيعو (ألعاب، نتفليكس الخ...)، تنجم تتواصل معانا ونحنا نتكفلو بالباقي مقابل نسبة بسيطة مالمبيعات.</p>
                 </div>
                 <button onClick={() => setCurrentTab('contact')} className="relative z-10 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black hover:bg-white/90 transition-all flex items-center gap-2 shrink-0">
                    <Mail size={20} />
                    تواصل معنا للبيع
                 </button>
              </div>
            </motion.div>
          )}

          {currentTab === 'gift' && (
            <motion.div
              key="gift"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto px-4 py-8 mb-20"
            >
              <div className="text-center mb-16">
                 <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
                    <Gift size={40} className="animate-bounce" />
                    <Sparkles className="absolute -top-2 -right-2 text-amber-400" size={24} />
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-500">مكافآت</span> وهدايا</h2>
                 <p className="text-fg/40 text-lg">استعمل كود الهدية أو ابعث كادو لأصحابك</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Redeem Code */}
                 <div className="bg-panel border border-fg/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10 w-full">
                       <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                          <Ticket className="text-rose-400" />
                          عندك كود هدية؟
                       </h3>
                       <p className="text-sm text-fg/60 mb-8 leading-relaxed">إذا كان عندك كود برومو والا كود هدية، دخلو لهنا باش تتحصل على رصيد ولا تخفيض.</p>
                       
                       <div className="space-y-4">
                          <input 
                            type="text" 
                            placeholder="A1B2-C3D4-E5F6"
                            className="w-full bg-black/40 border border-fg/10 rounded-2xl px-6 py-5 font-mono text-center text-xl tracking-[0.25em] text-rose-400 outline-none focus:border-rose-500/50 transition-colors uppercase"
                            maxLength={14}
                          />
                          <button className="w-full py-4 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                             <CheckCircle2 size={20} />
                             استعمل الكود
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Buy a Gift Card */}
                 <div className="bg-gradient-to-br from-violet-600 to-indigo-700 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl text-white">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20 transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10 h-full flex flex-col w-full">
                       <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                          <CreditCard className="text-amber-400" />
                          إهدي كادو
                       </h3>
                       <p className="text-sm text-white/70 mb-8 leading-relaxed max-w-[90%]">تحب تفرح صاحبك ولا واحد من عايلتك؟ اشرتيلو بطاقة هدية و خليه يختار لي يحب من الموقع!</p>
                       
                       <div className="mt-auto space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                             {[10, 20, 50].map(amount => (
                               <button key={amount} className="bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl py-3 font-black text-lg transition-colors flex items-center justify-center gap-1">
                                  {amount} <span className="text-xs text-white/50">DT</span>
                               </button>
                             ))}
                          </div>
                          <button className="w-full py-4 bg-white text-violet-900 font-black rounded-2xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 mt-4">
                             <Gift size={20} />
                             شراء بطاقة هدية
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto px-4 py-8 mb-20"
            >
              <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">تواصل</span> معنا</h2>
                 <p className="text-fg/40 text-lg">نحن هنا للإجابة على جميع استفساراتك وتقديم الدعم اللازم</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* WhatsApp */}
                 <a href="https://wa.me/21655123456" target="_blank" rel="noopener noreferrer" className="bg-fg/[0.02] border border-fg/5 rounded-[2rem] p-8 flex items-center gap-6 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform">
                       <MessageCircle size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-1">واتساب</h3>
                       <p className="text-fg/40 text-sm mb-2">تواصل معنا مباشرة عبر واتساب</p>
                       <p className="font-mono font-bold text-lg text-emerald-400" dir="ltr">+216 55 123 456</p>
                    </div>
                 </a>

                 {/* Phone */}
                 <a href="tel:+21655123456" className="bg-fg/[0.02] border border-fg/5 rounded-[2rem] p-8 flex items-center gap-6 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all group">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform">
                       <Phone size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-1">الهاتف</h3>
                       <p className="text-fg/40 text-sm mb-2">اتصل بنا لأي مساعدة عاجلة</p>
                       <p className="font-mono font-bold text-lg text-amber-400" dir="ltr">+216 55 123 456</p>
                    </div>
                 </a>

                 {/* Facebook */}
                 <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-fg/[0.02] border border-fg/5 rounded-[2rem] p-8 flex items-center gap-6 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                       <Facebook size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-1">فيسبوك</h3>
                       <p className="text-fg/40 text-sm mb-2">تابع آخر العروض على صفحتنا</p>
                       <p className="font-bold text-blue-400">@StoreName</p>
                    </div>
                 </a>

                 {/* Instagram */}
                 <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-fg/[0.02] border border-fg/5 rounded-[2rem] p-8 flex items-center gap-6 hover:bg-pink-500/10 hover:border-pink-500/20 transition-all group">
                    <div className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform">
                       <Instagram size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-1">انستغرام</h3>
                       <p className="text-fg/40 text-sm mb-2">صور وفيديوهات لخدماتنا</p>
                       <p className="font-bold text-pink-400">@StoreName</p>
                    </div>
                 </a>
              </div>
            </motion.div>
          )}

          {currentTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-4 py-8 mb-20"
            >
              <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">الأسئلة</span> الشائعة</h2>
                 <p className="text-fg/40 text-lg">كل ما تحتاج لمعرفته حول خدماتنا وطرق الدفع</p>
              </div>

              <div className="space-y-4">
                {[
                   { 
                     q: 'كيفاش نجم نشري من الموقع؟', 
                     a: 'عملية الشراء ساهلة برشا: تختار المنتج لي حاجتك بيه، تزيدو للسلة، وتكمل الطلب. مبعد تتوجه لقسم "محادثة الطلب" وين تلقى تفاصيل الدفع. بعد ما تخلص، تبعث وصول الدفع في المحادثة ويوصلك طلبك في أقرب وقت.' 
                   },
                   { 
                     q: 'شنوما طرق الدفع المتاحة؟', 
                     a: 'نوفرولك برشا طرق دفع باش نسهلولك العملية: تنجم تخلص عبر D17، تحويل بنكي (Virement Bancaire)، أو عبر تطبيقات الدفع كيما Flouci وغيرها. كل التفاصيل تلقاها بوضوح وقت تأكيد الطلب.' 
                   },
                   { 
                     q: 'قداش ياخو وقت باش يوصلني الطلب؟', 
                     a: 'أغلب الطلبات كيما الاشتراكات والبطاقات توصلك بصفة فورية أو في خلال دقائق معدودة بعد تأكيد الدفع من طرف الفريق متاعنا. في حالات نادرة نجمو نوخرو شوية أما ديما نحاولو نكونو في الموعد.' 
                   },
                   { 
                     q: 'كيفاش نعرف لي الدفع متعي تقبل؟', 
                     a: 'بعد ما تبعث تصويرة وصول الدفع في المحادثة الخاصة بالطلب متاعك، باش يتم مراجعتها من فريقنا الإداري. كيف يتم التأكد، حالة الطلب باش تتبدل لـ "مكتمل" ويجيك التأكيد غادي زادة.' 
                   },
                   { 
                     q: 'نجم نلغي الطلب متاعي؟', 
                     a: 'تنجم تلغي الطلب متاعك في أي وقت مادامك مازلت ما دفعتش. أما إذا كان تمت عملية الدفع وتأكدت، ما عادش فما إمكانية للإلغاء خاصة للبطاقات الرقمية والاشتراكات.' 
                   },
                   { 
                     q: 'الحسابات المشرية مضمونة؟', 
                     a: 'أكيد! كل الحسابات والاشتراكات والبطاقات لي تتباع على منصتنا مضمونة 100%. و كان لا قدر الله فما أي إشكال، فريق الدعم الفني ديما متواجد باش يعاونك ويحل المشكل في أسرع وقت.' 
                   }
                ].map((faq, idx) => (
                   <FAQItem key={idx} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </motion.div>
          )}

          {currentTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto px-4 py-12 mb-20"
            >
              {!user ? (
                <div className="py-20 text-center bg-fg/[0.02] border border-fg/5 rounded-[3rem]">
                   <AtlasLogo className="w-20 h-20 mx-auto mb-8 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                   <h2 className="text-2xl font-bold mb-4">وينك يا غالي؟</h2>
                   <p className="text-fg/40 mb-10 px-6">لازمك تسجل دخولك باش تنجم تتحكم في الحساب متاعك و تشوف الطلبيات متاعك.</p>
                   <button onClick={handleLogin} className="px-10 py-4 bg-fg text-bg font-bold rounded-2xl hover:bg-violet-400 hover:text-white transition-all">تسجيل الدخول</button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-fg/[0.02] border border-fg/5 rounded-[3.5rem] overflow-hidden relative group shadow-2xl">
                    <div className="h-40 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
                    <div className="px-10 pb-12 -mt-20 text-center relative z-10">
                      <div className="relative inline-block">
                       {user.photoURL ? (
                         <img 
                           src={user.photoURL} 
                           alt="" 
                           className="w-32 h-32 rounded-[3.5rem] border-4 border-violet-600/30 shadow-2xl group-hover:scale-105 transition-transform object-cover" 
                         />
                       ) : (
                         <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-4xl font-black">
                            {user.displayName?.[0] || 'A'}
                         </div>
                       )}
                       <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center border-4 border-bg shadow-lg">
                          <Star size={16} className="text-white" />
                       </div>
                    </div>
                    <div className="mt-8">
                       <h2 className="text-4xl font-black tracking-tight">Mohamed Amine Hasni</h2>
                       <p className="text-fg/40 font-mono text-sm mt-2">{user.email}</p>
                    </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        <span className="px-4 py-1.5 bg-fg/5 border border-fg/10 rounded-full text-[10px] font-black uppercase tracking-widest text-fg/40">Atlas Member</span>
                        <span className="px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-violet-400">Verified Profile</span>
                      </div>
                      
                      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                        <button 
                          onClick={() => setCurrentTab('orders')}
                          className="flex flex-col items-center gap-2 p-6 bg-fg/5 border border-fg/10 rounded-3xl hover:bg-fg/10 transition-all group/btn"
                        >
                          <ShoppingBag size={24} className="text-violet-400 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xs font-bold">طلبياتي</span>
                        </button>
                        <button 
                          onClick={() => setCurrentTab('requests')}
                          className="flex flex-col items-center gap-2 p-6 bg-fg/5 border border-fg/10 rounded-3xl hover:bg-fg/10 transition-all group/btn"
                        >
                          <MessageSquare size={24} className="text-amber-400 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xs font-bold">طلباتي</span>
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="flex flex-col items-center gap-2 p-6 bg-red-500/5 border border-red-500/10 rounded-3xl hover:bg-red-500/10 transition-all text-red-500 group/btn col-span-2 md:col-span-1"
                        >
                          <LogOut size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                          <span className="text-xs font-bold">تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-fg/[0.01] border border-fg/5 rounded-[3rem] space-y-6">
                    <h3 className="text-sm font-bold opacity-60 px-4 text-right uppercase tracking-[0.2em] border-r-2 border-violet-500 mr-2">Account Details</h3>
                    <div className="flex flex-col gap-2">
                       <div className="p-6 bg-fg/5 rounded-3xl border border-fg/5 flex items-center justify-between hover:bg-fg/[0.07] transition-colors">
                          <p className="font-bold opacity-80">{user.email}</p>
                          <p className="text-[10px] font-bold text-fg/20 uppercase tracking-widest">Email Address</p>
                       </div>
                       <div className="p-6 bg-fg/5 rounded-3xl border border-fg/5 flex items-center justify-between hover:bg-fg/[0.07] transition-colors">
                          <p className="font-bold opacity-80">{profile?.createdAt?.toDate?.().toLocaleDateString() || 'Premium Member'}</p>
                          <p className="text-[10px] font-bold text-fg/20 uppercase tracking-widest">Member Since</p>
                       </div>
                       <button onClick={() => setRunTour(true)} className="p-6 bg-fg/5 rounded-3xl border border-fg/5 flex items-center justify-between hover:bg-fg/[0.07] transition-colors">
                          <HelpCircle size={18} className="text-fg/40 ml-4 hidden md:block" />
                          <p className="font-bold opacity-80 w-full md:w-auto text-right md:text-left">إعادة شرح واجهة الموقع</p>
                          <p className="text-[10px] font-bold text-fg/20 uppercase tracking-widest hidden md:block">Site Tour</p>
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits Section - Moved inside of main content check or just simplified */}
        {currentTab === 'shop' && (
          <section className="max-w-7xl mx-auto px-4 py-24 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[4rem] mb-32 text-white relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(139,92,246,0.2)]">
            <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-1000" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-right relative z-10">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-fg/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-fg/20 mx-auto md:mr-0 md:ml-auto">
                  <Zap size={32} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">سرعة Atlas</h3>
                <p className="font-medium text-fg/80 leading-relaxed text-lg">خلّص و خوذ كودك في لحظة. السيستام متاعنا يخدم وحدو باش ما تخسرش وقتك.</p>
              </div>
              <div className="space-y-6">
                <div className="w-16 h-16 bg-fg/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-fg/20 mx-auto md:mr-0 md:ml-auto">
                  <ShieldCheck size={32} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">أمان Vault</h3>
                <p className="font-medium text-fg/80 leading-relaxed text-lg">كل شي رسمي و مضمون. AtlasVault تضمنلك جودة الخدمة و أمان الكونت متاعك مدى الحياة.</p>
              </div>
              <div className="space-y-6">
                <div className="w-16 h-16 bg-fg/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-fg/20 mx-auto md:mr-0 md:ml-auto">
                  <MessageCircle size={32} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Support تونسي</h3>
                <p className="font-medium text-fg/80 leading-relaxed text-lg">فريقنا التونسي موجود معاك 24/7. كلمنا على WhatsApp في أي وقت كان حقتك مساعدة.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {isRequestModalOpen && user && (
         <ServiceRequestModal
           isOpen={isRequestModalOpen}
           onClose={() => setIsRequestModalOpen(false)}
           userId={user.uid}
           userEmail={user.email || undefined}
         />
      )}

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl z-[-1]"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-[3rem] bg-panel border-0 md:border border-fg/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col shadow-violet-500/10"
            >
              {/* Top Navigation Bar with Page Sections */}
              <div className="absolute top-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-b from-panel via-panel/80 to-transparent z-50 px-6 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-fg/10 hover:bg-fg/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
                <div className="flex bg-panel/80 backdrop-blur-xl p-1.5 md:p-2 rounded-full border border-fg/10 shadow-lg relative">
                   <button onClick={() => document.getElementById('pd-desc')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold text-fg/60 hover:text-fg hover:bg-fg/10 transition-all cursor-pointer">التفاصيل</button>
                   <button onClick={() => document.getElementById('pd-features')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold text-fg/60 hover:text-fg hover:bg-fg/10 transition-all cursor-pointer">المميزات</button>
                   <button onClick={() => document.getElementById('pd-reviews')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold text-fg/60 hover:text-fg hover:bg-fg/10 transition-all cursor-pointer">الآراء</button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pt-20 md:pt-0">
                {/* Hero / Banner Section */}
                <div className="relative w-full h-[40vh] md:h-[50vh] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:20px_20px]" />
                  <motion.div 
                    initial={{ scale: 0.5, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-full h-full flex items-center justify-center z-10 drop-shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
                  >
                    {selectedProduct.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-contain p-8 md:p-12" />
                    ) : (
                      <span className="text-[8rem] md:text-[12rem]">{selectedProduct.image}</span>
                    )}
                  </motion.div>
                  <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                    <span className="font-black text-sm md:text-base text-white">{selectedProduct.rating}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-12 text-right">
                  {/* Title & Category */}
                  <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
                    {selectedProduct.duration && (
                      <span className="px-4 py-1.5 bg-fg/5 rounded-xl border border-fg/5 text-xs font-bold text-fg/60">{selectedProduct.duration}</span>
                    )}
                    <span className="px-4 py-1.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 text-xs font-black uppercase tracking-widest">{selectedProduct.category}</span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">{selectedProduct.name}</h1>
                  
                  <div id="pd-desc" className="scroll-mt-32">
                    <h3 className="text-sm font-bold text-fg/40 uppercase tracking-widest mb-4">الوصف</h3>
                    <p className="text-lg md:text-xl text-fg/80 leading-relaxed font-medium mb-16">
                      {selectedProduct.description || `استمتع بأفضل تجربة مع ${selectedProduct.name}. اشتراكات رسمية 100% مع ضمان كامل وتفعيل فوري للخدمة.`}
                    </p>
                  </div>

                  <div id="pd-features" className="scroll-mt-32 mb-16">
                    <h3 className="text-sm font-bold text-fg/40 uppercase tracking-widest mb-6">مميزات الخدمة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedProduct.features || [
                        "تفعيل فوري ورسمي 100%",
                        "دعم فني تونسي على مدار الساعة",
                        "ضمان كامل طيلة فترة الاشتراك",
                        "تحديثات مستمرة وبدون انقطاع"
                      ]).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-fg/[0.02] hover:bg-fg/[0.04] transition-colors p-5 rounded-2xl border border-fg/5">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} className="text-violet-400" />
                          </div>
                          <span className="font-bold text-sm md:text-base text-fg/90">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProduct.options && selectedProduct.options.length > 0 && (
                    <div id="pd-options" className="scroll-mt-32 mb-16">
                      <h3 className="text-sm font-bold text-fg/40 uppercase tracking-widest mb-6">خيارات الخدمة</h3>
                      <div className="flex flex-col gap-3">
                        {selectedProduct.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedOptionIndex(idx)}
                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-right ${
                              selectedOptionIndex === idx
                                ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                                : 'border-fg/10 bg-fg/[0.02] hover:border-violet-500/30 hover:bg-fg/[0.04]'
                            }`}
                          >
                            <span className="font-bold text-lg text-fg">{option.name}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-violet-400">{option.price}</span>
                              <span className="text-xs font-bold text-violet-400/60">DT</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div id="pd-reviews" className="scroll-mt-32 mb-8">
                    <h3 className="text-sm font-bold text-fg/40 uppercase tracking-widest mb-6">آراء الحرفاء</h3>
                    <div className="space-y-4">
                      {mockReviews.map((review, i) => (
                        <div key={i} className="bg-fg/[0.02] p-6 rounded-3xl border border-fg/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1 text-yellow-500">
                              {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" />)}
                            </div>
                            <span className="font-bold text-sm bg-fg/5 px-3 py-1 rounded-lg">{review.user}</span>
                          </div>
                          <p className="text-fg/70 font-medium leading-relaxed">{review.comment}</p>
                          <span className="text-[10px] font-bold text-fg/30 mt-4 block">{review.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Spacer so content doesn't get hidden behind bottom bar */}
                <div className="h-32"></div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-panel/90 backdrop-blur-2xl border-t border-fg/5 p-4 md:p-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-8">
                   <div className="text-right">
                     <span className="text-[10px] font-bold text-fg/40 uppercase block mb-1">السعر النهائي</span>
                     <div className="flex items-baseline gap-2">
                       <span className="text-4xl md:text-5xl font-black text-white">
                         {selectedProduct.options && selectedProduct.options.length > 0 
                           ? selectedProduct.options[selectedOptionIndex]?.price 
                           : selectedProduct.price}
                       </span>
                       <span className="text-lg font-bold text-violet-400">DT</span>
                     </div>
                   </div>
                   
                   {/* Next/Prev Navigation */}
                   <div className="flex gap-2">
                      <button 
                         onClick={() => {
                           const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
                           if (currentIndex > 0) { setSelectedProduct(products[currentIndex - 1]); setSelectedOptionIndex(0); }
                         }}
                         disabled={products.findIndex(p => p.id === selectedProduct.id) <= 0}
                         className="w-12 h-12 rounded-full bg-fg/5 hover:bg-fg/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-fg/5 cursor-pointer"
                         aria-label="المنتج السابق"
                      >
                         <ChevronRight size={24} className="text-fg/60" />
                      </button>
                      <button 
                         onClick={() => {
                           const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
                           if (currentIndex < products.length - 1) { setSelectedProduct(products[currentIndex + 1]); setSelectedOptionIndex(0); }
                         }}
                         disabled={products.findIndex(p => p.id === selectedProduct.id) >= products.length - 1}
                         className="w-12 h-12 rounded-full bg-fg/5 hover:bg-fg/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-fg/5 cursor-pointer"
                         aria-label="المنتج التالي"
                      >
                         <ChevronLeft size={24} className="text-fg/60" />
                      </button>
                   </div>
                </div>
                
                <button 
                  onClick={() => { 
                    addToCart(selectedProduct, selectedProduct.options ? selectedProduct.options[selectedOptionIndex] : undefined); 
                    setSelectedProduct(null); 
                  }}
                  className="w-full md:w-auto min-w-[280px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-lg py-5 px-8 rounded-full shadow-[0_20px_40px_-10px_rgba(139,92,246,0.6)] hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShoppingBag size={24} />
                  اطلب هذه الخدمة
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-fg/5 py-24 px-4 bg-panel">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 text-right">
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-start md:justify-end">
              <AtlasLogo className="w-10 h-10" />
              <span className="text-2xl font-black tracking-tighter text-fg">ATLASVAULT</span>
            </div>
            <p className="text-fg/30 text-sm leading-relaxed">أقوى ماركت الرقمية في تونس. صنعناها للتوانسة الي يحبو يطيرو في العالم الرقمي.</p>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-xs text-violet-400">شنوة عندنا</h4>
            <ul className="space-y-4 text-sm text-fg/40">
              <li className="hover:text-violet-400 cursor-pointer transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-violet-500 rounded-full" /> اشتراكات الذكاء الاصطناعي</li>
              <li className="hover:text-violet-400 cursor-pointer transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-violet-500 rounded-full" /> ستريمينغ و IPTV</li>
              <li className="hover:text-violet-400 cursor-pointer transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-violet-500 rounded-full" /> ألعاب و شحن</li>
              <li className="hover:text-violet-400 cursor-pointer transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-violet-500 rounded-full" /> برمجيات احترافية</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-xs text-violet-400">الشركة</h4>
            <ul className="space-y-4 text-sm text-fg/40">
              <li className="hover:text-violet-400 cursor-pointer transition-colors">من نحن؟</li>
              <li className="hover:text-violet-400 cursor-pointer transition-colors">قوانين الخدمة</li>
              <li className="hover:text-violet-400 cursor-pointer transition-colors">الخصوصية</li>
              <li className="hover:text-violet-400 cursor-pointer transition-colors">أتصل بنا</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-xs text-violet-400">تواصل معانا</h4>
            <div className="flex items-center gap-4 justify-end">
              <div className="w-12 h-12 rounded-2xl bg-fg/[0.03] border border-fg/10 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all cursor-pointer shadow-lg hover:translate-y-[-4px]">
                <MessageCircle size={20} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-fg/[0.03] border border-fg/10 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all cursor-pointer shadow-lg hover:translate-y-[-4px]">
                <Zap size={20} />
              </div>
            </div>
            <p className="mt-8 text-[10px] font-bold text-fg/20">© 2024 AtlasVault Protocol. كل الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {selectedOrderChat && user && (
        <OrderChatModal
          order={selectedOrderChat}
          currentUser={user}
          profile={profile}
          onClose={() => setSelectedOrderChat(null)}
        />
      )}

      {selectedRequestChat && user && (
        <RequestChatModal
          request={selectedRequestChat}
          currentUser={user}
          profile={profile}
          onClose={() => setSelectedRequestChat(null)}
        />
      )}
    </div>
  );
}
