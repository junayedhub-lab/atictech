-- ============================================================
-- Atik Technology — Seed Data & Functions
-- Run this in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. CLEANUP (Optional - only if you want to start fresh)
-- truncate public.categories cascade;
-- truncate public.products cascade;
-- truncate public.banners cascade;

-- 2. CATEGORIES
insert into public.categories (id, name, slug, description, image_url) values
  ('c1000000-0000-0000-0000-000000000001', 'Laptops', 'laptops', 'Powerful laptops for work and play', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'),
  ('c1000000-0000-0000-0000-000000000002', 'Smartphones', 'smartphones', 'Latest mobile devices and accessories', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'),
  ('c1000000-0000-0000-0000-000000000003', 'Accessories', 'accessories', 'Cables, cases, and more', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'),
  ('c1000000-0000-0000-0000-000000000004', 'Audio', 'audio', 'Headphones, speakers and sound systems', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'),
  ('c1000000-0000-0000-0000-000000000005', 'Cameras', 'cameras', 'Professional and hobbyist photography', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop'),
  ('c1000000-0000-0000-0000-000000000006', 'Gaming', 'gaming', 'Consoles, controllers and components', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop')
on conflict (id) do update set 
  name = excluded.name, 
  slug = excluded.slug, 
  image_url = excluded.image_url;

-- 3. PRODUCTS
insert into public.products (name, slug, description, price, discount_price, stock, category_id, images, is_featured, is_trending) values
  ('MacBook Pro M3 Max', 'macbook-pro-m3-max', 'The ultimate powerful laptop for professionals. Features the M3 Max chip with 14-core CPU and 30-core GPU.', 320000, 295000, 10, 'c1000000-0000-0000-0000-000000000001', '{"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"}', true, true),
  ('iPhone 15 Pro Titanium', 'iphone-15-pro-titanium', 'Strong. Light. Pro. A new level of performance with A17 Pro chip and Titanium design.', 145000, 138000, 25, 'c1000000-0000-0000-0000-000000000002', '{"https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80"}', true, true),
  ('Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise cancellation headphones with exceptional sound quality and comfort.', 38000, 35500, 15, 'c1000000-0000-0000-0000-000000000004', '{"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}', true, false),
  ('Logitech MX Master 3S', 'logitech-mx-master-3s', 'Advanced wireless mouse with 8k DPI tracking, quiet clicks, and ergonomic design.', 12500, null, 40, 'c1000000-0000-0000-0000-000000000003', '{"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"}', false, true),
  ('ASUS ROG Zephyrus G14', 'asus-rog-zephyrus-g14', 'Powerful gaming laptop with AMD Ryzen 9 and RTX 4070 in a compact 14-inch chassis.', 215000, 198000, 8, 'c1000000-0000-0000-0000-000000000006', '{"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"}', true, false),
  ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'The ultimate AI smartphone with 200MP camera, S-Pen, and Snapdragon 8 Gen 3 for Galaxy.', 155000, 149000, 12, 'c1000000-0000-0000-0000-000000000002', '{"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80"}', false, true),
  ('Keychron Q1 Max', 'keychron-q1-max', 'Premium wireless custom mechanical keyboard with full aluminum body and double-gasket design.', 18500, null, 20, 'c1000000-0000-0000-0000-000000000003', '{"https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80"}', false, false),
  ('Sony Alpha A7 IV', 'sony-alpha-a7-iv', 'Full-frame mirrorless camera with 33MP sensor and advanced real-time tracking autofocus.', 245000, 235000, 5, 'c1000000-0000-0000-0000-000000000005', '{"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"}', true, false)
on conflict (slug) do nothing;

-- 4. BANNERS
insert into public.banners (title, subtitle, image_url, link, sort_order) values
  ('New Year Tech Sale', 'Get up to 40% discount on all premium laptops & accessories.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80', '/products?filter=trending', 1),
  ('iPhone 15 Pro is Here', 'Titanium design. Best camera ever. Experience the future today.', 'https://images.unsplash.com/photo-1695048133142-1a20484d256e?w=1600&q=80', '/products/iphone-15-pro-titanium', 2),
  ('Ultimate Sound Quality', 'Sony WH-1000XM5 now in stock. Best noise cancellation in class.', 'https://images.unsplash.com/photo-1546435770-a3e426da473b?w=1600&q=80', '/products/sony-wh-1000xm5', 3)
on conflict do nothing;

-- 5. FUNCTION: REDUCE STOCK ON ORDER
-- This trigger automatically reduces product stock when an order_item is created.
create or replace function public.reduce_stock_on_order()
returns trigger language plpgsql security definer as $$
begin
  update public.products
  set stock = stock - new.quantity
  where id = new.product_id;
  
  -- Check if stock is negative (optional: throw error or just allow)
  -- if (select stock from public.products where id = new.product_id) < 0 then
  --   raise exception 'Insufficient stock for product %', new.product_id;
  -- end if;
  
  return new;
end;
$$;

drop trigger if exists on_order_item_created on public.order_items;
create trigger on_order_item_created
  after insert on public.order_items
  for each row execute function public.reduce_stock_on_order();

-- 6. FUNCTION: INCREASE STOCK ON CANCEL
-- This trigger adds back the stock if an order is cancelled.
create or replace function public.restore_stock_on_cancel()
returns trigger language plpgsql security definer as $$
begin
  if (new.status = 'cancelled' and old.status != 'cancelled') then
    update public.products p
    set stock = p.stock + oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and p.id = oi.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_cancelled on public.orders;
create trigger on_order_cancelled
  after update on public.orders
  for each row execute function public.restore_stock_on_cancel();
