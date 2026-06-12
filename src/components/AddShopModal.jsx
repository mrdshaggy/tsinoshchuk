import { useState, useEffect } from 'react';
import { CHAINS, getStores } from '../services/api';
import { getCurrentPosition, haversineKm, formatDistance } from '../utils/geo';

export default function AddShopModal({ onAdd, onClose }) {
  const [step, setStep] = useState('chain');
  const [activeChain, setActiveChain] = useState(null);
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    getCurrentPosition()
      .then(setUserPos)
      .catch(() => {});
  }, []);

  async function pickChain(key) {
    // ATB has national pricing — no store picker needed
    if (key === 'atb') {
      onAdd(key, { id: 'atb-national', title: 'АТБ-Маркет', address: 'Загальнонаціональні ціни', coordinates: null });
      return;
    }

    setActiveChain(key);
    setStep('store');
    setLoading(true);
    setError(null);
    setStoreSearch('');
    try {
      let list = await getStores(CHAINS[key].hub, userPos);
      if (userPos) {
        list = list
          .map((s) => {
            const lat = s.coordinates?.latitude ?? s.lat;
            const lng = s.coordinates?.longitude ?? s.lng;
            const dist = lat != null && lng != null
              ? haversineKm(userPos.lat, userPos.lng, lat, lng)
              : Infinity;
            return { ...s, _dist: dist };
          })
          .sort((a, b) => a._dist - b._dist);
      }
      setStores(list);
      setFiltered(list);
    } catch (e) {
      setError(`Не вдалося завантажити магазини: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleStoreSearch(q) {
    setStoreSearch(q);
    const lq = q.toLowerCase();
    setFiltered(stores.filter((s) =>
      s.title?.toLowerCase().includes(lq) || s.address?.toLowerCase().includes(lq)
    ));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {step === 'chain' ? (
              <span>Оберіть мережу</span>
            ) : (
              <>
                <button className="back-btn" onClick={() => setStep('chain')}>←</button>
                <span style={{ color: CHAINS[activeChain].color }}>
                  {CHAINS[activeChain].name}
                </span>
                <span className="modal-subtitle">— оберіть магазин</span>
              </>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {step === 'chain' && (
          <div className="chain-grid">
            {Object.entries(CHAINS).map(([key, chain]) => (
              <button
                key={key}
                className="chain-card"
                style={{ '--c': chain.color, '--bg': chain.bg }}
                onClick={() => pickChain(key)}
              >
                <span className="chain-name">{chain.name}</span>
              </button>
            ))}
          </div>
        )}

        {step === 'store' && (
          <div className="store-step">
            <input
              className="store-search-input"
              placeholder="Пошук за адресою або містом…"
              value={storeSearch}
              onChange={(e) => handleStoreSearch(e.target.value)}
              autoFocus
            />

            {loading && <div className="modal-loading">Завантаження магазинів…</div>}
            {error && <div className="modal-error">{error}</div>}

            {!loading && !error && (
              <div className="store-list">
                {filtered.length === 0 ? (
                  <div className="modal-empty">Магазини не знайдено</div>
                ) : (
                  filtered.map((store) => (
                    <button
                      key={store.id}
                      className="store-item"
                      onClick={() => onAdd(activeChain, store)}
                    >
                      <div className="store-item-info">
                        <div className="store-item-title">{store.title}</div>
                        <div className="store-item-address">{store.address}</div>
                      </div>
                      {store._dist !== Infinity && (
                        <div className="store-item-dist">
                          {formatDistance(store._dist)}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
