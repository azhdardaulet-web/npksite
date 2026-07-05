import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DAR Rail CMS database...');

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = 'admin@darrail.com';
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
        slug: 'podgotovka-k-zimneму-periodu-2024',
        type: 'press',
        category: 'corporate',
        status: 'PUBLISHED',
        imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600',
        readingTime: 3,
        publishedAt: new Date('2024-10-28'),
        authorId: admin.id,
        translations: {
          create: [
            {
              lang: 'ru',
              title: 'Подготовка к работе в зимний период',
              excerpt:
                'Компания DAR RAIL завершила комплексную подготовку локомотивного парка к зимнему сезону.',
              content:
                '<p>Компания DAR RAIL завершила комплексную подготовку локомотивного парка к зимнему сезону. Все локомотивы прошли техническое обслуживание и оснащены необходимым оборудованием.</p>',
              seoTitle: 'DAR RAIL — Подготовка к зимнему периоду 2024',
              seoDescription:
                'Компания DAR RAIL завершила подготовку локомотивного парка к зимнему сезону 2024.',
            },
            {
              lang: 'kz',
              title: 'Қысқы кезеңде жұмысқа дайындық',
              excerpt:
                'DAR RAIL компаниясы локомотив паркін қысқы маусымға дайындауды аяқтады.',
              content:
                '<p>DAR RAIL компаниясы локомотив паркін қысқы маусымға толыққанды дайындауды аяқтады. Барлық локомотивтер техникалық қызмет көрсетуден өтіп, қажетті жабдықтармен жабдықталды.</p>',
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
  const pageSlugs = ['home', 'about', 'services', 'esg', 'contacts'];
  for (const slug of pageSlugs) {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (!existing) {
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
