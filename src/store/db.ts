import fs from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

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
  geo: string;
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

// Upstash Redis Client Initializer
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

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
    createdAt: new Date().toISOString(),
  },
];

// Local disk fallback helper
function ensureLocalDbFile(): StoreDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: StoreDatabase = {
      products: defaultProducts,
      orders: [],
      authSessions: [],
      adminTokens: [],
    };
    try { fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8"); } catch {}
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
    return {
      products: defaultProducts,
      orders: [],
      authSessions: [],
      adminTokens: [],
    };
  }
}

// ----------------------------------------------------
// Upstash Redis Persistent Database Operations
// ----------------------------------------------------

export async function getProducts(): Promise<StoreProduct[]> {
  if (redis) {
    try {
      const data = await redis.get<StoreProduct[]>("store:products");
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
      // Seed default products if empty
      await redis.set("store:products", defaultProducts);
      return defaultProducts;
    } catch (err) {
      console.warn("Upstash Redis getProducts error, falling back to disk/memory:", err);
    }
  }
  return ensureLocalDbFile().products;
}

export async function getProductById(id: string): Promise<StoreProduct | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function saveProduct(product: StoreProduct): Promise<void> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }

  if (redis) {
    try {
      await redis.set("store:products", products);
    } catch (err) {
      console.warn("Upstash Redis saveProduct error:", err);
    }
  }

  // Update local file backup
  const db = ensureLocalDbFile();
  db.products = products;
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); } catch {}
}

export async function deleteProduct(id: string): Promise<void> {
  let products = await getProducts();
  products = products.filter((p) => p.id !== id);

  if (redis) {
    try {
      await redis.set("store:products", products);
    } catch (err) {
      console.warn("Upstash Redis deleteProduct error:", err);
    }
  }

  const db = ensureLocalDbFile();
  db.products = products;
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); } catch {}
}

export async function getOrders(): Promise<StoreOrder[]> {
  if (redis) {
    try {
      const data = await redis.get<StoreOrder[]>("store:orders");
      if (data && Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.warn("Upstash Redis getOrders error, falling back to disk/memory:", err);
    }
  }
  return ensureLocalDbFile().orders;
}

export async function getOrderById(orderId: string): Promise<StoreOrder | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.orderId === orderId);
}

export async function saveOrder(order: StoreOrder): Promise<void> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.orderId === order.orderId);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }

  if (redis) {
    try {
      await redis.set("store:orders", orders);
    } catch (err) {
      console.warn("Upstash Redis saveOrder error:", err);
    }
  }

  const db = ensureLocalDbFile();
  db.orders = orders;
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); } catch {}
}

export async function getAuthSessions(): Promise<AdminAuthSession[]> {
  if (redis) {
    try {
      const data = await redis.get<AdminAuthSession[]>("store:auth_sessions");
      if (data && Array.isArray(data)) {
        const now = Date.now();
        // 2 hours TTL cleanup
        return data.filter((s) => now - s.createdAt < 2 * 60 * 60 * 1000);
      }
      return [];
    } catch (err) {
      console.warn("Upstash Redis getAuthSessions error:", err);
    }
  }
  return ensureLocalDbFile().authSessions;
}

export async function saveAuthSessions(sessions: AdminAuthSession[]): Promise<void> {
  if (redis) {
    try {
      // Set in Redis with 2-hour TTL auto-expiration
      await redis.set("store:auth_sessions", sessions, { ex: 7200 });
    } catch (err) {
      console.warn("Upstash Redis saveAuthSessions error:", err);
    }
  }

  const db = ensureLocalDbFile();
  db.authSessions = sessions;
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); } catch {}
}

export async function createAuthSession(session: AdminAuthSession): Promise<void> {
  const sessions = await getAuthSessions();
  const now = Date.now();
  const filtered = sessions.filter((s) => now - s.createdAt < 2 * 60 * 60 * 1000);
  filtered.push(session);
  await saveAuthSessions(filtered);
}

export async function getRecentPendingAuthSession(ip: string): Promise<AdminAuthSession | undefined> {
  const sessions = await getAuthSessions();
  const now = Date.now();
  return sessions.find(
    (s) => s.ip === ip && s.status === "pending" && now - s.createdAt < 60 * 1000
  );
}

export async function getAuthSession(sessionId: string): Promise<AdminAuthSession | undefined> {
  const sessions = await getAuthSessions();
  return sessions.find((s) => s.sessionId === sessionId);
}

export async function getAuthSessionByCode(code: string): Promise<AdminAuthSession | undefined> {
  const sessions = await getAuthSessions();
  const cleanCode = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return sessions.find((s) => s.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === cleanCode);
}

export async function approveAuthSessionByCode(code: string, token: string): Promise<AdminAuthSession | null> {
  const sessions = await getAuthSessions();
  const cleanCode = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const session = sessions.find(
    (s) => s.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === cleanCode
  );

  if (session) {
    session.status = "approved";
    session.approvedAt = Date.now();
    session.token = token;

    await saveAuthSessions(sessions);
    await saveAdminToken(token);
    return session;
  }
  return null;
}

export async function getAdminTokens(): Promise<string[]> {
  if (redis) {
    try {
      const tokens = await redis.get<string[]>("store:admin_tokens");
      if (tokens && Array.isArray(tokens)) return tokens;
    } catch (err) {
      console.warn("Upstash Redis getAdminTokens error:", err);
    }
  }
  return ensureLocalDbFile().adminTokens;
}

export async function saveAdminToken(token: string): Promise<void> {
  const tokens = await getAdminTokens();
  if (!tokens.includes(token)) {
    tokens.push(token);
  }

  if (redis) {
    try {
      await redis.set("store:admin_tokens", tokens);
    } catch (err) {
      console.warn("Upstash Redis saveAdminToken error:", err);
    }
  }

  const db = ensureLocalDbFile();
  db.adminTokens = tokens;
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8"); } catch {}
}

export async function isValidAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  const tokens = await getAdminTokens();
  return tokens.includes(token);
}
