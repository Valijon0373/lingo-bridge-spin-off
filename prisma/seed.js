"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const services = [
        {
            nameUz: '📄 Hujjat tarjimasi',
            nameRu: '📄 Перевод документов',
            nameEn: '📄 Document Translation',
            descriptionUz: 'Har xil turdagi rasmiy va shaxsiy hujjatlarni tarjima qilish',
            descriptionRu: 'Перевод различных официальных и личных документов',
            descriptionEn: 'Translation of various official and personal documents',
            price: 30000,
            priceType: client_1.PriceType.PER_PAGE,
            isActive: true,
        },
        {
            nameUz: '📜 Notarial tarjima',
            nameRu: '📜 Нотариальный перевод',
            nameEn: '📜 Notarized Translation',
            descriptionUz: 'Notarius tomonidan tasdiqlanadigan rasmiy hujjatlar tarjimasi',
            descriptionRu: 'Официальный перевод документов с нотариальным заверением',
            descriptionEn: 'Official document translation with notary certification',
            price: 50000,
            priceType: client_1.PriceType.PER_PAGE,
            isActive: true,
        },
        {
            nameUz: '🎓 Diplom tarjimasi',
            nameRu: '🎓 Перевод диплома',
            nameEn: '🎓 Diploma Translation',
            descriptionUz: 'Diplom va uning ilovasini to‘liq tarjima qilish xizmati',
            descriptionRu: 'Полный перевод диплома и приложения к нему',
            descriptionEn: 'Full translation of diploma and supplement',
            price: 80000,
            priceType: client_1.PriceType.FIXED,
            isActive: true,
        },
        {
            nameUz: '📑 Apostil xizmati',
            nameRu: '📑 Услуга апостиля',
            nameEn: '📑 Apostille Service',
            descriptionUz: 'Hujjatlarga apostil qo‘yish va tayyorlash xizmati',
            descriptionRu: 'Услуга апостилирования и подготовки документов',
            descriptionEn: 'Apostille legalization and document preparation service',
            price: 100000,
            priceType: client_1.PriceType.FIXED,
            isActive: true,
        },
        {
            nameUz: '⚡ Tezkor tarjima',
            nameRu: '⚡ Срочный перевод',
            nameEn: '⚡ Express Translation',
            descriptionUz: '24 soat ichida bajariladigan tezkor tarjima xizmati',
            descriptionRu: 'Услуга срочного перевода в течение 24 часов',
            descriptionEn: 'Fast-track translation completed within 24 hours',
            price: 50000,
            priceType: client_1.PriceType.PER_PAGE,
            isActive: true,
        },
    ];
    for (const s of services) {
        const existing = await prisma.service.findFirst({
            where: { nameUz: s.nameUz },
        });
        if (!existing) {
            await prisma.service.create({
                data: s,
            });
            console.log(`✅ Created service: ${s.nameUz}`);
        }
        else {
            console.log(`ℹ️ Service already exists: ${s.nameUz}`);
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
