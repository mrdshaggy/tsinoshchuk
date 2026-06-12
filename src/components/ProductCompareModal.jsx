import { useEffect, useState } from 'react';
import { searchProducts, CHAINS } from '../services/api';
import ProductCard from './ProductCard';

function stripDecorations(w) {
  return w.replace(/[«»"'()[\],.!?:;]/g, '');
}

function tokenize(title) {
  return (title || '').toLowerCase().split(/\s+/).map(stripDecorations).filter(w => w.length > 2);
}

function extractCapitalized(title) {
  return (title || '')
    .replace(/[«»"'()[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && /^[А-ЯҐЄІЇЁA-Z]/.test(w))
    .map(w => w.toLowerCase().replace(/[,.!?:;]/g, ''));
}

function parsePercent(title) {
  const m = (title || '').match(/(\d+[,.]?\d*)\s*%/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

function parseWeightGrams(str) {
  if (!str) return null;
  let m;
  m = str.match(/(\d+[,.]?\d*)\s*кг/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1000);
  m = str.match(/(\d+[,.]?\d*)\s*мл/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')));
  m = str.match(/(\d+[,.]?\d*)\s*л(?![а-яіїєґёa-z])/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * 1000);
  m = str.match(/(\d+[,.]?\d*)\s*г(?![а-яіїєґёa-z])/i);
  if (m) return Math.round(parseFloat(m[1].replace(',', '.')));
  return null;
}

// First 1-2 capitalized words as cross-chain search query
function makeCompareQuery(title) {
  const caps = (title || '')
    .replace(/[«»"'()[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && /^[А-ЯҐЄІЇЁA-Z]/.test(w))
    .map(w => w.replace(/[,.!?:;]/g, ''));
  if (caps.length >= 1) return caps.slice(0, 2).join(' ');
  return (title || '')
    .replace(/[«»"'()[\]]/g, ' ')
    .replace(/\b\d+[,.]?\d*\s*(г|кг|мл|л|шт|%)/gi, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .split(' ').filter(w => w.length > 2).slice(0, 3).join(' ')
    || (title || '').split(' ').slice(0, 2).join(' ');
}

// Returns up to maxResults matching items for a source product.
// Matching logic:
//   1. All source cap words must appear in candidate (product type + brand)
//   2. Candidate must not have more foreign cap words than source has caps
//   3. Fat % must agree if both have it
//   4. Weight: exact match (±10g) preferred; mismatched weight accepted only if
//      price-per-gram ratio is within 25% (handles 100г vs 1кг produce pricing)
function findBestMatches(items, sourceProduct, maxResults = 3) {
  const valid = items.filter(i => i.title && i.price != null);
  if (!valid.length) return [];

  const sourceTitle = sourceProduct.title || '';
  const sourceCaps = extractCapitalized(sourceTitle);
  const sourceCapsSet = new Set(sourceCaps);

  const sourceWeight = parseWeightGrams(sourceTitle)
    ?? (sourceProduct.weight ? parseWeightGrams(String(sourceProduct.weight)) : null);
  const sourcePrice = Number(sourceProduct.price);
  const sourcePPG = sourceWeight ? sourcePrice / sourceWeight : null;
  const sourcePct = parsePercent(sourceTitle);

  // No cap words → fallback to word-overlap top-N
  if (sourceCaps.length === 0) {
    const targetSet = new Set(tokenize(sourceTitle));
    return valid
      .map(item => ({ item, score: tokenize(item.title).filter(w => targetSet.has(w)).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.item);
  }

  const scored = valid.flatMap(item => {
    const itemCaps = extractCapitalized(item.title);
    const itemCapsSet = new Set(itemCaps);

    // All source cap words must appear in candidate
    const capOverlap = sourceCaps.filter(w => itemCapsSet.has(w)).length;
    if (capOverlap < sourceCaps.length) return [];

    // Candidate must not have more foreign caps than source has caps total
    const foreignCaps = itemCaps.filter(w => !sourceCapsSet.has(w)).length;
    if (foreignCaps > Math.max(sourceCaps.length, 1)) return [];

    // Fat/concentration % must agree
    const itemPct = parsePercent(item.title);
    if (sourcePct !== null && itemPct !== null && Math.abs(sourcePct - itemPct) > 0.05) return [];

    // Weight check
    const itemWeight = parseWeightGrams(item.title)
      ?? (item.weight ? parseWeightGrams(String(item.weight)) : null);
    let exactWeight = false;
    if (sourceWeight && itemWeight) {
      const diff = Math.abs(sourceWeight - itemWeight);
      if (diff <= 10) {
        exactWeight = true;
      } else {
        // Different packaging unit — accept only if price/gram is within 25%
        const itemPPG = Number(item.price) / itemWeight;
        if (!sourcePPG || !itemPPG || Math.abs(sourcePPG - itemPPG) / sourcePPG > 0.25) return [];
      }
    }

    return [{ item, capOverlap, foreignCaps, exactWeight, price: Number(item.price) }];
  });

  // Sort: exact weight > more cap overlap > fewer foreign caps > lower price
  scored.sort((a, b) => {
    if (a.exactWeight !== b.exactWeight) return a.exactWeight ? -1 : 1;
    if (b.capOverlap !== a.capOverlap) return b.capOverlap - a.capOverlap;
    if (a.foreignCaps !== b.foreignCaps) return a.foreignCaps - b.foreignCaps;
    return a.price - b.price;
  });

  return scored.slice(0, maxResults).map(s => s.item);
}

export default function ProductCompareModal({ sourceProduct, sourceShopId, selectedShops, onAddToCart, onClose }) {
  const [comparisons, setComparisons] = useState(
    selectedShops.map(s => ({
      shopEntry: s,
      loading: s.id !== sourceShopId,
      products: s.id === sourceShopId ? [sourceProduct] : [],
      error: null,
    }))
  );
  const [added, setAdded] = useState(new Set());

  useEffect(() => {
    selectedShops.forEach((shopEntry, idx) => {
      if (shopEntry.id === sourceShopId) return;
      const searchQuery = makeCompareQuery(sourceProduct.title);
      searchProducts(shopEntry.store, searchQuery, shopEntry.chainKey)
        .then(items => {
          const matches = findBestMatches(items, sourceProduct);
          setComparisons(prev => prev.map((c, i) => i === idx ? { ...c, loading: false, products: matches } : c));
        })
        .catch(err => {
          setComparisons(prev => prev.map((c, i) => i === idx ? { ...c, loading: false, error: err.message } : c));
        });
    });
  }, []);

  const allPrices = comparisons.flatMap(c => c.products.map(p => Number(p.price)).filter(p => !isNaN(p) && p > 0));
  const minPrice = allPrices.length > 1 ? Math.min(...allPrices) : null;

  function handleAdd(shopEntry, product) {
    const key = `${shopEntry.id}-${product.ean}`;
    onAddToCart(shopEntry, product);
    setAdded(prev => new Set([...prev, key]));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal compare-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Порівняння</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="compare-product-name">{sourceProduct.title}</div>
        <div className="compare-grid">
          {comparisons.map(({ shopEntry, loading, products, error }) => {
            const chain = CHAINS[shopEntry.chainKey];
            return (
              <div key={shopEntry.id} className="compare-col">
                <div className="compare-col-header" style={{ '--c': chain.color, '--bg': chain.bg }}>
                  <div className="column-chain">{chain.name}</div>
                  <div className="column-store">{shopEntry.store.title}</div>
                </div>
                <div className="compare-col-body">
                  {loading && (
                    <div className="column-status">
                      <div className="spinner" style={{ borderTopColor: chain.color }} />
                    </div>
                  )}
                  {error && <div className="column-status column-error">⚠ {error}</div>}
                  {!loading && !error && products.length === 0 && (
                    <div className="column-status column-empty">Не знайдено</div>
                  )}
                  {!loading && !error && products.map((product, pi) => {
                    const isCheapest = product.price != null && minPrice != null && Number(product.price) === minPrice;
                    const addKey = `${shopEntry.id}-${product.ean ?? pi}`;
                    const isAdded = added.has(addKey);
                    return (
                      <div key={product.ean ?? pi} className={`compare-product-wrap${pi > 0 ? ' compare-product-wrap--sep' : ''}`}>
                        <ProductCard product={product} color={chain.color} isCheapest={isCheapest} />
                        <button
                          className={`compare-add-btn${isAdded ? ' compare-add-btn--added' : ''}`}
                          style={isAdded ? {} : { '--c': chain.color }}
                          onClick={() => !isAdded && handleAdd(shopEntry, product)}
                          disabled={isAdded}
                        >
                          {isAdded ? '✓ В кошику' : '+ До кошика'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
