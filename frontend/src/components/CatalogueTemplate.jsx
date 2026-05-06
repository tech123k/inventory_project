import { forwardRef } from 'react';

// ─── Luxury Palette ───────────────────────────────────────────────────────────
const GOLD    = '#C9A84C';
const GOLD_L  = '#EDD880';
const GOLD_D  = '#7A5C1E';
const CREAM   = '#F5F0E8';
const MUTED   = '#6A5A42';
const BASE    = '#0C0A08';

const GENDER_CHIP = {
  Men:    { color: '#93C5FD', bg: 'rgba(147,197,253,0.10)', border: 'rgba(147,197,253,0.25)' },
  Women:  { color: '#F9A8D4', bg: 'rgba(249,168,212,0.10)', border: 'rgba(249,168,212,0.25)' },
  Kids:   { color: '#C4B5FD', bg: 'rgba(196,181,253,0.10)', border: 'rgba(196,181,253,0.25)' },
  Unisex: { color: GOLD,      bg: 'rgba(201,168,76,0.10)',  border: 'rgba(201,168,76,0.25)'  },
};

// ─── Premium Catalogue Poster — 1000 × 650 px landscape ─────────────────────
const CatalogueTemplate = forwardRef(({ stock, businessName }, ref) => {
  const avail      = stock?.currentCartons ?? 0;
  const availColor = avail > 5 ? '#34D399' : avail > 0 ? '#FCD34D' : '#F87171';
  const availLabel = avail > 5 ? 'In Stock' : avail > 0 ? 'Low Stock' : 'Out of Stock';
  const gChip      = GENDER_CHIP[stock?.gender] || GENDER_CHIP.Unisex;
  const nameLen    = (stock?.articleName || '').length;
  const nameFontSz = nameLen > 22 ? 22 : nameLen > 16 ? 26 : 30;

  const specs = [
    stock?.color      && ['Color',   stock.color],
    stock?.size       && ['Size',    stock.size],
    stock?.series     && ['Series',  stock.series],
    stock?.pairCarton && ['Per Ctn', String(stock.pairCarton)],
  ].filter(Boolean);

  return (
    <div ref={ref} style={{
      width: 1000, height: 650,
      background: BASE,
      fontFamily: "'Helvetica Neue', Arial, 'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative', boxSizing: 'border-box',
    }}>

      {/* ══ BACKGROUND ATMOSPHERE ══════════════════════════════════════════════ */}
      {/* Warm cinematic spotlight in image zone */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse 52% 68% at 30% 50%, rgba(201,168,76,0.11) 0%, transparent 68%)',
      }} />
      {/* Deep vignette ring */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 28%, rgba(0,0,0,0.72) 100%)',
      }} />
      {/* Top-right darkening */}
      <div style={{ position:'absolute', top:0, right:0, width:380, height:220, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.48) 0%, transparent 70%)',
      }} />
      {/* Bottom gradient for footer */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:110, pointerEvents:'none', zIndex:0,
        background:'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
      }} />
      {/* Subtle cool accent glow on right */}
      <div style={{ position:'absolute', top:'20%', right:'5%', width:200, height:200, borderRadius:'50%', pointerEvents:'none', zIndex:0,
        background:'radial-gradient(circle, rgba(100,160,255,0.04) 0%, transparent 70%)',
      }} />

      {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 30px', flexShrink:0,
        background:'rgba(0,0,0,0.42)',
        borderBottom:`1px solid rgba(201,168,76,0.16)`,
        position:'relative', zIndex:2,
      }}>
        {/* Brand identity */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:38, height:38, borderRadius:9, flexShrink:0,
            background:`linear-gradient(145deg, ${GOLD_D}, ${GOLD} 50%, ${GOLD_L})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:17, fontWeight:900, color:'#0C0A08',
            boxShadow:`0 4px 18px rgba(201,168,76,0.40), inset 0 1px 0 rgba(255,255,255,0.22)`,
          }}>
            {(businessName || 'I')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color:CREAM, letterSpacing:'2.8px', textTransform:'uppercase', lineHeight:1 }}>
              {businessName || 'Inventory Pro'}
            </div>
            <div style={{ fontSize:7, color:GOLD, letterSpacing:'3.2px', textTransform:'uppercase', marginTop:3.5, fontWeight:600 }}>
              Premium Collection
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {stock?.gender && (
            <div style={{
              padding:'4px 16px', borderRadius:20,
              background:gChip.bg, border:`1px solid ${gChip.border}`,
              color:gChip.color, fontSize:9, fontWeight:800, letterSpacing:'1.4px', textTransform:'uppercase',
            }}>
              {stock.gender}
            </div>
          )}
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:8, color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>Catalogue</div>
            <div style={{ fontSize:8, color:MUTED, marginTop:2 }}>
              {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative', zIndex:1 }}>

        {/* ── LEFT: Cinematic Hero Image ────────────────────────────────────── */}
        <div style={{
          width:430, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          position:'relative',
          borderRight:`1px solid rgba(201,168,76,0.10)`,
          padding:'16px 18px 24px',
        }}>
          {/* Primary warm spotlight */}
          <div style={{
            position:'absolute', width:380, height:380, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.05) 42%, transparent 70%)',
            top:'50%', left:'50%', transform:'translate(-50%, -54%)',
            pointerEvents:'none',
          }} />
          {/* Secondary cold rim light */}
          <div style={{
            position:'absolute', width:200, height:140, pointerEvents:'none',
            background:'radial-gradient(ellipse, rgba(160,200,255,0.06) 0%, transparent 70%)',
            top:'22%', left:'60%', transform:'translate(-50%, -50%)',
          }} />

          {stock?.image ? (
            <div style={{ position:'relative', zIndex:2, width:385, height:430, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img
                src={stock.image}
                alt={stock?.articleName}
                crossOrigin="anonymous"
                style={{
                  width:'100%', height:'100%',
                  objectFit:'contain', display:'block',
                  filter:[
                    'drop-shadow(0 36px 52px rgba(0,0,0,0.98))',
                    'drop-shadow(0 14px 24px rgba(0,0,0,0.88))',
                    'drop-shadow(0 0 48px rgba(201,168,76,0.09))',
                  ].join(' '),
                }}
              />
              {/* Floor shadow ellipse */}
              <div style={{
                position:'absolute', bottom:6, left:'10%', right:'10%', height:18,
                background:'radial-gradient(ellipse, rgba(0,0,0,0.80) 0%, transparent 70%)',
                filter:'blur(9px)', zIndex:-1, transform:'translateY(4px)',
              }} />
            </div>
          ) : (
            <div style={{
              width:370, height:400,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              gap:14, color:'rgba(255,255,255,0.06)',
              border:`1px dashed rgba(201,168,76,0.12)`, borderRadius:20,
            }}>
              <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <span style={{ fontSize:10, letterSpacing:'2px', textTransform:'uppercase', color:'rgba(201,168,76,0.22)' }}>
                No Image
              </span>
            </div>
          )}

          {/* Out-of-stock flag */}
          {avail === 0 && (
            <div style={{
              position:'absolute', top:22, left:20,
              background:'rgba(220,38,38,0.10)', border:'1px solid rgba(220,38,38,0.26)',
              color:'#F87171', fontSize:7.5, fontWeight:800,
              padding:'3px 11px', borderRadius:3, letterSpacing:'2px', textTransform:'uppercase',
            }}>
              Out of Stock
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Details ─────────────────────────────────────────── */}
        <div style={{
          flex:1,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          padding:'28px 32px 22px 28px',
          overflow:'hidden',
        }}>

          {/* Top block */}
          <div>
            {/* Stock type with decorative line */}
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
              <div style={{ height:1.5, width:22, background:GOLD, borderRadius:1 }} />
              <span style={{ fontSize:8, color:GOLD, letterSpacing:'2.8px', textTransform:'uppercase', fontWeight:700 }}>
                {stock?.stockType || 'Footwear'}
              </span>
              <div style={{ height:1, flex:1, background:`linear-gradient(90deg, rgba(201,168,76,0.38), transparent)` }} />
            </div>

            {/* Article name */}
            <h2 style={{
              fontSize:nameFontSz, fontWeight:900, color:CREAM,
              margin:'0 0 10px', lineHeight:1.02, letterSpacing:'-0.8px',
              textTransform:'uppercase',
              overflow:'hidden', textOverflow:'ellipsis',
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
            }}>
              {stock?.articleName || '—'}
            </h2>

            {/* Gold accent rule */}
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:22 }}>
              <div style={{ height:2.5, width:48, background:`linear-gradient(90deg, ${GOLD}, ${GOLD_L})`, borderRadius:2 }} />
              <div style={{ height:1, width:28, background:`rgba(201,168,76,0.32)`, borderRadius:1 }} />
              <div style={{ height:1, width:14, background:`rgba(201,168,76,0.16)`, borderRadius:1 }} />
            </div>

            {/* Specification rows */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              {specs.map(([label, value], i) => (
                <div key={label} style={{
                  display:'flex', alignItems:'center',
                  padding:'9px 0',
                  borderBottom: i < specs.length - 1 ? `1px solid rgba(201,168,76,0.09)` : 'none',
                }}>
                  <span style={{
                    fontSize:7.5, color:MUTED,
                    textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:700,
                    minWidth:62, flexShrink:0,
                  }}>
                    {label}
                  </span>
                  <div style={{ width:1, height:13, background:'rgba(201,168,76,0.24)', margin:'0 15px', flexShrink:0 }} />
                  <span style={{ fontSize:12.5, fontWeight:700, color:CREAM, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {value}
                  </span>
                </div>
              ))}
              {specs.length === 0 && <div style={{ height:60 }} />}
            </div>
          </div>

          {/* Bottom block: availability + pricing */}
          <div>
            {/* Availability indicator */}
            <div style={{ marginBottom:18 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:9,
                padding:'5px 15px 5px 11px', borderRadius:6,
                background:`rgba(${avail > 5 ? '52,211,153' : avail > 0 ? '252,211,77' : '248,113,113'},0.07)`,
                border:`1px solid rgba(${avail > 5 ? '52,211,153' : avail > 0 ? '252,211,77' : '248,113,113'},0.22)`,
              }}>
                <div style={{
                  width:7, height:7, borderRadius:'50%',
                  background:availColor, boxShadow:`0 0 6px ${availColor}90`,
                }} />
                <span style={{ fontSize:8.5, color:availColor, fontWeight:800, letterSpacing:'1.2px', textTransform:'uppercase' }}>
                  {availLabel}
                </span>
                <span style={{ marginLeft:3, fontSize:10.5, color:availColor, fontWeight:600 }}>
                  — {avail} {avail === 1 ? 'carton' : 'cartons'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div style={{
              display:'flex', gap:24,
              paddingTop:18,
              borderTop:`1px solid rgba(201,168,76,0.16)`,
            }}>
              {/* MRP */}
              <div>
                <div style={{ fontSize:7.5, color:MUTED, textTransform:'uppercase', letterSpacing:'1.3px', fontWeight:700, marginBottom:5 }}>
                  M.R.P.
                </div>
                <div style={{ fontSize:30, fontWeight:900, color:CREAM, letterSpacing:'-1.2px', lineHeight:1 }}>
                  ₹{Number(stock?.mrp || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width:1, background:'rgba(201,168,76,0.20)', alignSelf:'stretch', flexShrink:0 }} />

              {/* Offer Rate */}
              <div>
                <div style={{ fontSize:7.5, color:GOLD, textTransform:'uppercase', letterSpacing:'1.3px', fontWeight:700, marginBottom:5 }}>
                  Offer Rate
                </div>
                <div style={{ fontSize:30, fontWeight:900, color:GOLD_L, letterSpacing:'-1.2px', lineHeight:1 }}>
                  ₹{Number(stock?.rate || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER STRIP ════════════════════════════════════════════════════════ */}
      <div style={{
        display:'flex', alignItems:'center',
        padding:'0 26px 0 28px', height:54, flexShrink:0,
        background:'rgba(0,0,0,0.62)',
        borderTop:`1px solid rgba(201,168,76,0.14)`,
        position:'relative', zIndex:2, gap:14,
      }}>
        {/* Mini product gallery */}
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              width:36, height:36, borderRadius:6, overflow:'hidden', flexShrink:0,
              border:`1px solid rgba(201,168,76,${i === 1 ? '0.38' : '0.12'})`,
              background:`rgba(255,255,255,${i === 1 ? '0.04' : '0.02'})`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {stock?.image && (
                <img
                  src={stock.image} alt=""
                  crossOrigin="anonymous"
                  style={{
                    width:'100%', height:'100%', objectFit:'contain',
                    opacity: i === 1 ? 0.9 : 0.22 + i * 0.06,
                    filter: i === 1 ? 'none' : `brightness(0.55) sepia(${(i-1) * 0.45})`,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width:1, height:30, background:'rgba(201,168,76,0.20)', flexShrink:0 }} />

        {/* Centre text */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:7.5, color:GOLD, letterSpacing:'2.8px', fontWeight:800, textTransform:'uppercase', whiteSpace:'nowrap' }}>
            Standard Catalogue Template
          </span>
          <div style={{ width:1, height:11, background:'rgba(201,168,76,0.28)', flexShrink:0 }} />
          <span style={{ fontSize:7.5, color:MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {businessName || 'Inventory Pro'} · {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
          </span>
        </div>

        {/* Right: Min order */}
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'flex-end', flexShrink:0,
          paddingLeft:16, borderLeft:`1px solid rgba(201,168,76,0.16)`,
        }}>
          <span style={{ fontSize:7, color:MUTED, textTransform:'uppercase', letterSpacing:'1.2px' }}>Min. Order</span>
          <span style={{ fontSize:14, fontWeight:800, color:GOLD, letterSpacing:'-0.3px' }}>1 Carton</span>
        </div>
      </div>

      {/* ══ CORNER ACCENTS (gold frame corners) ════════════════════════════════ */}
      {/* Top-left */}
      <div style={{ position:'absolute', top:0, left:0, pointerEvents:'none', zIndex:5 }}>
        <div style={{ position:'absolute', top:0, left:0, width:52, height:2, background:`linear-gradient(90deg, ${GOLD}, transparent)` }} />
        <div style={{ position:'absolute', top:0, left:0, width:2, height:52, background:`linear-gradient(180deg, ${GOLD}, transparent)` }} />
      </div>
      {/* Top-right */}
      <div style={{ position:'absolute', top:0, right:0, pointerEvents:'none', zIndex:5 }}>
        <div style={{ position:'absolute', top:0, right:0, width:52, height:2, background:`linear-gradient(270deg, ${GOLD}, transparent)` }} />
        <div style={{ position:'absolute', top:0, right:0, width:2, height:52, background:`linear-gradient(180deg, ${GOLD}, transparent)` }} />
      </div>
      {/* Bottom-left */}
      <div style={{ position:'absolute', bottom:0, left:0, pointerEvents:'none', zIndex:5 }}>
        <div style={{ position:'absolute', bottom:0, left:0, width:52, height:2, background:`linear-gradient(90deg, ${GOLD}, transparent)` }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:2, height:52, background:`linear-gradient(0deg, ${GOLD}, transparent)` }} />
      </div>
      {/* Bottom-right */}
      <div style={{ position:'absolute', bottom:0, right:0, pointerEvents:'none', zIndex:5 }}>
        <div style={{ position:'absolute', bottom:0, right:0, width:52, height:2, background:`linear-gradient(270deg, ${GOLD}, transparent)` }} />
        <div style={{ position:'absolute', bottom:0, right:0, width:2, height:52, background:`linear-gradient(0deg, ${GOLD}, transparent)` }} />
      </div>
    </div>
  );
});

CatalogueTemplate.displayName = 'CatalogueTemplate';
export default CatalogueTemplate;
