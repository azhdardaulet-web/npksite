/**
 * Идемпотентное заполнение казахского контента из утверждённых источников.
 *
 * Источники пар берутся из app/src/i18n и SQL-файлов этапа 2. Если пары нет,
 * русское значение сохраняется как явный фолбэк — новых переводов скрипт не создаёт.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';
import ts from 'typescript';

const prisma = new PrismaClient();
const repositoryRoot = path.resolve(__dirname, '../../../..');
const migrationDirectory = path.join(repositoryRoot, 'supabase/migrations');

function loadDictionary(fileName: string, exportName: 'ru' | 'kz'): Record<string, string> {
  const source = fs.readFileSync(path.join(repositoryRoot, 'app/src/i18n', fileName), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} as Record<string, Record<string, string>> };
  Function('exports', 'module', compiled)(module.exports, module);
  return module.exports[exportName] ?? {};
}

const ru = loadDictionary('ru.ts', 'ru');
const kz = loadDictionary('kz.ts', 'kz');

const textMap = new Map<string, string>();
for (const key of Object.keys(ru)) {
  if (ru[key] !== kz[key]) textMap.set(ru[key], kz[key]);
}

function unescapeSql(value: string): string {
  return value.replace(/''/g, "'").replace(/\\n/g, '\n');
}

function addPairsFromMigration(fileName: string): void {
  const sql = fs.readFileSync(path.join(migrationDirectory, fileName), 'utf8');
  const pairPattern = /\(\s*(?:E)?'((?:''|[^'])*)'\s*,\s*(?:E)?'((?:''|[^'])*)'\s*\)/g;
  for (const match of sql.matchAll(pairPattern)) {
    textMap.set(unescapeSql(match[1] ?? ''), unescapeSql(match[2] ?? ''));
  }
}

addPairsFromMigration('202607190008_kz_news.sql');
addPairsFromMigration('202607190009_kz_page_blocks.sql');
addPairsFromMigration('202607190007_kz_site_settings.sql');

// Текущие формулировки CMS немного отличаются от ранней версии mapping.
textMap.set('Народная партия в цифрах', 'Қазақстан Халық партиясы сандармен');
textMap.set('Народная партия Казахстана в цифрах', 'Қазақстан Халық партиясы сандармен');
textMap.set('Написать напрямую', 'Тікелей жазу');
textMap.set('Онлайн приёмная', 'Онлайн қабылдау');
textMap.set('Ваш голос услышан. Ваша проблема не останется без ответа.', 'Сіздің даусыңыз естіледі. Мәселеңіз жауапсыз қалмайды.');
textMap.set('Вступить в партию', 'Партия қатарына қосылу');
textMap.set('Человек труда', 'Еңбек адамы');
textMap.set('Государство, которое держит слово', 'Уәдесіне берік мемлекет');
textMap.set('Один закон для всех', 'Заң бәріне ортақ');
textMap.set('Экономика для людей', 'Адамға қызмет ететін экономика');
textMap.set('Жильё для работающей семьи', 'Еңбек ететін отбасыға баспана');
textMap.set('Образование и социальные лифты', 'Білім және әлеуметтік өрлеу мүмкіндіктері');
textMap.set('Сильные регионы — сильный Казахстан', 'Қуатты өңірлер — қуатты Қазақстан');
textMap.set('Экономика будущего', 'Болашақ экономикасы');
textMap.set('Здоровье и семья', 'Денсаулық пен отбасы');
textMap.set('лет деятельности', 'жыл қызмет');
textMap.set('подписчиков официальных медиаресурсов', 'ресми медиаресурс жазылушысы');
textMap.set('региональных филиалов', 'өңірлік филиал');
textMap.set('депутатских запросов', 'депутаттық сауал');
textMap.set(
  'Мы собрали ключевые акценты новой политической программы Народной партии Казахстана: человек труда, справедливые возможности, ответственная власть, экономика для людей, поддержка семьи и будущее детей.',
  'Қазақстан Халық партиясының жаңа саяси бағдарламасындағы негізгі бағыттарды жинақтадық: еңбек адамы, әділ мүмкіндіктер, жауапты билік, адамға қызмет ететін экономика, отбасын қолдау және балалардың болашағы.',
);
textMap.set('Программа, которая касается каждого', 'Қазақстан Халық партиясының сайлауалды бағдарламасы');
textMap.set('Народное медиа,\nкоторому верит народ', 'Халық сенетін\nхалық медиасы');
textMap.set(
  'Полный цикл производства — от идеи и съёмки до монтажа и публикации. Собственная студия в сердце партии.',
  'Идея мен түсірілімнен бастап монтаждау мен жариялауға дейінгі толық өндіріс үдерісі. Партияның орталығында орналасқан өз студиямыз.',
);
textMap.set(
  'Подписывайтесь, участвуйте в обсуждениях и будьте в курсе ключевых событий.',
  'Жазылыңыз, талқылауларға қатысыңыз және басты оқиғалардан хабардар болыңыз.',
);
textMap.set('«Фракция покажет»', '«Фракция көрсетеді»');
textMap.set('«Регионы Аймақтар»', '«Өңірлер · Аймақтар»');
textMap.set('Главные события страны и мира — коротко, честно и по делу. Информационный пульс партии.', 'Ел мен әлемдегі басты оқиғалар — қысқа, ашық және нақты. Партияның ақпараттық тынысы.');
textMap.set('Как депутаты фракции отстаивают интересы народа в Парламенте — без бюрократического тумана.', 'Фракция депутаттары Парламентте халық мүддесін қалай қорғайды? Бюрократиялық тұмансыз түсіндіреміз.');
textMap.set('Реальная жизнь регионов Казахстана: проблемы, люди и решения — от аула до мегаполиса.', 'Қазақстан өңірлерінің шынайы өмірі: мәселелер, адамдар және шешімдер — ауылдан мегаполиске дейін.');

// Пары ниже дословно взяты с разрешённой казахской страницы прежнего сайта.
textMap.set('НАРОД!\nЗЕМЛЯ!\nСПРАВЕДЛИВОСТЬ!', 'ХАЛЫҚ!\nЖЕР!\nӘДІЛДІК!');
textMap.set('С кем мы и кто выступает в наших рядах', 'БІЗ КІММЕН БІРГЕМІЗ ЖӘНЕ ҚАТАРЫМЫЗҒА КІМДЕР ҚОСЫЛАДЫ');
textMap.set(
  'НПК выражает политическую волю многочисленного среднего класса нашей республики и представителей социально-уязвимых категорий населения. С нами трудящиеся и безработные, пенсионеры и молодежь, бюджетники и предприниматели, многодетные семьи и люди с инвалидностью. Словом, все те, кто стремится к социальной справедливости, к политическому и гендерному равенству, к правовой защите и развитию гражданского общества.',
  'ҚХП республикамыздағы көптеген орта таптың және халықтың әлеуметтік осал топтары өкілдерінің саяси ерік-жігерін білдіреді. Қарапайым еңбек адамы мен жұмыссыздар, зейнеткерлер мен жастар, бюджеттік қызметкерлер мен кәсіпкерлер, көпбалалы отбасылар мен мүгедектігі бар адамдар бізбен бірге. Бір сөзбен айтқанда, әлеуметтік әділеттілікке, саяси және гендерлік теңдікке, құқықтық қорғауға және азаматтық қоғамды дамытуға ұмтылатындардың барлығы бізбен бірге бір сапта.',
);
textMap.set('Методы партии', 'ПАРТИЯНЫҢ ӘДІС-ТӘСІЛДЕРІ');
textMap.set(
  'Представители НПК принимают самое активное участие в политических процессах, происходящих в Казахстане. Наши партийцы трудятся в представительных и исполнительных органах государственной власти, избираются в органы местного самоуправления, на должности акимов и в состав Парламента, чтобы продвигать партийные инициативы, направленные на отстаивание интересов народа и построение гуманного, цивилизованного социально-ориентированного общества.',
  'ҚХП өкілдері - Қазақстанда болып жатқан саяси процестерге ең белсенді түрде қатысатындардың бірі. Біздің партияластарымыз мемлекеттік биліктің өкілетті және атқарушы органдарында еңбек етеді, халықтың мүддесін қорғауға және адамгершілікті негізге алған, өркениетті әлеуметтік бағдарланған қоғам құруға бағытталған партиялық бастамаларды ілгерілету үшін жергілікті өзін-өзі басқару органдарына, әкімдер лауазымдарына және Парламент құрамына сайланады.',
);
textMap.set('Структура партии', 'ПАРТИЯНЫҢ ҚҰРЫЛЫМЫ');
textMap.set(
  'Деятельность НПК осуществляется на всей территории Республики Казахстан. Во всех областях, а также в мегаполисах, функционируют партийные филиалы, представительства и первичные парторганизации (ячейки).',
  'ҚХП-ның қызметі Қазақстан Республикасының бүкіл аумағында жүзеге асырылады. Барлық облыстарда, сондай-ақ мегаполистерде партиялық филиалдар, өкілдіктер және бастауыш партия ұйымдары (ұяшықтар) жұмыс істейді.',
);
textMap.set('Наша цель —\nобщество\nподлинного\nнародовластия', 'БІЗДІҢ МАҚСАТЫМЫЗ —\nШЫНАЙЫ\nХАЛЫҚ БИЛІГІ\nҚОҒАМЫ');
textMap.set(
  'Целью деятельности НПК является движение к обществу социальной справедливости, широкой духовности, свободы и процветающей экономики на базе научно-технического прогресса. Центром такого общества должен стать человек, наделенный полнотой гражданских прав и имеющий широкие возможности для самореализации.\n\nНаша задача — построить мирным гражданским путем сильное, жизнеспособное, светское, правовое и социальное государство, высшей ценностью которого является жизнь каждого казахстанца, его права и свободы.',
  'ҚХП қызметінің мақсаты ғылыми-техникалық прогресс негізінде шынайы халық билігіне негізделген, әлеуметтік әділеттілікті ту еткен, кең руханиятқа жол ашқан, бостандықты басты бағыт еткен және гүлденген экономикасы бар қоғам құруға ұмтылу болып табылады. Мұндай қоғамның басты байлығы да, негізі де азаматтық құқықтарды толық бойына сіңірген және өзін-өзі көрсету мен өз қабілетін дамыту үшін кең мүмкіндіктері бар адам болуға тиіс.\n\nБіздің міндетіміз — бейбіт азаматтық жолмен қуатты, өміршең, зайырлы, құқықтық және әлеуметтік мемлекет құру. Оның ең жоғары құндылығы — әрбір қазақстандықтың өмірі, құқықтары мен бостандықтары.',
);

function translate(value: string | null): string | null {
  if (value === null) return null;
  return textMap.get(value) ?? value;
}

function localizeJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(localizeJson);
  if (!value || typeof value !== 'object') return value;

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    result[key] = localizeJson(item);
  }

  for (const [key, item] of Object.entries(result)) {
    if (!key.endsWith('Ru')) continue;
    const kzKey = `${key.slice(0, -2)}Kz`;
    if (typeof item === 'string') result[kzKey] = translate(item);
    if (Array.isArray(item)) {
      result[kzKey] = item.map((entry) => typeof entry === 'string' ? translate(entry) : localizeJson(entry));
    }
  }
  return result;
}

function migrationText(fileName: string): string {
  return fs.readFileSync(path.join(migrationDirectory, fileName), 'utf8');
}

function extractHistory(): Map<number, string> {
  const result = new Map<number, string>();
  const sql = migrationText('202607190003_kz_history_events.sql');
  for (const match of sql.matchAll(/\(\s*(\d{4})\s*,\s*'((?:''|[^'])*)'\s*\)/g)) {
    result.set(Number(match[1]), unescapeSql(match[2] ?? ''));
  }
  return result;
}

function extractLeaders(): Map<string, { name: string; position: string; bio: string }> {
  const result = new Map<string, { name: string; position: string; bio: string }>();
  const sql = migrationText('202607190005_kz_leaders.sql');
  const pattern = /\(\s*'([^']+)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*\)/g;
  for (const match of sql.matchAll(pattern)) {
    result.set(match[1] ?? '', {
      name: unescapeSql(match[2] ?? ''),
      position: unescapeSql(match[3] ?? ''),
      bio: unescapeSql(match[4] ?? ''),
    });
  }
  return result;
}

function extractBranches(): Map<string, { cityKz: string; addressKz: string }> {
  const result = new Map<string, { cityKz: string; addressKz: string }>();
  const sql = migrationText('202607190004_kz_branches.sql');
  const lines = sql.split('\n').filter((line) => /^\s*\('[^']+'/.test(line));
  for (const line of lines) {
    const values = [...line.matchAll(/'((?:''|[^'])*)'/g)].map((match) => unescapeSql(match[1] ?? ''));
    if (values.length === 4 && line.includes('NULL::text') && values[0] && values[1] && values[3]) {
      result.set(values[0], { cityKz: values[1], addressKz: values[3] });
      continue;
    }
    if (values.length >= 5 && values[0] && values[1] && values[4]) {
      result.set(values[0], { cityKz: values[1], addressKz: values[4] });
    }
  }
  return result;
}

async function syncPageBlocks(): Promise<number> {
  const blocks = await prisma.pageBlock.findMany();
  for (const block of blocks) {
    await prisma.pageBlock.update({
      where: { id: block.id },
      data: { content: localizeJson(block.content) as Prisma.InputJsonValue },
    });
  }
  return blocks.length;
}

async function syncTranslatedEntities(): Promise<void> {
  const history = extractHistory();
  for (const event of await prisma.historyEvent.findMany({ include: { translations: true } })) {
    const source = event.translations.find((item) => item.lang === 'ru');
    if (!source) continue;
    await prisma.historyEventTranslation.upsert({
      where: { historyEventId_lang: { historyEventId: event.id, lang: 'kz' } },
      create: { historyEventId: event.id, lang: 'kz', title: translate(source.title) ?? source.title, text: history.get(event.year) ?? source.text },
      update: { title: translate(source.title) ?? source.title, text: history.get(event.year) ?? source.text },
    });
  }

  const leaders = extractLeaders();
  for (const member of await prisma.teamMember.findMany({ include: { translations: true } })) {
    const source = member.translations.find((item) => item.lang === 'ru');
    if (!source) continue;
    const approved = member.slug ? leaders.get(member.slug) : undefined;
    const data = {
      name: approved?.name ?? translate(source.name) ?? source.name,
      position: approved?.position ?? translate(source.position) ?? source.position,
      bio: approved?.bio ?? translate(source.bio),
      fullBio: translate(source.fullBio),
    };
    await prisma.teamMemberTranslation.upsert({
      where: { memberId_lang: { memberId: member.id, lang: 'kz' } },
      create: { memberId: member.id, lang: 'kz', ...data },
      update: data,
    });
  }

  for (const block of await prisma.programBlock.findMany({ include: { translations: true } })) {
    const source = block.translations.find((item) => item.lang === 'ru');
    if (!source) continue;
    const approvedTitles: Record<number, string> = {
      1: 'Еңбек адамы',
      2: 'Уәдесіне берік мемлекет',
      3: 'Әділдік іске асады',
      4: 'Адамға қызмет ететін экономика',
    };
    const approvedProgram: Record<number, { lead1: string; points: string[] }> = {
      1: { lead1: 'Елді лауазым емес, еңбек адамы ұстап тұр.', points: ['Ең төменгі жалақыны кезең-кезеңімен арттыру', 'Еңбек қауіпсіздігін күшейту', 'Жұмысшылардың кәсіподақ құқығын қорғау', 'Мұғалім, дәрігер, инженер, фермер мен өндіріс жұмысшысының еңбегін лайықты бағалау', 'Жастарға тұрақты жұмыс пен кәсіптік білім беру', 'Еңбек адамына қолжетімді баспана ұсыну'] },
      2: { lead1: 'Заң орындалып, уәде атқарылуға тиіс.', points: ['Мемлекеттік шешімдердің ашықтығын арттыру', 'Сайлауалды уәделердің орындалуын бақылау', 'Шенеуніктердің жеке жауапкершілігін күшейту', 'Азаматтардың өтінішіне нақты мерзімде жауап беру', 'Мемлекеттік сатып алуды ашық жүргізу', 'Жемқорлыққа төзбеушілік қағидатын орнықтыру'] },
      3: { lead1: 'Заң бәріне ортақ.', points: ['Сот жүйесінің тәуелсіздігін күшейту', 'Тегін заңгерлік көмекті кеңейту', 'Азаматтардың еңбек және әлеуметтік құқықтарын қорғау', 'Құқық қорғау органдарының есептілігін арттыру', 'Әлеуметтік осал топтарды құқықтық қорғау', 'Заң алдында теңдікті қамтамасыз ету'] },
      4: { lead1: 'Экономика көрсеткіш үшін емес, адам үшін жұмыс істеуге тиіс.', points: ['Отбасы табысын арттыру', 'Бағаның негізсіз өсуін тежеу', 'Шағын және орта бизнесті қорғау', 'Өңірлерде жаңа жұмыс орындарын ашу', 'Ауыл шаруашылығы мен отандық өндірісті қолдау', 'Қолжетімді баспана бағдарламаларын кеңейту'] },
    };
    const approved = approvedProgram[block.n];
    const data = {
      title: approvedTitles[block.n] ?? translate(source.title) ?? source.title,
      lead1: approved?.lead1 ?? translate(source.lead1),
      lead2: approved ? null : translate(source.lead2),
      points: (approved?.points ?? (source.points as string[]).map((point) => translate(point) ?? point)) as Prisma.InputJsonValue,
    };
    await prisma.programBlockTranslation.upsert({
      where: { programBlockId_lang: { programBlockId: block.id, lang: 'kz' } },
      create: { programBlockId: block.id, lang: 'kz', ...data },
      update: data,
    });
  }

  for (const candidate of await prisma.candidate.findMany({ include: { translations: true } })) {
    const source = candidate.translations.find((item) => item.lang === 'ru');
    if (!source) continue;
    const promise = translate(source.promise) ?? source.promise;
    await prisma.candidateTranslation.upsert({
      where: { candidateId_lang: { candidateId: candidate.id, lang: 'kz' } },
      create: { candidateId: candidate.id, lang: 'kz', name: translate(source.name) ?? source.name, promise },
      update: { name: translate(source.name) ?? source.name, promise },
    });
  }

  for (const project of await prisma.mediaProject.findMany({ include: { translations: true } })) {
    const source = project.translations.find((item) => item.lang === 'ru');
    if (!source) continue;
    const data = { title: translate(source.title) ?? source.title, description: translate(source.description) ?? source.description };
    await prisma.mediaProjectTranslation.upsert({
      where: { mediaProjectId_lang: { mediaProjectId: project.id, lang: 'kz' } },
      create: { mediaProjectId: project.id, lang: 'kz', ...data },
      update: data,
    });
  }

  for (const item of await prisma.news.findMany({ include: { translations: true } })) {
    const source = item.translations.find((translation) => translation.lang === 'ru');
    if (!source) continue;
    const data = {
      title: translate(source.title) ?? source.title,
      excerpt: translate(source.excerpt),
      content: translate(source.content) ?? source.content,
      seoTitle: translate(source.seoTitle),
      seoDescription: translate(source.seoDescription),
      seoKeywords: source.seoKeywords,
      ogImageUrl: source.ogImageUrl,
    };
    await prisma.newsTranslation.upsert({
      where: { newsId_lang: { newsId: item.id, lang: 'kz' } },
      create: { newsId: item.id, lang: 'kz', ...data },
      update: data,
    });
  }
}

async function main(): Promise<void> {
  const pageBlocks = await syncPageBlocks();
  await syncTranslatedEntities();

  const branchAliases: Record<string, string[]> = {
    'Алматы (г.)': ['Алматы (г.)', 'Алматы'],
    'Астана (г.)': ['Астана (г.)', 'Астана'],
    'Шымкент (г.)': ['Шымкент (г.)', 'Шымкент'],
    'Область Абай': ['Область Абай', 'Абайская обл.'],
  };
  for (const [cityRu, data] of extractBranches()) {
    await prisma.branch.updateMany({ where: { cityRu: { in: branchAliases[cityRu] ?? [cityRu] } }, data });
  }

  const topicPairs: Record<string, string> = {
    'Общий вопрос': 'Жалпы сұрақ',
    'Социальная помощь': 'Әлеуметтік көмек',
    'ЖКХ и инфраструктура': 'Тұрғын үй-коммуналдық шаруашылық және инфрақұрылым',
    'Образование': 'Білім',
    'Медицина': 'Медицина',
    'Труд и занятость': 'Еңбек және жұмыспен қамту',
    'Другое': 'Басқа',
  };
  for (const [nameRu, nameKz] of Object.entries(topicPairs)) {
    await prisma.appealTopic.updateMany({ where: { nameRu }, data: { nameKz } });
  }

  console.log(`KZ-контент синхронизирован: ${pageBlocks} блоков страниц.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
