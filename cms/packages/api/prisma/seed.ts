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
