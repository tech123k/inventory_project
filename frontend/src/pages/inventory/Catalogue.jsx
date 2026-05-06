// import { useState, useEffect, useRef, useCallback } from 'react';
// import { Printer, Search, X, Tag, FileDown, Download, Loader2, SlidersHorizontal } from 'lucide-react';
// import { useReactToPrint } from 'react-to-print';
// import html2canvas from 'html2canvas';
// import toast from 'react-hot-toast';
// import api from '../../api/axios';
// import Layout from '../../components/Layout';
// import CatalogueTemplate from '../../components/CatalogueTemplate';
// import { useAuth } from '../../context/AuthContext';

// const GENDERS = ['', 'Men', 'Women', 'Kids', 'Unisex'];

// // ─── Light Luxury Palette ─────────────────────────────────────────────────────
// const PAGE_BG  = '#FBF8F3';
// const GOLD     = '#C9A84C';
// const GOLD_L   = '#E8D080';
// const DARK_TXT = '#1C1A16';
// const MUTED    = '#8A7A62';

// const GENDER_COLOR = {
//   Men:    '#1d4ed8',
//   Women:  '#be185d',
//   Kids:   '#7c3aed',
//   Unisex: '#92400e',
// };

// // ─── Light Premium Product Card ───────────────────────────────────────────────
// function ProductCard({ stock, onDownloadPNG, capturing }) {
//   const [imgErr, setImgErr]   = useState(false);
//   const [hovered, setHovered] = useState(false);
//   const isCapturing           = capturing === stock._id;
//   const gColor                = GENDER_COLOR[stock.gender] || GOLD;
//   const stockColor            = stock.currentCartons > 5 ? '#059669'
//     : stock.currentCartons > 0 ? '#D97706' : '#DC2626';

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         display: 'flex', height: 210, borderRadius: 14,
//         overflow: 'hidden', background: '#FFFFFF',
//         border: `1px solid ${hovered ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.20)'}`,
//         boxShadow: hovered
//           ? '0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(201,168,76,0.12)'
//           : '0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
//         transition: 'box-shadow 0.25s, border-color 0.25s',
//       }}
//     >
//       {/* Image panel — warm beige */}
//       <div style={{
//         width: '44%', flexShrink: 0, position: 'relative',
//         background: '#F0E6D6',
//         borderRight: '1px solid rgba(201,168,76,0.15)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         overflow: 'hidden',
//       }}>
//         {/* Subtle warm glow */}
//         <div style={{
//           position: 'absolute', inset: 0, pointerEvents: 'none',
//           background: 'radial-gradient(ellipse 70% 70% at 50% 42%, rgba(201,168,76,0.10) 0%, transparent 70%)',
//         }} />

//         {stock.image && !imgErr ? (
//           // <img
//           //   src={stock.image}
//           //   alt={stock.articleName}
//           //   style={{
//           //     width: '85%', height: '85%', objectFit: 'contain', display: 'block',
//           //     filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18)) drop-shadow(0 2px 5px rgba(0,0,0,0.10))',
//           //     position: 'relative', zIndex: 1,
//           //   }}
//           //   onError={() => setImgErr(true)}
//           // />
//           <img
//   src={stock.image}
//   alt={stock.articleName}
//   crossOrigin="anonymous"
//   referrerPolicy="no-referrer"
//   loading="eager"
//   draggable={false}
//   style={{
//     width: '85%',
//     height: '85%',
//     objectFit: 'contain',
//     display: 'block',
//     filter:
//       'drop-shadow(0 8px 16px rgba(0,0,0,0.18)) drop-shadow(0 2px 5px rgba(0,0,0,0.10))',
//     position: 'relative',
//     zIndex: 1,
//     userSelect: 'none',
//   }}
//   onError={() => setImgErr(true)}
// />
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, color: '#C4A882' }}>
//             <Tag size={32} />
//             <span style={{ fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase' }}>No Image</span>
//           </div>
//         )}

//         {stock.currentCartons === 0 && (
//           <div style={{
//             position: 'absolute', top: 9, left: 9,
//             background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.30)',
//             color: '#DC2626', fontSize: 7, fontWeight: 800,
//             padding: '2px 7px', borderRadius: 3, letterSpacing: '1.8px', textTransform: 'uppercase',
//           }}>
//             Out of Stock
//           </div>
//         )}
//       </div>

//       {/* Details panel */}
//       <div style={{
//         flex: 1, display: 'flex', flexDirection: 'column',
//         justifyContent: 'space-between', padding: '13px 15px',
//         overflow: 'hidden', minWidth: 0,
//       }}>
//         {/* Top */}
//         <div>
//           {/* Gender + type */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
//             <span style={{ fontSize: 8, fontWeight: 800, color: gColor, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
//               {stock.gender}
//             </span>
//             {stock.stockType && (
//               <span style={{ fontSize: 8, color: MUTED }}>· {stock.stockType}</span>
//             )}
//           </div>

//           {/* Article name */}
//           <h3 style={{
//             fontSize: 13, fontWeight: 900, color: DARK_TXT,
//             margin: '0 0 5px', lineHeight: 1.2,
//             textTransform: 'uppercase', letterSpacing: '-0.2px',
//             overflow: 'hidden', textOverflow: 'ellipsis',
//             display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
//           }}>
//             {stock.articleName}
//           </h3>

//           {/* Spec tags */}
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
//             {stock.color && (
//               <span style={{ fontSize: 9, background: '#F5EDE0', border: '1px solid rgba(201,168,76,0.22)', color: '#7A6A52', padding: '2px 7px', borderRadius: 4 }}>
//                 {stock.color}
//               </span>
//             )}
//             {stock.size && (
//               <span style={{ fontSize: 9, background: '#F5EDE0', border: '1px solid rgba(201,168,76,0.22)', color: '#7A6A52', padding: '2px 7px', borderRadius: 4 }}>
//                 Sz {stock.size}
//               </span>
//             )}
//             {stock.series && (
//               <span style={{ fontSize: 9, background: '#FBF3E3', border: '1px solid rgba(201,168,76,0.35)', color: GOLD, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
//                 {stock.series}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Bottom */}
//         <div>
//           <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.30), transparent)', marginBottom: 9 }} />
//           <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
//             <div>
//               <div style={{ fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>MRP</div>
//               <div style={{ fontSize: 18, fontWeight: 900, color: DARK_TXT, letterSpacing: '-0.4px', lineHeight: 1 }}>
//                 ₹{stock.mrp?.toLocaleString('en-IN')}
//               </div>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
//               <div style={{ textAlign: 'right' }}>
//                 <div style={{ fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 1 }}>Stock</div>
//                 <div style={{ fontSize: 12, fontWeight: 800, color: stockColor, lineHeight: 1 }}>
//                   {stock.currentCartons} ctns
//                 </div>
//               </div>
//               <button
//                 onClick={() => onDownloadPNG(stock)}
//                 disabled={!!capturing}
//                 title="Download PNG"
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 3,
//                   fontSize: 8, fontWeight: 700,
//                   color: isCapturing ? GOLD : MUTED,
//                   background: '#FBF3E3',
//                   border: '1px solid rgba(201,168,76,0.30)',
//                   padding: '3px 8px', borderRadius: 5,
//                   cursor: capturing ? 'not-allowed' : 'pointer',
//                   opacity: capturing && !isCapturing ? 0.4 : 1,
//                   letterSpacing: '0.5px', textTransform: 'uppercase',
//                   transition: 'all 0.18s',
//                 }}
//               >
//                 {isCapturing ? <Loader2 size={8} className="animate-spin" /> : <Download size={8} />}
//                 PNG
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Printable Card (browser print) ──────────────────────────────────────────
// function PrintableCard({ stock }) {
//   return (
//     <div style={{ display: 'flex', border: '1px solid #e8d8c0', borderRadius: 6, overflow: 'hidden', breakInside: 'avoid', background: 'white' }}>
//       <div style={{ width: 100, minHeight: 108, background: '#F0E6D6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         {stock.image
//           ? <img src={stock.image} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
//           : <div style={{ color: '#C4A882', fontSize: 10, textAlign: 'center' }}>No Image</div>}
//       </div>
//       <div style={{ padding: '8px 11px', flex: 1 }}>
//         <p style={{ fontWeight: 800, fontSize: 11, margin: '0 0 1px', color: '#1C1A16', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stock.articleName}</p>
//         <p style={{ fontSize: 9, color: '#8A7A62', margin: '0 0 5px' }}>{stock.stockType} · {stock.gender}</p>
//         {stock.color  && <p style={{ fontSize: 8.5, color: '#8A7A62', margin: '0 0 1px' }}>Color: {stock.color}</p>}
//         {stock.size   && <p style={{ fontSize: 8.5, color: '#8A7A62', margin: '0 0 1px' }}>Size: {stock.size}</p>}
//         {stock.series && <p style={{ fontSize: 8.5, color: '#C9A84C', fontWeight: 700, margin: 0 }}>Series: {stock.series}</p>}
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 5, borderTop: '1px solid rgba(201,168,76,0.20)' }}>
//           <div><p style={{ fontSize: 7.5, color: '#8A7A62', margin: 0 }}>MRP</p><p style={{ fontWeight: 800, fontSize: 12, color: '#1C1A16', margin: 0 }}>₹{stock.mrp?.toLocaleString('en-IN')}</p></div>
//           <div style={{ textAlign: 'right' }}><p style={{ fontSize: 7.5, color: '#C9A84C', margin: 0, fontWeight: 700 }}>Rate</p><p style={{ fontWeight: 800, fontSize: 12, color: '#C9A84C', margin: 0 }}>₹{stock.rate?.toLocaleString('en-IN')}</p></div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function Catalogue() {
//   const { user }                              = useAuth();
//   const [stocks, setStocks]                   = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [pdfLoading, setPdfLoading]           = useState(false);
//   const [search, setSearch]                   = useState('');
//   const [filterGender, setFilterGender]       = useState('');
//   const [filterStockType, setFilterStockType] = useState('');
//   const [stockTypes, setStockTypes]           = useState([]);
//   const [showOutOfStock, setShowOutOfStock]   = useState(true);
//   const [captureStock, setCaptureStock]       = useState(null);
//   const [capturing, setCapturing]             = useState(null);
//   const captureRef                            = useRef(null);
//   const printRef                              = useRef();

//   useEffect(() => {
//     fetchStocks();
//     api.get('/inventory/suggestions').then(r => setStockTypes(r.data.stockTypes || [])).catch(() => {});
//   }, []);

//   const fetchStocks = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/inventory/stocks?limit=500&sortBy=articleName&order=asc');
//       setStocks(data.stocks || []);
//     } catch {
//       toast.error('Failed to load catalogue');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadPNG = useCallback((stock) => {
//     setCapturing(stock._id);
//     setCaptureStock(stock);
//   }, []);

//   // useEffect(() => {
//   //   if (!captureStock || !captureRef.current) return;
//   //   const node = captureRef.current;
//   //   const run = async () => {
//   //     const imgs = Array.from(node.querySelectorAll('img'));
//   //     await Promise.all(imgs.map(img =>
//   //       img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
//   //     ));
//   //     const canvas = await html2canvas(node, {
//   //       useCORS: true, allowTaint: false, scale: 2,
//   //       backgroundColor: '#FBF8F3', logging: false,
//   //     });
//   //     const link = document.createElement('a');
//   //     link.download = `${(captureStock.articleName || 'product').replace(/\s+/g, '_')}_catalogue.png`;
//   //     link.href = canvas.toDataURL('image/png');
//   //     link.click();
//   //     toast.success('PNG downloaded!');
//   //   };
//   //   run()
//   //     .catch(() => toast.error('PNG download failed.'))
//   //     .finally(() => { setCaptureStock(null); setCapturing(null); });
//   // }, [captureStock]);
//   useEffect(() => {
//   if (!captureStock || !captureRef.current) return;

//   const node = captureRef.current;

//   const run = async () => {
//     try {
//       // Wait next render frame
//       await new Promise(resolve => requestAnimationFrame(resolve));

//       // Wait for all images
//       const imgs = Array.from(node.querySelectorAll('img'));

//       await Promise.all(
//         imgs.map(img => {
//           if (img.complete && img.naturalWidth > 0) {
//             return Promise.resolve();
//           }

//           return new Promise(resolve => {
//             const done = () => resolve();

//             img.onload = done;
//             img.onerror = done;

//             setTimeout(done, 5000);
//           });
//         })
//       );

//       // Extra stabilization delay
//       await new Promise(resolve => setTimeout(resolve, 700));

//       const canvas = await html2canvas(node, {
//         useCORS: true,
//         allowTaint: true,
//         foreignObjectRendering: true,
//         scale: 3,
//         backgroundColor: '#FBF8F3',
//         imageTimeout: 15000,
//         logging: false,
//         removeContainer: true,
//       });

//       const blob = await new Promise(resolve =>
//         canvas.toBlob(resolve, 'image/png', 1)
//       );

//       if (!blob) {
//         toast.error('PNG generation failed');
//         return;
//       }

//       const url = URL.createObjectURL(blob);

//       const link = document.createElement('a');

//       link.href = url;

//       link.download = `${
//         (captureStock.articleName || 'product')
//           .replace(/\s+/g, '_')
//           .replace(/[^\w-]/g, '')
//       }_catalogue.png`;

//       document.body.appendChild(link);

//       link.click();

//       document.body.removeChild(link);

//       setTimeout(() => {
//         URL.revokeObjectURL(url);
//       }, 1000);

//       toast.success('PNG downloaded!');
//     } catch (err) {
//       console.error(err);
//       toast.error('PNG download failed');
//     } finally {
//       setCaptureStock(null);
//       setCapturing(null);
//     }
//   };

//   run();
// }, [captureStock]);

//   const filtered = stocks.filter(s => {
//     const matchSearch = `${s.articleName} ${s.color} ${s.series}`.toLowerCase().includes(search.toLowerCase());
//     const matchGender = !filterGender || s.gender === filterGender;
//     const matchType   = !filterStockType || s.stockType.toLowerCase().includes(filterStockType.toLowerCase());
//     const matchStock  = showOutOfStock || s.currentCartons > 0;
//     return matchSearch && matchGender && matchType && matchStock;
//   });

//   const groupedByGender = GENDERS.filter(Boolean).reduce((acc, g) => {
//     const items = filtered.filter(s => s.gender === g);
//     if (items.length) acc[g] = items;
//     return acc;
//   }, {});

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: `${user?.businessName || 'Inventory'} Catalogue`,
//     pageStyle: `@page { size: A4; margin: 12mm; } body { font-family: Arial, sans-serif; }`,
//   });

//   const handleDownloadPDF = async () => {
//     if (filtered.length === 0) return toast.error('No products to export');
//     setPdfLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (search) params.set('search', search);
//       if (filterGender) params.set('gender', filterGender);
//       if (filterStockType) params.set('stockType', filterStockType);
//       if (!showOutOfStock) params.set('showOutOfStock', 'false');
//       const response = await api.get(`/inventory/catalogue-pdf?${params}`, { responseType: 'blob' });
//       const url = URL.createObjectURL(response.data);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${user?.businessName || 'Inventory'}_Catalogue.pdf`;
//       a.click();
//       URL.revokeObjectURL(url);
//       toast.success('PDF downloaded!');
//     } catch {
//       toast.error('PDF download failed.');
//     } finally {
//       setPdfLoading(false);
//     }
//   };

//   return (
//     <Layout bg={PAGE_BG}>
//       <div className="space-y-5">

//         {/* ── Header ────────────────────────────────────────── */}
//         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
//               <div style={{ height: 1.5, width: 20, background: GOLD, borderRadius: 1 }} />
//               <span style={{ fontSize: 8.5, color: GOLD, letterSpacing: '2.8px', fontWeight: 700, textTransform: 'uppercase' }}>
//                 {user?.businessName || 'Inventory Pro'}
//               </span>
//             </div>
//             <h1 style={{ fontSize: 26, fontWeight: 900, color: DARK_TXT, letterSpacing: '2px', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
//               Catalogue
//             </h1>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
//               <div style={{ height: 2, width: 36, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_L})`, borderRadius: 2 }} />
//               <span style={{ fontSize: 11, color: MUTED }}>{filtered.length} products</span>
//             </div>
//           </div>

//           {/* Action buttons */}
//           <div className="flex gap-2 flex-shrink-0 flex-wrap">
//             <button
//               onClick={handlePrint}
//               className="btn-secondary text-sm"
//               style={{ whiteSpace: 'nowrap' }}
//             >
//               <Printer size={15} /> Print
//             </button>
//             <button
//               onClick={handleDownloadPDF}
//               disabled={pdfLoading}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 7,
//                 padding: '9px 18px', borderRadius: 8,
//                 background: `linear-gradient(135deg, ${GOLD}, #B8960C)`,
//                 border: 'none', color: '#FFFFFF',
//                 fontSize: 13, fontWeight: 700,
//                 cursor: pdfLoading ? 'not-allowed' : 'pointer',
//                 opacity: pdfLoading ? 0.65 : 1,
//                 whiteSpace: 'nowrap',
//                 boxShadow: '0 2px 10px rgba(201,168,76,0.30)',
//               }}
//             >
//               {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
//               Download PDF
//             </button>
//           </div>
//         </div>

//         {/* ── Filters ───────────────────────────────────────── */}
//         <div className="flex flex-col sm:flex-row flex-wrap gap-3 no-print">
//           {/* Search */}
//           <div className="relative flex-1 min-w-0">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
//             <input
//               type="text"
//               className="input-field pl-9 w-full"
//               placeholder="Search products..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             {search && (
//               <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//                 <X size={13} />
//               </button>
//             )}
//           </div>

//           <select
//             className="input-field w-full sm:w-36 flex-shrink-0"
//             value={filterGender}
//             onChange={e => setFilterGender(e.target.value)}
//           >
//             <option value="">All Genders</option>
//             {GENDERS.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
//           </select>

//           <select
//             className="input-field w-full sm:w-36 flex-shrink-0"
//             value={filterStockType}
//             onChange={e => setFilterStockType(e.target.value)}
//           >
//             <option value="">All Types</option>
//             {stockTypes.map(t => <option key={t} value={t}>{t}</option>)}
//           </select>

//           <button
//             onClick={() => setShowOutOfStock(p => !p)}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 7,
//               padding: '9px 14px', borderRadius: 8,
//               background: showOutOfStock ? '#FBF3E3' : '#FFFFFF',
//               border: `1px solid ${showOutOfStock ? 'rgba(201,168,76,0.40)' : '#e2e8f0'}`,
//               color: showOutOfStock ? GOLD : '#64748b',
//               fontSize: 12, fontWeight: 600, cursor: 'pointer',
//               whiteSpace: 'nowrap', flexShrink: 0,
//               transition: 'all 0.2s',
//             }}
//           >
//             <SlidersHorizontal size={13} />
//             {showOutOfStock ? 'Hide out-of-stock' : 'Show out-of-stock'}
//           </button>
//         </div>

//         {/* ── Product Grid ─────────────────────────────────── */}
//         {loading ? (
//           <div className="flex items-center justify-center" style={{ height: 280 }}>
//             <div className="animate-spin" style={{ width: 38, height: 38, borderRadius: '50%', border: `3px solid rgba(201,168,76,0.20)`, borderTopColor: GOLD }} />
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="flex flex-col items-center justify-center" style={{ height: 240, gap: 14 }}>
//             <Tag size={44} style={{ opacity: 0.25, color: GOLD }} />
//             <div className="text-center">
//               <p style={{ fontSize: 15, fontWeight: 700, color: DARK_TXT, margin: '0 0 4px', opacity: 0.5 }}>No products found</p>
//               <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Try adjusting your filters</p>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {filtered.map(s => (
//               <ProductCard
//                 key={s._id}
//                 stock={s}
//                 onDownloadPNG={handleDownloadPNG}
//                 capturing={capturing}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── Off-screen PNG capture target ──────────────────── */}
//       <div style={{ position: 'fixed', top: 0, left: '-9999px', pointerEvents: 'none', zIndex: -1 }} aria-hidden="true">
//         <CatalogueTemplate
//           ref={captureRef}
//           stock={captureStock || {}}
//           businessName={user?.businessName || 'Inventory Pro'}
//         />
//       </div>

//       {/* ── Hidden: browser print ──────────────────────────── */}
//       <div className="hidden">
//         <div ref={printRef} style={{ fontFamily: 'Arial, sans-serif', padding: '8mm', background: '#fff' }}>
//           <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: `2px solid ${GOLD}`, paddingBottom: 12 }}>
//             <h1 style={{ fontSize: 22, fontWeight: 800, color: DARK_TXT, margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>{user?.businessName || 'Inventory Pro'}</h1>
//             <p style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>
//               Product Catalogue — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
//             </p>
//           </div>
//           {Object.entries(groupedByGender).map(([gender, items]) => (
//             <div key={gender} style={{ marginBottom: 20 }}>
//               <h2 style={{ fontSize: 12, fontWeight: 700, color: DARK_TXT, marginBottom: 8, padding: '3px 10px', background: '#FBF3E3', border: `1px solid rgba(201,168,76,0.30)`, borderRadius: 4, display: 'inline-block' }}>
//                 {gender}
//               </h2>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
//                 {items.map(s => <PrintableCard key={s._id} stock={s} />)}
//               </div>
//             </div>
//           ))}
//           <div style={{ marginTop: 14, paddingTop: 8, borderTop: '1px solid #e8d8c0', textAlign: 'center', color: MUTED, fontSize: 9 }}>
//             Total Products: {filtered.length} · Generated by Inventory Pro
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }
import { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Search,
  X,
  Tag,
  FileDown,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const GENDERS = ['', 'Men', 'Women', 'Kids', 'Unisex'];

// ─── Light Luxury Palette ─────────────────────────────────────────────────────
const PAGE_BG = '#FBF8F3';
const GOLD = '#C9A84C';
const GOLD_L = '#E8D080';
const DARK_TXT = '#1C1A16';
const MUTED = '#8A7A62';

const GENDER_COLOR = {
  Men: '#1d4ed8',
  Women: '#be185d',
  Kids: '#7c3aed',
  Unisex: '#92400e',
};

// ─── Light Premium Product Card ───────────────────────────────────────────────
function ProductCard({ stock }) {
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  const gColor = GENDER_COLOR[stock.gender] || GOLD;

  const stockColor =
    stock.currentCartons > 5
      ? '#059669'
      : stock.currentCartons > 0
      ? '#D97706'
      : '#DC2626';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        height: 210,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#FFFFFF',
        border: `1px solid ${
          hovered
            ? 'rgba(201,168,76,0.45)'
            : 'rgba(201,168,76,0.20)'
        }`,
        boxShadow: hovered
          ? '0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(201,168,76,0.12)'
          : '0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s, border-color 0.25s',
      }}
    >
      {/* Image */}
      <div
        style={{
          width: '44%',
          flexShrink: 0,
          position: 'relative',
          background: '#F0E6D6',
          borderRight: '1px solid rgba(201,168,76,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 70% 70% at 50% 42%, rgba(201,168,76,0.10) 0%, transparent 70%)',
          }}
        />

        {stock.image && !imgErr ? (
          <img
            src={stock.image}
            alt={stock.articleName}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            loading="eager"
            draggable={false}
            style={{
              width: '85%',
              height: '85%',
              objectFit: 'contain',
              display: 'block',
              filter:
                'drop-shadow(0 8px 16px rgba(0,0,0,0.18)) drop-shadow(0 2px 5px rgba(0,0,0,0.10))',
              position: 'relative',
              zIndex: 1,
              userSelect: 'none',
            }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 7,
              color: '#C4A882',
            }}
          >
            <Tag size={32} />
            <span
              style={{
                fontSize: 8,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              No Image
            </span>
          </div>
        )}

        {stock.currentCartons === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 9,
              left: 9,
              background: 'rgba(220,38,38,0.10)',
              border: '1px solid rgba(220,38,38,0.30)',
              color: '#DC2626',
              fontSize: 7,
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 3,
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
            }}
          >
            Out of Stock
          </div>
        )}
      </div>

      {/* Details */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '13px 15px',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: gColor,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {stock.gender}
            </span>

            {stock.stockType && (
              <span style={{ fontSize: 8, color: MUTED }}>
                · {stock.stockType}
              </span>
            )}
          </div>

          <h3
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: DARK_TXT,
              margin: '0 0 5px',
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '-0.2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {stock.articleName}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {stock.color && (
              <span
                style={{
                  fontSize: 9,
                  background: '#F5EDE0',
                  border: '1px solid rgba(201,168,76,0.22)',
                  color: '#7A6A52',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}
              >
                {stock.color}
              </span>
            )}

            {stock.size && (
              <span
                style={{
                  fontSize: 9,
                  background: '#F5EDE0',
                  border: '1px solid rgba(201,168,76,0.22)',
                  color: '#7A6A52',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}
              >
                Sz {stock.size}
              </span>
            )}

            {stock.series && (
              <span
                style={{
                  fontSize: 9,
                  background: '#FBF3E3',
                  border: '1px solid rgba(201,168,76,0.35)',
                  color: GOLD,
                  padding: '2px 7px',
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                {stock.series}
              </span>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div>
          <div
            style={{
              height: 1,
              background:
                'linear-gradient(90deg, rgba(201,168,76,0.30), transparent)',
              marginBottom: 9,
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 7,
                  color: MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 2,
                }}
              >
                MRP
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: DARK_TXT,
                  letterSpacing: '-0.4px',
                  lineHeight: 1,
                }}
              >
                ₹{stock.mrp?.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 7,
                  color: MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 1,
                }}
              >
                Stock
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: stockColor,
                  lineHeight: 1,
                }}
              >
                {stock.currentCartons} ctns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Printable Card ───────────────────────────────────────────────────────────
function PrintableCard({ stock }) {
  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid #e8d8c0',
        borderRadius: 6,
        overflow: 'hidden',
        breakInside: 'avoid',
        background: 'white',
      }}
    >
      <div
        style={{
          width: 100,
          minHeight: 108,
          background: '#F0E6D6',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {stock.image ? (
          <img
            src={stock.image}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '6px',
            }}
          />
        ) : (
          <div
            style={{
              color: '#C4A882',
              fontSize: 10,
              textAlign: 'center',
            }}
          >
            No Image
          </div>
        )}
      </div>

      <div style={{ padding: '8px 11px', flex: 1 }}>
        <p
          style={{
            fontWeight: 800,
            fontSize: 11,
            margin: '0 0 1px',
            color: '#1C1A16',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
        >
          {stock.articleName}
        </p>

        <p
          style={{
            fontSize: 9,
            color: '#8A7A62',
            margin: '0 0 5px',
          }}
        >
          {stock.stockType} · {stock.gender}
        </p>

        {stock.color && (
          <p
            style={{
              fontSize: 8.5,
              color: '#8A7A62',
              margin: '0 0 1px',
            }}
          >
            Color: {stock.color}
          </p>
        )}

        {stock.size && (
          <p
            style={{
              fontSize: 8.5,
              color: '#8A7A62',
              margin: '0 0 1px',
            }}
          >
            Size: {stock.size}
          </p>
        )}

        {stock.series && (
          <p
            style={{
              fontSize: 8.5,
              color: '#C9A84C',
              fontWeight: 700,
              margin: 0,
            }}
          >
            Series: {stock.series}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Catalogue() {
  const { user } = useAuth();

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStockType, setFilterStockType] = useState('');
  const [stockTypes, setStockTypes] = useState([]);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  const printRef = useRef();

  useEffect(() => {
    fetchStocks();

    api
      .get('/inventory/suggestions')
      .then((r) => setStockTypes(r.data.stockTypes || []))
      .catch(() => {});
  }, []);

  const fetchStocks = async () => {
    setLoading(true);

    try {
      const { data } = await api.get(
        '/inventory/stocks?limit=500&sortBy=articleName&order=asc'
      );

      setStocks(data.stocks || []);
    } catch {
      toast.error('Failed to load catalogue');
    } finally {
      setLoading(false);
    }
  };

  const filtered = stocks.filter((s) => {
    const matchSearch = `${s.articleName} ${s.color} ${s.series}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchGender = !filterGender || s.gender === filterGender;

    const matchType =
      !filterStockType ||
      s.stockType.toLowerCase().includes(filterStockType.toLowerCase());

    const matchStock = showOutOfStock || s.currentCartons > 0;

    return matchSearch && matchGender && matchType && matchStock;
  });

  const groupedByGender = GENDERS.filter(Boolean).reduce((acc, g) => {
    const items = filtered.filter((s) => s.gender === g);

    if (items.length) acc[g] = items;

    return acc;
  }, {});

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${user?.businessName || 'Inventory'} Catalogue`,
    pageStyle: `
      @page {
        size: A4;
        margin: 12mm;
      }

      body {
        font-family: Arial, sans-serif;
      }
    `,
  });

  const handleDownloadPDF = async () => {
    if (filtered.length === 0) {
      return toast.error('No products to export');
    }

    setPdfLoading(true);

    try {
      const params = new URLSearchParams();

      if (search) params.set('search', search);

      if (filterGender) params.set('gender', filterGender);

      if (filterStockType)
        params.set('stockType', filterStockType);

      if (!showOutOfStock)
        params.set('showOutOfStock', 'false');

      const response = await api.get(
        `/inventory/catalogue-pdf?${params}`,
        {
          responseType: 'blob',
        }
      );

      const url = URL.createObjectURL(response.data);

      const a = document.createElement('a');

      a.href = url;

      a.download = `${
        user?.businessName || 'Inventory'
      }_Catalogue.pdf`;

      a.click();

      URL.revokeObjectURL(url);

      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF download failed.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Layout bg={PAGE_BG}>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                marginBottom: 7,
              }}
            >
              <div
                style={{
                  height: 1.5,
                  width: 20,
                  background: GOLD,
                  borderRadius: 1,
                }}
              />

              <span
                style={{
                  fontSize: 8.5,
                  color: GOLD,
                  letterSpacing: '2.8px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {user?.businessName || 'Inventory Pro'}
              </span>
            </div>

            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: DARK_TXT,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1,
              }}
            >
              Catalogue
            </h1>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="btn-secondary text-sm"
            >
              <Printer size={15} /> Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 18px',
                borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD}, #B8960C)`,
                border: 'none',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: pdfLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {pdfLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileDown size={14} />
              )}

              Download PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 no-print">

          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />

            <input
              type="text"
              className="input-field pl-9 w-full"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            className="input-field w-full sm:w-36"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="">All Genders</option>

            {GENDERS.filter(Boolean).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="input-field w-full sm:w-36"
            value={filterStockType}
            onChange={(e) =>
              setFilterStockType(e.target.value)
            }
          >
            <option value="">All Types</option>

            {stockTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              setShowOutOfStock((p) => !p)
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 14px',
              borderRadius: 8,
              background: showOutOfStock
                ? '#FBF3E3'
                : '#FFFFFF',
              border: `1px solid ${
                showOutOfStock
                  ? 'rgba(201,168,76,0.40)'
                  : '#e2e8f0'
              }`,
              color: showOutOfStock ? GOLD : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={13} />

            {showOutOfStock
              ? 'Hide out-of-stock'
              : 'Show out-of-stock'}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 280 }}
          >
            <div
              className="animate-spin"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border:
                  '3px solid rgba(201,168,76,0.20)',
                borderTopColor: GOLD,
              }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ height: 240, gap: 14 }}
          >
            <Tag
              size={44}
              style={{ opacity: 0.25, color: GOLD }}
            />

            <div className="text-center">
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: DARK_TXT,
                }}
              >
                No products found
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <ProductCard
                key={s._id}
                stock={s}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden print */}
      <div className="hidden">
        <div
          ref={printRef}
          style={{
            fontFamily: 'Arial, sans-serif',
            padding: '8mm',
            background: '#fff',
          }}
        >
          {Object.entries(groupedByGender).map(
            ([gender, items]) => (
              <div key={gender}>
                <h2>{gender}</h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, 1fr)',
                    gap: 8,
                  }}
                >
                  {items.map((s) => (
                    <PrintableCard
                      key={s._id}
                      stock={s}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}