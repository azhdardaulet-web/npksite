import { Headphones } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface PodcastEpisode {
  title: string;
  src: string;
  lang: 'ru' | 'kz';
}

const OLD_SITE = 'https://halykpartiyasy.kz';
const episodes: PodcastEpisode[] = [
  { title: 'О модернизации партии', lang: 'ru', src: `${OLD_SITE}/storage/app/media/head/01_NPK_Ertysbaev%20%D0%9E%20%D0%BC%D0%BE%D0%B4%D0%B5%D1%80%D0%BD%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8%20%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D0%B8.mp3` },
  { title: 'Партийный список Народной партии Казахстана', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/03_NPK_Ertysbaev%20%D0%9F%D0%B0%D1%80%D1%82%D0%B8%D0%B9%D0%BD%D1%8B%D0%B9%20%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA%20%D0%9D%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9%20%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D0%B8%20%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD%D0%B0.mp3` },
  { title: 'О критике в отношении Народной партии Казахстана', lang: 'ru', src: `${OLD_SITE}/storage/app/media/05_NPK_Ertysbaev%20%D0%9E%20%D0%BA%D1%80%D0%B8%D1%82%D0%B8%D0%BA%D0%B5%20%D0%B2%20%D0%BE%D1%82%D0%BD%D0%BE%D1%88%D0%B5%D0%BD%D0%B8%D0%B8%20%D0%9D%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9%20%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D0%B8%20%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD%D0%B0.mp3` },
  { title: 'О часто задаваемых вопросах на агитациях', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/53npkertysbaev-02-o-chasto-zadavaemykh-voprosakh-na-agitatsiyakh.mp3` },
  { title: 'Какие действия предпринимаем против нападок и лжи', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/55npkertysbaev-04-kakie-deystviya-predprinimaem-protiv-napadok-i-lzhi.mp3` },
  { title: 'О честных выборах', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/07_NPK_Asylbekov%20%D0%9E%20%D1%87%D0%B5%D1%81%D1%82%D0%BD%D1%8B%D1%85%20%D0%B2%D1%8B%D0%B1%D0%BE%D1%80%D0%B0%D1%85.mp3` },
  { title: 'О горно-металлургическом комплексе', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/19_NPK_Asylbekov%20%D0%9E%20%D0%B3%D0%BE%D1%80%D0%BD%D0%BE-%D0%BC%D0%B5%D1%82%D0%B0%D0%BB%D0%BB%D1%83%D1%80%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%BC%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81%D0%B5.mp3` },
  { title: 'О реформе местного самоуправления и политических свободах граждан', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/15_NPK_Asylbekov%20%D0%9E%20%D1%80%D0%B5%D1%84%D0%BE%D1%80%D0%BC%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%BD%D0%BE%D0%B3%D0%BE%20%D1%81%D0%B0%D0%BC%D0%BE%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%B8%20%D0%BE%20%D0%BF%D0%BE%D0%BB%D0%B8%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D1%85%20%D1%81%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%B0%D1%85%20%D0%B3%D1%80%D0%B0%D0%B6%D0%B4%D0%B0%D0%BD.mp3` },
  { title: 'О земле и сельском хозяйстве', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/18npkasylbekov-o-zemle-o-selskom-khozyaystve-zemlya-narodu.mp3` },
  { title: 'О проблемах строительства в Казахстане', lang: 'ru', src: `${OLD_SITE}/storage/app/media/MP3/20npkappasova-nailya-o-problemakh-stroitelstva-v-kazakhstane-1.mp3` },
  { title: 'Әр отбасы мемлекеттің қамқорлығында', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/-%D0%9E%D0%A2%D0%91%D0%90%D0%A1%D0%AB-%D0%9C%D0%95%D0%9C%D0%9B%D0%95%D0%9A%D0%95%D0%A2%D0%A2%D0%86%D2%A2-%D2%9A%D0%90%D0%9C%D2%9A%D0%9E%D0%A0%D0%9B%D0%AB%D2%92%D0%AB%D0%9D%D0%94%D0%90-_1_.mp3` },
  { title: 'Кедейшілікпен күрес туралы заң', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/-%D0%BA%D2%AF%D1%80%D0%B5%D1%81-%D1%82%D1%83%D1%80%D0%B0%D0%BB%D1%8B-%D0%B7%D0%B0%D2%A3-.mp3` },
  { title: 'Тау-кен металлургия кешені', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/-%D0%BA%D0%B5%D0%BD-%D0%BC%D0%B5%D1%82%D0%B0%D0%BB%D0%BB%D1%83%D1%80%D0%B3%D0%B8%D1%8F-%D0%BA%D0%B5%D1%88%D0%B5%D0%BD%D1%96.mp3` },
  { title: 'Жер – халыққа! АӨК және ауылдық аймақтарды дамыту', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/khalya-aok-zhne-auyldy-aymatardy-uatty-damytu.mp3` },
  { title: 'Қауіпсіздік және қорғаныс', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/-%D0%B6%D3%99%D0%BD%D0%B5-%D2%9B%D0%BE%D1%80%D2%93%D0%B0%D0%BD%D1%8B%D1%81.mp3` },
  { title: 'Саяси еркіндік', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/-%D0%B5%D1%80%D0%BA%D1%96%D0%BD%D0%B4%D1%96%D0%BA-.mp3` },
  { title: 'Сот-құқықтық жүйесін реформалау', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/-%D2%9B%D2%B1%D2%9B%D1%8B%D2%9B%D1%82%D1%8B%D2%9B-%D0%B6%D2%AF%D0%B9%D0%B5%D1%81%D1%96%D0%BD-%D1%80%D0%B5%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D0%BB%D0%B0%D1%83.mp3` },
  { title: 'ҚХП сайлауалды бағдарламасы туралы', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/%20%D0%A1%D0%90%D0%99%D0%9B%D0%90%D0%A3%D0%90%D0%9B%D0%94%D0%AB%20%D0%91%D0%90%D2%92%D0%94%D0%90%D0%A0%D0%9B%D0%90%D0%9C%D0%90%D0%A1%D0%AB%20%D1%82%D1%83%D1%80%D0%B0%D0%BB%D1%8B.mp3` },
  { title: 'Неге жастар саясатпен айналысуы керек?', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/08_NPK_Islam_kz%20%D0%9D%D0%B5%D0%B3%D0%B5%20%D0%B6%D0%B0%D1%81%D1%82%D0%B0%D1%80%20%D1%81%D0%B0%D1%8F%D1%81%D0%B0%D1%82%D0%BF%D0%B5%D0%BD%20%D0%B0%D0%B9%D0%BD%D0%B0%D0%BB%D1%8B%D1%81%D1%83%20%D0%BA%D0%B5%D1%80%D0%B5%D0%BA.mp3` },
  { title: 'Дауыс қалай беріледі?', lang: 'kz', src: `${OLD_SITE}/storage/app/media/MP3/57npkislam-03-dauys-kalay-beriledi.mp3` },
];

export function PodcastPage() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const visibleEpisodes = episodes.filter((episode) => episode.lang === language);

  return (
    <main className="min-h-screen bg-bg text-text-base">
      <section className="max-w-[1180px] mx-auto px-5 md:px-11 pt-16 md:pt-24 pb-10 md:pb-14">
        <p className="text-[13px] font-bold tracking-[0.16em] uppercase text-accent-brand">
          {isKz ? 'Аудиожоба' : 'Аудиопроект'}
        </p>
        <h1 className="mt-4 text-[clamp(38px,7vw,76px)] leading-[0.98] font-bold tracking-[-0.035em]">
          {isKz ? 'Халық подкасты' : 'Народный подкаст'}
        </h1>
        <p className="mt-6 max-w-[700px] text-[17px] md:text-[19px] leading-relaxed text-text-muted">
          {isKz
            ? 'Партия өкілдерімен ел дамуы, әлеуметтік саясат және қоғамды толғандыратын мәселелер туралы әңгімелер.'
            : 'Разговоры с представителями партии о развитии страны, социальной политике и вопросах, которые волнуют общество.'}
        </p>
      </section>

      <section className="max-w-[1180px] mx-auto px-5 md:px-11 pb-20 grid sm:grid-cols-2 gap-4 md:gap-6">
        {visibleEpisodes.map((episode, index) => (
          <article key={episode.src} className="border border-line bg-surface p-5 md:p-7 min-w-0">
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 shrink-0 bg-accent-brand text-white flex items-center justify-center">
                <Headphones size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium tracking-[0.12em] uppercase text-text-muted">
                  {isKz ? `${index + 1}-шығарылым` : `Выпуск ${index + 1}`}
                </p>
                <h2 className="mt-2 text-[19px] leading-snug font-bold break-words">{episode.title}</h2>
              </div>
            </div>
            <audio className="mt-6 w-full max-w-full" src={episode.src} controls preload="none" />
          </article>
        ))}
      </section>
    </main>
  );
}
