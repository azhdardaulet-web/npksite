import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Type, Contrast, Image as ImageIcon, Underline, Ban, RotateCcw } from 'lucide-react';
import { useA11y, type A11yFontSize } from '@/contexts/A11yContext';
import { cn } from '@/lib/utils';

const FONT_SIZE_OPTIONS: { value: A11yFontSize; label: string }[] = [
  { value: 'normal', label: 'Обычный' },
  { value: 'large', label: 'Крупный' },
  { value: 'xlarge', label: 'Очень крупный' },
];

function ToggleRow({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: typeof Contrast;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full gap-3 px-4 py-3 border border-line bg-surface hover:bg-surface-2 transition-colors text-left"
    >
      <span className="flex items-center gap-3 text-[14px] font-medium text-text-base">
        <Icon size={16} className="text-text-muted shrink-0" />
        {label}
      </span>
      <span className={cn('relative w-9 h-5 shrink-0 border border-line transition-colors', checked ? 'bg-accent-brand' : 'bg-surface-2')}>
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-bg transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
          )}
        />
      </span>
    </button>
  );
}

export function A11yPanel() {
  const {
    isPanelOpen,
    closePanel,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    grayscale,
    setGrayscale,
    underlineLinks,
    setUnderlineLinks,
    reduceMotion,
    setReduceMotion,
    reset,
    isCustomized,
  } = useA11y();

  useEffect(() => {
    if (!isPanelOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  return createPortal(
    <>
      <div onClick={closePanel} aria-hidden="true" className="fixed inset-0 z-[70] bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Версия для слабовидящих"
        className="fixed left-0 right-0 top-[56px] md:top-[108px] z-[71] bg-bg border-b border-line max-h-[calc(100dvh-56px)] md:max-h-[calc(100dvh-108px)] overflow-y-auto"
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-5 md:py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] md:text-[18px] font-bold text-text-base">Версия для слабовидящих</h2>
            <button
              onClick={closePanel}
              aria-label="Закрыть панель"
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-base hover:bg-surface-2 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2 flex items-center gap-2">
                <Type size={14} /> Размер шрифта
              </div>
              <div className="flex border border-line">
                {FONT_SIZE_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.value}
                    onClick={() => setFontSize(opt.value)}
                    aria-pressed={fontSize === opt.value}
                    className={cn(
                      'flex-1 px-3 py-2.5 text-[13px] font-medium transition-colors',
                      i > 0 && 'border-l border-line',
                      fontSize === opt.value
                        ? 'bg-accent-brand text-accent-brand-text'
                        : 'bg-surface text-text-muted hover:text-text-base'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <ToggleRow label="Высокий контраст" checked={highContrast} onChange={setHighContrast} icon={Contrast} />
              <ToggleRow label="Ч/б изображения" checked={grayscale} onChange={setGrayscale} icon={ImageIcon} />
              <ToggleRow label="Подчёркивать ссылки" checked={underlineLinks} onChange={setUnderlineLinks} icon={Underline} />
              <ToggleRow label="Отключить анимации" checked={reduceMotion} onChange={setReduceMotion} icon={Ban} />
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-line flex justify-end">
            <button
              onClick={reset}
              disabled={!isCustomized}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] border border-line text-text-base hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={14} />
              Обычная версия
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
