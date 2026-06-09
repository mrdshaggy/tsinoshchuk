export const MOCK_STORES = {
  atb: [
    { id: 'a1', title: 'АТБ Борщагівська', address: 'вул. Борщагівська, 154, Київ', coordinates: { latitude: 50.4489, longitude: 30.4112 } },
    { id: 'a2', title: 'АТБ Троєщина', address: 'вул. Закревського, 29, Київ', coordinates: { latitude: 50.5173, longitude: 30.6005 } },
    { id: 'a3', title: 'АТБ Виноградар', address: 'вул. Маршала Тимошенка, 21, Київ', coordinates: { latitude: 50.4823, longitude: 30.3987 } },
    { id: 'a4', title: 'АТБ Позняки', address: 'вул. Ялтинська, 8, Київ', coordinates: { latitude: 50.3905, longitude: 30.6347 } },
    { id: 'a5', title: 'АТБ Дарниця', address: 'вул. Харківське шосе, 58, Київ', coordinates: { latitude: 50.4292, longitude: 30.6417 } },
    { id: 'a6', title: 'АТБ Лісовий масив', address: 'вул. Чернігівська, 8, Київ', coordinates: { latitude: 50.5031, longitude: 30.6212 } },
    { id: 'a7', title: 'АТБ Оболонь', address: 'просп. Оболонський, 15, Київ', coordinates: { latitude: 50.5088, longitude: 30.4921 } },
    { id: 'a8', title: 'АТБ Харків Салтівка', address: 'просп. Тракторобудівників, 115, Харків', coordinates: { latitude: 50.0214, longitude: 36.3021 } },
    { id: 'a9', title: 'АТБ Харків Центр', address: 'вул. Полтавський Шлях, 135, Харків', coordinates: { latitude: 49.9845, longitude: 36.2217 } },
    { id: 'a10', title: 'АТБ Одеса Черемушки', address: 'вул. Заболотного, 4, Одеса', coordinates: { latitude: 46.4127, longitude: 30.7234 } },
    { id: 'a11', title: 'АТБ Дніпро Перемога', address: 'вул. Калинова, 52, Дніпро', coordinates: { latitude: 48.4523, longitude: 35.0678 } },
    { id: 'a12', title: 'АТБ Львів Сихів', address: 'вул. Хуторівка, 3, Львів', coordinates: { latitude: 49.8023, longitude: 24.0431 } },
    { id: 'a13', title: 'АТБ Запоріжжя', address: 'просп. Соборний, 160, Запоріжжя', coordinates: { latitude: 47.8388, longitude: 35.1396 } },
  ],
  metro: [
    { id: 'm1', title: 'METRO Київ Васильківська', address: 'вул. Васильківська, 30, Київ', coordinates: { latitude: 50.4167, longitude: 30.5234 } },
    { id: 'm2', title: 'METRO Київ Столична', address: 'вул. Столична, 103, Київ', coordinates: { latitude: 50.3847, longitude: 30.6572 } },
    { id: 'm3', title: 'METRO Харків', address: "вул. Юр'єва, 6, Харків", coordinates: { latitude: 49.9578, longitude: 36.3412 } },
    { id: 'm4', title: 'METRO Одеса', address: 'вул. Аеропортівська, 29, Одеса', coordinates: { latitude: 46.4302, longitude: 30.7684 } },
    { id: 'm5', title: 'METRO Дніпро', address: 'вул. Набережна Перемоги, 32, Дніпро', coordinates: { latitude: 48.4789, longitude: 35.0145 } },
    { id: 'm6', title: 'METRO Львів', address: 'вул. Стрийська, 30, Львів', coordinates: { latitude: 49.8134, longitude: 23.9872 } },
    { id: 'm7', title: 'METRO Запоріжжя', address: 'вул. Дніпровське шосе, 4, Запоріжжя', coordinates: { latitude: 47.8612, longitude: 35.1023 } },
    { id: 'm8', title: 'METRO Київ Броварський', address: 'Броварське шосе, 2а, Київ', coordinates: { latitude: 50.4856, longitude: 30.7123 } },
  ],
};

// Products database per category keyword
const PRODUCTS_DB = {
  молоко: [
    { ean: 'p001', title: 'Молоко Яготинське 2.5% 0.9л', weight: '0.9 л', img: null, basePrices: { silpo: 38.9, atb: 34.5, metro: 32.9 } },
    { ean: 'p002', title: 'Молоко Lactel 3.2% 1л', weight: '1 л', img: null, basePrices: { silpo: 46.5, atb: 42.9, metro: 40.9 } },
    { ean: 'p003', title: 'Молоко Простоквашино 2.5% 1л', weight: '1 л', img: null, basePrices: { silpo: 41.9, atb: 38.5, metro: 37.5 } },
    { ean: 'p004', title: 'Молоко Галичина Селянське 3.2% 1л', weight: '1 л', img: null, basePrices: { silpo: 44.9, atb: 40.5, metro: 39.9 } },
    { ean: 'p005', title: 'Молоко Злагода 2.5% 0.9л', weight: '0.9 л', img: null, basePrices: { silpo: 36.9, atb: 33.9, metro: 32.5 } },
    { ean: 'p006', title: 'Молоко Слов\'яночка 1.5% 1л', weight: '1 л', img: null, basePrices: { silpo: 35.5, atb: 32.9, metro: 31.9 } },
  ],
  хліб: [
    { ean: 'b001', title: 'Хліб Дарницький нарізний 700г', weight: '700 г', img: null, basePrices: { silpo: 28.9, atb: 25.5, metro: 24.9 } },
    { ean: 'b002', title: 'Хліб Бородинський 700г', weight: '700 г', img: null, basePrices: { silpo: 32.9, atb: 29.9, metro: 27.9 } },
    { ean: 'b003', title: 'Багет французький 250г', weight: '250 г', img: null, basePrices: { silpo: 19.9, atb: 17.5, metro: 16.9 } },
    { ean: 'b004', title: 'Хліб пшеничний нарізний 500г', weight: '500 г', img: null, basePrices: { silpo: 22.9, atb: 20.5, metro: 19.9 } },
    { ean: 'b005', title: 'Хліб Столичний 850г', weight: '850 г', img: null, basePrices: { silpo: 34.9, atb: 31.5, metro: 30.9 } },
  ],
  сир: [
    { ean: 'c001', title: 'Сир Гауда нарізаний 200г', weight: '200 г', img: null, basePrices: { silpo: 89.9, atb: 79.5, metro: 75.9 } },
    { ean: 'c002', title: 'Сир Едам 200г', weight: '200 г', img: null, basePrices: { silpo: 82.9, atb: 74.9, metro: 71.9 } },
    { ean: 'c003', title: 'Сир Ламбер 200г', weight: '200 г', img: null, basePrices: { silpo: 94.9, atb: 85.9, metro: 82.9 } },
    { ean: 'c004', title: 'Творог Яготинський 9% 350г', weight: '350 г', img: null, basePrices: { silpo: 58.9, atb: 52.9, metro: 49.9 } },
    { ean: 'c005', title: 'Сир плавлений Президент 140г', weight: '140 г', img: null, basePrices: { silpo: 38.9, atb: 34.9, metro: 33.5 } },
  ],
  яйця: [
    { ean: 'e001', title: 'Яйця курячі С1 10шт', weight: '10 шт', img: null, basePrices: { silpo: 54.9, atb: 48.5, metro: 46.9 } },
    { ean: 'e002', title: 'Яйця Наша Ряба С0 10шт', weight: '10 шт', img: null, basePrices: { silpo: 72.9, atb: 64.9, metro: 62.9 } },
    { ean: 'e003', title: 'Яйця фермерські С0 6шт', weight: '6 шт', img: null, basePrices: { silpo: 48.9, atb: 43.9, metro: 42.5 } },
  ],
  масло: [
    { ean: 'bt001', title: 'Масло Яготинське 72.5% 200г', weight: '200 г', img: null, basePrices: { silpo: 74.9, atb: 67.9, metro: 64.9 } },
    { ean: 'bt002', title: 'Масло Президент 82.5% 200г', weight: '200 г', img: null, basePrices: { silpo: 89.9, atb: 82.9, metro: 79.9 } },
    { ean: 'bt003', title: 'Масло Галичина Селянське 73% 180г', weight: '180 г', img: null, basePrices: { silpo: 69.9, atb: 63.5, metro: 61.9 } },
    { ean: 'bt004', title: 'Масло Злагода 73% 200г', weight: '200 г', img: null, basePrices: { silpo: 64.9, atb: 58.9, metro: 57.5 } },
  ],
  кава: [
    { ean: 'k001', title: 'Кава Jacobs Monarch мелена 250г', weight: '250 г', img: null, basePrices: { silpo: 149.9, atb: 134.9, metro: 129.9 } },
    { ean: 'k002', title: 'Кава Nescafe Classic розчинна 95г', weight: '95 г', img: null, basePrices: { silpo: 89.9, atb: 79.9, metro: 76.9 } },
    { ean: 'k003', title: 'Кава Lavazza Crema e Gusto 250г', weight: '250 г', img: null, basePrices: { silpo: 189.9, atb: 174.9, metro: 169.9 } },
    { ean: 'k004', title: 'Кава MacCoffee 3в1 20шт', weight: '20 шт', img: null, basePrices: { silpo: 69.9, atb: 62.9, metro: 59.9 } },
  ],
  вода: [
    { ean: 'w001', title: 'Вода Моршинська 1.5л', weight: '1.5 л', img: null, basePrices: { silpo: 24.9, atb: 21.5, metro: 20.9 } },
    { ean: 'w002', title: 'Вода Бонаква 1.5л', weight: '1.5 л', img: null, basePrices: { silpo: 22.9, atb: 19.9, metro: 19.5 } },
    { ean: 'w003', title: 'Вода Миргородська 1.5л', weight: '1.5 л', img: null, basePrices: { silpo: 21.9, atb: 19.5, metro: 18.9 } },
    { ean: 'w004', title: 'Вода BonAqua газована 0.5л', weight: '0.5 л', img: null, basePrices: { silpo: 13.9, atb: 11.9, metro: 11.5 } },
  ],
  цукор: [
    { ean: 'su001', title: 'Цукор-пісок білий 1кг', weight: '1 кг', img: null, basePrices: { silpo: 38.9, atb: 34.5, metro: 33.9 } },
    { ean: 'su002', title: 'Цукор рафінований 1кг', weight: '1 кг', img: null, basePrices: { silpo: 45.9, atb: 41.9, metro: 40.5 } },
    { ean: 'su003', title: 'Цукрова пудра 300г', weight: '300 г', img: null, basePrices: { silpo: 29.9, atb: 26.9, metro: 25.9 } },
  ],
  борошно: [
    { ean: 'fl001', title: 'Борошно Сокіл в/г 1кг', weight: '1 кг', img: null, basePrices: { silpo: 32.9, atb: 28.9, metro: 27.9 } },
    { ean: 'fl002', title: 'Борошно пшеничне 2кг', weight: '2 кг', img: null, basePrices: { silpo: 54.9, atb: 48.5, metro: 47.9 } },
  ],
  "м'ясо": [
    { ean: 'me001', title: 'Філе куряче 1кг (вага)', weight: '~1 кг', img: null, basePrices: { silpo: 149.9, atb: 134.9, metro: 129.0 } },
    { ean: 'me002', title: 'Свинина шия охолоджена 1кг', weight: '~1 кг', img: null, basePrices: { silpo: 219.9, atb: 199.9, metro: 194.9 } },
    { ean: 'me003', title: 'Яловичина вирізка 1кг', weight: '~1 кг', img: null, basePrices: { silpo: 289.9, atb: 264.9, metro: 259.9 } },
  ],
};

// Vary price slightly by store instance so different branches have different prices
function varyPrice(basePrice, storeId) {
  // Deterministic variation based on storeId so it stays consistent
  const seed = storeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const factor = 1 + ((seed % 10) - 4) * 0.015; // ±6%
  return Math.round(basePrice * factor * 10) / 10;
}

function findCategory(query) {
  const q = query.toLowerCase().trim();
  for (const key of Object.keys(PRODUCTS_DB)) {
    if (q.includes(key) || key.includes(q)) return key;
  }
  // Partial match
  for (const key of Object.keys(PRODUCTS_DB)) {
    if (q.split('').filter(c => key.includes(c)).length >= 3) return key;
  }
  return null;
}

export function mockGetStores(chainKey) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_STORES[chainKey] ?? []), 300);
  });
}

export function mockSearchProducts(storeId, chainKey, query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cat = findCategory(query);
      if (!cat) { resolve([]); return; }
      const products = PRODUCTS_DB[cat].map((p) => ({
        ean: p.ean,
        title: p.title,
        weight: p.weight,
        img: p.img,
        price: varyPrice(p.basePrices[chainKey] ?? p.basePrices.silpo, storeId),
      }));
      resolve(products);
    }, 400 + Math.random() * 300);
  });
}
