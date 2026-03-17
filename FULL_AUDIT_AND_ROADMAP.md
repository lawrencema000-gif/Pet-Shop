# Pet Shop E-Commerce: Full Audit & Implementation Roadmap

> **Audit Date:** March 18, 2026
> **Current Build:** ~74% of premium spec
> **Live Site:** https://pet-shop-lac-ten.vercel.app
> **Benchmark:** https://petlibro.com/

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Live Site Status](#live-site-status)
3. [Gap Analysis by Area](#gap-analysis-by-area)
4. [Complete Missing Features List](#complete-missing-features-list)
5. [Implementation Phases](#implementation-phases)
6. [File/Route Map of What's Needed](#fileroute-map)

---

## Executive Summary

The site has a **solid foundation** — 44 routes, clean Tailwind design system, Supabase backend, Zustand cart, Framer Motion animations, blog system, SEO schemas, and full support page ecosystem. However, to match the sophistication of premium DTC pet brands, significant gaps remain in **account depth, product discovery, content strategy, accessibility, search UX, and AI-search readiness**.

### Completion by Area

| Area | % Built | Priority |
|------|---------|----------|
| Information Architecture | 60% | HIGH |
| Navigation System | 75% | MEDIUM |
| Homepage | 85% | MEDIUM |
| Product Cards | 80% | MEDIUM |
| Product Detail Pages | 85% | MEDIUM |
| Category/Collection Pages | 65% | HIGH |
| Search & Discovery | 55% | HIGH |
| Cart System | 80% | MEDIUM |
| Account System | 40% | CRITICAL |
| Support Ecosystem | 75% | MEDIUM |
| Trust & Social Proof | 60% | MEDIUM |
| Blog/Content Hub | 70% | MEDIUM |
| SEO Implementation | 70% | CRITICAL |
| GEO / AI-Search Readiness | 50% | HIGH |
| Performance | 65% | HIGH |
| Accessibility | 50% | CRITICAL |
| Micro-interactions | 70% | LOW |
| CRO Elements | 65% | HIGH |
| Content Quality | 75% | MEDIUM |
| Design System | 75% | MEDIUM |

---

## Live Site Status

### Working Pages (22/26 tested)

All these pages load with premium content and styling:
- `/` (Homepage) — Full 11-section premium layout
- `/products` — 8-product grid with filters/sorting
- `/products/[slug]` — Full PDP with gallery, variants, tabs, reviews
- `/cart` — Clean empty state, functional when items added
- `/blog` — 6 articles, category filters, featured section
- `/faq` — 18 FAQs across 5 categories
- `/about` — Brand story, values, timeline
- `/bundles` — 4 bundles with pricing
- `/sale` — Spring sale with dynamic end date
- `/new-arrivals` — Works but only 1 product
- `/support` — Hub linking to all support pages
- `/wishlist` — Auth-gated with sign-in prompt
- `/shipping`, `/returns`, `/warranty` — Complete policy pages
- `/contact` — Form + business info
- `/track-order` — Email + order ID lookup
- `/categories/pet-feeders` — 5 products with filtering
- `/careers`, `/press` — Minimal but functional
- `/auth/signup`, `/auth/forgot-password` — Working forms

### Pages That Need Attention (4/26)

These are `"use client"` components that render correctly in a browser with JS, but the server-rendered HTML only shows loading skeletons (expected Next.js behavior for client components). Verify they work in browser:

| Page | Issue | Action |
|------|-------|--------|
| `/checkout` | Shows skeleton in SSR | Verify client hydration works in browser |
| `/auth/login` | Shows skeleton in SSR | Verify client hydration works in browser |
| `/account` | Shows skeleton in SSR | Verify middleware redirect + client render |
| `/search` | Shows skeleton in SSR | Verify client-side search works |

### Branding Inconsistency

- `/careers` and `/press` use "Pet Shop" instead of "PETLIBRO"
- `OrganizationSchema.tsx` was changed to "Pet Shop" — needs alignment
- `contact/page.tsx` still shows `support@petlibro.com`
- `warranty/page.tsx` shows `warranty@petlibro.com`
- **Decision needed:** Is the brand "PETLIBRO" or "Pet Shop"? Standardize everywhere.

---

## Gap Analysis by Area

### 1. INFORMATION ARCHITECTURE — 60% Built

#### Missing Pages (Priority Order)

| Page | Route | Priority | Purpose |
|------|-------|----------|---------|
| Help Me Choose Quiz | `/help-me-choose` | **CRITICAL** | Interactive product recommender based on pet type, needs, budget. Major conversion driver. |
| Pet-Type Landing: Dogs | `/dogs` | HIGH | Dedicated page with dog-specific hero, subcategories, curated products, educational content |
| Pet-Type Landing: Cats | `/cats` | HIGH | Same as above for cats |
| Product Comparison | `/compare` | HIGH | Side-by-side feature comparison for similar products |
| Gift Cards | `/gift-cards` | MEDIUM | Gift card purchase page |
| Buying Guides Hub | `/guides` | MEDIUM | Index of buying guides (feeders, fountains, litter boxes) |
| Individual Buying Guides | `/guides/[slug]` | MEDIUM | "Best Smart Feeder for Your Pet" style content |
| Curated Collections | `/collections/[slug]` | MEDIUM | "Best for Small Apartments", "Multi-Pet Homes", etc. |
| Order Detail | `/account/orders/[id]` | HIGH | Individual order view with tracking, return initiation |
| Account Profile | `/account/profile` | HIGH | Edit name, email, phone, avatar |
| Account Addresses | `/account/addresses` | HIGH | Manage shipping/billing addresses |
| Account Pet Profiles | `/account/pets` | HIGH | Pet name, breed, age, dietary needs |
| Account Settings | `/account/settings` | MEDIUM | Notification preferences, communication settings |

---

### 2. NAVIGATION — 75% Built

#### What's Good
- Sticky header with shrink on scroll
- Rich mega menu with subcategories + featured promo tiles with images
- Mobile slide-out drawer with accordion categories
- Utility bar with Track Order + Help links
- Search modal with popular searches

#### What's Missing

| Gap | Priority | Notes |
|-----|----------|-------|
| "Help Me Choose" in main nav | HIGH | Should be a prominent nav item or CTA button |
| Autocomplete/predictive search | HIGH | Currently only shows static popular searches, no live suggestions |
| Recently searched terms | LOW | No search history |
| Support links in mega menu | MEDIUM | Help/Track Order only in utility bar, not in mega menu |

---

### 3. HOMEPAGE — 85% Built

#### What's Good
- 11 premium sections with scroll animations
- Trust strip, brand story, featured bundles
- BestSellers with scroll arrows
- Working newsletter with Supabase integration

#### What's Missing

| Section | Priority | Notes |
|---------|----------|-------|
| Help Me Choose widget | HIGH | Interactive "Find your perfect product" on homepage |
| FAQ preview (top 3-5 questions) | MEDIUM | Expandable FAQ teaser before footer |
| Instagram/social proof strip | MEDIUM | UGC photos or social feed integration |
| "As Seen In" media mentions | MEDIUM | Press logos strip for credibility |
| Problem/Solution section | MEDIUM | "Traditional feeders vs. Smart feeders" visual comparison |
| Risk reversal section | LOW | Prominent guarantees banner |

---

### 4. PRODUCT CARDS — 80% Built

#### What's Good
- Hover image swap, badges, wishlist, swatches, ratings, low stock
- Add to Cart with Framer Motion animation

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Quick View modal | MEDIUM | Was removed — consider re-adding as a lightweight preview |
| Compare checkbox/button | MEDIUM | No way to add products to comparison |
| Short value prop text | MEDIUM | 1-line benefit like "HD camera + 5L capacity" |
| Per-product shipping tag | LOW | Only global $75 threshold badge |

---

### 5. PRODUCT DETAIL PAGE — 85% Built

#### What's Good
- Gallery with CSS zoom + modal
- Variant selectors, stock status, delivery estimate
- Tabs (Description, Specs, Shipping & Returns, Reviews)
- Trust badges, related products, sticky add-to-cart bar
- Product JSON-LD schema

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| "How It Works" section | HIGH | Step-by-step setup/usage with icons or images |
| "Frequently Bought Together" / Accessories | HIGH | Cross-sell section with complementary products |
| Benefits section (separate from features) | MEDIUM | "Why Your Pet Will Love This" with benefit icons |
| Comparison chart | MEDIUM | "vs. Traditional Feeder" or "vs. Other Models" |
| Buy Now button | LOW | Separate from Add to Cart for impulse buy |
| Richer inventory messaging | LOW | "X people viewing" or "Sold Y this week" |
| Product-specific FAQ | MEDIUM | FAQ accordion on PDP for common product questions |
| Video support in gallery | MEDIUM | Product demo videos alongside images |

---

### 6. CATEGORY/COLLECTION PAGES — 65% Built

#### What's Good
- Breadcrumbs, filters, sorting, pagination
- Product count display, mobile filter toggle

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Category hero banner | HIGH | Unique image/copy per category at top |
| Active filter chips | MEDIUM | Removable tags showing what's filtered |
| Educational intro block | MEDIUM | "Getting Started with Smart Feeders" content |
| Category FAQ section | MEDIUM | 3-5 category-specific questions |
| Related categories links | MEDIUM | "Also browse: Water Fountains, Accessories" |
| Recently viewed section | LOW | "You recently looked at..." |
| SEO content block at bottom | HIGH | Keyword-rich paragraph for search engines |
| Review summaries in grid | MEDIUM | Aggregate ratings visible without clicking into PDP |

---

### 7. SEARCH & DISCOVERY — 55% Built

#### What's Good
- Search modal with popular searches
- Full-page search with results grid
- Debounced real-time search

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Autocomplete suggestions | **CRITICAL** | Show product/category suggestions as user types |
| No-results recommendations | HIGH | "Try these categories" or "Popular right now" on empty results |
| Search result filters | HIGH | Category, price, rating filters on search results |
| Category-aware search | MEDIUM | Context-sensitive results based on current category |
| Recently viewed products | MEDIUM | Shown below search or on homepage |
| Search analytics | LOW | Track what users search for |

---

### 8. CART SYSTEM — 80% Built

#### What's Good
- Cart drawer + full page, Zustand with persistence
- Free shipping progress bar, coupon field
- Quantity controls with max cap (10)
- SSL badge, payment icons, standardized constants

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| "Frequently Bought Together" in cart | HIGH | Smart recommendations based on cart contents |
| Save for later | MEDIUM | Move items to wishlist from cart |
| Multiple shipping options | MEDIUM | Standard/Express/Overnight selector |
| Gift wrapping option | LOW | Gift message + wrap for $5 |
| Cart abandonment recovery | LOW | Email reminders for abandoned carts |
| Bulk discount messaging | LOW | "Buy 2+ save 10%" type promotions |

---

### 9. ACCOUNT SYSTEM — 40% Built (CRITICAL GAP)

#### What's Built
- Login/Signup (email + Google OAuth)
- Forgot password flow
- Basic account dashboard with order count
- Order history with expandable details
- Auth middleware protecting /account routes

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Profile editing page | **CRITICAL** | Edit name, email, phone, avatar |
| Address book | **CRITICAL** | CRUD for saved shipping/billing addresses |
| Individual order detail page | HIGH | `/account/orders/[id]` with tracking, return initiation |
| Pet profiles | HIGH | Pet name, breed, age, size — enables personalization |
| Account settings/preferences | MEDIUM | Notification toggles, communication preferences |
| Support access from account | MEDIUM | Quick links to contact/track-order |
| Saved carts | LOW | Save cart state for later |
| Loyalty/rewards dashboard | LOW | Points system, rewards tracking |

---

### 10. SUPPORT ECOSYSTEM — 75% Built

#### What's Good
- Support hub page, comprehensive FAQ
- Shipping, returns, warranty policies
- Track order functionality
- Contact form (logs to console for demo)

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Contact form backend | HIGH | Currently logs to console — need email delivery or DB storage |
| Product care guides | MEDIUM | Setup tutorials, cleaning guides, troubleshooting per product |
| "Report Issue" flow from orders | MEDIUM | One-click issue reporting from order detail |
| Live chat widget | LOW | Intercom/Crisp/Tawk.to integration |
| Knowledge base search | LOW | Searchable support articles |

---

### 11. TRUST & SOCIAL PROOF — 60% Built

#### What's Good
- Trust badges throughout, verified testimonials
- About page with brand story

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| "As Seen In" media strip | MEDIUM | Press logos (even placeholder) on homepage |
| UGC photo gallery | MEDIUM | Customer photos on PDP or homepage |
| Comparison tables on PDP | MEDIUM | Feature matrix vs. similar products or competitors |
| Review summaries on category pages | MEDIUM | Aggregate ratings visible in product grid |
| "Trusted by X pet parents" counter | LOW | Social proof number on homepage |

---

### 12. BLOG & CONTENT HUB — 70% Built

#### What's Good
- 6 substantive articles with expert authors
- Category filters, featured posts layout
- Article JSON-LD, share buttons, author box

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Table of Contents (auto-generated) | HIGH | Sticky TOC sidebar for long articles |
| Product cards in articles | HIGH | Embed recommended products within blog content |
| Comparison articles | MEDIUM | "PETLIBRO vs. Traditional Feeders" |
| Gift guides | MEDIUM | "Best Gifts for Cat Lovers 2026" |
| Breed-specific content | MEDIUM | "Best Feeder for Large Dogs" |
| Blog sidebar | MEDIUM | Related posts, categories, newsletter widget |
| Content calendar | LOW | Publishing cadence plan |

---

### 13. SEO IMPLEMENTATION — 70% Built

#### What's Good
- Root metadata with title template, OG tags
- Sitemap, robots.txt
- Product JSON-LD, Organization schema, Website schema
- Breadcrumb component exists

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Metadata on all pages | **CRITICAL** | 13 pages missing metadata exports (client components need layout.tsx wrappers) |
| FAQ schema on /faq page | HIGH | FAQPage schema for rich results |
| Article schema on blog posts | HIGH | Article JSON-LD with author, datePublished |
| Product schema completeness | HIGH | Missing: availability per variant, individual reviews, seller info |
| Canonical URLs on all pages | HIGH | Dynamic pages need per-page canonicals |
| BreadcrumbList schema on category/blog | MEDIUM | Component exists but not used everywhere |
| Image alt text audit | HIGH | Many images missing descriptive alt text |
| SEO copy blocks on category pages | HIGH | Keyword-rich content at bottom of collections |
| Internal linking density | MEDIUM | More contextual links between products, guides, categories |

---

### 14. GEO / AI-SEARCH READINESS — 50% Built

#### What's Good
- Organization schema, product schema
- Expert authors on blog (Dr. Sarah Mitchell, etc.)
- Comprehensive FAQ content

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| "Best For" content patterns | HIGH | `/guides/best-feeder-for-large-dogs` type pages |
| Comparison content | HIGH | Structured comparison tables AI can extract |
| Product attribute completeness | HIGH | Schema missing: dimensions, weight, materials, capacity |
| Individual review schema | MEDIUM | ReviewBody + author in schema for AI extraction |
| Answer-first formatting | MEDIUM | Q&A structure in blog posts for featured snippets |
| Person schema for authors | MEDIUM | Expert credentials in structured data |
| Expanded category intros | MEDIUM | Rich content AI systems can cite |
| LocalBusiness schema | LOW | If applicable for physical presence |

---

### 15. PERFORMANCE — 65% Built

#### What's Good
- Inter font with display="swap" and weight subset
- Server/client component split is good
- Next.js route-based code splitting

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Image optimization config | HIGH | Missing minimumCacheTTL, deviceSizes, AVIF format |
| Bundle analysis | MEDIUM | Need to run next/bundle-analyzer |
| Cache-Control headers | MEDIUM | No caching strategy in middleware |
| Dynamic imports for heavy components | MEDIUM | Modals, charts should be lazy-loaded |
| Script loading strategy | LOW | No third-party script optimization yet |
| Lighthouse audit | HIGH | Need baseline performance scores |

---

### 16. ACCESSIBILITY — 50% Built (CRITICAL GAP)

#### What's Good
- Accessibility statement page
- Focus-visible styles in globals.css
- 31 aria attributes across components
- Semantic layout with main/nav/footer

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Skip to main content link | **CRITICAL** | Missing from header — required for keyboard users |
| Reduced motion support | **CRITICAL** | Framer Motion doesn't respect `prefers-reduced-motion` |
| Focus trap on modals/drawers | HIGH | Cart drawer, search modal need focus management |
| Image alt text completeness | HIGH | Many images missing alt attributes |
| ARIA live regions for cart | HIGH | No screen reader announcement when items added |
| Semantic HTML audit | MEDIUM | Some sections use div where article/section is better |
| Keyboard navigation testing | MEDIUM | Mega menu, tabs, accordion need keyboard audit |
| Color contrast verification | MEDIUM | Run axe/Lighthouse to verify AA compliance |

---

### 17. CRO ELEMENTS — 65% Built

#### What's Good
- Free shipping messaging, trust badges, sticky purchase bar
- Email capture with 10% incentive, testimonials
- Coupon field in checkout

#### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| "Frequently Bought Together" | HIGH | Cross-sell section on PDP and cart |
| Help Me Choose quiz | HIGH | Major conversion driver for undecided buyers |
| Cart upsell intelligence | MEDIUM | Recommendations based on actual cart contents |
| Recently viewed products | MEDIUM | Persistent recently-viewed strip across pages |
| Exit intent modal | LOW | Last-chance discount offer |
| A/B testing infrastructure | LOW | Vercel Edge Config or similar |

---

## Complete Missing Features List

### Tier 1: CRITICAL (Must Build Next)

1. `/help-me-choose` — Interactive product quiz/recommender
2. Skip to main content link (accessibility)
3. `prefers-reduced-motion` support (accessibility)
4. Metadata exports on all 13 missing pages
5. Account profile editing page (`/account/profile`)
6. Account address book (`/account/addresses`)
7. Autocomplete/predictive search
8. Brand name consistency audit (PETLIBRO vs Pet Shop)
9. FAQ schema on `/faq`
10. Focus trap on cart drawer + search modal

### Tier 2: HIGH PRIORITY

11. `/dogs` and `/cats` pet-type landing pages
12. `/compare` product comparison page
13. "How It Works" section on PDP
14. "Frequently Bought Together" on PDP
15. Order detail page (`/account/orders/[id]`)
16. Pet profiles system (`/account/pets`)
17. Category hero banners
18. SEO copy blocks on category pages
19. Image alt text audit + fix
20. Article schema on blog posts
21. Product schema completeness (variants, reviews, attributes)
22. Canonical URLs on all pages
23. ARIA live regions for cart updates
24. No-results recommendations in search
25. Search result filters (category, price)
26. Contact form backend (email delivery or DB)
27. Table of Contents in blog articles
28. Product cards embedded in blog posts
29. Performance: image config optimization
30. Lighthouse audit + optimization pass

### Tier 3: MEDIUM PRIORITY

31. Active filter chips on category pages
32. Category FAQ sections
33. Related categories links
34. "As Seen In" media strip
35. Comparison tables on PDP
36. UGC photo section
37. Blog sidebar (related, categories, newsletter)
38. Comparison articles content
39. Gift guide content
40. Benefits section on PDP (separate from features)
41. Product-specific FAQ on PDP
42. Video support in product gallery
43. "Frequently Bought Together" in cart
44. Save for later in cart
45. Multiple shipping options in cart
46. Help Me Choose homepage widget
47. FAQ preview section on homepage
48. Instagram/social proof strip
49. Problem/solution section on homepage
50. Buying guides hub (`/guides`)
51. Individual buying guides (`/guides/[slug]`)
52. Curated collections (`/collections/[slug]`)
53. Gift cards page (`/gift-cards`)
54. Account settings/preferences page
55. Bundle analysis / code splitting
56. Cache-Control headers

### Tier 4: LOW PRIORITY (Phase 2+)

57. Quick View modal on product cards
58. Recently viewed products section
59. Exit intent popup
60. Cart abandonment email flow
61. Live chat widget
62. Dark mode support
63. Loyalty/rewards system
64. Subscription management
65. Saved carts
66. Gift wrapping option
67. A/B testing infrastructure
68. Search analytics
69. Knowledge base search
70. Author profile pages for blog
71. Breed-specific content pages
72. Component Storybook documentation

---

## Implementation Phases

### Phase 1: Critical Fixes & Account System (Week 1-2)

**Files to create:**
- `src/app/account/profile/page.tsx` — Profile editing
- `src/app/account/addresses/page.tsx` — Address book CRUD
- `src/app/account/orders/[id]/page.tsx` — Order detail view
- `src/app/account/pets/page.tsx` — Pet profile manager
- `src/app/help-me-choose/page.tsx` — Product quiz/recommender
- `src/components/ui/SkipLink.tsx` — Skip to main content
- `src/components/ui/FocusTrap.tsx` — Focus trap for modals

**Files to modify:**
- `src/app/layout.tsx` — Add SkipLink, add reduced-motion CSS
- `src/app/globals.css` — Add prefers-reduced-motion media query
- `src/components/layout/Header.tsx` — Add skip link target
- `src/components/cart/CartDrawer.tsx` — Add focus trap
- `src/components/layout/SearchModal.tsx` — Add focus trap, autocomplete
- All 13 pages missing metadata — Add layout.tsx wrappers or refactor

**Database additions:**
- `addresses` table (if not exists)
- `pets` table (id, user_id, name, breed, species, age, size, dietary_needs)
- `contact_submissions` table (for contact form)

### Phase 2: Search, Discovery & Category Enhancement (Week 2-3)

**Files to create:**
- `src/components/search/Autocomplete.tsx` — Predictive search dropdown
- `src/app/compare/page.tsx` — Product comparison
- `src/app/dogs/page.tsx` — Dog products landing
- `src/app/cats/page.tsx` — Cat products landing
- `src/components/product/HowItWorks.tsx` — Setup steps section
- `src/components/product/FrequentlyBoughtTogether.tsx` — Cross-sell
- `src/components/product/ProductFAQ.tsx` — Product-specific FAQ
- `src/components/product/BenefitsSection.tsx` — Benefits with icons
- `src/components/category/CategoryHero.tsx` — Per-category hero banner
- `src/components/category/CategorySEOBlock.tsx` — Bottom SEO content

**Files to modify:**
- `src/components/layout/SearchModal.tsx` — Integrate autocomplete
- `src/app/search/page.tsx` — Add filters, no-results recommendations
- `src/app/categories/[slug]/page.tsx` — Add hero, FAQ, SEO block, filter chips
- `src/app/products/[slug]/page.tsx` — Add HowItWorks, FrequentlyBoughtTogether, Benefits, ProductFAQ

### Phase 3: SEO, Schema & GEO (Week 3-4)

**Files to create:**
- `src/app/guides/page.tsx` — Buying guides index
- `src/app/guides/[slug]/page.tsx` — Individual buying guide
- `src/components/seo/ProductSchemaEnhanced.tsx` — Complete product schema
- `src/components/seo/ArticleSchema.tsx` — Blog article schema
- `src/components/seo/FAQSchema.tsx` — Reusable FAQ schema

**Files to modify:**
- `src/app/faq/page.tsx` or `layout.tsx` — Add FAQPage schema
- `src/app/blog/[slug]/page.tsx` — Add Article schema, TOC component
- `src/app/products/[slug]/page.tsx` — Enhanced product schema with variants, reviews, attributes
- All category pages — Add canonical, SEO copy block
- All pages — Audit/add image alt text
- `next.config.mjs` — Image optimization config (AVIF, caching, deviceSizes)

### Phase 4: Content, Trust & CRO (Week 4-5)

**Files to create:**
- `src/components/home/MediaMentions.tsx` — "As Seen In" strip
- `src/components/home/FAQPreview.tsx` — Homepage FAQ teaser
- `src/components/home/HelpMeChooseWidget.tsx` — Mini quiz widget
- `src/components/blog/TableOfContents.tsx` — Auto-generated TOC
- `src/components/blog/ProductRecommendation.tsx` — Product cards in articles
- `src/components/product/ComparisonChart.tsx` — Feature comparison table
- `src/components/cart/FrequentlyBoughtTogether.tsx` — Smart cart upsells
- `src/components/cart/SaveForLater.tsx` — Move to wishlist

**Content to create:**
- 3 comparison articles for blog
- 2 gift guides
- 3 buying guides (feeders, fountains, litter boxes)
- Category intro content for all categories
- Product-specific FAQ content for top 5 products

### Phase 5: Performance & Accessibility Polish (Week 5-6)

**Tasks:**
- Run Lighthouse audit, fix all issues
- Run axe accessibility audit, fix all issues
- Add `prefers-reduced-motion` to all Framer Motion components
- Verify keyboard navigation on mega menu, tabs, accordion, modals
- Add ARIA live regions for dynamic content (cart count, search results)
- Semantic HTML audit across all pages
- Bundle analysis with next/bundle-analyzer
- Dynamic imports for heavy components
- Cache-Control headers in middleware
- Image alt text completeness verification
- Color contrast verification (WCAG AA)
- Test all 44 routes for 200 status, no blank pages

---

## File/Route Map

### Routes That Exist (44)
```
/                           /about                    /accessibility
/account                    /account/orders           /api/checkout
/auth/login                 /auth/signup              /auth/forgot-password
/auth/callback              /blog                     /blog/[slug]
/bundles                    /careers                  /cart
/categories/[slug]          /checkout                 /contact
/faq                        /new-arrivals             /press
/privacy                    /products                 /products/[slug]
/returns                    /sale                     /search
/shipping                   /support                  /terms
/track-order                /warranty                 /wishlist
+ sitemap.xml, robots.txt, manifest.webmanifest
+ 9 error.tsx boundaries, 11 loading.tsx skeletons
```

### Routes To Build (15+)
```
/help-me-choose             /dogs                     /cats
/compare                    /guides                   /guides/[slug]
/collections/[slug]         /gift-cards
/account/profile            /account/addresses
/account/orders/[id]        /account/pets
/account/settings           /support/guides/[slug]
```

### Components To Build (20+)
```
ui/SkipLink.tsx             ui/FocusTrap.tsx
search/Autocomplete.tsx     product/HowItWorks.tsx
product/FrequentlyBoughtTogether.tsx
product/BenefitsSection.tsx product/ProductFAQ.tsx
product/ComparisonChart.tsx product/VideoGallery.tsx
category/CategoryHero.tsx   category/CategorySEOBlock.tsx
category/FilterChips.tsx    home/MediaMentions.tsx
home/FAQPreview.tsx         home/HelpMeChooseWidget.tsx
blog/TableOfContents.tsx    blog/ProductRecommendation.tsx
cart/FrequentlyBoughtTogether.tsx
cart/SaveForLater.tsx       seo/ArticleSchema.tsx
seo/FAQSchema.tsx           seo/ProductSchemaEnhanced.tsx
```

---

## Summary

**What's excellent:** Homepage design, product cards, cart system, support pages, blog infrastructure, animation quality, component architecture.

**What needs the most work:** Account system depth, search UX, accessibility compliance, SEO schema completeness, AI-search readiness, content strategy depth.

**Estimated effort to reach 95%:** 5-6 focused weeks of development across the 5 phases above.

**Quick wins (can do in 1-2 days):**
1. Skip link + reduced motion CSS
2. Metadata on missing pages
3. FAQ schema on /faq
4. Brand name consistency fix
5. Alt text audit
6. Contact form → Supabase storage
7. Autocomplete search skeleton
8. Category hero banners
