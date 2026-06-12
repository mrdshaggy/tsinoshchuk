import { useState, useCallback } from 'react';
import Logo from './components/Logo';
import AddShopModal from './components/AddShopModal';
import SearchBar from './components/SearchBar';
import ResultsGrid from './components/ResultsGrid';
import ProductCompareModal from './components/ProductCompareModal';
import CartDrawer from './components/CartDrawer';
import { CHAINS, searchProducts } from './services/api';
import './App.css';

let shopCounter = 0;

export default function App() {
  const [selectedShops, setSelectedShops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [results, setResults] = useState({});
  const [currentQuery, setCurrentQuery] = useState('');
  const [compareModal, setCompareModal] = useState(null);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addShop = useCallback((chainKey, store) => {
    const id = `shop-${++shopCounter}`;
    const newShop = { id, chainKey, store };
    setSelectedShops((prev) => [...prev, newShop]);
    setIsModalOpen(false);

    if (currentQuery) {
      setResults((prev) => ({ ...prev, [id]: { loading: true, products: [], error: null } }));
      searchProducts(store, currentQuery, chainKey)
        .then((products) => {
          const sorted = [...products].sort((a, b) => Number(a.price) - Number(b.price));
          setResults((prev) => ({ ...prev, [id]: { loading: false, products: sorted, error: null } }));
        })
        .catch((e) => {
          setResults((prev) => ({ ...prev, [id]: { loading: false, products: [], error: e.message } }));
        });
    }
  }, [currentQuery]);

  const removeShop = useCallback((shopId) => {
    setSelectedShops((prev) => prev.filter((s) => s.id !== shopId));
    setResults((prev) => {
      const next = { ...prev };
      delete next[shopId];
      return next;
    });
  }, []);

  const runSearch = useCallback(async (query, shops) => {
    if (!shops.length) return;
    setCurrentQuery(query);

    const initial = {};
    shops.forEach((s) => { initial[s.id] = { loading: true, products: [], error: null }; });
    setResults(initial);

    await Promise.all(
      shops.map(async (shop) => {
        try {
          const products = await searchProducts(shop.store, query, shop.chainKey);
          const sorted = [...products].sort((a, b) => Number(a.price) - Number(b.price));
          setResults((prev) => ({
            ...prev,
            [shop.id]: { loading: false, products: sorted, error: null },
          }));
        } catch (e) {
          setResults((prev) => ({
            ...prev,
            [shop.id]: { loading: false, products: [], error: e.message },
          }));
        }
      })
    );
  }, []);

  const handleSearch = useCallback((query) => {
    runSearch(query, selectedShops);
  }, [selectedShops, runSearch]);

  const openCompareModal = useCallback((product, shopEntry) => {
    setCompareModal({ product, shopEntry });
  }, []);

  const addToCart = useCallback((shopEntry, product) => {
    setCart(prev => {
      const key = shopEntry.id;
      const existing = prev[key] || { shop: shopEntry.store, chainKey: shopEntry.chainKey, items: [] };
      if (existing.items.some(i => i.ean === product.ean)) return prev;
      return { ...prev, [key]: { ...existing, items: [...existing.items, product] } };
    });
  }, []);

  const removeFromCart = useCallback((shopId, productEan) => {
    setCart(prev => {
      const entry = prev[shopId];
      if (!entry) return prev;
      const items = entry.items.filter(i => i.ean !== productEan);
      if (items.length === 0) {
        const next = { ...prev };
        delete next[shopId];
        return next;
      }
      return { ...prev, [shopId]: { ...entry, items } };
    });
  }, []);

  const totalCartItems = Object.values(cart).reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <Logo size={44} />
            <div className="logo-text">
              <span className="logo-title">ЦІНОЩУК</span>
              <span className="logo-sub">Знайди дешевше поруч</span>
            </div>
          </div>
          <button className="cart-icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Кошик">
            🛒
            {totalCartItems > 0 && <span className="cart-icon-badge">{totalCartItems}</span>}
          </button>
        </div>
      </header>

      <div className="demo-banner">
        Сільпо, METRO та АТБ — реальні дані. Магазини АТБ: OpenStreetMap. Ціни АТБ: загальнонаціональні (без прив'язки до конкретного магазину).
      </div>

      <main className="app-main">
        <section className="shop-selector-section">
          <div className="shop-chips-row">
            {selectedShops.map((shop) => {
              const chain = CHAINS[shop.chainKey];
              return (
                <div
                  key={shop.id}
                  className="shop-chip"
                  style={{ '--c': chain.color, '--bg': chain.bg }}
                >
                  <div className="chip-inner">
                    <span className="chip-chain">{chain.name}</span>
                    <span className="chip-store">{shop.store.title}</span>
                  </div>
                  <button
                    className="chip-remove"
                    onClick={() => removeShop(shop.id)}
                    aria-label={`Видалити ${chain.name}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <button className="add-shop-btn" onClick={() => setIsModalOpen(true)}>
              <span className="add-icon">+</span>
              Додати магазин
            </button>
          </div>
        </section>

        <SearchBar onSearch={handleSearch} disabled={selectedShops.length === 0} />

        {Object.keys(results).length > 0 && currentQuery && (
          <div className="results-label">
            Результати для <strong>"{currentQuery}"</strong>
            <span className="results-hint"> — натисніть на товар, щоб порівняти</span>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <ResultsGrid shops={selectedShops} results={results} onCardClick={openCompareModal} />
        )}

        {selectedShops.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h2>Оберіть магазини</h2>
            <p>Натисніть "+ Додати магазин" щоб додати АТБ, Сільпо або METRO</p>
          </div>
        )}

        {selectedShops.length > 0 && Object.keys(results).length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>Введіть запит</h2>
            <p>Наприклад: "молоко", "хліб", "сир"</p>
          </div>
        )}
      </main>

      {isModalOpen && (
        <AddShopModal onAdd={addShop} onClose={() => setIsModalOpen(false)} />
      )}

      {compareModal && (
        <ProductCompareModal
          sourceProduct={compareModal.product}
          sourceShopId={compareModal.shopEntry.id}
          selectedShops={selectedShops}
          onAddToCart={addToCart}
          onClose={() => setCompareModal(null)}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onRemoveItem={removeFromCart}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}
