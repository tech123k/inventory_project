import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';

export default function Movements() {
  const [movements, setMovements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (filterType) params.set('type', filterType);
      const { data } = await api.get(`/inventory/movements?${params}`);
      setMovements(data.movements);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovements(); }, [filterType, page]);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Movement History</h1>
            <p className="text-slate-500 text-sm mt-0.5">{total} total records</p>
          </div>
          <div className="flex gap-2">
            <select className="input-field w-auto" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">All Movements</option>
              <option value="in">Stock In Only</option>
              <option value="out">Stock Out Only</option>
            </select>
            <button onClick={fetchMovements} className="btn-secondary px-3 py-2"><RefreshCw size={16} /></button>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="w-full text-sm">
              <thead className="sticky-header bg-slate-50 border-b border-slate-200">
                <tr>
                  {['#', 'Type', 'Article', 'Gender', 'Color', 'Size', 'Series', 'Quantity', 'Remaining', 'Notes', 'Date'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={11} className="text-center py-12 text-slate-400">
                    <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading...
                  </td></tr>
                ) : movements.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-12 text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No movements found
                  </td></tr>
                ) : movements.map((m, i) => (
                  <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-slate-400 text-xs">{(page - 1) * limit + i + 1}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 badge font-semibold ${m.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {m.type === 'in' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                        {m.type === 'in' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">{m.articleName}</td>
                    <td className="px-3 py-3 text-slate-600">{m.gender}</td>
                    <td className="px-3 py-3 text-slate-600">{m.color || '—'}</td>
                    <td className="px-3 py-3 text-slate-600">{m.size || '—'}</td>
                    <td className="px-3 py-3 text-slate-600">{m.series || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`font-bold ${m.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.type === 'in' ? '+' : '-'}{m.quantity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600 font-medium">{m.cartonsAfter}</td>
                    <td className="px-3 py-3 text-slate-500 max-w-32 truncate">{m.notes || '—'}</td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <p className="text-slate-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
