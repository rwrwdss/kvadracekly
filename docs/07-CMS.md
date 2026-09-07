# CMS / Payload

## Админка

URL: [http://localhost:3000/admin](http://localhost:3000/admin)

При первом входе создайте пользователя-админа.

## Коллекции

| Раздел | Назначение |
|--------|------------|
| **Товары** | Маршруты/тарифы/квест: заголовок, описание, фото, цена, SEO, UTM |
| **Галерея** | Только живые фото на `/galereya` (без стоков) |
| **Медиатека** | Загрузка файлов |
| **Заявки** | Лиды с сайта + UTM |
| **Настройки сайта** | SEO по умолчанию, тексты галереи |

## Галерея

На сайте `/galereya` отображаются **только** документы из коллекции `gallery` с флагом «Опубликовано» и загруженным фото. Пока фото нет — пустое состояние с инструкцией.

## Товар: SEO и UTM

В карточке товара вкладки:
- **SEO** — meta title/description/keywords, OG image, canonical, noindex
- **UTM** — utm_source/medium/campaign/content/term + source заявки в CRM

## Локально / production

**БД:** PostgreSQL через Neon (`DATABASE_URL` в `.env` / Vercel).  
SQLite больше не используется.

**Медиа:** локально папка `media/` (на Vercel для файлов позже — Blob/S3).

Миграции Payload: `src/migrations/`  
```bash
npx payload migrate:create
npx payload migrate
```

Первый вход в `/admin` — создать пользователя-админа (на новой пустой Neon БД).
