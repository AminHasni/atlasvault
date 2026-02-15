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
  "popularity" integer default 0
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
  "serviceId" text references public.services("id"),
  "serviceName" text,
  "category" text,
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
  "serviceId" text references public.services("id"),
  "userId" text, 
  "userName" text,
  "rating" integer,
  "comment" text,
  "createdAt" bigint
);

-- 7. Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

create policy "Enable all access for categories" on public.categories for all using (true) with check (true);
create policy "Enable all access for services" on public.services for all using (true) with check (true);
create policy "Enable all access for profiles" on public.profiles for all using (true) with check (true);
create policy "Enable all access for orders" on public.orders for all using (true) with check (true);
create policy "Enable all access for reviews" on public.reviews for all using (true) with check (true);

-- 8. Insert Initial Data

-- Insert Categories
INSERT INTO public.categories ("id", "label", "label_fr", "label_ar", "icon", "color", "desc", "desc_fr", "desc_ar", "order")
VALUES
('The Vault', 'The Vault', 'Le Coffre-Fort', 'الخزنة', 'Shield', 'text-emerald-500', 'Secure storage, premium access, and exclusive memberships.', 'Stockage sécurisé, accès premium et adhésions exclusives.', 'تخزين آمن، وصول مميز، وعضويات حصرية.', 1),
('Telecom Hub', 'Telecom Hub', 'Pôle Télécom', 'مركز الاتصالات', 'Smartphone', 'text-blue-500', 'Top-tier connectivity, data plans, and virtual numbers.', 'Connectivité de haut niveau, forfaits données et numéros virtuels.', 'اتصال من الدرجة الأولى، خطط بيانات، وأرقام افتراضية.', 2),
('Gaming Corner', 'Gaming Corner', 'Coin Gaming', 'ركن الألعاب', 'Gamepad2', 'text-purple-500', 'Credits, skins, boosts, and premium game keys.', 'Crédits, skins, boosts et clés de jeu premium.', 'أرصدة، مظاهر، تعزيزات، ومفاتيح ألعاب مميزة.', 3);

-- Insert Services
INSERT INTO public.services ("id", "name", "category", "description", "price", "currency", "conditions", "requiredInfo", "active", "createdAt", "popularity")
VALUES 
('1', 'Encrypted Cloud Storage 1TB', 'The Vault', 'Military-grade encryption for your most sensitive data. Accessible anywhere, anytime, with zero-knowledge privacy architecture.', 19.99, '$', 'Subscription renews monthly. No refund after 3 days.', 'Email address, PGP Public Key (Optional)', true, 1709251200000, 85),
('2', 'Global eSIM Data Plan', 'Telecom Hub', 'Stay connected in over 140 countries with high-speed 5G data. No physical SIM required.', 45.00, '$', 'Valid for 30 days from activation. Device must be eSIM compatible.', 'Device EID, Email address', true, 1709241200000, 92),
('3', 'Rank Boost - Apex Predator', 'Gaming Corner', 'Professional boosting service to reach the highest ranks. Streamed live for your assurance.', 150.00, '$', 'Account sharing required. 2FA must be temporarily disabled or coordinated.', 'Platform, Username, Current Rank', true, 1709231200000, 45),
('5', 'Private VPN Access', 'The Vault', 'Anonymous browsing with dedicated IP options. Bypass geo-restrictions effortlessly.', 9.99, '$', 'Strict no-logs policy.', 'Desired username', true, 1709211200000, 98);

-- Insert Admin User
INSERT INTO public.profiles ("id", "email", "name", "phone", "role", "provider", "createdAt", "password")
VALUES ('admin-1', 'admin@nexus.com', 'Nexus Admin', '123-456-7890', 'admin', 'email', 1709251200000, 'admin');
