import React, { useState } from 'react';
import { Boxes, Plus, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, X } from 'lucide-react';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateProducts,
  onOpenAIWithPrompt,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Peripherals');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [supplier, setSupplier] = useState('');

  const handleRestock = (productId: string, addQty = 10) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock: p.stock + addQty } : p
    );
    onUpdateProducts(updated);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const costNum = parseFloat(cost);
    const stockNum = parseInt(stock) || 0;
    const minStockNum = parseInt(minStock) || 5;

    if (!name || isNaN(priceNum) || isNaN(costNum)) return;

    const newProd: Product = {
      id: 'prod_' + Date.now(),
      name,
      sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      category,
      price: priceNum,
      cost: costNum,
      stock: stockNum,
      minimumStock: minStockNum,
      supplier: supplier || 'Verified Distributor'
    };

    onUpdateProducts([...products, newProd]);
    setShowAddModal(false);
    setName('');
    setSku('');
    setPrice('');
    setCost('');
    setStock('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Inventory Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time stock valuation, margin analysis, and replenishment thresholds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAIWithPrompt("Analyze which inventory items need restocking and suggest recommended order quantities.")}
            className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Restock Advisory</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const isLow = p.stock <= p.minimumStock;
                const margin = Math.round(((p.price - p.cost) / p.price) * 100);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {p.sku} • {p.supplier}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">₹{p.cost}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">₹{p.price}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{margin}%</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${isLow ? 'text-amber-400' : 'text-slate-200'}`}>
                          {p.stock} units
                        </span>
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Low Stock (min {p.minimumStock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                            Adequate
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestock(p.id, 10)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition inline-flex items-center gap-1"
                        title="Restock 10 units"
                      >
                        <RefreshCw className="w-3 h-3 text-cyan-400" />
                        <span>+10</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white mb-1">Add Product to Catalog</h2>
            <p className="text-xs text-slate-400 mb-4">New items integrate immediately with billing and stock tracking.</p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. 4K UltraWide Display Stand"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="2499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Minimum Alert Level</label>
                  <input
                    type="number"
                    placeholder="8"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
