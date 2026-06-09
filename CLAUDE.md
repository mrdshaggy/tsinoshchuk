# CCP — Current State

## What it is
A Ukrainian grocery price comparison SPA — pick stores from multiple chains, search a product, see prices side-by-side. React 19 + Vite, no UI library, plain CSS.

---

## Architecture

```
src/
├── App.jsx                  # root: shop chip state, search trigger, result dispatch
├── App.css                  # all styles (single file, ~570 lines)
├── components/
│   ├── AddShopModal.jsx     # chain picker → store picker (with geolocation sort)
│   ├── ShopColumn.jsx       # one result column per selected store
│   ├── ResultsGrid.jsx      # thin wrapper: maps shops → ShopColumns
│   ├── ProductCard.jsx      # product row: image, name, weight, price, oldPrice
│   ├── SearchBar.jsx        # search input + button
│   └── Logo.jsx
├── services/
│   ├── api.js               # all fetch logic + CHAINS config
│   └── mockData.js          # ATB static store list + fake product results
└── utils/
    └── geo.js               # getCurrentPosition, haversineKm, formatDistance
vite.config.js               # 4 proxies: /silpo-api, /silpo-branches, /metro-api, /metro-www
```

---

## Chain status

| Chain | Stores | Products | Notes |
|-------|--------|----------|-------|
| **Сільпо** | Live — `sf-ecom-api.silpo.ua` | Live — same API | Multi-word fallback: if phrase returns 0, searches each word separately and intersects by UUID. Parallel image fetch from old catalog API. |
| **METRO** | Live — `www.metro.ua/sxa/search/results` store locator (26 stores) | Live — 2-step: search → betty-variants | `x-sd-token: mq6k5cu8` static header. Store locator parses HTML: radio `value` attribute = storeId (zero-padded to 5 digits). Coordinates from `Geospatial` field. |
| **АТБ** | Mocked (13 Kyiv/Харків/Одеса/Дніпро stores) | Mocked | No public API found. |

---

## Files

| File | Role |
|------|------|
| `vite.config.js` | 4 dev proxies: `/silpo-api` → `api.catalog.ecom.silpo.ua`, `/silpo-branches` → `sf-ecom-api.silpo.ua`, `/metro-api` → `shop.metro.ua`, `/metro-www` → `www.metro.ua` |
| `src/services/api.js` | All fetch logic. `getStores(hub)` and `searchProducts(store, query, chainKey)` are the public exports. Metro: live store locator + 2-step search (articlesearch → betty-variants). Silpo: dual-API (new ecom + old catalog for images), multi-word intersection fallback. |
| `src/App.jsx` | State: `selectedShops[]`, `results{}`, `currentQuery`. Passes `shop.store` object (not just id) to `searchProducts`. |
| `src/App.css` | Fixed-height viewport layout: `height: 100dvh; overflow: hidden` on `.app`. Flex column chain: `.app-main` → `.results-grid` (flex:1) → `.shop-column` → `.column-body` (overflow-y: auto). Per-column independent scroll. |
| `src/components/ProductCard.jsx` | Renders `oldPrice` strikethrough when `oldPrice > price`. |
| `src/services/mockData.js` | ATB only. Static store list + fake search results. |

---

## Known limitations / pending tasks

- **ATB** has no real API — needs reverse-engineering if real data is wanted
- **METRO stores** now fetched live from `www.metro.ua` store locator — all 26 stores with accurate coordinates and storeIds
- **METRO returns max 24 results** per search (page 1 only); pagination not implemented
- **Silpo images** are fetched from the old catalog API in parallel — if that endpoint goes down, images fall back to the cart emoji placeholder
- **No persistence** — selected shops and search state are lost on page refresh
