-- ============================================================
-- Atik Technology eCommerce Platform — Supabase Schema
-- Run this in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ─────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
  address     text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url  text,
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references public.categories(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  description    text not null default '',
  price          numeric(10,2) not null,
  discount_price numeric(10,2),
  stock          integer not null default 0,
  category_id    uuid references public.categories(id) on delete set null,
  images         text[] not null default '{}',
  is_featured    boolean not null default false,
  is_trending    boolean not null default false,
  rating_avg     numeric(3,2) default 0,
  rating_count   integer default 0,
  created_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_trending_idx on public.products(is_trending);
create index if not exists products_slug_idx on public.products(slug);

-- ─────────────────────────────────────────
-- 4. CART ITEMS
-- ─────────────────────────────────────────
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ─────────────────────────────────────────
-- 5. ORDERS
-- ─────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  payment_method  text not null check (payment_method in ('cod','bkash','nagad')),
  payment_status  text not null default 'pending'
                    check (payment_status in ('pending','approved','rejected')),
  transaction_id  text,
  total           numeric(10,2) not null,
  delivery_charge numeric(10,2) not null default 80,
  address         text not null,
  phone           text not null,
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

-- ─────────────────────────────────────────
-- 6. ORDER ITEMS
-- ─────────────────────────────────────────
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity   integer not null,
  price      numeric(10,2) not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ─────────────────────────────────────────
-- 7. REVIEWS
-- ─────────────────────────────────────────
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text not null,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- Auto-update product avg rating
create or replace function public.update_product_rating()
returns trigger language plpgsql as $$
begin
  update public.products
  set
    rating_avg   = (select round(avg(rating)::numeric, 2) from public.reviews where product_id = coalesce(new.product_id, old.product_id)),
    rating_count = (select count(*) from public.reviews where product_id = coalesce(new.product_id, old.product_id))
  where id = coalesce(new.product_id, old.product_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();

-- ─────────────────────────────────────────
-- 8. BANNERS
-- ─────────────────────────────────────────
create table if not exists public.banners (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  subtitle   text,
  image_url  text not null,
  link       text,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 9. PAGES (CMS)
-- ─────────────────────────────────────────
create table if not exists public.pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  content          text not null default '',
  meta_description text
);

-- Insert default pages
insert into public.pages (slug, title, content, meta_description) values
  ('about', 'About Us', 'We are AtikTech — Bangladesh''s modern tech eCommerce store.', 'Learn about AtikTech'),
  ('privacy', 'Privacy Policy', 'Your privacy is important to us.', 'AtikTech privacy policy'),
  ('contact', 'Contact Us', 'Reach us at info@atiktech.com', 'Contact AtikTech')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────
-- 10. SETTINGS
-- ─────────────────────────────────────────
create table if not exists public.settings (
  id    uuid primary key default gen_random_uuid(),
  key   text not null unique,
  value text not null default ''
);

insert into public.settings (key, value) values
  ('site_name',              'AtikTech'),
  ('site_tagline',           'Bangladesh''s Tech Store'),
  ('contact_phone',          '+880 1XXX-XXXXXX'),
  ('contact_email',          'info@atiktech.com'),
  ('contact_address',        'Dhaka, Bangladesh'),
  ('delivery_charge_dhaka',  '60'),
  ('delivery_charge_outside','120'),
  ('free_delivery_min',      '2000'),
  ('bkash_number',           '01XXXXXXXXX'),
  ('nagad_number',           '01XXXXXXXXX')
on conflict (key) do nothing;

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════

alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews     enable row level security;
alter table public.banners     enable row level security;
alter table public.pages       enable row level security;
alter table public.settings    enable row level security;

-- Helper: is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- PROFILES
create policy "Users can read own profile"     on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"   on public.profiles for update using (auth.uid() = id);
create policy "Admins read all profiles"       on public.profiles for select using (public.is_admin());

-- CATEGORIES (public read)
create policy "Anyone reads categories"        on public.categories for select using (true);
create policy "Admins manage categories"       on public.categories for all using (public.is_admin());

-- PRODUCTS (public read)
create policy "Anyone reads products"          on public.products for select using (true);
create policy "Admins manage products"         on public.products for all using (public.is_admin());

-- CART ITEMS
create policy "Users manage own cart"          on public.cart_items for all using (auth.uid() = user_id);

-- ORDERS
create policy "Users read own orders"          on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders"            on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins manage all orders"       on public.orders for all using (public.is_admin());

-- ORDER ITEMS
create policy "Users read own order items"     on public.order_items for select
  using (exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid()));
create policy "Users create order items"       on public.order_items for insert with check (true);
create policy "Admins manage order items"      on public.order_items for all using (public.is_admin());

-- REVIEWS
create policy "Anyone reads reviews"           on public.reviews for select using (true);
create policy "Auth users create reviews"      on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users delete own reviews"       on public.reviews for delete using (auth.uid() = user_id);

-- BANNERS (public read)
create policy "Anyone reads active banners"    on public.banners for select using (true);
create policy "Admins manage banners"          on public.banners for all using (public.is_admin());

-- PAGES (public read)
create policy "Anyone reads pages"             on public.pages for select using (true);
create policy "Admins manage pages"            on public.pages for all using (public.is_admin());

-- SETTINGS (public read)
create policy "Anyone reads settings"          on public.settings for select using (true);
create policy "Admins manage settings"         on public.settings for all using (public.is_admin());

-- ─────────────────────────────────────────
-- STORAGE BUCKET for product images
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Anyone reads product images"    on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins upload product images"   on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins delete product images"   on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());
