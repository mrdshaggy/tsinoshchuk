import { useState, useCallback } from 'react';
import Logo from './components/Logo';
import AddShopModal from './components/AddShopModal';
import SearchBar from './components/SearchBar';
import ResultsGrid from './components/ResultsGrid';
import { CHAINS, searchProducts } from './services/api';
import './App.css';

let shopCounter = 0;

export default function App() {
  const [selectedShops, setSelectedShops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [results, setResults] = useState({});
  const [currentQuery, setCurrentQuery] = useState('');

  const addShop = useCallback((chainKey, store) => {
    const id = `shop-${++shopCounter}`;
    setSelectedShops((prev) => [...prev, { id, chainKey, store }]);
    setIsModalOpen(false);
  }, []);

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <Logo size={44} />
            <div className="logo-text">
              <span className="logo-title">NEAR DEAL</span>
              <span className="logo-sub">Знайди дешевше поруч</span>
            </div>
          </div>
        </div>
      </header>

      <div className="demo-banner">
        ⚠ Демо-режим — АТБ не має публічного API, його дані демонстраційні. Сільпо та METRO — реальні API.
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
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <ResultsGrid shops={selectedShops} results={results} />
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
    </div>
  );
}
