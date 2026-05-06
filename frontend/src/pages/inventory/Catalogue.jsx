import { useState, useEffect, useRef, useCallback } from 'react';
import { Printer, Search, X, Tag, FileDown, Download, Loader2, SlidersHorizontal } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import CatalogueTemplate from '../../components/CatalogueTemplate';
import { useAuth } from '../../context/AuthContext';

const GENDERS = ['', 'Men', 'Women', 'Kids', 'Unisex'];

// ─── Luxury colours (mirrored from CatalogueTemplate) ───────────────────────
const GOLD   = '#C9A84C';
const GOLD_L = '#EDD880';

const GENDER_COLOR = {
  Men:    '#93C5FD',
  Women:  '#F9A8D4',
  Kids:   '#C4B5FD',
  Unisex: GOLD,
};

// ─── Dark Luxury Product Card ─────────────────────────────────────────────────
function ProductCard({ stock, onDownloadPNG, capturing }) {
  const [imgErr, setImgErr]   = useState(false);
  const isCapturing           = capturing === stock._id;
  const gColor                = GENDER_COLOR[stock.gender] || GOLD;
  const stockColor            = stock.currentCartons > 5
    ? '#34D399' : stock.currentCartons > 0 ? '#FCD34D' : '#F87171';

  return (
    <div style={{
      display:'flex', height:218, borderRadius:16, overflow:'hidden',
      background:'#131110',
      border:'1px solid rgba(201,168,76,0.13)',
      boxShadow:'0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.40)',
      transition:'box-shadow 0.25s, border-color 0.25s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.70), 0 0 0 1px rgba(201,168,76,0.30)';
        e.currentTarget.style.borderColor = 'rgba(201,168,76,0.28)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.40)';
        e.currentTarget.style.borderColor = 'rgba(201,168,76,0.13)';
      }}
    >
      {/* Image panel */}
      <div style={{
        width:'45%', flexShrink:0, position:'relative',
        background:'#0D0B0A',
        borderRight:'1px solid rgba(201,168,76,0.09)',
        display:'flex', alignItems:'center', justifyContent:'center',
        overflow:'hidden',
      }}>
        {/* Spotlight glow */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(ellipse 80% 80% at 50% 44%, rgba(201,168,76,0.09) 0%, transparent 70%)',
        }} />

        {stock.image && !imgErr ? (
          <img
            src={stock.image}
            alt={stock.articleName}
            style={{
              width:'88%', height:'88%',
              objectFit:'contain', display:'block',
              filter:'drop-shadow(0 12px 20px rgba(0,0,0,0.90)) drop-shadow(0 4px 8px rgba(0,0,0,0.70))',
              position:'relative', zIndex:1,
            }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, color:'rgba(255,255,255,0.10)' }}>
            <Tag size={36} />
            <span style={{ fontSize:9, letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(201,168,76,0.20)' }}>No Image</span>
          </div>
        )}

        {stock.currentCartons === 0 && (
          <div style={{
            position:'absolute', top:10, left:10,
            background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.28)',
            color:'#F87171', fontSize:7, fontWeight:800,
            padding:'2px 8px', borderRadius:3, letterSpacing:'1.8px', textTransform:'uppercase',
          }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Details panel */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        justifyContent:'space-between', padding:'14px 16px',
        overflow:'hidden',
      }}>
        {/* Top */}
        <div>
          {/* Gender + type */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:8, fontWeight:800, color:gColor, letterSpacing:'1.6px', textTransform:'uppercase' }}>
              {stock.gender}
            </span>
            {stock.stockType && (
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.22)', letterSpacing:'0.5px' }}>
                · {stock.stockType}
              </span>
            )}
          </div>

          {/* Article name */}
          <h3 style={{
            fontSize:14, fontWeight:900, color:'#F5F0E8',
            margin:'0 0 7px', lineHeight:1.2,
            textTransform:'uppercase', letterSpacing:'-0.3px',
            overflow:'hidden', textOverflow:'ellipsis',
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
          }}>
            {stock.articleName}
          </h3>

          {/* Spec tags */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {stock.color && (
              <span style={{
                fontSize:9, background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.09)',
                color:'rgba(245,240,232,0.55)', padding:'2px 8px', borderRadius:4,
              }}>{stock.color}</span>
            )}
            {stock.size && (
              <span style={{
                fontSize:9, background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.09)',
                color:'rgba(245,240,232,0.55)', padding:'2px 8px', borderRadius:4,
              }}>Sz {stock.size}</span>
            )}
            {stock.series && (
              <span style={{
                fontSize:9, background:'rgba(201,168,76,0.09)',
                border:'1px solid rgba(201,168,76,0.22)',
                color:GOLD, padding:'2px 8px', borderRadius:4,
              }}>{stock.series}</span>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div>
          {/* Gold rule */}
          <div style={{ height:1, background:'linear-gradient(90deg, rgba(201,168,76,0.32), transparent)', marginBottom:10 }} />

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:7.5, color:'rgba(106,90,66,1)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:2 }}>MRP</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#F5F0E8', letterSpacing:'-0.5px', lineHeight:1 }}>
                ₹{stock.mrp?.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:7.5, color:'rgba(106,90,66,1)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:1 }}>Stock</div>
                <div style={{ fontSize:13, fontWeight:800, color:stockColor, lineHeight:1 }}>
                  {stock.currentCartons} ctns
                </div>
              </div>

              {/* PNG download */}
              <button
                onClick={() => onDownloadPNG(stock)}
                disabled={!!capturing}
                title="Download catalogue card as PNG"
                style={{
                  display:'flex', alignItems:'center', gap:4,
                  fontSize:9, fontWeight:700,
                  color: isCapturing ? GOLD : 'rgba(106,90,66,1)',
                  background:'rgba(201,168,76,0.06)',
                  border:'1px solid rgba(201,168,76,0.18)',
                  padding:'3px 8px', borderRadius:5,
                  cursor: capturing ? 'not-allowed' : 'pointer',
                  opacity: capturing && !isCapturing ? 0.4 : 1,
                  transition:'all 0.2s',
                  letterSpacing:'0.5px', textTransform:'uppercase',
                }}
                onMouseEnter={e => { if (!capturing) { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.40)'; }}}
                onMouseLeave={e => { e.currentTarget.style.color = isCapturing ? GOLD : 'rgba(106,90,66,1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; }}
              >
                {isCapturing ? <Loader2 size={9} className="animate-spin" /> : <Download size={9} />}
                PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Print card (browser print only) ─────────────────────────────────────────
function PrintableCard({ stock }) {
  return (
    <div style={{ display:'flex', border:'1px solid #e2e8f0', borderRadius:6, overflow:'hidden', breakInside:'avoid', background:'white' }}>
      <div style={{ width:95, minHeight:100, background:'#f8fafc', flexShrink:0, overflow:'hidden' }}>
        {stock.image
          ? <img src={stock.image} alt="" crossOrigin="anonymous" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1', fontSize:10 }}>No Image</div>}
      </div>
      <div style={{ padding:'7px 9px', flex:1 }}>
        <p style={{ fontWeight:700, fontSize:11, margin:'0 0 1px', color:'#1e293b' }}>{stock.articleName}</p>
        <p style={{ fontSize:9, color:'#64748b', margin:'0 0 4px' }}>{stock.stockType} · {stock.gender}</p>
        {stock.color  && <p style={{ fontSize:8.5, color:'#94a3b8', margin:'0 0 1px' }}>Color: {stock.color}</p>}
        {stock.size   && <p style={{ fontSize:8.5, color:'#94a3b8', margin:'0 0 1px' }}>Size: {stock.size}</p>}
        {stock.series && <p style={{ fontSize:8.5, color:'#94a3b8', margin:0 }}>Series: {stock.series}</p>}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, paddingTop:4, borderTop:'1px solid #f1f5f9' }}>
          <div><p style={{ fontSize:7.5, color:'#94a3b8', margin:0 }}>MRP</p><p style={{ fontWeight:700, fontSize:12, color:'#1e3a5f', margin:0 }}>₹{stock.mrp?.toLocaleString('en-IN')}</p></div>
          <div style={{ textAlign:'right' }}><p style={{ fontSize:7.5, color:'#94a3b8', margin:0 }}>Rate</p><p style={{ fontWeight:700, fontSize:12, color:'#1e3a5f', margin:0 }}>₹{stock.rate?.toLocaleString('en-IN')}</p></div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Catalogue() {
  const { user }                                        = useAuth();
  const [stocks, setStocks]                             = useState([]);
  const [loading, setLoading]                           = useState(true);
  const [pdfLoading, setPdfLoading]                     = useState(false);
  const [search, setSearch]                             = useState('');
  const [filterGender, setFilterGender]                 = useState('');
  const [filterStockType, setFilterStockType]           = useState('');
  const [stockTypes, setStockTypes]                     = useState([]);
  const [showOutOfStock, setShowOutOfStock]             = useState(true);
  const [captureStock, setCaptureStock]                 = useState(null);
  const [capturing, setCapturing]                       = useState(null);
  const captureRef                                      = useRef(null);
  const printRef                                        = useRef();

  useEffect(() => {
    fetchStocks();
    api.get('/inventory/suggestions').then(r => setStockTypes(r.data.stockTypes || [])).catch(() => {});
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory/stocks?limit=500&sortBy=articleName&order=asc');
      setStocks(data.stocks || []);
    } catch {
      toast.error('Failed to load catalogue');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = useCallback((stock) => {
    setCapturing(stock._id);
    setCaptureStock(stock);
  }, []);

  useEffect(() => {
    if (!captureStock || !captureRef.current) return;
    const node = captureRef.current;
    const run = async () => {
      const imgs = Array.from(node.querySelectorAll('img'));
      await Promise.all(imgs.map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
      ));
      const canvas = await html2canvas(node, {
        useCORS: true, allowTaint: false, scale: 2,
        backgroundColor: '#0C0A08', logging: false,
      });
      const link = document.createElement('a');
      link.download = `${(captureStock.articleName || 'product').replace(/\s+/g, '_')}_catalogue.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('PNG downloaded!');
    };
    run()
      .catch(() => toast.error('PNG download failed. Check image CORS settings.'))
      .finally(() => { setCaptureStock(null); setCapturing(null); });
  }, [captureStock]);

  const filtered = stocks.filter(s => {
    const matchSearch = `${s.articleName} ${s.color} ${s.series}`.toLowerCase().includes(search.toLowerCase());
    const matchGender = !filterGender || s.gender === filterGender;
    const matchType   = !filterStockType || s.stockType.toLowerCase().includes(filterStockType.toLowerCase());
    const matchStock  = showOutOfStock || s.currentCartons > 0;
    return matchSearch && matchGender && matchType && matchStock;
  });

  const groupedByGender = GENDERS.filter(Boolean).reduce((acc, g) => {
    const items = filtered.filter(s => s.gender === g);
    if (items.length) acc[g] = items;
    return acc;
  }, {});

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${user?.businessName || 'Inventory'} Catalogue`,
    pageStyle: `@page { size: A4; margin: 12mm; } body { font-family: Arial, sans-serif; }`,
  });

  const handleDownloadPDF = async () => {
    if (filtered.length === 0) return toast.error('No products to export');
    setPdfLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterGender) params.set('gender', filterGender);
      if (filterStockType) params.set('stockType', filterStockType);
      if (!showOutOfStock) params.set('showOutOfStock', 'false');
      const response = await api.get(`/inventory/catalogue-pdf?${params}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.businessName || 'Inventory'}_Catalogue.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF download failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Layout>
      {/* ── Dark luxury wrapper — overrides Layout's light bg ── */}
      <div style={{
        margin:'-1rem', background:'#0E0C0A',
        minHeight:'calc(100vh - 0px)', padding:'0',
      }}
        className="sm:-m-6 lg:-m-8"
      >

        {/* ── Page Header ─────────────────────────────────────── */}
        <div style={{
          padding:'32px 32px 0',
          borderBottom:'1px solid rgba(201,168,76,0.12)',
        }}
          className="no-print"
        >
          {/* Top row */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              {/* Editorial title */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ height:1.5, width:24, background:GOLD }} />
                <span style={{ fontSize:9, color:GOLD, letterSpacing:'3px', fontWeight:700, textTransform:'uppercase' }}>
                  {user?.businessName || 'Inventory Pro'}
                </span>
              </div>
              <h1 style={{
                fontSize:34, fontWeight:900, color:'#F5F0E8',
                letterSpacing:'3px', textTransform:'uppercase',
                margin:0, lineHeight:1,
              }}>
                Catalogue
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                <div style={{ height:2, width:40, background:`linear-gradient(90deg, ${GOLD}, ${GOLD_L})`, borderRadius:2 }} />
                <span style={{ fontSize:11, color:'rgba(106,90,66,0.9)', letterSpacing:'0.5px' }}>
                  {filtered.length} products
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:10, paddingTop:4 }}>
              <button
                onClick={handlePrint}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'9px 18px', borderRadius:8,
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  color:'#F5F0E8', fontSize:12, fontWeight:700,
                  cursor:'pointer', letterSpacing:'0.3px',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <Printer size={15} /> Print
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'9px 18px', borderRadius:8,
                  background:`linear-gradient(135deg, rgba(201,168,76,0.20), rgba(201,168,76,0.10))`,
                  border:`1px solid rgba(201,168,76,0.35)`,
                  color:GOLD_L, fontSize:12, fontWeight:700,
                  cursor: pdfLoading ? 'not-allowed' : 'pointer',
                  opacity: pdfLoading ? 0.6 : 1,
                  letterSpacing:'0.3px', transition:'all 0.2s',
                }}
                onMouseEnter={e => { if (!pdfLoading) e.currentTarget.style.background = `linear-gradient(135deg, rgba(201,168,76,0.30), rgba(201,168,76,0.18))`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, rgba(201,168,76,0.20), rgba(201,168,76,0.10))`; }}
              >
                {pdfLoading
                  ? <div style={{ width:14, height:14, border:'2px solid rgba(201,168,76,0.4)', borderTopColor:GOLD, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  : <FileDown size={15} />}
                Download PDF
              </button>
            </div>
          </div>

          {/* ── Filter bar ─────────────────────────────────────── */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, paddingBottom:20 }}>
            {/* Search */}
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(106,90,66,0.8)' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width:'100%', padding:'8px 36px', borderRadius:8,
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.10)',
                  color:'#F5F0E8', fontSize:13,
                  outline:'none', boxSizing:'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.40)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(106,90,66,0.8)', display:'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Gender filter */}
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              style={{
                padding:'8px 14px', borderRadius:8, minWidth:140,
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.10)',
                color: filterGender ? '#F5F0E8' : 'rgba(106,90,66,0.8)',
                fontSize:13, outline:'none', cursor:'pointer',
              }}
            >
              <option value="" style={{ background:'#1a1610' }}>All Genders</option>
              {GENDERS.filter(Boolean).map(g => <option key={g} value={g} style={{ background:'#1a1610' }}>{g}</option>)}
            </select>

            {/* Type filter */}
            <select
              value={filterStockType}
              onChange={e => setFilterStockType(e.target.value)}
              style={{
                padding:'8px 14px', borderRadius:8, minWidth:140,
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.10)',
                color: filterStockType ? '#F5F0E8' : 'rgba(106,90,66,0.8)',
                fontSize:13, outline:'none', cursor:'pointer',
              }}
            >
              <option value="" style={{ background:'#1a1610' }}>All Types</option>
              {stockTypes.map(t => <option key={t} value={t} style={{ background:'#1a1610' }}>{t}</option>)}
            </select>

            {/* Out of stock toggle */}
            <label style={{
              display:'flex', alignItems:'center', gap:8, cursor:'pointer',
              padding:'8px 14px', borderRadius:8,
              background:'rgba(255,255,255,0.04)',
              border:`1px solid ${showOutOfStock ? 'rgba(201,168,76,0.28)' : 'rgba(255,255,255,0.08)'}`,
              color: showOutOfStock ? GOLD : 'rgba(106,90,66,0.8)',
              fontSize:12, fontWeight:600, letterSpacing:'0.3px',
              transition:'all 0.2s',
            }}>
              <SlidersHorizontal size={13} />
              <input
                type="checkbox" checked={showOutOfStock}
                onChange={e => setShowOutOfStock(e.target.checked)}
                style={{ display:'none' }}
              />
              Out of stock
            </label>
          </div>
        </div>

        {/* ── Product Grid ────────────────────────────────────── */}
        <div style={{ padding:'24px 32px 40px' }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:320 }}>
              <div style={{
                width:44, height:44, borderRadius:'50%',
                border:`3px solid rgba(201,168,76,0.15)`,
                borderTopColor:GOLD,
                animation:'spin 0.9s linear infinite',
              }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              height:280, gap:16, color:'rgba(106,90,66,0.6)',
            }}>
              <Tag size={48} style={{ opacity:0.3 }} />
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:15, fontWeight:700, color:'rgba(245,240,232,0.35)', margin:'0 0 4px' }}>No products found</p>
                <p style={{ fontSize:12, color:'rgba(106,90,66,0.6)', margin:0 }}>Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(440px, 1fr))',
              gap:16,
            }}>
              {filtered.map(s => (
                <ProductCard
                  key={s._id}
                  stock={s}
                  onDownloadPNG={handleDownloadPNG}
                  capturing={capturing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Off-screen PNG capture target ─────────────────────── */}
      <div
        style={{ position:'fixed', top:0, left:'-9999px', pointerEvents:'none', zIndex:-1 }}
        aria-hidden="true"
      >
        <CatalogueTemplate
          ref={captureRef}
          stock={captureStock || {}}
          businessName={user?.businessName || 'Inventory Pro'}
        />
      </div>

      {/* ── Hidden section for browser Print ──────────────────── */}
      <div className="hidden">
        <div ref={printRef} style={{ fontFamily:'Arial, sans-serif', padding:'8mm', background:'#fff' }}>
          <div style={{ textAlign:'center', marginBottom:16, borderBottom:'2px solid #2563eb', paddingBottom:12 }}>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#1e3a5f', margin:0 }}>{user?.businessName || 'Inventory Pro'}</h1>
            <p style={{ color:'#64748b', fontSize:12, marginTop:4 }}>
              Product Catalogue — {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}
            </p>
          </div>
          {Object.entries(groupedByGender).map(([gender, items]) => (
            <div key={gender} style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:13, fontWeight:700, color:'#1e3a5f', marginBottom:8, padding:'4px 10px', background:'#eff6ff', borderRadius:4, display:'inline-block' }}>
                {gender}
              </h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
                {items.map(s => <PrintableCard key={s._id} stock={s} />)}
              </div>
            </div>
          ))}
          <div style={{ marginTop:14, paddingTop:8, borderTop:'1px solid #e2e8f0', textAlign:'center', color:'#94a3b8', fontSize:9 }}>
            Total Products: {filtered.length} · Generated by Inventory Pro
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}
