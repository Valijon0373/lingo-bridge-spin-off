import { PrismaClient, PriceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Deactivate old services so only the 3 requested services are active
  await prisma.service.updateMany({
    data: { isActive: false },
  });

  const services = [
    {
      nameUz: '📘 Avtoreferat tarjima',
      nameRu: '📘 Перевод автореферата',
      nameEn: '📘 Auto-abstract Translation',
      descriptionUz: 'Avtoreferatlarni professional tarjima qilish xizmati',
      descriptionRu: 'Профессиональный перевод авторефератов',
      descriptionEn: 'Professional translation of auto-abstracts',
      price: 30000,
      priceType: PriceType.PER_PAGE,
      isActive: true,
    },
    {
      nameUz: '✍️ Dissertatsiyalarni tahrir qilish',
      nameRu: '✍️ Редактирование диссертаций',
      nameEn: '✍️ Dissertation Editing',
      descriptionUz: 'Dissertatsiyalarni tahrir qilish va tuzatish xizmati',
      descriptionRu: 'Редактирование и корректура диссертаций',
      descriptionEn: 'Editing and proofreading of dissertations',
      price: 25000,
      priceType: PriceType.PER_PAGE,
      isActive: true,
    },
    {
      nameUz: '📄 Boshqa hujjatlar tarjimasi',
      nameRu: '📄 Перевод других документов',
      nameEn: '📄 Translation of Other Documents',
      descriptionUz: 'Barcha turdagi boshqa hujjatlar va matnlarni tarjima qilish',
      descriptionRu: 'Перевод всех видов других документов и текстов',
      descriptionEn: 'Translation of all other types of documents and texts',
      price: 30000,
      priceType: PriceType.PER_PAGE,
      isActive: true,
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({
      where: { nameUz: s.nameUz },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: s,
      });
      console.log(`✅ Updated service: ${s.nameUz}`);
    } else {
      await prisma.service.create({
        data: s,
      });
      console.log(`✅ Created service: ${s.nameUz}`);
    }
  }

  console.log('🌱 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
