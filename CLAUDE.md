# Цінощук — Current State

## What it is
A Ukrainian grocery price comparison SPA — pick stores from multiple chains, search a product, see prices side-by-side, compare across shops, and build a shopping cart printable as PDF. React 19 + Vite, no UI library, plain CSS. Branded as **Цінощук** ("Знайди дешевше поруч").

---

## Architecture

```
src/
├── App.jsx                        # root: shop/search/cart/modal state + handlers
├── App.css                        # all styles (single file, ~860 lines)
├── components/
│   ├── AddShopModal.jsx           # chain picker → store picker (with geolocation sort)
│   ├── ShopColumn.jsx             # one result column per selected store
│   ├── ResultsGrid.jsx            # thin wrapper: maps shops → ShopColumns
│   ├── ProductCard.jsx            # product row + clickable + "Дешевше" badge
│   ├── ProductCompareModal.jsx    # cross-shop product comparison + add-to-cart
│   ├── CartDrawer.jsx             # slide-in cart grouped by shop + print/PDF
│   ├── SearchBar.jsx              # search input + button
│   └── Logo.jsx                  # Цінощук pin+basket SVG icon
├── services/
│   ├── api.js                     # all fetch logic + CHAINS config
│   └── mockData.js                # unused legacy (ATB mock data, kept as fallback)
├── utils/
│   └── geo.js                     # getCurrentPosition, haversineKm, formatDistance
└── assets/
    └── neardeal_icon.svg          # source icon file
index.html                         # title: Цінощук, favicon: /favicon.svg
public/favicon.svg                 # Цінощук pin+basket icon
vite.config.js                     # 5 proxies: /silpo-api, /silpo-branches, /metro-api, /metro-www, /overpass-api
.github/workflows/deploy.yml       # GitHub Actions: build + deploy to gh-pages branch
```

---

## Chain status

| Chain | Stores | Products | Notes |
|-------|--------|----------|-------|
| **Сільпо** | Live — `sf-ecom-api.silpo.ua` | Live — same API | Multi-word fallback: if phrase returns 0, searches each word separately and intersects by UUID. Images from `images.silpo.ua/v2/products/300x300/webp/{icon}` (icon UUID in API response). |
| **METRO** | Live — `www.metro.ua/sxa/search/results` (26 stores) | Live — 2-step: search → betty-variants | `x-sd-token: mq6k5cu8` static header. Store locator parses HTML: radio `value` = storeId (zero-padded to 5 digits). Coordinates from `Geospatial` field. |
| **АТБ** | Live — OpenStreetMap Overpass API (~1234 stores, Ukraine bbox 44,22,52.5,40.5) | Live — `api.multisearch.io` | `brand:wikidata=Q4054103`. Overpass requires POST. Products: `id=11280`, `key=63a6d0a760fd2d0562c4061b78e64754`, CORS-enabled (no proxy needed). National pricing (not store-specific). Weight parsed from title. |

---

## Files

| File | Role |
|------|------|
| `vite.config.js` | 5 dev proxies: `/silpo-api` → `api.catalog.ecom.silpo.ua`, `/silpo-branches` → `sf-ecom-api.silpo.ua`, `/metro-api` → `shop.metro.ua`, `/metro-www` → `www.metro.ua`, `/overpass-api` → `overpass-api.de`. Also `base: '/tsinoshchuk/'` for GitHub Pages. |
| `src/services/api.js` | All fetch logic. `getStores(hub)` and `searchProducts(store, query, chainKey)` are the public exports. Silpo: ecom API for products, `images.silpo.ua` CDN for images (no proxy needed). ATB: `extractAtbWeight()` parses weight string from product title (кг→кг, г→г, мл→мл, л→л). |
| `src/App.jsx` | State: `selectedShops[]`, `results{}`, `currentQuery`, `compareModal`, `cart{}`, `isCartOpen`. `addShop` auto-searches `currentQuery` for the new shop if a query is already active (prevents crash when adding a shop after a search). `addToCart(shopEntry, product)` deduplicates by EAN. `removeFromCart(shopId, ean)` auto-removes empty shop buckets. Cart icon in header shows badge count. |
| `src/App.css` | Fixed-height viewport layout: `height: 100dvh; overflow: hidden` on `.app`. Flex column chain: `.app-main` → `.results-grid` (flex:1) → `.shop-column` → `.column-body` (overflow-y: auto). Per-column independent scroll. Print CSS: `body * { visibility: hidden }` + cart-drawer override for clean print/PDF output. |
| `src/components/Logo.jsx` | Цінощук pin+basket SVG. `viewBox="0 0 248 340"`, `width={size}` prop (portrait, aspect-ratio preserved). Blue pin (#2563EB), green badge (#16A34A). |
| `src/components/ProductCard.jsx` | `onClick` → makes card clickable. `isCheapest` → green "Дешевше" badge + green border. Renders `oldPrice` strikethrough when `oldPrice > price`. `onError` on img replaces broken image with emoji placeholder div. |
| `src/components/ShopColumn.jsx` | Accepts `onCardClick(product, shop)` prop, passes `() => onCardClick(p, shop)` to each ProductCard. |
| `src/components/ResultsGrid.jsx` | Threads `onCardClick` prop down to ShopColumn. |
| `src/components/ProductCompareModal.jsx` | On open: shows source product immediately, searches all other shops in parallel using `makeCompareQuery` (first 1-2 capitalized words). `findBestMatches` returns up to 3 items per shop. Each column can show 0–3 stacked ProductCards with individual "До кошика" buttons. Cheapest badge compares across all products from all shops globally. Cart keys are `shopId-ean`. |
| `src/components/CartDrawer.jsx` | Slide-in from right. Grouped by shop (chain color header). Per-shop subtotal + grand total. Remove items with ✕. "Друк / PDF" calls `window.print()`. |
| `src/services/mockData.js` | Legacy ATB mock data — no longer used in production paths but kept. |
| `public/favicon.svg` | Цінощук pin+basket icon (same as Logo.jsx, plain SVG attributes). |
| `index.html` | Page title: Цінощук. Favicon: `/favicon.svg`. |

---

## Compare modal matching algorithm (`ProductCompareModal.jsx`)

### Search query — `makeCompareQuery(title)`
Extract the first 1–2 capitalized words (brand / product-type). Short queries are more reliable across different chain APIs than full-phrase queries. Fallback when no caps: strip numbers/units, take first 3 words.

### Candidate filtering — `findBestMatches(items, sourceProduct, maxResults=3)`

Returns **up to 3** best-matching items (not just 1). All units normalized to grams.

1. **No caps fallback**: if source has zero capitalized words, return top-3 by word-overlap score.
2. **Cap gate** (Gate 1): ALL source capitalized words must appear in the candidate title. "Нектар Sandora Лимон" → candidate must contain нектар, sandora, лимон.
3. **Foreign-cap gate** (Gate 2): candidate must not have more extra capitalized words than source has total. Blocks "METRO PROFESSIONAL Засіб Лимон для миття посуду" (3 foreign caps) when source is "Лимон" (1 cap allowed). Passes "Лимон Іспанія" (1 foreign = 1 allowed).
4. **Fat % gate**: parse `"1,6%"` / `"2.5%"` — if both have %, must match within 0.05.
5. **Weight gate**: parse weight from title AND from `product.weight` field as fallback. Normalize to grams (`кг×1000`, `л×1000`, `мл×1`). If weights are within ±10g → exact match. If weights differ more, only accept if **price-per-gram ratio is within 25%** — this handles produce sold per unit (100г, 14.90 грн) vs per kg (1000г, 124 грн): same product, different packaging unit.

**Sort order**: exact weight match first → higher cap overlap → fewer foreign caps → lower price.

---

## Image CDN URLs

| Chain | Pattern |
|-------|---------|
| Сільпо | `https://images.silpo.ua/v2/products/300x300/webp/{icon}` — `icon` is UUID from `icon` field in ecom API response |
| METRO | `https://cdn.metro-group.com/ua/...` — full URL returned by betty-variants API |
| АТБ | `https://src.zakaz.atbmarket.com/cache/photos/{id}/catalog_list_{id}.jpg` — full URL in `picture` field |

---

## Known limitations / pending tasks

- **ATB Overpass query is slow** (~3-8s) — fetches all ~1234 stores at once; could be optimised with a geolocation-bounded bbox
- **ATB prices are national** — `api.multisearch.io` called without `location` param; prices are uniform nationwide, not store-specific
- **METRO returns max 24 results** per search (page 1 only); pagination not implemented
- **No persistence** — selected shops, search state, and cart are lost on page refresh
- **GitHub Pages CORS** — Сільпо and METRO live APIs fail on GitHub Pages (no server-side proxy); Vercel recommended for full public deployment
- **Compare modal matching** is heuristic — may not match across chains for products with no brand name, all-lowercase titles, or ambiguous multi-category keywords (e.g. "Лимон" returns fruit AND cleaning products in the raw search; the algorithm filters them, but unusual products may slip through or be excluded)
- **Compare modal** searches only the first 1-2 cap words — may return too broad a result set for very generic product names
