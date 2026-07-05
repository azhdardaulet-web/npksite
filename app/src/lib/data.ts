import type { Candidate, Region, NewsItem, Testimonial } from '@/types';

export const candidates: Candidate[] = [
  { id: 1, name: 'Ерлан Смагулов', region: 'Алматы', district: 'Округ №4', promise: 'Доступное жилье для каждой семьи. Строительство 10 000 квартир по социальной ипотеке.', photo: '/images/candidate-1.jpg' },
  { id: 2, name: 'Айгуль Нурланова', region: 'Астана', district: 'Округ №1', promise: 'Бесплатное техническое и профессиональное образование для всех абитуриентов.', photo: '/images/candidate-2.jpg' },
  { id: 3, name: 'Марат Бекетов', region: 'Шымкент', district: 'Округ №2', promise: 'Повышение пенсий и социальных пособий на 25% в первый год работы.', photo: '/images/candidate-3.jpg' },
  { id: 4, name: 'Гульнара Таспихова', region: 'Карагандинская', district: 'Округ №7', promise: 'Развитие угольной и металлургической промышленности региона.', photo: '/images/candidate-4.jpg' },
  { id: 5, name: 'Данияр Куатбеков', region: 'Туркестанская', district: 'Округ №12', promise: 'Строительство новых школ и больниц в сельских районах области.', photo: '/images/candidate-5.jpg' },
  { id: 6, name: 'Сауле Аманжолова', region: 'Алматинская', district: 'Округ №5', promise: 'Поддержка сельхозпроизводителей и развитие агропромышленного комплекса.', photo: '/images/candidate-6.jpg' },
];

export const regions: Region[] = [
  { id: 'astana', name: 'Астана', chairman: 'Нурлан Сагинтаев', address: 'пр. Кабанбай батыра, 18', phone: '+7 7172 70 12 34' },
  { id: 'almaty', name: 'Алматы', chairman: 'Бахытжан Жумагулов', address: 'пр. Назарбаева, 127', phone: '+7 727 330 45 67' },
  { id: 'shymkent', name: 'Шымкент', chairman: 'Габит Сыздыков', address: 'ул. Тауке хана, 42', phone: '+7 7252 41 89 01' },
  { id: 'abay', name: 'Абайская обл.', chairman: 'Серик Утегенов', address: 'г. Семей, пр. Независимости, 8', phone: '+7 7222 33 45 67' },
  { id: 'akmola', name: 'Акмолинская обл.', chairman: 'Ермек Кошербаев', address: 'г. Кокшетау, ул. Ауэзова, 93', phone: '+7 7162 25 67 89' },
  { id: 'aktobe', name: 'Актюбинская обл.', chairman: 'Онласын Укишев', address: 'г. Актобе, пр. Абилкайыр хана, 47', phone: '+7 7132 78 90 12' },
  { id: 'almaty-obl', name: 'Алматинская обл.', chairman: 'Канат Бозумбаев', address: 'г. Талдыкорган, пр. Бокейхана, 21', phone: '+7 7282 44 56 78' },
  { id: 'atyrau', name: 'Атырауская обл.', chairman: 'Нурлан Ногаев', address: 'г. Атырау, ул. Сатпаева, 15', phone: '+7 7122 31 23 45' },
  { id: 'vko', name: 'Восточно-Казахстанская обл.', chairman: 'Даниал Ахметов', address: 'г. Усть-Каменогорск, пр. Независимости, 45', phone: '+7 7232 65 43 21' },
  { id: 'zhambyl', name: 'Жамбылская обл.', chairman: 'Бердибек Сапарбаев', address: 'г. Тараз, пр. Тауелсиздик, 33', phone: '+7 7262 54 32 10' },
  { id: 'jetisu', name: 'Жетысуская обл.', chairman: 'Бейбит Искаков', address: 'г. Талгар, ул. Жетысу, 12', phone: '+7 72737 12 34 56' },
  { id: 'zko', name: 'Западно-Казахстанская обл.', chairman: 'Гали Искалиев', address: 'г. Уральск, пр. Назарбаева, 102', phone: '+7 7112 87 65 43' },
  { id: 'karaganda', name: 'Карагандинская обл.', chairman: 'Женис Касымбек', address: 'г. Караганда, бул. Нуркена, 11', phone: '+7 7212 43 21 09' },
  { id: 'kostanay', name: 'Костанайская обл.', chairman: 'Архимед Мухамбетов', address: 'г. Костанай, ул. Алтынсарина, 55', phone: '+7 7142 76 54 32' },
  { id: 'kyzylorda', name: 'Кызылординская обл.', chairman: 'Гульшара Абдыкаликова', address: 'г. Кызылорда, ул. Кырыкмольда, 28', phone: '+7 7242 98 76 54' },
  { id: 'mangistau', name: 'Мангистауская обл.', chairman: 'Нурлан Ногаев', address: 'г. Актау, 14 мкр, 32', phone: '+7 7292 34 56 78' },
  { id: 'pavlodar', name: 'Павлодарская обл.', chairman: 'Абылкаир Скаков', address: 'г. Павлодар, ул. Торайгырова, 61', phone: '+7 7182 56 78 90' },
  { id: 'nko', name: 'Северо-Казахстанская обл.', chairman: 'Кумар Аксакалов', address: 'г. Петропавловск, ул. Назарбаева, 140', phone: '+7 7152 67 89 01' },
  { id: 'turkestan', name: 'Туркестанская обл.', chairman: 'Умирзак Шукеев', address: 'г. Туркестан, пр. Б. Саттарханова, 7', phone: '+7 7253 45 67 89' },
  { id: 'ulytau', name: 'Улытауская обл.', chairman: 'Берик Уали', address: 'г. Жезказган, ул. Шугыла, 3', phone: '+7 7102 23 45 67' },
];

export const newsItems: NewsItem[] = [
  { id: 1, date: '18 июня 2026', title: 'НПК представила план строительства 50 новых школ в сельской местности', image: '/images/news-1.jpg', category: 'Образование', readTime: '5 мин' },
  { id: 2, date: '15 июня 2026', title: 'Сельхозпроизводители получат дополнительные субсидии на технику', image: '/images/news-2.jpg', category: 'Экономика', readTime: '3 мин' },
  { id: 3, date: '12 июня 2026', title: 'Народная приемная помогла решить более 850 обращений граждан', image: '/images/news-3.jpg', category: 'Приёмная', readTime: '4 мин' },
  { id: 4, date: '10 июня 2026', title: 'Фракция НПК инициировала закон о защите прав трудящихся', image: '/images/news-1.jpg', category: 'Фракция', readTime: '6 мин' },
  { id: 5, date: '7 июня 2026', title: 'Региональные отделения партии провели день открытых дверей', image: '/images/news-2.jpg', category: 'Регионы', readTime: '3 мин' },
  { id: 6, date: '4 июня 2026', title: 'НПК запустила программу бесплатной юридической помощи гражданам', image: '/images/news-3.jpg', category: 'Программа', readTime: '5 мин' },
];

export const testimonials: Testimonial[] = [
  { id: 1, quote: 'Помогли решить вопрос с отоплением в нашем доме за 3 дня. Настоящая народная партия!', author: 'Айгуль К., Алматы' },
  { id: 2, quote: 'Благодаря приёмной получил положенную льготу на лекарства. Спасибо за помощь.', author: 'Бауыржан М., Астана' },
  { id: 3, quote: 'Обратилась по вопросу детского сада — через неделю проблема была решена.', author: 'Гульмира Т., Шымкент' },
];

export const socialStats = [
  { platform: 'YouTube', subscribers: '285K', icon: 'youtube' },
  { platform: 'Instagram', subscribers: '420K', icon: 'instagram' },
  { platform: 'TikTok', subscribers: '195K', icon: 'tiktok' },
  { platform: 'Telegram', subscribers: '310K', icon: 'telegram' },
  { platform: 'Facebook', subscribers: '180K', icon: 'facebook' },
];

export const regionFilterTags = [
  'Все', 'Астана', 'Алматы', 'Шымкент', 'Абай', 'Акмолинская', 'Актюбинская',
  'Алматинская', 'Атырауская', 'Восточно-Казахстанская', 'Жамбылская',
  'Жетысуская', 'Западно-Казахстанская', 'Карагандинская', 'Костанайская',
  'Кызылординская', 'Мангистауская', 'Павлодарская', 'Северо-Казахстанская',
  'Туркестанская', 'Улытауская',
];

export const ELECTION_DATE = new Date('2026-07-01T00:00:00+06:00');
