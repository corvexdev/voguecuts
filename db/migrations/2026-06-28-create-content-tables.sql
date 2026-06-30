-- Migration: Create content tables for dynamic site management
-- Run in Supabase SQL editor or psql against your database

-- app_settings: key-value store for site-wide content
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- hero: homepage hero content
CREATE TABLE IF NOT EXISTS hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline_en TEXT,
  headline_sq TEXT,
  sub_en TEXT,
  sub_sq TEXT,
  cta_en TEXT,
  cta_sq TEXT,
  image_key TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- gallery_items: images displayed in gallery
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL,
  alt_en TEXT,
  alt_sq TEXT,
  ordering INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- team/barbers
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  role_en TEXT,
  role_sq TEXT,
  portrait_key TEXT,
  bio_en TEXT,
  bio_sq TEXT,
  is_active BOOLEAN DEFAULT true,
  ordering INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- catalog_items: portfolio / catalog
CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL,
  category TEXT,
  label_en TEXT,
  label_sq TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ordering INT DEFAULT 0
);

-- opening_hours: extend if needed (date and barber nullable already expected)
ALTER TABLE IF EXISTS opening_hours
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS barber TEXT;

-- Note: ensure the extension for gen_random_uuid() exists (pgcrypto)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
