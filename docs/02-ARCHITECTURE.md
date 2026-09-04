# Архитектура «Вольница»

**Стек:** Next.js (App Router) · **Payload CMS (opensource) как CMS + CRM** · PostgreSQL · Vercel · домен `.ru`  
**Дизайн:** прототипы 1:1 · **Контент маршрутов/цен:** бизнес-план 02.09.2026  
**Прогресс трасс:** [05-ROUTE-PROGRESS.md](./05-ROUTE-PROGRESS.md) · **CRM-детали:** [06-CRM-PAYLOAD.md](./06-CRM-PAYLOAD.md)

---

## 1. Принцип системы

Один продукт из двух поверхностей:

| Поверхность | Для кого | Где |
|-------------|----------|-----|
| **Публичный сайт** | гости, клиенты ЛК | `volnitsa.ru` (имя уточняется) |
| **CRM / Admin (Payload)** | менеджеры Заказчика | `/admin` |

**Все формы и заявки с сайта падают только в CRM на Payload** — вкладка «Заявки», карточка клиента в базе, запись в PostgreSQL, уведомление менеджеру. Отдельной внешней CRM на этапе 1 нет: Payload **форкаем/кастомизируем** под задачи бизнеса (коллекции, хуки, уведомления, прогресс маршрутов).

```
                    ┌──────────────────────┐
   Гость / Клиент   │  Сайт (Next.js)      │
   формы, ЛК        │  Vercel + .ru HTTPS  │
                    └──────────┬───────────┘
                               │ Server Action / API
                               ▼
                    ┌──────────────────────┐
   Менеджер         │  Payload CRM-fork    │
   /admin           │  Заявки · Клиенты ·  │
                    │  Уведомления · CMS · │
                    │  Прогресс маршрутов  │
                    └──────────┬───────────┘
                               ▼
                         PostgreSQL
                         (Neon / Vercel Postgres)
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
              Telegram bot            Email
              (один канал на выбор до старта)
```

---

## 2. Карта публичного сайта

```
/                         Главная
/marshruty                Маршруты (4 дневных + общая карта)
/marshruty/[slug]         Деталь (опц.)
/tehnika                  Техника
/tarify                   Тарифы
/nochnoj-kvest            Ночной квест
/usadba                   Усадьба / доп. услуги (паттерн, без JPG)
/galereya                 Галерея
/faq                      FAQ
/lk                       ЛК: прогресс трасс + бронь открытых
/lk/vhod · /lk/registraciya
/admin                    Payload CRM (закрытый)
```

**Глобально:** Header · Footer · Sticky mobile CTA · модал «Забронировать» (единая форма → CRM).

### Навигация
`Маршруты · Техника · Тарифы · Ночной квест · Усадьба · Галерея · FAQ` + **Забронировать**  
(БП иногда пишет «Доп. услуги» — на согласовании; по умолчанию **Усадьба**.)

### Маршруты и цены (БП)

| # | Маршрут | Время | Км | Цена | Unlock |
|---|---------|-------|-----|------|--------|
| 1 | Зелёное озеро | 45–60 мин | 9–11 | 5 500 ₽ | сразу |
| 2 | Памятник | 1–1,5 ч | 13–15 | 7 500 ₽ | после 1 |
| 3 | Родник | 1–2 ч | 15–22 | 10 000 ₽ | после 2 |
| 4 | Экспедиция | уточн. | уточн. | 12 000 ₽ | после 3 |
| — | Ночной | уточн. | уточн. | 15 000 ₽ / двое | вне цепочки |

Одна **общая карта** всех треков и точек (не баннер на каждый маршрут).

---

## 3. Payload = CMS + CRM (форк под бизнес)

База: **Payload 3 (MIT, opensource)** в одном Next.js-приложении.  
«Форк» на этапе 1 = **свой репозиторий проекта** с кастомными коллекциями, хуками, access, UI-группировкой admin, без внешней Salesforce/Bitrix.

### 3.1. Зоны admin

| Зона меню | Коллекции | Задача менеджера |
|-----------|-----------|------------------|
| **CRM · Заявки** | `leads` | Все заявки с сайта: статус, источник, маршрут, дата |
| **CRM · Клиенты** | `customers` | База клиентов: телефон, история заявок, прогресс трасс |
| **CRM · Уведомления** | `notifications` + лог | История отправок; настройка канала (TG/email) в globals |
| **Контент** | `routes`, `fleet`, `tariffs`, `gallery`, `faq`, `pages`/globals | Тексты, цены, фото без разработчика |
| **Операции** | `route-progress` | Отметить «маршрут пройден» → открыть следующий в ЛК |
| **Система** | `users` (admin), media, season | Доступы, сезон лето/зима |

### 3.2. Поток заявки (единый)

```
Форма на сайте
  → валидация
  → upsert Клиента по телефону (customers)
  → create Заявки (leads) + связь с customer
  → create Notification log + push в Telegram XOR email
  → UI «Заявка принята»
```

Источники заявок (поле `source`):
- `booking_modal` — Забронировать / sticky CTA
- `route_select` — «Выбрать маршрут»
- `tariff_select` — «Выбрать тариф»
- `night_quest` — ночной квест
- `fleet_help` — подобрать технику
- `contact_faq` — остались вопросы
- `lk_booking` — бронь из ЛК (с проверкой unlock)

### 3.3. Модель данных (ядро)

**`customers`** (база клиентов)
- name, phone (unique), email?
- notes, createdAt, lastLeadAt
- link → leads[], routeProgress[]
- optional: связанный аккаунт ЛК (`account`)

**`leads`** (заявки)
- customer (relation)
- name, phone (денормализация на момент заявки)
- preferredDate, preferredTime?
- route?, tariff?, message
- source, status: `new` | `in_progress` | `confirmed` | `done` | `cancelled` | `spam`
- meta: pageUrl, utm?, userAgent?
- notifiedAt, notifyError?

**`notifications`**
- type, channel (`telegram`|`email`), payload, status, lead?, createdAt

**Контент:** `routes` (progressOrder, price, duration, distance, difficulty…), `fleet`, `tariffs`, `gallery`, `faq`  
**Прогресс:** `route-progress` (customer/account, route, completedAt, confirmedByAdmin)  
**Globals:** `site-settings` (контакты, сезон, notify channel + token/chat), `home-hero` при необходимости

### 3.4. Уведомления
Один канал до старта (выбор Заказчика):
- Telegram: бот → chat_id менеджера при `leads.afterChange` create
- или Email: SMTP/Resend на адрес менеджера  

В CRM вкладка/коллекция показывает лог: доставлено / ошибка. Повторная отправка — кнопка в карточке заявки (в лимите этапа — базовая).

### 3.5. Антиспам (базово, в scope US-04)
Повтор заявки с тем же телефоном за короткий интервал → warning / не дублировать шум (на усмотрение реализации).

---

## 4. Публичный сайт ↔ CRM

| Действие на сайте | Что в CRM |
|-------------------|-----------|
| Любая форма брони | lead + customer |
| Регистрация ЛК | customer / account + progressOrder=1 открыт |
| Админ «пройден маршрут N» | route-progress → ЛК открывает N+1 |
| Смена цены/текста в admin | сразу на сайте (SSR/revalidate) |

Гость без ЛК: заявка сохраняется, прогресс трасс **не** ведётся.  
Клиент ЛК: бронь только на unlocked маршруты; заявка всё равно в `leads`.

---

## 5. Хостинг и инфра

| Компонент | Решение |
|-----------|---------|
| Frontend + Payload admin | **Vercel** (один Next.js deploy) |
| Домен | **.ru** → DNS Vercel, SSL (US-01) |
| БД | **PostgreSQL** managed (Neon + pooler рекомендуется) |
| Медиа | Vercel Blob или S3-совместимое |
| Секреты | Vercel env: `DATABASE_URL`, `PAYLOAD_SECRET`, TG/email keys |
| Staging | preview-деплой Vercel (по необходимости) |

Payload на serverless: connection pooling обязателен.

---

## 6. Структура репозитория

```
volnitsa/
  app/
    (site)/                 # публичные страницы
    (lk)/                   # личный кабинет
    (payload)/admin/[[...]] # CRM UI
    api/                    # payload REST/graphql + booking action
  collections/              # Payload collections (CRM + CMS)
  globals/
  components/
    ui/ sections/ booking/ lk/
  lib/
    crm/                    # createLead, upsertCustomer, notify
    progress/               # canBookRoute(user, route)
    payload.ts
  styles/tokens.css
  docs/                     # эта документация
  .env.example
```

Форк = этот репозиторий + кастом Payload; upstream Payload обновляем осознанно.

---

## 7. Прототипы → страницы

| Реф | Экран |
|-----|--------|
| 01–02 | Главная |
| 03–04 | Маршруты (UI 04, данные БП) |
| 05 | Техника (парк из БП) |
| 06 | Тарифы (= пакеты маршрутов по ценам БП) |
| 07 | Ночной квест |
| 08 | Галерея |
| 09 | FAQ |
| — | Усадьба, ЛК, CRM admin — паттерн / Payload UI |

---

## 8. План работ (35 ч / US)

| Фаза | Содержание | US |
|------|------------|-----|
| 0 | Next + Payload + Postgres + токены брендбука | — |
| 1 | Домен .ru, DNS, SSL на Vercel | US-01 |
| 2 | Согласование UI-токенов по прототипам | US-02 |
| 3 | Shell сайта + единая форма → CRM | US-03 |
| 4 | Вёрстка страниц 1:1 | US-03 |
| 5 | Коллекции CMS + CRM (заявки, клиенты, лог уведомлений) | US-04 |
| 6 | Канал уведомлений TG/email | US-04 |
| 7 | Auth ЛК + цепочка маршрутов 1→2→3→4 | US-06 |
| 8 | QA ≤10 правок, инструкция CRM, акт | US-05 |

---

## 9. Scope этапа 1 / не входит

**Входит:** сайт по прототипам, формы → Payload CRM (заявки + клиенты + уведомление), контент CMS, прогресс маршрутов, ЛК, Vercel, .ru.

**Не входит:** онлайн-оплата; SEO-реклама; копирайт/фотосъёмка; отдельная «большая» CRM с воронками/телефонией/1С; глубокий редизайн admin Payload; экраны вне прототипов; поддержка после Акта.

Расширение форка CRM (воронка, задачи, роли менеджеров, дашборды) — после этапа 1 по ставке/новому приложению.
