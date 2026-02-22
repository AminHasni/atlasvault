
import { ServiceCategory, ServiceItem, CategoryMeta } from './types';
import { Shield, Smartphone, Gamepad2, Briefcase } from 'lucide-react';

export const LEGAL_CONTENT = {
  terms: {
    title: "Terms & Conditions",
    content: `Effective Date: ${new Date().toLocaleDateString()}

These Terms & Conditions (“Agreement”) govern the access and use of the website and services provided by Atlas Vault (“Company”, “we”, “us”, or “our”). By accessing our services, you agree to be bound by this Agreement.

1. Service Description
Atlas Vault provides digital service facilitation including but not limited to:
• Subscription activation assistance
• Digital code procurement
• Gaming currency processing
• Telecom recharge facilitation
• Invoice payment assistance
• Advertising campaign setup and management

Atlas Vault operates as an independent intermediary service provider and is not affiliated with or endorsed by any third-party platform referenced on this website.

2. Independent Relationship
Atlas Vault is not:
• An official distributor of third-party platforms unless explicitly stated
• A partner, agent, or affiliate of brands listed on the website

All trademarks, logos, and service names are the property of their respective owners.

3. User Responsibilities
Users agree to:
• Provide accurate and complete information
• Own or have authorization to use any account submitted for activation
• Comply with third-party platform rules and policies
• Use purchased services lawfully

Atlas Vault shall not be responsible for any account restriction or suspension caused by user violations of platform policies.

4. Payments & Pricing
• All prices are displayed in TND.
• Payment must be completed before service processing begins.
• Pricing may change without prior notice.
• Atlas Vault reserves the right to refuse service in cases of suspected fraud, abuse, or policy violations.

5. Delivery of Digital Services
Digital services are considered delivered once:
• Subscription activation is confirmed
• Digital codes are transmitted
• Game currency is successfully applied
• Invoice payments are confirmed

Due to the intangible nature of digital services, delivery is final upon confirmation.

6. Refund Policy Reference
Refunds are governed strictly by our Refund Policy. By purchasing, users acknowledge and accept the refund conditions stated therein.

7. Limitation of Liability
Atlas Vault shall not be liable for:
• Platform policy changes
• Regional restrictions imposed by third-party providers
• Service interruptions outside our control
• Indirect, incidental, or consequential damages

Maximum liability is limited to the amount paid for the specific service.

8. Fraud & Chargeback Policy
Initiating unauthorized chargebacks after confirmed service delivery may result in:
• Immediate service suspension
• Permanent account restriction
• Reporting to payment providers
• Legal recovery procedures

We reserve the right to submit activation proof in case of dispute.

9. Modifications
Atlas Vault may update these Terms at any time. Continued use of services constitutes acceptance of modifications.

10. Governing Law
This Agreement shall be governed by the laws applicable within the Republic of Tunisia.`
  },
  disclaimer: {
    title: "Legal Disclaimer",
    content: `Atlas Vault is an independent digital service facilitator.

We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with:
• Streaming platforms
• Social media platforms
• Gaming companies
• AI software providers
• Telecommunications operators

All trademarks and brand names belong to their respective owners.

Atlas Vault does not guarantee platform decisions such as:
• Verification approvals
• Account growth
• Revenue generation
• Platform eligibility status

All services are limited to facilitation, activation assistance, or management within the official functionality provided by each platform.`
  },
  privacy: {
    title: "Privacy Policy",
    content: `Effective Date: ${new Date().toLocaleDateString()}

1. Overview
Atlas Vault is committed to protecting personal information in accordance with applicable data protection principles.

2. Information Collected
We may collect:
• Name
• Email address
• Phone number
• Transaction data
• Service-related identifiers (usernames)

We do not store sensitive payment data such as full card numbers.

3. Purpose of Data Collection
Information is collected for:
• Service fulfillment
• Payment verification
• Fraud prevention
• Customer communication
• Legal compliance

4. Credential Handling
Where temporary account access is required:
• Credentials are used solely for service activation
• We recommend temporary passwords
• Passwords are not stored beyond service completion

5. Data Security Measures
We implement reasonable technical safeguards including:
• Encrypted website connection (SSL)
• Restricted internal access
• Transaction logging

However, no digital transmission is 100% secure.

6. Data Retention
Transaction records may be retained for accounting and dispute resolution purposes. Personal data may be deleted upon valid request, subject to legal retention obligations.

7. Third-Party Processing
Payments and certain service components may be processed via third-party providers who maintain their own privacy policies. Atlas Vault is not responsible for external privacy practices.

8. User Rights
Users may request:
• Access to stored information
• Correction of inaccurate data
• Deletion where legally permissible

Requests must be submitted via official contact channels.`
  },
  refund: {
    title: "Refund Policy",
    content: `Effective Date: ${new Date().toLocaleDateString()}

1. General Policy
Due to the intangible nature of digital services and products provided by Atlas Vault, all sales are considered final once the service has been delivered or the process has been initiated.

2. Eligibility for Refunds
Refunds may be considered under the following circumstances:
• The service could not be delivered due to technical issues on our end.
• The provided digital code or account is proven to be invalid upon delivery.
• The order was cancelled before processing began.

3. Non-Refundable Cases
• User changed their mind after delivery.
• User provided incorrect account details or identifiers.
• Account restriction due to user violation of third-party platform policies.
• Partial delivery where the remaining service can still be fulfilled.

4. Dispute Resolution
Before initiating a chargeback, users must contact support to resolve any issues. Unauthorized chargebacks will result in a permanent ban.`
  }
};

export const TRANSLATIONS = {
  en: {
    searchPlaceholder: "Search services...",
    searchCategoryPlaceholder: "Search in this category...",
    searchAll: "Search all services...",
    filters: "Filters",
    sortBy: "Sort By",
    priceRange: "Price Range",
    searchScope: "Search Scope",
    searchAllCategories: "Search All Categories",
    heroTitle: "Welcome to ATLASVAULT",
    heroSubtitle: "Premium Digital Services",
    heroDesc: "Discover elite solutions tailored for the modern digital lifestyle. From secure storage to global connectivity and gaming dominance, we curate the best for you.",
    browseCatalog: "Browse Catalog",
    viewAll: "View All",
    noServices: "No services found matching your criteria.",
    startOrder: "Start Your Order",
    email: "Email Address",
    phone: "Phone Number",
    details: "Required Identifier / Details",
    orderWhatsApp: "Order via WhatsApp",
    similarServices: "Similar Services",
    home: "Home",
    myOrders: "My Orders",
    contactSales: "Contact Sales",
    customSolutions: "Custom Solutions?",
    customSolutionsDesc: "Contact sales for enterprise packages.",
    adminConsole: "Admin Console",
    serviceCatalog: "Service Catalog",
    dashboard: "Dashboard",
    catalogServices: "Catalog Services",
    orders: "Orders",
    userDirectory: "User Directory",
    exitAdmin: "Exit Admin Mode",
    switchToAdmin: "Switch to Admin",
    management: "Management",
    main: "Main",
    categories: "Categories",
    welcomeBack: "Welcome Back",
    access: "Access",
    logOut: "Log Out",
    enterEmail: "Enter your email address to access your order dashboard.",
    noOrders: "No Orders Found",
    description: "Description",
    conditions: "Conditions",
    requirements: "Requirements",
    pricePerUnit: "per unit",
    active: "Active",
    inactive: "Inactive",
    price: "Price",
    service: "Service",
    customer: "Customer",
    status: "Status",
    date: "Date",
    actions: "Actions",
    newest: "Newest Arrivals",
    popularity: "Popularity",
    nameAz: "Name: A - Z",
    globalSearch: "Global Search Results",
    searchResults: "Search Results",
    searching: "Searching",
    showingResults: "Showing results for",
    tryAdjusting: "Try adjusting your filters or search query.",
    login: "Log In",
    register: "Register",
    password: "Password",
    name: "Full Name",
    confirmPassword: "Confirm Password",
    alreadyAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    profile: "Profile",
    updateProfile: "Update Profile",
    loginToAccess: "Log in to access account features",
    guestMode: "Guest Mode",
    admin: "Admin",
    user: "User",
    accountType: "Account Type",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    invalidCredentials: "Invalid email or password",
    emailExists: "Email already registered",
    passwordsDoNotMatch: "Passwords do not match",
    accountCreated: "Account created successfully",
    loginSuccess: "Logged in successfully",
    profileUpdated: "Profile updated successfully",
    role: "Role",
    reviews: "Reviews",
    writeReview: "Write a Review",
    rating: "Rating",
    comment: "Comment",
    submitReview: "Submit Review",
    noReviews: "No reviews yet. Be the first to review!",
    loginToReview: "Please log in to leave a review.",
    favorites: "Favorites",
    myFavorites: "My Favorites",
    reviewAdded: "Review submitted successfully",
    loginGoogle: "Continue with Google",
    or: "or",
    settings: "Settings",
    general: "General",
    appearance: "Appearance",
    language: "Language",
    account: "Account",
    notifications: "Notifications",
    security: "Security",
    about: "About",
    themeLight: "Light",
    themeDark: "Dark",
    enableNotifs: "Enable Notifications",
    marketing: "Marketing Emails",
    appVersion: "App Version",
    themeDesc: "Customize the look and feel",
    langDesc: "Choose your preferred language",
    notifDesc: "Manage your communication preferences",
    legal: "Legal",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    disclaimer: "Legal Disclaimer",
    rightsReserved: "All rights reserved.",
    acceptTerms: "I agree to the Terms & Conditions and Privacy Policy",
    refundPolicy: "Refund Policy",
    cancelOrder: "Cancel Order",
    cancelOrderConfirm: "Are you sure you want to cancel this order?",
    orderCancelled: "Order cancelled successfully",
    subcategory: "Subcategory",
    all: "All"
  },
  fr: {
    searchPlaceholder: "Rechercher...",
    searchCategoryPlaceholder: "Rechercher dans cette catégorie...",
    searchAll: "Rechercher partout...",
    filters: "Filtres",
    sortBy: "Trier par",
    priceRange: "Fourchette de prix",
    searchScope: "Portée",
    searchAllCategories: "Toutes catégories",
    heroTitle: "Bienvenue sur ATLASVAULT",
    heroSubtitle: "Services Numériques Premium",
    heroDesc: "Découvrez des solutions d'élite pour votre style de vie numérique. Du stockage sécurisé à la connectivité mondiale et au gaming, nous sélectionnons le meilleur pour vous.",
    browseCatalog: "Voir le Catalogue",
    viewAll: "Voir tout",
    noServices: "Aucun service trouvé correspondant à vos critères.",
    startOrder: "Commencer la Commande",
    email: "Adresse Email",
    phone: "Numéro de Téléphone",
    details: "Détails / Identifiant Requis",
    orderWhatsApp: "Commander via WhatsApp",
    similarServices: "Services Similaires",
    home: "Accueil",
    myOrders: "Mes Commandes",
    contactSales: "Contacter Ventes",
    customSolutions: "Solutions Sur Mesure ?",
    customSolutionsDesc: "Contactez les ventes pour les offres entreprise.",
    adminConsole: "Console Admin",
    serviceCatalog: "Catalogue de Services",
    dashboard: "Tableau de Bord",
    catalogServices: "Services du Catalogue",
    orders: "Commandes",
    userDirectory: "Annuaire Utilisateurs",
    exitAdmin: "Quitter Mode Admin",
    switchToAdmin: "Passer en Admin",
    management: "Gestion",
    main: "Principal",
    categories: "Catégories",
    welcomeBack: "Bon retour",
    access: "Accéder",
    logOut: "Déconnexion",
    enterEmail: "Entrez votre email pour accéder à votre tableau de bord.",
    noOrders: "Aucune commande trouvée",
    description: "Description",
    conditions: "Conditions",
    requirements: "Prérequis",
    pricePerUnit: "par unité",
    active: "Actif",
    inactive: "Inactif",
    price: "Prix",
    service: "Service",
    customer: "Client",
    status: "Statut",
    date: "Date",
    actions: "Actions",
    newest: "Plus récents",
    popularity: "Popularité",
    nameAz: "Nom: A - Z",
    globalSearch: "Résultats de Recherche Globale",
    searchResults: "Résultats de Recherche",
    searching: "Recherche",
    showingResults: "Résultats pour",
    tryAdjusting: "Essayez d'ajuster vos filtres ou votre recherche.",
    login: "Connexion",
    register: "Inscription",
    password: "Mot de passe",
    name: "Nom Complet",
    confirmPassword: "Confirmer le mot de passe",
    alreadyAccount: "Déjà un compte ?",
    noAccount: "Pas encore de compte ?",
    profile: "Profil",
    updateProfile: "Mettre à jour le profil",
    loginToAccess: "Connectez-vous pour accéder aux fonctionnalités",
    guestMode: "Mode Invité",
    admin: "Admin",
    user: "Utilisateur",
    accountType: "Type de compte",
    saveChanges: "Enregistrer",
    cancel: "Annuler",
    invalidCredentials: "Email ou mot de passe invalide",
    emailExists: "Email déjà enregistré",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    accountCreated: "Compte créé avec succès",
    loginSuccess: "Connexion réussie",
    profileUpdated: "Profil mis à jour avec succès",
    role: "Rôle",
    reviews: "Avis",
    writeReview: "Écrire un avis",
    rating: "Note",
    comment: "Commentaire",
    submitReview: "Soumettre",
    noReviews: "Aucun avis pour le moment. Soyez le premier !",
    loginToReview: "Veuillez vous connecter pour laisser un avis.",
    favorites: "Favoris",
    myFavorites: "Mes Favoris",
    reviewAdded: "Avis soumis avec succès",
    loginGoogle: "Continuer avec Google",
    or: "ou",
    settings: "Paramètres",
    general: "Général",
    appearance: "Apparence",
    language: "Langue",
    account: "Compte",
    notifications: "Notifications",
    security: "Sécurité",
    about: "À propos",
    themeLight: "Clair",
    themeDark: "Sombre",
    enableNotifs: "Activer les notifications",
    marketing: "Emails Marketing",
    appVersion: "Version de l'application",
    themeDesc: "Personnalisez l'apparence",
    langDesc: "Choisissez votre langue préférée",
    notifDesc: "Gérez vos préférences de communication",
    legal: "Juridique",
    terms: "Termes & Conditions",
    privacy: "Politique de Confidentialité",
    disclaimer: "Avis de Non-responsabilité",
    rightsReserved: "Tous droits réservés.",
    acceptTerms: "J'accepte les conditions générales et la politique de confidentialité",
    refundPolicy: "Politique de Remboursement",
    cancelOrder: "Annuler la Commande",
    cancelOrderConfirm: "Êtes-vous sûr de vouloir annuler cette commande ?",
    orderCancelled: "Commande annulée avec succès",
    subcategory: "Sous-catégorie",
    all: "Tout"
  },
  ar: {
    searchPlaceholder: "البحث عن الخدمات...",
    searchCategoryPlaceholder: "البحث في هذه الفئة...",
    searchAll: "البحث في جميع الخدمات...",
    filters: "تصنيفات",
    sortBy: "ترتيب حسب",
    priceRange: "نطاق السعر",
    searchScope: "نطاق البحث",
    searchAllCategories: "جميع الفئات",
    heroTitle: "مرحبًا بكم في ATLASVAULT",
    heroSubtitle: "خدمات رقمية متميزة",
    heroDesc: "اكتشف حلول النخبة المصممة لنمط الحياة الرقمي الحديث. من التخزين الآمن إلى الاتصال العالمي والألعاب، نختار الأفضل لك.",
    browseCatalog: "تصفح الكتالوج",
    viewAll: "عرض الكل",
    noServices: "لم يتم العثور على خدمات مطابقة لمعاييرك.",
    startOrder: "ابدأ طلبك",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    details: "المعرف المطلوب / التفاصيل",
    orderWhatsApp: "اطلب عبر واتساب",
    similarServices: "خدمات مماثلة",
    home: "الرئيسية",
    myOrders: "طلباتي",
    contactSales: "الاتصال بالمبيعات",
    customSolutions: "حلول مخصصة؟",
    customSolutionsDesc: "اتصل بالمبيعات لباقات الشركات.",
    adminConsole: "وحدة تحكم المشرف",
    serviceCatalog: "كتالوج الخدمات",
    dashboard: "لوحة التحكم",
    catalogServices: "خدمات الكتالوج",
    orders: "الطلبات",
    userDirectory: "دليل المستخدمين",
    exitAdmin: "خروج من وضع المشرف",
    switchToAdmin: "التبديل إلى المشرف",
    management: "إدارة",
    main: "رئيسي",
    categories: "الفئات",
    welcomeBack: "مرحبًا بعودتك",
    access: "دخول",
    logOut: "تسجيل الخروج",
    enterEmail: "أدخل بريدك الإلكتروني للوصول إلى لوحة تحكم طلباتك.",
    noOrders: "لم يتم العثور على طلبات",
    description: "الوصف",
    conditions: "الشروط",
    requirements: "المتطلبات",
    pricePerUnit: "للوحدة",
    active: "نشط",
    inactive: "غير نشط",
    price: "السعر",
    service: "الخدمة",
    customer: "العميل",
    status: "الحالة",
    date: "التاريخ",
    actions: "إجراءات",
    newest: "الأحدث",
    popularity: "الأكثر شعبية",
    nameAz: "الاسم: أ - ي",
    globalSearch: "نتائج البحث الشامل",
    searchResults: "نتائج البحث",
    searching: "جاري البحث",
    showingResults: "إظهار النتائج لـ",
    tryAdjusting: "حاول تعديل الفلاتر أو استعلام البحث.",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    password: "كلمة المرور",
    name: "الاسم الكامل",
    confirmPassword: "تأكيد كلمة المرور",
    alreadyAccount: "هل لديك حساب بالفعل؟",
    noAccount: "ليس لديك حساب؟",
    profile: "الملف الشخصي",
    updateProfile: "تحديث الملف الشخصي",
    loginToAccess: "سجل الدخول للوصول إلى الميزات",
    guestMode: "وضع الزائر",
    admin: "مسؤول",
    user: "مستخدم",
    accountType: "نوع الحساب",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    emailExists: "البريد الإلكتروني مسجل بالفعل",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
    accountCreated: "تم إنشاء الحساب بنجاح",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    role: "الدور",
    reviews: "المراجعات",
    writeReview: "اكتب مراجعة",
    rating: "التقييم",
    comment: "تعليق",
    submitReview: "إرسال المراجعة",
    noReviews: "لا توجد مراجعات بعد. كن أول من يكتب مراجعة!",
    loginToReview: "الرجاء تسجيل الدخول لترك مراجعة.",
    favorites: "المفضلة",
    myFavorites: "مفضلاتي",
    reviewAdded: "تم إرسال المراجعة بنجاح",
    loginGoogle: "المتابعة باستخدام Google",
    or: "أو",
    settings: "الإعدادات",
    general: "عام",
    appearance: "المظهر",
    language: "اللغة",
    account: "الحساب",
    notifications: "الإشعارات",
    security: "الأمان",
    about: "حول",
    themeLight: "فاتح",
    themeDark: "داكن",
    enableNotifs: "تمكين الإشعارات",
    marketing: "رسائل التسويق",
    appVersion: "نسخة التطبيق",
    themeDesc: "تخصيص المظهر والشعور",
    langDesc: "اختر لغتك المفضلة",
    notifDesc: "إدارة تفضيلات الاتصال الخاصة بك",
    legal: "قانوني",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    disclaimer: "إخلاء المسؤولية القانونية",
    rightsReserved: "جميع الحقوق محفوظة.",
    acceptTerms: "أوافق على الشروط والأحكام وسياسة الخصوصية",
    refundPolicy: "سياسة الاسترداد",
    cancelOrder: "إلغاء الطلب",
    cancelOrderConfirm: "هل أنت متأكد أنك تريد إلغاء هذا الطلب؟",
    orderCancelled: "تم إلغاء الطلب بنجاح",
    subcategory: "فئة فرعية",
    all: "الكل"
  }
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'CONNECTIVITY',
    label: 'Connectivity & Payments',
    label_fr: 'Connectivité & Paiements',
    label_ar: 'الاصال والدفع',
    icon: 'Globe',
    color: 'text-blue-500',
    desc: 'eSIMs, Virtual Numbers, Payment Cards',
    desc_fr: 'eSIMs, Numéros Virtuels, Cartes de Paiement',
    desc_ar: 'شرائح إلكترونية، أرقام افتراضية، بطاقات دفع',
    order: 1,
    subcategories: [
      { id: 'ESIM', label: 'eSIMs', label_fr: 'eSIMs', label_ar: 'شرائح إلكترونية' },
      { id: 'VIRTUAL_NUMBERS', label: 'Virtual Numbers', label_fr: 'Numéros Virtuels', label_ar: 'أرقام افتراضية' },
      { id: 'PAYMENT_CARDS', label: 'Payment Cards', label_fr: 'Cartes de Paiement', label_ar: 'بطاقات دفع' },
    ]
  },
  {
    id: 'STREAMING',
    label: 'Streaming & Entertainment',
    label_fr: 'Streaming & Divertissement',
    label_ar: 'البث والترفيه',
    icon: 'Tv',
    color: 'text-purple-500',
    desc: 'Netflix, Spotify, IPTV',
    desc_fr: 'Netflix, Spotify, IPTV',
    desc_ar: 'نتفليكس، سبوتيفاي، IPTV',
    order: 2,
    subcategories: [
      { id: 'NETFLIX', label: 'Netflix', label_fr: 'Netflix', label_ar: 'نتفليكس' },
      { id: 'SPOTIFY', label: 'Spotify', label_fr: 'Spotify', label_ar: 'سبوتيفاي' },
      { id: 'IPTV', label: 'IPTV', label_fr: 'IPTV', label_ar: 'IPTV' },
    ]
  },
  {
    id: 'GAMING',
    label: 'Gaming Space',
    label_fr: 'Espace Gaming',
    label_ar: 'مساحة الألعاب',
    icon: 'Gamepad2',
    color: 'text-emerald-500',
    desc: 'Game Keys, Credits, Boosts',
    desc_fr: 'Clés de jeux, Crédits, Boosts',
    desc_ar: 'مفاتيح الألعاب، الأرصدة، التعزيزات',
    order: 3,
    subcategories: [
      { id: 'GAME_KEYS', label: 'Game Keys', label_fr: 'Clés de jeux', label_ar: 'مفاتيح الألعاب' },
      { id: 'CREDITS', label: 'Credits', label_fr: 'Crédits', label_ar: 'الأرصدة' },
      { id: 'BOOSTS', label: 'Boosts', label_fr: 'Boosts', label_ar: 'التعزيزات' },
    ]
  },
  {
    id: 'AI_PRODUCTIVITY',
    label: 'AI & Productivity',
    label_fr: 'IA & Productivité',
    label_ar: 'الذكاء الاصطناعي والإنتاجية',
    icon: 'Zap',
    color: 'text-amber-500',
    desc: 'ChatGPT, Midjourney, Office 365',
    desc_fr: 'ChatGPT, Midjourney, Office 365',
    desc_ar: 'شات جي بي تي، ميدجورني، أوفيس 365',
    order: 4,
    subcategories: [
      { id: 'CHATGPT', label: 'ChatGPT', label_fr: 'ChatGPT', label_ar: 'شات جي بي تي' },
      { id: 'MIDJOURNEY', label: 'Midjourney', label_fr: 'Midjourney', label_ar: 'ميدجورني' },
      { id: 'OFFICE_365', label: 'Office 365', label_fr: 'Office 365', label_ar: 'أوفيس 365' },
    ]
  },
  {
    id: 'EDUCATION',
    label: 'Training & Certifications',
    label_fr: 'Formation & Certifications',
    label_ar: 'التدريب والشهادات',
    icon: 'Briefcase',
    color: 'text-indigo-500',
    desc: 'Udemy, Coursera, LinkedIn Learning',
    desc_fr: 'Udemy, Coursera, LinkedIn Learning',
    desc_ar: 'يوديمي، كورسيرا، لينكد إن ليرنينج',
    order: 5,
    subcategories: [
      { id: 'UDEMY', label: 'Udemy', label_fr: 'Udemy', label_ar: 'يوديمي' },
      { id: 'COURSERA', label: 'Coursera', label_fr: 'Coursera', label_ar: 'كورسيرا' },
      { id: 'LINKEDIN_LEARNING', label: 'LinkedIn Learning', label_fr: 'LinkedIn Learning', label_ar: 'لينكد إن ليرنينج' },
    ]
  },
  {
    id: 'BRANDING',
    label: 'Creators & Brand Authority',
    label_fr: 'Créateurs & Autorité de Marque',
    label_ar: 'المبدعون وسلطة العلامة التجارية',
    icon: 'Shield',
    color: 'text-rose-500',
    desc: 'Verification, Social Growth',
    desc_fr: 'Vérification, Croissance Sociale',
    desc_ar: 'التحقق، النمو الاجتماعي',
    order: 6,
    subcategories: [
      { id: 'VERIFICATION', label: 'Verification', label_fr: 'Vérification', label_ar: 'التحقق' },
      { id: 'SOCIAL_GROWTH', label: 'Social Growth', label_fr: 'Croissance Sociale', label_ar: 'النمو الاجتماعي' },
    ]
  },
  {
    id: 'GIFTCARDS',
    label: 'Gift Cards & Wallets',
    label_fr: 'Cartes Cadeaux & Portefeuilles Numériques',
    label_ar: 'بطاقات الهدايا والمحافظ',
    icon: 'Gift',
    color: 'text-cyan-500',
    desc: 'Apple, Google Play, Binance',
    desc_fr: 'Apple, Google Play, Binance',
    desc_ar: 'أبل، جوجل بلاي، بينانس',
    order: 7,
    subcategories: [
      { id: 'APPLE', label: 'Apple', label_fr: 'Apple', label_ar: 'أبل' },
      { id: 'GOOGLE_PLAY', label: 'Google Play', label_fr: 'Google Play', label_ar: 'جوجل بلاي' },
      { id: 'BINANCE', label: 'Binance', label_fr: 'Binance', label_ar: 'بينانس' },
    ]
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: '1',
    name: 'Encrypted Cloud Storage 1TB',
    category: 'AI_PRODUCTIVITY',
    subcategory: 'OFFICE_365',
    description: 'Military-grade encryption for your most sensitive data. Accessible anywhere, anytime, with zero-knowledge privacy architecture.',
    price: 60.00,
    currency: 'TND',
    conditions: 'Subscription renews monthly. No refund after 3 days.',
    requiredInfo: 'Email address, PGP Public Key (Optional)',
    active: true,
    createdAt: Date.now(),
    popularity: 85,
  },
  {
    id: '2',
    name: 'Global eSIM Data Plan',
    category: 'CONNECTIVITY',
    subcategory: 'ESIM',
    description: 'Stay connected in over 140 countries with high-speed 5G data. No physical SIM required.',
    price: 135.00,
    currency: 'TND',
    conditions: 'Valid for 30 days from activation. Device must be eSIM compatible.',
    requiredInfo: 'Device EID, Email address',
    active: true,
    createdAt: Date.now() - 10000,
    popularity: 92,
  },
  {
    id: '3',
    name: 'Rank Boost - Apex Predator',
    category: 'GAMING',
    subcategory: 'BOOSTS',
    description: 'Professional boosting service to reach the highest ranks. Streamed live for your assurance.',
    price: 450.00,
    currency: 'TND',
    conditions: 'Account sharing required. 2FA must be temporarily disabled or coordinated.',
    requiredInfo: 'Platform, Username, Current Rank',
    active: true,
    createdAt: Date.now() - 20000,
    popularity: 45,
  },
  {
    id: '4',
    name: 'SEO Audit Pro',
    category: 'BRANDING',
    subcategory: 'SOCIAL_GROWTH',
    description: 'Comprehensive analysis of your website visibility, keyword rankings, and technical health.',
    price: 900.00,
    currency: 'TND',
    conditions: 'Report delivered within 5 business days.',
    requiredInfo: 'Website URL, Target Keywords, Competitor URLs',
    active: true,
    createdAt: Date.now() - 30000,
    popularity: 60,
  },
    {
    id: '5',
    name: 'Private VPN Access',
    category: 'CONNECTIVITY',
    subcategory: 'VIRTUAL_NUMBERS',
    description: 'Anonymous browsing with dedicated IP options. Bypass geo-restrictions effortlessly.',
    price: 30.00,
    currency: 'TND',
    conditions: 'Strict no-logs policy.',
    requiredInfo: 'Desired username',
    active: true,
    createdAt: Date.now() - 40000,
    popularity: 98,
  },
];