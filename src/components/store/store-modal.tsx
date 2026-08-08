"use client";

import { useEffect, useState } from "react";
import type { StoreProduct } from "@/store/db";
import { storeI18n, useStoreLanguage } from "@/store/i18n";

type PaymentMethod = "pay2328" | "korean_bank" | "kazakh_sbp";

interface StoreModalProps {
  embedded?: boolean;
  onClose?: () => void;
}

function StoreIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function KoreaFlagIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 640 480" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle", marginRight: "5px", flexShrink: 0 }}>
      <rect width="640" height="480" fill="#ffffff" />
      <circle cx="320" cy="240" r="120" fill="#c60c30" />
      <path d="M200,240 A120,120 0 0,0 440,240 A60,60 0 0,0 320,240 A60,60 0 0,1 200,240 Z" fill="#003478" />
    </svg>
  );
}

function KazakhFlagIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 640 480" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle", marginRight: "5px", flexShrink: 0 }}>
      <rect width="640" height="480" fill="#00afca" />
      <circle cx="320" cy="240" r="75" fill="#ffe000" />
    </svg>
  );
}

export function StoreModal({ embedded = false, onClose }: StoreModalProps) {
  const language = useStoreLanguage();
  const t = storeI18n[language] || storeI18n.en;

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Views State
  const [viewedProduct, setViewedProduct] = useState<StoreProduct | null>(null); // Step 1: Product Detail View
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null); // Step 2: Checkout Form View
  const [placedOrder, setPlacedOrder] = useState<{ // Step 3: Order Placed (2-3 Hours Notice) Screen
    orderId: string;
    customerEmail: string;
    productTitle: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentUrl?: string;
    message?: string;
  } | null>(null);

  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("korean_bank");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ KRW: number; KZT: number }>({
    KRW: 1380,
    KZT: 475,
  });

  useEffect(() => {
    fetchProducts();
    fetch("/api/store/exchange-rates", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates?.KRW && data?.rates?.KZT) {
          setExchangeRates({ KRW: data.rates.KRW, KZT: data.rates.KZT });
        }
      })
      .catch(() => {
        // Fallback default rates
      });
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // Keep empty if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Open Detailed Product Modal
  const handleOpenProductDetails = (product: StoreProduct) => {
    setViewedProduct(product);
  };

  // Step 2: Transition from Product Details to Checkout Form
  const handleProceedToCheckout = (product: StoreProduct) => {
    setViewedProduct(null);
    setCheckoutProduct(product);
    setCheckoutError(null);
    setReceiptFile(null);
  };

  // Step 3: Submit Order -> Transition to 2-3 Hours Delivery Confirmation Screen
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct || !customerEmail) return;

    setSubmitting(true);
    setCheckoutError(null);

    try {
      if (paymentMethod === "pay2328") {
        const res = await fetch("/api/store/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: checkoutProduct.id,
            customerEmail,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPlacedOrder({
            orderId: data.orderId,
            customerEmail,
            productTitle: checkoutProduct.title,
            amount: checkoutProduct.price,
            paymentMethod: "pay2328",
            paymentUrl: data.paymentUrl,
            message: t.invoiceCreated,
          });
          setCheckoutProduct(null);
        } else {
          setCheckoutError(data.error || "2328.io checkout failed.");
        }
      } else {
        if (!receiptFile) {
          setCheckoutError(t.receiptRequired);
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("productId", checkoutProduct.id);
        formData.append("customerEmail", customerEmail);
        formData.append("paymentMethod", paymentMethod);
        formData.append("receipt", receiptFile);

        const res = await fetch("/api/store/checkout-manual", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setPlacedOrder({
            orderId: data.orderId,
            customerEmail,
            productTitle: checkoutProduct.title,
            amount: checkoutProduct.price,
            paymentMethod,
            message: t.receiptSubmitted,
          });
          setCheckoutProduct(null);
        } else {
          setCheckoutError(data.error || "Manual payment submission failed.");
        }
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const koreanBankDetails = process.env.NEXT_PUBLIC_BANK_KOREA || "KB국민 821901-04-129481 (MIKHAIL FUR)";
  const kazakhDetails = process.env.NEXT_PUBLIC_BANK_KAZAKH || "Kaspi Bank / СБП +7 (771) 829-4102 (Mikhail F.)";

  return (
    <div className={`store-container ${embedded ? "is-embedded" : "is-modal"}`}>
      <div className="store-header">
        <div className="store-title-group">
          <span className="store-icon-wrap" style={{ color: "var(--orange)", display: "flex", alignItems: "center" }}>
            <StoreIcon size={22} />
          </span>
          <div>
            <h3>{t.storeTitle}</h3>
            <p>{t.storeSubtitle}</p>
          </div>
        </div>
        {!embedded && onClose && (
          <button type="button" className="cli-close-btn" onClick={onClose} aria-label="Close store">
            ✕
          </button>
        )}
      </div>

      <div className="store-body">
        {loading ? (
          <div className="store-loading">
            <span className="cli-pulse-dot" /> {t.loadingProducts}
          </div>
        ) : products.length === 0 ? (
          <div className="store-loading">{t.noProducts}</div>
        ) : (
          <div className="store-grid">
            {products.map((product) => (
              <div
                className="store-card clickable-card"
                key={product.id}
                onClick={() => handleOpenProductDetails(product)}
              >
                <div className="card-top">
                  <span className="card-category">{product.category.toUpperCase()}</span>
                  {product.badge && <span className="card-badge">{product.badge}</span>}
                </div>
                <h4 className="card-title">{product.title}</h4>
                <p className="card-desc">{product.description}</p>
                <div className="card-footer">
                  <div className="card-price">
                    <span className="price-val">${product.price.toFixed(2)}</span>
                    <span className="price-unit">USD</span>
                  </div>
                  <button
                    type="button"
                    className="buy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProductDetails(product);
                    }}
                  >
                    {product.stockStatus === "out_of_stock" ? t.outOfStock : t.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. DETAILED PRODUCT MODAL OVERLAY */}
      {viewedProduct && (
        <div className="checkout-overlay" onClick={(e) => { if (e.target === e.currentTarget) setViewedProduct(null); }}>
          <div className="checkout-modal product-detail-modal">
            <div className="checkout-header">
              <h4>{t.productDetailsTitle}</h4>
              <button type="button" className="cli-close-btn" onClick={() => setViewedProduct(null)}>✕</button>
            </div>

            <div className="product-detail-body" style={{ padding: "20px" }}>
              <div className="detail-meta-tags">
                <span className="card-category">{viewedProduct.category.toUpperCase()}</span>
                {viewedProduct.badge && <span className="card-badge">{viewedProduct.badge}</span>}
                <span className={`stock-pill ${viewedProduct.stockStatus}`}>
                  {viewedProduct.stockStatus === "in_stock" ? t.inStock : t.outOfStock}
                </span>
              </div>

              <h2 className="detail-title">{viewedProduct.title}</h2>
              <div className="detail-price-box">
                <span className="detail-price-val">${viewedProduct.price.toFixed(2)}</span>
                <span className="detail-price-currency">USD</span>
              </div>

              <div className="detail-description-box">
                <h5>{t.specsHeader}</h5>
                <p>{viewedProduct.description}</p>
              </div>

              <div className="detail-delivery-info">
                <small>{t.manualDeliveryInfo}</small>
              </div>

              <div className="checkout-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="button" onClick={() => setViewedProduct(null)}>
                  {t.cancel}
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={viewedProduct.stockStatus === "out_of_stock"}
                  onClick={() => handleProceedToCheckout(viewedProduct)}
                >
                  {t.proceedToCheckout}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHECKOUT FORM DRAWER OVERLAY */}
      {checkoutProduct && (
        <div className="checkout-overlay" onClick={(e) => { if (e.target === e.currentTarget) setCheckoutProduct(null); }}>
          <div className="checkout-modal">
            <div className="checkout-header">
              <h4>{t.checkoutTitle}: {checkoutProduct.title}</h4>
              <button type="button" className="cli-close-btn" onClick={() => setCheckoutProduct(null)}>✕</button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="checkout-form">
              <div className="item-summary-box">
                <div className="summary-title">{checkoutProduct.title}</div>
                <div className="summary-price">${checkoutProduct.price.toFixed(2)} USD</div>
              </div>

              <div className="form-group">
                <label>{t.yourEmail}</label>
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <small className="form-hint">{t.emailHint}</small>
              </div>

              <div className="form-group">
                <label>{t.paymentMethodLabel}</label>
                <div className="payment-options">
                  <button
                    type="button"
                    className={`pay-opt ${paymentMethod === "korean_bank" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("korean_bank")}
                  >
                    <span><KoreaFlagIcon />{t.koreanBankTitle}</span>
                    <small>{t.koreanBankSub}</small>
                  </button>

                  <button
                    type="button"
                    className={`pay-opt ${paymentMethod === "kazakh_sbp" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("kazakh_sbp")}
                  >
                    <span><KazakhFlagIcon />{t.kazakhSbpTitle}</span>
                    <small>{t.kazakhSbpSub}</small>
                  </button>

                  <button
                    type="button"
                    className={`pay-opt ${paymentMethod === "pay2328" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("pay2328")}
                  >
                    <span>{t.cryptoTitle}</span>
                    <small>{t.cryptoSub}</small>
                  </button>
                </div>
              </div>

              {/* Manual Bank Instructions */}
              {(paymentMethod === "korean_bank" || paymentMethod === "kazakh_sbp") && (() => {
                const isKorean = paymentMethod === "korean_bank";
                const rate = isKorean ? exchangeRates.KRW : exchangeRates.KZT;
                const symbol = isKorean ? "₩" : "₸";
                const code = isKorean ? "KRW" : "KZT";
                const convertedInt = Math.round((checkoutProduct?.price || 0) * rate);
                const formattedConverted = `${symbol} ${convertedInt.toLocaleString("en-US")} ${code}`;
                const rateInfo = `1 USD ≈ ${rate.toLocaleString("en-US")} ${code}`;

                return (
                  <div className="bank-info-panel">
                    <div className="bank-info-head">
                      <span>{t.remittanceDetails}</span>
                    </div>
                    <div className="bank-info-details">
                      <code>
                        {isKorean ? koreanBankDetails : kazakhDetails}
                      </code>
                    </div>

                    <div className="bank-converted-box">
                      <div className="converted-label">{t.convertedAmountLabel}</div>
                      <div className="converted-value">{formattedConverted}</div>
                      <div className="converted-rate-info">
                        <small>⚡ {t.liveRateLabel} {rateInfo}</small>
                      </div>
                    </div>

                    <div className="file-upload-group">
                      <label>{t.attachReceipt}</label>
                      <div className="custom-file-dropzone">
                        <input
                          id="receipt-file-input"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          className="hidden-file-input"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="receipt-file-input" className="dropzone-label">
                          <span className="dropzone-icon">📁</span>
                          <span className="dropzone-text">
                            {receiptFile ? receiptFile.name : "Нажмите или выберите чек (PDF, PNG, JPG)"}
                          </span>
                          <span className="dropzone-btn-action">
                            {receiptFile ? "ИЗМЕНИТЬ" : "ОБЗОР"}
                          </span>
                        </label>
                        {receiptFile && (
                          <div className="attached-file-badge">
                            <span>📄 {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)</span>
                            <button type="button" onClick={() => setReceiptFile(null)} title="Remove file">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {paymentMethod === "pay2328" && (
                <div className="crypto-info-panel">
                  <p>{t.cryptoInfo}</p>
                </div>
              )}

              {checkoutError && (
                <div className="order-status-banner is-error">
                  <p>{checkoutError}</p>
                </div>
              )}

              <div className="checkout-actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setViewedProduct(checkoutProduct);
                    setCheckoutProduct(null);
                  }}
                >
                  {t.backToDetails}
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? t.processing : t.confirmOrder}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ORDER PLACED (2-3 HOURS DELIVERY NOTICE) OVERLAY */}
      {placedOrder && (
        <div className="checkout-overlay">
          <div className="checkout-modal order-placed-modal">
            <div className="order-placed-icon">⏱️</div>
            <h3>{t.orderPlacedTitle}</h3>
            <p className="order-placed-sub">{t.orderPlacedSub}</p>

            <div className="delivery-notice-card">
              <h4>{t.deliveryNoticeHeader}</h4>
              <p>{t.deliveryNoticeBody}</p>
            </div>

            <div className="order-placed-meta-box">
              <div><strong>{t.orderIdLabel}</strong> <code>#{placedOrder.orderId}</code></div>
              <div><strong>{t.customerEmailLabel}</strong> <code>{placedOrder.customerEmail}</code></div>
              <div><strong>Item:</strong> {placedOrder.productTitle} (${placedOrder.amount.toFixed(2)})</div>
            </div>

            {placedOrder.paymentUrl && (
              <div style={{ margin: "16px 0", textAlign: "center" }}>
                <a
                  href={placedOrder.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pay-link-btn"
                  style={{ display: "inline-block" }}
                >
                  {t.open2328}
                </a>
              </div>
            )}

            <div className="checkout-actions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setPlacedOrder(null)}
              >
                {t.closeStoreBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
