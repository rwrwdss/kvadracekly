import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/access/roles";

function revalidateTariffs() {
  try {
    revalidatePath("/tarify");
  } catch {
    /* outside Next request context (migrate/seed) */
  }
}

export const Tariffs: CollectionConfig = {
  slug: "tariffs",
  labels: { singular: "Тариф", plural: "Тарифы" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "price", "published"],
    listSearchableFields: ["title", "badge"],
    group: "Сайт",
    description: "Тексты страницы сверху, карточки тарифов ниже.",
    components: {
      beforeListTable: [
        "./admin/components/CatalogLayoutPanel#TariffsLayoutPanel",
        "./admin/components/CatalogItemsBoard#TariffsItemsBoard",
      ],
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [() => revalidateTariffs()],
    afterDelete: [() => revalidateTariffs()],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Что видит гость",
          description: "Название, цена и описание карточки на странице /tarify",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Название тарифа",
              required: true,
              admin: { description: "Например: Зелёное озеро" },
            },
            {
              name: "badge",
              type: "text",
              label: "Бейдж (маленькая подпись)",
              admin: { description: "Стандарт / Премиум / Премиум+ / Легенда" },
            },
            {
              name: "description",
              type: "textarea",
              label: "Описание",
              required: true,
              admin: { description: "Короткий текст на карточке" },
            },
            {
              name: "audience",
              type: "text",
              label: "Для кого",
              admin: { description: "Например: для новичков" },
            },
          ],
        },
        {
          label: "Цена и маршрут",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "price",
                  type: "number",
                  label: "Цена, ₽",
                  required: true,
                  min: 0,
                  admin: { width: "50%" },
                },
                {
                  name: "priceNote",
                  type: "text",
                  label: "Пояснение к цене",
                  admin: { width: "50%", description: "Например: за двоих" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "duration",
                  type: "text",
                  label: "Длительность (текст)",
                  required: true,
                  admin: { width: "50%", description: "Например: 1,5 часа" },
                },
                {
                  name: "durationMinutes",
                  type: "number",
                  label: "Минуты для слотов",
                  required: true,
                  defaultValue: 60,
                  min: 30,
                  max: 480,
                  admin: { width: "50%", description: "60 / 90 / 120 / 180" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "distance",
                  type: "text",
                  label: "Дистанция",
                  required: true,
                  admin: { width: "50%" },
                },
                {
                  name: "difficultyLabel",
                  type: "text",
                  label: "Сложность (как на сайте)",
                  required: true,
                  admin: { width: "50%", description: "Лёгкий / Средний / Сложный" },
                },
              ],
            },
            {
              name: "difficulty",
              type: "select",
              label: "Сложность (код)",
              required: true,
              defaultValue: "easy",
              options: [
                { label: "Лёгкий", value: "easy" },
                { label: "Средний", value: "medium" },
                { label: "Сложный", value: "hard" },
              ],
            },
            {
              name: "progressOrder",
              type: "number",
              label: "Порядок прогресса клиента",
              defaultValue: 1,
              min: 1,
              max: 10,
              admin: { description: "1 = первый маршрут, 2 = следующий…" },
            },
          ],
        },
        {
          label: "Фото",
          fields: [
            {
              name: "imageUrl",
              type: "text",
              label: "Картинка",
              admin: {
                description: "Кнопка «Заменить фотографию». Путь — запасной.",
                components: {
                  Field: "./admin/components/ImagePathField#ImagePathField",
                },
              },
            },
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              label: "Загруженный файл (Media)",
              admin: {
                description: "Приоритет над путём, если задан.",
              },
              filterOptions: {
                mimeType: { contains: "image" },
              },
            },
            {
              name: "imageAlt",
              type: "text",
              label: "Описание картинки (для слабовидящих)",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      type: "text",
      label: "Технический код (slug)",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: "Не меняйте без нужды. Например: zelenoe-ozero",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок на сайте",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Меньше число — выше в списке" },
    },
    {
      name: "season",
      type: "select",
      label: "Сезон",
      defaultValue: "atv",
      options: [
        { label: "Квадроциклы", value: "atv" },
        { label: "Снегоходы", value: "snow" },
        { label: "Всегда", value: "all" },
        { label: "Будущий / заготовка", value: "future" },
        { label: "Выкл", value: "off" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "activeForBooking",
      type: "checkbox",
      label: "Можно бронировать онлайн",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "published",
      type: "checkbox",
      label: "Показывать на сайте",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
