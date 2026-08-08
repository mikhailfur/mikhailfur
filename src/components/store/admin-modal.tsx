"use client";

import { useEffect, useRef, useState } from "react";
import type { StoreOrder, StoreProduct } from "@/store/db";
import { storeI18n, useStoreLanguage } from "@/store/i18n";

interface AdminModalProps {
  embedded?: boolean;
  onClose?: () => void;
}

function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function AdminModal({ embedded = false, onClose }: AdminModalProps) {
  const language = useStoreLanguage();
  const t = storeI18n[language] || storeI18n.en;

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authSession, setAuthSession] = useState<{
    sessionId: string;
    code: string; // 8-character verification code e.g. 83F1-A92B
    ip: string;
    userAgent: string;
    geo: string;
  } | null>(null);

  const initRef = useRef(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "add_product">("orders");
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Fulfill Modal State
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [deliveryContent, setDeliveryContent] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [fulfilling, setFulfilling] = useState(false);
  const [fulfillMessage, setFulfillMessage] = useState<string | null>(null);

  // Add Product State
  const [newProdTitle, setNewProdTitle] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("10.00");
  const [newProdBadge, setNewProdBadge] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"digital" | "service" | "config" | "key">("digital");
  const [newProdContent, setNewProdContent] = useState("");
  const [savingProd, setSavingProd] = useState(false);

  // 1. Initial Auth Check & Session Request
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch("/api/admin/auth-status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.approved && data.token) {
          setAuthorized(true);
          setAdminToken(data.token);
          fetchAdminData(data.token);
          setCheckingAuth(false);
          return;
        }
      }

      // Request new 8-character verification code & Telegram alert
      const reqRes = await fetch("/api/admin/request-auth", { method: "POST" });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setAuthSession({
          sessionId: reqData.sessionId,
          code: reqData.code,
          ip: reqData.ip,
          userAgent: reqData.userAgent,
          geo: reqData.geo,
        });
      }
    } catch {
      // Auth request error handling
    } finally {
      setCheckingAuth(false);
    }
  };

  // 2. Poll status if waiting for Telegram approval
  useEffect(() => {
    if (authorized || !authSession) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/auth-status?sessionId=${authSession.sessionId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.approved && data.token) {
            setAuthorized(true);
            setAdminToken(data.token);
            fetchAdminData(data.token);
            clearInterval(interval);
          }
        }
      } catch {
        // Continue polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [authorized, authSession]);

  const fetchAdminData = async (token?: string) => {
    setLoadingData(true);
    const headers = { "x-admin-token": token || adminToken || "" };
    try {
      const [prodRes, ordersRes] = await Promise.all([
        fetch("/api/store/products", { cache: "no-store", headers }),
        fetch("/api/admin/orders", { cache: "no-store", headers }),
      ]);
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || []);
      }
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
      }
    } catch {
      // Handle error
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenFulfill = (order: StoreOrder) => {
    setSelectedOrder(order);
    setFulfillMessage(null);

    const matchedProd = products.find((p) => p.id === order.productId);
    setDeliveryContent(matchedProd?.itemContent || "");
    setCustomNote("");
  };

  const handleSendFulfill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !deliveryContent) return;

    setFulfilling(true);
    setFulfillMessage(null);

    try {
      const res = await fetch("/api/admin/fulfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          itemContent: deliveryContent,
          customNote,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFulfillMessage(`✅ ${selectedOrder.customerEmail} (Resend ID: ${data.resendId})`);
        fetchAdminData();
      } else {
        setFulfillMessage(`❌ Error: ${data.error || "Fulfillment failed"}`);
      }
    } catch (err: any) {
      setFulfillMessage(`❌ Error: ${err.message || "Network error"}`);
    } finally {
      setFulfilling(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdDesc || !newProdPrice) return;

    setSavingProd(true);
    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify({
          title: newProdTitle,
          description: newProdDesc,
          price: parseFloat(newProdPrice),
          badge: newProdBadge || undefined,
          category: newProdCategory,
          itemContent: newProdContent,
          stockStatus: "in_stock",
        }),
      });

      if (res.ok) {
        setNewProdTitle("");
        setNewProdDesc("");
        setNewProdPrice("10.00");
        setNewProdContent("");
        setActiveTab("products");
        fetchAdminData();
      }
    } catch {
      // Handle save failure
    } finally {
      setSavingProd(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await fetch(`/api/store/products?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken || "" },
      });
      fetchAdminData();
    } catch {
      // Handle delete error
    }
  };

  return (
    <div className={`admin-container ${embedded ? "is-embedded" : "is-modal"}`}>
      <div className="admin-header">
        <div className="admin-title-group">
          <span className="admin-icon-wrap" style={{ color: "var(--orange)", display: "flex", alignItems: "center" }}>
            <ShieldIcon size={20} />
          </span>
          <div>
            <h3>{t.adminTitle}</h3>
            <p>{t.adminSubtitle}</p>
          </div>
        </div>
        {!embedded && onClose && (
          <button type="button" className="cli-close-btn" onClick={onClose} aria-label="Close admin">
            ✕
          </button>
        )}
      </div>

      <div className="admin-body">
        {checkingAuth ? (
          <div className="admin-loading">
            <span className="cli-pulse-dot" /> {t.checkingAuth}
          </div>
        ) : !authorized ? (
          <div className="admin-auth-box">
            <div className="auth-alert-banner">
              <span className="alert-icon" style={{ display: "flex", alignItems: "center" }}>
                <ShieldIcon size={20} />
              </span>
              <div>
                <h5>{t.authRequiredTitle}</h5>
                <p>{t.authRequiredSub}</p>
              </div>
            </div>

            {authSession && (
              <div className="auth-code-display">
                <div className="code-label">{t.verificationCodeLabel}</div>
                <div className="code-value">{authSession.code}</div>
                <div className="code-sub">{t.verificationCodeSub}</div>
              </div>
            )}

            {authSession && (
              <div className="auth-meta-grid">
                <div>
                  <strong>{t.ipAddressLabel}</strong>
                  <code>{authSession.ip}</code>
                </div>
                <div>
                  <strong>{t.geoLabel}</strong>
                  <code>{authSession.geo}</code>
                </div>
                <div className="full-width">
                  <strong>{t.deviceLabel}</strong>
                  <code>{authSession.userAgent}</code>
                </div>
              </div>
            )}

            <div className="auth-polling-status">
              <span className="cli-pulse-dot" /> {t.waitingStatus}
            </div>

            <div className="auth-info-notice">
              <small>ℹ️ {t.authNotice}</small>
            </div>
          </div>
        ) : (
          <div className="admin-dashboard">
            <div className="dashboard-tabs">
              <button
                type="button"
                className={`dash-tab ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                {t.ordersTab} ({orders.length})
              </button>
              <button
                type="button"
                className={`dash-tab ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                {t.productsTab} ({products.length})
              </button>
              <button
                type="button"
                className={`dash-tab ${activeTab === "add_product" ? "active" : ""}`}
                onClick={() => setActiveTab("add_product")}
              >
                {t.addProductTab}
              </button>
            </div>

            {loadingData ? (
              <div className="store-loading">{t.loadingAdminData}</div>
            ) : (
              <>
                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div className="orders-panel">
                    {orders.length === 0 ? (
                      <p className="no-data-msg">{t.noOrders}</p>
                    ) : (
                      <div className="orders-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>{t.colOrderId}</th>
                              <th>{t.colProduct}</th>
                              <th>{t.colAmount}</th>
                              <th>{t.colEmail}</th>
                              <th>{t.colMethod}</th>
                              <th>{t.colStatus}</th>
                              <th>{t.colAction}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <tr key={order.orderId}>
                                <td><code>{order.orderId}</code></td>
                                <td><strong>{order.productTitle}</strong></td>
                                <td>${order.amount.toFixed(2)} USD</td>
                                <td><code>{order.customerEmail}</code></td>
                                <td>
                                  <span className="method-tag">{order.paymentMethod}</span>
                                </td>
                                <td>
                                  <span className={`status-pill ${order.paymentStatus}`}>
                                    {order.paymentStatus.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-cell">
                                    {order.receiptDataUrl && (
                                      <a
                                        href={order.receiptDataUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="view-receipt-link"
                                      >
                                        {t.viewReceipt}
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      className="button button-primary fulfill-btn"
                                      onClick={() => handleOpenFulfill(order)}
                                    >
                                      {t.fulfillBtn}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <div className="products-panel">
                    <div className="products-list-grid">
                      {products.map((prod) => (
                        <div className="admin-prod-card" key={prod.id}>
                          <div className="prod-card-head">
                            <span className="card-category">{prod.category}</span>
                            <span className="price-tag">${prod.price.toFixed(2)} USD</span>
                          </div>
                          <h5>{prod.title}</h5>
                          <p>{prod.description}</p>
                          <div className="prod-card-actions">
                            <button
                              type="button"
                              className="delete-prod-btn"
                              onClick={() => handleDeleteProduct(prod.id)}
                            >
                              {t.deleteBtn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Product Tab */}
                {activeTab === "add_product" && (
                  <form onSubmit={handleAddProduct} className="add-product-form">
                    <div className="form-group">
                      <label>{t.prodTitleLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIP Subscription 1 Month"
                        value={newProdTitle}
                        onChange={(e) => setNewProdTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.prodDescLabel}</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detailed description of what the buyer receives..."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t.prodPriceLabel}</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t.prodBadgeLabel}</label>
                        <input
                          type="text"
                          placeholder="e.g. POPULAR / SALE"
                          value={newProdBadge}
                          onChange={(e) => setNewProdBadge(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t.prodCategoryLabel}</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value as any)}
                        >
                          <option value="digital">digital</option>
                          <option value="service">service</option>
                          <option value="config">config</option>
                          <option value="key">key</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="button button-primary" disabled={savingProd}>
                      {savingProd ? t.savingBtn : t.createProductBtn}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Fulfill Order Modal Overlay */}
      {selectedOrder && (
        <div className="checkout-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div className="checkout-modal fulfill-modal">
            <div className="checkout-header">
              <h4>{t.deliverModalTitle} #{selectedOrder.orderId}</h4>
              <button type="button" className="cli-close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <form onSubmit={handleSendFulfill} className="checkout-form">
              <div className="item-summary-box">
                <div><strong>{t.recipientEmail}</strong> {selectedOrder.customerEmail}</div>
                <div><strong>{t.productLabel}</strong> {selectedOrder.productTitle} (${selectedOrder.amount.toFixed(2)})</div>
              </div>

              <div className="form-group">
                <label>{t.deliveryContentLabel}</label>
                <textarea
                  rows={4}
                  required
                  value={deliveryContent}
                  onChange={(e) => setDeliveryContent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t.customNoteLabel}</label>
                <input
                  type="text"
                  placeholder="Thank you for buying from Mikhail Lab!"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              </div>

              {fulfillMessage && (
                <div className={`order-status-banner ${fulfillMessage.startsWith("✅") ? "is-success" : "is-error"}`}>
                  {fulfillMessage}
                </div>
              )}

              <div className="checkout-actions">
                <button type="button" className="button" onClick={() => setSelectedOrder(null)}>
                  {t.closeBtn}
                </button>
                <button type="submit" className="button button-primary" disabled={fulfilling}>
                  {fulfilling ? t.sendingEmail : t.sendViaResend}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
