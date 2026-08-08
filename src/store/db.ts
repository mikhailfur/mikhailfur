import fs from "node:fs";
import path from "node:path";

export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  price: number; // in USD
  currency: string;
  badge?: string;
  category: "digital" | "service" | "config" | "key";
  stockStatus: "in_stock" | "out_of_stock";
  itemContent?: string; // optional pre-filled content template
  createdAt: string;
}

export interface StoreOrder {
  orderId: string;
  productId: string;
  productTitle: string;
  amount: number;
  currency: string;
  customerEmail: string;
  paymentMethod: "pay2328" | "korean_bank" | "kazakh_sbp";
  paymentStatus: "pending" | "paid" | "fulfilled" | "cancelled" | "rejected";
  receiptFilename?: string;
  receiptDataUrl?: string;
  pay2328Uuid?: string;
  pay2328Url?: string;
  createdAt: string;
  fulfilledAt?: string;
  deliveryNotes?: string;
  resendEmailId?: string;
}

export interface AdminAuthSession {
  sessionId: string;
  code: string; // 8-character verification code e.g. "83F1A92B"
  ip: string;
  userAgent: string;
  geo: string; // e.g. "Seoul, Korea"
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  approvedAt?: number;
  token?: string;
}

export interface StoreDatabase {
  products: StoreProduct[];
  orders: StoreOrder[];
  authSessions: AdminAuthSession[];
  adminTokens: string[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "store_db.json");

const defaultProducts: StoreProduct[] = [
  {
    id: "prod-miyabi-pro",
    title: "Miyabi AI Pro Pass (1 Month)",
    description: "Unlimited high-speed access to Miyabi AI Agent with extended token context window (64k), custom voice synthesis, and priority queue processing.",
    price: 15.0,
    currency: "USD",
    badge: "POPULAR",
    category: "digital",
    stockStatus: "in_stock",
    itemContent: "PASS-KEY-MIYABI-PRO-88192-X99",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-antigravity-config",
    title: "Cyberpunk Terminal Preset Config",
    description: "Complete custom design theme package & settings file for Antigravity CLI and terminal-blog system. Includes custom CSS tokens, Braille art presets, and hotkeys.",
    price: 8.5,
    currency: "USD",
    badge: "NEW",
    category: "config",
    stockStatus: "in_stock",
    itemContent: "https://mikhailfur.lab/configs/preset-cyberpunk-v2.json",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-openrouter-key",
    title: "Gemma 4 31B API Access Pass",
    description: "Pre-configured fast LLM endpoint token for OpenRouter / Google Gemma 4 31B with zero rate-limit throttle for personal developer scripts.",
    price: 25.0,
    currency: "USD",
    category: "key",
    stockStatus: "in_stock",
    itemContent: "sk-or-v1-981240182490124890128490",
    createdAt: new Date().toISOString(),
  },
];

function ensureDbFile(): StoreDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: StoreDatabase = {
      products: defaultProducts,
      orders: [],
      authSessions: [],
      adminTokens: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(content) as StoreDatabase;
    return {
      products: data.products || defaultProducts,
      orders: data.orders || [],
      authSessions: data.authSessions || [],
      adminTokens: data.adminTokens || [],
    };
  } catch {
    const fallbackDb: StoreDatabase = {
      products: defaultProducts,
      orders: [],
      authSessions: [],
      adminTokens: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackDb, null, 2), "utf-8");
    return fallbackDb;
  }
}

export function readStoreDb(): StoreDatabase {
  return ensureDbFile();
}

export function writeStoreDb(db: StoreDatabase): void {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export function getProducts(): StoreProduct[] {
  const db = readStoreDb();
  return db.products;
}

export function getProductById(id: string): StoreProduct | undefined {
  const db = readStoreDb();
  return db.products.find((p) => p.id === id);
}

export function saveProduct(product: StoreProduct): void {
  const db = readStoreDb();
  const index = db.products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    db.products[index] = product;
  } else {
    db.products.push(product);
  }
  writeStoreDb(db);
}

export function deleteProduct(id: string): void {
  const db = readStoreDb();
  db.products = db.products.filter((p) => p.id !== id);
  writeStoreDb(db);
}

export function getOrders(): StoreOrder[] {
  const db = readStoreDb();
  return db.orders;
}

export function getOrderById(orderId: string): StoreOrder | undefined {
  const db = readStoreDb();
  return db.orders.find((o) => o.orderId === orderId);
}

export function saveOrder(order: StoreOrder): void {
  const db = readStoreDb();
  const index = db.orders.findIndex((o) => o.orderId === order.orderId);
  if (index >= 0) {
    db.orders[index] = order;
  } else {
    db.orders.unshift(order);
  }
  writeStoreDb(db);
}

export function createAuthSession(session: AdminAuthSession): void {
  const db = readStoreDb();
  const now = Date.now();
  db.authSessions = db.authSessions.filter((s) => now - s.createdAt < 2 * 60 * 60 * 1000);
  db.authSessions.push(session);
  writeStoreDb(db);
}

export function getRecentPendingAuthSession(ip: string): AdminAuthSession | undefined {
  const db = readStoreDb();
  const now = Date.now();
  return db.authSessions.find(
    (s) => s.ip === ip && s.status === "pending" && now - s.createdAt < 60 * 1000
  );
}

export function getAuthSession(sessionId: string): AdminAuthSession | undefined {
  const db = readStoreDb();
  return db.authSessions.find((s) => s.sessionId === sessionId);
}

export function getAuthSessionByCode(code: string): AdminAuthSession | undefined {
  const db = readStoreDb();
  const cleanCode = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return db.authSessions.find((s) => s.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === cleanCode);
}

export function approveAuthSessionByCode(code: string, token: string): AdminAuthSession | null {
  const db = readStoreDb();
  const cleanCode = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const session = db.authSessions.find(
    (s) => s.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === cleanCode
  );
  if (session) {
    session.status = "approved";
    session.approvedAt = Date.now();
    session.token = token;
    if (!db.adminTokens.includes(token)) {
      db.adminTokens.push(token);
    }
    writeStoreDb(db);
    return session;
  }
  return null;
}

export function isValidAdminToken(token: string): boolean {
  if (!token) return false;
  const db = readStoreDb();
  return db.adminTokens.includes(token);
}
