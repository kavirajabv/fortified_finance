import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Product, Invoice, InvoiceItem } from '../types';
import { BusinessEngine } from '../services/businessEngine';

interface BillingViewProps {
  products: Product[];
  onFinalizeInvoice: (updatedProducts: Product[], newInvoice: Invoice, warnings: string[]) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  onFinalizeInvoice,
  onOpenAIWithPrompt,
}) => {
  const [customerName, setCustomerName] = useState('Acme Technologies Pvt Ltd');
  const [customerEmail, setCustomerEmail] = useState('procurement@acmetech.in');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedQty, setSelectedQty] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(5);
  const [taxPercent, setTaxPercent] = useState(18);

  const [cartItems, setCartItems] = useState<InvoiceItem[]>([
    {
      productId: 'prod_1',
      name: 'Braided Type-C Thunderbolt Cable 2m',
      sku: 'CAB-USB-01',
      unitPrice: 699,
      quantity: 2,
      total: 1398
    },
    {
      productId: 'prod_3',
      name: 'Tactile Mechanical Keyboard 75%',
      sku: 'KB-MECH-RGB',
      unitPrice: 4999,
      quantity: 1,
      total: 4999
    }
  ]);

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Compute live deterministic totals
  const totals = BusinessEngine.calculateInvoiceTotals(
    cartItems.map((item) => ({ unitPrice: item.unitPrice, quantity: item.quantity })),
    discountPercent,
    taxPercent
  );

  const handleAddItem = () => {
    if (!selectedProduct) return;
    if (selectedQty <= 0) return;
    setErrorMessage(null);

    // Check if quantity exceeds available stock
    const existingInCart = cartItems.find((i) => i.productId === selectedProduct.id);
    const totalDesired = (existingInCart ? existingInCart.quantity : 0) + selectedQty;

    if (totalDesired > selectedProduct.stock) {
      setErrorMessage(`Cannot add ${selectedQty} units. Only ${selectedProduct.stock} units of '${selectedProduct.name}' in stock.`);
      return;
    }

    if (existingInCart) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + selectedQty,
                total: (item.quantity + selectedQty) * item.unitPrice
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          unitPrice: selectedProduct.price,
          quantity: selectedQty,
          total: selectedQty * selectedProduct.price
        }
      ]);
    }

    setSelectedQty(1);
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(cartItems.filter((i) => i.productId !== productId));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setErrorMessage('Please add at least one item to generate an invoice.');
      return;
    }

    const result = BusinessEngine.processInvoiceCheckout(products, {
      customerName,
      customerEmail,
      items: cartItems,
      discountPercentage: discountPercent,
      taxPercentage: taxPercent
    });

    onFinalizeInvoice(result.updatedProducts, result.createdInvoice, result.stockWarnings);
    setPreviewInvoice(result.createdInvoice);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Point of Sale & Billing Terminal</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Atomic invoice checkout with live inventory deduction and tax verification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection & Customer Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Details Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Customer Specification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer / Organization Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Apex Studio Labs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Billing Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. accounts@apex.com"
                />
              </div>
            </div>
          </div>

          {/* Add Product Selector */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Select Catalog Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} ({p.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.stock || 99}
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 text-center font-mono"
                  />
                  <button
                    onClick={handleAddItem}
                    disabled={!selectedProduct || selectedProduct.stock <= 0}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shrink-0 shadow-md transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {selectedProduct && (
              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
                <span>SKU: {selectedProduct.sku}</span>
                <span>•</span>
                <span className={selectedProduct.stock <= selectedProduct.minimumStock ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                  Current Stock: {selectedProduct.stock} units
                </span>
                <span>•</span>
                <span>Unit Cost: ₹{selectedProduct.cost}</span>
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">Invoice Line Items ({cartItems.length})</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No items added to invoice yet. Select a product above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Unit Price</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cartItems.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{item.name}</div>
                          <span className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">₹{item.unitPrice}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300 font-bold">{item.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">₹{item.total.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Billing Calculation & Finalize Button */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Price & Tax Computation</h2>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Items Subtotal:</span>
                <span className="font-mono font-semibold text-slate-200">₹{totals.subtotal.toLocaleString()}</span>
              </div>

              {/* Discount selection */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Discount ({discountPercent}%):</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-emerald-400">-₹{totals.discountAmount.toLocaleString()}</span>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                    className="ml-2 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                  </select>
                </div>
              </div>

              {/* Tax selection */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">GST / Tax ({taxPercent}%):</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-300">+₹{totals.taxAmount.toLocaleString()}</span>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseInt(e.target.value))}
                    className="ml-2 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                  >
                    <option value="18">18%</option>
                    <option value="12">12%</option>
                    <option value="5">5%</option>
                    <option value="0">0%</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total:</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">₹{totals.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-slate-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Inventory Deduction</span>
              </div>
              <p>Finalizing this invoice atomically decrements product inventory quantities in stock.</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Finalize & Generate Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Preview Slip Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  FF
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">FortiFi Tax Invoice</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{previewInvoice.invoiceNumber}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase font-bold">
                {previewInvoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Billed To:</span>
                <span className="font-semibold text-slate-200">{previewInvoice.customerName}</span>
                <span className="text-slate-400 block text-[11px]">{previewInvoice.customerEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Date of Issue:</span>
                <span className="font-mono text-slate-200">{previewInvoice.createdAt}</span>
                <span className="text-slate-400 block text-[11px]">Due: {previewInvoice.dueDate}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {previewInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 text-slate-200 font-sans">{item.name}</td>
                      <td className="py-2 px-2 text-center text-slate-300">{item.quantity}</td>
                      <td className="py-2 px-2 text-right text-slate-300">₹{item.unitPrice}</td>
                      <td className="py-2 px-2 text-right text-slate-100 font-bold">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">₹{previewInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="font-mono text-emerald-400">-₹{previewInvoice.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%):</span>
                <span className="font-mono">+₹{previewInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800/60">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-cyan-400 text-base">₹{previewInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print?.();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="py-2 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
