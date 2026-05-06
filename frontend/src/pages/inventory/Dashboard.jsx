import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, TrendingDown, AlertTriangle, BoxesIcon, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
  <div onClick={onClick} className={`card flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory/dashboard-stats');
      setStats(data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const formatCurrency = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Here's your inventory overview</p>
          </div>
          <button onClick={fetchStats} className="btn-secondary text-sm px-4 py-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Total Articles" value={stats?.totalArticles || 0}
            sub="Unique stock entries" color="bg-brand-600"
            onClick={() => navigate('/stock-table')} />
          <StatCard icon={BoxesIcon} label="Total Cartons" value={stats?.totalCartons || 0}
            sub="Currently in stock" color="bg-emerald-500" />
          <StatCard icon={TrendingUp} label="Total Stock Value" value={formatCurrency(stats?.totalValue)}
            sub="At selling rate" color="bg-violet-500" />
          <StatCard icon={AlertTriangle} label="Low Stock" value={stats?.lowStockCount || 0}
            sub={`${stats?.outOfStockCount || 0} out of stock`}
            color={stats?.lowStockCount > 0 ? 'bg-amber-500' : 'bg-slate-400'}
            onClick={stats?.lowStockCount > 0 ? () => navigate('/stock-table') : null} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/add-stock')}
            className="flex items-center gap-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl p-5 hover:from-brand-700 hover:to-brand-800 transition-all shadow-sm text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-lg">Stock In</p>
              <p className="text-blue-200 text-sm">Add new or replenish existing stock</p>
            </div>
          </button>

          <button onClick={() => navigate('/stock-out')}
            className="flex items-center gap-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl p-5 hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-lg">Stock Out</p>
              <p className="text-red-100 text-sm">Remove cartons from existing stock</p>
            </div>
          </button>
        </div>

        {/* Recent Movements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Movements</h2>
            <button onClick={() => navigate('/stock-table')} className="text-sm text-brand-600 hover:underline font-medium">
              View all →
            </button>
          </div>

          {!stats?.recentMovements?.length ? (
            <div className="text-center py-10 text-slate-400">
              <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No movements yet</p>
              <p className="text-sm mt-1">Start by adding stock</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentMovements.map((m) => (
                <div key={m._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.type === 'in' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {m.type === 'in'
                      ? <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                      : <ArrowDownCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {m.articleName || m.stock?.articleName}
                      <span className="font-normal text-slate-400 ml-2">{m.gender || m.stock?.gender}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.color || m.stock?.color}{m.size ? ` · Size ${m.size || m.stock?.size}` : ''}{m.notes ? ` · ${m.notes}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${m.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {m.type === 'in' ? '+' : '-'}{m.quantity} ctns
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
