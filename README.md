# 🌐 Telegram Translation Service Bot

Professional Telegram bot for ordering document translation services, paying via modular payment integrations (Click, Payme, Mock), tracking order statuses, and administering translation operations built with **Node.js**, **TypeScript**, **Telegraf**, **PostgreSQL**, and **Prisma ORM**.

---

## 🛠 Features

- **🌐 Multi-language Support**: Full UI localization in Uzbek (🇺🇿), Russian (🇷🇺), and English (🇬🇧).
- **👤 Registration & Profile Management**: Surname, First Name, Contact collection via Telegram `request_contact` button or validated international phone formats (`+998...`).
- **📄 Translation Services Catalog**: Dynamic database-driven translation services with per-page or fixed pricing.
- **📎 Document Upload & Parsing**: Accepts PDF, DOC, DOCX, JPG, JPEG, PNG. Automatic page count detection for PDF files.
- **💳 Modular Payment Gateway Layer**:
  - Independent `PaymentService` interface.
  - Server-calculated total price to prevent client tampering.
  - Built-in support for Click, Payme, and instant Mock provider for production/staging testing.
- **📦 Order Tracking**: Live order statuses (`PENDING`, `WAITING_PAYMENT`, `PAID`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **🛠 Admin Telegram Dashboard (`/admin`)**:
  - Live analytics & statistical metrics (users count, orders, revenue, status breakdown).
  - Service management (toggle active state, create new services with price).
  - Order status updates.
  - Attach completed translation files directly to orders with automated user dispatch.
  - Broadcast notification engine.
- **💾 State Persistence**: FSM steps saved in PostgreSQL, surviving server restarts seamlessly.

---

## 🏗 Architecture & Project Structure

```text
src/
├── app.ts                 # Main bootstrap entrypoint
├── bot/
│   ├── bot.ts             # Telegraf instance setup
│   ├── handlers/          # Modular update handlers (start, reg, service, order, payment, profile, admin)
│   ├── keyboards/         # Inline & custom keyboard builders
│   ├── middlewares/       # Session, auth, i18n, admin, and error middlewares
│   └── states/            # State definitions
├── config/                # Environment variables & Winston logger configuration
├── database/
│   ├── prisma.service.ts  # Prisma database connection service
│   └── repositories/      # DB Repositories (User, Service, Order, Payment)
├── locales/               # i18n JSON files for UZ, RU, EN
├── services/              # Domain services (Payment, Order, User, PDF page counter)
├── types/                 # TypeScript interfaces and enumerations
└── utils/                 # Validators, order number generator, i18n helper
```


