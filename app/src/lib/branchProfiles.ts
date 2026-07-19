export interface BranchPerson {
  name: string;
  image: string;
  phone: string;
  email: string;
  position: string;
  bio: string;
}

export interface BranchSection {
  title: string;
  people: BranchPerson[];
}

export interface BranchProfile {
  slug: string;
  title: string;
  image: string;
  chairman: string;
  email: string;
  address: string;
  phone: string;
  sections: BranchSection[];
  sourceUrl: string;
}

// Данные собраны с официальных страниц филиалов НПК 20.07.2026.
// Внешние URL фотографий сохранены без перекодирования, чтобы не ухудшать оригиналы.
export const branchProfiles: BranchProfile[] = [
  {
    "slug": "almatinskij-gorodskoj-filial",
    "address": "050000, г. Алматы, ул.Қазыбек би 22, БЦ Жан-Ер, офис 222",
    "chairman": "Кусаинов Бейбут Булатович",
    "email": "halykparty_almaty@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/almaty/kusainov_beibut.jpg",
    "phone": "87787882034",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/almaty/kusainov_beibut.jpg",
            "name": "Кусаинов Бейбут Булатович",
            "phone": "87787882034",
            "position": "Маслихат города Алматы Председатель комиссии по культуре, спорту, внутренней политики, религии и молодежи Маслихата города Алматы"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/almaty/1.jpg",
            "name": "Газиз Джанибек Газизулы",
            "phone": "",
            "position": "Маслихат города Алматы Член комиссии по строительству, архитектуре, градостроительству, земельным отношениям и развитию общественных пространств"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/almaty/ahmetov_almat.jpg",
            "name": "Ахметов Алмат Сагындыкулы",
            "phone": "87017112770",
            "position": "Маслихат города Алматы Член комиссии по предпринимательству, инвестициям, туризму и экологии"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Алматинский городской филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/almatinskij-gorodskoj-filial"
  },
  {
    "slug": "astaninskij-gorodskoj-filial",
    "address": "010000, г. Астана, ул. Желтоксан, 16, НП 2",
    "chairman": "Оразханов Нұрдәулет Амантайұлы",
    "email": "halykparty_astana@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/photo_5409163971468050939_y.jpg",
    "phone": "87027964570",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-11%20at%2017.11.28.jpeg",
            "name": "Рамазанов Дархан Булатович",
            "phone": "87773333339",
            "position": "Маслихат города Астана Член комиссии по вопросам строительства, экологии, транспорта, торговли и ЖКХ"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Астанинский городской филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/astaninskij-gorodskoj-filial"
  },
  {
    "slug": "shymkentskij-gorodskoj-filial",
    "address": "160011, г. Шымкент, ул. Д. Кунаева 20/1",
    "chairman": "Умаров Баймырза Абденбаевич",
    "email": "halykparty_shymkent@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/filials/shymkent/ba3fb89b-2910-47a5-8c6e-41656980ef02.jpeg",
    "phone": "",
    "sections": [],
    "title": "Шымкентский городской филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/shymkentskij-gorodskoj-filial"
  },
  {
    "slug": "akmolinskij-filial",
    "address": "020000, г. Кокшетау, ул. М. Дулатулы, 31",
    "chairman": "Тастамбеков Арман Зейнуллаевич",
    "email": "halykparty_akmola@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/filials/Akmolinskaya%20oblast/WhatsApp%20Image%202025-12-26%20at%2012.28.20.jpeg",
    "phone": "87752129293",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/foto%20maslikhatov/%20%D0%9C.%D0%95.%20%D1%84%D0%BE%D1%82%D0%BE.jpg",
            "name": "Джусупов Мереке Ертаевич",
            "phone": "87017288566",
            "position": "Маслихат города Кокшетау Член комиссии по вопросам строительства, ЖКХ, экологии, предпринимательства и промышленности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/cropped-images/isabekov-427-170-772-767-1680845361.jpg",
            "name": "Исабеков Руслан Манатбаевич",
            "phone": "",
            "position": "Маслихат города Степногорск Член комиссии по вопросам законности, экологии и депутатской этике"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/abf0d34d-b7c7-4046-8f41-42aa1fc0caed.jpg",
            "name": "Осипова Ирина Серикпаевна",
            "phone": "87759558014",
            "position": "Маслихат города Косшы Член комиссии по вопросам экономики и бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-10%20at%2014.09.46.jpeg",
            "name": "Ибраев Шохан Саматович",
            "phone": "87015647020",
            "position": "Маслихат города Косшы Член комиссии по вопросам экономики и бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-10%20at%2011.40.40.jpeg",
            "name": "Корнев Сергей Александрович",
            "phone": "87087507004",
            "position": "Маслихат Аршалынского района Акмолинской области Член комиссии по вопросам социальной защиты, законности, экологии и природопользования"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-10%20at%2011.49.04.jpeg",
            "name": "Гребенников Олег Сергеевич",
            "phone": "87713722669",
            "position": "Маслихат Астраханского района Акмолинской области Член комиссии по вопросам депутатских полномочий, этике, делам молодежи, межнациональных отношений, охраны здоровья населения, образования, культуры"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/Trofimenko%20akmola.jpg",
            "name": "Трофименко Игорь Анатольевич",
            "phone": "87776205662",
            "position": "Маслихат Атбасарского района Акмолинской области Член комиссии по вопросам социальной политики, законности и правопорядку, депутатским полномочиям и этике"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/cropped-images/kobzev-16-291-798-775-1680845530.jpg",
            "name": "Кобзев Анатолий Николаевич",
            "phone": "87476922567",
            "position": "Маслихат Есильского района Акмолинской области Член комиссии по вопросам экономики и бюджета, социально-экономического развития, сельского хозяйства, законности и правопорядка"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/kopobayev.jpg",
            "name": "Копобаев Мендибай Сайлаубаевич",
            "phone": "87006640732",
            "position": "Маслихат Сандыктауского района Акмолинской области Член комиссии районного маслихата по социальным вопросам, по депутатским полномочиям этике, законно-сти и правопо-рядка"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/cropped-images/kairzhanov-4-9-1352-1591-1680845568.jpg",
            "name": "Каиржанов Елжас Конспекович",
            "phone": "87071770331",
            "position": "Маслихат Шортандинского района Акмолинской области Член комиссии по вопросам экономики и бюджета, социально-экономического развития, сельского хозяйства"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/aitpayev.jpg",
            "name": "Айтпаев Рустам Сайлауович",
            "phone": "87777479935",
            "position": "Маслихат Бурабайского района Акмолинской области"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/akmola/Sabiev.jpeg",
            "name": "Сабиев Нурбай Аткенович",
            "phone": "87014273264",
            "position": "Маслихат Коргалжынского района Акмолинской области"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/Akmolinskaya%20oblast/DSC02865.jpg",
            "name": "Баядилов Батырбек Бегайдарович",
            "phone": "87052958451",
            "position": "Маслихат Зерендинского района Член постоянной комиссии по вопросам депутатской этики, здравохранния , образования и культуры"
          }
        ],
        "title": "Депутаты маслихатов"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/Akmolinskaya%20oblast/WhatsApp%20Image%202025-12-26%20at%2012.32.13.jpeg",
            "name": "Сейденов Тасболат Сейткалиевич",
            "phone": "87773108889",
            "position": "Поселок Красногорский, Есильсий район"
          }
        ],
        "title": "Акимы сельских округов"
      }
    ],
    "title": "Акмолинский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/akmolinskij-filial"
  },
  {
    "slug": "aktyubinskij-filial",
    "address": "030002, г. Актобе, ул. Мангилик Ел, здание 7 «Б», 603 кабинет»",
    "chairman": "Курмангазин Бауыржан Олжашевич",
    "email": "halykparty_aktobe@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/WhatsApp%20Image%202024-05-24%20at%2010.44.13.jpeg",
    "phone": "87788033848",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/ilikbayev%20aktobe.jpeg",
            "name": "Иликбаев Диас Рустамович",
            "phone": "87082243536",
            "position": "Маслихат города Актобе Член комиссии по индустриальному развитию, инфраструктуре и жилищно-коммунальным вопросам"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/uzakbayeva%20aktobe.jpeg",
            "name": "Узакбаева Жания Кенесовна",
            "phone": "87054749017",
            "position": "Маслихат Маркутского района Актюбинской области Постоянная комиссия районного маслихата по вопросам финансов,бюджета,развития предпринимательства и сельского хозяйства"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/Sagdat.jpeg",
            "name": "Қабдығалиұлы Сағдат",
            "phone": "87014389992",
            "position": "Маслихат Уилского района Актюбинской области Член комиссии по вопросам образования, здравоохранения, культуры, спорта, экологии, общественной безопасности и социальной защиты"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/aimbetov%20aktobe.jpeg",
            "name": "Аимбетов Жайлыбай Мырзагалиулы",
            "phone": "87776605060",
            "position": "Маслихат Шалкарского района Актюбинской области Член Комиссии по вопросам противодействия коррупции"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Актюбинский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/aktyubinskij-filial"
  },
  {
    "slug": "almatinskij-filial",
    "address": "040800, город Конаев, улица Достык дом 5, 20 каб",
    "chairman": "Дудабаев Еркебулан Бакытович",
    "email": "halykparty_almaty_obl@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/filials/almaty_obl_filial/WhatsApp%20Image%202026-05-06%20at%2010.54.33.jpeg",
    "phone": "",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/foto%20maslikhatov/Tukeev.jpeg",
            "name": "Тукеев Ерболат Аламшаевич",
            "phone": "87071037169",
            "position": "Маслихат Енбекшиказахского района Алматинской области Член комиссии по вопросам экономики , бюджета и финансов"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/foto%20maslikhatov/Serganov.png",
            "name": "Сержанов Бауыржан Сержанович",
            "phone": "87025557535",
            "position": "Маслихат Илийского района Алматинской области Член комиссии по вопросам депутатских полномочий, этики и законности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/alm%20obl/6380ee3f-34be-4d4c-88a0-32c7f46207e5.jpeg",
            "name": "Котелевский Денис Игоревич",
            "phone": "87073241015",
            "position": "Маслихат Илийского района Алматинской области Член комиссии по вопросам депутатских полномочий, этики и законности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/mukashev%20kunaev.jpeg",
            "name": "Мукашев Есен Саденович",
            "phone": "87781630001",
            "position": "Маслихат Жамбылского района Алматинской области Член комиссии по вопросам развития транспортно-логистической, индустриальной, энергетической, жилищной, коммунальной инфраструктуры, инфраструктуры сетей водоснабжения и теплоснабжения, аграрной отрасли, сельского хозяйства"
          }
        ],
        "title": "Депутаты маслихатов"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/WhatsApp%20Image%202025-07-04%20at%2017.17.58.jpeg",
            "name": "Абдыкаримов Мұхтар Жұмабекұлы",
            "phone": "",
            "position": "Аким Ульгулинского сельского округа Жамбылского района"
          }
        ],
        "title": "Акимы сельских округов"
      }
    ],
    "title": "Алматинский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/almatinskij-filial"
  },
  {
    "slug": "atyrauskij-filial",
    "address": "060000, г. Атырау ул. М. Утемисова 134 А, БЦ «Евразия», 5 этаж",
    "chairman": "Досмухамбетова Балжан Ибатовна",
    "email": "halykparty_atyrau@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/WhatsApp%20Image%202022-10-17%20at%2018.08.10.jpeg",
    "phone": "87784854437",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/atyrau/whatsapp-image-2025-04-02-at-122111-1.jpg",
            "name": "Есенгожин Бекзат Гизатович",
            "phone": "87785557798",
            "position": "Маслихат города Атырау"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/foto%20maslikhatov/%D0%90%D0%BA%D0%BC%D0%BE%D0%BB%D0%B0/%20%D0%A8%D1%8B%D0%BD%D0%B0%D1%80%D0%B3%D1%83%D0%BB%D1%8C.jpeg",
            "name": "Измагамбетова Шынаргуль Орынбаевна",
            "phone": "87782533426",
            "position": "Маслихат Махамбетского района Атырауской области Член комиссии по вопросам депутатских полномочий, этики и законности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/kulgaliev-eldos.jpeg",
            "name": "Кулгалиев Елдос",
            "phone": "87779999690",
            "position": "Маслихат Индерского района Атырауской области Член комиссии по вопросам бюджета и предпринимательства"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/atyrau/zinulayev.jpg",
            "name": "Зинулаев Айбек",
            "phone": "87759283482",
            "position": "Маслихат Курманзинского района Атырауской области"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Атырауский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/atyrauskij-filial"
  },
  {
    "slug": "vostochno-kazahstanskij-filial",
    "address": "070000, г. Усть-Каменогорск, ул. М.Горького, 46, офис 211",
    "chairman": "Мусин Кайрат Маратович",
    "email": "halykparty_vko@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-09%20at%2016.10.24.jpeg",
    "phone": "8(7232)244648 ‎87772568539",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/foto%20maslikhatov/%D0%90%D0%BA%D0%BC%D0%BE%D0%BB%D0%B0/Gornostaeva.jpg",
            "name": "Горностаева Анжела Владимировна",
            "phone": "87772976634",
            "position": "Маслихат г.Усть-Каменогорск Председатель комиссии по вопросам бюджета, строительства и транспорта"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/%D1%84%D0%B2%D1%841.jpg",
            "name": "Каменский Виталий Александрович",
            "phone": "87056007868",
            "position": "Маслихат района Алтай Член комиссии по инфраструктуре и ЖКХ"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/zhanabaev-zhanat.jpg",
            "name": "Жанабаев Жанат",
            "phone": "87751304888",
            "position": "Катон-Карагайский районный маслихат Председатель постоянной комиссии по вопросам депутатских полномочий, этики и законности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-10%20at%2011.35.06.jpeg",
            "name": "Кумарова Ляззат Кумаркызы",
            "phone": "87774773093",
            "position": "Маслихат Курчумского района ВКО Председатель постоянной комиссии по вопросам депутатских полномочий, этики и законности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/whatsapp-image-2024-01-10-at-113506-1.jpeg",
            "name": "Калитова Индира Айтмуханбетовна",
            "phone": "87778500299",
            "position": "Маслихат Тарбагатайского района ВКО Член комиссии по вопросам развития агропромышленного комплекса и предпринимательства и бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/%20%D0%98%D0%BB%D0%B8%D1%8F%D1%81%20%D0%A3%D1%80%D0%B0%D0%BB%D0%B1%D0%B5%D0%BA%D1%83%D0%BB%D1%8B%20%D0%A3%D0%BB%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%20%D1%80%D0%B0%D0%B9%D0%BE%D0%BD%D0%BD%D1%8B%D0%B9%20%D0%BC%D0%B0%D1%81%D0%BB%D0%B8%D1%85%D0%B0%D1%82.jpeg",
            "name": "Тулегенов Илияс Уралбекулы",
            "phone": "87764466777",
            "position": "Маслихат Уланского района ВКО Член комиссии по социальной сфере"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/vko/WhatsApp%20Image%202024-12-30%20at%2011.46.17.jpeg",
            "name": "Имамбаев Дидар Бахытжанович",
            "phone": "87776750909",
            "position": "Маслихат Алтайского района, Восточно-Казахстанской области Член комиссии по вопросам социально-экономического развития, социальной защите населения и депутатских полномочий, этике, законности"
          }
        ],
        "title": "Депутаты маслихатов"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/WhatsApp%20Image%202024-04-22%20at%2015.25.01.jpeg",
            "name": "Кабанбаев Муратбек Камзабекович",
            "phone": "87772840220",
            "position": "Алтайский район, Чапаевский с/о"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/vko/ekrana-2025-05-12-152910-1.jpg",
            "name": "Авкубаев Эдуард Калиевич",
            "phone": "",
            "position": "Аким Тоскаинского сельского округа, Маркакольского района ВКО"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/WhatsApp%20Image%202025-07-04%20at%2016.32.07.jpeg",
            "name": "Шарыпов Марат",
            "phone": "",
            "position": "Аким Урыльсксого сельского округа Катон-Карагайского района ВКО"
          }
        ],
        "title": "Акимы сельских округов"
      }
    ],
    "title": "Восточно-Казахстанский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/vostochno-kazahstanskij-filial"
  },
  {
    "slug": "zhetysuskij-oblastnoj-filial",
    "address": "040000, г. Талдыкорган, пр. Н. Назарбаева, 44, каб. 22",
    "chairman": "Ибраимов Олжас Бекдаулетович",
    "email": "halykparty_taldykorgan@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhetysu/WhatsApp%20Image%202024-12-30%20at%2010.20.42.jpeg",
    "phone": "87011499555",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-04-09%20at%2015.07.48.jpeg",
            "name": "Жүнісхан Ермұхан",
            "phone": "87715758553",
            "position": "Маслихат области Жетісу Член комиссии по вопросам экономики, бюджета, правопорядка, борьбы с коррупцией, депутатских полномочий и этики"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhetysu/kerimbayev.jpg",
            "name": "Керимбаев Рахым Кусаинович",
            "phone": "87771762356",
            "position": "Маслихат города Текели Член постоянной комиссии по социальной сфере , идеологии, образованию, спорту, здоровью, социальному положению населения"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/kim%20zhetysu.jpeg",
            "name": "Ким Эдуард Алексеевич",
            "phone": "87715746670",
            "position": "Маслихат Каратальского района области Жетісу По социальным вопросам (образование, здравохранение, культура, спорт и защита прав граждан"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Жетысуский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/zhetysuskij-oblastnoj-filial"
  },
  {
    "slug": "zhambylskij-filial",
    "address": "080000, г. Тараз, ул. Казыбек би, 109А, офис 3",
    "chairman": "Аккозиев Рахман Сейлханович",
    "email": "halykparty_zhambyl@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhambyl/WhatsApp%20Image%202025-09-26%20at%2014.30.38.jpeg",
    "phone": "",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhambyl/bastaubaeva.jpg",
            "name": "Бастаубаева Жанат Абдуалиевна",
            "phone": "87753734436",
            "position": "Маслихат Жамбылской области Заместитель председателя комиссии по вопросам развития предпринимательства, промышленности, строительства, транспорта и коммунальной сферы."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/zhaparova%20zhambyl.jpg",
            "name": "Жапарова Асель Абилхановна",
            "phone": "87766597886",
            "position": "Маслихат г.Тараз Член постоянной комиссии по законности, правопорядку и работе с обществом."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/beysenbai%20zhambyl.jpg",
            "name": "Бейсенбай Арман Канатулы",
            "phone": "87758888008",
            "position": "Маслихат г.Тараз Член комиссии по вопросам инфраструктуры, коммунального хозяйства и земельных отношении."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhambyl/whatsapp-image-2024-04-24-at-093505-1.jpeg",
            "name": "Бибазарова Карлыгаш Джалгасовна",
            "phone": "87053954397",
            "position": "Маслихат г.Тараз Член комиссии по вопросам экономики, бюджета и предпринимательства."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/kalabayev%20zhambyl.jpg",
            "name": "Калабаев Айдын Бахытбекович",
            "phone": "87077372611",
            "position": "Маслихат Байзакского района Жамбылской области Член постоянной комиссии по вопросам образования, языкового развития, культуры, национального и гражданского согласия, по делам молодежи и спорту."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhambyl/tattykhozhayev.jpg",
            "name": "Таттыхожаев Талгат Сайлауович",
            "phone": "87786052497",
            "position": "Маслихат Турар Рыскуловского района Жамбылской области Член постоянной комиссии по развитию экономики, финансов, бюджета, налогов, строительства, транспорта и коммунального хозяйства и местного самоуправления."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhambyl/alimkulov.png",
            "name": "Алимкулов Калижан Сабыркулович",
            "phone": "87772212664",
            "position": "Маслихат Турар Рыскуловского района Жамбылской области Член комиссии по вопросам социально-культурных сфер, гендерной политики и связей с общественными организациями."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zhambyl/nametulla.jpg",
            "name": "Наметулла Бақытжан Ахметуллаұлы",
            "phone": "87479121199",
            "position": "Маслихат Жамбылского района Жамбылской области Член Постоянной комиссия по вопросам территориального социально - экономического развития, бюджета и местных налогов."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/isayev%20zhambyl.jpg",
            "name": "Исаев Жанибек Иманкулович",
            "phone": "87772914100",
            "position": "Маслихат Жуалынского района Жамбылской области Член Постоянной комиссии по административно-территориальному устройству, социально-экономическому развитию территории, вопросам бюджета и местных налогов, защите прав людей."
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/7c01679c-d6cd-4d59-b558-fd76213f6573.jpg",
            "name": "Молдабай Жамбыл Айдосулы",
            "phone": "87764350235",
            "position": "Маслихат Жуалынского района Жамбылской области Член Постоянной комиссии по административно-территориальному устройству, социально-экономическому развитию территории, вопросам бюджета и местных налогов, защите прав людей."
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Жамбылский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/zhambylskij-filial"
  },
  {
    "slug": "zapadno-kazahstanskij-filial",
    "address": "090000, г. Уральск, ул. Ихсанова, 38, каб. 207",
    "chairman": "Лаврентьев Борис Георгиевич",
    "email": "halykparty_zko@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/cropped-images/ZKO-0-0-0-0-1667388451.jpg",
    "phone": "8 (7112) 25 34 45 87055707517",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zko/Lavrentiev.jpg",
            "name": "Лаврентьев Борис Георгиевич",
            "phone": "87055707517",
            "position": "Маслихат Западно-Казахстанской области Председатель комиссии по социально-экономическому развитию и образованию"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/bralov%20zko.jpeg",
            "name": "Бралов Руслан Нурланович",
            "phone": "87784646391",
            "position": "Маслихат Западно-Казахстанской области Член комиссии по социально-экономическому развитию и образованию"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/zko/bd7137dd-87c0-4458-9a84-296e38336f02.jpg",
            "name": "Бауткин Антон Владимирович",
            "phone": "87058030363",
            "position": "Маслихат Теректинского района ЗКО Член комиссии по вопросам экономики"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Западно-Казахстанский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/zapadno-kazahstanskij-filial"
  },
  {
    "slug": "karagandinskij-filial",
    "address": "100000, г. Караганда, ул. Алиханова, 5, каб. 300-302",
    "chairman": "Максутов Калел Мухатаевич",
    "email": "halykparty_karaganda@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/Karaganda.jpg",
    "phone": "87015125129",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/shetinin%20karaganda.jpeg",
            "name": "Щетинин Виктор Петрович",
            "phone": "87013306778",
            "position": "Маслихат Карагандинской области Член комиссии по вопросам бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/serikuly%20karaganda.jpeg",
            "name": "Серикулы Жан",
            "phone": "87751825555",
            "position": "Маслихат Карагандинской области Член комиссии по вопросам бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/baranov%20karaganda%20obl.jpg",
            "name": "Баранов Анатолий Владимирович",
            "phone": "87058750011",
            "position": "Карагандинский городской маслихат Член комиссии по строительству и ЖКХ"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/kuziv%20karaganda.jpeg",
            "name": "Кузив Михаил Петрович",
            "phone": "87765175325",
            "position": "Карагандинский городской маслихат Член комиссии по строительству и ЖКХ"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/aglyukova%20karaganda.jpeg",
            "name": "Аглюкова Александра Александровна",
            "phone": "87015181827",
            "position": "Маслихат города Балхаш Председатель бюджетной комиссии"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-10%20at%2011.51.24.jpeg",
            "name": "Сериков Жанболат Канатович",
            "phone": "87014487573",
            "position": "Бухар-Жырауский районный маслихат Член комисии бюджетного планирования"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-10%20at%2011.51.23.jpeg",
            "name": "Абдоллаев Сырымбет Сымбатович",
            "phone": "87758888041",
            "position": "Маслихат Осакаровского района Член комиссии по вопросам бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/krg/WhatsApp%20Image%202024-12-30%20at%2015.42.05.jpeg",
            "name": "Адамбаев Аман Санбеталиевич",
            "phone": "87056289736",
            "position": "Маслихат Шетского района, Карагандинской области Комиссию еще не определили"
          }
        ],
        "title": "Депутаты областных маслихатов"
      }
    ],
    "title": "Карагандинский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/karagandinskij-filial"
  },
  {
    "slug": "kostanajskij-filial",
    "address": "110000, г. Костанай, ул. Байтурсынова, 95, каб. 332, 333",
    "chairman": "Березуцкая Ольга Ивановна",
    "email": "halykparty.kostanai@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/efe4a5f0-0660-4b2d-99a8-b495a7eacb95.jpg",
    "phone": "8(7142)534571 87478196974",
    "sections": [
      {
        "people": [
          {
            "bio": "Общая информация, образование Катпаев Руслан Жуламанович родился 1 января 1979 г. в Костанайской области, Денисовский район с.Покровка Карьера Трудовую деятельность начал с августа 1999 г. по октябрь 2002 г. главным экономистом-заместитель директора по производству ТОО \"Покровка\". С октября 2002 г. по 27 июня 2003 г. инженер-экономист \"Машина строительный завод Ісмер\" C января 2004 г. по август 2014 г. исполнительный директор, директор ТОО \"Покровка\" С сентября 2014 г. по январь 2016 г. и.о. руководителя, руководитель отдела обеспечения инфраструктуры и развития судов ГУ \"Канцелярия Костанайского областного суда\" С июля 2016 г. по май 2017 г. и.о. руководителя, руководитель отдела планирования, государственных закупок и юридического обеспечения ГУ \"Управление строительства акимата Костанайской области\" С февраля 2018 г. по июль 2019 г. ведущий специалист по государственным закупкам отдела материально-технического обеспечения ГКП \"Костанай Су\" С июля 2019 г по октябрь 2022 г. и.о. заместитель руководителя, заместитель руководителя, руководитель ГУ \"Управление строительства, архитектуры и градостроительства акимата Костанайской области\" С ноября 2022 г. по июнь 2023 г. заместитель акима города Костанай С 10 июля 2023 года заместитель акима Денисовского района С ноября 2022 г. по июнь 2023 г. заместитель акима города Костанай С 7 ноября 2023 года аким Денисовского района",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/img7158-1.jpg",
            "name": "Катпаев Руслан Жуламанович",
            "phone": "8 (71434) 2-15-01",
            "position": "Аким Денисовского района"
          }
        ],
        "title": "Районные Акимы"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/cropped-images/Semeybayev%20Kostanay-25-6-1032-842-1680864382.jpg",
            "name": "Семейбаев Сырым Сайранбекулы",
            "phone": "87475129948",
            "position": "Маслихат Костанайской области Член комиссии по вопросам бюджета и развития экономики региона"
          }
        ],
        "title": "Депутаты маслихатов"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/WhatsApp%20Image%202024-04-22%20at%2015.39.01.jpeg",
            "name": "Альжанов Азамат Ерболович",
            "phone": "87472586689",
            "position": "Костанайский район, Октябрьский с/о"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/Akmolinskaya%20oblast/WhatsApp%20Image%202024-12-30%20at%2009.57.46.jpeg",
            "name": "Беккулинов Марат Жумартович",
            "phone": "87774156026",
            "position": "Карасуский сельский округ, Карасуский район, Костанайской области"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/Akmolinskaya%20oblast/whatsapp-image-2024-12-30-at-095746-1.jpeg",
            "name": "Саламатова Гульнара Жумановна",
            "phone": "87777437499",
            "position": "Покровский сельский округ, Денисовский район, Костанайской области"
          }
        ],
        "title": "Акимы сельских округов"
      }
    ],
    "title": "Костанайский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/kostanajskij-filial"
  },
  {
    "slug": "abajskaya-oblast",
    "address": "г. Семей, ул. Мәңгілік ел 9, 310 кабинет",
    "chairman": "",
    "email": "halykparty.semey@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/anon.jpg",
    "phone": "",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/abay/WhatsApp%20Image%202025-11-25%20at%2012.43.40.jpeg",
            "name": "Кузбаев Данияр Жумагалиевич",
            "phone": "87013754613",
            "position": "Маслихат области Абай Член комиссии по промышленности и недропользования"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/abay/iliyasov.jpg",
            "name": "Ильясов Ердос Ерланович",
            "phone": "87019180004",
            "position": "Маслихат города Семей Член комиссии по социальной сфере"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/abay/cropped-images/tarpanbayev-0-190-540-641-1680862092.jpg",
            "name": "Тарпанбай Саят Лензатулы",
            "phone": "87751317724",
            "position": "Маслихат района Аксуат области Абай Член Постоянной комиссии по депутатским полномочиям, этике, законности и здравоохранению, социальным вопросам, бюджету, экономическим реформам"
          }
        ],
        "title": "Депутаты маслихата"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/abay/F6C99C3B-6C27-4C66-85F5-44747877ACC1.jpeg",
            "name": "Есенов Куаныш Мухаметжанович",
            "phone": "87788484281",
            "position": "Урджарский район, с/о Маканшы"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/abay/WhatsApp%20Image%202024-04-22%20at%2018.02.42.jpeg",
            "name": "Оралбаев Сырым Муратканулы",
            "phone": "87055278892",
            "position": "Урджарский район, с/о Алтыншокы"
          }
        ],
        "title": "Акимы сельских округов"
      }
    ],
    "title": "Филиал области Абай",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/abajskaya-oblast"
  },
  {
    "slug": "kyzylordinskij-filial",
    "address": "120000, г. Кызылорда, улица Кунаева 10, 1 этаж, офис 1, 2",
    "chairman": "Ерназаров Кайрат Шаршыбекович",
    "email": "halykparty_kyzylorda@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/cropped-images/Ernazarov%20Qyzylorda-0-0-0-0-1686128029.jpg",
    "phone": "87005003484",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Ernazarov%20Qyzylorda.jpg",
            "name": "Ерназаров Кайрат Шаршыбекович",
            "phone": "87760702121",
            "position": "Маслихат Кызылординской области Член комиссии по вопросам экологии, производства, развития хозяйства и предпринимательства"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Кызылординский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/kyzylordinskij-filial"
  },
  {
    "slug": "mangistauskij-filial",
    "address": "130000, г.Актау, 14 микрорайон, здание 61/1, БЦ “Звезда Актау” 305-кабинет",
    "chairman": "Тулеугалиев Рашид Бектурович",
    "email": "halykparty_mangistau@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Mangistau/WhatsApp%20Image%202026-01-14%20at%2016.11.12.jpeg",
    "phone": "87785720073",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-09%20at%2013.36.36.jpeg",
            "name": "Байжигитов Ербол",
            "phone": "87016663662",
            "position": "Маслихат города Актау Член комиссии по вопросам экономики и бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/whatsapp-image-2024-01-09-at-133636-1.jpeg",
            "name": "Кумысбаев Акмырат",
            "phone": "87073298370",
            "position": "Маслихат города Жанаозен Член комиссии по вопросам образования, здравоохранения, культуры, спорта, экологии, общественной безопасности и социальной защиты"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/whatsapp-image-2024-01-09-at-133636-2.jpeg",
            "name": "Нұрболған Орынжан",
            "phone": "87023311656",
            "position": "Тупкараганский районный маслихат Председатель постоянной комиссии по вопросам бюджета"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202024-01-09%20at%2013.36.37.jpeg",
            "name": "Хантораев Серик",
            "phone": "87015770303",
            "position": "Маслихат Мунайлинского района Член комиссии районного маслихата по социальным вопросам, по депутатским полномочиям этике, законно-сти и правопо-рядка"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Mangistau/bekzhanov.jpg",
            "name": "Бекжанов Салимжан",
            "phone": "87785721333",
            "position": "Маслихат Каракиянского района Член комиссии по социальной сфере"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Mangistau/bisengaliyev.jpg",
            "name": "Бисенгалиев Букенбай",
            "phone": "87016751983",
            "position": "Бейнеуский районный Член комиссии по социальным вопросам, законности и правопорядку"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Мангистауский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/mangistauskij-filial"
  },
  {
    "slug": "pavlodarskij-filial",
    "address": "140000, г. Павлодар, ул. Маргулана, 110, офис 4",
    "chairman": "Агибаев Алимбек Тулегенович",
    "email": "halykparty.pavlodar@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Pavlodar/WhatsApp%20Image%202025-09-09%20at%2012.23.44.jpeg",
    "phone": "87017569763",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Pavlodar/muhortov.jpg",
            "name": "Мухортов Илья Игоревич",
            "phone": "87758844424",
            "position": "Маслихат Павлодарской области Член комиссии по молодежным вопросам"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Pavlodar/Stolyarova.jpg",
            "name": "Столярова Ирина Геннадьевна",
            "phone": "87028758807",
            "position": "Павлодарский городской маслихат Член комиссии по социальным и культурным вопросам"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/Pavlodar/Oleynik.jpg",
            "name": "Олейник Сергей Алексеевич",
            "phone": "87057319748",
            "position": "Маслихат города Аксу Член комиссии по вопросам социальной и молодежной политики, законности и правопорядка"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/mirnov_evgeni.jpeg",
            "name": "Миронов Евгений Николаевич",
            "phone": "87015341741",
            "position": "Маслихат Железинского района Павлодарской области"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Павлодарский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/pavlodarskij-filial"
  },
  {
    "slug": "severo-kazahstanskij-filial",
    "address": "150000, г. Петропавловск, ул. Ы. Алтынсарина 166, офис 405",
    "chairman": "Жумагулов Ергали Сергалиевич",
    "email": "halykparty_sko@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/5210833518588978805.jpg",
    "phone": "8 (7152) 36 59 16",
    "sections": [
      {
        "people": [
          {
            "bio": "Общая информация, образование Степаненко Елена Федоровна родилась 01 мая 1972 года в селе Александровка, Ленинского района, Северо-Казахстанской области. Национальность русская. Образование высшее, в 2003 окончила Кокшетауский университет по специальности «Юристпруденция». Карьера 09.1990 11.1996 Старший инспектор Отдела выплат Ленинского райсобеса, Северо-Казахстанской области 11.1996 03.2001 Инспектор по воинскому учету и бронированию Ленинского райвоенкомата, Северо-Казахстанской области 03.2001 06.2001 И.о. главного специалиста Отдела внутренней политики и социальной сферы Есильского района, Северо-Казахстанской области 06.2001 09.2001 Главный специалист Отдела внутренней политики Есильского района, Северо-Казахстанской области 11.2001 01.2002 Ведущий специалист по трудовому договору Отдела труда, занятости и социальной защиты Есильского района, Северо-Казахстанской области 01.2002 05.2002 Ведущий специалист отдела назначения пособия Отдела труда, занятости и социальной защиты Есильского района, Северо-Казахстанской области 05.2002 02.2004 Главный специалист Отдела назначения адресной социальной помощи Отдела труда, занятости и социальной защиты Есильского района Северо-Казахстанской области 02.2004 01.2005 Начальник отдела документационного обеспечения и контроля Аппарата акима Есильского района, Северо-Казахстанской области 01.2005 10.2005 Начальник общего отдела Аппарата акима Есильского района, Северо-Казахстанской области 10.2005 03.2010 Руководитель аппарата акима Есильского района, Северо-Казахстанской области 07.2010 09.2010 Инспектор Отдела строительства Есильского района, Северо-Казахстанской области 11.2010 12.2010 И.о. главного специалиста Отдела строительства Есильского района, Северо-Казахстанская область, Есильский район, село Явленка 12.2010 06.2011 Главный специалист Отдела строительства Есильского района Северо-Казахстанской области 06.2011 10.2011 Руководитель структурного подразделения организационно- контрольной и кадровой работы Аппарата акима Есильского района Северо-Казахстанской области 10.2011 08.2012 Руководитель аппарата аакима Есильского района, Северо-Казахстанской области 08.2012 09.2012 Главный специалист по назначению государственной адресной социальной помощи Отдела занятости и социальных программ Есильского района Северо-Казахстанской области 09.2012 05.2013 Начальник отдела прохождения государственной службы и оценки управления персоналом Управление Агентства Республики Казахстан по делам государственной службы по Северо-Казахстанской области 05.2013 11.2014 Заведующая отделом оценки управления персоналом государственной службы Департамента Агентства Республики Казахстан по делам государственной службы по Северо-Казахстанской области 11.2014 01.2016 Руководитель отдела прохождения государственной службы Департамента Агентства Республики Казахстан по делам государственной службы и противодействию коррупции по Северо-Казахстанской области 02.2016 05.2016 Руководитель Управления государственной службы Департамента Министерства по делам государственной службы по Северо-Казахстанской области 05.2016 12.2016 Заместитель руководителя Департамента Министерства Республики Казахстан по делам государственной службы по Северо-Казахстанской области 12.2016 08.2018 Заместитель руководителя Департамента Агентства Республики Казахстан по делам государственной службы и противодействию коррупции по Северо-Казахстанской области, 08.2018 08.2019 Руководитель, председатель Совета по этике Департамента Агентства по делам государственной службы и противодействию коррупции по Северо-Казахстанской области 08.2019 07.2023 Руководитель, председатель Совета по этике Департамента Агентства Республики Казахстан по делам государственной службы по Северо-Казахстанской области 08.2023 11.2023 Заместитель акима Мамлютского района Северо-Казахстанской области по вопросам строительства, экономики и финансов, г.Мамлютка 11.2023 по н/в Аким Мамлютского района Северо-Казахстанской области",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/photo1712642921.jpeg",
            "name": "Степаненко Елена Фёдоровна",
            "phone": "8 (71541) 2-15-90",
            "position": "Аким Мамлютского района"
          }
        ],
        "title": "Районные акимы"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/WhatsApp%20Image%202025-07-21%20at%2014.08.59.jpeg",
            "name": "Кожахметов Болат Ташимович",
            "phone": "87773264238",
            "position": "Петропавловский городской маслихат Комиссия по вопросам бюджета, финансов, развития отраслей экономики и охраны окружающей среды"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/foto%20maslikhatov/%D0%90%D0%BA%D0%BC%D0%BE%D0%BB%D0%B0/Shukenov.jpg",
            "name": "Жаукенов Нурболат Серикович",
            "phone": "87769509515",
            "position": "Маслихать Есильского района Заместитель председателя комиссии по вопросам экономики и бюджетной политики"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/new%20photos/zhaksylykov%20sko.jpg",
            "name": "Жаксылыков Саят Сакенович",
            "phone": "87751025666",
            "position": "Маслихат Айыртауского района Член комиссии по вопросам экономической реформы, бюджета, налогов и финансовой деятельности, отраслей народного хозяйства и экологии"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/cropped-images/Kasymova-0-0-0-0-1680862695.jpg",
            "name": "Касымова Умутжан Бериковна",
            "phone": "87478343104",
            "position": "Маслихат Аккайынского района Член комиссии по вопросам охраны здоровья, социальной защиты образования, культуры и спорта, по делам молодежи"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/%20%D0%9C%D0%B0%D1%80%D0%B8%D1%8F%20%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%BD%D0%B0.jpg",
            "name": "Рахматуллина Мария Александровна",
            "phone": "87778968868",
            "position": "Маслихат Жамбылского района Член комиссии по вопросам отраслей экономики, экологии, бюджета, налогов и финансов"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/Baimaganbetova.png",
            "name": "Баймаганбетова Гульнар Нурлановна",
            "phone": "87024910072",
            "position": "Маслихат Уалихановского района Член комиссии по вопросам социальной сферы"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/%20%D0%90%D1%80%D0%BC%D0%B0%D0%BD%20%D0%93%D0%B0%D0%B1%D0%B8%D0%B4%D0%B5%D0%BD%D0%BE%D0%B2%D0%B8%D1%87.jpg",
            "name": "Лезбаев Арман Габиденович",
            "phone": "87710812131",
            "position": "Маслихат Жамбылского района Член комиссии по вопросам охраны здоровья населения, его социальной защиты, образования, культуры и делам молодежи"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/krot.jpg",
            "name": "Крот Олег Степанович",
            "phone": "87772785320",
            "position": "Маслихат района им.М.Жумабаева Член комиссии по вопросам бюджетной политики, развития экономики, предпринимательства и экологии"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/%20%D0%90%D0%B1%D0%B0%D0%B9%20%D0%A1%D0%B0%D0%BA%D0%B5%D0%BD%D0%BE%D0%B2%D0%B8%D1%87.jpg",
            "name": "Жолдыбаев Абай Сакенович",
            "phone": "87052651831",
            "position": "Маслихат района Шал акына Член постоянной комиссии по вопросам социальной сферы и законности"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/WhatsApp%20Image%202024-12-30%20at%2011.37.00.jpeg",
            "name": "Асаубаев Руслан Шонович",
            "phone": "87078473880",
            "position": "Маслихат Кызылжарского района, Северо-Казахстанской области Комиссия по вопросам отраслей экономики, экологии, бюджета, земельных ресурсов, инфраструктурного развития, налогов и финансов"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/WhatsApp%20Image%202025-11-28%20at%2016.40.29.jpeg",
            "name": "Новиков Николай Алексеевич",
            "phone": "87774177744",
            "position": "Маслихат города Петропавловска Член постоянной комиссии по вопросам социальной защиты, охраны здоровья населения, образования, культуры и делам молодежи"
          }
        ],
        "title": "Депутаты маслихатов"
      },
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/%20WhatsApp%202024-04-23%20%D0%B2%2014.38.31_7c9d7d87.jpg",
            "name": "Аитов Руслан Хасанович",
            "phone": "87779023921",
            "position": "Кызылжарский район, Рощинский с/о"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/%20WhatsApp%202024-09-05%20%D0%B2%2020.23.27_130222c0.jpg",
            "name": "Искаков Мендос Жумабекович",
            "phone": "",
            "position": "Есильский район, Булакский с/о"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/%20WhatsApp%202024-09-05%20%D0%B2%2020.23.27_49a204ff.jpg",
            "name": "Беримжанов Азамат Токшевич",
            "phone": "",
            "position": "Город Булаево, Магжана Жумабаева район"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/WhatsApp%20Image%202025-03-26%20at%2016.23.01.jpeg",
            "name": "Кожаев Мурат Мейрамович",
            "phone": "",
            "position": "Пригородного с/о Мамлютского района, СКО"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/SKo/WhatsApp%20Image%202025-06-26%20at%2011.28.53.jpg",
            "name": "Ищанова Венера Бастамикызы",
            "phone": "",
            "position": "Аким Акжанского сельского округа Тимирязевского района, СКО"
          },
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/filials/WhatsApp%20Image%202026-07-14%20at%2019.35.42.jpeg",
            "name": "Каркошев Олжас Адильханович",
            "phone": "87782157421",
            "position": "Аким Бидайыкского сельского округа Уалихановского района, СКО"
          }
        ],
        "title": "Акимы сельских округов"
      }
    ],
    "title": "Северо-Казахстанский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/severo-kazahstanskij-filial"
  },
  {
    "slug": "turkestanskij-filial",
    "address": "161200, г. Туркестан, ул. Б.Саттарханова, 45",
    "chairman": "Камбарова Зухра Медеуовна",
    "email": "halykparty_turkestan@qhp.kz",
    "image": "https://halykpartiyasy.kz/storage/app/media/Zuhra.jpg",
    "phone": "87753152007",
    "sections": [
      {
        "people": [
          {
            "bio": "",
            "email": "",
            "image": "https://halykpartiyasy.kz/storage/app/media/deputats/turkistan/cropped-images/tukeev-14-140-1032-1362-1680862609.jpg",
            "name": "Тукеев Бекзат Амашаевич",
            "phone": "87052656500",
            "position": "Маслихат Отырарского района Туркестанской области Член комиссии по вопросам бюджета"
          }
        ],
        "title": "Депутаты маслихатов"
      }
    ],
    "title": "Туркестанский областной филиал",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/turkestanskij-filial"
  },
  {
    "slug": "ulytauskij-oblastnoj-filial",
    "address": "100600, г. Жезказган. проспект Алаша-Хана 37А. 2 этаж. Офис 2",
    "chairman": "Максутов Калел Мухатаевич",
    "email": "halykparty_ulytau@mail.ru",
    "image": "https://halykpartiyasy.kz/storage/app/media/Karaganda.jpg",
    "phone": "87776295454",
    "sections": [],
    "title": "Областной филиал Улытау",
    "sourceUrl": "https://halykpartiyasy.kz/ru/nashi-filialy/ulytauskij-oblastnoj-filial"
  }
];

export function findBranchProfile(slug?: string) {
  return branchProfiles.find((branch) => branch.slug === slug);
}
