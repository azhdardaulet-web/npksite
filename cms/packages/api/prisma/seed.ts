import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding НПК CMS database...');

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = 'admin@npk.kz';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Администратор',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);
    console.log(`   Password: ChangeMe123! — CHANGE THIS IMMEDIATELY`);

    // ─── Sample published news ───────────────────────────────────────────────
    const news = await prisma.news.create({
      data: {
        slug: 'npk-nachinaet-rabotu-s-obrashcheniyami-grazhdan',
        format: 'news',
        status: 'PUBLISHED',
        imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600',
        readingTime: 2,
        publishedAt: new Date(),
        authorId: admin.id,
        translations: {
          create: [
            {
              lang: 'ru',
              title: 'НПК запускает новую систему приёма обращений граждан',
              excerpt: 'Партия запускает обновлённую общественную приёмную для обращений граждан.',
              content:
                '<p>Народная партия Казахстана запускает обновлённую систему обработки заявок на вступление и обращений граждан.</p>',
              seoTitle: 'НПК — новая система приёма обращений',
              seoDescription: 'Партия запускает обновлённую общественную приёмную для обращений граждан.',
            },
            {
              lang: 'kz',
              title: 'ХНП азаматтардың өтініштерін қабылдаудың жаңа жүйесін іске қосады',
              excerpt: 'Партия азаматтардың өтініштері үшін жаңартылған қоғамдық қабылдау бөлмесін іске қосады.',
              content:
                '<p>Қазақстан Халық партиясы мүшелікке өтініштерді және азаматтардың өтініштерін өңдеудің жаңартылған жүйесін іске қосады.</p>',
            },
          ],
        },
      },
    });
    console.log(`✅ Sample news created: "${news.slug}"`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // ─── Default pages ───────────────────────────────────────────────────────
  const pageSlugs = ['home', 'about', 'faction', 'contacts', 'footer'];
  for (const slug of pageSlugs) {
    const existingPage = await prisma.page.findUnique({ where: { slug } });
    if (!existingPage) {
      await prisma.page.create({
        data: {
          slug,
          isPublished: true,
          translations: {
            create: [
              { lang: 'ru', title: slug.charAt(0).toUpperCase() + slug.slice(1) },
              { lang: 'kz', title: slug.charAt(0).toUpperCase() + slug.slice(1) },
            ],
          },
        },
      });
      console.log(`✅ Page created: /${slug}`);
    }
  }

  // ─── Темы обращений (AppealTopic) ─────────────────────────────────────────
  const appealTopics: Array<{ nameRu: string; nameKz: string }> = [
    { nameRu: 'Общий вопрос', nameKz: 'Жалпы сұрақ' },
    { nameRu: 'Социальная помощь', nameKz: 'Әлеуметтік көмек' },
    { nameRu: 'ЖКХ и инфраструктура', nameKz: 'ТКШ және инфрақұрылым' },
    { nameRu: 'Образование', nameKz: 'Білім беру' },
    { nameRu: 'Медицина', nameKz: 'Медицина' },
    { nameRu: 'Труд и занятость', nameKz: 'Еңбек және жұмыспен қамту' },
    { nameRu: 'Другое', nameKz: 'Басқа' },
  ];

  const existingTopics = await prisma.appealTopic.count();
  if (existingTopics === 0) {
    for (const [i, topic] of appealTopics.entries()) {
      await prisma.appealTopic.create({
        data: { nameRu: topic.nameRu, nameKz: topic.nameKz, sortOrder: i },
      });
    }
    console.log(`✅ AppealTopic seeded: ${appealTopics.length} тем`);
  } else {
    console.log('ℹ️  AppealTopic уже заполнены');
  }

  // ─── Миграция хардкода из app/src/lib/data.ts и страниц сайта ─────────────
  // NB: реальных казахских переводов исходный хардкод не содержал — плейсхолдер
  // KZ временно дублирует RU-текст, отредактировать в CMS после запуска.

  // Кандидаты (app/src/lib/data.ts → candidates)
  const candidatesData = [
    { name: 'Ерлан Смагулов', region: 'Алматы', district: 'Округ №4', promise: 'Доступное жилье для каждой семьи. Строительство 10 000 квартир по социальной ипотеке.', photoUrl: '/images/candidate-1.jpg' },
    { name: 'Айгуль Нурланова', region: 'Астана', district: 'Округ №1', promise: 'Бесплатное техническое и профессиональное образование для всех абитуриентов.', photoUrl: '/images/candidate-2.jpg' },
    { name: 'Марат Бекетов', region: 'Шымкент', district: 'Округ №2', promise: 'Повышение пенсий и социальных пособий на 25% в первый год работы.', photoUrl: '/images/candidate-3.jpg' },
    { name: 'Гульнара Таспихова', region: 'Карагандинская', district: 'Округ №7', promise: 'Развитие угольной и металлургической промышленности региона.', photoUrl: '/images/candidate-4.jpg' },
    { name: 'Данияр Куатбеков', region: 'Туркестанская', district: 'Округ №12', promise: 'Строительство новых школ и больниц в сельских районах области.', photoUrl: '/images/candidate-5.jpg' },
    { name: 'Сауле Аманжолова', region: 'Алматинская', district: 'Округ №5', promise: 'Поддержка сельхозпроизводителей и развитие агропромышленного комплекса.', photoUrl: '/images/candidate-6.jpg' },
  ];
  if ((await prisma.candidate.count()) === 0) {
    for (const [i, c] of candidatesData.entries()) {
      await prisma.candidate.create({
        data: {
          name: c.name,
          region: c.region,
          district: c.district,
          photoUrl: c.photoUrl,
          sortOrder: i,
          translations: { create: [{ lang: 'ru', promise: c.promise }, { lang: 'kz', promise: c.promise }] },
        },
      });
    }
    console.log(`✅ Candidate seeded: ${candidatesData.length}`);
  } else {
    console.log('ℹ️  Candidate уже заполнены');
  }

  // Филиалы (app/src/lib/data.ts → regions, объединены в Branch)
  const branchesData = [
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
  if ((await prisma.branch.count()) === 0) {
    for (const [i, b] of branchesData.entries()) {
      await prisma.branch.create({
        data: {
          cityRu: b.name,
          cityKz: b.name,
          addressRu: b.address,
          addressKz: b.address,
          phone: b.phone,
          email: `${b.id}@npk.kz`,
          chairman: b.chairman,
          sortOrder: i,
        },
      });
    }
    console.log(`✅ Branch seeded: ${branchesData.length}`);
  } else {
    console.log('ℹ️  Branch уже заполнены');
  }

  // Руководство партии (app/src/pages/LeadershipPage.tsx → TeamMember, group=LEADERSHIP)
  const leadersData = [
    { name: 'Ерлан Кошанов', role: 'Председатель партии', bio: 'Опытный государственный деятель с 25-летним стажем работы в органах власти.' },
    { name: 'Гульшара Абдыкаликова', role: 'Заместитель председателя', bio: 'Экс-аким Кызылординской области, депутат Мажилиса нескольких созывов.' },
    { name: 'Марат Бекетов', role: 'Руководитель фракции', bio: 'Депутат Мажилиса, председатель комитета по социальным вопросам.' },
    { name: 'Айгуль Нурланова', role: 'Пресс-секретарь', bio: 'Журналист, медиа-эксперт, руководитель информационной службы партии.' },
  ];
  if ((await prisma.teamMember.count({ where: { group: 'LEADERSHIP' } })) === 0) {
    for (const [i, l] of leadersData.entries()) {
      await prisma.teamMember.create({
        data: {
          group: 'LEADERSHIP',
          sortOrder: i,
          translations: {
            create: [
              { lang: 'ru', name: l.name, position: l.role, bio: l.bio },
              { lang: 'kz', name: l.name, position: l.role, bio: l.bio },
            ],
          },
        },
      });
    }
    console.log(`✅ TeamMember (LEADERSHIP) seeded: ${leadersData.length}`);
  } else {
    console.log('ℹ️  TeamMember (LEADERSHIP) уже заполнены');
  }

  // История партии (app/src/pages/HistoryPage.tsx → HistoryEvent)
  const historyData = [
    { year: 2011, title: 'VI внеочередной съезд КНПК', text: '26 ноября 2011 года состоялся VI внеочередной съезд Коммунистической народной партии Казахстана, на котором были утверждены 23 кандидата от партии на выборы депутатов мажилиса парламента 2012 года, в том числе лидер партии Владислав Косарев и кандидат в президенты на выборах 2011 года Жамбыл Ахметбеков.', imageUrl: '/images/history/2011.jpg' },
    { year: 2016, title: 'Проход в парламент', text: 'КНПК по результатам выборов-2016 прошла в парламент. Предвыборную борьбу в партии оценили как честную и справедливую. Доступ к СМИ, по мнению коммунистов, был свободным для всех партий. Каких-либо нарушений наблюдатели от НПК не зафиксировали.', imageUrl: '/images/history/2016.jpg' },
    { year: 2020, title: 'Переименование в Народную партию', text: 'На прошедшем 11 ноября 2020 года XV Внеочередном съезде КНПК было принято решение о переименовании Коммунистической Народной партии Казахстана в Народную партию Казахстана со внесением соответствующих изменений в устав и программу партии. Данное решение было обосновано желанием расширить электоральную поддержку партии перед выборами в Мажилис Парламента Республики Казахстан, которые прошли 10 января 2021 года.', imageUrl: '/images/history/2020.jpg' },
    { year: 2021, title: 'XVII Съезд и фракция в Мажилисе', text: 'В Нур-Султане состоялся XVII Внеочередной Съезд Народной партии Казахстана. В ходе него партийцы подвели итоги прошедших выборов 2021 года депутатов Мажилиса Парламента РК и маслихатов, а также избрали представителей в парламентскую фракцию партии. В число депутатов вошли Айкын Конуров, Жамбыл Ахметбеков, Ирина Смирнова, Александр Милютин, Сергей Решетников, Айбек Паяев, Газиз Кулахметов, Ерлан Смайлов, Файзолла Каменов и Айжан Скакова.', imageUrl: '/images/history/2021.jpg' },
    { year: 2022, title: 'Новое руководство партии', text: '28 марта 2022 года на XIX внеочередном съезде партии председателем НПК был избран Ермухамет Ертысбаев. Прежний руководитель, глава парламентской фракции НПК, депутат Мажилиса Айкын Конуров стал первым заместителем председателя.', imageUrl: '/images/history/2022.jpg' },
    { year: 2026, title: 'Съезд партии, новый председатель', text: 'Председатель Народной партии Казахстана Ермухамет Ертысбаев снял с себа руководящие полномочия. Новым главой НПК избран Нурсултан Шоканов. Такое решение принял внеочередной Съезд партии, состоявшийся 27 июня.', imageUrl: '/images/history/2026.jpg' },
  ];
  if ((await prisma.historyEvent.count()) === 0) {
    for (const [i, h] of historyData.entries()) {
      await prisma.historyEvent.create({
        data: {
          year: h.year,
          imageUrl: h.imageUrl,
          sortOrder: i,
          translations: {
            create: [
              { lang: 'ru', title: h.title, text: h.text },
              { lang: 'kz', title: h.title, text: h.text },
            ],
          },
        },
      });
    }
    console.log(`✅ HistoryEvent seeded: ${historyData.length}`);
  } else {
    console.log('ℹ️  HistoryEvent уже заполнены');
  }

  // Программа партии (app/src/pages/ProgramPage.tsx → ProgramBlock)
  const programData = [
    { n: 1, keyword: 'ТРУД', title: 'Человек труда', lead1: 'Страна держится не на должностях.', lead2: 'Страна держится на людях труда.', points: ['Рабочие профессии — почёт, уважение и достойный доход', 'Национальная программа «Человек труда»', 'Жилищные, образовательные и соцпрограммы для рабочих, инженеров, учителей, врачей', 'Рост производительности = рост зарплат', 'Государство защищает права каждого работника', 'Новые профессии — через массовую переподготовку кадров'] },
    { n: 2, keyword: 'СЛОВО', title: 'Государство, которое держит слово', lead1: 'Если принимаются законы — они должны работать.', lead2: 'Если даются обещания — они должны выполняться.', points: ['Государство держит слово', 'Человек важнее отчёта', 'Оценка чиновников — только по реальной жизни людей', 'Персональная ответственность за каждую госпрограмму', 'Открытый бюджет: каждый тенге на виду у общества', 'Общественный контроль и прозрачность решений'] },
    { n: 3, keyword: 'ЗАКОН', title: 'Справедливость работает', lead1: 'Один закон для всех.', lead2: 'Не должность. Не влияние. Только закон.', points: ['Закон одинаков для всех — от гражданина до чиновника', 'Успех зависит от знаний и труда, не от связей', 'Справедливость — не лозунг, а основа государственной политики', 'Территориальная справедливость: одинаковые возможности в каждом регионе', 'Рост экономики должен ощущаться в жизни каждой семьи'] },
    { n: 4, keyword: 'ЛЮДИ', title: 'Экономика для людей', lead1: 'Экономика должна работать не ради отчётов —', lead2: 'ради человека.', points: ['Главная цель — рост доходов и благополучия семей', 'Честная конкуренция без административных привилегий', 'Сильный средний класс — стратегическая цель государства', 'Новые рабочие места во всех регионах страны', 'Предпринимательство — главная социальная сила', 'Природные богатства — на образование, медицину, инфраструктуру'] },
    { n: 5, keyword: 'ЖИЛЬЁ', title: 'Жильё для работающей семьи', lead1: 'Собственное жильё — не мечта.', lead2: 'Это достижимая цель работающей семьи.', points: ['Народная ипотека для работающих семей, молодых специалистов, учителей и врачей', 'Доступная аренда с правом выкупа', 'Жилищное строительство по всей стране — не только в мегаполисах', 'Прозрачные и понятные жилищные программы без бюрократии', 'Жильё — инвестиция в демографию и стабильность страны'] },
    { n: 6, keyword: 'ЗНАНИЯ', title: 'Образование и социальные лифты', lead1: 'Будущее ребёнка не должно зависеть', lead2: 'от почтового индекса его дома.', points: ['Образование — главный инструмент справедливости возможностей', 'Качественная школа — в каждом городе и ауле страны', 'Развитие технического и профессионального образования', 'Обучение на протяжении всей жизни — норма нового времени', 'Поддержка талантливой молодёжи из всех регионов', 'Молодёжь строит будущее через знания, а не знакомства'] },
    { n: 7, keyword: 'РЕГИОНЫ', title: 'Сильные регионы — сильный Казахстан', lead1: 'Не должно быть Казахстана', lead2: 'первого и второго сорта.', points: ['Рабочие места — рядом с домом', 'Доступная медицина в каждом районном центре', 'Современная школа, дорога, интернет — по всей стране', 'Малые города — полноценные участники экономического роста', 'Молодёжь должна видеть будущее в своём регионе', 'Новые центры роста по всей территории Казахстана'] },
    { n: 8, keyword: 'БУДУЩЕЕ', title: 'Экономика будущего', lead1: 'Будущее нельзя ждать.', lead2: 'Его нужно создавать.', points: ['Казахстан — региональный лидер в области искусственного интеллекта', 'Технологии должны работать на человека, не наоборот', 'От сырьевой экономики — к экономике знаний', 'Переподготовка кадров для профессий нового времени', 'Технологический суверенитет — через инвестиции в людей', 'Инновационные кластеры и технопарки по всей стране'] },
    { n: 9, keyword: 'ЗДОРОВЬЕ', title: 'Здоровье и достойная жизнь', lead1: 'Никто не должен становиться', lead2: 'беднее из-за болезни.', points: ['Доступная медицина — базовое право каждого гражданина', 'Единые стандарты медицинской помощи от аула до столицы', 'Первичная медицина, профилактика и ранняя диагностика', 'Здоровый образ жизни и массовый спорт для граждан всех возрастов', 'Достойный статус, условия труда и оплата для врачей и медсестёр', 'Современная медицинская инфраструктура и цифровизация', 'Активное долголетие и уважение к старшему поколению'] },
    { n: 10, keyword: 'СЕМЬЯ', title: 'Семья и дети', lead1: 'Сильная семья — сильная страна.', lead2: 'Дети — главный национальный капитал.', points: ['Поддержка семьи — ключевой приоритет государственной политики', 'Условия для жилья, работы и воспитания детей у молодых семей', 'Рождение ребёнка не должно становиться источником трудностей', 'Детские сады, секции, кружки и творческие программы — каждому ребёнку', 'Каждый ребёнок раскрывает талант независимо от дохода и региона', 'Родители не должны выбирать между карьерой и воспитанием детей', 'Ответственное родительство и семейные ценности'] },
  ];
  if ((await prisma.programBlock.count()) === 0) {
    for (const [i, p] of programData.entries()) {
      await prisma.programBlock.create({
        data: {
          n: p.n,
          keyword: p.keyword,
          sortOrder: i,
          translations: {
            create: [
              { lang: 'ru', title: p.title, lead1: p.lead1, lead2: p.lead2, points: p.points },
              { lang: 'kz', title: p.title, lead1: p.lead1, lead2: p.lead2, points: p.points },
            ],
          },
        },
      });
    }
    console.log(`✅ ProgramBlock seeded: ${programData.length}`);
  } else {
    console.log('ℹ️  ProgramBlock уже заполнены');
  }

  // Медиапроекты (app/src/pages/MediaPage.tsx → MediaProject)
  const mediaProjectsData = [
    { tag: 'Информационная программа', title: '«Ақпар»', description: 'Главные события страны и мира — коротко, честно и по делу. Информационный пульс партии.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA' },
    { tag: 'Парламентская жизнь', title: '«Фракция покажет»', description: 'Как депутаты фракции отстаивают интересы народа в Парламенте — без бюрократического тумана.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA' },
    { tag: 'Репортажи с мест', title: '«Регионы Аймақтар»', description: 'Реальная жизнь регионов Казахстана: проблемы, люди и решения — от аула до мегаполиса.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA' },
  ];
  if ((await prisma.mediaProject.count()) === 0) {
    for (const [i, m] of mediaProjectsData.entries()) {
      await prisma.mediaProject.create({
        data: {
          tag: m.tag,
          url: m.url,
          sortOrder: i,
          translations: {
            create: [
              { lang: 'ru', title: m.title, description: m.description },
              { lang: 'kz', title: m.title, description: m.description },
            ],
          },
        },
      });
    }
    console.log(`✅ MediaProject seeded: ${mediaProjectsData.length}`);
  } else {
    console.log('ℹ️  MediaProject уже заполнены');
  }

  // СМИ о нас (app/src/pages/SmiPage.tsx → MediaPublication)
  const smiData = [
    { date: '29.06.2026', sourceType: 'Телевидение', mediaName: 'Хабар 24', title: 'НПК назвала главным приоритетом повышение благосостояния граждан', excerpt: 'Председатель партии в интервью Хабар 24 рассказал о ключевых целях нового политсезона.', imageUrl: '/images/marquee-1.jpg' },
    { date: '27.06.2026', sourceType: 'Интернет-СМИ', mediaName: 'Tengrinews.kz', title: 'Народная партия — новый лидер казахстанской политики', excerpt: 'Эксперты оценивают перспективы Народной партии после смены руководства.', imageUrl: '/images/marquee-2.jpg' },
    { date: '26.06.2026', sourceType: 'Газеты', mediaName: 'Казахстанская правда', title: 'НПК предложила системные реформы в здравоохранении', excerpt: 'Фракция Народной партии внесла пакет законопроектов по реформированию медицины.', imageUrl: '/images/marquee-3.jpg' },
    { date: '26.06.2026', sourceType: 'Информагентства', mediaName: 'КазИнформ', title: 'Новый съезд — новые цели: партия обновила устав', excerpt: 'На внеочередном съезде делегаты приняли обновлённый устав партии.', imageUrl: '/images/marquee-4.jpg' },
    { date: '25.06.2026', sourceType: 'Радио', mediaName: 'Европа Плюс Казахстан', title: 'Эфир с лидером: НПК об экономической повестке', excerpt: 'Председатель НПК выступил в прямом эфире радиостанции Европа Плюс Казахстан.', imageUrl: '/images/marquee-5.jpg' },
    { date: '24.06.2026', sourceType: 'Интернет-СМИ', mediaName: 'Zakon.kz', title: 'Рейтинг НПК вырос на 12 пунктов по итогам съезда', excerpt: 'Социологические данные показывают резкий рост доверия к партии.', imageUrl: '/images/candidate-1.jpg' },
    { date: '23.06.2026', sourceType: 'Телевидение', mediaName: 'QazaqTV', title: 'Программа НПК — практика, а не слова', excerpt: 'Аналитический материал телеканала о реализованных инициативах партии.', imageUrl: '/images/candidate-2.jpg' },
    { date: '22.06.2026', sourceType: 'Газеты', mediaName: 'Егемен Қазақстан', title: 'Фракция НПК защищает права простых казахстанцев', excerpt: 'Депутаты от Народной партии активно работают с обращениями граждан в Мажилисе.', imageUrl: '/images/candidate-3.jpg' },
    { date: '21.06.2026', sourceType: 'Информагентства', mediaName: 'BNews.kz', title: 'НПК открыла новые региональные представительства', excerpt: 'Партия расширяет присутствие в регионах Казахстана.', imageUrl: '/images/marquee-1.jpg' },
    { date: '20.06.2026', sourceType: 'Интернет-СМИ', mediaName: 'Forbes Kazakhstan', title: 'Эксперты: позиции НПК укрепятся к выборам 2027 года', excerpt: 'Политологи прогнозируют рост влияния партии на парламентских выборах.', imageUrl: '/images/marquee-2.jpg' },
    { date: '19.06.2026', sourceType: 'Радио', mediaName: 'Радио NS', title: 'Народная партия о жилищном вопросе', excerpt: 'Развёрнутое интервью с депутатом фракции о программе доступного жилья.', imageUrl: '/images/news-1.jpg' },
    { date: '17.06.2026', sourceType: 'Газеты', mediaName: 'Литер', title: 'НПК наращивает работу с молодёжью', excerpt: 'Партия запустила новые молодёжные проекты и открыла клубы в вузах.', imageUrl: '/images/news-2.jpg' },
  ];
  if ((await prisma.mediaPublication.count()) === 0) {
    for (const [i, s] of smiData.entries()) {
      const [day, month, year] = s.date.split('.');
      await prisma.mediaPublication.create({
        data: {
          date: new Date(`${year}-${month}-${day}T00:00:00+06:00`),
          sourceType: s.sourceType,
          mediaName: s.mediaName,
          title: s.title,
          excerpt: s.excerpt,
          imageUrl: s.imageUrl,
          sortOrder: i,
        },
      });
    }
    console.log(`✅ MediaPublication seeded: ${smiData.length}`);
  } else {
    console.log('ℹ️  MediaPublication уже заполнены');
  }

  // Отзывы граждан (app/src/lib/data.ts → testimonials)
  const testimonialsData = [
    { quote: 'Помогли решить вопрос с отоплением в нашем доме за 3 дня. Настоящая народная партия!', author: 'Айгуль К., Алматы' },
    { quote: 'Благодаря приёмной получил положенную льготу на лекарства. Спасибо за помощь.', author: 'Бауыржан М., Астана' },
    { quote: 'Обратилась по вопросу детского сада — через неделю проблема была решена.', author: 'Гульмира Т., Шымкент' },
  ];
  if ((await prisma.testimonial.count()) === 0) {
    for (const [i, t] of testimonialsData.entries()) {
      await prisma.testimonial.create({ data: { ...t, sortOrder: i } });
    }
    console.log(`✅ Testimonial seeded: ${testimonialsData.length}`);
  } else {
    console.log('ℹ️  Testimonial уже заполнены');
  }

  // Соцсети (app/src/pages/MediaPage.tsx SOCIALS → Setting, публично читаемые ключи)
  const socialSettings: Array<[string, string]> = [
    ['social_youtube', 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA'],
    ['social_tiktok', 'https://www.tiktok.com/@halyk_partiyasy'],
    ['social_instagram', 'https://www.instagram.com/halyk_partiyasy/'],
    ['social_facebook', 'https://www.facebook.com/halykpartiyasy'],
    ['social_telegram', 'https://t.me/halykparty'],
  ];
  for (const [key, value] of socialSettings) {
    const existingSetting = await prisma.setting.findUnique({ where: { key } });
    if (!existingSetting) {
      await prisma.setting.create({ data: { key, value } });
    }
  }
  console.log(`✅ Setting (соцсети) проверены/созданы: ${socialSettings.length}`);

  console.log('\n✨ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
