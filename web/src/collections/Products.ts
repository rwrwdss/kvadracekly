import type { CollectionConfig } from "payload";
import { hideFromManager, isAdmin } from "@/access/roles";
import { seoFields, utmFields } from "@/cms/fields/seoUtm";

/**
 * Товары / предложения: маршруты, тарифы, ночной квест и др.
 * Управление: фото, заголовок, описание, цена, SEO, UTM.
 */
export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "Товар", plural: "Товары" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "price", "published", "updatedAt"],
    group: "Контент",
    description: "Карточки услуг с фото, описанием, SEO и UTM-метками.",
    hidden: ({ user }) => hideFromManager(user),
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Основное",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Заголовок",
              required: true,
            },
            {
              name: "slug",
              type: "text",
              label: "Slug (URL)",
              required: true,
              unique: true,
              admin: { description: "Например: zelenoe-ozero" },
            },
            {
              name: "type",
              type: "select",
              label: "Тип",
              required: true,
              options: [
                { label: "Маршрут", value: "route" },
                { label: "Тариф", value: "tariff" },
                { label: "Ночной квест", value: "night" },
                { label: "Техника", value: "fleet" },
                { label: "Услуга", value: "service" },
                { label: "Прочее", value: "other" },
              ],
            },
            {
              name: "shortDescription",
              type: "textarea",
              label: "Короткое описание",
            },
            {
              name: "description",
              type: "textarea",
              label: "Полное описание",
            },
            {
              name: "price",
              type: "number",
              label: "Цена, ₽",
              min: 0,
            },
            {
              name: "priceNote",
              type: "text",
              label: "Пояснение к цене",
              admin: { description: "Например: за квадроцикл / за двоих" },
            },
            {
              name: "published",
              type: "checkbox",
              label: "Опубликовано",
              defaultValue: true,
            },
          ],
        },
        {
          label: "Фото",
          fields: [
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              label: "Обложка",
              required: true,
            },
            {
              name: "gallery",
              type: "array",
              label: "Доп. фото",
              labels: { singular: "Фото", plural: "Фото" },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                {
                  name: "caption",
                  type: "text",
                  label: "Подпись",
                },
              ],
            },
          ],
        },
        {
          label: "Параметры маршрута",
          fields: [
            {
              name: "duration",
              type: "text",
              label: "Длительность",
            },
            {
              name: "distance",
              type: "text",
              label: "Дистанция",
            },
            {
              name: "difficulty",
              type: "select",
              label: "Сложность",
              options: [
                { label: "Лёгкий", value: "easy" },
                { label: "Средний", value: "medium" },
                { label: "Сложный", value: "hard" },
              ],
            },
            {
              name: "progressOrder",
              type: "number",
              label: "Порядок прогресса (1→2→3→4)",
              admin: { description: "Только для маршрутов с разблокировкой" },
            },
            {
              name: "audience",
              type: "text",
              label: "Для кого",
            },
          ],
        },
        {
          label: "SEO",
          fields: [seoFields],
        },
        {
          label: "UTM",
          fields: [
            utmFields,
            {
              name: "bookingSource",
              type: "text",
              label: "source заявки (CRM)",
              admin: {
                description: "Пишется в заявку при кнопке «Забронировать» с карточки товара",
              },
            },
          ],
        },
      ],
    },
  ],
};
