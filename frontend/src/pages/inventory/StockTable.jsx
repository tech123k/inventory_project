import { useState, useEffect, useRef } from 'react';
import { Search, Download, Upload, Edit2, Trash2, X, Save, Filter, RefreshCw, FileSpreadsheet, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../../api/axios';
import Layout from '../../components/Layout';

const GENDERS = ['', 'Men', 'Women', 'Kids', 'Unisex'];
const COLS = [
  { key: 'articleName', label: 'Article Name', sortable: true },
  { key: 'stockType', label: 'Stock Type', sortable: true },
  { key: 'gender', label: 'Gender', sortable: true },
  { key: 'size', label: 'Size' },
  { key: 'color', label: 'Color' },
  { key: 'pairCarton', label: 'Pair/Carton' },
  { key: 'series', label: 'Series' },
  { key: 'noOfCartons', label: 'Total In', sortable: true },
  { key: 'currentCartons', label: 'Available', sortable: true },
  { key: 'mrp', label: 'MRP (₹)', sortable: true },
  { key: 'rate', label: 'Rate (₹)', sortable: true },
];

export default function StockTable() {
  const [stocks, setStocks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileRef = useRef();

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sortBy, order, limit: 200 });
      if (filterGender) params.set('gender', filterGender);
      const { data } = await api.get(`/inventory/stocks?${params}`);
      setStocks(data.stocks);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, [search, filterGender, sortBy, order]);

  const handleSort = (key) => {
    if (sortBy === key) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setOrder('asc'); }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({ articleName: s.articleName, stockType: s.stockType, gender: s.gender, size: s.size, color: s.color, pairCarton: s.pairCarton, series: s.series, mrp: s.mrp, rate: s.rate });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/inventory/stocks/${id}`, editForm);
      toast.success('Updated!');
      setEditingId(null);
      fetchStocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/inventory/stocks/${deleteId}`);
      toast.success('Stock deleted');
      setDeleteId(null);
      fetchStocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Excel Export
  const handleExport = () => {
    if (!stocks.length) return toast.error('No data to export');
    const data = stocks.map(s => ({
      'Article Name': s.articleName,
      'Stock Type': s.stockType,
      'Gender': s.gender,
      'Size': s.size,
      'Color': s.color,
      'Pair/Carton': s.pairCarton,
      'Series': s.series,
      'No. of Cartons': s.noOfCartons,
      'Available Cartons': s.currentCartons,
      'MRP': s.mrp,
      'Rate': s.rate,
      'Added On': new Date(s.createdAt).toLocaleDateString('en-IN')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    // Column widths
    ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Excel exported!');
  };

  // Excel Import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      if (!json.length) return toast.error('No data found in Excel file');

      const { data } = await api.post('/inventory/import', { stocks: json });
      toast.success(data.message || 'Import done!');
      fetchStocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed. Check column headers.');
    } finally {
      setImportLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return order === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-600" /> : <ChevronDown className="w-3 h-3 text-brand-600" />;
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Stock Table</h1>
            <p className="text-slate-500 text-sm mt-0.5">{total} total records</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="btn-secondary text-sm px-4 py-2">
              <Download size={16} /> Export Excel
            </button>
            <label className={`btn-secondary text-sm px-4 py-2 cursor-pointer ${importLoading ? 'opacity-60 pointer-events-none' : ''}`}>
              {importLoading ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
              Import Excel
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={fetchStocks} className="btn-secondary text-sm px-3 py-2">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Import template info */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <FileSpreadsheet size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-600">
            <strong>Excel Import Columns:</strong> Article Name, Stock Type, Gender, Size, Color, Pair/Carton, Series, No. of Cartons, MRP, Rate
          </p>
        </div>

        {/* Table card — search bar + table together, self-contained scroll */}
        <div className="card p-0 flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '400px' }}>
          {/* Search filters pinned at top of card — no page-level sticky needed */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200 rounded-t-xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" className="input-field pl-9 w-full" placeholder="Search articles..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
              </div>
              <select className="input-field w-full sm:w-40 flex-shrink-0" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                <option value="">All Genders</option>
                {GENDERS.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Table scrolls both directions within this bounded box */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Image</th>
                  {COLS.map(c => (
                    <th key={c.key}
                      onClick={c.sortable ? () => handleSort(c.key) : undefined}
                      className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${c.sortable ? 'cursor-pointer hover:text-brand-600 select-none' : ''}`}>
                      <span className="flex items-center gap-1">{c.label}{c.sortable && <SortIcon col={c.key} />}</span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide sticky right-0 bg-slate-50 shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={COLS.length + 3} className="text-center py-16 text-slate-400">
                    <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading...
                  </td></tr>
                ) : stocks.length === 0 ? (
                  <tr><td colSpan={COLS.length + 3} className="text-center py-16 text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No stocks found
                  </td></tr>
                ) : stocks.map((s, i) => (
                  <tr key={s._id} className={`hover:bg-slate-50 transition-colors ${editingId === s._id ? 'bg-brand-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-3">
                      {s.image
                        ? <img src={s.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        : <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 text-xs">—</div>}
                    </td>
                    {editingId === s._id ? (
                      <>
                        <td className="px-3 py-2"><input className="input-field text-xs py-1.5 w-32" value={editForm.articleName} onChange={e => setEditForm(p => ({ ...p, articleName: e.target.value }))} /></td>
                        <td className="px-3 py-2"><input className="input-field text-xs py-1.5 w-24" value={editForm.stockType} onChange={e => setEditForm(p => ({ ...p, stockType: e.target.value }))} /></td>
                        <td className="px-3 py-2">
                          <select className="input-field text-xs py-1.5 w-24" value={editForm.gender} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}>
                            {GENDERS.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2"><input className="input-field text-xs py-1.5 w-20" value={editForm.size} onChange={e => setEditForm(p => ({ ...p, size: e.target.value }))} /></td>
                        <td className="px-3 py-2"><input className="input-field text-xs py-1.5 w-20" value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} /></td>
                        <td className="px-3 py-2">
                          <select className="input-field text-xs py-1.5 w-24" value={editForm.pairCarton} onChange={e => setEditForm(p => ({ ...p, pairCarton: e.target.value }))}>
                            <option value="">—</option>
                            <option value="Pair">Pair</option>
                            <option value="Carton">Carton</option>
                          </select>
                        </td>
                        <td className="px-3 py-2"><input className="input-field text-xs py-1.5 w-20" value={editForm.series} onChange={e => setEditForm(p => ({ ...p, series: e.target.value }))} /></td>
                        <td className="px-3 py-3 text-slate-600">{s.noOfCartons}</td>
                        <td className="px-3 py-3"><span className={`badge ${s.currentCartons > 5 ? 'bg-emerald-100 text-emerald-700' : s.currentCartons > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{s.currentCartons}</span></td>
                        <td className="px-3 py-2"><input type="number" className="input-field text-xs py-1.5 w-20" value={editForm.mrp} onChange={e => setEditForm(p => ({ ...p, mrp: e.target.value }))} /></td>
                        <td className="px-3 py-2"><input type="number" className="input-field text-xs py-1.5 w-20" value={editForm.rate} onChange={e => setEditForm(p => ({ ...p, rate: e.target.value }))} /></td>
                        <td className="px-3 py-3 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(s._id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Save size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap max-w-[160px] truncate">{s.articleName}</td>
                        <td className="px-3 py-3 text-slate-600">{s.stockType}</td>
                        <td className="px-3 py-3">
                          <span className={`badge ${s.gender === 'Men' ? 'bg-blue-100 text-blue-700' : s.gender === 'Women' ? 'bg-pink-100 text-pink-700' : s.gender === 'Kids' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                            {s.gender}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600">{s.size || '—'}</td>
                        <td className="px-3 py-3 text-slate-600">{s.color || '—'}</td>
                        <td className="px-3 py-3 text-slate-600">{s.pairCarton || '—'}</td>
                        <td className="px-3 py-3 text-slate-600">{s.series || '—'}</td>
                        <td className="px-3 py-3 text-slate-600 font-medium">{s.noOfCartons}</td>
                        <td className="px-3 py-3">
                          <span className={`badge font-semibold ${s.currentCartons > 5 ? 'bg-emerald-100 text-emerald-700' : s.currentCartons > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {s.currentCartons}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-800">₹{s.mrp?.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3 font-medium text-slate-800">₹{s.rate?.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(s)} className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 touch-manipulation" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteId(s._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 touch-manipulation" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stocks.length > 0 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 text-xs text-slate-500 bg-white rounded-b-xl">
              Showing {stocks.length} of {total} records
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Delete Stock?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This will permanently delete this stock entry and all its movement history.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
