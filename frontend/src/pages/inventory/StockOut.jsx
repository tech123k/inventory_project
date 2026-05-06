import { useState, useEffect, useRef } from 'react';
import { ArrowDownCircle, Search, X, CheckCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';

export default function StockOut() {
  const [allStocks, setAllStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockSearch, setStockSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentMovements, setRecentMovements] = useState([]);
  const [success, setSuccess] = useState(null);
  const dropdownRef = useRef();

  useEffect(() => {
    fetchStocks();
    fetchRecentOut();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchStocks = () => {
    api.get('/inventory/stocks?limit=500').then(r => setAllStocks(r.data.stocks || [])).catch(() => {});
  };

  const fetchRecentOut = () => {
    api.get('/inventory/movements?type=out&limit=10').then(r => setRecentMovements(r.data.movements || [])).catch(() => {});
  };

  const filteredStocks = allStocks.filter(s =>
    `${s.articleName} ${s.gender} ${s.color} ${s.size} ${s.series}`.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!selectedStock) return toast.error('Please select a stock item first');
    if (!qty || qty < 1) return toast.error('Enter valid quantity (minimum 1)');
    if (qty > selectedStock.currentCartons) {
      return toast.error(`Only ${selectedStock.currentCartons} cartons available`);
    }

    setLoading(true);
    try {
      const { data } = await api.post('/inventory/stock-out', {
        stockId: selectedStock._id,
        quantity: qty,
        notes
      });
      toast.success(data.message);
      setSuccess({ ...data.stock, removed: qty });
      setSelectedStock(data.stock);
      setQuantity('');
      setNotes('');
      fetchStocks();
      fetchRecentOut();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock out failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedStock(null);
    setStockSearch('');
    setQuantity('');
    setNotes('');
    setSuccess(null);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowDownCircle className="text-red-500" size={28} /> Stock Out
          </h1>
          <p className="text-slate-500 text-sm mt-1">Remove cartons from existing stock</p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">
                {success.removed} cartons removed from {success.articleName}
              </p>
              <p className="text-emerald-600 text-xs mt-0.5">
                Remaining: <strong>{success.currentCartons} cartons</strong>
              </p>
            </div>
            <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Stock Search Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="label">Select Stock Article <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="Search by name, gender, color, size..."
                value={selectedStock
                  ? `${selectedStock.articleName} · ${selectedStock.gender}${selectedStock.color ? ' · ' + selectedStock.color : ''}${selectedStock.size ? ' · Size ' + selectedStock.size : ''}`
                  : stockSearch}
                onChange={e => { setStockSearch(e.target.value); setSelectedStock(null); setShowDropdown(true); setSuccess(null); }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
              {selectedStock && (
                <button type="button" onClick={reset} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <X size={16} />
                </button>
              )}
            </div>

            {showDropdown && !selectedStock && (
              <ul className="absolute z-30 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-72 overflow-auto">
                {filteredStocks.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-slate-400 text-center">No stocks found</li>
                ) : filteredStocks.slice(0, 40).map(s => (
                  <li key={s._id}
                    onMouseDown={() => { setSelectedStock(s); setShowDropdown(false); setStockSearch(''); }}
                    className="px-4 py-3 hover:bg-rose-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                    <div className="flex items-center gap-3">
                      {s.image
                        ? <img src={s.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        : <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-300 text-xs">IMG</div>}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800">{s.articleName}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {s.gender}{s.color ? ` · ${s.color}` : ''}{s.size ? ` · Size ${s.size}` : ''}{s.series ? ` · ${s.series}` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`badge ${s.currentCartons > 5 ? 'bg-emerald-100 text-emerald-700' : s.currentCartons > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {s.currentCartons} ctns
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected Stock Details */}
          {selectedStock && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-4">
                {selectedStock.image && (
                  <img src={selectedStock.image} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                )}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    ['Article', selectedStock.articleName],
                    ['Gender', selectedStock.gender],
                    ['Stock Type', selectedStock.stockType],
                    ['Color', selectedStock.color],
                    ['Size', selectedStock.size],
                    ['Series', selectedStock.series],
                    ['MRP', selectedStock.mrp ? `₹${selectedStock.mrp}` : null],
                    ['Rate', selectedStock.rate ? `₹${selectedStock.rate}` : null],
                  ].filter(([, v]) => v).map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-slate-400">{l}</p>
                      <p className="text-sm font-semibold text-slate-700">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div>
                  <p className="text-xs text-slate-500">Available Stock</p>
                  <p className={`text-2xl font-bold ${selectedStock.currentCartons > 5 ? 'text-emerald-600' : selectedStock.currentCartons > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {selectedStock.currentCartons} <span className="text-base font-semibold">cartons</span>
                  </p>
                </div>
                {selectedStock.currentCartons === 0 && (
                  <span className="badge bg-red-100 text-red-700 text-xs px-3 py-1">Out of Stock</span>
                )}
              </div>
            </div>
          )}

          {/* Quantity + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cartons to Remove <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                max={selectedStock?.currentCartons || undefined}
                className="input-field"
                placeholder={selectedStock ? `Max: ${selectedStock.currentCartons}` : 'Select stock first'}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                disabled={!selectedStock || selectedStock.currentCartons === 0}
                required
              />
              {selectedStock && quantity && Number(quantity) > selectedStock.currentCartons && (
                <p className="text-red-500 text-xs mt-1">⚠ Cannot exceed {selectedStock.currentCartons} cartons</p>
              )}
            </div>
            <div>
              <label className="label">Notes (Optional)</label>
              <input type="text" className="input-field" placeholder="e.g. Sale, Dispatch, Damaged..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Remaining preview */}
          {selectedStock && quantity && Number(quantity) > 0 && Number(quantity) <= selectedStock.currentCartons && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <ArrowDownCircle className="text-amber-600 flex-shrink-0" size={20} />
              <p className="text-sm text-amber-800">
                After removal: <strong>{selectedStock.currentCartons - Number(quantity)} cartons</strong> will remain
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary bg-red-500 hover:bg-red-600" disabled={loading || !selectedStock || selectedStock?.currentCartons === 0}>
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ArrowDownCircle size={18} /> Confirm Stock Out</>}
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              <X size={16} /> Clear
            </button>
          </div>
        </form>

        {/* Recent Out History */}
        {recentMovements.length > 0 && (
          <div className="card">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History size={18} className="text-slate-500" /> Recent Stock Out
            </h2>
            <div className="space-y-2">
              {recentMovements.map(m => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowDownCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{m.articleName}</p>
                    <p className="text-xs text-slate-400">{m.gender}{m.color ? ` · ${m.color}` : ''}{m.notes ? ` · ${m.notes}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-red-500">-{m.quantity} ctns</p>
                    <p className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
