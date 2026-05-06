import { forwardRef } from 'react';

// ─── Light Premium Palette ────────────────────────────────────────────────────
const GOLD     = '#C9A84C';
const GOLD_L   = '#EDD880';
const GOLD_D   = '#7A5C1E';
const BASE     = '#FBF8F3';
const PANEL    = '#EDE3D5';
const DARK_TXT = '#1C1A16';
const MUTED    = '#8A7A62';
const BORDER   = '#C8B49A';

const GENDER_CHIP = {
  Men:    { color: '#1d4ed8', bg: 'rgba(29,78,216,0.09)',   border: 'rgba(29,78,216,0.25)'  },
  Women:  { color: '#be185d', bg: 'rgba(190,24,93,0.09)',   border: 'rgba(190,24,93,0.25)'  },
  Kids:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.09)',  border: 'rgba(124,58,237,0.25)' },
  Unisex: { color: GOLD_D,    bg: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.38)' },
};

// ─── Premium Catalogue Poster — 1000 × 650 px landscape ─────────────────────
// html2canvas note: use explicit px dimensions (no %-based heights in auto containers)
const CatalogueTemplate = forwardRef(({ stock, businessName }, ref) => {
  const avail      = stock?.currentCartons ?? 0;
  const availColor = avail > 5 ? '#16a34a' : avail > 0 ? '#d97706' : '#dc2626';
  const availBg    = avail > 5 ? 'rgba(22,163,74,0.10)'  : avail > 0 ? 'rgba(217,119,6,0.10)'  : 'rgba(220,38,38,0.10)';
  const availBrd   = avail > 5 ? 'rgba(22,163,74,0.35)'  : avail > 0 ? 'rgba(217,119,6,0.35)'  : 'rgba(220,38,38,0.35)';
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

  // Layout constants (must sum to 650)
  const HEADER_H = 64;
  const FOOTER_H = 52;
  const BODY_H   = 650 - HEADER_H - FOOTER_H; // 534
  const LEFT_W   = 400;

  // Image box: explicit px so html2canvas computes correctly
  const IMG_W = 340;
  const IMG_H = 450;

  return (
    <div ref={ref} style={{
      width: 1000, height: 650,
      background: BASE,
      fontFamily: "'Helvetica Neue', Arial, 'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative', boxSizing: 'border-box',
    }}>

      {/* Subtle warm glow in left image zone */}
      <div style={{
        position: 'absolute', top: HEADER_H, left: 0, width: LEFT_W, height: BODY_H,
        background: 'radial-gradient(ellipse 70% 65% at 50% 48%, rgba(201,168,76,0.16) 0%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
      <div style={{
        height: HEADER_H, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 30px',
        background: PANEL,
        borderBottom: `2px solid ${GOLD}`,
        position: 'relative', zIndex: 2, boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: `linear-gradient(145deg, ${GOLD_D}, ${GOLD} 55%, ${GOLD_L})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 900, color: '#fff',
            boxShadow: `0 4px 14px rgba(201,168,76,0.35)`,
          }}>
            {(businessName || 'I')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: DARK_TXT, letterSpacing: '2.8px', textTransform: 'uppercase', lineHeight: 1 }}>
              {businessName || 'Inventory Pro'}
            </div>
            <div style={{ fontSize: 7, color: GOLD, letterSpacing: '3.2px', textTransform: 'uppercase', marginTop: 4, fontWeight: 600 }}>
              Premium Collection
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {stock?.gender && (
            <div style={{
              padding: '4px 16px', borderRadius: 20,
              background: gChip.bg, border: `1.5px solid ${gChip.border}`,
              color: gChip.color, fontSize: 9, fontWeight: 800,
              letterSpacing: '1.4px', textTransform: 'uppercase',
            }}>
              {stock.gender}
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>Catalogue</div>
            <div style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════════════ */}
      <div style={{
        height: BODY_H, display: 'flex', overflow: 'hidden',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── LEFT: Hero Image on warm beige ────────────────────────────────── */}
        <div style={{
          width: LEFT_W, flexShrink: 0, height: BODY_H,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          background: PANEL,
          borderRight: `2px solid ${GOLD}`,
          boxSizing: 'border-box',
        }}>
          {stock?.image ? (
            /* Explicit pixel container so html2canvas resolves % correctly */
            <div style={{
              width: IMG_W, height: IMG_H, flexShrink: 0,
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={stock.image}
                alt={stock?.articleName || ''}
                crossOrigin="anonymous"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'contain', display: 'block',
                  filter: 'drop-shadow(0 10px 22px rgba(90,65,35,0.22)) drop-shadow(0 3px 8px rgba(90,65,35,0.12))',
                }}
              />
              {/* Warm floor shadow */}
              <div style={{
                position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 14,
                background: 'radial-gradient(ellipse, rgba(90,65,35,0.18) 0%, transparent 70%)',
                filter: 'blur(6px)',
              }} />
            </div>
          ) : (
            <div style={{
              width: IMG_W, height: IMG_H,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14,
              border: `1.5px dashed ${BORDER}`, borderRadius: 16,
            }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BORDER }}>No Image</span>
            </div>
          )}

          {avail === 0 && (
            <div style={{
              position: 'absolute', top: 18, left: 18,
              background: '#FEE2E2', border: `1px solid #DC2626`,
              color: '#DC2626', fontSize: 7.5, fontWeight: 800,
              padding: '3px 11px', borderRadius: 3,
              letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              Out of Stock
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Details ─────────────────────────────────────────── */}
        <div style={{
          flex: 1, height: BODY_H,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '28px 34px 22px 30px',
          overflow: 'hidden', boxSizing: 'border-box',
        }}>

          {/* Top block */}
          <div>
            {/* Stock type tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{ height: 1.5, width: 22, background: GOLD, borderRadius: 1 }} />
              <span style={{ fontSize: 8, color: GOLD, letterSpacing: '2.8px', textTransform: 'uppercase', fontWeight: 700 }}>
                {stock?.stockType || 'Footwear'}
              </span>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.42), transparent)' }} />
            </div>

            {/* Article name */}
            <h2 style={{
              fontSize: nameFontSz, fontWeight: 900, color: DARK_TXT,
              margin: '0 0 10px', lineHeight: 1.05, letterSpacing: '-0.6px',
              textTransform: 'uppercase',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {stock?.articleName || '—'}
            </h2>

            {/* Gold accent rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 22 }}>
              <div style={{ height: 2.5, width: 48, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_L})`, borderRadius: 2 }} />
              <div style={{ height: 1, width: 28, background: 'rgba(201,168,76,0.42)', borderRadius: 1 }} />
              <div style={{ height: 1, width: 14, background: 'rgba(201,168,76,0.22)', borderRadius: 1 }} />
            </div>

            {/* Spec rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {specs.map(([label, value], i) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', padding: '9px 0',
                  borderBottom: i < specs.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <span style={{
                    fontSize: 7.5, color: MUTED, textTransform: 'uppercase',
                    letterSpacing: '1.5px', fontWeight: 700, minWidth: 62, flexShrink: 0,
                  }}>{label}</span>
                  <div style={{ width: 1, height: 13, background: 'rgba(201,168,76,0.45)', margin: '0 15px', flexShrink: 0 }} />
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, color: DARK_TXT,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{value}</span>
                </div>
              ))}
              {specs.length === 0 && <div style={{ height: 60 }} />}
            </div>
          </div>

          {/* Bottom block */}
          <div>
            {/* Availability */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '5px 15px 5px 11px', borderRadius: 6,
                background: availBg, border: `1px solid ${availBrd}`,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: availColor }} />
                <span style={{ fontSize: 8.5, color: availColor, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  {availLabel}
                </span>
                <span style={{ marginLeft: 3, fontSize: 10.5, color: availColor, fontWeight: 600 }}>
                  — {avail} {avail === 1 ? 'carton' : 'cartons'}
                </span>
              </div>
            </div>

            {/* Pricing — gold rule above */}
            <div style={{ borderTop: `1.5px solid ${GOLD}`, paddingTop: 16, display: 'flex', gap: 16 }}>
              {/* MRP */}
              <div style={{
                flex: 1, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(200,180,154,0.20)', border: `1px solid ${BORDER}`,
                boxSizing: 'border-box',
              }}>
                <div style={{ fontSize: 7.5, color: MUTED, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, marginBottom: 6 }}>
                  M.R.P.
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: DARK_TXT, letterSpacing: '-1px', lineHeight: 1 }}>
                  ₹{Number(stock?.mrp || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Rate */}
              <div style={{
                flex: 1, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(201,168,76,0.14)', border: `1.5px solid ${GOLD}`,
                position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: GOLD }} />
                <div style={{ fontSize: 7.5, color: GOLD, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, marginBottom: 6, marginTop: 4 }}>
                  Offer Rate
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: GOLD_D, letterSpacing: '-1px', lineHeight: 1 }}>
                  ₹{Number(stock?.rate || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <div style={{
        height: FOOTER_H, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 26px 0 28px',
        background: PANEL, borderTop: `2px solid ${GOLD}`,
        position: 'relative', zIndex: 2, gap: 14, boxSizing: 'border-box',
      }}>
        {/* Mini thumbnails */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              width: 34, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
              border: `1px solid rgba(201,168,76,${i === 1 ? '0.55' : '0.22'})`,
              background: i === 1 ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stock?.image && (
                <img
                  src={stock.image} alt=""
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: i === 1 ? 0.95 : 0.28 }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ width: 1, height: 28, background: 'rgba(201,168,76,0.42)', flexShrink: 0 }} />

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 7.5, color: GOLD, letterSpacing: '2.8px', fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Standard Catalogue Template
          </span>
          <div style={{ width: 1, height: 11, background: 'rgba(201,168,76,0.42)', flexShrink: 0 }} />
          <span style={{ fontSize: 7.5, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {businessName || 'Inventory Pro'} · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, paddingLeft: 16, borderLeft: `1px solid rgba(201,168,76,0.38)` }}>
          <span style={{ fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: '1.2px' }}>Min. Order</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: GOLD_D }}>1 Carton</span>
        </div>
      </div>

      {/* ══ GOLD CORNER ACCENTS ════════════════════════════════════════════════ */}
      {[
        { top: 0, left: 0,   h: [{ t:0, l:0, w:52, h:2 }, { t:0, l:0, w:2, h:52 }], dir: ['90deg','180deg'] },
        { top: 0, right: 0,  h: [{ t:0, r:0, w:52, h:2 }, { t:0, r:0, w:2, h:52 }], dir: ['270deg','180deg'] },
        { bottom:0,left:0,   h: [{ b:0, l:0, w:52, h:2 }, { b:0, l:0, w:2, h:52 }], dir: ['90deg','0deg']   },
        { bottom:0,right:0,  h: [{ b:0, r:0, w:52, h:2 }, { b:0, r:0, w:2, h:52 }], dir: ['270deg','0deg']  },
      ].map((corner, ci) => (
        <div key={ci} style={{ position: 'absolute', ...corner, pointerEvents: 'none', zIndex: 5 }}>
          {corner.h.map((rect, ri) => (
            <div key={ri} style={{
              position: 'absolute',
              top: rect.t, bottom: rect.b, left: rect.l, right: rect.r,
              width: rect.w, height: rect.h,
              background: `linear-gradient(${corner.dir[ri]}, ${GOLD}, transparent)`,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
});

CatalogueTemplate.displayName = 'CatalogueTemplate';
export default CatalogueTemplate;
