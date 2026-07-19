import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Heart, CheckCircle, ChevronDown, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlinedButton } from '@/components/OutlinedButton';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import {
  submitJoinRequest, sendJoinSmsCode, verifyJoinSmsCode, fetchBranches, fetchAddressSuggest,
  ApiError, type PublicBranch, type AddressSuggestion,
} from '@/lib/api';
import { isValidIin } from '@/lib/iin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Телефон храним как 10 цифр локального номера (7XX XXX XX XX, без +7) — источник истины.
// Маска для показа — "+7 (7XX) XXX-XX-XX", для API — "+7 7XX XXX XX XX" (формат бэкенда, см.
// kzPhoneSchema в cms/packages/shared/src/index.ts, менять его не стали, чтобы не задеть
// другие формы на той же схеме).
function extractPhoneDigits(input: string): string {
  let d = input.replace(/\D/g, '');
  if (d.length === 11 && (d[0] === '7' || d[0] === '8')) d = d.slice(1);
  else if (d.length > 10) d = d.slice(d.length - 10);
  return d.slice(0, 10);
}
function formatPhoneMasked(digits: string): string {
  let out = '+7';
  if (digits.length > 0) out += ' (' + digits.slice(0, 3);
  if (digits.length >= 3) out += ')';
  if (digits.length > 3) out += ' ' + digits.slice(3, 6);
  if (digits.length > 6) out += '-' + digits.slice(6, 8);
  if (digits.length > 8) out += '-' + digits.slice(8, 10);
  return out;
}
function normalizePhoneForApi(digits: string): string {
  return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}
const SMS_CODE_TTL_S = 300; // держим в синхроне с cms/packages/api SMS_CODE_TTL_MS
const RESEND_COOLDOWN_S = 60;

interface JoinConsentBlock {
  article8TextRu?: string;
  dataConsentTextRu?: string;
}

const roles = [
  {
    id: 'member' as const,
    icon: UserPlus,
    title: 'Вступить в партию',
    description: 'Подайте заявку на вступление, чтобы участвовать в жизни партии, инициативах и мероприятиях.',
  },
  {
    id: 'volunteer' as const,
    icon: Heart,
    title: 'Стать волонтёром',
    description: 'Помогайте в общественных и предвыборных инициативах, информационной работе и мероприятиях партии.',
  },
];

const STEPS = ['Старт', 'Данные', 'Заявление', 'Подпись', 'Готово'];

const inputCls = 'w-full bg-surface-2 border border-line rounded-input px-4 py-3.5 text-body text-text-base placeholder:text-text-muted focus:border-red focus:shadow-focus outline-none transition-all';
const labelCls = 'block text-[12px] font-semibold tracking-wide text-text-muted uppercase mb-1.5';
const errorTextCls = 'text-[12px] text-red mt-1';
function fieldCls(hasError: boolean) {
  return `${inputCls} ${hasError ? 'border-red' : ''}`;
}

function stepCircleCls(done: boolean, active: boolean) {
  return `w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
    done ? 'bg-red border-red text-white' : active ? 'border-red text-red bg-transparent' : 'border-line text-text-muted bg-transparent'
  }`;
}

// Вертикальный степпер — колонка слева от карточки шага (десктоп).
function VerticalStepper({ step }: { step: number }) {
  return (
    <div className="flex flex-col">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        const isLast = n === STEPS.length;
        return (
          <div key={label} className={`flex items-stretch gap-3 ${isLast ? '' : 'pb-9'}`}>
            <div className="flex flex-col items-center">
              <div className={stepCircleCls(done, active)}>{done ? <Check size={16} /> : n}</div>
              {!isLast && <div className={`w-[2px] flex-1 mt-1 transition-all ${done ? 'bg-red' : 'bg-line'}`} />}
            </div>
            <span className={`text-[14px] font-medium pt-1.5 ${active || done ? 'text-text-base' : 'text-text-muted'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Компактный горизонтальный прогресс сверху — мобильная версия (узко, вертикальный степпер не влезает).
function MobileStepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8 md:hidden">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={stepCircleCls(done, active)}>{done ? <Check size={16} /> : n}</div>
              <span className={`hidden sm:block text-[11px] font-medium ${active || done ? 'text-text-base' : 'text-text-muted'}`}>
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <div className={`flex-1 h-[2px] mx-2 transition-all ${done ? 'bg-red' : 'bg-line'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function JoinPage() {
  const { getBlock } = usePageBlocks('vstupit');
  const consentBlock = getBlock<JoinConsentBlock>('join_consent');
  const article8Text = consentBlock?.article8TextRu?.trim()
    || 'Подтверждаю, что являюсь гражданином Республики Казахстан, достиг(ла) совершеннолетия и не отношусь к категориям лиц, указанным в статье 8 Закона Республики Казахстан «О политических партиях» (судьи, военнослужащие, сотрудники правоохранительных и специальных государственных органов).';
  const dataConsentText = consentBlock?.dataConsentTextRu?.trim()
    || 'Подтверждаю достоверность указанных сведений и осведомлён(а) об ответственности за предоставление ложной информации в соответствии с законодательством Республики Казахстан. Даю согласие на обработку персональных данных в соответствии с политикой конфиденциальности.';

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'member' | 'volunteer' | ''>('');

  const [branches, setBranches] = useState<PublicBranch[]>([]);
  useEffect(() => { fetchBranches().then(setBranches).catch(() => {}); }, []);

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [iin, setIin] = useState('');
  const [idDocNumber, setIdDocNumber] = useState('');
  const [branchId, setBranchId] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressSuggestOpen, setAddressSuggestOpen] = useState(false);
  const [addressActiveIndex, setAddressActiveIndex] = useState(-1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step2Attempted, setStep2Attempted] = useState(false);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const idDocRef = useRef<HTMLInputElement>(null);
  const iinRef = useRef<HTMLInputElement>(null);
  const branchRef = useRef<HTMLSelectElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Автоподсказки адреса (2ГИС Suggest API, C4) — необязательные: без ключа на
  // бэкенде эндпоинт просто отдаёт пустой список, поле остаётся обычным инпутом.
  useEffect(() => {
    if (addressLine.trim().length < 3) { setAddressSuggestions([]); return; }
    const t = setTimeout(() => {
      fetchAddressSuggest(addressLine.trim())
        .then(res => setAddressSuggestions(res.suggestions))
        .catch(() => setAddressSuggestions([]));
    }, 300);
    return () => clearTimeout(t);
  }, [addressLine]);

  const [article8Consent, setArticle8Consent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Обратный отсчёт: срок действия кода и кулдаун на повторную отправку.
  useEffect(() => {
    if (expiresIn <= 0 && resendIn <= 0) return;
    const t = setInterval(() => {
      setExpiresIn(v => Math.max(0, v - 1));
      setResendIn(v => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresIn > 0 || resendIn > 0]);

  const selectedBranch = branches.find(b => b.id === branchId);

  const iinDigitsOk = /^\d{12}$/.test(iin);
  const iinValid = iinDigitsOk && isValidIin(iin);
  const idDocValid = /^\d{9}$/.test(idDocNumber);
  const phoneValid = phone.length === 10 && phone[0] === '7';
  const emailValid = email.trim() === '' || EMAIL_RE.test(email.trim());
  const fullNameValid = !!fullName.trim();
  const birthDateValid = !!birthDate;
  const branchValid = !!branchId;
  const addressValid = !!addressLine.trim();

  const step2Valid = fullNameValid && birthDateValid && iinValid && idDocValid && branchValid && addressValid && phoneValid && emailValid;
  const step3Valid = article8Consent && dataConsent;

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function goToStep2() {
    if (!role) return;
    setStep(2);
  }

  // Валидация по нажатию «Продолжить»: подсвечиваем невалидные поля и скроллим к первому.
  function goToStep3() {
    setStep2Attempted(true);
    if (!step2Valid) {
      const fieldChecks: Array<[boolean, typeof fullNameRef]> = [
        [fullNameValid, fullNameRef],
        [birthDateValid, birthDateRef],
        [idDocValid, idDocRef],
        [iinValid, iinRef],
        [branchValid, branchRef as typeof fullNameRef],
        [addressValid, addressRef],
        [phoneValid, phoneRef],
        [emailValid, emailRef],
      ];
      const firstInvalid = fieldChecks.find(([valid]) => !valid);
      const el = firstInvalid?.[1].current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return;
    }
    setStep(3);
  }

  async function handleSendCode() {
    setCodeError(null);
    setSendingCode(true);
    try {
      const res = await sendJoinSmsCode(normalizePhoneForApi(phone));
      setCodeSent(true);
      setCodeVerified(false);
      setCode('');
      setExpiresIn(res.expiresInSeconds ?? SMS_CODE_TTL_S);
      setResendIn(RESEND_COOLDOWN_S);
    } catch (err) {
      setCodeError(err instanceof ApiError ? err.message : 'Не удалось отправить код. Попробуйте ещё раз.');
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyCode() {
    if (code.length !== 6) return;
    setCodeError(null);
    setVerifying(true);
    try {
      const res = await verifyJoinSmsCode(normalizePhoneForApi(phone), code);
      if (!res.valid) {
        setCodeError('Неверный код. Проверьте SMS и попробуйте снова.');
        setCodeVerified(false);
        return;
      }
      setCodeVerified(true);
    } catch {
      setCodeError('Не удалось проверить код. Попробуйте ещё раз.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleFinalSubmit() {
    if (!codeVerified) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitJoinRequest({
        role: role || 'member',
        fullName: fullName.trim(),
        birthDate,
        iin,
        idDocNumber,
        address: `${selectedBranch ? selectedBranch.cityRu + ', ' : ''}${addressLine.trim()}`,
        phone: normalizePhoneForApi(phone),
        email: email.trim() || undefined,
        city: selectedBranch?.cityRu,
        branchId: branchId || undefined,
        article8Consent,
        dataConsent,
        smsCode: code,
      });
      setApplicationId(res.id);
      setStep(5);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Не удалось отправить заявление. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  }

  const birthDateLabel = birthDate ? new Date(birthDate).toLocaleDateString('ru-RU') : '__________';

  return (
    <div className="pb-16">
      <div className="max-w-[960px] mx-auto px-4 md:px-10">
        <SectionHeader light="Вступить в" bold="партию" centered />

        {step < 5 && <MobileStepper step={step} />}

        <div className={step < 5 ? 'md:grid md:grid-cols-[200px_1fr] md:gap-10 md:items-start' : ''}>
          {step < 5 && (
            <div className="hidden md:block pt-2">
              <VerticalStepper step={step} />
            </div>
          )}

          <div>
        {/* ── Шаг 1: Старт ── */}
        {step === 1 && (
          <ScrollReveal>
            <div className="bg-surface rounded-card p-6 md:p-8 border border-line">
              <h3 className="text-heading-sm font-bold text-text-base mb-2">Выберите роль</h3>
              <p className="text-body text-text-muted mb-6">
                Дальше — 4 коротких шага: данные, заявление, подпись SMS-кодом и готово. Занимает пару минут.
              </p>
              <div className="space-y-4">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`w-full flex items-start justify-between gap-4 p-5 rounded-card border transition-all duration-200 text-left ${
                        role === r.id ? 'border-red bg-red/[0.08]' : 'border-line hover:border-text-muted bg-surface-2'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Icon size={28} strokeWidth={1.5} className="text-red shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-body-lg font-bold text-text-base mb-1">{r.title}</h4>
                          <p className="text-body text-text-muted">{r.description}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-text-muted shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
              <PrimaryButton fullWidth className="mt-6" onClick={goToStep2} disabled={!role}>
                Продолжить
              </PrimaryButton>
            </div>
          </ScrollReveal>
        )}

        {/* ── Шаг 2: Данные ── */}
        {step === 2 && (
          <ScrollReveal>
            <div className="bg-surface rounded-card p-6 md:p-8 border border-line">
              <h3 className="text-heading-sm font-bold text-text-base mb-6">Заполните данные</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>ФИО</label>
                  <input ref={fullNameRef} type="text" placeholder="Иванов Иван Иванович" value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className={fieldCls(step2Attempted && !fullNameValid)} />
                  {step2Attempted && !fullNameValid && <p className={errorTextCls}>Укажите ФИО полностью</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Дата рождения</label>
                    <input ref={birthDateRef} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className={fieldCls(step2Attempted && !birthDateValid)} />
                    {step2Attempted && !birthDateValid && <p className={errorTextCls}>Укажите дату рождения</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Номер удостоверения</label>
                    <input ref={idDocRef} type="text" inputMode="numeric" maxLength={9} placeholder="9 цифр" value={idDocNumber}
                      onChange={e => setIdDocNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className={fieldCls((idDocNumber.length === 9 || step2Attempted) && !idDocValid)} />
                    {(idDocNumber.length === 9 || step2Attempted) && !idDocValid && (
                      <p className={errorTextCls}>9 цифр номера удостоверения</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>ИИН</label>
                  <input ref={iinRef} type="text" inputMode="numeric" maxLength={12} placeholder="12 цифр" value={iin}
                    onChange={e => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className={fieldCls((iinDigitsOk || step2Attempted) && !iinValid)} />
                  {(iinDigitsOk || step2Attempted) && !iinValid && (
                    <p className={errorTextCls}>Неверный ИИН — проверьте цифры (контрольная сумма или дата рождения не сходятся)</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Область / город</label>
                  <div className="relative">
                    <select ref={branchRef} value={branchId} onChange={e => setBranchId(e.target.value)}
                      className={`${fieldCls(step2Attempted && !branchValid)} appearance-none cursor-pointer pr-10`}>
                      <option value="">Выберите филиал</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.cityRu}</option>)}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                  {step2Attempted && !branchValid && <p className={errorTextCls}>Выберите филиал</p>}
                </div>

                <div className="relative">
                  <label className={labelCls}>Адрес (улица, дом, квартира)</label>
                  <input ref={addressRef} type="text" placeholder="ул. Абая, д. 10, кв. 5" value={addressLine}
                    autoComplete="off"
                    onChange={e => { setAddressLine(e.target.value); setAddressSuggestOpen(true); setAddressActiveIndex(-1); }}
                    onFocus={() => setAddressSuggestOpen(true)}
                    onBlur={() => setTimeout(() => setAddressSuggestOpen(false), 150)}
                    onKeyDown={e => {
                      if (!addressSuggestOpen || addressSuggestions.length === 0) return;
                      if (e.key === 'ArrowDown') { e.preventDefault(); setAddressActiveIndex(i => Math.min(i + 1, addressSuggestions.length - 1)); }
                      else if (e.key === 'ArrowUp') { e.preventDefault(); setAddressActiveIndex(i => Math.max(i - 1, 0)); }
                      else if (e.key === 'Enter' && addressActiveIndex >= 0) {
                        e.preventDefault();
                        setAddressLine(addressSuggestions[addressActiveIndex].value);
                        setAddressSuggestOpen(false);
                      } else if (e.key === 'Escape') setAddressSuggestOpen(false);
                    }}
                    className={fieldCls(step2Attempted && !addressValid)} />
                  {step2Attempted && !addressValid && <p className={errorTextCls}>Укажите адрес</p>}
                  {addressSuggestOpen && addressSuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface border border-line rounded-input shadow-2xl overflow-hidden max-h-[220px] overflow-y-auto">
                      {addressSuggestions.map((s, i) => (
                        <button key={s.value + i} type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { setAddressLine(s.value); setAddressSuggestOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-body text-text-base transition-colors ${i === addressActiveIndex ? 'bg-surface-2' : 'hover:bg-surface-2'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Телефон</label>
                    <input ref={phoneRef} type="tel" placeholder="+7 (7XX) XXX-XX-XX" value={formatPhoneMasked(phone)}
                      onChange={e => setPhone(extractPhoneDigits(e.target.value))}
                      className={fieldCls((phone.length > 0 || step2Attempted) && !phoneValid)} />
                    {(phone.length > 0 || step2Attempted) && !phoneValid && (
                      <p className={errorTextCls}>Введите номер полностью — +7 (7XX) XXX-XX-XX</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Email (необязательно)</label>
                    <input ref={emailRef} type="email" placeholder="mail@example.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={fieldCls(email.length > 0 && !emailValid)} />
                    <p className="text-[11px] text-text-muted mt-1">На эту почту придёт ссылка-подтверждение</p>
                    {email.length > 0 && !emailValid && <p className={errorTextCls}>Проверьте формат почты</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <OutlinedButton className="flex-1" onClick={() => setStep(1)}>Назад</OutlinedButton>
                  <PrimaryButton className="flex-1" onClick={goToStep3}>Продолжить</PrimaryButton>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── Шаг 3: Заявление ── */}
        {step === 3 && (
          <ScrollReveal>
            <div className="bg-surface rounded-card p-6 md:p-8 border border-line">
              <h3 className="text-heading-sm font-bold text-text-base mb-4">Ознакомьтесь с заявлением</h3>

              {/* Заявление оформлено как документ: белый лист с чёрным текстом жёстко,
                  независимо от темы сайта (это не UI-блок, а текст официальной бумаги). */}
              <div
                className="rounded-card p-6 md:p-8 mb-6 leading-relaxed"
                style={{ background: '#ffffff', color: '#181818', fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <p className="text-center font-bold mb-5" style={{ fontSize: 18 }}>Заявление</p>
                <p className="mb-4">
                  Настоящим, я, {fullName || '__________'}, выражаю намерение вступить в Общественное объединение «Народная партия Казахстана».
                </p>
                <p className="mb-2">Дата рождения: {birthDateLabel}</p>
                <p className="mb-2">ИИН: {iin || '____________'}</p>
                <p className="mb-2">Номер документа, удостоверяющего личность гражданина Республики Казахстан: {idDocNumber || '_________'}</p>
                <p className="mb-1">Область, город, адрес места жительства:</p>
                <p className="mb-2">{selectedBranch ? selectedBranch.cityRu + ', ' : ''}{addressLine || '__________'}</p>
                <p>Телефон: {phone ? formatPhoneMasked(phone) : '__________'}</p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={article8Consent} onChange={e => setArticle8Consent(e.target.checked)}
                    className="mt-1 w-[18px] h-[18px] accent-red shrink-0 cursor-pointer" />
                  <span className="text-[13px] text-text-muted leading-relaxed">{article8Text}</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={dataConsent} onChange={e => setDataConsent(e.target.checked)}
                    className="mt-1 w-[18px] h-[18px] accent-red shrink-0 cursor-pointer" />
                  <span className="text-[13px] text-text-muted leading-relaxed">{dataConsentText}</span>
                </label>
              </div>

              <div className="flex gap-3">
                <OutlinedButton className="flex-1" onClick={() => setStep(2)}>Назад</OutlinedButton>
                <PrimaryButton className="flex-1" onClick={() => setStep(4)} disabled={!step3Valid}>Продолжить</PrimaryButton>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── Шаг 4: Подпись ── */}
        {step === 4 && (
          <ScrollReveal>
            <div className="bg-surface rounded-card p-6 md:p-8 border border-line">
              <h3 className="text-heading-sm font-bold text-text-base mb-2">Подпись</h3>
              <p className="text-body text-text-muted mb-6">
                Код подтверждения придёт на номер <b className="text-text-base">{formatPhoneMasked(phone)}</b>
              </p>

              {!codeSent ? (
                <PrimaryButton fullWidth onClick={handleSendCode} disabled={sendingCode}>
                  {sendingCode ? 'Отправка…' : 'Отправить код'}
                </PrimaryButton>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Код из SMS</label>
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="6 цифр" value={code}
                      onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeVerified(false); }}
                      className={`${inputCls} text-center tracking-[0.4em] text-[18px] ${codeVerified ? 'border-red' : ''}`} />
                    {expiresIn > 0 ? (
                      <p className="text-[12px] text-text-muted mt-1.5">Код действителен ещё {formatTime(expiresIn)}</p>
                    ) : (
                      <p className="text-[12px] text-red mt-1.5">Код истёк — запросите новый</p>
                    )}
                  </div>

                  {codeVerified && (
                    <p className="text-[13px] text-red flex items-center gap-1.5"><CheckCircle size={15} /> Код верный</p>
                  )}
                  {codeError && <p className="text-body text-red">{codeError}</p>}
                  {submitError && <p className="text-body text-red">{submitError}</p>}

                  <p className="text-[12px] text-text-muted">Вводя код из SMS, вы подписываете заявление.</p>

                  {!codeVerified ? (
                    <PrimaryButton fullWidth onClick={handleVerifyCode} disabled={code.length !== 6 || verifying || expiresIn === 0}>
                      {verifying ? 'Проверка…' : 'Подтвердить код'}
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton fullWidth onClick={handleFinalSubmit} disabled={submitting}>
                      {submitting ? 'Отправка…' : 'Подписать и отправить'}
                    </PrimaryButton>
                  )}

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={resendIn > 0 || sendingCode}
                    className="w-full text-center text-[13px] text-text-muted hover:text-text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-1"
                  >
                    {resendIn > 0 ? `Отправить код повторно через ${formatTime(resendIn)}` : 'Отправить код повторно'}
                  </button>
                </div>
              )}

              <OutlinedButton fullWidth className="mt-4" onClick={() => setStep(3)}>
                <span className="flex items-center justify-center gap-1.5"><ArrowLeft size={15} /> Назад</span>
              </OutlinedButton>
            </div>
          </ScrollReveal>
        )}

        {/* ── Шаг 5: Готово ── */}
        {step === 5 && (
          <ScrollReveal>
            <div className="bg-surface rounded-card p-8 md:p-12 border border-line text-center">
              <CheckCircle size={64} className="text-red mx-auto mb-4" />
              <h3 className="text-heading font-bold text-text-base mb-2">Заявление подписано и принято</h3>
              {applicationId && (
                <p className="text-body text-text-muted mb-1">Номер заявки: <span className="text-text-base font-medium">{applicationId}</span></p>
              )}
              <p className="text-body text-text-base mb-6">Мы свяжемся с вами в ближайшее время.</p>
              <Link to="/">
                <OutlinedButton>На главную</OutlinedButton>
              </Link>
            </div>
          </ScrollReveal>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
