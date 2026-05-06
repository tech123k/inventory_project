import { useState, useEffect, useRef } from 'react';
import { PlusCircle, RefreshCw, Upload, X, Sparkles, PackagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';

const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];
const PAIR_CARTON = ['Pair', 'Carton'];

// Reusable autocomplete input
function AutoInput({ label, value, onChange, suggestions = [], placeholder, required, type = 'text' }) {
  const [open, setOpen] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase());
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        required={required}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-auto">
          {filtered.map(s => (
            <li key={s} onMouseDown={() => { onChange(s); setOpen(false); }}
              className="px-4 py-2.5 hover:bg-brand-50 hover:text-brand-700 cursor-pointer text-sm transition-colors">
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddStock() {
  const [mode, setMode] = useState('new'); // 'new' | 'replenish'
  const [suggestions, setSuggestions] = useState({});
  const [autoFilling, setAutoFilling] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Replenish state
  const [allStocks, setAllStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockSearch, setStockSearch] = useState('');
  const [replenishQty, setReplenishQty] = useState('');
  const [replenishNotes, setReplenishNotes] = useState('');
  const [showStockDropdown, setShowStockDropdown] = useState(false);

  const [form, setForm] = useState({
    articleName: '', stockType: '', gender: '', size: '',
    color: '', pairCarton: '', series: '', noOfCartons: '', mrp: '', rate: ''
  });

  useEffect(() => {
    api.get('/inventory/suggestions').then(r => setSuggestions(r.data)).catch(() => {});
    api.get('/inventory/stocks?limit=500').then(r => setAllStocks(r.data.stocks || [])).catch(() => {});
  }, []);

  // Auto-fill when article + gender filled
  useEffect(() => {
    if (form.articleName && form.gender) {
      setAutoFilling(true);
      api.get(`/inventory/autofill?articleName=${encodeURIComponent(form.articleName)}&gender=${form.gender}`)
        .then(r => {
          if (r.data.stock) {
            const s = r.data.stock;
            setForm(prev => ({
              ...prev,
              stockType: s.stockType || prev.stockType,
              size: s.size || prev.size,
              color: s.color || prev.color,
              pairCarton: s.pairCarton || prev.pairCarton,
              series: s.series || prev.series,
              mrp: s.mrp || prev.mrp,
              rate: s.rate || prev.rate
            }));
            if (s.image) setImagePreview(s.image);
            toast.success('Fields auto-filled from previous entry', { icon: '✨', duration: 2000 });
          }
        })
        .catch(() => {})
        .finally(() => setAutoFilling(false));
    }
  }, [form.articleName, form.gender]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      await api.post('/inventory/stocks', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Stock added successfully!');
      setForm({ articleName: '', stockType: '', gender: '', size: '', color: '', pairCarton: '', series: '', noOfCartons: '', mrp: '', rate: '' });
      setImagePreview(null);
      setImageFile(null);
      // Refresh suggestions
      api.get('/inventory/suggestions').then(r => setSuggestions(r.data));
      api.get('/inventory/stocks?limit=500').then(r => setAllStocks(r.data.stocks || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const handleReplenish = async (e) => {
    e.preventDefault();
    if (!selectedStock) return toast.error('Please select a stock item');
    if (!replenishQty || Number(replenishQty) < 1) return toast.error('Enter valid quantity');
    setLoading(true);
    try {
      const { data } = await api.post('/inventory/replenish', {
        stockId: selectedStock._id,
        quantity: Number(replenishQty),
        notes: replenishNotes
      });
      toast.success(data.message);
      setSelectedStock(data.stock);
      setReplenishQty('');
      setReplenishNotes('');
      api.get('/inventory/stocks?limit=500').then(r => setAllStocks(r.data.stocks || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to replenish stock');
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = allStocks.filter(s =>
    `${s.articleName} ${s.gender} ${s.color} ${s.size}`.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock In</h1>
          <p className="text-slate-500 text-sm mt-1">Add new stock or replenish existing inventory</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          <button onClick={() => setMode('new')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'new' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <span className="flex items-center gap-2"><PlusCircle size={16} /> New Entry</span>
          </button>
          <button onClick={() => setMode('replenish')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'replenish' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <span className="flex items-center gap-2"><PackagePlus size={16} /> Replenish Existing</span>
          </button>
        </div>

        {/* ── New Entry Form ── */}
        {mode === 'new' && (
          <form onSubmit={handleSubmit} className="card space-y-5">
            {autoFilling && (
              <div className="flex items-center gap-2 text-brand-600 bg-brand-50 px-4 py-2.5 rounded-xl text-sm font-medium">
                <Sparkles size={16} className="animate-pulse" /> Auto-filling from previous entry...
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AutoInput label="Article Name" value={form.articleName} required
                suggestions={suggestions.articleNames || []}
                placeholder="e.g. Nike Air Max 90"
                onChange={v => setForm(p => ({ ...p, articleName: v }))} />

              <div>
                <label className="label">Gender <span className="text-red-500">*</span></label>
                <select className="input-field" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} required>
                  <option value="">Select Gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AutoInput label="Stock Type" value={form.stockType} required
                suggestions={suggestions.stockTypes || []}
                placeholder="e.g. Sports, Formal, Casual"
                onChange={v => setForm(p => ({ ...p, stockType: v }))} />

              <div>
                <label className="label">Pair / Carton</label>
                <select className="input-field" value={form.pairCarton} onChange={e => setForm(p => ({ ...p, pairCarton: e.target.value }))}>
                  <option value="">Select Type</option>
                  {PAIR_CARTON.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AutoInput label="Color" value={form.color} suggestions={suggestions.colors || []}
                placeholder="e.g. Black, White" onChange={v => setForm(p => ({ ...p, color: v }))} />
              <AutoInput label="Size" value={form.size} suggestions={suggestions.sizes || []}
                placeholder="e.g. 6-10, 7, 8" onChange={v => setForm(p => ({ ...p, size: v }))} />
              <AutoInput label="Series" value={form.series} suggestions={suggestions.series || []}
                placeholder="e.g. A1, B2" onChange={v => setForm(p => ({ ...p, series: v }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">No. of Cartons</label>
                <input type="number" min="0" className="input-field" placeholder="0" value={form.noOfCartons}
                  onChange={e => setForm(p => ({ ...p, noOfCartons: e.target.value }))} />
              </div>
              <div>
                <label className="label">MRP (₹)</label>
                <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.mrp}
                  onChange={e => setForm(p => ({ ...p, mrp: e.target.value }))} />
              </div>
              <div>
                <label className="label">Rate (₹)</label>
                <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.rate}
                  onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="label">Product Image</label>
              {imagePreview ? (
                <div className="relative w-36 h-36">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                  <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all">
                  <Upload className="w-7 h-7 text-slate-400 mb-1" />
                  <span className="text-sm text-slate-500">Click to upload image</span>
                  <span className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><PlusCircle size={18} /> Add Stock</>}
              </button>
              <button type="button" onClick={() => { setForm({ articleName: '', stockType: '', gender: '', size: '', color: '', pairCarton: '', series: '', noOfCartons: '', mrp: '', rate: '' }); setImagePreview(null); setImageFile(null); }}
                className="btn-secondary">
                <RefreshCw size={16} /> Reset
              </button>
            </div>
          </form>
        )}

        {/* ── Replenish Form ── */}
        {mode === 'replenish' && (
          <form onSubmit={handleReplenish} className="card space-y-5">
            <div className="relative">
              <label className="label">Search & Select Stock <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="Search by article name, gender, color..."
                value={selectedStock ? `${selectedStock.articleName} · ${selectedStock.gender} · ${selectedStock.color}` : stockSearch}
                onChange={e => { setStockSearch(e.target.value); setSelectedStock(null); setShowStockDropdown(true); }}
                onFocus={() => setShowStockDropdown(true)}
                autoComplete="off"
              />
              {selectedStock && (
                <button type="button" onClick={() => { setSelectedStock(null); setStockSearch(''); }}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
              {showStockDropdown && !selectedStock && filteredStocks.length > 0 && (
                <ul className="absolute z-30 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-auto">
                  {filteredStocks.slice(0, 30).map(s => (
                    <li key={s._id}
                      onMouseDown={() => { setSelectedStock(s); setShowStockDropdown(false); }}
                      className="px-4 py-3 hover:bg-brand-50 cursor-pointer border-b border-slate-50 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{s.articleName}</p>
                          <p className="text-xs text-slate-500">{s.gender} · {s.color} · Size {s.size} · {s.series}</p>
                        </div>
                        <span className={`badge ${s.currentCartons > 5 ? 'bg-emerald-100 text-emerald-700' : s.currentCartons > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {s.currentCartons} ctns
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selected Stock Card */}
            {selectedStock && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedStock.image && (
                  <img src={selectedStock.image} alt="" className="w-16 h-16 object-cover rounded-lg col-span-2 sm:col-span-1" />
                )}
                {[
                  ['Article', selectedStock.articleName],
                  ['Gender', selectedStock.gender],
                  ['Color', selectedStock.color],
                  ['Size', selectedStock.size],
                  ['Series', selectedStock.series],
                  ['Stock Type', selectedStock.stockType],
                  ['MRP', `₹${selectedStock.mrp}`],
                  ['Rate', `₹${selectedStock.rate}`],
                ].map(([l, v]) => v ? (
                  <div key={l}>
                    <p className="text-xs text-slate-400">{l}</p>
                    <p className="text-sm font-semibold text-slate-700">{v}</p>
                  </div>
                ) : null)}
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-xs text-slate-400">Available Cartons</p>
                  <p className={`text-xl font-bold ${selectedStock.currentCartons > 5 ? 'text-emerald-600' : selectedStock.currentCartons > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {selectedStock.currentCartons} cartons
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Cartons to Add <span className="text-red-500">*</span></label>
                <input type="number" min="1" className="input-field" placeholder="Enter quantity"
                  value={replenishQty} onChange={e => setReplenishQty(e.target.value)} required />
              </div>
              <div>
                <label className="label">Notes (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g. New shipment"
                  value={replenishNotes} onChange={e => setReplenishNotes(e.target.value)} />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary" disabled={loading || !selectedStock}>
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><PackagePlus size={18} /> Add to Stock</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
