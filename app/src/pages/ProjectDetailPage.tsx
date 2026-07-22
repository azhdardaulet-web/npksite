import { Link, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Target, Handshake, BookOpen, Zap,
  Scale, Shield, Megaphone, Heart,
  Ear, BarChart3, RefreshCw, Landmark,
  Hospital, Monitor, Stethoscope, Pill,
  Trophy, Star, Award, Flag,
  Construction, Sprout, Home, TrendingUp,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useLanguage } from '@/i18n/LanguageContext';
import './ProjectDetailPage.css';

const projectData: Record<string, {
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  stats: { num: string; label: string }[];
  values: { icon: LucideIcon; title: string; text: string }[];
  gallery: string[];
  team: { name: string; role: string; bio: string; photo: string }[];
}> = {
  'jas-orta': {
    title: 'Жас Орта',
    subtitle: 'Молодёжное крыло НПК',
    desc: '«Жас Орта» — это платформа для активной молодёжи Казахстана, объединяющая молодых лидеров, волонтёров и патриотов. Проект направлен на развитие молодёжного потенциала, поддержку студенческих инициатив и подготовку нового поколения политических лидеров.',
    image: '/images/projects/proj-jas-orta.png',
    stats: [
      { num: '5000+', label: 'активных участников' },
      { num: '20', label: 'региональных отделений' },
      { num: '150+', label: 'мероприятий в год' },
      { num: '2019', label: 'год основания' },
    ],
    values: [
      { icon: Target, title: 'Лидерство', text: 'Развитие лидерских качеств среди молодёжи через практическую деятельность.' },
      { icon: Handshake, title: 'Солидарность', text: 'Объединение молодых людей вокруг идей социальной справедливости.' },
      { icon: BookOpen, title: 'Образование', text: 'Политическая просветительская работа среди студентов и школьников.' },
      { icon: Zap, title: 'Действие', text: 'Реальные проекты, которые меняют жизнь молодых людей в регионах.' },
    ],
    gallery: ['/images/projects/proj-jas-orta.png', '/images/projects/proj-npk1.jpg', '/images/projects/proj-npk4.jpg', '/images/about/about-hero.jpg'],
    team: [
      { name: 'Айдос Нурланов', role: 'Координатор проекта', bio: 'Организатор молодёжных движений с 10-летним опытом.', photo: '/images/candidate-1.jpg' },
      { name: 'Дана Ермуханова', role: 'Руководитель направления', bio: 'Специалист по работе с молодёжью и студенческими организациями.', photo: '/images/candidate-2.jpg' },
      { name: 'Ерлан Нурбаев', role: 'Региональный представитель', bio: 'Координирует работу филиалов по всему Казахстану.', photo: '/images/candidate-3.jpg' },
    ],
  },
  'halyq-kompas': {
    title: 'HALYQ KOMPAS',
    subtitle: 'Народный компас',
    desc: '«Halyq Kompas» — социальная платформа, которая помогает гражданам ориентироваться в сложных жизненных ситуациях. Проект предоставляет юридическую помощь, социальную поддержку и консультации по вопросам трудовых прав, пенсий и социальных выплат.',
    image: '/images/projects/proj-kompas.jpg',
    stats: [
      { num: '10000+', label: 'консультаций' },
      { num: '50+', label: 'юристов в сети' },
      { num: '17', label: 'областей охвачено' },
      { num: '95%', label: 'успешных дел' },
    ],
    values: [
      { icon: Scale, title: 'Правосудие', text: 'Бесплатная юридическая помощь для социально-уязвимых слоёв населения.' },
      { icon: Shield, title: 'Защита', text: 'Защита трудовых прав граждан на всех уровнях.' },
      { icon: Megaphone, title: 'Голос', text: 'Помощь в обращениях к государственным органам.' },
      { icon: Heart, title: 'Забота', text: 'Социальная поддержка для тех, кто в ней больше всего нуждается.' },
    ],
    gallery: ['/images/projects/proj-kompas.jpg', '/images/about/about-parliament.jpg', '/images/about/about-people.jpg', '/images/about/about-astana.jpg'],
    team: [
      { name: 'Азамат Сатубалдин', role: 'Главный редактор', bio: 'Юрист с 15-летним стажем, эксперт по трудовому праву.', photo: '/images/candidate-1.jpg' },
      { name: 'Айгуль Танабаева', role: 'Руководитель направления', bio: 'Специалист по социальной защите населения.', photo: '/images/candidate-4.jpg' },
      { name: 'Дана Ермуханова', role: 'Координатор', bio: 'Организует работу юристов по всем регионам.', photo: '/images/candidate-2.jpg' },
    ],
  },
  'halyk-uni': {
    title: 'Халық үні',
    subtitle: 'Голос народа',
    desc: '«Халық үні» — это проект прямой связи между партией и народом. Граждане могут высказать своё мнение, поделиться проблемами и предложениями. Все обращения анализируются и становятся основой для партийных инициатив и законопроектов.',
    image: '/images/projects/proj-halyk-uni.png',
    stats: [
      { num: '25000+', label: 'обращений' },
      { num: '300+', label: 'инициатив реализовано' },
      { num: '20', label: 'филиалов связи' },
      { num: '2020', label: 'год запуска' },
    ],
    values: [
      { icon: Ear, title: 'Внимание', text: 'Каждое обращение гражданина услышано и учтено.' },
      { icon: BarChart3, title: 'Аналитика', text: 'Системный анализ общественного мнения по всей стране.' },
      { icon: RefreshCw, title: 'Обратная связь', text: 'Прозрачная отчётность о результатах работы.' },
      { icon: Landmark, title: 'Влияние', text: 'Народные предложения становятся законами.' },
    ],
    gallery: ['/images/projects/proj-halyk-uni.png', '/images/about/about-hero.jpg', '/images/about/about-parliament.jpg', '/images/projects/proj-npk4.jpg'],
    team: [
      { name: 'Ерлан Нурбаев', role: 'Руководитель проекта', bio: 'Политолог, эксперт по избирательным технологиям.', photo: '/images/candidate-3.jpg' },
      { name: 'Айжан Скакова', role: 'Аналитик', bio: 'Специалист по сбору и анализу общественного мнения.', photo: '/images/candidate-2.jpg' },
      { name: 'Айбек Паяев', role: 'Координатор регионов', bio: 'Связывает центральный аппарат с региональными филиалами.', photo: '/images/candidate-1.jpg' },
    ],
  },
  'medfusion': {
    title: 'Medfusion',
    subtitle: 'Здравоохранение',
    desc: '«Medfusion» — проект модернизации системы здравоохранения Казахстана. Платформа объединяет врачей, пациентов и государственные органы для создания доступной и качественной медицины. Основные направления: цифровизация, профилактика, поддержка медицинских работников.',
    image: '/images/projects/proj-medfusion.jpg',
    stats: [
      { num: '200+', label: 'клиник-партнёров' },
      { num: '5000+', label: 'врачей в сети' },
      { num: '100000+', label: 'пациентов' },
      { num: '15', label: 'цифровых сервисов' },
    ],
    values: [
      { icon: Hospital, title: 'Доступность', text: 'Медицинская помощь должна быть доступна каждому гражданину.' },
      { icon: Monitor, title: 'Цифровизация', text: 'Современные технологии для улучшения качества медицины.' },
      { icon: Stethoscope, title: 'Поддержка', text: 'Помощь и защита прав медицинских работников.' },
      { icon: Pill, title: 'Профилактика', text: 'Профилактические программы для населения.' },
    ],
    gallery: ['/images/projects/proj-medfusion.jpg', '/images/about/about-people.jpg', '/images/about/about-astana.jpg', '/images/about/about-parliament.jpg'],
    team: [
      { name: 'Ирина Смирнова', role: 'Медицинский директор', bio: 'Врач-эпидемиолог, депутат Мажилиса РК.', photo: '/images/candidate-2.jpg' },
      { name: 'Александр Милютин', role: 'IT-директор', bio: 'Разработчик медицинских информационных систем.', photo: '/images/candidate-1.jpg' },
      { name: 'Файзолла Каменов', role: 'Координатор', bio: 'Специалист по цифровизации здравоохранения.', photo: '/images/candidate-3.jpg' },
    ],
  },
  'nagrady': {
    title: 'Награды НПК',
    subtitle: 'Премии партии',
    desc: 'Премии и награды Народной партии Казахстана — это признание заслуг граждан, которые внесли значительный вклад в развитие социальной сферы, правозащитную деятельность и укрепление демократии. Проект включает несколько номинаций и ежегодную церемонию награждения.',
    image: '/images/projects/proj-nagrady.jpg',
    stats: [
      { num: '12', label: 'номинаций' },
      { num: '200+', label: 'лауреатов' },
      { num: '7', label: 'лет премии' },
      { num: '20', label: 'регионов' },
    ],
    values: [
      { icon: Trophy, title: 'Признание', text: 'Отмечаем тех, кто меняет страну к лучшему.' },
      { icon: Star, title: 'Вдохновение', text: 'Лауреаты становятся примером для миллионов.' },
      { icon: Award, title: 'Традиция', text: 'Ежегодная церемония — главное событие года.' },
      { icon: Flag, title: 'Патриотизм', text: 'Укрепляем чувство гордости за Казахстан.' },
    ],
    gallery: ['/images/projects/proj-nagrady.jpg', '/images/projects/proj-npk1.jpg', '/images/projects/proj-npk4.jpg', '/images/about/about-hero.jpg'],
    team: [
      { name: 'Жамбыл Ахметбеков', role: 'Председатель комитета', bio: 'Опытный политик, один из основателей партии.', photo: '/images/candidate-1.jpg' },
      { name: 'Газиз Кулахметов', role: 'Секретарь', bio: 'Организует церемонию награждения.', photo: '/images/candidate-3.jpg' },
      { name: 'Ерлан Смайлов', role: 'Координатор', bio: 'Работает с номинациями и кандидатами.', photo: '/images/candidate-4.jpg' },
    ],
  },
  'partiynye-initsiativy': {
    title: 'Партийные инициативы',
    subtitle: 'Программы развития',
    desc: 'Комплекс программ развития регионов Казахстана. Проект включает инфраструктурные программы, социальные проекты, экологические инициативы и поддержку местного самоуправления. Каждая программа разрабатывается с учётом потребностей конкретного региона.',
    image: '/images/projects/proj-npk1.jpg',
    stats: [
      { num: '45+', label: 'программ' },
      { num: '17', label: 'областей' },
      { num: '100+', label: 'проектов' },
      { num: '2021', label: 'год запуска' },
    ],
    values: [
      { icon: Construction, title: 'Инфраструктура', text: 'Строительство и реконструкция объектов по всей стране.' },
      { icon: Sprout, title: 'Экология', text: 'Экологические программы для чистого будущего.' },
      { icon: Home, title: 'Местное развитие', text: 'Поддержка инициатив на уровне городов и сёл.' },
      { icon: TrendingUp, title: 'Результат', text: 'Измеряемый эффект от каждой программы.' },
    ],
    gallery: ['/images/projects/proj-npk1.jpg', '/images/projects/proj-npk4.jpg', '/images/about/about-astana.jpg', '/images/about/about-parliament.jpg'],
    team: [
      { name: 'Сергей Решетников', role: 'Директор программ', bio: 'Экономист, разработчик региональных программ.', photo: '/images/candidate-3.jpg' },
      { name: 'Айбек Паяев', role: 'Координатор', bio: 'Связывает филиалы с центральным аппаратом.', photo: '/images/candidate-1.jpg' },
      { name: 'Айжан Скакова', role: 'Аналитик', bio: 'Оценивает эффективность программ развития.', photo: '/images/candidate-2.jpg' },
    ],
  },
};

const projectDataKz: typeof projectData = {
  'jas-orta': {
    ...projectData['jas-orta'],
    subtitle: 'ҚХП жастар қанаты',
    desc: '«Жас Орта» Қазақстанның белсенді жастарын, жас көшбасшыларды, еріктілер мен елжанды азаматтарды біріктіреді. Жоба жастардың әлеуетін дамытуға, студенттік бастамаларды қолдауға және саясаттағы жаңа буын көшбасшыларын даярлауға бағытталған.',
    stats: [
      { num: '5000+', label: 'белсенді қатысушы' }, { num: '20', label: 'өңірлік бөлімше' },
      { num: '150+', label: 'жыл сайынғы шара' }, { num: '2019', label: 'құрылған жыл' },
    ],
    values: [
      { icon: Target, title: 'Көшбасшылық', text: 'Жастардың көшбасшылық қасиеттерін нақты істер арқылы дамыту.' },
      { icon: Handshake, title: 'Ынтымақ', text: 'Жастарды әлеуметтік әділеттілік идеялары төңірегіне біріктіру.' },
      { icon: BookOpen, title: 'Білім', text: 'Студенттер мен оқушылардың саяси сауатын арттыру.' },
      { icon: Zap, title: 'Іс-қимыл', text: 'Өңірлердегі жастардың өміріне оң өзгеріс әкелетін нақты жобаларды жүзеге асыру.' },
    ],
    team: [
      { name: 'Айдос Нұрланов', role: 'Жоба үйлестірушісі', bio: 'Жастар қозғалыстарын ұйымдастыру саласында 10 жылдық тәжірибесі бар.', photo: '/images/candidate-1.jpg' },
      { name: 'Дана Ермұханова', role: 'Бағыт жетекшісі', bio: 'Жастар және студенттік ұйымдармен жұмыс істейтін маман.', photo: '/images/candidate-2.jpg' },
      { name: 'Ерлан Нұрбаев', role: 'Өңірлік өкіл', bio: 'Қазақстандағы филиалдардың жұмысын үйлестіреді.', photo: '/images/candidate-3.jpg' },
    ],
  },
  'halyq-kompas': {
    ...projectData['halyq-kompas'],
    subtitle: 'Халыққа бағыт көрсететін жоба',
    desc: '«Halyq Kompas» азаматтарға күрделі өмірлік жағдайларда дұрыс шешім табуға көмектесетін әлеуметтік жоба. Мұнда еңбек құқықтары, зейнетақы мен әлеуметтік төлемдер мәселелері бойынша заң көмегі, әлеуметтік қолдау және кеңес беріледі.',
    stats: [
      { num: '10000+', label: 'кеңес' }, { num: '50+', label: 'заңгер' },
      { num: '17', label: 'қамтылған облыс' }, { num: '95%', label: 'оң шешілген іс' },
    ],
    values: [
      { icon: Scale, title: 'Әділет', text: 'Әлеуметтік тұрғыдан осал азаматтарға тегін заң көмегін көрсету.' },
      { icon: Shield, title: 'Қорғау', text: 'Азаматтардың еңбек құқықтарын барлық деңгейде қорғау.' },
      { icon: Megaphone, title: 'Үн', text: 'Мемлекеттік органдарға өтініш беруге көмектесу.' },
      { icon: Heart, title: 'Қамқорлық', text: 'Қолдауға мұқтаж азаматтарға әлеуметтік көмек көрсету.' },
    ],
    team: [
      { name: 'Азамат Сәтубалдин', role: 'Бас редактор', bio: 'Еңбек құқығы саласында маманданған, 15 жылдық тәжірибесі бар заңгер.', photo: '/images/candidate-1.jpg' },
      { name: 'Айгүл Танабаева', role: 'Бағыт жетекшісі', bio: 'Халықты әлеуметтік қорғау саласының маманы.', photo: '/images/candidate-4.jpg' },
      { name: 'Дана Ермұханова', role: 'Үйлестіруші', bio: 'Өңірлердегі заңгерлердің жұмысын ұйымдастырады.', photo: '/images/candidate-2.jpg' },
    ],
  },
  'halyk-uni': {
    ...projectData['halyk-uni'],
    subtitle: 'Халықтың үні',
    desc: '«Халық үні» партия мен халық арасында тікелей байланыс орнатуға арналған. Азаматтар өз пікірін айтып, мәселелері мен ұсыныстарын жеткізе алады. Әр өтініш сараланып, партиялық бастамалар мен заң жобаларын әзірлеуге негіз болады.',
    stats: [
      { num: '25000+', label: 'өтініш' }, { num: '300+', label: 'жүзеге асқан бастама' },
      { num: '20', label: 'байланыс филиалы' }, { num: '2020', label: 'іске қосылған жыл' },
    ],
    values: [
      { icon: Ear, title: 'Зейін', text: 'Әр азаматтың өтініші тыңдалып, назарға алынады.' },
      { icon: BarChart3, title: 'Талдау', text: 'Елдегі қоғамдық пікірді жүйелі түрде зерделеу.' },
      { icon: RefreshCw, title: 'Кері байланыс', text: 'Атқарылған жұмыс нәтижесін ашық жариялау.' },
      { icon: Landmark, title: 'Ықпал', text: 'Халықтың ұсыныстарын заңнамалық бастамаға айналдыру.' },
    ],
    team: [
      { name: 'Ерлан Нұрбаев', role: 'Жоба жетекшісі', bio: 'Сайлау технологиялары саласында маманданған саясаттанушы.', photo: '/images/candidate-3.jpg' },
      { name: 'Айжан Скакова', role: 'Талдаушы', bio: 'Қоғамдық пікірді жинау және талдау маманы.', photo: '/images/candidate-2.jpg' },
      { name: 'Айбек Паяев', role: 'Өңірлер үйлестірушісі', bio: 'Орталық аппарат пен өңірлік филиалдардың байланысын қамтамасыз етеді.', photo: '/images/candidate-1.jpg' },
    ],
  },
  'medfusion': {
    ...projectData.medfusion,
    subtitle: 'Денсаулық сақтау',
    desc: '«Medfusion» Қазақстандағы денсаулық сақтау жүйесін жаңғыртуға бағытталған. Жоба дәрігерлерді, пациенттерді және мемлекеттік органдарды біріктіріп, сапалы медициналық көмекті баршаға қолжетімді етуді көздейді. Негізгі бағыттары цифрландыруды, аурудың алдын алуды және медицина қызметкерлерін қолдауды қамтиды.',
    stats: [
      { num: '200+', label: 'серіктес емхана' }, { num: '5000+', label: 'дәрігер' },
      { num: '100000+', label: 'пациент' }, { num: '15', label: 'цифрлық қызмет' },
    ],
    values: [
      { icon: Hospital, title: 'Қолжетімділік', text: 'Медициналық көмек әр азаматқа қолжетімді болуы керек.' },
      { icon: Monitor, title: 'Цифрландыру', text: 'Медицина сапасын жақсартуға арналған заманауи технологиялар.' },
      { icon: Stethoscope, title: 'Қолдау', text: 'Медицина қызметкерлеріне көмектесу және олардың құқықтарын қорғау.' },
      { icon: Pill, title: 'Алдын алу', text: 'Халық денсаулығын нығайтуға арналған алдын алу бағдарламалары.' },
    ],
    team: [
      { name: 'Ирина Смирнова', role: 'Медицина жөніндегі директор', bio: 'Эпидемиолог дәрігер, Қазақстан Республикасы Мәжілісінің депутаты.', photo: '/images/candidate-2.jpg' },
      { name: 'Александр Милютин', role: 'IT-директор', bio: 'Медициналық ақпараттық жүйелерді әзірлеуші.', photo: '/images/candidate-1.jpg' },
      { name: 'Файзолла Каменов', role: 'Үйлестіруші', bio: 'Денсаулық сақтау саласын цифрландыру маманы.', photo: '/images/candidate-3.jpg' },
    ],
  },
  'nagrady': {
    ...projectData.nagrady,
    title: 'ҚХП марапаттары',
    subtitle: 'Партия сыйлықтары',
    desc: 'Қазақстан Халық партиясының сыйлықтары мен марапаттары әлеуметтік саланы дамытуға, адам құқықтарын қорғауға және демократияны нығайтуға елеулі үлес қосқан азаматтарға беріледі. Жоба бірнеше аталымнан және жыл сайынғы марапаттау рәсімінен тұрады.',
    stats: [
      { num: '12', label: 'аталым' }, { num: '200+', label: 'лауреат' },
      { num: '7', label: 'жылдық тарих' }, { num: '20', label: 'өңір' },
    ],
    values: [
      { icon: Trophy, title: 'Мойындау', text: 'Елдің дамуына үлес қосқан азаматтардың еңбегін бағалау.' },
      { icon: Star, title: 'Шабыт', text: 'Лауреаттардың жетістігі көпшілікке үлгі болады.' },
      { icon: Award, title: 'Дәстүр', text: 'Жыл сайынғы марапаттау рәсімі маңызды оқиғаға айналды.' },
      { icon: Flag, title: 'Отаншылдық', text: 'Қазақстанға деген мақтаныш сезімін нығайту.' },
    ],
    team: [
      { name: 'Жамбыл Ахметбеков', role: 'Комитет төрағасы', bio: 'Тәжірибелі саясаткер, партияны құрушылардың бірі.', photo: '/images/candidate-1.jpg' },
      { name: 'Ғазиз Құлахметов', role: 'Хатшы', bio: 'Марапаттау рәсімін ұйымдастырады.', photo: '/images/candidate-3.jpg' },
      { name: 'Ерлан Смайылов', role: 'Үйлестіруші', bio: 'Аталымдар мен үміткерлерге қатысты жұмысты жүргізеді.', photo: '/images/candidate-4.jpg' },
    ],
  },
  'partiynye-initsiativy': {
    ...projectData['partiynye-initsiativy'],
    title: 'Партиялық бастамалар',
    subtitle: 'Даму бағдарламалары',
    desc: 'Бұл жоба Қазақстан өңірлерін дамытуға арналған бағдарламаларды біріктіреді. Оның аясында инфрақұрылымдық және әлеуметтік жобалар, экологиялық бастамалар мен жергілікті өзін-өзі басқаруды қолдау шаралары жүзеге асырылады. Әр бағдарлама нақты өңірдің қажеттілігіне сай әзірленеді.',
    stats: [
      { num: '45+', label: 'бағдарлама' }, { num: '17', label: 'облыс' },
      { num: '100+', label: 'жоба' }, { num: '2021', label: 'іске қосылған жыл' },
    ],
    values: [
      { icon: Construction, title: 'Инфрақұрылым', text: 'Ел аумағындағы нысандарды салу және жаңғырту.' },
      { icon: Sprout, title: 'Экология', text: 'Таза болашаққа арналған экологиялық бағдарламалар.' },
      { icon: Home, title: 'Жергілікті даму', text: 'Қалалар мен ауылдардағы бастамаларды қолдау.' },
      { icon: TrendingUp, title: 'Нәтиже', text: 'Әр бағдарламаның нақты әсерін бағалау.' },
    ],
    team: [
      { name: 'Сергей Решетников', role: 'Бағдарламалар директоры', bio: 'Өңірлік бағдарламаларды әзірлеуші экономист.', photo: '/images/candidate-3.jpg' },
      { name: 'Айбек Паяев', role: 'Үйлестіруші', bio: 'Филиалдар мен орталық аппараттың байланысын қамтамасыз етеді.', photo: '/images/candidate-1.jpg' },
      { name: 'Айжан Скакова', role: 'Талдаушы', bio: 'Даму бағдарламаларының тиімділігін бағалайды.', photo: '/images/candidate-2.jpg' },
    ],
  },
};

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const p = (isKz ? projectDataKz : projectData)[slug || ''];

  if (!p) {
    return (
      <div className="npd" style={{ padding: '200px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 800 }}>404</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>{isKz ? 'Жоба табылмады' : 'Проект не найден'}</p>
        <Link to="/proekty" className="npd-cta__btn" style={{ marginTop: 32 }}>
          ← {isKz ? 'Барлық жоба' : 'Все проекты'}
        </Link>
      </div>
    );
  }

  return (
    <div className="npd">
      {/* BREADCRUMBS */}
      <div className="npd-crumbs">
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{isKz ? 'Басты бет' : 'Главная'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/o-partii">{isKz ? 'Партия туралы' : 'О партии'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/proekty">{isKz ? 'Жобалар' : 'Проекты'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>{p.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Back */}
      <div className="npd-back">
        <Link to="/proekty" className="npd-back__link">← {isKz ? 'Барлық жоба' : 'Все проекты'}</Link>
      </div>

      {/* Hero */}
      <section className="npd-hero">
        <div>
          <span className="npd-hero__eyebrow">{p.subtitle}</span>
          <h1 className="npd-hero__title">{p.title}</h1>
        </div>
        <p className="npd-hero__desc">{p.desc}</p>
      </section>

      {/* Stats */}
      <section className="npd-stats">
        <ScrollReveal>
          <div className="npd-stats__header">
            <h2 className="npd-stats__title">{isKz ? 'Жоба нәтижесін көрсететін деректер' : 'Цифры, которые говорят сами за себя'}</h2>
          </div>
        </ScrollReveal>
        <div className="npd-stats__grid">
          {p.stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="npd-stat">
                <div className="npd-stat__num">{s.num}</div>
                <div className="npd-stat__label">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="npd-values">
        <ScrollReveal>
          <div className="npd-values__header">
            <span className="npd-values__eyebrow">{isKz ? 'Құндылықтар' : 'Ценности'}</span>
            <h2 className="npd-values__title">{isKz ? 'Жобаның негізгі қағидаттары' : 'На чём строится проект'}</h2>
          </div>
        </ScrollReveal>
        <div className="npd-values__layout">
          <div className="npd-values__grid">
            {p.values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="npd-value">
                  <div className="npd-value__icon"><v.icon size={20} strokeWidth={1.75} /></div>
                  <h4 className="npd-value__title">{v.title}</h4>
                  <p className="npd-value__text">{v.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.2}>
            <div className="npd-values__img">
              <img src={p.image} alt={p.title} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="npd-gallery">
        <ScrollReveal>
          <h2 className="npd-gallery__title">{isKz ? 'Фотогалерея' : 'Галерея'}</h2>
        </ScrollReveal>
        <div className="npd-gallery__grid">
          {p.gallery.map((src, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="npd-gallery__item">
                <img src={src} alt="" loading="lazy" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="npd-team">
        <ScrollReveal>
          <div className="npd-team__header">
            <span className="npd-team__eyebrow">{isKz ? 'Команда' : 'Команда'}</span>
            <h2 className="npd-team__title">{isKz ? 'Жобаны жүзеге асыратын мамандар' : 'Люди за проектом'}</h2>
            <p className="npd-team__text">
              {isKz ? 'Жобаны күн сайын алға жылжытып жүрген кәсіби мамандар.' : 'Профессиональная команда, которая ежедневно работает над реализацией проекта.'}
            </p>
          </div>
        </ScrollReveal>
        <div className="npd-team__grid">
          {p.team.map((m, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="npd-member">
                <div className="npd-member__photo">
                  <img src={m.photo} alt={m.name} loading="lazy" />
                </div>
                <div className="npd-member__info">
                  <h4 className="npd-member__name">{m.name}</h4>
                  <p className="npd-member__role">{m.role}</p>
                  <p className="npd-member__bio">{m.bio}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="npd-cta">
        <ScrollReveal>
          <div className="npd-cta__inner">
            <h2 className="npd-cta__title">{isKz ? 'Жобаны қолдаңыз' : 'Поддержите проект'}</h2>
            <p className="npd-cta__text">
              {isKz ? 'Бастамаға қосылыңыз. Бірге үлкен нәтижеге қол жеткізе аламыз.' : 'Присоединяйтесь к инициативе — вместе мы сделаем больше.'}
            </p>
            <Link to="/vstupit" className="npd-cta__btn">{isKz ? 'Партияға қосылу →' : 'Вступить в партию →'}</Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
