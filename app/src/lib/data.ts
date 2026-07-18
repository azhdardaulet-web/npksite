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
  { id: 'almaty',      name: 'Алматы (г.)',                      chairman: 'Кусаинов Бейбут Булатович',        address: '050000, г. Алматы, ул. Қазыбек би 22, БЦ Жан-Ер, офис 222',                              phone: '+7 778 788 2034', email: 'halykparty_almaty@qhp.kz' },
  { id: 'astana',     name: 'Астана (г.)',                       chairman: 'Оразханов Нұрдәулет Амантайұлы',   address: '010000, г. Астана, ул. Желтоксан, 16, НП 2',                                              phone: '+7 702 796 4570', email: 'halykparty_astana@qhp.kz' },
  { id: 'shymkent',  name: 'Шымкент (г.)',                      chairman: 'Умаров Баймырза Абденбаевич (и.о.)', address: '160011, г. Шымкент, ул. Д. Кунаева 20/1',                                                  phone: '—',               email: 'halykparty_shymkent@qhp.kz' },
  { id: 'akmola',    name: 'Акмолинская обл.',                  chairman: 'Тастамбеков Арман Зейнуллаевич',   address: '020000, г. Кокшетау, ул. М. Дулатулы, 31',                                               phone: '+7 775 212 9293', email: 'halykparty_akmola@mail.ru' },
  { id: 'aktobe',    name: 'Актюбинская обл.',                  chairman: 'Курмангазин Бауыржан Олжашевич',   address: '030002, г. Актобе, ул. Мангилик Ел, здание 7 «Б», каб. 603',                            phone: '+7 778 803 3848', email: 'halykparty_aktobe@qhp.kz' },
  { id: 'almaty-obl',name: 'Алматинская обл.',                  chairman: 'Дудабаев Еркебулан Бакытович (и.о.)', address: '040800, г. Конаев, ул. Достык, 5, каб. 20',                                              phone: '—',               email: 'halykparty_almaty_obl@qhp.kz' },
  { id: 'atyrau',    name: 'Атырауская обл.',                   chairman: 'Досмухамбетова Балжан Ибатовна',   address: '060000, г. Атырау, ул. М. Утемисова 134 А, БЦ «Евразия», 5 этаж',                      phone: '+7 778 485 4437', email: 'halykparty_atyrau@qhp.kz' },
  { id: 'vko',       name: 'Восточно-Казахстанская обл.',       chairman: 'Мусин Кайрат Маратович',           address: '070000, г. Усть-Каменогорск, ул. М. Горького, 46, офис 211',                            phone: '+7 7232 24 4648', email: 'halykparty_vko@qhp.kz' },
  { id: 'jetisu',    name: 'Жетысуская обл.',                   chairman: 'Ибраимов Олжас Бекдаулетович',     address: '040000, г. Талдыкорган, пр. Н. Назарбаева, 44, каб. 22',                                phone: '+7 701 149 9555', email: 'halykparty_taldykorgan@qhp.kz' },
  { id: 'zhambyl',   name: 'Жамбылская обл.',                   chairman: 'Аккозиев Рахман Сейлханович',      address: '080000, г. Тараз, ул. Казыбек би, 109А, офис 3',                                         phone: '—',               email: 'halykparty_zhambyl@qhp.kz' },
  { id: 'zko',       name: 'Западно-Казахстанская обл.',        chairman: 'Лаврентьев Борис Георгиевич',      address: '090000, г. Уральск, ул. Ихсанова, 38, каб. 207',                                         phone: '+7 7112 25 3445', email: 'halykparty_zko@mail.ru' },
  { id: 'karaganda', name: 'Карагандинская обл.',               chairman: 'Максутов Калел Мухатаевич',        address: '100000, г. Караганда, ул. Алиханова, 5, каб. 300–302',                                   phone: '+7 701 512 5129', email: 'halykparty_karaganda@qhp.kz' },
  { id: 'kostanay',  name: 'Костанайская обл.',                 chairman: 'Березуцкая Ольга Ивановна',        address: '110000, г. Костанай, ул. Байтурсынова, 95, каб. 332, 333',                              phone: '+7 7142 53 4571', email: 'halykparty.kostanai@mail.ru' },
  { id: 'abay',      name: 'Область Абай',                      chairman: '—',                                address: 'г. Семей, ул. Мәңгілік ел 9, каб. 310',                                                  phone: '—',               email: 'halykparty.semey@mail.ru' },
  { id: 'kyzylorda', name: 'Кызылординская обл.',               chairman: 'Ерназаров Кайрат Шаршыбекович',    address: '120000, г. Кызылорда, ул. Кунаева 10, 1 этаж, офис 1, 2',                              phone: '+7 700 500 3484', email: 'halykparty_kyzylorda@qhp.kz' },
  { id: 'mangistau', name: 'Мангистауская обл.',                chairman: 'Тулеугалиев Рашид Бектурович (и.о.)', address: '130000, г. Актау, 14 мкр, зд. 61/1, БЦ «Звезда Актау», каб. 305',                    phone: '+7 778 572 0073', email: 'halykparty_mangistau@qhp.kz' },
  { id: 'pavlodar',  name: 'Павлодарская обл.',                 chairman: 'Агибаев Алимбек Тулегенович (и.о.)', address: '140000, г. Павлодар, ул. Маргулана, 110, офис 4',                                       phone: '+7 701 756 9763', email: 'halykparty.pavlodar@mail.ru' },
  { id: 'nko',       name: 'Северо-Казахстанская обл.',         chairman: 'Жумагулов Ергали Сергалиевич',     address: '150000, г. Петропавловск, ул. Ы. Алтынсарина 166, офис 405',                           phone: '+7 7152 36 5916', email: 'halykparty_sko@mail.ru' },
  { id: 'turkestan', name: 'Туркестанская обл.',                chairman: 'Камбарова Зухра Медеуовна',        address: '161200, г. Туркестан, ул. Б. Саттарханова, 45',                                          phone: '+7 775 315 2007', email: 'halykparty_turkestan@qhp.kz' },
  { id: 'ulytau',    name: 'Улытауская обл.',                   chairman: 'Максутов Калел Мухатаевич',        address: '100600, г. Жезказган, пр. Алаша-Хана 37А, 2 этаж, офис 2',                             phone: '+7 777 629 5454', email: 'halykparty_ulytau@mail.ru' },
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

export const ELECTION_DATE = new Date('2026-08-23T00:00:00+06:00');
