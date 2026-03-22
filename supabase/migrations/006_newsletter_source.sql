-- Add source column to newsletter_subscribers
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS source text DEFAULT 'website';
