# Premium Pet Shop Redesign — Master Implementation Plan

> **Created:** March 18, 2026
> **Approach:** One phase at a time to avoid context overflow
> **Current State:** ~92% of original spec, now doing full premium redesign

---

## Phase 1: Design System & Visual Foundation ⬜
**Goal:** Transform the visual identity from black/white Petlibro clone → warm premium pet-lifestyle brand

### Tasks:
- [ ] 1.1 — Update CSS variables in `globals.css` (cream background, sage accents, charcoal text)
- [ ] 1.2 — Update `tailwind.config.ts` with new design tokens (colors, shadows, radii, spacing)
- [ ] 1.3 — Add premium typography system (editorial headings, refined body text)
- [ ] 1.4 — Update button system in `ui/Button.tsx` (primary sage, secondary outline, ghost, premium hover states)
- [ ] 1.5 — Update card system (warm shadows, rounded-xl, cream surfaces)
- [ ] 1.6 — Update badge system (soft pastels, refined pill shapes)
- [ ] 1.7 — Update input/form system (warm borders, sage focus rings)
- [ ] 1.8 — Define motion principles (gentle, premium, not bouncy)
- [ ] 1.9 — Build + verify no errors

### New Design Tokens:
```
background: #FDFBF7 (warm cream)
surface: #F5F1EB (warm surface)
surface-light: #FAF8F4 (lighter warm)
foreground: #2D2A26 (warm charcoal)
foreground-muted: #5A5650 (warm muted)
muted: #8B8580 (warm gray)
border: #E8E2DA (warm border)
accent: #4A7C59 (sage green)
accent-light: #E8F0EB (light sage)
accent-dark: #3A6247 (deep sage)
sale: #C44D3F (warm red)
success: #4A7C59 (same as accent)
warning: #D4A843 (warm gold)
highlight: #F0E6D3 (warm highlight)
```

---

## Phase 2: Header, Nav, Promo Bar & Footer ⬜
**Goal:** Premium navigation ecosystem with mega menus, shrinking header, warm styling

### Tasks:
- [ ] 2.1 — Redesign AnnouncementBar (warm cream bg, sage text, smooth scroll)
- [ ] 2.2 — Redesign Header (warm tones, refined spacing, premium hover states)
- [ ] 2.3 — Upgrade MegaMenu (category columns, featured promo tile, image area, support links)
- [ ] 2.4 — Add "Help Me Choose" as prominent nav CTA
- [ ] 2.5 — Redesign MobileNav (warm accordion, premium slide-out)
- [ ] 2.6 — Redesign Footer (4-column, warm bg, refined typography)
- [ ] 2.7 — Add shrinking sticky header behavior on scroll
- [ ] 2.8 — Build + verify

---

## Phase 3: Homepage Premium Rebuild ⬜
**Goal:** Full premium homepage with all 19 sections, warm visual system

### Tasks:
- [ ] 3.1 — Redesign HeroBanner (editorial headline, dual CTAs, category chips, video/image slot, trust microcopy)
- [ ] 3.2 — Add quick trust strip (Free Shipping, 30-Day Returns, 1-Year Warranty, Vet Approved)
- [ ] 3.3 — Redesign ShopByPetType (Dogs/Cats cards, warm lifestyle imagery)
- [ ] 3.4 — Redesign CategoryCards (warm hover, premium shadows, sage accents)
- [ ] 3.5 — Redesign BestSellers carousel (new card design, warm tones)
- [ ] 3.6 — Add Problem-Solution section (Traditional vs Smart comparison)
- [ ] 3.7 — Add Lifestyle brand storytelling section
- [ ] 3.8 — Redesign BundleSpotlight (warm cards, premium pricing display)
- [ ] 3.9 — Redesign WhyChooseUs (sage icons, refined grid)
- [ ] 3.10 — Redesign HelpMeChooseWidget (prominent CTA, warm styling)
- [ ] 3.11 — Redesign Testimonials (warm cards, premium rating stars)
- [ ] 3.12 — Redesign FAQPreview (warm accordion, sage accents)
- [ ] 3.13 — Redesign Newsletter (warm input styling, sage CTA)
- [ ] 3.14 — Redesign MediaMentions strip (warm bg, refined logos)
- [ ] 3.15 — Add Social/UGC strip
- [ ] 3.16 — Add Final CTA block
- [ ] 3.17 — Build + verify

---

## Phase 4: Collection Pages & Product Cards ⬜
**Goal:** Premium collection browsing with warm product cards

### Tasks:
- [ ] 4.1 — Redesign ProductCard (warm shadows, sage accents, hover image swap, quick add)
- [ ] 4.2 — Add Quick View modal back
- [ ] 4.3 — Add Compare checkbox to cards
- [ ] 4.4 — Add short value prop text line on cards
- [ ] 4.5 — Redesign collection page layout (warm hero, filters, grid)
- [ ] 4.6 — Redesign FilterSidebar (warm checkboxes, sage active states)
- [ ] 4.7 — Upgrade filter chips (warm removable tags)
- [ ] 4.8 — Add related collections links section
- [ ] 4.9 — Redesign /sale, /new-arrivals, /bundles, /best-sellers pages
- [ ] 4.10 — Redesign /dogs and /cats landing pages
- [ ] 4.11 — Build + verify

---

## Phase 5: Product Detail Page System ⬜
**Goal:** Premium PDP with full conversion features

### Tasks:
- [ ] 5.1 — Redesign ProductGallery (warm framing, refined zoom, video support)
- [ ] 5.2 — Redesign ProductInfo (warm typography, sage CTAs, premium variant selectors)
- [ ] 5.3 — Redesign ProductTabs (warm styling, refined content)
- [ ] 5.4 — Upgrade sticky add-to-cart bar (warm design)
- [ ] 5.5 — Upgrade HowItWorks section (warm icons, editorial layout)
- [ ] 5.6 — Upgrade BenefitsSection (sage accent cards)
- [ ] 5.7 — Upgrade FrequentlyBoughtTogether (warm card design)
- [ ] 5.8 — Upgrade ProductFAQ (warm accordion)
- [ ] 5.9 — Upgrade ReviewSection (warm stars, premium review cards)
- [ ] 5.10 — Add share functionality
- [ ] 5.11 — Build + verify

---

## Phase 6: Cart, Wishlist, Search & Account ⬜
**Goal:** Premium shopping experience with warm UI

### Tasks:
- [ ] 6.1 — Redesign CartDrawer (warm surface, sage CTAs, premium feel)
- [ ] 6.2 — Redesign cart page (warm layout, upsell section)
- [ ] 6.3 — Add smart cart recommendations (based on cart contents)
- [ ] 6.4 — Redesign checkout page (warm form styling, trust elements)
- [ ] 6.5 — Redesign wishlist page (warm cards, premium empty state)
- [ ] 6.6 — Redesign search (warm results, refined autocomplete)
- [ ] 6.7 — Redesign account pages (warm sidebar, sage active states)
- [ ] 6.8 — Redesign auth pages (warm forms, premium brand feel)
- [ ] 6.9 — Build + verify

---

## Phase 7: Support, Policy & Content Pages ⬜
**Goal:** Complete trust ecosystem with warm premium design

### Tasks:
- [ ] 7.1 — Redesign FAQ page (warm accordion, sage categories)
- [ ] 7.2 — Redesign Contact page (warm form, premium layout)
- [ ] 7.3 — Redesign all policy pages (shipping, returns, warranty, privacy, terms)
- [ ] 7.4 — Redesign Support hub page
- [ ] 7.5 — Redesign Track Order page
- [ ] 7.6 — Redesign About page (warm editorial, brand story)
- [ ] 7.7 — Redesign Blog pages (warm article cards, premium reading experience)
- [ ] 7.8 — Redesign Guides pages (warm editorial layout)
- [ ] 7.9 — Redesign Compare page (warm comparison table)
- [ ] 7.10 — Redesign Gift Cards page
- [ ] 7.11 — Build + verify

---

## Phase 8: SEO, Schema, GEO, Performance, Accessibility ⬜
**Goal:** Technical excellence for search and accessibility

### Tasks:
- [ ] 8.1 — Audit and update all page metadata
- [ ] 8.2 — Add canonical URLs to all dynamic pages
- [ ] 8.3 — Enhance Product schema (availability, dimensions, reviews)
- [ ] 8.4 — Add BreadcrumbList schema everywhere
- [ ] 8.5 — Audit all image alt text
- [ ] 8.6 — Add answer-first content blocks for GEO
- [ ] 8.7 — Add structured product attributes for AI search
- [ ] 8.8 — Performance: dynamic imports, bundle optimization
- [ ] 8.9 — Accessibility: keyboard nav audit, contrast check, ARIA audit
- [ ] 8.10 — Build + Lighthouse audit

---

## Phase 9: Polish, QA & Launch ⬜
**Goal:** Final refinements, cross-browser testing, deploy

### Tasks:
- [ ] 9.1 — Cross-page consistency audit (spacing, typography, colors)
- [ ] 9.2 — Mobile responsive QA at 375/750/990/1280px
- [ ] 9.3 — Loading states and skeleton audit
- [ ] 9.4 — Error boundary audit
- [ ] 9.5 — Animation polish pass (gentle, premium motion)
- [ ] 9.6 — Empty state design audit
- [ ] 9.7 — Brand consistency audit (name, tone, imagery)
- [ ] 9.8 — Final build + deploy to production
- [ ] 9.9 — Generate final QA report

---

## Progress Tracker

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Design System | ✅ Done | 100% |
| 2. Header/Nav/Footer | ✅ Done | 100% |
| 3. Homepage | ✅ Done | 100% |
| 4. Collections/Cards | 🔄 In Progress | 80% |
| 5. Product Detail | ✅ Done | 100% |
| 6. Cart/Search/Account | 🔄 In Progress | 80% |
| 7. Support/Content | ⬜ Not Started | 0% |
| 8. SEO/Perf/A11y | ⬜ Not Started | 0% |
| 9. Polish/QA/Launch | ⬜ Not Started | 0% |
