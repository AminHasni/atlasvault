-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Categories Table (NEW)
create table public.categories (
  "id" text primary key,
  "label" text not null,
  "label_fr" text,
  "label_ar" text,
  "icon" text, -- Lucide icon name
  "color" text, -- Tailwind color class
  "desc" text,
  "desc_fr" text,
  "desc_ar" text,
  "order" integer default 0
);

-- 2.1 Create Subcategories Table (NEW)
create table public.subcategories (
  "id" text primary key,
  "category_id" text references public.categories("id") on delete cascade,
  "parent_id" text references public.subcategories("id") on delete cascade,
  "label" text not null,
  "label_fr" text,
  "label_ar" text,
  "desc" text,
  "desc_fr" text,
  "desc_ar" text,
  "icon" text,
  "color" text,
  "fee" numeric,
  "order" integer default 0
);

-- 2.2 Create Second Subcategories Table (Level 3) (NEW)
create table public.second_subcategories (
  "id" text primary key,
  "subcategory_id" text references public.subcategories("id") on delete cascade,
  "label" text not null,
  "label_fr" text,
  "label_ar" text,
  "desc" text,
  "desc_fr" text,
  "desc_ar" text,
  "icon" text,
  "color" text,
  "fee" numeric,
  "order" integer default 0
);

-- 3. Create Services Table
create table public.services (
  "id" text primary key,
  "name" text not null,
  "category" text not null references public.categories("id"), -- Added Foreign Key
  "description" text,
  "price" numeric not null,
  "currency" text not null,
  "conditions" text,
  "requiredInfo" text,
  "active" boolean default true,
  "createdAt" bigint,
  "popularity" integer default 0,
  "promoPrice" numeric, -- New Column
  "badgeLabel" text,     -- New Column
  "videoUri" text,       -- New Column for Veo video
  "subcategory" text, -- Reference to either subcategories or second_subcategories
  "second_subcategory_id" text references public.second_subcategories("id") -- Specific reference for Level 3
);

-- 4. Create Profiles Table (Users)
create table public.profiles (
  "id" text primary key,
  "email" text,
  "name" text,
  "phone" text,
  "role" text default 'user',
  "provider" text default 'email',
  "createdAt" bigint,
  "password" text 
);

-- 5. Create Orders Table
create table public.orders (
  "id" text primary key,
  "userId" text,
  "serviceId" text references public.services("id") on delete set null,
  "serviceName" text,
  "category" text,
  "subcategory" text, -- Added subcategory
  "price" numeric,
  "currency" text,
  "customerInfo" text,
  "customerEmail" text,
  "customerPhone" text,
  "status" text,
  "createdAt" bigint,
  "internalNotes" text
);

-- 6. Create Reviews Table
create table public.reviews (
  "id" text primary key,
  "serviceId" text references public.services("id") on delete cascade,
  "userId" text, 
  "userName" text,
  "rating" integer,
  "comment" text,
  "createdAt" bigint
);

-- 7. Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.second_subcategories enable row level security;
alter table public.services enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

create policy "Enable all access for categories" on public.categories for all using (true) with check (true);
create policy "Enable all access for subcategories" on public.subcategories for all using (true) with check (true);
create policy "Enable all access for second_subcategories" on public.second_subcategories for all using (true) with check (true);
create policy "Enable all access for services" on public.services for all using (true) with check (true);
create policy "Enable all access for profiles" on public.profiles for all using (true) with check (true);
create policy "Enable all access for orders" on public.orders for all using (true) with check (true);
create policy "Enable all access for reviews" on public.reviews for all using (true) with check (true);

-- 8. Insert Initial Data

-- Insert Categories
INSERT INTO public.categories ("id", "label", "label_fr", "label_ar", "icon", "color", "desc", "desc_fr", "desc_ar", "order")
VALUES
('CONNECTIVITY', 'Connectivity & Payments', 'Connectivité & Paiements', 'الاصال والدفع', 'Globe', 'text-blue-500', 'eSIMs, Virtual Numbers, Payment Cards', 'eSIMs, Numéros Virtuels, Cartes de Paiement', 'شرائح إلكترونية، أرقام افتراضية، بطاقات دفع', 1),
('STREAMING', 'Streaming & Entertainment', 'Streaming & Divertissement', 'البث والترفيه', 'Tv', 'text-purple-500', 'Netflix, Spotify, IPTV', 'Netflix, Spotify, IPTV', 'نتفليكس، سبوتيفاي، IPTV', 2),
('GAMING', 'Gaming Space', 'Espace Gaming', 'مساحة الألعاب', 'Gamepad2', 'text-emerald-500', 'Game Keys, Credits, Boosts', 'Clés de jeux, Crédits, Boosts', 'مفاتيح الألعاب، الأرصدة، التعزيزات', 3),
('AI_PRODUCTIVITY', 'AI & Productivity', 'IA & Productivité', 'الذكاء الاصطناعي والإنتاجية', 'Zap', 'text-amber-500', 'ChatGPT, Midjourney, Office 365', 'ChatGPT, Midjourney, Office 365', 'شات جي بي تي، ميدجورني، أوفيس 365', 4),
('EDUCATION', 'Training & Certifications', 'Formation & Certifications', 'التدريب والشهادات', 'Briefcase', 'text-indigo-500', 'Udemy, Coursera, LinkedIn Learning', 'Udemy, Coursera, LinkedIn Learning', 'يوديمي، كورسيرا، لينكد إن ليرنينج', 5),
('BRANDING', 'Creators & Brand Authority', 'Créateurs & Autorité de Marque', 'المبدعون وسلطة العلامة التجارية', 'Shield', 'text-rose-500', 'Verification, Social Growth', 'Vérification, Croissance Sociale', 'التحقق، النمو الاجتماعي', 6),
('GIFTCARDS', 'Gift Cards & Wallets', 'Cartes Cadeaux & Portefeuilles Numériques', 'بطاقات الهدايا والمحافظ', 'Gift', 'text-cyan-500', 'Apple, Google Play, Binance', 'Apple, Google Play, Binance', 'أبل، جوجل بلاي، بينانس', 7);

-- Insert Subcategories
INSERT INTO public.subcategories ("id", "category_id", "parent_id", "label", "label_fr", "label_ar", "icon", "color", "fee")
VALUES
('ESIM', 'CONNECTIVITY', NULL, 'eSIMs', 'eSIMs', 'شرائح إلكترونية', 'Smartphone', 'text-blue-500', 0),
('VIRTUAL_NUMBERS', 'CONNECTIVITY', NULL, 'Virtual Numbers', 'Numéros Virtuels', 'أرقام افتراضية', 'Phone', 'text-indigo-500', 0),
('PAYMENT_CARDS', 'CONNECTIVITY', NULL, 'Payment Cards', 'Cartes de Paiement', 'بطاقات دفع', 'CreditCard', 'text-emerald-500', 2.5),
('NETFLIX', 'STREAMING', NULL, 'Netflix', 'Netflix', 'نتفليكس', 'Tv', 'text-red-500', 0),
('SPOTIFY', 'STREAMING', NULL, 'Spotify', 'Spotify', 'سبوتيفاي', 'Music', 'text-green-500', 0),
('IPTV', 'STREAMING', NULL, 'IPTV', 'IPTV', 'IPTV', 'Monitor', 'text-purple-500', 0),
('GAME_KEYS', 'GAMING', NULL, 'Game Keys', 'Clés de jeux', 'مفاتيح الألعاب', 'Key', 'text-amber-500', 0),
('CREDITS', 'GAMING', NULL, 'Credits', 'Crédits', 'الأرصدة', 'Coins', 'text-yellow-500', 0),
('BOOSTS', 'GAMING', NULL, 'Boosts', 'Boosts', 'التعزيزات', 'TrendingUp', 'text-rose-500', 0),
('APEX_BOOST', 'GAMING', 'BOOSTS', 'Apex Legends', 'Apex Legends', 'أبيكس أساطير', 'TrendingUp', 'text-rose-500', 0), -- Nested Subcategory Example
('CHATGPT', 'AI_PRODUCTIVITY', NULL, 'ChatGPT', 'ChatGPT', 'شات جي بي تي', 'MessageSquare', 'text-emerald-500', 0),
('MIDJOURNEY', 'AI_PRODUCTIVITY', NULL, 'Midjourney', 'Midjourney', 'ميدجورني', 'Image', 'text-indigo-500', 0),
('OFFICE_365', 'AI_PRODUCTIVITY', NULL, 'Office 365', 'Office 365', 'أوفيس 365', 'Briefcase', 'text-blue-500', 0),
('UDEMY', 'EDUCATION', NULL, 'Udemy', 'Udemy', 'يوديمي', 'BookOpen', 'text-purple-500', 0),
('COURSERA', 'EDUCATION', NULL, 'Coursera', 'Coursera', 'كورسيرا', 'GraduationCap', 'text-blue-500', 0),
('LINKEDIN_LEARNING', 'EDUCATION', NULL, 'LinkedIn Learning', 'LinkedIn Learning', 'لينكد إن ليرنينج', 'Linkedin', 'text-sky-500', 0),
('VERIFICATION', 'BRANDING', NULL, 'Verification', 'Vérification', 'التحقق', 'CheckCircle', 'text-blue-500', 0),
('SOCIAL_GROWTH', 'BRANDING', NULL, 'Social Growth', 'Croissance Sociale', 'النمو الاجتماعي', 'TrendingUp', 'text-emerald-500', 0),
('APPLE', 'GIFTCARDS', NULL, 'Apple', 'Apple', 'أبل', 'Apple', 'text-slate-800', 0),
('GOOGLE_PLAY', 'GIFTCARDS', NULL, 'Google Play', 'Google Play', 'جوجل بلاي', 'Play', 'text-emerald-500', 0),
('BINANCE', 'GIFTCARDS', NULL, 'Binance', 'Binance', 'بينانس', 'Bitcoin', 'text-yellow-500', 0),
('INTERNET_BUNDLES', 'CONNECTIVITY', NULL, 'Internet Bundles', 'Forfaits Internet', 'حزم الإنترنت', 'Wifi', 'text-cyan-500', 0),
('OOREDOO', 'CONNECTIVITY', 'INTERNET_BUNDLES', 'Ooredoo', 'Ooredoo', 'أوريدو', 'Smartphone', 'text-red-600', 0);

-- Insert Services
INSERT INTO public.services ("id", "name", "category", "subcategory", "description", "price", "currency", "conditions", "requiredInfo", "active", "createdAt", "popularity", "promoPrice", "badgeLabel", "videoUri")
VALUES 
('1', 'Encrypted Cloud Storage 1TB', 'AI_PRODUCTIVITY', 'OFFICE_365', 'Military-grade encryption for your most sensitive data. Accessible anywhere, anytime, with zero-knowledge privacy architecture.', 60.00, 'TND', 'Subscription renews monthly. No refund after 3 days.', 'Email address, PGP Public Key (Optional)', true, 1709251200000, 85, 45.00, '25% OFF', null),
('2', 'Global eSIM Data Plan', 'CONNECTIVITY', 'ESIM', 'Stay connected in over 140 countries with high-speed 5G data. No physical SIM required.', 135.00, 'TND', 'Valid for 30 days from activation. Device must be eSIM compatible.', 'Device EID, Email address', true, 1709241200000, 92, null, 'Best Seller', null),
('3', 'Rank Boost - Apex Predator', 'GAMING', 'APEX_BOOST', 'Professional boosting service to reach the highest ranks. Streamed live for your assurance.', 450.00, 'TND', 'Account sharing required. 2FA must be temporarily disabled or coordinated.', 'Platform, Username, Current Rank', true, 1709231200000, 45, null, null, null),
('4', 'SEO Audit Pro', 'BRANDING', 'SOCIAL_GROWTH', 'Comprehensive analysis of your website visibility, keyword rankings, and technical health.', 900.00, 'TND', 'Report delivered within 5 business days.', 'Website URL, Target Keywords, Competitor URLs', true, 1709221200000, 60, null, null, null),
('5', 'Private VPN Access', 'CONNECTIVITY', 'VIRTUAL_NUMBERS', 'Anonymous browsing with dedicated IP options. Bypass geo-restrictions effortlessly.', 30.00, 'TND', 'Strict no-logs policy.', 'Desired username', true, 1709211200000, 98, null, 'Hot', null),
('6', 'Ooredoo 25GB Data Plan', 'CONNECTIVITY', 'OOREDOO', 'High-speed 4G/5G data bundle for Ooredoo subscribers.', 25.00, 'TND', 'Valid for 30 days.', 'Phone number', true, 1709261200000, 75, null, 'New', null);

-- Insert Admin User
INSERT INTO public.profiles ("id", "email", "name", "phone", "role", "provider", "createdAt", "password")
VALUES ('admin-1', 'admin@nexus.com', 'Nexus Admin', '123-456-7890', 'admin', 'email', 1709251200000, 'admin');