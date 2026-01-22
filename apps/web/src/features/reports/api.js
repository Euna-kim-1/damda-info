// 백엔드 준비 전: mock 데이터로 시작 (나중에 fetch로 교체)
const MOCK_REPORTS = [
  {
    id: 'r1',
    productName: 'Green onion',
    brand: 'No brand',
    price: 2.99,
    storeName: 'H-Mart',
    photoUrl:
      'https://images.unsplash.com/photo-1582515073490-dc84dc7a6f6e?auto=format&fit=crop&w=900&q=60',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    productName: 'Milk 2L',
    brand: 'Neilson',
    price: 5.49,
    storeName: 'T&T',
    photoUrl:
      'https://images.unsplash.com/photo-1585238342028-4c1a6df5d4a9?auto=format&fit=crop&w=900&q=60',
    createdAt: new Date().toISOString(),
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ✅ 리스트 가져오기
export async function getReports() {
  await sleep(250);
  return { items: MOCK_REPORTS, total: MOCK_REPORTS.length };
}

// ✅ 상세
export async function getReport(id) {
  await sleep(150);
  const found = MOCK_REPORTS.find((r) => r.id === id);
  if (!found) throw new Error('Report not found');
  return found;
}

// ✅ 생성 (나중에 FormData로 교체)
export async function createReport(payload) {
  await sleep(200);
  return { id: String(Date.now()), ...payload };
}
