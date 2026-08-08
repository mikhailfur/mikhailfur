import mysql from "mysql2/promise";
import type { StoreProduct, StoreOrder } from "./db";

const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
const host = process.env.MYSQL_HOST || "localhost";
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "";
const database = process.env.MYSQL_DATABASE || "mikhail_store";
const port = Number.parseInt(process.env.MYSQL_PORT || "3306", 10);

let pool: mysql.Pool | null = null;
let isInitialized = false;

export function getMysqlPool(): mysql.Pool | null {
  if (pool) return pool;

  if (mysqlUrl) {
    try {
      pool = mysql.createPool(mysqlUrl);
      return pool;
    } catch (err) {
      console.warn("Failed to create MySQL pool from URL:", err);
    }
  }

  if (process.env.MYSQL_HOST || process.env.MYSQL_DATABASE) {
    try {
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      return pool;
    } catch (err) {
      console.warn("Failed to create MySQL pool from config:", err);
    }
  }

  return null;
}

export async function initMysqlTables(): Promise<boolean> {
  if (isInitialized) return true;
  const p = getMysqlPool();
  if (!p) return false;

  try {
    const conn = await p.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          badge VARCHAR(64),
          category VARCHAR(64) NOT NULL DEFAULT 'digital',
          stock_status VARCHAR(64) NOT NULL DEFAULT 'in_stock',
          item_content TEXT,
          created_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id VARCHAR(64) PRIMARY KEY,
          product_id VARCHAR(64) NOT NULL,
          product_title VARCHAR(255) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          customer_email VARCHAR(255) NOT NULL,
          payment_method VARCHAR(64) NOT NULL,
          payment_status VARCHAR(64) NOT NULL DEFAULT 'pending',
          receipt_filename TEXT,
          receipt_data_url LONGTEXT,
          pay2328_uuid VARCHAR(255),
          pay2328_url TEXT,
          created_at VARCHAR(64) NOT NULL,
          fulfilled_at VARCHAR(64),
          delivery_notes TEXT,
          resend_email_id VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      isInitialized = true;
      return true;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.warn("MySQL database table initialization error:", err);
    return false;
  }
}

// ----------------------------------------------------
// MySQL CRUD Operations for Products & Orders
// ----------------------------------------------------

export async function getMysqlProducts(): Promise<StoreProduct[] | null> {
  const p = getMysqlPool();
  if (!p) return null;

  try {
    await initMysqlTables();
    const [rows] = await p.query<mysql.RowDataPacket[]>("SELECT * FROM products ORDER BY created_at DESC");
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: Number.parseFloat(row.price),
      currency: row.currency || "USD",
      badge: row.badge || undefined,
      category: row.category || "digital",
      stockStatus: row.stock_status || "in_stock",
      itemContent: row.item_content || undefined,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn("MySQL getProducts query failed:", err);
    return null;
  }
}

export async function saveMysqlProduct(product: StoreProduct): Promise<boolean> {
  const p = getMysqlPool();
  if (!p) return false;

  try {
    await initMysqlTables();
    const sql = `
      INSERT INTO products (id, title, description, price, currency, badge, category, stock_status, item_content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        price = VALUES(price),
        currency = VALUES(currency),
        badge = VALUES(badge),
        category = VALUES(category),
        stock_status = VALUES(stock_status),
        item_content = VALUES(item_content);
    `;
    await p.execute(sql, [
      product.id,
      product.title,
      product.description,
      product.price,
      product.currency || "USD",
      product.badge || null,
      product.category || "digital",
      product.stockStatus || "in_stock",
      product.itemContent || null,
      product.createdAt || new Date().toISOString(),
    ]);
    return true;
  } catch (err) {
    console.warn("MySQL saveProduct query failed:", err);
    return false;
  }
}

export async function deleteMysqlProduct(id: string): Promise<boolean> {
  const p = getMysqlPool();
  if (!p) return false;

  try {
    await initMysqlTables();
    await p.execute("DELETE FROM products WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.warn("MySQL deleteProduct query failed:", err);
    return false;
  }
}

export async function getMysqlOrders(): Promise<StoreOrder[] | null> {
  const p = getMysqlPool();
  if (!p) return null;

  try {
    await initMysqlTables();
    const [rows] = await p.query<mysql.RowDataPacket[]>("SELECT * FROM orders ORDER BY created_at DESC");
    return rows.map((row) => ({
      orderId: row.order_id,
      productId: row.product_id,
      productTitle: row.product_title,
      amount: Number.parseFloat(row.amount),
      currency: row.currency || "USD",
      customerEmail: row.customer_email,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      receiptFilename: row.receipt_filename || undefined,
      receiptDataUrl: row.receipt_data_url || undefined,
      pay2328Uuid: row.pay2328_uuid || undefined,
      pay2328Url: row.pay2328_url || undefined,
      createdAt: row.created_at,
      fulfilledAt: row.fulfilled_at || undefined,
      deliveryNotes: row.delivery_notes || undefined,
      resendEmailId: row.resend_email_id || undefined,
    }));
  } catch (err) {
    console.warn("MySQL getOrders query failed:", err);
    return null;
  }
}

export async function saveMysqlOrder(order: StoreOrder): Promise<boolean> {
  const p = getMysqlPool();
  if (!p) return false;

  try {
    await initMysqlTables();
    const sql = `
      INSERT INTO orders (
        order_id, product_id, product_title, amount, currency, customer_email,
        payment_method, payment_status, receipt_filename, receipt_data_url,
        pay2328_uuid, pay2328_url, created_at, fulfilled_at, delivery_notes, resend_email_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        payment_status = VALUES(payment_status),
        receipt_filename = VALUES(receipt_filename),
        receipt_data_url = VALUES(receipt_data_url),
        pay2328_uuid = VALUES(pay2328_uuid),
        pay2328_url = VALUES(pay2328_url),
        fulfilled_at = VALUES(fulfilled_at),
        delivery_notes = VALUES(delivery_notes),
        resend_email_id = VALUES(resend_email_id);
    `;
    await p.execute(sql, [
      order.orderId,
      order.productId,
      order.productTitle,
      order.amount,
      order.currency || "USD",
      order.customerEmail,
      order.paymentMethod,
      order.paymentStatus || "pending",
      order.receiptFilename || null,
      order.receiptDataUrl || null,
      order.pay2328Uuid || null,
      order.pay2328Url || null,
      order.createdAt || new Date().toISOString(),
      order.fulfilledAt || null,
      order.deliveryNotes || null,
      order.resendEmailId || null,
    ]);
    return true;
  } catch (err) {
    console.warn("MySQL saveOrder query failed:", err);
    return false;
  }
}
