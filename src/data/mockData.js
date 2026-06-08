export const MOCK_STORES = [
  {
    id: "s1",
    name: "Downtown Store",
    location: "Main Street",
    inventory: [
      { sku: "SD-001", name: "Summer Dress", qty: 4, reorder: 10 },
      { sku: "WT-002", name: "White T-Shirt", qty: 18, reorder: 12 },
      { sku: "BJ-003", name: "Blue Jeans", qty: 40, reorder: 20 },
    ],
  },
  {
    id: "s2",
    name: "Uptown Store",
    location: "Mall Plaza",
    inventory: [
      { sku: "SD-001", name: "Summer Dress", qty: 28, reorder: 10 },
      { sku: "WT-002", name: "White T-Shirt", qty: 60, reorder: 12 },
      { sku: "BJ-003", name: "Blue Jeans", qty: 12, reorder: 20 },
    ],
  },
];

export const MOCK_SUGGESTIONS = [
  { product: "Summer Dress", from: "Uptown Store", to: "Downtown Store", qty: 10 },
  { product: "Blue Jeans", from: "Downtown Store", to: "Uptown Store", qty: 10 },
];

export const MOCK_TRANSFERS = [
  { id: 1, product: "Summer Dress", from: "Uptown Store", to: "Downtown Store", qty: 10, status: "Approved", date: "May 18, 2026" },
  { id: 2, product: "White T-Shirt", from: "Uptown Store", to: "Downtown Store", qty: 6, status: "In Transit", date: "May 22, 2026" },
  { id: 3, product: "Blue Jeans", from: "Downtown Store", to: "Uptown Store", qty: 8, status: "Reconciled", date: "May 15, 2026" },
];

export const MOCK_INSIGHTS = {
  recommendations: [
    {
      title: "Transfer 10 Summer Dresses from Uptown Store to Downtown Store",
      confidence: "92%",
      impact: "Reduce stockout risk by 18%",
      action: "Approve transfer",
    },
    {
      title: "Transfer 5 White T-Shirts from Suburban Store to Uptown Store",
      confidence: "88%",
      impact: "Improve availability for weekend demand",
      action: "Review recommendation",
    },
  ],
  alerts: [
    {
      product: "Summer Dress",
      type: "Stockout risk",
      detail: "Downtown Store may run out in 3 days",
    },
    {
      product: "Blue Jeans",
      type: "Excess inventory",
      detail: "Uptown Store has 28 units above target",
    },
  ],
  chat: [
    {
      question: "How is Store 2 performing this week?",
      answer: "Store 2 is up 12% in stock turnover with strong demand for seasonal apparel.",
    },
    {
      question: "Which products are at risk of stockout?",
      answer: "Summer Dress and White T-Shirt are the two highest risk items over the next 72 hours.",
    },
    {
      question: "What transfers should I prioritize?",
      answer: "Move Summer Dresses to Downtown and shift White T-Shirts to Uptown to balance inventory.",
    },
  ],
  metrics: [
    { label: "Stockouts prevented", value: "24", color: "#2563eb", trend: [8, 11, 9, 14, 16, 15, 20, 24] },
    { label: "Transfer efficiency", value: "89%", color: "#16a34a", trend: [71, 74, 73, 78, 82, 80, 86, 89] },
    { label: "Inventory balance", value: "87", color: "#f59e0b", trend: [62, 65, 70, 68, 74, 79, 83, 87] },
  ],
};
