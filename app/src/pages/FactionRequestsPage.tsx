import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { fetchDocuments } from '@/lib/api';

interface DeputyRequest {
  date: string;
  title: string;
  excerpt: string;
  url: string;
}

const BASE_URL = 'https://halykpartiyasy.kz';

// Фолбэк на случай недоступности API — те же данные, что уже перенесены в CMS
// (модель Document, type=deputy_request).
const FALLBACK_REQUESTS: DeputyRequest[] = [
  { date: '17.06.2026', title: 'О неполноте информации о финансировании организаций из иностранных источников', excerpt: 'В марте этого года Комитетом государственных доходов Министерства финансов Республики Казахстан был опубликован так называемый в народе «список иноагентов».', url: `${BASE_URL}/ru/deputatskij-zapros/o-nepolnote-informacii-o-finansirovanii-organizacij-poluchayushchih-sredstva-iz-inostrannyh-istochnikov` },
  { date: '03.06.2026', title: 'Об организации и проведении выпускных мероприятий учреждений образования', excerpt: 'Воспитание подрастающего поколения — это общая ответственность государства, педагогов и родителей.', url: `${BASE_URL}/ru/deputatskij-zapros/ob-organizacii-i-provedenii-vypusknyh-meropriyatij-uchrezhdenij-obrazovaniya-rk` },
  { date: '03.06.2026', title: 'О создании единого контролирующего органа в сфере промышленной безопасности', excerpt: 'Сохранение жизни и здоровья граждан является безусловным приоритетом государственной политики.', url: `${BASE_URL}/ru/deputatskij-zapros/o-sozdanii-edinogo-samostoyatelnogo-kontroliruyushchego-gosudarstvennogo-organa-v-sfere-promyshlennoj-bezopasnosti` },
  { date: '28.05.2026', title: 'О проблемах развития региональной дорожной инфраструктуры', excerpt: 'Качество региональных дорог остаётся одной из ключевых проблем, влияющих на безопасность и экономику регионов.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemah-razvitiya-regionalnoj-dorozhnoj-infrastruktury-v-rk` },
  { date: '13.05.2026', title: 'О проблемах развития региональной дорожной инфраструктуры в РК', excerpt: 'Казахстан — одна из крупнейших по территории стран мира, что требует системного подхода к дорожной сети.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemah-razvitiya-regionalnoj-dorozhnoj-infrastruktury-v-rk-` },
  { date: '22.04.2026', title: 'О проблемной ситуации с выплатой алиментов в Казахстане', excerpt: 'Общая задолженность по исполнительным документам, связанным с алиментами, достигает 18 миллиардов тенге.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemnoj-situacii-slozhivshejsya-s-vyplatoj-alimentov-v-kazahstane` },
  { date: '15.04.2026', title: 'О гражданской защите и безопасности населения г. Алматы', excerpt: 'Данный запрос состоялся по результатам встречи в регионах и обращений жителей мегаполиса.', url: `${BASE_URL}/ru/deputatskij-zapros/o-voprosah-grazhdanskoj-zashchity-i-bezopasnosti-naseleniya-galmaty` },
  { date: '08.04.2026', title: 'О повышении эффективности институтов советов и уполномоченных по защите прав уязвимых граждан', excerpt: 'Принцип «слышащего государства» должен активно реализовываться на практике.', url: `${BASE_URL}/ru/deputatskij-zapros/o-povyshenii-effektivnosti-institutov-sovetov-i-upolnomochennyh-po-zashchite-prav-socialno-uyazvimyh-kategorij-grazhdan` },
  { date: '08.04.2026', title: 'О проблемах обеспечения сельских населенных пунктов природным газом', excerpt: 'Обеспечение природным газом остаётся одним из наиболее актуальных вопросов для сельских регионов.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemah-obespecheniya-selskih-naselennyh-punktov-prirodnym-gazom` },
  { date: '18.03.2026', title: 'Об обеспечении водной безопасности: модернизация инфраструктуры и мониторинг утечек', excerpt: 'Вопрос рационального использования водных ресурсов неоднократно поднимался на высоком государственном уровне.', url: `${BASE_URL}/ru/deputatskij-zapros/ob-obespechenii-vodnoj-bezopasnosti-strany-modernizaciya-iznoshennoj-infrastruktury-i-vnedrenie-sistem-onlajn-monitoringa-utechek-kak-prioritet-gosudarstvennoj-politiki` },
  { date: '18.03.2026', title: 'Об индексации государственных расходов в рамках образовательной программы «Болашак»', excerpt: 'Программа международной стипендии, учреждённая в 1993 году, — ключевой инструмент подготовки высококвалифицированных кадров.', url: `${BASE_URL}/ru/deputatskij-zapros/ob-indeksacii-gosudarstvennyh-rashodov-v-ramkah-obrazovatelnoj-programmy-bolashak` },
  { date: '26.02.2026', title: 'О модернизации дорожной инфраструктуры в области Улытау', excerpt: 'Запрос о развитии дорожной сети региона в соответствии с государственным курсом на масштабную модернизацию.', url: `${BASE_URL}/ru/deputatskij-zapros/o-modernizacii-dorozhnoj-infrastruktury-v-oblasti-ulytau` },
  { date: '28.01.2026', title: 'О внедрении в Республике Казахстан налогового рулинга', excerpt: 'Инициатива связана с цифровизацией и интеграцией искусственного интеллекта в экономику страны.', url: `${BASE_URL}/ru/deputatskij-zapros/o-vnedrenii-v-respublike-kazahstan-nalogovogo-rulinga` },
  { date: '28.01.2026', title: 'О проблемах рынка оказания социальных и психологических услуг', excerpt: 'Запрос направлен на регулирование качества и безопасности психологической помощи населению.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemah-rynka-okazaniya-socialnyh-i-psihologicheskih-uslug-naseleniyu-i-ih-nizkom-kachestve` },
  { date: '14.01.2026', title: 'О проблемах дополнительного образования в Республике Казахстан', excerpt: 'Система дополнительного образования демонстрирует системные изъяны, ведущие к ограничению доступа детей.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemah-dopolnitelnogo-obrazovaniya-v-respublike-kazahstan` },
  { date: '14.01.2026', title: 'Об ужесточении требований к обороту алкогольной продукции', excerpt: 'Половина убийств в стране совершаются в состоянии опьянения, согласно данным МВД.', url: `${BASE_URL}/ru/deputatskij-zapros/ob-uzhestochenii-trebovanij-k-oborotu-alkogolnoj-produkcii-v-strane` },
  { date: '17.12.2025', title: 'О проблемах развития туризма в Республике Казахстан', excerpt: 'Несмотря на большой потенциал, туристическая отрасль развивается недостаточно динамично.', url: `${BASE_URL}/ru/deputatskij-zapros/o-problemah-razvitiya-turizma-v-respublike-kazahstan` },
  { date: '17.12.2025', title: 'О мерах повышения качества обязательного социального медицинского страхования', excerpt: 'Отсутствие прозрачного контроля за объёмом ОСМС вызывает недовольство граждан.', url: `${BASE_URL}/ru/deputatskij-zapros/o-merah-povysheniya-kachestva-i-sozdanie-uslovij-prozrachnosti-obyazatelnogo-socialnogo-medicinskogo-strahovaniya` },
  { date: '10.12.2025', title: 'О прозрачности иностранного финансирования физических и юридических лиц', excerpt: 'Анализ реестра получателей иностранного финансирования вызывает озабоченность в вопросах национальной безопасности.', url: `${BASE_URL}/ru/deputatskij-zapros/o-prozrachnosti-inostrannogo-finansirovaniya-fizicheskih-i-yuridicheskih-lic-v-kazahstane` },
  { date: '10.12.2025', title: 'О недостатках реформы технического и профессионального образования', excerpt: 'Деление колледжей на «лиги» вызывает опасения среди экспертов и педагогов.', url: `${BASE_URL}/ru/deputatskij-zapros/o-nedostatkah-reformy-sistemy-tehnicheskogo-i-professionalnogo-obrazovaniya` },
];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
}

function descriptionText(value: string | null): string {
  return (value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const PER_PAGE = 6;

/* ─── Pagination ──────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pageCount = Math.ceil(total / perPage);
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 48 }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--line)', color: page === 1 ? 'var(--line)' : 'var(--text)', cursor: page === 1 ? 'default' : 'pointer', fontSize: 16 }}
      >
        ‹
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: page === p ? '#db1f26' : 'transparent', border: page === p ? '1px solid #db1f26' : '1px solid var(--line)', color: page === p ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: page === p ? 700 : 500, fontFamily: 'inherit' }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--line)', color: page === pageCount ? 'var(--line)' : 'var(--text)', cursor: page === pageCount ? 'default' : 'pointer', fontSize: 16 }}
      >
        ›
      </button>
    </div>
  );
}

/* ─── Request Card ────────────────────────────────────────────────── */
function RequestCard({ item }: { item: DeputyRequest }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s', borderColor: hovered ? 'var(--text-muted)' : 'var(--line)', textDecoration: 'none' }}
    >
      {/* Icon block instead of missing photo */}
      <div className="npr-card__icon" style={{ flexShrink: 0, width: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
        <FileText size={26} color="#db1f26" strokeWidth={1.6} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.date}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--line)', display: 'block' }} />
          <span style={{ fontSize: 11, color: '#db1f26', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Депутатский запрос</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{item.excerpt}</p>
        <span style={{ fontSize: 12, color: hovered ? '#db1f26' : 'var(--text-muted)', fontWeight: 700, transition: 'color .15s', letterSpacing: '.04em' }}>
          Читать полностью →
        </span>
      </div>
    </a>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export function FactionRequestsPage() {
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<DeputyRequest[]>(FALLBACK_REQUESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments('deputy_request')
      .then((docs) => {
        if (docs.length === 0) return;
        setRequests(
          docs.map((d) => ({
            date: formatDate(d.publishedAt),
            title: d.title,
            excerpt: descriptionText(d.description),
            url: d.fileUrl,
          }))
        );
      })
      .catch(() => {
        // API недоступен — остаёмся на FALLBACK_REQUESTS
      })
      .finally(() => setLoading(false));
  }, []);

  const total = requests.length;
  const start = (page - 1) * PER_PAGE;
  const visible = requests.slice(start, start + PER_PAGE);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* BREADCRUMBS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '128px 40px 0' }}>
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/frakciya">Фракция</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>Депутатские запросы</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* HERO */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 40px 40px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 0,
          border: '1.5px solid rgba(219,31,38,0.35)', color: '#db1f26',
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
          marginBottom: 24,
        }}>
          Фракция НПК
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800,
          lineHeight: 0.95, letterSpacing: '-0.04em', margin: 0,
        }}>
          Депутатские <span style={{ color: '#db1f26' }}>запросы</span>
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.65,
          marginTop: 20, maxWidth: 640,
        }}>
          Официальные депутатские запросы фракции НПК в Мажилисе Парламента РК —
          инструмент, с помощью которого депутаты добиваются решения проблем,
          волнующих граждан Казахстана.
        </p>
      </section>

      {/* ALL REQUESTS */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 100px', borderTop: '1px solid var(--line)' }}>
        <div style={{ padding: '48px 0 24px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1 }}>
            Все запросы
          </h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Найдено: <strong style={{ color: 'var(--text)' }}>{total}</strong> материалов
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          {visible.map((item, i) => (
            <RequestCard key={start + i} item={item} />
          ))}
        </div>

        <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }} />
      </section>

      <style>{`
        @media (max-width: 600px) {
          .npr-card__icon { display: none; }
        }
      `}</style>
    </div>
  );
}
