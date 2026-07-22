import { useState } from 'react';
import { submitJoinRequest, ApiError } from '@/lib/api';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import { useT } from '@/i18n/useT';

const KZ_PHONE_RE = /^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

interface JoinBlock { titleRu?: string; subtitleRu?: string; imageUrl?: string; }

export function JoinSection() {
  const t = useT();
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<JoinBlock>('join');
  const titleLines = (cms?.titleRu?.trim() || 'Стань частью\nнародной силы').split('\n');
  const legacySubtitle = 'Казахстан справедливых возможностей начинается с людей, которые готовы за него работать.';
  const cmsSubtitle = cms?.subtitleRu?.trim();
  const subtitle = !cmsSubtitle || cmsSubtitle === legacySubtitle ? t('home.join.newSubtitle') : cmsSubtitle;
  const image = cms?.imageUrl?.trim() || '/images/congress-hall-applause.jpg';

  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!KZ_PHONE_RE.test(phone.trim())) {
      setError('Формат телефона: +7 7XX XXX XX XX');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await submitJoinRequest({ role: 'member', fullName, phone: phone.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--line)',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Formular',Arial,sans-serif",
    borderRadius: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.14em',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 0,
    fontFamily: "'Formular',Arial,sans-serif",
    fontWeight: 600,
  };

  return (
    <section style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 600,
      }} className="join-section-grid">

        {/* LEFT — form */}
        <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {submitted ? (
            <div>
              <div style={{ width: 48, height: 4, background: '#db1f26', marginBottom: 32 }} />
              <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#db1f26', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 16px', fontFamily: "'Formular',Arial,sans-serif" }}>
                Готово
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, margin: '0 0 16px', fontFamily: "'Formular',Arial,sans-serif" }}>
                Заявка отправлена
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, fontFamily: "'Formular',Arial,sans-serif" }}>
                Мы свяжемся с вами в ближайшее время.
              </p>
            </div>
          ) : (
            <>
              <div style={{ width: 48, height: 4, background: '#db1f26', marginBottom: 32 }} />
              <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#db1f26', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 16px', fontFamily: "'Formular',Arial,sans-serif" }}>
                Присоединяйтесь
              </p>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: 'var(--text)', lineHeight: 1.08, margin: '0 0 12px', letterSpacing: '-0.02em', fontFamily: "'Formular',Arial,sans-serif" }}>
                {titleLines.map((line, i) => (
                  <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
                ))}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 40px', fontFamily: "'Formular',Arial,sans-serif" }}>
                {subtitle}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* ФИО */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>ФИО</label>
                  <input
                    required
                    placeholder="Иванов Иван Иванович"
                    style={inputStyle}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = '#db1f26')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--line)')}
                  />
                </div>

                {/* Телефон */}
                <div style={{ marginBottom: 32 }}>
                  <label style={labelStyle}>Номер телефона</label>
                  <input
                    required
                    type="tel"
                    placeholder="+7 7XX XXX XX XX"
                    style={inputStyle}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = '#db1f26')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--line)')}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#db1f26', margin: '0 0 20px', fontFamily: "'Formular',Arial,sans-serif" }}>
                    {error}
                  </p>
                )}

                {/* Согласие */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none', marginBottom: 32 }}>
                  <span
                    onClick={() => setConsent(p => !p)}
                    style={{
                      width: 18, height: 18, flexShrink: 0, marginTop: 2,
                      border: `2px solid ${consent ? '#db1f26' : 'var(--line)'}`,
                      background: consent ? '#db1f26' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}
                  >
                    {consent && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, fontFamily: "'Formular',Arial,sans-serif" }}>
                    Я даю согласие на обработку персональных данных в соответствии с{' '}
                    <a href="#" style={{ color: '#db1f26', textDecoration: 'none' }}>политикой конфиденциальности</a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!consent || submitting}
                  style={{
                    padding: '16px 48px',
                    background: consent ? '#db1f26' : 'rgba(219,31,38,0.25)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: consent && !submitting ? 'pointer' : 'not-allowed',
                    fontFamily: "'Formular',Arial,sans-serif",
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    transition: 'background .2s',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={e => { if (consent) e.currentTarget.style.background = '#b91721'; }}
                  onMouseLeave={e => { if (consent) e.currentTarget.style.background = '#db1f26'; }}
                >
                  {submitting ? 'Отправка…' : 'Отправить заявку →'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* RIGHT — photo */}
        <div style={{ position: 'relative', minHeight: 520 }}>
          <img
            src={image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* overlay from left, blends photo into section background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, var(--bg) 0%, rgb(var(--bg-rgb) / 0.3) 50%, transparent 100%)',
          }} />
          {/* red accent line top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#db1f26' }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .join-section-grid {
            grid-template-columns: 1fr !important;
          }
          .join-section-grid > div:first-child {
            padding: 56px 20px !important;
          }
          .join-section-grid > div:last-child {
            min-height: 280px !important;
          }
        }
      `}</style>
    </section>
  );
}
