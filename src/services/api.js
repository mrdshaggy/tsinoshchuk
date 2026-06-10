import { mockGetStores, mockSearchProducts } from './mockData';

export const CHAINS = {
  silpo: { name: 'Сільпо', color: '#FF8521', bg: '#fff8f2', hub: 'silpo' },
  atb:   { name: 'АТБ',    color: '#EF3E33', bg: '#fff5f5', hub: 'atbmarket' },
  metro: { name: 'METRO',  color: '#003082', bg: '#f0f4ff', hub: 'metro' },
};

async function getSilpoStores() {
  const res = await fetch('/silpo-branches/v1/uk/branches', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.items ?? [])
    .filter((b) => b.hasPickup === true && b.addressFull && b.latitude && b.longitude)
    .map((b) => ({
      id: b.branchId,
      externalId: b.externalId,
      title: `Сільпо ${b.addressFull}`,
      address: `${b.addressFull}, ${b.cityFull}`,
      coordinates: { latitude: parseFloat(b.latitude), longitude: parseFloat(b.longitude) },
    }));
}

function makeTimeslot() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const start = now.toISOString().replace('.000', '');
  const end = new Date(now.getTime() + 3600_000).toISOString().replace('.000', '');
  return { start, end };
}

async function fetchEcomProducts(branchId, searchTerm, timeslot) {
  const params = new URLSearchParams({
    limit: '96',
    offset: '0',
    search: searchTerm,
    timeslotStart: timeslot.start,
    timeslotEnd: timeslot.end,
  });
  const res = await fetch(`/silpo-branches/v1/uk/branches/${branchId}/products?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchSilpoProducts(branchId, externalId, query) {
  const timeslot = makeTimeslot();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const [primaryRes, oldRes] = await Promise.allSettled([
    fetchEcomProducts(branchId, query, timeslot),
    fetch('/silpo-api/api/2.0/exec/EcomCatalogGlobal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GetSimpleCatalogItems',
        data: { customFilter: query, filialId: String(externalId), skuPerPage: 48, pageNumber: 1 },
      }),
    }).then((r) => (r.ok ? r.json() : null)),
  ]);

  if (primaryRes.status === 'rejected') throw primaryRes.reason;
  let items = primaryRes.value.items ?? [];

  // Multi-word query with no results: search each word separately, intersect client-side
  if (items.length === 0 && words.length > 1) {
    const wordResults = await Promise.allSettled(
      words.map((w) => fetchEcomProducts(branchId, w, timeslot).then((d) => d.items ?? []))
    );
    const sets = wordResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => new Map(r.value.map((i) => [i.id, i])));

    if (sets.length > 0) {
      // Keep items that appear in ALL per-word result sets (strict AND intersection)
      const [first, ...rest] = sets;
      items = [...first.values()].filter((item) =>
        rest.every((s) => s.has(item.id))
      );
    }
  }

  const imageMap = {};
  if (oldRes.status === 'fulfilled' && oldRes.value?.items) {
    for (const item of oldRes.value.items) {
      if (item.id && item.mainImage) imageMap[String(item.id)] = item.mainImage;
    }
  }

  return items.map((item) => ({
    ean: String(item.externalProductId ?? item.id),
    title: item.title,
    weight: item.displayRatio ?? item.ratio ?? null,
    img: imageMap[String(item.externalProductId)] ?? null,
    price: item.displayPrice ?? item.price,
    oldPrice: item.displayOldPrice ?? item.oldPrice ?? null,
  }));
}

// ── METRO ────────────────────────────────────────────────────

const METRO_HEADERS = { 'x-sd-token': 'mq6k5cu8', Accept: 'application/json' };

async function getMetroStores() {
  const params = new URLSearchParams({
    s: '{0F3B38A3-7330-4544-B95B-81FC80A6BB6F}',
    sig: 'store-locator',
    p: '30',
    v: '{BECE07BD-19B3-4E41-9C8F-E9D9EC85574F}',
    itemid: '{871024E5-B25D-4FFD-8AF1-29C3FDF1DD11}',
    o: 'Distance,Ascending',
    g: '49.0,31.0',
  });
  const res = await fetch(`/metro-www/sxa/search/results?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return (data.Results ?? []).flatMap((result) => {
    const html = result.Html ?? '';
    const valueMatch = html.match(/name="store"\s+value="(\d+)"/);
    if (!valueMatch) return [];
    const nameMatch = html.match(/class="field-store-name">\s*([^\r\n<]+)/);
    const addrMatch = html.match(/class="field-address">\s*([^\r\n<]+)/);
    const geo = result.Geospatial;
    return [{
      id: valueMatch[1].padStart(5, '0'),
      title: `METRO ${nameMatch?.[1]?.trim() ?? valueMatch[1]}`,
      address: addrMatch?.[1]?.trim() ?? '',
      coordinates: { latitude: geo?.Latitude ?? 0, longitude: geo?.Longitude ?? 0 },
    }];
  });
}

function metroDeliveryDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function metroWeight(contentData, grossWeight) {
  if (contentData?.netContentVolume) {
    const { value, uom } = contentData.netContentVolume;
    if (uom === 'ML') return value >= 1000 ? `${value / 1000} л` : `${value} мл`;
    if (uom === 'L') return `${value} л`;
  }
  if (contentData?.netPieceWeight) {
    const { value, uom } = contentData.netPieceWeight;
    if (uom === 'GRAM') return value >= 1000 ? `${value / 1000} кг` : `${value} г`;
    if (uom === 'KG') return `${value} кг`;
  }
  if (grossWeight) return `${grossWeight} кг`;
  return null;
}

async function searchMetroProducts(storeId, query) {
  const searchParams = new URLSearchParams({
    storeId, language: 'uk-UA', country: 'UA', query, rows: '24', page: '1',
  });
  const searchRes = await fetch(`/metro-api/searchdiscover/articlesearch/search?${searchParams}`, {
    headers: METRO_HEADERS,
  });
  if (!searchRes.ok) throw new Error(`HTTP ${searchRes.status}`);
  const searchData = await searchRes.json();

  const resultIds = (searchData.resultIds ?? []).filter(
    (id) => searchData.results?.[id]?.isAvailable !== false,
  );
  if (resultIds.length === 0) return [];

  const priceMap = {};
  for (const [id, info] of Object.entries(searchData.results ?? {})) {
    if (info.price != null) priceMap[id] = info.price;
  }

  const varParams = new URLSearchParams({
    storeIds: storeId, country: 'UA', locale: 'uk-UA', deliveryDate: metroDeliveryDate(),
  });
  for (const id of resultIds) varParams.append('ids', id);

  const varRes = await fetch(`/metro-api/evaluate.article.v1/betty-variants?${varParams}`, {
    headers: METRO_HEADERS,
  });
  if (!varRes.ok) throw new Error(`HTTP ${varRes.status}`);
  const varData = await varRes.json();

  return resultIds.flatMap((id) => {
    const variant = varData.result?.[id.slice(0, -4)]?.variants?.[id.slice(-4)];
    if (!variant) return [];
    const bundle = variant.bundles ? Object.values(variant.bundles)[0] : null;
    return [{
      ean: id,
      title: variant.description,
      weight: metroWeight(bundle?.contentData, bundle?.grossWeight),
      img: variant.imageUrlL ?? variant.imageUrl ?? null,
      price: priceMap[id] ?? null,
      oldPrice: null,
    }];
  });
}

// ── АТБ (OpenStreetMap / Overpass) ────────────────────────────

const ATB_OVERPASS_QUERY =
  '[out:json][timeout:60];' +
  '(node["brand:wikidata"="Q4054103"](44,22,52.5,40.5);' +
  'way["brand:wikidata"="Q4054103"](44,22,52.5,40.5););' +
  'out center;';

async function getAtbStores() {
  const res = await fetch('/overpass-api/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(ATB_OVERPASS_QUERY),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return (data.elements ?? []).flatMap((el) => {
    const lat = el.lat ?? el.center?.lat ?? 0;
    const lon = el.lon ?? el.center?.lon ?? 0;
    if (!lat || !lon) return [];
    const t = el.tags ?? {};
    const city = t['addr:city'] ?? '';
    const street = t['addr:street'] ?? '';
    const num = t['addr:housenumber'] ?? '';
    const addressLine = [street, num].filter(Boolean).join(' ');
    const titleExtra = [city, street].filter(Boolean).join(', ');
    return [{
      id: `osm-${el.id}`,
      title: titleExtra ? `АТБ-Маркет ${titleExtra}` : 'АТБ-Маркет',
      address: [addressLine, city].filter(Boolean).join(', '),
      coordinates: { latitude: lat, longitude: lon },
    }];
  });
}

// ── Public API ───────────────────────────────────────────────

export async function getStores(hub) {
  if (hub === 'silpo') return getSilpoStores();
  if (hub === 'metro') return getMetroStores();
  if (hub === 'atbmarket') return getAtbStores();
  const chainKey = Object.keys(CHAINS).find((k) => CHAINS[k].hub === hub);
  return mockGetStores(chainKey);
}

export async function searchProducts(store, query, chainKey) {
  if (chainKey === 'silpo') return searchSilpoProducts(store.id, store.externalId, query);
  if (chainKey === 'metro') return searchMetroProducts(store.id, query);
  return mockSearchProducts(store.id, chainKey, query);
}
