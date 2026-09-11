import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag, X, Plus, Minus, Search, Check, Shirt, Footprints, ChevronRight, Banknote,
  LayoutDashboard, Package, BarChart3, Lock, LogOut, Trash2, Pencil, Star, Ruler, Send,
  Clock, XCircle, CheckCircle2, Bell, PhoneCall, ListOrdered, Settings as SettingsIcon,
  Database, AlertTriangle, RefreshCw, ImagePlus, CreditCard,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

/* ---------------------------- static data ---------------------------- */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ==================== НАСТРОЙКИ МАГАЗИНА ====================
// ВСТАВЬ СЮДА свои реальные данные.
// Telegram Bot Token: @BotFather
// Telegram Chat ID: ID чата владельца
// Номер карты: карта, на которую клиент переводит оплату.
const TELEGRAM_TOKEN = "8913280630:AAHULsvFvcDJHoknMTe3TiXHqlIcQJXP3Jk";
const TELEGRAM_CHAT_ID = "315881723";
const CARD_NUMBER = "5614688719547795";
// =============================================================
const GRADIENTS = [["#C7A64A", "#9C4A3F"], ["#C7A64A", "#6B7F5E"], ["#3E4C59", "#5A6B78"], ["#C7A64A", "#A97B4F"]];
const COLOR_PALETTE = [
  { name: "Чёрный", hex: "#1F1D1B" }, { name: "Белый", hex: "#F2F0EA" }, { name: "Бежевый", hex: "#C9B79C" },
  { name: "Оливковый", hex: "#5C6B4F" }, { name: "Бордовый", hex: "#C7A64A" }, { name: "Серый", hex: "#C7A64A" },
];

// Цвета, которые могут быть введены вручную при создании/изменении товара.
// Если цвета нет в основной палитре, кружок всё равно получает правильный оттенок,
// а не серый цвет-заглушку.
const COLOR_HEX_ALIASES = {
  "чёрный": "#1F1D1B", "черный": "#1F1D1B", "black": "#1F1D1B",
  "белый": "#F2F0EA", "white": "#F2F0EA",
  "бежевый": "#C9B79C", "beige": "#C9B79C",
  "оливковый": "#5C6B4F", "olive": "#5C6B4F",
  "бордовый": "#C7A64A", "бордо": "#C7A64A", "burgundy": "#C7A64A",
  "серый": "#C7A64A", "серебристый": "#A7A9AC", "silver": "#A7A9AC", "gray": "#C7A64A", "grey": "#C7A64A",
  "синий": "#315A8A", "синій": "#315A8A", "blue": "#315A8A",
  "тёмно-синий": "#17365D", "темно-синий": "#17365D", "тёмно синий": "#17365D", "темно синий": "#17365D",
  "голубой": "#79A9D1", "светло-синий": "#79A9D1", "небесный": "#79A9D1", "sky blue": "#79A9D1",
  "зелёный": "#4F6F45", "зеленый": "#4F6F45", "green": "#4F6F45",
  "тёмно-зелёный": "#244B2A", "темно-зеленый": "#244B2A", "тёмно зелёный": "#244B2A", "темно зеленый": "#244B2A",
  "красный": "#A83232", "красный": "#A83232", "red": "#A83232",
  "розовый": "#D98FA5", "pink": "#D98FA5",
  "фиолетовый": "#70518C", "purple": "#70518C",
  "коричневый": "#795548", "коричневый": "#795548", "brown": "#795548",
  "шоколадный": "#5B3A29", "шоколад": "#5B3A29",
  "жёлтый": "#D6AE2D", "желтый": "#D6AE2D", "yellow": "#D6AE2D",
  "оранжевый": "#C97832", "orange": "#C97832",
  "молочный": "#F3E8D0", "молочный белый": "#F3E8D0", "айвори": "#F2E7CE", "ivory": "#F2E7CE",
  "экрю": "#DCCDB5", "экрю": "#DCCDB5", "хаки": "#66704D", "khaki": "#66704D",
  "графит": "#3E4146", "графитовый": "#3E4146",
  "песочный": "#C8AA7A", "песочный": "#C8AA7A",
  "кремовый": "#EFE1C3", "cream": "#EFE1C3",
  "мятный": "#9BC7B5", "бирюзовый": "#3BA7A0", "бирюза": "#3BA7A0",
  "золотой": "#C7A64A", "золотистый": "#C7A64A", "gold": "#C7A64A",
};

function getColorHex(name) {
  const normalized = String(name || "").trim().toLowerCase();
  if (!normalized) return "#C9C2B8";
  const paletteMatch = COLOR_PALETTE.find((c) => c.name.toLowerCase() === normalized);
  if (paletteMatch) return paletteMatch.hex;
  if (COLOR_HEX_ALIASES[normalized]) return COLOR_HEX_ALIASES[normalized];
  // Позволяет вводить HEX напрямую, например #1e40af.
  if (/^#[0-9a-f]{3,8}$/i.test(normalized)) return normalized;
  return "#C9C2B8";
}
const SIZE_CHART = {
  clothing: [{ size: "XS", chest: "84–88", waist: "64–68" }, { size: "S", chest: "88–92", waist: "68–72" }, { size: "M", chest: "92–96", waist: "72–76" }, { size: "L", chest: "96–100", waist: "76–80" }, { size: "XL", chest: "100–104", waist: "80–84" }, { size: "XXL", chest: "104–108", waist: "84–88" }],
  shoes: [{ size: "36", foot: "23.0" }, { size: "37", foot: "23.5" }, { size: "38", foot: "24.5" }, { size: "39", foot: "25.0" }, { size: "40", foot: "25.5" }, { size: "41", foot: "26.5" }, { size: "42", foot: "27.0" }, { size: "43", foot: "27.5" }, { size: "44", foot: "28.5" }, { size: "45", foot: "29.0" }],
};
const ADMIN_PASSWORD = "parij2024";
const MONTH_LABELS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const WEEKDAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const PERIODS = [{ id: "day", label: "День" }, { id: "week", label: "Неделя" }, { id: "month", label: "Месяц" }, { id: "year", label: "Год" }];
const STATUS_META = {
  new: { label: "Ждёт оплаты", color: "#C7A64A", icon: Bell },
  processing: { label: "В обработке", color: "#C7A64A", icon: Clock },
  delivered: { label: "Доставлен", color: "#C7A64A", icon: CheckCircle2 },
  cancelled: { label: "Отменён", color: "#C7A64A", icon: XCircle },
};
const STATUS_ORDER = ["new", "processing", "delivered", "cancelled"];

/* ------------------------------ helpers ------------------------------ */

function formatSum(n) { return Math.round(n).toLocaleString("ru-RU").replace(/,/g, " "); }
function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function sizesFor(category) { return category === "shoes" ? SIZE_CHART.shoes.map((s) => s.size) : SIZE_CHART.clothing.map((s) => s.size); }
function colorsFor(id) { const start = id % COLOR_PALETTE.length; return [0, 1, 2].map((i) => COLOR_PALETTE[(start + i) % COLOR_PALETTE.length]); }
function describe(p, lang = "ru") {
  if (lang === "uz") {
    return p.category === "shoes"
      ? `«${p.name}» modeli Paris Clothes kolleksiyasidan. Sifatli materiallar va kundalik foydalanish uchun qulay kolodka.`
      : `«${p.name}» modeli Paris Clothes kolleksiyasidan. Yoqimli bichim, sifatli materiallar va kundalik obrazlar uchun mos.`;
  }
  return p.category === "shoes"
    ? `Модель «${p.name}» из коллекции Paris Clothes. Качественные материалы, удобная колодка для ежедневной носки.`
    : `Модель «${p.name}» из коллекции Paris Clothes. Приятная посадка, качественные материалы, подходит для повседневных образов.`;
}
function cartKey(id, size, color) { return `${id}__${size}__${color}`; }
function variantKey(size, color) { return `${String(size || "—").trim()}__${String(color || "—").trim()}`; }
function getVariantStock(product, size, color) {
  const map = product?.variant_stock;
  if (!map || typeof map !== "object" || Object.keys(map).length === 0) return null;
  return Number(map[variantKey(size, color)] || 0);
}

// Сопоставляет выбранный цвет с загруженным фото для этого цвета,
// игнорируя лишние пробелы и разный регистр букв.
function getColorImage(colorImages, colorName) {
  if (!colorImages || !colorName) return null;
  const key = Object.keys(colorImages).find(
    (k) => k.trim().toLowerCase() === colorName.trim().toLowerCase()
  );
  return key ? colorImages[key] : null;
}

async function loadLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Не удалось сохранить настройки:", e);
  }
}


const TRANSLATIONS = {
  ru: {
    "Чёрный": "Чёрный", "Белый": "Белый", "Бежевый": "Бежевый", "Оливковый": "Оливковый", "Бордовый": "Бордовый", "Серый": "Серый",
    "Янв": "Янв", "Фев": "Фев", "Мар": "Мар", "Апр": "Апр", "Май": "Май", "Июн": "Июн", "Июл": "Июл", "Авг": "Авг", "Сен": "Сен", "Окт": "Окт", "Ноя": "Ноя", "Дек": "Дек",
    "Вс": "Вс", "Пн": "Пн", "Вт": "Вт", "Ср": "Ср", "Чт": "Чт", "Пт": "Пт", "Сб": "Сб",
    "День": "День", "Неделя": "Неделя", "Месяц": "Месяц", "Год": "Год",
    "Ждёт оплаты": "Ждёт оплаты", "В обработке": "В обработке", "Доставлен": "Доставлен", "Отменён": "Отменён",
    "Все": "Все", "Одежда": "Одежда", "Обувь": "Обувь", "Футболки": "Футболки", "Рубашки": "Рубашки", "Ветровки": "Ветровки", "Куртки": "Куртки", "Брюки": "Брюки", "Джинсы": "Джинсы", "Худи / Свитера": "Худи / Свитера", "Кроссовки": "Кроссовки", "Туфли": "Туфли", "Ботинки": "Ботинки", "Сандалии": "Сандалии", "Без типа": "Без типа", "Тип товара": "Тип товара", "Поиск товара": "Поиск товара", "Нет в наличии": "Нет в наличии",
    "Ваше имя": "Ваше имя", "Город, улица, дом": "Город, улица, дом", "Отправляем…": "Отправляем…", "Я оплатил(а)": "Я оплатил(а)",
    "Выберите размер и цвет": "Выберите размер и цвет", "Добавить в корзину": "Добавить в корзину", "Комментарий": "Комментарий", "Пароль": "Пароль",
    "Выручка": "Выручка", "Продано офлайн": "Продано офлайн", "Поступление": "Поступление", "Сайт": "Сайт", "Офлайн": "Офлайн", "Офлайн продажи": "Офлайн продажи", "Продать": "Продать", "Продажа записана": "Продажа записана",
    "Название товара": "Название товара", "Загрузка…": "Загрузка…", "Выбрать": "Выбрать", "Загрузить/заменить фото": "Загрузить/заменить фото",
    "Имя Фамилия": "Имя Фамилия", "Отправлено успешно.": "Отправлено успешно.", "Отправлено": "Отправлено", "Ошибка": "Ошибка",
    "Загрузка": "Загрузка", "Подключаем…": "Подключаем…", "Подключить": "Подключить",
    "Статус заказа": "Статус заказа", "Панель управления": "Панель управления", "Новая коллекция": "Новая коллекция",
    "Одежда и обувь, которую хочется носить каждый день.": "Одежда и обувь, которую хочется носить каждый день.",
    "Магазин Paris Clothes теперь онлайн — выбирайте, добавляйте в корзину и оформляйте заказ в пару кликов.": "Магазин Paris Clothes теперь онлайн — выбирайте, добавляйте в корзину и оформляйте заказ в пару кликов.",
    "Подробнее →": "Подробнее →", "Корзина": "Корзина", "Корзина пуста": "Корзина пуста", "Итого": "Итого", "Оформить заказ": "Оформить заказ",
    "Оформление заказа": "Оформление заказа", "Имя": "Имя", "Телефон": "Телефон", "Второй телефон": "Второй телефон", "Город": "Город", "Улица": "Улица", "Адрес доставки": "Адрес доставки", "Подтвердить заказ": "Подтвердить заказ",
    "Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.": "Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.",
    "Оплата получена": "Оплата получена", "Спасибо,": "Спасибо,", "Вернуться в каталог": "Вернуться в каталог", "Заказ принят": "Заказ принят",
    "Оплатите картой": "Оплатите картой", "Продавец ещё не указал номер карты. Свяжитесь с нами для оплаты.": "Продавец ещё не указал номер карты. Свяжитесь с нами для оплаты.",
    "Переведите сумму на карту выше, затем прикрепите скриншот оплаты. Без скриншота заказ не создаётся.": "Переведите сумму на карту выше, затем нажмите кнопку ниже — мы получим уведомление о вашей оплате.",
    "Оплачу позже / вернуться в каталог": "Оплачу позже / вернуться в каталог", "Фото-заглушки — продавец ещё не загрузил настоящее фото": "Фото-заглушки — продавец ещё не загрузил настоящее фото",
    "Пока нет отзывов": "Пока нет отзывов", "· выберите": "· выберите", "Таблица размеров": "Таблица размеров", "С этим покупают": "С этим покупают",
    "Отзывы": "Отзывы", "Будьте первым, кто оставит отзыв": "Будьте первым, кто оставит отзыв", "Отправить": "Отправить", "Размер": "Размер",
    "Грудь, см": "Грудь, см", "Талия, см": "Талия, см", "Стопа, см": "Стопа, см", "Введите номер телефона, указанный при заказе": "Введите номер телефона, указанный при заказе",
    "Заказы не найдены": "Заказы не найдены", "Записать продажу и списать со склада": "Записать продажу и списать со склада",
    "Paris Clothes · вход для администратора": "Paris Clothes · вход для администратора", "Неверный пароль": "Неверный пароль", "Войти": "Войти",
    "← Вернуться в магазин": "← Вернуться в магазин", "Обновить": "Обновить", "В магазин": "В магазин", "Выйти": "Выйти", "Статистика": "Статистика",
    "Заказы": "Заказы", "Товары": "Товары", "Настройки": "Настройки", "Заказов": "Заказов", "Товаров продано": "Товаров продано", "Средний чек": "Средний чек", "Наличные": "Наличные", "Карта": "Карта",
    "Динамика выручки": "Динамика выручки", "Топ товаров по выручке": "Топ товаров по выручке", "Нет продаж за период": "Нет продаж за период",
    "Онлайн / офлайн": "Онлайн / офлайн", "Доля продаж на сайте за выбранный период": "Доля продаж на сайте за выбранный период",
    "Быстрая корректировка остатков": "Быстрая корректировка остатков", "Заказов не найдено": "Заказов не найдено", "Удалить (ошибка)": "Удалить (ошибка)",
    "Название": "Название", "Категория": "Категория", "Цена, сум": "Цена, сум", "Остаток": "Остаток", "Фото": "Фото", "Добавить": "Добавить", "Товар": "Товар", "Цена": "Цена", "Цена продажи": "Цена продажи",
    "Подключение к базе данных": "Подключение к базе данных", "Сохранить и переподключиться": "Сохранить и переподключиться",
    "Добавить тестовые заказы (для графика)": "Добавить тестовые заказы (для графика)", "Оплата картой": "Оплата картой",
    "Номер карты": "Номер карты", "Получатель (необязательно)": "Получатель (необязательно)", "Сохранить": "Сохранить", "Уведомления в Telegram": "Уведомления в Telegram",
    "Тест": "Тест", "Журнал": "Журнал", "Появится, когда клиент подтвердит оплату": "Появится, когда клиент подтвердит оплату",
    "Ошибка:": "Ошибка:", "В наличии:": "В наличии:", "К оплате:": "К оплате:", "Остаток:": "Остаток:", "Спасибо,": "Спасибо,", "Цвет": "Цвет", "Размеры через запятую": "Размеры через запятую", "Цвета через запятую": "Цвета через запятую", "Заказов не найдено": "Заказов не найдено",
    "Фото по цветам": "Фото по цветам",
  },
  uz: {
    "Чёрный": "Qora", "Белый": "Oq", "Бежевый": "Bej", "Оливковый": "Zaytun rang", "Бордовый": "Bordo", "Серый": "Kulrang",
    "Янв": "Yan", "Фев": "Fev", "Мар": "Mar", "Апр": "Apr", "Май": "May", "Июн": "Iyun", "Июл": "Iyul", "Авг": "Avg", "Сен": "Sen", "Окт": "Okt", "Ноя": "Noy", "Дек": "Dek",
    "Вс": "Ya", "Пн": "Du", "Вт": "Se", "Ср": "Ch", "Чт": "Pa", "Пт": "Ju", "Сб": "Sh",
    "День": "Kun", "Неделя": "Hafta", "Месяц": "Oy", "Год": "Yil",
    "Ждёт оплаты": "To‘lov kutilmoqda", "В обработке": "Jarayonda", "Доставлен": "Yetkazildi", "Отменён": "Bekor qilingan",
    "Все": "Barchasi", "Одежда": "Kiyim", "Обувь": "Oyoq kiyim", "Футболки": "Futbolkalar", "Рубашки": "Ko‘ylaklar", "Ветровки": "Vetrovkalar", "Куртки": "Kurtkalar", "Брюки": "Shimlar", "Джинсы": "Jinsilar", "Худи / Свитера": "Hudi / Sviterlar", "Кроссовки": "Krossovkalar", "Туфли": "Tuflilar", "Ботинки": "Botinkalar", "Сандалии": "Sandalilar", "Без типа": "Turi yo‘q", "Тип товара": "Mahsulot turi", "Поиск товара": "Mahsulot qidirish", "Нет в наличии": "Mavjud emas",
    "Ваше имя": "Ismingiz", "Город, улица, дом": "Shahar, ko‘cha, uy", "Отправляем…": "Yuborilmoqda…", "Я оплатил(а)": "To‘ladim",
    "Выберите размер и цвет": "O‘lcham va rangni tanlang", "Добавить в корзину": "Savatga qo‘shish", "Комментарий": "Izoh", "Пароль": "Parol",
    "Выручка": "Tushum", "Продано офлайн": "Oflayn sotildi", "Поступление": "Kirim", "Сайт": "Sayt", "Офлайн": "Oflayn", "Офлайн продажи": "Oflayn sotuvlar", "Продать": "Sotish", "Продажа записана": "Sotuv yozildi",
    "Название товара": "Mahsulot nomi", "Загрузка…": "Yuklanmoqda…", "Выбрать": "Tanlash", "Загрузить/заменить фото": "Rasm yuklash/almashtirish",
    "Имя Фамилия": "Ism Familiya", "Отправлено успешно.": "Muvaffaqiyatli yuborildi.", "Отправлено": "Yuborildi", "Ошибка": "Xatolik",
    "Подключаем…": "Ulanmoqda…", "Подключить": "Ulash",
    "Статус заказа": "Buyurtma holati", "Панель управления": "Boshqaruv paneli", "Новая коллекция": "Yangi kolleksiya",
    "Одежда и обувь, которую хочется носить каждый день.": "Har kuni kiyishni istaydigan kiyim va oyoq kiyimlar.",
    "Магазин Paris Clothes теперь онлайн — выбирайте, добавляйте в корзину и оформляйте заказ в пару кликов.": "Paris Clothes endi onlayn — mahsulot tanlang, savatga qo‘shing va buyurtmani bir necha bosishda rasmiylashtiring.",
    "Подробнее →": "Batafsil →", "Корзина": "Savat", "Корзина пуста": "Savat bo‘sh", "Итого": "Jami", "Оформить заказ": "Buyurtma berish",
    "Оформление заказа": "Buyurtmani rasmiylashtirish", "Имя": "Ism", "Телефон": "Telefon", "Второй телефон": "Ikkinchi telefon", "Город": "Shahar", "Улица": "Ko‘cha", "Адрес доставки": "Yetkazib berish manzili", "Подтвердить заказ": "Buyurtmani tasdiqlash",
    "Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.": "To‘lov faqat karta orqali. Pul o‘tkazish uchun karta raqami buyurtmadan keyingi bosqichda ko‘rsatiladi.",
    "Оплата получена": "To‘lov qabul qilindi", "Вернуться в каталог": "Katalogga qaytish", "Заказ принят": "Buyurtma qabul qilindi",
    "Оплатите картой": "Karta orqali to‘lang", "Продавец ещё не указал номер карты. Свяжитесь с нами для оплаты.": "Sotuvchi hali karta raqamini ko‘rsatmagan. To‘lov uchun biz bilan bog‘laning.",
    "Переведите сумму на карту выше, затем нажмите кнопку ниже — мы получим уведомление о вашей оплате.": "Yuqoridagi kartaga summani o‘tkazing va quyidagi tugmani bosing — to‘lovingiz haqida xabar olamiz.",
    "Оплачу позже / вернуться в каталог": "Keyinroq to‘layman / katalogga qaytish", "Фото-заглушки — продавец ещё не загрузил настоящее фото": "Vaqtinchalik rasm — sotuvchi hali haqiqiy rasm yuklamagan",
    "Пока нет отзывов": "Hozircha sharhlar yo‘q", "· выберите": "· tanlang", "Таблица размеров": "O‘lchamlar jadvali", "С этим покупают": "Birga xarid qilinadi",
    "Отзывы": "Sharhlar", "Будьте первым, кто оставит отзыв": "Birinchi bo‘lib sharh qoldiring", "Отправить": "Yuborish", "Размер": "O‘lcham",
    "Грудь, см": "Ko‘krak, sm", "Талия, см": "Bel, sm", "Стопа, см": "Oyoq uzunligi, sm", "Введите номер телефона, указанный при заказе": "Buyurtmada ko‘rsatilgan telefon raqamini kiriting",
    "Заказы не найдены": "Buyurtmalar topilmadi", "Записать продажу и списать со склада": "Sotuvni yozish va ombordan ayirish",
    "Paris Clothes · вход для администратора": "Paris Clothes · administrator kirishi", "Неверный пароль": "Parol noto‘g‘ri", "Войти": "Kirish",
    "← Вернуться в магазин": "← Do‘konga qaytish", "Обновить": "Yangilash", "В магазин": "Do‘konga", "Выйти": "Chiqish", "Статистика": "Statistika",
    "Заказы": "Buyurtmalar", "Товары": "Mahsulotlar", "Настройки": "Sozlamalar", "Заказов": "Buyurtmalar", "Товаров продано": "Sotilgan mahsulotlar", "Средний чек": "O‘rtacha chek", "Наличные": "Naqd pul", "Карта": "Karta",
    "Динамика выручки": "Tushum dinamikasi", "Топ товаров по выручке": "Tushum bo‘yicha top mahsulotlar", "Нет продаж за период": "Bu davrda sotuvlar yo‘q",
    "Онлайн / офлайн": "Onlayn / oflayn", "Доля продаж на сайте за выбранный период": "Tanlangan davrdagi saytdagi sotuvlar ulushi",
    "Быстрая корректировка остатков": "Qoldiqni tezkor o‘zgartirish", "Удалить (ошибка)": "O‘chirish (xato)",
    "Название": "Nomi", "Категория": "Kategoriya", "Цена, сум": "Narx, so‘m", "Остаток": "Qoldiq", "Фото": "Rasm", "Добавить": "Qo‘shish", "Товар": "Mahsulot", "Цена": "Narx", "Цена продажи": "Sotuv narxi",
    "Подключение к базе данных": "Ma’lumotlar bazasiga ulanish", "Сохранить и переподключиться": "Saqlash va qayta ulanish",
    "Добавить тестовые заказы (для графика)": "Grafik uchun test buyurtmalarini qo‘shish", "Оплата картой": "Karta orqali to‘lov",
    "Номер карты": "Karta raqami", "Получатель (необязательно)": "Qabul qiluvchi (ixtiyoriy)", "Сохранить": "Saqlash", "Уведомления в Telegram": "Telegram bildirishnomalari",
    "Тест": "Test", "Журнал": "Jurnal", "Появится, когда клиент подтвердит оплату": "Mijoz to‘lovni tasdiqlaganda paydo bo‘ladi",
    "Создайте бесплатный проект на": "supabase.com saytida bepul loyiha yarating",
    "Откройте SQL Editor и выполните файл": "SQL Editor’ni oching va faylni ishga tushiring",
    "(я его подготовил отдельно)": "(u alohida tayyorlangan)",
    "В настройках проекта → Project Settings → API скопируйте": "Project Settings → API bo‘limidan nusxalang",
    "и": "va",
    "и найдите": "va toping",
    "api.telegram.org/bot&lt;токен&gt;/getUpdates": "api.telegram.org/bot&lt;token&gt;/getUpdates",
    "Пока нет данных за этот период. Загляните на вкладку «Настройки», чтобы добавить тестовые заказы и посмотреть, как выглядит график.": "Bu davr uchun ma’lumot yo‘q. Grafikni ko‘rish uchun «Sozlamalar» bo‘limidan test buyurtmalarini qo‘shing.",
    "«–» — продано офлайн: укажете размер и цвет, товар спишется со склада и попадёт в статистику. «+» — новое поступление.": "«–» — oflayn sotuv: o‘lcham va rangni kiriting, mahsulot ombordan ayriladi va statistikaga qo‘shiladi. «+» — yangi kirim.",
    "Токен бота": "Bot tokeni",
    "Ничего не найдено по запросу": "So‘rov bo‘yicha hech narsa topilmadi",
    "1. Создайте бота через": "1. @BotFather orqali bot yarating.",
    "2. Напишите ему, затем откройте": "2. Unga yozing, so‘ngra",
    "3. Уведомление придёт, когда клиент нажмёт «Я оплатил(а)» после оформления заказа.": "3. Mijoz buyurtmadan keyin «To‘ladim» tugmasini bosganda bildirishnoma keladi.",
    "Project Settings → API в вашем проекте Supabase": "Supabase loyihangizdagi Project Settings → API",
    "Заказов не найдено": "Buyurtmalar topilmadi",
    "Ошибка:": "Xatolik:",
    "Доля продаж на сайте за выбранный период": "Tanlangan davrdagi saytdagi sotuvlar ulushi",
    "Эти реквизиты покупатель увидит сразу после оформления заказа — на них он должен перевести деньги.": "Bu rekvizitlarni xaridor buyurtmadan so‘ng darhol ko‘radi — pulni shu kartaga o‘tkazadi.",
    "Токен бота": "Bot tokeni",
    "Chat ID": "Chat ID",
    "Сайт": "Sayt",
    "Офлайн": "Oflayn", "Офлайн продажи": "Oflayn sotuvlar", "Продать": "Sotish", "Продажа записана": "Sotuv yozildi",
    "Поступление": "Kirim",
    "Новая коллекция": "Yangi kolleksiya",
    "Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.": "To‘lov faqat karta orqali. Pul o‘tkazish uchun karta raqami buyurtmadan keyingi bosqichda ko‘rsatiladi.",
    "К оплате:": "To‘lov:",
    "В наличии:": "Mavjud:",
    "Остаток:": "Qoldiq:",
    "Спасибо,": "Rahmat,",
    "Цвет": "Rang",
    "Подключаемся к базе данных…": "Ma’lumotlar bazasiga ulanmoqda…", "Загрузка…": "Yuklanmoqda…",
    "Подключение к Supabase": "Supabase’ga ulanish", "Paris Clothes хранит товары, заказы и отзывы в вашей базе данных.": "Paris Clothes mahsulotlar, buyurtmalar va sharhlarni ma’lumotlar bazasida saqlaydi.",
    "Создайте бесплатный проект на": "supabase.com saytida bepul loyiha yarating",
    "Откройте SQL Editor и выполните файл": "SQL Editor’ni oching va faylni ishga tushiring",
    "(я его подготовил отдельно)": "(u alohida tayyorlangan)",
    "В настройках проекта → Project Settings → API скопируйте": "Project Settings → API bo‘limidan nusxalang",
    "и": "va",
    "Ошибка: ${testResult.error}": "Xatolik: ${testResult.error}",
    "Не заполнены токен бота или chat ID": "Bot tokeni yoki chat ID to‘ldirilmagan",
    "Telegram вернул ошибку": "Telegram xatolik qaytardi",
    "Не удалось связаться с Telegram (проверьте токен и сеть)": "Telegram bilan bog‘lanib bo‘lmadi (token va tarmoqni tekshiring)",
    "Удалить эту запись и вернуть товар на склад?": "Bu yozuv o‘chirilsin va mahsulot omborga qaytarilsin?",
    "Спасибо,": "Rahmat,",
    "В наличии:": "Mavjud:",
    "К оплате:": "To‘lov:",
    "Остаток:": "Qoldiq:",
    "Фото по цветам": "Ranglar bo‘yicha rasm",
  }
};
function makeT(lang) {
  return (key) => (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || key;
}



async function sb(config, path, { method = "GET", body } = {}) {
  const headers = { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" };
  if (method !== "GET") headers["Prefer"] = "return=representation";
  const res = await fetch(`${config.url.replace(/\/$/, "")}/rest/v1/${path}`, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const t = await res.text(); throw new Error(t.slice(0, 200) || `Ошибка ${res.status}`); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function uploadPhoto(config, file) {
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const res = await fetch(`${config.url.replace(/\/$/, "")}/storage/v1/object/product-photos/${filename}`, {
    method: "POST",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) { const t = await res.text(); throw new Error(t.slice(0, 200) || `Ошибка загрузки ${res.status}`); }
  return `${config.url.replace(/\/$/, "")}/storage/v1/object/public/product-photos/${filename}`;
}

async function sendTelegram(settings, text) {
  if (!settings?.telegramToken || !settings?.telegramChatId) return { ok: false, error: "Не заполнены токен бота или chat ID" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${settings.telegramToken}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: settings.telegramChatId, text }),
    });
    const data = await res.json();
    return data.ok ? { ok: true } : { ok: false, error: data.description || "Telegram вернул ошибку" };
  } catch (e) { return { ok: false, error: "Не удалось связаться с Telegram (проверьте токен и сеть)" }; }
}

async function sendTelegramPhoto(settings, file, caption = "") {
  if (!settings?.telegramToken || !settings?.telegramChatId) {
    return { ok: false, description: "Не заполнены токен бота или chat ID" };
  }
  if (!file) {
    return { ok: false, description: "Скриншот оплаты не выбран" };
  }

  try {
    const formData = new FormData();
    formData.append("chat_id", settings.telegramChatId);
    formData.append("photo", file);
    if (caption) formData.append("caption", caption);

    const res = await fetch(
      `https://api.telegram.org/bot${settings.telegramToken}/sendPhoto`,
      { method: "POST", body: formData }
    );

    const data = await res.json().catch(() => ({}));
    return data.ok
      ? { ok: true, result: data.result }
      : { ok: false, description: data.description || `Telegram вернул ошибку ${res.status}` };
  } catch (e) {
    return { ok: false, description: e?.message || "Не удалось отправить скриншот в Telegram" };
  }
}

/* -------------------------------- app --------------------------------- */

export default function App() {
  const [config, setConfig] = useState({
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    telegramToken: TELEGRAM_TOKEN,
    telegramChatId: TELEGRAM_CHAT_ID,
    cardNumber: CARD_NUMBER,
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("site_lang") || "ru");
  const t = useMemo(() => makeT(lang), [lang]);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});

  const loadAll = async (cfg) => {
    setLoadingData(true); setConnectError("");
    try {
      const [p, o, r] = await Promise.all([
        sb(cfg, "products?select=*&order=id.asc"),
        sb(cfg, "orders?select=*&order=created_at.desc"),
        sb(cfg, "reviews?select=*&order=created_at.desc"),
      ]);
      setProducts(p || []);
      setOrders((o || []).map((x) => ({ ...x, date: new Date(x.created_at) })));
      const grouped = {};
      (r || []).forEach((rv) => { grouped[rv.product_id] = grouped[rv.product_id] || []; grouped[rv.product_id].push(rv); });
      setReviews(grouped);
      setConnected(true);
    } catch (e) {
      setConnectError(String(e.message || e));
      setConnected(false);
    } finally { setLoadingData(false); }
  };

  useEffect(() => { if (config?.url && config?.key) loadAll(config); }, [config?.url, config?.key]);

  const saveConfig = async (next) => { setConfig(next); await saveLocal("admin_config", next); };

  if (configLoading) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#C7A64A" }}>{t("Загрузка…")}</div>;


  return (
    <div className="store-root">
      <GlobalStyles />
      <MainApp
        config={config} setConfig={saveConfig} products={products} setProducts={setProducts} lang={lang} setLang={setLang} t={t}
        orders={orders} setOrders={setOrders} reviews={reviews} setReviews={setReviews}
        reloadAll={() => loadAll(config)}
      />
    </div>
  );
}

/* --------------------------- connection setup --------------------------- */

function ConnectionSetup({ initial, loading, error, onSave, lang, setLang, t }) {
  const [url, setUrl] = useState(initial?.url || "");
  const [key, setKey] = useState(initial?.key || "");
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative">
      <div className="absolute top-5 right-5 flex gap-1"><button onClick={() => setLang("ru")} className={`nav-pill px-3 py-1 text-xs ${lang === "ru" ? "active" : ""}`}>RU</button><button onClick={() => setLang("uz")} className={`nav-pill px-3 py-1 text-xs ${lang === "uz" ? "active" : ""}`}>UZ</button></div>
      <div className="w-full max-w-md tag-card p-6">
        <div className="tag-hole" />
        <div className="flex items-center gap-2 mb-1"><Database size={16} style={{ color: "var(--accent)" }} /><div className="display text-xl font-bold">{t("Подключение к Supabase")}</div></div>
        <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>{t("Paris Clothes хранит товары, заказы и отзывы в вашей базе данных.")}</div>
        <ol className="text-xs mb-4 space-y-1.5 list-decimal pl-4" style={{ color: "var(--muted)" }}>
          <li>{t("Создайте бесплатный проект на")} <span className="mono">supabase.com</span></li>
          <li>{t("Откройте SQL Editor и выполните файл")} <span className="mono">supabase-schema.sql</span> {t("(я его подготовил отдельно)")}</li>
          <li>{t("В настройках проекта → Project Settings → API скопируйте")} <span className="mono">Project URL</span> и <span className="mono">anon public key</span></li>
        </ol>
        <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Project URL</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="https://xxxx.supabase.co" />
        <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Anon public key</label>
        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full px-3 py-2 mb-4 mt-1 text-sm" placeholder="eyJhbGciOi..." />
        {error && (
          <div className="text-xs mb-3 flex items-start gap-1.5" style={{ color: "var(--accent)" }}>
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>Не удалось подключиться: {error}</span>
          </div>
        )}
        <button disabled={loading || !url || !key} onClick={() => onSave({ url: url.trim(), key: key.trim() })} className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2">
          {loading ? "Подключаем…" : "Подключить"} {!loading && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- main app ------------------------------- */

function MainApp({ config, setConfig, products, setProducts, orders, setOrders, reviews, setReviews, reloadAll, lang, setLang, t }) {
  const [view, setView] = useState("store");
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [offlineCart, setOfflineCart] = useState({});
  const [offlinePaymentOpen, setOfflinePaymentOpen] = useState(false);
  const [offlinePaymentMethod, setOfflinePaymentMethod] = useState("cash");
  const [offlineCash, setOfflineCash] = useState(0);
  const [offlineCard, setOfflineCard] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", phone2: "", city: "", street: "" });
  const [activeProduct, setActiveProduct] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [statusLookupOpen, setStatusLookupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState("");
  const [sendingPaymentScreenshot, setSendingPaymentScreenshot] = useState(false);

  const handlePaymentScreenshot = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      alert(t("Можно выбрать только изображение."));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t("Размер скриншота не должен превышать 10 МБ."));
      return;
    }

    if (paymentScreenshotPreview) URL.revokeObjectURL(paymentScreenshotPreview);
    setPaymentScreenshot(file);
    setPaymentScreenshotPreview(URL.createObjectURL(file));
  };

  const removePaymentScreenshot = () => {
    if (paymentScreenshotPreview) URL.revokeObjectURL(paymentScreenshotPreview);
    setPaymentScreenshot(null);
    setPaymentScreenshotPreview("");
  };

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [adminTab, setAdminTab] = useState("stats");
  const [period, setPeriod] = useState("week");
  const [orderFilter, setOrderFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({ name: "", category: "clothing", subcategory: "Футболки", price: "", stock: "", size: "", color: "", image_url: "", color_images: {} });
  const [newProductColorImages, setNewProductColorImages] = useState({});
  const [notifLog, setNotifLog] = useState([]);
  const [uploadingNewPhoto, setUploadingNewPhoto] = useState(false);

  const uploadNewProductPhoto = async (file) => {
    setUploadingNewPhoto(true);
    try { const url = await uploadPhoto(config, file); setNewProduct((np) => ({ ...np, image_url: url })); }
    catch (e) { setErrorBanner(String(e.message || e)); }
    finally { setUploadingNewPhoto(false); }
  };

  const uploadNewProductColorPhoto = async (colorName, file) => {
    try {
      const url = await uploadPhoto(config, file);
      setNewProductColorImages((prev) => ({ ...prev, [colorName]: url }));
    } catch (e) { setErrorBanner(String(e.message || e)); }
  };

  const withErrorHandling = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (e) { setErrorBanner(String(e.message || e)); } finally { setBusy(false); }
  };

  const filtered = useMemo(() => products.filter((p) => (category === "all" || p.category === category) && (subcategory === "all" || p.subcategory === subcategory) && p.name.toLowerCase().includes(query.toLowerCase())), [products, category, subcategory, query]);
  const cartItems = useMemo(() => Object.entries(cart).filter(([, v]) => v.qty > 0).map(([key, v]) => {
    const product = products.find((p) => p.id === v.productId);
    return product ? { key, ...v, name: product.name, price: product.price } : null;
  }).filter(Boolean), [cart, products]);
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cartItems.reduce((s, i) => s + i.qty, 0);
  const offlineCartItems = useMemo(() => Object.entries(offlineCart).filter(([, v]) => v.qty > 0).map(([key, v]) => {
    const product = products.find((p) => p.id === v.productId);
    return product ? { key, ...v, name: product.name, price: product.price, salePrice: Number(v.salePrice ?? product.price), image: getColorImage(product.color_images, v.color) || product.image_url, variantStock: getVariantStock(product, v.size, v.color) } : null;
  }).filter(Boolean), [offlineCart, products]);
  const offlineTotal = offlineCartItems.reduce((s, i) => s + Number(i.salePrice ?? i.price) * i.qty, 0);
  const offlineCount = offlineCartItems.reduce((s, i) => s + i.qty, 0);
  const qtyInCartForProduct = (id) => cartItems.filter((i) => i.productId === id).reduce((s, i) => s + i.qty, 0);
  const addOfflineToCart = (product, size, color, qty = 1) => {
    const variantStock = getVariantStock(product, size, color);
    const key = cartKey(product.id, size, color);
    const current = offlineCart[key]?.qty || 0;
    const available = variantStock === null ? product.stock : variantStock;
    if (current + qty > available) { setErrorBanner(`Недостаточно остатка: ${product.name}, ${size}, ${color}. Доступно: ${available}`); return; }
    setOfflineCart((c) => ({ ...c, [key]: { productId: product.id, size, color, qty: current + qty, salePrice: Number(offlineCart[key]?.salePrice ?? product.price) } }));
    // setOfflineSaleProduct(null);
  };
  const changeOfflineQty = (key, delta) => setOfflineCart((c) => {
    const next = { ...c }; const item = next[key]; if (!item) return c;
    const product = products.find((p) => p.id === item.productId); const available = getVariantStock(product, item.size, item.color);
    const max = available === null ? product?.stock || 0 : available;
    const qty = Math.min(max, (item.qty || 0) + delta);
    if (qty <= 0) delete next[key]; else next[key] = { ...item, qty }; return next;
  });
  const setOfflineSalePrice = (key, rawPrice) => setOfflineCart((c) => {
    const next = { ...c }; const item = next[key]; if (!item) return c;
    const product = products.find((p) => p.id === item.productId);
    const basePrice = Number(product?.price || 0);
    const salePrice = Math.max(0, Number(rawPrice) || 0);
    next[key] = { ...item, salePrice: rawPrice === "" ? basePrice : salePrice };
    return next;
  });

  const setOfflineQty = (key, rawQty) => setOfflineCart((c) => {
    const next = { ...c }; const item = next[key]; if (!item) return c;
    const product = products.find((p) => p.id === item.productId);
    const available = getVariantStock(product, item.size, item.color);
    const max = available === null ? product?.stock || 0 : available;
    const qty = Math.max(0, Math.min(max, Math.floor(Number(rawQty) || 0)));
    if (qty <= 0) delete next[key]; else next[key] = { ...item, qty };
    return next;
  });

  // НОВОЕ: удалить позицию из корзины одним кликом
  const removeOfflineItem = (key) => setOfflineCart((c) => {
    const next = { ...c }; delete next[key]; return next;
  });

  const addToCart = (product, size, color) => {
    const variantStock = getVariantStock(product, size, color);
    const key = cartKey(product.id, size, color);
    const current = Number(cart[key]?.qty || 0);
    const available = variantStock === null ? Number(product.stock || 0) : Number(variantStock || 0);

    if (current + 1 > available) {
      setErrorBanner(`Недостаточно остатка: ${product.name}, ${size}, ${color}. Доступно: ${available}`);
      return;
    }

    setCart((c) => ({
      ...c,
      [key]: { productId: product.id, size, color, qty: current + 1 },
    }));
    setActiveProduct(null);
    setCartOpen(true);
  };

  const changeQty = (key, delta) => {
    setCart((c) => {
      const next = { ...c };
      const item = next[key];
      if (!item) return c;

      const product = products.find((p) => p.id === item.productId);
      if (!product) return c;

      const variantStock = getVariantStock(product, item.size, item.color);
      const available = variantStock === null
        ? Number(product.stock || 0)
        : Number(variantStock || 0);
      const qty = Number(item.qty || 0) + delta;

      if (qty <= 0) {
        delete next[key];
        return next;
      }

      if (qty > available) {
        setErrorBanner(`Недостаточно остатка: ${product.name}, ${item.size}, ${item.color}. Доступно: ${available}`);
        return c;
      }

      next[key] = { ...item, qty };
      return next;
    });
  };

  const placeOrder = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.phone2 || !form.city || !form.street) return;

    withErrorHandling(async () => {
      cartItems.forEach((i) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p) throw new Error(`Товар с ID ${i.productId} не найден.`);
        const available = getVariantStock(p, i.size, i.color);
        if (available !== null && i.qty > available) throw new Error(`Недостаточно остатка: ${p.name}, ${i.size}, ${i.color}. Доступно: ${available}`);
        if (available === null && i.qty > p.stock) throw new Error(`Недостаточно остатка: ${p.name}. Доступно: ${p.stock}`);
      });

      // Заказ пока НЕ создаём в Supabase. Сначала показываем номер карты
      // и просим клиента оплатить и прикрепить скриншот.
      const now = new Date();
      const orderId = `ORD-${now.getTime().toString().slice(-8)}`;
      const pendingOrder = {
        id: orderId,
        items: cartItems.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color })),
        total,
        customer: { ...form, address: `${form.city}, ${form.street}` },
        status: "awaiting_payment",
        source: "online",
      };
      setOrderPlaced(pendingOrder);
      removePaymentScreenshot();
    });
  };

  const submitPayment = () => withErrorHandling(async () => {
    if (!orderPlaced) return;
    if (!paymentScreenshot) {
      alert(t("Сначала оплатите на карту и обязательно прикрепите скриншот оплаты."));
      return;
    }

    const order = orderPlaced;
    const itemsText = order.items.map((i) => `• ${i.name} (${i.size}, ${i.color}) × ${i.qty}`).join("\n");
    const telegramCaption =
      `💳 НОВЫЙ ОПЛАЧЕННЫЙ ЗАКАЗ ${order.id}\n` +
      `${itemsText}\n` +
      `Итого: ${formatSum(order.total)} сум\n` +
      `Клиент: ${order.customer?.name || ""}\n` +
      `Телефон 1: ${order.customer?.phone || ""}\n` +
      `Телефон 2: ${order.customer?.phone2 || ""}\n` +
      `Город: ${order.customer?.city || ""}\n` +
      `Улица: ${order.customer?.street || ""}`;

    setSendingPaymentScreenshot(true);
    try {
      // Сначала Telegram. Если отправка не удалась — заказ в Supabase НЕ создаётся.
      const telegramResult = await sendTelegramPhoto(config, paymentScreenshot, telegramCaption);
      if (!telegramResult?.ok) {
        throw new Error(telegramResult?.description || t("Не удалось отправить скриншот оплаты в Telegram."));
      }

      const orderRow = {
        ...order,
        status: "processing",
      };
      const insertedRows = await sb(config, "orders", { method: "POST", body: orderRow });
      const inserted = Array.isArray(insertedRows) ? insertedRows[0] : insertedRows;
      if (!inserted) throw new Error("Заказ не был сохранён. Проверьте INSERT policy для таблицы orders в Supabase.");

      const totals = {};
      order.items.forEach((i) => { totals[i.productId] = (totals[i.productId] || 0) + i.qty; });
      await Promise.all(Object.entries(totals).map(async ([id, qty]) => {
        const p = products.find((x) => x.id === Number(id));
        if (!p) throw new Error(`Товар с ID ${id} не найден.`);
        const hasVariants = p.variant_stock && typeof p.variant_stock === "object" && Object.keys(p.variant_stock).length > 0;
        let variantStock = hasVariants ? { ...p.variant_stock } : null;
        if (variantStock) {
          order.items.filter((i) => i.productId === Number(id)).forEach((i) => {
            const key = variantKey(i.size, i.color);
            const available = Number(variantStock[key] || 0);
            if (i.qty > available) throw new Error(`Недостаточно остатка: ${p.name}, ${i.size}, ${i.color}. Доступно: ${available}`);
            variantStock[key] = available - i.qty;
          });
        }
        const body = variantStock ? { stock: Math.max(0, p.stock - qty), variant_stock: variantStock } : { stock: Math.max(0, p.stock - qty) };
        const updatedRows = await sb(config, `products?id=eq.${id}`, { method: "PATCH", body });
        if (Array.isArray(updatedRows) && updatedRows.length === 0) throw new Error(`Не удалось обновить остаток товара ID ${id}. Проверьте UPDATE policy для products в Supabase.`);
      }));

      setOrders((os) => [{ ...inserted, date: new Date(inserted.created_at || Date.now()) }, ...os]);
      setProducts((ps) => ps.map((p) => {
        if (!totals[p.id]) return p;
        let variantStock = p.variant_stock && typeof p.variant_stock === "object" && Object.keys(p.variant_stock).length ? { ...p.variant_stock } : null;
        if (variantStock) order.items.filter((i) => i.productId === p.id).forEach((i) => { const k = variantKey(i.size, i.color); variantStock[k] = Math.max(0, Number(variantStock[k] || 0) - i.qty); });
        return { ...p, stock: Math.max(0, p.stock - totals[p.id]), ...(variantStock ? { variant_stock: variantStock } : {}) };
      }));
      setOrderPlaced({ ...inserted, status: "processing" });
      removePaymentScreenshot();
    } finally {
      setSendingPaymentScreenshot(false);
    }
  });

  const confirmPayment = (order) => submitPayment();

  const resetOrder = () => { setCart({}); setOrderPlaced(null); setCheckoutOpen(false); setForm({ name: "", phone: "", phone2: "", city: "", street: "" }); removePaymentScreenshot(); };

  const adjustStock = (id, delta, logOfflineSale) => withErrorHandling(async () => {
    const product = products.find((p) => p.id === id);
    const newStock = Math.max(0, product.stock + delta);
    await sb(config, `products?id=eq.${id}`, { method: "PATCH", body: { stock: newStock } });
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
    if (logOfflineSale) {
      const now = new Date();
      const row = { id: `OFF-${now.getTime().toString().slice(-8)}`, items: [{ productId: id, name: product.name, price: product.price, qty: 1, size: "—", color: "—" }], total: product.price, customer: null, status: "delivered", source: "offline" };
      const [inserted] = await sb(config, "orders", { method: "POST", body: row });
      setOrders((os) => [{ ...inserted, date: new Date(inserted.created_at) }, ...os]);
    }
  });
  const recordOfflineSale = (items, payment) => withErrorHandling(async () => {
    if (!items?.length) return;
    const grouped = {};
    for (const item of items) {
      const p = products.find((x) => x.id === item.productId);
      if (!p) throw new Error(`Товар с ID ${item.productId} не найден.`);
      const variantStock = getVariantStock(p, item.size, item.color);
      const available = variantStock === null ? p.stock : variantStock;
      if (item.qty > available) throw new Error(`Недостаточно остатка: ${p.name}, ${item.size}, ${item.color}. Доступно: ${available}`);
      grouped[item.productId] = grouped[item.productId] || { product: p, qty: 0, variants: {} };
      grouped[item.productId].qty += item.qty;
      const vk = variantKey(item.size, item.color);
      grouped[item.productId].variants[vk] = (grouped[item.productId].variants[vk] || 0) + item.qty;
    }
    for (const g of Object.values(grouped)) {
      const nextVariantStock = (g.product.variant_stock && typeof g.product.variant_stock === "object" && Object.keys(g.product.variant_stock).length)
        ? Object.fromEntries(Object.entries(g.product.variant_stock).map(([k, v]) => [k, Number(v)])) : null;
      if (nextVariantStock) Object.entries(g.variants).forEach(([k, qty]) => { nextVariantStock[k] = Math.max(0, Number(nextVariantStock[k] || 0) - qty); });
      const newStock = Math.max(0, Number(g.product.stock) - g.qty);
      const body = nextVariantStock ? { stock: newStock, variant_stock: nextVariantStock } : { stock: newStock };
      await sb(config, `products?id=eq.${g.product.id}`, { method: "PATCH", body });
    }
    const now = new Date();
    const row = { id: `OFF-${now.getTime().toString().slice(-8)}`, items: items.map((i) => ({ productId: i.productId, name: i.name, price: Number(i.salePrice ?? i.price), originalPrice: Number(i.price), qty: i.qty, size: i.size, color: i.color })), total: offlineTotal, customer: null, status: "delivered", source: "offline", payment: { method: payment.method, cash: Number(payment.cash || 0), card: Number(payment.card || 0) } };
    const insertedRows = await sb(config, "orders", { method: "POST", body: row });
    const inserted = Array.isArray(insertedRows) ? insertedRows[0] : insertedRows;
    if (!inserted) throw new Error("Офлайн продажа не сохранена.");
    setOrders((os) => [{ ...inserted, date: new Date(inserted.created_at || Date.now()) }, ...os]);
    setProducts((ps) => ps.map((p) => {
      const g = grouped[p.id]; if (!g) return p;
      const variantStock = p.variant_stock && typeof p.variant_stock === "object" && Object.keys(p.variant_stock).length ? { ...p.variant_stock } : p.variant_stock;
      if (variantStock) Object.entries(g.variants).forEach(([k, qty]) => { variantStock[k] = Math.max(0, Number(variantStock[k] || 0) - qty); });
      return { ...p, stock: Math.max(0, p.stock - g.qty), ...(variantStock ? { variant_stock: variantStock } : {}) };
    }));
    setOfflineCart({}); setOfflinePaymentOpen(false); setOfflineCash(0); setOfflineCard(0);
  });
  const setProductPhoto = (id, file) => withErrorHandling(async () => {
    const url = await uploadPhoto(config, file);
    await sb(config, `products?id=eq.${id}`, { method: "PATCH", body: { image_url: url } });
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, image_url: url } : p)));
  });

  // Загружает и сохраняет фото для конкретного цвета уже существующего товара.
  // Обновляет JSON-поле color_images, не трогая остальные цвета этого товара.
  const setProductColorPhoto = (productId, colorName, file) => withErrorHandling(async () => {
    const url = await uploadPhoto(config, file);
    const product = products.find((p) => p.id === productId);
    const currentImages = (product?.color_images && typeof product.color_images === "object") ? product.color_images : {};
    const updatedImages = { ...currentImages, [colorName]: url };
    await sb(config, `products?id=eq.${productId}`, { method: "PATCH", body: { color_images: updatedImages } });
    setProducts((ps) => ps.map((p) => (p.id === productId ? { ...p, color_images: updatedImages } : p)));
  });

  const saveVariantStock = (productId, variantStock) => withErrorHandling(async () => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const normalized = Object.fromEntries(Object.entries(variantStock || {}).map(([k, v]) => [k, Math.max(0, Number(v) || 0)]));
    const totalVariantStock = Object.values(normalized).reduce((sum, v) => sum + Number(v), 0);
    await sb(config, `products?id=eq.${productId}`, { method: "PATCH", body: { variant_stock: normalized, stock: totalVariantStock } });
    setProducts((ps) => ps.map((p) => p.id === productId ? { ...p, variant_stock: normalized, stock: totalVariantStock } : p));
  });

  const editProductRemote = (productId, values) => withErrorHandling(async () => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const sizes = String(values.size || "").split(",").map((x) => x.trim()).filter(Boolean);
    const colors = String(values.color || "").split(",").map((x) => x.trim()).filter(Boolean);
    const nextCategory = values.category;
    const nextSubcategory = values.subcategory || null;
    const oldSizes = String(product.size || "").split(",").map((x) => x.trim()).filter(Boolean);
    const oldColors = String(product.color || "").split(",").map((x) => x.trim()).filter(Boolean);
    const finalSizes = sizes.length ? sizes : oldSizes;
    const finalColors = colors.length ? colors : oldColors;
    const currentVariant = (product.variant_stock && typeof product.variant_stock === "object") ? product.variant_stock : {};
    const variantStock = {};
    finalSizes.forEach((size) => {
      (finalColors.length ? finalColors : ["—"]).forEach((color) => {
        const key = variantKey(size, color);
        variantStock[key] = Number(currentVariant[key] || 0);
      });
    });
    const hasVariantData = Object.keys(currentVariant).length > 0;
    const totalStock = hasVariantData ? Object.values(variantStock).reduce((sum, v) => sum + Number(v || 0), 0) : Number(values.stock) || 0;
    const patch = {
      name: String(values.name || "").trim(),
      category: nextCategory,
      subcategory: nextSubcategory,
      price: Number(values.price) || 0,
      stock: totalStock,
      size: finalSizes.join(", "),
      color: finalColors.join(", "),
    };
    if (hasVariantData) patch.variant_stock = variantStock;
    const [updated] = await sb(config, `products?id=eq.${productId}`, { method: "PATCH", body: patch });
    setProducts((ps) => ps.map((p) => p.id === productId ? { ...p, ...updated } : p));
  });

  const deleteProductRemote = (id) => withErrorHandling(async () => { await sb(config, `products?id=eq.${id}`, { method: "DELETE" }); setProducts((ps) => ps.filter((p) => p.id !== id)); });
  const addProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    withErrorHandling(async () => {
      const sizeList = newProduct.size.split(",").map(x => x.trim()).filter(Boolean).length
        ? newProduct.size.split(",").map(x => x.trim()).filter(Boolean)
        : sizesFor(newProduct.category);
      const colorList = newProduct.color.split(",").map(x => x.trim()).filter(Boolean).length
        ? newProduct.color.split(",").map(x => x.trim()).filter(Boolean)
        : ["—"];

      const totalStock = Number(newProduct.stock) || 0;
      const variantKeys = sizeList.flatMap(size => colorList.map(color => variantKey(size, color)));
      const variantCount = variantKeys.length;

      // распределяем totalStock поровну; остаток от деления раздаём первым вариантам по одной штуке
      const base = Math.floor(totalStock / variantCount);
      const remainder = totalStock % variantCount;
      const variantStock = Object.fromEntries(
        variantKeys.map((key, i) => [key, base + (i < remainder ? 1 : 0)])
      );

      const [inserted] = await sb(config, "products", {
        method: "POST",
        body: {
          name: newProduct.name,
          category: newProduct.category,
          subcategory: newProduct.subcategory || null,
          price: Number(newProduct.price),
          stock: totalStock,
          size: newProduct.size.trim(),
          color: newProduct.color.trim(),
          image_url: newProduct.image_url || null,
          color_images: newProductColorImages,
          variant_stock: variantStock,
        }
      });
      setProducts((ps) => [...ps, inserted]);
      setNewProduct({ name: "", category: "clothing", subcategory: "Футболки", price: "", stock: "", size: "", color: "", image_url: "", color_images: {} });
      setNewProductColorImages({});
    });
  };
  const deleteOrder = (order) => withErrorHandling(async () => {
    // DELETE must really remove the row from Supabase.
    // We verify it afterwards so an RLS/policy problem cannot look like a successful delete.
    const deleted = await sb(config, `orders?id=eq.${encodeURIComponent(order.id)}`, { method: "DELETE" });
    if (!Array.isArray(deleted) || deleted.length === 0) {
      throw new Error("Заказ не удалён из базы данных. Проверьте DELETE policy (RLS) для таблицы orders в Supabase.");
    }

    const remaining = await sb(config, `orders?id=eq.${encodeURIComponent(order.id)}&select=id`);
    if (Array.isArray(remaining) && remaining.length > 0) {
      throw new Error("Supabase не подтвердил удаление заказа. Проверьте RLS policy для DELETE в таблице orders.");
    }

    if (order.source === "offline") {
      const totals = {};
      order.items.forEach((i) => { totals[i.productId] = (totals[i.productId] || 0) + i.qty; });
      await Promise.all(Object.entries(totals).map(([id, qty]) => {
        const p = products.find((x) => x.id === Number(id));
        if (!p) return null;
        let variantStock = p.variant_stock && typeof p.variant_stock === "object" && Object.keys(p.variant_stock).length ? { ...p.variant_stock } : null;
        if (variantStock) order.items.filter((i) => i.productId === Number(id)).forEach((i) => { const k = variantKey(i.size, i.color); variantStock[k] = Number(variantStock[k] || 0) + i.qty; });
        return sb(config, `products?id=eq.${id}`, { method: "PATCH", body: { stock: p.stock + qty, ...(variantStock ? { variant_stock: variantStock } : {}) } });
      }));
      setProducts((ps) => ps.map((p) => {
        if (!totals[p.id]) return p;
        let variantStock = p.variant_stock && typeof p.variant_stock === "object" && Object.keys(p.variant_stock).length ? { ...p.variant_stock } : null;
        if (variantStock) order.items.filter((i) => i.productId === p.id).forEach((i) => { const k = variantKey(i.size, i.color); variantStock[k] = Number(variantStock[k] || 0) + i.qty; });
        return { ...p, stock: p.stock + totals[p.id], ...(variantStock ? { variant_stock: variantStock } : {}) };
      }));
    }
    // The database is the source of truth; no localStorage tombstone is needed.
    setOrders((os) => os.filter((o) => o.id !== order.id));
  });
  const setOrderStatus = (id, status) => withErrorHandling(async () => { await sb(config, `orders?id=eq.${id}`, { method: "PATCH", body: { status } }); setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o))); });
  const addReview = (productId, review) => withErrorHandling(async () => {
    const [inserted] = await sb(config, "reviews", { method: "POST", body: { product_id: productId, author: review.author, rating: review.rating, comment: review.comment } });
    setReviews((r) => ({ ...r, [productId]: [inserted, ...(r[productId] || [])] }));
  });

  const seedDemoOrders = () => withErrorHandling(async () => {
    if (products.length === 0) return;
    const rows = [];
    for (let d = 0; d < 90; d++) {
      const date = daysAgo(d);
      const count = Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 2) : 0;
      for (let i = 0; i < count; i++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const qty = Math.random() < 0.85 ? 1 : 2;
        const sd = new Date(date); sd.setHours(9 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
        rows.push({
          id: `SEED-${d}-${i}-${Date.now() % 100000}`, items: [{ productId: p.id, name: p.name, price: p.price, qty, size: sizesFor(p.category)[0], color: colorsFor(p.id)[0].name }],
          total: p.price * qty, customer: Math.random() < 0.8 ? { name: "Демо клиент", phone: "+998 90 000 00 00", address: "Ташкент" } : null,
          status: "delivered", source: Math.random() < 0.8 ? "online" : "offline", created_at: sd.toISOString(),
        });
      }
    }
    if (rows.length === 0) return;
    await sb(config, "orders", { method: "POST", body: rows });
    await reloadAll();
  });

  const now = new Date();
  const monthLabels = lang === "uz" ? ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"] : MONTH_LABELS;
  const weekdayLabels = lang === "uz" ? ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"] : WEEKDAY_LABELS;
  const nonCancelled = orders.filter((o) => o.status !== "cancelled");
  const periodOrders = useMemo(() => {
    if (period === "day") return nonCancelled.filter((o) => isSameDay(new Date(o.date), now));
    if (period === "week") return nonCancelled.filter((o) => new Date(o.date) >= daysAgo(6));
    if (period === "month") return nonCancelled.filter((o) => new Date(o.date) >= daysAgo(29));
    return nonCancelled.filter((o) => new Date(o.date) >= daysAgo(364));
    // eslint-disable-next-line
  }, [orders, period]);
  const revenue = periodOrders.reduce((s, o) => s + Number(o.total), 0);
  const itemsSold = periodOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  const ordersCount = periodOrders.length;
  const onlineShare = ordersCount ? periodOrders.filter((o) => o.source === "online").length / ordersCount : 0;

  // Способы оплаты за выбранный период. Онлайн-заказы считаем оплатой картой,
  // потому что на сайте доступна только оплата картой. Для офлайн-продаж
  // берём сохранённые суммы payment.card / payment.cash, включая смешанную оплату.
  const paymentTotals = useMemo(() => {
    return periodOrders.reduce((acc, o) => {
      if (o.source === "online") {
        acc.card += Number(o.total) || 0;
        return acc;
      }

      const payment = o.payment || {};
      if (payment.method === "mixed") {
        acc.card += Number(payment.card) || 0;
        acc.cash += Number(payment.cash) || 0;
      } else if (payment.method === "card") {
        acc.card += Number(payment.card) || Number(o.total) || 0;
      } else {
        // Старые офлайн-продажи без payment считаем наличными.
        acc.cash += Number(payment.cash) || Number(o.total) || 0;
      }
      return acc;
    }, { cash: 0, card: 0 });
  }, [periodOrders]);
  const cashTotal = paymentTotals.cash;
  const cardTotal = paymentTotals.card;

  const chartData = useMemo(() => {
    if (period === "day") { const b = Array.from({ length: 24 }, (_, h) => ({ label: `${h}:00`, value: 0 })); periodOrders.forEach((o) => { b[new Date(o.date).getHours()].value += Number(o.total); }); return b.filter((_, i) => i >= 8); }
    if (period === "week") { const b = Array.from({ length: 7 }, (_, i) => { const d = daysAgo(6 - i); return { label: weekdayLabels[d.getDay()], value: 0, key: d.toDateString() }; }); periodOrders.forEach((o) => { const x = b.find((y) => y.key === new Date(o.date).toDateString()); if (x) x.value += Number(o.total); }); return b; }
    if (period === "month") { const b = Array.from({ length: 30 }, (_, i) => { const d = daysAgo(29 - i); return { label: `${d.getDate()}`, value: 0, key: d.toDateString() }; }); periodOrders.forEach((o) => { const x = b.find((y) => y.key === new Date(o.date).toDateString()); if (x) x.value += Number(o.total); }); return b; }
    const b = Array.from({ length: 12 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1); return { label: monthLabels[d.getMonth()], value: 0, y: d.getFullYear(), m: d.getMonth() }; });
    periodOrders.forEach((o) => { const sd = new Date(o.date); const x = b.find((y) => y.y === sd.getFullYear() && y.m === sd.getMonth()); if (x) x.value += Number(o.total); });
    return b;
    // eslint-disable-next-line
  }, [periodOrders, period]);

  const topProducts = useMemo(() => {
    const map = {}; periodOrders.forEach((o) => o.items.forEach((i) => { map[i.productId] = (map[i.productId] || 0) + i.price * i.qty; }));
    return Object.entries(map).map(([id, rev]) => ({ product: products.find((p) => p.id === Number(id)), rev })).filter((x) => x.product).sort((a, b) => b.rev - a.rev).slice(0, 5);
  }, [periodOrders, products]);

  const filteredOrders = useMemo(() => orders.filter((o) => orderFilter === "all" || o.status === orderFilter).sort((a, b) => new Date(b.date) - new Date(a.date)), [orders, orderFilter]);

  return (
    <>
      {errorBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] text-center text-xs py-2 px-4 flex items-center justify-center gap-3" style={{ background: "#C7A64A", color: "var(--accent)" }}>
          <span>{t("Ошибка:")} {errorBanner}</span>
          <button onClick={() => setErrorBanner("")}><X size={13} /></button>
        </div>
      )}
      {view === "store" ? (
        <StoreView
          products={products} filtered={filtered} category={category} setCategory={setCategory} subcategory={subcategory} setSubcategory={setSubcategory} query={query} setQuery={setQuery}
          count={count} cartOpen={cartOpen} setCartOpen={setCartOpen} cart={cart} changeQty={changeQty} cartItems={cartItems} total={total}
          checkoutOpen={checkoutOpen} setCheckoutOpen={setCheckoutOpen} orderPlaced={orderPlaced} form={form} setForm={setForm}
          placeOrder={placeOrder} resetOrder={resetOrder} goAdmin={() => setView("admin")} activeProduct={activeProduct} setActiveProduct={setActiveProduct}
          addToCart={addToCart} reviews={reviews} addReview={addReview} setSizeChartOpen={setSizeChartOpen} setStatusLookupOpen={setStatusLookupOpen}
          config={config} confirmPayment={confirmPayment} submitPayment={submitPayment} busy={busy} lang={lang} setLang={setLang} t={t} paymentScreenshot={paymentScreenshot} paymentScreenshotPreview={paymentScreenshotPreview} handlePaymentScreenshot={handlePaymentScreenshot} removePaymentScreenshot={removePaymentScreenshot} sendingPaymentScreenshot={sendingPaymentScreenshot}
        />
      ) : (
        <AdminView
          adminAuthed={adminAuthed} pwInput={pwInput} setPwInput={setPwInput} pwError={pwError}
          onLogin={() => { if (pwInput === ADMIN_PASSWORD) { setAdminAuthed(true); setPwError(false); } else setPwError(true); }}
          onLogout={() => { setAdminAuthed(false); setPwInput(""); }} goStore={() => setView("store")} adminTab={adminTab} setAdminTab={setAdminTab}
          products={products} adjustStock={adjustStock} recordOfflineSale={recordOfflineSale} deleteProduct={deleteProductRemote} updateProduct={editProductRemote} offlineCart={offlineCart} offlineCartItems={offlineCartItems} offlineTotal={offlineTotal} offlineCount={offlineCount} changeOfflineQty={changeOfflineQty} setOfflineQty={setOfflineQty} setOfflineSalePrice={setOfflineSalePrice} removeOfflineItem={removeOfflineItem} addOfflineToCart={addOfflineToCart} offlinePaymentOpen={offlinePaymentOpen} setOfflinePaymentOpen={setOfflinePaymentOpen} offlinePaymentMethod={offlinePaymentMethod} setOfflinePaymentMethod={setOfflinePaymentMethod} offlineCash={offlineCash} setOfflineCash={setOfflineCash} offlineCard={offlineCard} setOfflineCard={setOfflineCard} newProduct={newProduct} setNewProduct={setNewProduct} addProduct={addProduct}
          setProductPhoto={setProductPhoto} setProductColorPhoto={setProductColorPhoto} saveVariantStock={saveVariantStock} uploadNewProductPhoto={uploadNewProductPhoto} uploadingNewPhoto={uploadingNewPhoto}
          newProductColorImages={newProductColorImages} uploadNewProductColorPhoto={uploadNewProductColorPhoto}
          period={period} setPeriod={setPeriod} revenue={revenue} itemsSold={itemsSold} ordersCount={ordersCount} onlineShare={onlineShare} cashTotal={cashTotal} cardTotal={cardTotal}
          chartData={chartData} topProducts={topProducts} orders={orders} filteredOrders={filteredOrders} orderFilter={orderFilter} setOrderFilter={setOrderFilter} setOrderStatus={setOrderStatus} deleteOrder={deleteOrder}
          config={config} setConfig={setConfig} notifLog={notifLog} seedDemoOrders={seedDemoOrders} reloadAll={reloadAll} busy={busy} lang={lang} setLang={setLang} t={t}
        />
      )}
      {sizeChartOpen && <SizeChartModal onClose={() => setSizeChartOpen(false)} t={t} />}
      {statusLookupOpen && <OrderStatusModal orders={orders} onClose={() => setStatusLookupOpen(false)} t={t} />}

    </>
  );
}

/* ---------------------------- shared styles ---------------------------- */

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      html, body, #root {
        margin: 0;
        min-height: 100%;
        background: #050505;
        color: #e9ae25;
      }

      body {
        font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      /* Header — то же фото Hero, но с красивым blur */
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  overflow: hidden;
  background: rgba(5, 5, 5, 0.58);
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

.site-header::before {
  content: "";
  position: absolute;
  inset: -25px;
  z-index: -2;

  background-image: url("/hero-paris.png");
  background-size: cover;
  background-position: center 42%;

  filter: blur(4px);
  transform: scale(1.08);
}

.site-header::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;

  background:
    linear-gradient(
      90deg,
      rgba(0,0,0,.78) 0%,
      rgba(0,0,0,.45) 50%,
      rgba(0,0,0,.78) 100%
    ),
    rgba(5,5,5,.25);

  backdrop-filter: blur(4px);
}
      .store-root {
        --canvas:#060606;
        --card:#111112;
        --ink:#f7f4ee;
        --muted:#B8943F;
        --line:rgba(212,176,91,.16);
        --accent:#d4af5a;
        --accent-2:#8f6d2f;
        font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
        background:
          radial-gradient(ellipse 65% 42% at 50% -5%, rgba(212,175,90,.14), transparent 68%),
          radial-gradient(ellipse 38% 28% at 8% 24%, rgba(212,175,90,.055), transparent 72%),
          radial-gradient(ellipse 38% 30% at 92% 68%, rgba(212,175,90,.045), transparent 72%),
          linear-gradient(180deg,#070707 0%,#050505 42%,#060606 100%);
        color:var(--ink);
        min-height:100vh;
        position:relative;
        isolation:isolate;
        overflow-x:hidden;
      }
      .logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 86px;
  height: 76px;
  background: transparent;
  overflow: hidden;
}

.site-logo {
  width: 86px;
  height: 76px;
  object-fit: contain;
  display: block;
  background: transparent;
}
      /* Премиальный декоративный фон: мягкое золото, сетка и световые ореолы. */
      .store-root::before {
        content:"";
        position:fixed;
        inset:0;
        z-index:-2;
        pointer-events:none;
        background:
          linear-gradient(rgba(212,175,90,.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,175,90,.018) 1px, transparent 1px);
        background-size:72px 72px;
        mask-image:linear-gradient(to bottom, black 0%, rgba(0,0,0,.72) 38%, transparent 100%);
      }

      .store-root::after {
        content:"";
        position:fixed;
        width:min(760px,80vw);
        height:min(760px,80vw);
        left:50%;
        top:6vh;
        transform:translateX(-50%);
        border:1px solid rgba(212,175,90,.055);
        border-radius:50%;
        box-shadow:
          0 0 120px rgba(212,175,90,.045),
          inset 0 0 100px rgba(212,175,90,.025);
        z-index:-1;
        pointer-events:none;
      }

      /* Золотая линия остаётся очень тонкой, чтобы фон не мешал товарам. */
      .store-root .tag-card {
        box-shadow:0 16px 50px rgba(0,0,0,.22);
      }

      .display {
        font-family:'Bricolage Grotesque','Inter',sans-serif;
        letter-spacing:-0.035em;
      }

      /* Hero — настоящее фото Paris без блюра и без затемняющего overlay */
      .hero-section {
        position:relative;
        isolation:isolate;
        min-height:600px;
        display:flex;
        align-items:center;
        overflow:hidden;
        border:0 !important;
        object-position:center 90%;
        outline:0 !important;
        box-shadow:none !important;
        background:#050505;
      }

      /* Чёрно-золотой мягкий shadow/glow поверх фото Hero */
      .hero-section::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;

  background:
    radial-gradient(
      circle at 52% 50%,
      rgba(199, 166, 74, 0.14) 0%,
      rgba(199, 166, 74, 0.05) 18%,
      transparent 38%
    ),
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.97) 0%,
      rgba(0, 0, 0, 0.90) 16%,
      rgba(0, 0, 0, 0.68) 30%,
      rgba(0, 0, 0, 0.38) 43%,
      rgba(0, 0, 0, 0.12) 54%,
      rgba(0, 0, 0, 0) 65%
    );

  mix-blend-mode: normal;
}

      .hero-section::before {
        content:"";
        position:absolute;
        inset:0;
        z-index:1;
        pointer-events:none;
        background:linear-gradient(180deg, rgba(0,0,0,.38) 0%, transparent 24%, transparent 76%, rgba(0,0,0,.48) 100%);
      }

      .hero-background-image {
        position:absolute;
        inset:0;
        z-index:0;
        width:100%;
        height:100%;
        display:block;
        object-fit:cover;
        object-position:center center;
        opacity:1;
        filter:none;
        transform:none;
      }

      .hero-content {
        position:relative;
        z-index:2;
        width:100%;
        padding-top:76px;
        padding-bottom:76px;
      }

      @media (max-width: 640px) {
        .hero-section {
          min-height:560px;
          border:0 !important;
          outline:0 !important;
          box-shadow:none !important;
        }
        .hero-background-image {
          object-position:62% center;
        }
        .hero-content {
          padding-top:64px;
          padding-bottom:64px;
        }
      }

      /* Все поля ввода в тёмной теме — без белого фона */
      input:not([type="file"]):not([type="checkbox"]):not([type="radio"]),
      select,
      textarea {
        background:#17130C !important;
        color:#D4AF5A !important;
        border:1px solid #6F5A2B !important;
        color-scheme:dark;
      }

      input::placeholder,
      textarea::placeholder {
        color:#77777f !important;
        opacity:1;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline:none;
        border-color:#8D7332 !important;
        box-shadow:0 0 0 2px rgba(184,77,77,.12);
      }

      select option {
        background:#17130C;
        color:#D4AF5A;
      }

      .mono {
        font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
      }

      .tag-card {
        background:linear-gradient(180deg,#18140B 0%,#12100A 100%);
        border:1px solid #5A4924;
        border-radius:16px;
        position:relative;
        overflow:hidden;
        transition:
          transform .22s ease,
          border-color .22s ease,
          box-shadow .22s ease,
          background .22s ease;
      }

      .tag-card.hoverable:hover {
        transform:translateY(-4px);
        border-color:#414149;
        box-shadow:0 18px 45px -24px rgba(0,0,0,.95);
        cursor:pointer;
      }

      .tag-hole {
        position:absolute;
        top:12px;
        left:12px;
        width:10px;
        height:10px;
        border-radius:50%;
        background:#050505;
        border:1px solid #5A4924;
        z-index:2;
      }

      .nav-pill {
        border:1px solid #6F5A2B;
        background:rgba(199,166,74,.08);
        color:#C7A64A;
        border-radius:999px;
        transition:all .18s ease;
      }

      .nav-pill:hover {
        border-color:#8D7332;
        background:rgba(199,166,74,.14);
        color:#D4AF5A;
      }

      .nav-pill.active {
        background:#D4AF5A;
        color:#050505;
        border-color:#D4AF5A;
        box-shadow:0 4px 16px -10px rgba(199,166,74,.45);
      }

      /* Кнопки — чёрные/прозрачные, чтобы золотой цвет оставался акцентом */
      button {
        -webkit-tap-highlight-color: transparent;
      }

      .btn-primary {
        background:#050505 !important;
        color:#F4F0E8 !important;
        border:1px solid rgba(212,175,90,.42) !important;
        border-radius:10px;
        box-shadow:0 8px 22px -14px rgba(0,0,0,.95);
        transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease;
      }

      .btn-primary:hover {
        opacity:1;
        transform:translateY(-1px);
        background:#111111 !important;
        border-color:#D4AF5A !important;
        box-shadow:0 12px 28px -15px rgba(212,175,90,.28);
      }

      .btn-primary:disabled {
        opacity:.38;
        cursor:not-allowed;
        transform:none;
        box-shadow:none;
      }

      .btn-ghost {
        border:1px solid rgba(212,175,90,.34) !important;
        background:rgba(5,5,5,.42) !important;
        color:#D4AF5A !important;
        border-radius:10px;
        transition:all .18s ease;
        backdrop-filter:blur(6px);
      }

      .btn-ghost:hover {
        border-color:#D4AF5A !important;
        background:#050505 !important;
        color:#F4F0E8 !important;
      }

      /* Навигационные кнопки остаются прозрачными/чёрными */
      .nav-pill {
        background:rgba(0,0,0,.48) !important;
        color:#D4AF5A !important;
        border-color:rgba(212,175,90,.42) !important;
        backdrop-filter:blur(6px);
      }

      .nav-pill:hover {
        background:#050505 !important;
        color:#F4F0E8 !important;
        border-color:#D4AF5A !important;
      }

      .nav-pill.active {
        background:#050505 !important;
        color:#D4AF5A !important;
        border-color:#D4AF5A !important;
        box-shadow:0 4px 16px -10px rgba(212,175,90,.45);
      }

      /* Маленькие кнопки +/- */
      .qty-btn {
        background:#050505 !important;
        color:#D4AF5A !important;
        border-color:rgba(212,175,90,.38) !important;
      }

      .qty-btn:hover {
        background:#111111 !important;
        border-color:#D4AF5A !important;
      }

      /* Выбор размера */
      .size-chip {
        background:rgba(0,0,0,.45) !important;
        color:#D4AF5A !important;
        border-color:rgba(212,175,90,.38) !important;
      }

      .size-chip:hover {
        background:#050505 !important;
        border-color:#D4AF5A !important;
      }

      .size-chip.selected {
        background:#050505 !important;
        color:#F4F0E8 !important;
        border-color:#D4AF5A !important;
      }

      .drawer {
        transition:transform .3s cubic-bezier(.32,.72,0,1);
        box-shadow:-20px 0 60px -35px rgba(0,0,0,1);
      }

      input[type="text"],
      input[type="tel"],
      input[type="password"],
      input[type="number"],
      select,
      textarea {
        background:#12100A;
        border:1px solid #6F5A2B;
        color:#D4AF5A;
        border-radius:10px;
        transition:border-color .18s ease,box-shadow .18s ease;
      }

      input::placeholder,
      textarea::placeholder {
        color:#66666f;
      }

      input:focus,
      textarea:focus,
      select:focus {
        outline:none;
        border-color:#C7A64A;
        box-shadow:0 0 0 3px rgba(184,77,77,.11);
      }

      select option {
        background:#17130C;
        color:#D4AF5A;
      }

      ::selection {
        background:#C7A64A;
        color:var(--accent);
      }

      .stat-card {
        background:linear-gradient(180deg,#18140B,#12100A);
        border:1px solid #5A4924;
        border-radius:14px;
      }

      .adm-row:not(:last-child) {
        border-bottom:1px solid #29292e;
      }

      .qty-btn {
        width:30px;
        height:30px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#211C12;
        border:1px solid #6F5A2B;
        transition:all .15s ease;
      }

      .qty-btn:hover {
        background:#332B19;
        border-color:#8D7332;
      }

      .swatch {
        width:24px;
        height:24px;
        border-radius:50%;
        border:2px solid transparent;
        cursor:pointer;
        box-shadow:0 0 0 1px rgba(199,166,74,.18);
        transition:transform .15s ease,border-color .15s ease;
      }

      .swatch:hover { transform:scale(1.08); }
      .swatch.selected {
        border-color:#D4AF5A;
        box-shadow:0 0 0 2px #C7A64A;
      }

      .size-chip {
        border:1px solid #6F5A2B;
        background:#14110A;
        color:#C7A64A;
        border-radius:8px;
        padding:7px 12px;
        font-size:13px;
        cursor:pointer;
        transition:all .15s ease;
      }

      .size-chip:hover {
        border-color:#8D7332;
        background:#211C12;
      }

      .size-chip.selected {
        background:#D4AF5A;
        color:#050505;
        border-color:#D4AF5A;
      }

      .badge {
        display:inline-flex;
        align-items:center;
        gap:4px;
        padding:4px 9px;
        border-radius:999px;
        font-size:11px;
        background:#2A2417;
        border:1px solid #6F5A2B;
      }

      /* Professional scrollbar */
      ::-webkit-scrollbar { width:8px; height:8px; }
      ::-webkit-scrollbar-track { background:#050505; }
      ::-webkit-scrollbar-thumb { background:#6F5A2B; border-radius:999px; }
      ::-webkit-scrollbar-thumb:hover { background:#8D7332; }

      /* Product images */
      .tag-card img {
        transition:transform .35s cubic-bezier(.2,.7,.2,1);
      }

      .tag-card.hoverable:hover img {
        transform:scale(1.035);
      }

      /* Mobile polish */
      @media (max-width:640px) {
        .tag-card { border-radius:14px; }
        .display { letter-spacing:-0.04em; }
      }
    `}</style>
  );
}
function Stars({ value, size = 13 }) {
  return <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} fill={n <= Math.round(value) ? "#C7A64A" : "none"} color={n <= Math.round(value) ? "#C7A64A" : "#C9C2B8"} />)}</div>;
}
function avgRating(list) { if (!list || list.length === 0) return null; return list.reduce((s, r) => s + r.rating, 0) / list.length; }

/* ------------------------------ store view ------------------------------ */

function StoreView(props) {
  const { lang, setLang, t, products, filtered, category, setCategory, subcategory, setSubcategory, query, setQuery, count, cartOpen, setCartOpen, cart, changeQty, cartItems, total,
    checkoutOpen, setCheckoutOpen, orderPlaced, form, setForm, placeOrder, resetOrder, goAdmin, activeProduct, setActiveProduct,
    addToCart, reviews, addReview, setSizeChartOpen, setStatusLookupOpen, config, confirmPayment, submitPayment, busy, paymentScreenshot, paymentScreenshotPreview, handlePaymentScreenshot, removePaymentScreenshot, sendingPaymentScreenshot } = props;
  const [cartImageOpen, setCartImageOpen] = useState(null);


  return (
    <>
      <header className="site-header">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="logo-wrapper">
            <img
              className="site-logo"
              src="/logo1.png"
              alt="Paris"
            />
          </div>
          <div className="flex items-center gap-1"><button onClick={() => setLang("ru")} className={`nav-pill px-2 py-1 text-[10px] ${lang === "ru" ? "active" : ""}`}>RU</button><button onClick={() => setLang("uz")} className={`nav-pill px-2 py-1 text-[10px] ${lang === "uz" ? "active" : ""}`}>UZ</button></div>
          <div className="flex items-center gap-4">
            <button onClick={() => setStatusLookupOpen(true)} className="text-xs mono hidden sm:flex items-center gap-1" style={{ color: "var(--muted)" }}><PhoneCall size={13} /> {t("Статус заказа")}</button>
            <button onClick={goAdmin} className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Панель управления")}</button>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 px-3 py-2 nav-pill"><ShoppingBag size={18} /><span className="mono text-sm">{count}</span></button>
          </div>
        </div>
      </header>
      <section className="hero-section">
        <img
          className="hero-background-image"
          src="/hero-paris.png"
          alt=""
          aria-hidden="true"
        />
        <div className="max-w-6xl mx-auto px-5 hero-content">
          <div className="mono text-xs tracking-[0.28em] uppercase mb-4" style={{ color: "var(--accent)" }}>
            {t("Новая коллекция")}
          </div>
          <h1 className="display text-5xl md:text-7xl font-bold leading-[0.95] max-w-3xl">
            {t("Одежда и обувь, которую хочется носить каждый день.")}
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed" style={{ color: "#d0ccc4" }}>
            {t("Магазин Paris Clothes теперь онлайн — выбирайте, добавляйте в корзину и оформляйте заказ в пару кликов.")}
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 mb-8">
        <div className="tear-line pt-6 space-y-4">
          <div>
            <div className="mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>{t("Категория")}</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setCategory("all"); setSubcategory("all"); }} className={`nav-pill px-3 py-2 text-xs ${category === "all" ? "active" : ""}`}>{t("Все")}</button>
              <button onClick={() => { setCategory("clothing"); setSubcategory("all"); }} className={`nav-pill px-3 py-2 text-xs ${category === "clothing" && subcategory === "all" ? "active" : ""}`}>{t("Одежда")}</button>
              <button onClick={() => { setCategory("shoes"); setSubcategory("all"); }} className={`nav-pill px-3 py-2 text-xs ${category === "shoes" && subcategory === "all" ? "active" : ""}`}>{t("Обувь")}</button>
              {["Футболки", "Рубашки", "Ветровки", "Куртки", "Брюки", "Джинсы", "Худи / Свитера", "Кроссовки", "Туфли", "Ботинки", "Сандалии"].map((c) => (
                <button key={c} onClick={() => { setCategory(["Кроссовки", "Туфли", "Ботинки", "Сандалии"].includes(c) ? "shoes" : "clothing"); setSubcategory(c); }} className={`nav-pill px-3 py-2 text-xs ${subcategory === c ? "active" : ""}`}>{t(c)}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 nav-pill px-3 py-2 w-full sm:w-64">
            <Search size={15} style={{ color: "var(--muted)" }} />
            <input type="text" placeholder={t("Поиск товара")} value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" style={{ background: "transparent", border: "none" }} />
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const [g1, g2] = GRADIENTS[p.id % GRADIENTS.length]; const Icon = p.category === "shoes" ? Footprints : Shirt; const outOfStock = p.stock <= 0; const rating = avgRating(reviews[p.id]);
            return (
              <div key={p.id} className="tag-card hoverable overflow-hidden" onClick={() => setActiveProduct(p)}>
                <div className="tag-hole" />
                <div className="h-36 md:h-44 flex items-center justify-center overflow-hidden relative" style={{ background: p.image_url ? "var(--line)" : `linear-gradient(135deg, ${g1}, ${g2})`, opacity: outOfStock ? 0.5 : 1 }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Icon size={40} color="rgba(199,166,74,0.85)" strokeWidth={1.25} />}
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: "rgba(0,0,0,0.16)" }}>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(122,46,46,0.92)", boxShadow: "0 8px 24px rgba(0,0,0,0.28)" }}>
                        <X size={38} className="md:hidden" color="white" strokeWidth={3} />
                        <X size={46} className="hidden md:block" color="white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 pt-3">
                  <div className="text-sm font-medium leading-snug">{p.name}</div>
                  {rating && <div className="flex items-center gap-1 mt-1"><Stars value={rating} size={11} /><span className="text-xs mono" style={{ color: "var(--muted)" }}>({reviews[p.id].length})</span></div>}
                  <div className="text-xs mono mt-0.5" style={{ color: outOfStock ? "var(--accent)" : "var(--muted)" }}>{outOfStock ? "Нет в наличии" : `${t("В наличии:")} ${p.stock}`}</div>
                  <div className="flex items-center justify-between mt-2"><span className="mono text-sm" style={{ color: "var(--accent)" }}>{formatSum(p.price)} сум</span><span className="text-xs" style={{ color: "var(--muted)" }}>{t("Подробнее →")}</span></div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <div className="text-center py-16" style={{ color: "var(--muted)" }}>Ничего не найдено по запросу «{query}»</div>}
      </section>

      {activeProduct && <ProductModal lang={lang} t={t} product={activeProduct} allProducts={products} onClose={() => setActiveProduct(null)} addToCart={addToCart} reviews={reviews[activeProduct.id] || []} addReview={addReview} openOther={(p) => setActiveProduct(p)} onOpenSizeChart={() => setSizeChartOpen(true)} getQtyInCart={(size, color) => cartItems.filter((i) => i.productId === activeProduct.id && i.size === size && i.color === color).reduce((s, i) => s + i.qty, 0)} />}

      {cartOpen && <div className="fixed inset-0 z-40" style={{ background: "rgba(33,31,28,0.4)" }} onClick={() => setCartOpen(false)} />}
      <div className="drawer fixed top-0 right-0 h-full w-full sm:w-96 z-50 flex flex-col" style={{ background: "var(--card)", transform: cartOpen ? "translateX(0)" : "translateX(100%)", borderLeft: "1px solid var(--line)" }}>
        <div className="flex items-center justify-between px-5 py-4 tear-line"><div className="display font-bold text-lg">{t("Корзина")}</div><button onClick={() => setCartOpen(false)}><X size={20} /></button></div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cartItems.length === 0 && <div className="text-sm py-10 text-center" style={{ color: "var(--muted)" }}>{t("Корзина пуста")}</div>}
          {cartItems.map((item) => {
            const cartProduct = products.find((p) => p.id === item.productId);
            const cartImage = cartProduct
              ? (getColorImage(cartProduct.color_images, item.color) || cartProduct.image_url)
              : null;

            return (
              <div
                key={item.key}
                className="mb-4 rounded-3xl p-3 shadow-sm border"
                style={{
                  borderColor: "var(--line)",
                  background: "var(--canvas)"
                }}
              >
                <div className="flex gap-4">

                  {/* Фото товара */}
                  <div
                    className="w-28 h-36 rounded-2xl overflow-hidden shrink-0"
                    style={{ background: "#1A150A" }}
                  >
                    {cartImage ? (
                      <img
                        src={cartImage}
                        alt={item.name}
                        onClick={() => setCartImageOpen(cartImage)}
                        className="w-full h-full object-cover cursor-zoom-in"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={26} color="#888" />
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 flex flex-col justify-between">

                    <div>
                      <div className="font-semibold text-[15px] leading-tight">
                        {item.name}
                      </div>

                      <div className="text-xs mt-2 text-gray-500">
                        Размер: <b>{item.size}</b>
                      </div>

                      <div className="text-xs text-gray-500">
                        Цвет: <b>{item.color}</b>
                      </div>

                      <div className="mt-2 text-[15px] font-bold text-[#C7A64A]">
                        {formatSum(item.price)} сум
                      </div>
                    </div>

                    {/* Количество */}
                    <div className="flex items-center justify-between mt-3">

                      <div className="flex items-center rounded-full border px-2 py-1 gap-3">
                        <button onClick={() => changeQty(item.key, -1)}>
                          <Minus size={16} />
                        </button>

                        <span className="font-medium w-5 text-center">
                          {item.qty}
                        </span>

                        <button onClick={() => changeQty(item.key, 1)}>
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Удалить */}
                      <button
                        onClick={() => changeQty(item.key, -item.qty)}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-4 tear-line">
          <div className="flex items-center justify-between mb-4"><span className="text-sm" style={{ color: "var(--muted)" }}>{t("Итого")}</span><span className="mono text-lg font-medium">{formatSum(total)} сум</span></div>
          <button disabled={cartItems.length === 0} onClick={() => setCheckoutOpen(true)} className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2">{t("Оформить заказ")} <ChevronRight size={16} /></button>
        </div>
      </div>

      {cartImageOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setCartImageOpen(null)}
        >
          <button
            onClick={() => setCartImageOpen(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(199,166,74,0.16)",
              color: "var(--accent)"
            }}
          >
            <X size={22} />
          </button>

          <img
            src={cartImageOpen}
            alt="Товар"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.55)" }}>
          <div className="w-full max-w-md tag-card p-6 relative" style={{ background: "var(--card)" }}>
            <button onClick={() => setCheckoutOpen(false)} className="absolute top-4 right-4"><X size={18} /></button>
            {!orderPlaced ? (
              <form onSubmit={placeOrder}>
                <div className="display text-xl font-bold mb-1">{t("Оформление заказа")}</div>
                <div className="text-sm mb-5" style={{ color: "var(--muted)" }}>{cartItems.reduce((s, i) => s + i.qty, 0)} товара на сумму <span className="mono">{formatSum(total)} сум</span></div>
                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Имя")}</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder={t("Ваше имя")} />

                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Телефон")} 1</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="+998 90 123 45 67" />

                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Второй телефон")}</label>
                <input type="tel" required value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="+998 90 123 45 67" />

                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Город")}</label>
                <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="Ташкент" />

                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Улица")}</label>
                <input type="text" required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full px-3 py-2 mb-4 mt-1 text-sm" placeholder="Улица, дом, квартира" />
                <div className="flex items-start gap-2 mb-5 p-3" style={{ background: "var(--canvas)", borderRadius: 3 }}>
                  <CreditCard size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{t("Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.")}</div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-sm font-medium">{t("Подтвердить заказ")}</button>
              </form>
            ) : (
              <div className="text-center py-6">
                {orderPlaced.status === "processing" ? (
                  <>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent-2)" }}><Check size={26} color="white" /></div>
                    <div className="display text-xl font-bold mb-1">{t("Оплата получена")}</div>
                    <div className="text-xs mono mb-3" style={{ color: "var(--muted)" }}>№ {orderPlaced.id}</div>
                    <div className="text-sm mb-6" style={{ color: "var(--muted)" }}>{t("Спасибо,")} {form.name}! {lang === "uz" ? "To‘lovingizni ko‘rdik va tez orada " : "Мы видим вашу оплату и скоро свяжемся по номеру "}{form.phone}. {lang === "uz" ? "Holatni «Buyurtma holati» orqali tekshirishingiz mumkin." : "Статус можно проверить через «Статус заказа»."}</div>
                    <button onClick={resetOrder} className="btn-primary w-full py-3 text-sm font-medium">{t("Вернуться в каталог")}</button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent)" }}><CreditCard size={24} color="white" /></div>
                    <div className="display text-xl font-bold mb-1">{t("Оплата заказа")}</div>
                    <div className="text-xs mono mb-4" style={{ color: "var(--muted)" }}>№ {orderPlaced.id}</div>
                    <div className="tag-card p-4 mb-4 text-left" style={{ background: "var(--canvas)" }}>
                      <div className="text-xs mono uppercase mb-2" style={{ color: "var(--muted)" }}>{t("Оплатите картой")}</div>
                      {config?.cardNumber ? (
                        <>
                          <div className="mono text-lg font-medium tracking-wider">{config.cardNumber}</div>
                          {config.cardHolder && <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>{config.cardHolder}</div>}
                        </>
                      ) : (
                        <div className="text-sm" style={{ color: "var(--accent)" }}>{t("Продавец ещё не указал номер карты. Свяжитесь с нами для оплаты.")}</div>
                      )}
                      <div className="mono text-sm mt-3" style={{ color: "var(--accent)" }}>К оплате: {formatSum(orderPlaced.total)} сум</div>
                    </div>
                    <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>{t("Переведите сумму на карту выше. После оплаты обязательно прикрепите скриншот чека.")}</div>

                    <div className="tag-card p-4 mb-4 text-left" style={{ background: "var(--canvas)", border: paymentScreenshot ? "1px solid var(--accent)" : "1px dashed var(--accent)" }}>
                      <div className="text-xs mono uppercase mb-2" style={{ color: "var(--accent)" }}>{t("Скриншот оплаты — обязательно")}</div>
                      <label className="flex flex-col items-center justify-center gap-2 p-4 cursor-pointer rounded-lg" style={{ background: "rgba(199,166,74,0.06)" }}>
                        {paymentScreenshotPreview ? (
                          <img src={paymentScreenshotPreview} alt="Скриншот оплаты" className="w-full max-h-52 object-contain rounded-lg" />
                        ) : (
                          <>
                            <CreditCard size={28} style={{ color: "var(--accent)" }} />
                            <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>{t("Прикрепить скриншот")}</span>
                            <span className="text-[11px]" style={{ color: "var(--muted)" }}>{t("Нажмите, чтобы выбрать фото чека")}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { handlePaymentScreenshot(e.target.files?.[0]); e.target.value = ""; }} />
                      </label>
                      {paymentScreenshot && (
                        <button type="button" onClick={removePaymentScreenshot} className="w-full mt-2 py-2 text-xs mono" style={{ color: "var(--muted)" }}>{t("Удалить скриншот")}</button>
                      )}
                    </div>

                    <button onClick={submitPayment} disabled={busy || sendingPaymentScreenshot || !paymentScreenshot} className="btn-primary w-full py-3 text-sm font-medium mb-2">{sendingPaymentScreenshot ? "Отправляем скриншот…" : "Подтвердить оплату"}</button>
                    <button onClick={resetOrder} className="w-full py-2 text-xs mono" style={{ color: "var(--muted)" }}>{t("Оплачу позже / вернуться в каталог")}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------- product modal ---------------------------- */

function ProductModal({ lang, t, product, allProducts, onClose, addToCart, reviews, addReview, openOther, onOpenSizeChart, getQtyInCart }) {
  const productSizes = (product.size || "").split(",").map((x) => x.trim()).filter(Boolean);
  const productColors = (product.color || "").split(",").map((x) => x.trim()).filter(Boolean);
  const sizes = productSizes.length ? productSizes : sizesFor(product.category);
  const colors = productColors.length ? productColors.map((name) => ({ name, hex: getColorHex(name) })) : colorsFor(product.id);
  const [size, setSize] = useState(productSizes[0] || null);
  const colorImages = product.color_images && typeof product.color_images === "object" ? product.color_images : {};
  const [color, setColor] = useState(productColors[0] || null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  // Ищем фото ровно для выбранного цвета (без учёта пробелов и регистра);
  // если для этого цвета фото не загружено — используем общее фото товара.
  const selectedPhoto = getColorImage(colorImages, color) || product.image_url;
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, comment: "" });
  const [g1, g2] = GRADIENTS[product.id % GRADIENTS.length];
  const Icon = product.category === "shoes" ? Footprints : Shirt;
  const rating = avgRating(reviews);
  const noSelection = !size || !color;
  const selectedVariantStock = !noSelection ? getVariantStock(product, size, color) : null;
  const selectedAvailable = noSelection
    ? 0
    : selectedVariantStock === null
      ? Number(product.stock || 0)
      : Number(selectedVariantStock || 0);
  const selectedQtyInCart = !noSelection && typeof getQtyInCart === "function" ? getQtyInCart(size, color) : 0;
  const outOfStock = selectedAvailable <= selectedQtyInCart;

  const submitReview = (e) => { e.preventDefault(); if (!reviewForm.author || !reviewForm.comment) return; addReview(product.id, { author: reviewForm.author, rating: Number(reviewForm.rating), comment: reviewForm.comment }); setReviewForm({ author: "", rating: 5, comment: "" }); };

  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" style={{ background: "rgba(33,31,28,0.6)" }}>
      <div className="w-full max-w-3xl tag-card p-5 sm:p-6 relative my-6" style={{ background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10"><X size={18} /></button>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div
              className="h-72 rounded flex items-center justify-center mb-3 overflow-hidden cursor-zoom-in"
              style={{
                background: selectedPhoto
                  ? "var(--line)"
                  : `linear-gradient(135deg, ${g1}, ${g2})`
              }}
              onClick={() => selectedPhoto && setImageZoomOpen(true)}
            >
              {selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              ) : (
                <Icon
                  size={64}
                  color="rgba(255,255,255,0.9)"
                  strokeWidth={1}
                  style={{ transform: `rotate(${photoIdx * 8}deg)` }}
                />
              )}
            </div>
            {!selectedPhoto && (
              <>
                <div className="flex gap-2">{[0, 1, 2].map((i) => <button key={i} onClick={() => setPhotoIdx(i)} className="h-14 flex-1 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, border: photoIdx === i ? "2px solid var(--accent)" : "2px solid transparent" }}><Icon size={20} color="rgba(199,166,74,0.85)" strokeWidth={1.25} /></button>)}</div>
                <div className="text-xs mono text-center mt-1" style={{ color: "var(--muted)" }}>{t("Фото-заглушки — продавец ещё не загрузил настоящее фото")}</div>
              </>
            )}
          </div>
          <div>
            <div className="display text-2xl font-bold">{product.name}</div>
            {rating ? <div className="flex items-center gap-2 mt-1"><Stars value={rating} /><span className="text-xs" style={{ color: "var(--muted)" }}>{rating.toFixed(1)} · {reviews.length} отзывов</span></div> : <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("Пока нет отзывов")}</div>}
            <div className="mono text-xl mt-3" style={{ color: "var(--accent)" }}>{formatSum(product.price)} сум</div>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>{describe(product, lang)}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5"><span className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Размер {!size && <span style={{ color: "var(--accent)" }}>{t("· выберите")}</span>}</span><button onClick={onOpenSizeChart} className="text-xs flex items-center gap-1" style={{ color: "var(--accent-2)" }}><Ruler size={12} /> {t("Таблица размеров")}</button></div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const sizeStockRaw = color ? getVariantStock(product, s, color) : null;
                  const sizeAvailable = sizeStockRaw === null ? Number(product.stock || 0) : Number(sizeStockRaw || 0);
                  const sizeInCart = typeof getQtyInCart === "function" && color ? getQtyInCart(s, color) : 0;
                  const sizeUnavailable = sizeAvailable <= sizeInCart;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={sizeUnavailable}
                      onClick={() => !sizeUnavailable && setSize(s)}
                      className={`size-chip ${size === s ? "selected" : ""} ${sizeUnavailable ? "relative opacity-55 cursor-not-allowed" : ""}`}
                      style={sizeUnavailable ? { position: "relative", overflow: "hidden" } : undefined}
                    >
                      {s}
                      {sizeUnavailable && (
                        <span
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: "8%",
                            right: "8%",
                            top: "50%",
                            height: "2px",
                            background: "var(--accent)",
                            transform: "rotate(-32deg)",
                            transformOrigin: "center",
                            pointerEvents: "none"
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4"><div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>Цвет {color ? `— ${color}` : <span style={{ color: "var(--accent)" }}>{t("· выберите")}</span>}</div><div className="flex gap-2">{colors.map((c) => <button key={c.name} onClick={() => setColor(c.name)} className={`swatch ${color === c.name ? "selected" : ""}`} style={{ background: c.hex }} title={t(c.name)} />)}</div></div>
            <div className="text-xs mono mt-4" style={{ color: outOfStock ? "var(--accent)" : "var(--muted)" }}>
              {outOfStock ? "Нет в наличии" : `${t("В наличии:")} ${Math.max(0, selectedAvailable - selectedQtyInCart)}`}
            </div>
            <button disabled={outOfStock || noSelection} onClick={() => addToCart(product, size, color)} className="btn-primary w-full py-3 text-sm font-medium mt-3 flex items-center justify-center gap-2"><ShoppingBag size={15} /> {noSelection ? "Выберите размер и цвет" : "Добавить в корзину"}</button>
          </div>
        </div>
        <div className="mt-8 pt-5 tear-line">
          <div className="text-sm font-medium mb-3">{t("Отзывы")}</div>
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {reviews.length === 0 && <div className="text-xs" style={{ color: "var(--muted)" }}>{t("Будьте первым, кто оставит отзыв")}</div>}
            {reviews.map((r) => <div key={r.id} className="text-sm"><div className="flex items-center gap-2"><span className="font-medium">{r.author}</span><Stars value={r.rating} size={11} /></div><div style={{ color: "var(--muted)" }}>{r.comment}</div></div>)}
          </div>
          <form onSubmit={submitReview} className="grid sm:grid-cols-4 gap-2">
            <input type="text" placeholder={t("Ваше имя")} value={reviewForm.author} onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })} className="px-3 py-2 text-sm sm:col-span-1" />
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} className="px-3 py-2 text-sm">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select>
            <input type="text" placeholder={t("Комментарий")} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="px-3 py-2 text-sm sm:col-span-1" />
            <button type="submit" className="btn-ghost px-3 py-2 text-sm">{t("Отправить")}</button>
          </form>
        </div>
      </div>
      {imageZoomOpen && selectedPhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setImageZoomOpen(false)}
        >
          <button
            onClick={() => setImageZoomOpen(false)}
            className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(199,166,74,0.16)",
              color: "#D4AF5A",
              border: "1px solid rgba(199,166,74,0.22)"
            }}
          >
            <X size={24} />
          </button>

          <img
            src={selectedPhoto}
            alt={product.name}
            className="max-w-full max-h-[92vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------ modals ------------------------------ */

function SizeChartModal({ onClose, t }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}>
      <div className="w-full max-w-lg tag-card p-6 relative" style={{ background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button>
        <div className="display text-xl font-bold mb-4 flex items-center gap-2"><Ruler size={18} /> {t("Таблица размеров")}</div>
        <div className="mb-5"><div className="text-sm font-medium mb-2">{t("Одежда")}</div><table className="w-full text-sm"><thead><tr className="tear-line" style={{ color: "var(--muted)" }}><th className="text-left py-1">{t("Размер")}</th><th className="text-left py-1">{t("Грудь, см")}</th><th className="text-left py-1">{t("Талия, см")}</th></tr></thead><tbody>{SIZE_CHART.clothing.map((r) => <tr key={r.size} className="adm-row"><td className="py-1.5 mono">{r.size}</td><td className="py-1.5">{r.chest}</td><td className="py-1.5">{r.waist}</td></tr>)}</tbody></table></div>
        <div><div className="text-sm font-medium mb-2">{t("Обувь")}</div><table className="w-full text-sm"><thead><tr className="tear-line" style={{ color: "var(--muted)" }}><th className="text-left py-1">{t("Размер")}</th><th className="text-left py-1">{t("Стопа, см")}</th></tr></thead><tbody>{SIZE_CHART.shoes.map((r) => <tr key={r.size} className="adm-row"><td className="py-1.5 mono">{r.size}</td><td className="py-1.5">{r.foot}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}

function OrderStatusModal({ orders, onClose, t }) {
  const [phone, setPhone] = useState("");
  const matches = orders.filter((o) => o.source === "online" && o.customer?.phone && phone.replace(/\D/g, "").length >= 4 && o.customer.phone.replace(/\D/g, "").includes(phone.replace(/\D/g, ""))).sort((a, b) => new Date(b.date) - new Date(a.date));
  const steps = ["new", "processing", "delivered"];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}>
      <div className="w-full max-w-lg tag-card p-6 relative max-h-[85vh] overflow-y-auto" style={{ background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button>
        <div className="display text-xl font-bold mb-1">{t("Статус заказа")}</div>
        <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>{t("Введите номер телефона, указанный при заказе")}</div>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="w-full px-3 py-2 mb-5 text-sm" />
        {phone.length > 3 && matches.length === 0 && <div className="text-sm" style={{ color: "var(--muted)" }}>{t("Заказы не найдены")}</div>}
        {matches.map((o) => {
          const meta = STATUS_META[o.status]; const stepIdx = steps.indexOf(o.status); return (
            <div key={o.id} className="tag-card p-4 mb-3">
              <div className="flex items-center justify-between mb-2"><span className="mono text-xs" style={{ color: "var(--muted)" }}>№ {o.id}</span><span className="badge" style={{ background: meta.color + "22", color: meta.color }}><meta.icon size={12} />{t(meta.label)}</span></div>
              {o.status !== "cancelled" && <div className="flex items-center gap-1 my-3">{steps.map((s, i) => <React.Fragment key={s}><div className="w-2.5 h-2.5 rounded-full" style={{ background: i <= stepIdx ? "var(--accent-2)" : "var(--line)" }} />{i < steps.length - 1 && <div className="flex-1 h-0.5" style={{ background: i < stepIdx ? "var(--accent-2)" : "var(--line)" }} />}</React.Fragment>)}</div>}
              <div className="text-xs" style={{ color: "var(--muted)" }}>{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</div>
              <div className="mono text-sm mt-1" style={{ color: "var(--accent)" }}>{formatSum(o.total)} сум</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfflineSaleModal({ product, onClose, onSubmit, t }) {
  const productSizes = (product.size || "").split(",").map((x) => x.trim()).filter(Boolean);
  const productColors = (product.color || "").split(",").map((x) => x.trim()).filter(Boolean);
  const sizes = productSizes.length ? productSizes : sizesFor(product.category);
  const colors = productColors.length ? productColors.map((name) => ({ name, hex: getColorHex(name) })) : colorsFor(product.id);
  const [size, setSize] = useState(productSizes[Math.floor(productSizes.length / 2)] || sizes[Math.floor(sizes.length / 2)]);
  const [color, setColor] = useState(productColors[0] || colors[0].name);
  const [qty, setQty] = useState(1);
  const variantStock = getVariantStock(product, size, color);
  const available = variantStock === null ? product.stock : variantStock;
  useEffect(() => { setQty((q) => Math.min(Math.max(1, q), Math.max(1, available))); }, [size, color, available]);
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}><div className="w-full max-w-sm tag-card p-6 relative" style={{ background: "var(--card)" }}><button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button><div className="display text-lg font-bold mb-1">Добавить в офлайн корзину</div><div className="text-sm mb-4" style={{ color: "var(--muted)" }}>{product.name}</div><div className="mb-3"><div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>{t("Размер")}</div><div className="flex flex-wrap gap-2">
    {sizes.map(s => {
      const sizeStockRaw = color ? getVariantStock(product, s, color) : null;
      const sizeAvailable = sizeStockRaw === null ? Number(product.stock || 0) : Number(sizeStockRaw || 0);
      const sizeUnavailable = sizeAvailable <= 0;
      return (
        <button
          key={s}
          type="button"
          disabled={sizeUnavailable}
          onClick={() => !sizeUnavailable && setSize(s)}
          className={`size-chip ${size === s ? "selected" : ""} ${sizeUnavailable ? "relative opacity-55 cursor-not-allowed" : ""}`}
          style={sizeUnavailable ? { position: "relative", overflow: "hidden" } : undefined}
        >
          {s}
          {sizeUnavailable && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: "50%",
                height: "2px",
                background: "var(--accent)",
                transform: "rotate(-32deg)",
                transformOrigin: "center",
                pointerEvents: "none"
              }}
            />
          )}
        </button>
      );
    })}
  </div></div><div className="mb-3"><div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>Цвет — {color}</div><div className="flex gap-2">{colors.map(c => <button key={c.name} onClick={() => setColor(c.name)} className={`swatch ${color === c.name ? "selected" : ""}`} style={{ background: c.hex }} title={t(c.name)} />)}</div></div><div className="mb-5"><div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>Количество · доступно {available}</div><div className="flex items-center gap-2"><button onClick={() => setQty(q => Math.max(1, q - 1))} className="qty-btn btn-ghost"><Minus size={13} /></button><input type="number" min="1" max={available} value={qty} onChange={e => setQty(Math.min(available, Math.max(1, Number(e.target.value) || 1)))} className="w-20 px-3 py-2 text-center" /><button onClick={() => setQty(q => Math.min(available, q + 1))} className="qty-btn btn-ghost"><Plus size={13} /></button></div></div><button disabled={available < 1} onClick={() => onSubmit(size, color, qty)} className="btn-primary w-full py-3 text-sm font-medium disabled:opacity-40">Добавить · {formatSum(product.price * qty)} сум</button></div></div>;
}

function OfflinePaymentModal({ total, method, setMethod, cash, setCash, card, setCard, onClose, onSubmit, busy }) {
  const remaining = Math.max(0, total - Number(cash || 0) - Number(card || 0));
  return <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}><div className="w-full max-w-md tag-card p-6 relative" style={{ background: "var(--card)" }}><button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button><div className="display text-xl font-bold mb-1">Оплата офлайн продажи</div><div className="mono text-lg mb-5" style={{ color: "var(--accent)" }}>К оплате: {formatSum(total)} сум</div><div className="grid grid-cols-3 gap-2 mb-5"><button onClick={() => setMethod("cash")} className={`nav-pill py-2 ${method === "cash" ? "active" : ""}`}><Banknote size={14} className="inline mr-1" />Наличные</button><button onClick={() => setMethod("card")} className={`nav-pill py-2 ${method === "card" ? "active" : ""}`}><CreditCard size={14} className="inline mr-1" />Карта</button><button onClick={() => setMethod("mixed")} className={`nav-pill py-2 ${method === "mixed" ? "active" : ""}`}>Смешанная</button></div>{method === "mixed" && <div className="grid grid-cols-2 gap-3 mb-4"><div><label className="text-xs mono" style={{ color: "var(--muted)" }}>Наличные</label><input type="number" min="0" value={cash} onChange={e => setCash(e.target.value)} className="w-full px-3 py-2 mt-1" /></div><div><label className="text-xs mono" style={{ color: "var(--muted)" }}>Карта</label><input type="number" min="0" value={card} onChange={e => setCard(e.target.value)} className="w-full px-3 py-2 mt-1" /></div></div>}{method === "mixed" && <div className="text-xs mb-4" style={{ color: remaining === 0 ? "var(--accent-2)" : "var(--accent)" }}>Осталось распределить: {formatSum(remaining)} сум</div>}<button disabled={busy || (method === "mixed" && Number(cash) + Number(card) !== Number(total))} onClick={onSubmit} className="btn-primary w-full py-3 text-sm font-medium disabled:opacity-40">Подтвердить продажу</button></div></div>;
}

function VariantStockModal({ product, onClose, onSave }) {
  const sizes = (product.size || "").split(",").map((x) => x.trim()).filter(Boolean);
  const colors = (product.color || "").split(",").map((x) => x.trim()).filter(Boolean);
  const actualSizes = sizes.length ? sizes : sizesFor(product.category);
  const actualColors = colors.length ? colors : ["—"];
  const keys = actualSizes.flatMap((size) => actualColors.map((color) => ({ key: variantKey(size, color), size, color })));
  const [values, setValues] = useState(() => Object.fromEntries(keys.map(({ key }) => [key, Number(product.variant_stock?.[key] || 0)])));
  const total = Object.values(values).reduce((s, v) => s + (Number(v) || 0), 0);
  return <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}><div className="w-full max-w-2xl tag-card p-6 relative max-h-[85vh] overflow-y-auto" style={{ background: "var(--card)" }}><button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button><div className="display text-xl font-bold mb-1">Остатки по размерам и цветам</div><div className="text-sm mb-5" style={{ color: "var(--muted)" }}>{product.name} · общий остаток после сохранения: {total}</div><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{keys.map(({ key, size, color }) => <div key={key} className="tag-card p-3"><div className="text-sm font-medium">{size}</div><div className="text-xs mb-2" style={{ color: "var(--muted)" }}>{color}</div><input type="number" min="0" value={values[key] ?? 0} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))} className="w-full px-3 py-2" /></div>)}</div><div className="flex gap-2 mt-5"><button onClick={onClose} className="btn-ghost flex-1 py-2.5">Отмена</button><button onClick={() => onSave(values)} className="btn-primary flex-1 py-2.5">Сохранить остатки</button></div></div></div>;
}

function EditProductModal({ product, onClose, onSave, t }) {
  const [values, setValues] = useState({
    name: product.name || "",
    category: product.category || "clothing",
    subcategory: product.subcategory || "",
    price: product.price ?? "",
    stock: product.stock ?? 0,
    size: product.size || "",
    color: product.color || "",
  });
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const clothingSubs = ["Футболки", "Рубашки", "Ветровки", "Куртки", "Брюки", "Джинсы", "Худи / Свитера"];
  const shoeSubs = ["Кроссовки", "Туфли", "Ботинки", "Сандалии"];
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}>
    <div className="w-full max-w-lg tag-card p-6 relative max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }}>
      <button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button>
      <div className="display text-xl font-bold mb-5">Изменить товар</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Название</label><input value={values.name} onChange={e => set("name", e.target.value)} className="w-full px-3 py-2 mt-1" /></div>
        <div><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Категория</label><select value={values.category} onChange={e => { const category = e.target.value; setValues(v => ({ ...v, category, subcategory: "" })); }} className="w-full px-3 py-2 mt-1"><option value="clothing">{t("Одежда")}</option><option value="shoes">{t("Обувь")}</option></select></div>
        <div><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Вид товара</label><select value={values.subcategory} onChange={e => set("subcategory", e.target.value)} className="w-full px-3 py-2 mt-1"><option value="">Без типа</option>{(values.category === "clothing" ? clothingSubs : shoeSubs).map(x => <option key={x} value={x}>{t(x)}</option>)}</select></div>
        <div><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Цена</label><input type="number" value={values.price} onChange={e => set("price", e.target.value)} className="w-full px-3 py-2 mt-1" /></div>
        <div><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Остаток</label><input type="number" min="0" value={values.stock} onChange={e => set("stock", e.target.value)} className="w-full px-3 py-2 mt-1" /></div>
        <div className="col-span-2"><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Размеры — можно добавить новые</label><input value={values.size} onChange={e => set("size", e.target.value)} className="w-full px-3 py-2 mt-1" placeholder={values.category === "shoes" ? "40, 41, 42, 43" : "S, M, L, XL, XXL"} /><div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>Например: S, M, L, XL, XXL</div></div>
        <div className="col-span-2"><label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Цвета</label><input value={values.color} onChange={e => set("color", e.target.value)} className="w-full px-3 py-2 mt-1" placeholder="Чёрный, Белый, Бежевый" /></div>
      </div>
      <div className="flex gap-2 mt-5"><button onClick={onClose} className="btn-ghost flex-1 py-2.5">Отмена</button><button onClick={() => onSave(product.id, values)} className="btn-primary flex-1 py-2.5">Сохранить</button></div>
    </div>
  </div>;
}

/* ------------------------------ admin view ------------------------------ */

function AdminView(props) {
  const { lang, setLang, t, adminAuthed, pwInput, setPwInput, pwError, onLogin, onLogout, goStore, adminTab, setAdminTab,
    products, adjustStock, recordOfflineSale, deleteProduct, updateProduct, newProduct, setNewProduct, addProduct, offlineCart, offlineCartItems, offlineTotal, offlineCount, changeOfflineQty, setOfflineQty, setOfflineSalePrice, removeOfflineItem, addOfflineToCart, offlinePaymentOpen, setOfflinePaymentOpen, offlinePaymentMethod, setOfflinePaymentMethod, offlineCash, setOfflineCash, offlineCard, setOfflineCard,
    setProductPhoto, setProductColorPhoto, saveVariantStock, uploadNewProductPhoto, uploadingNewPhoto,
    newProductColorImages, uploadNewProductColorPhoto,
    period, setPeriod, revenue, itemsSold, ordersCount, avgCheck, onlineShare, cashTotal, cardTotal, chartData, topProducts,
    orders, filteredOrders, orderFilter, setOrderFilter, setOrderStatus, deleteOrder, config, setConfig, notifLog, seedDemoOrders, reloadAll, busy } = props;

  const [testResult, setTestResult] = useState(null);
  const [localCfg, setLocalCfg] = useState(config);
  const [offlineSaleProduct, setOfflineSaleProduct] = useState(null);
  const [variantStockProduct, setVariantStockProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  useEffect(() => setLocalCfg(config), [config]);

  if (!adminAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-sm tag-card p-6">
          <div className="tag-hole" />
          <div className="flex items-center gap-2 mb-1"><Lock size={16} style={{ color: "var(--accent)" }} /><div className="display text-xl font-bold">{t("Панель управления")}</div></div>
          <div className="text-sm mb-5" style={{ color: "var(--muted)" }}>{t("Paris Clothes · вход для администратора")}</div>
          <input type="password" value={pwInput} onChange={(e) => setPwInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onLogin()} placeholder={t("Пароль")} className="w-full px-3 py-2 mb-2 text-sm" />
          {pwError && <div className="text-xs mb-3" style={{ color: "var(--accent)" }}>{t("Неверный пароль")}</div>}
          <button onClick={onLogin} className="btn-primary w-full py-3 text-sm font-medium mt-2">{t("Войти")}</button>
          <button onClick={goStore} className="w-full py-2 text-xs mono mt-3" style={{ color: "var(--muted)" }}>{t("← Вернуться в магазин")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><div className="display text-2xl font-bold">Paris Clothes</div><div className="text-xs mono flex items-center gap-1" style={{ color: "var(--muted)" }}><Database size={11} /> Supabase{busy && " · сохраняем…"}</div></div>
        <div className="flex items-center gap-1"><button onClick={() => setLang("ru")} className={`nav-pill px-2 py-1 text-[10px] ${lang === "ru" ? "active" : ""}`}>RU</button><button onClick={() => setLang("uz")} className={`nav-pill px-2 py-1 text-[10px] ${lang === "uz" ? "active" : ""}`}>UZ</button></div>
        <div className="flex items-center gap-2">
          <button onClick={reloadAll} className="btn-ghost px-3 py-2 text-xs flex items-center gap-1.5"><RefreshCw size={14} /> {t("Обновить")}</button>
          <button onClick={goStore} className="btn-ghost px-3 py-2 text-xs flex items-center gap-1.5"><LayoutDashboard size={14} /> {t("В магазин")}</button>
          <button onClick={onLogout} className="btn-ghost px-3 py-2 text-xs flex items-center gap-1.5"><LogOut size={14} /> {t("Выйти")}</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setAdminTab("stats")} className={`nav-pill px-4 py-2 text-sm flex items-center gap-1.5 ${adminTab === "stats" ? "active" : ""}`}><BarChart3 size={14} /> {t("Статистика")}</button>
        <button onClick={() => setAdminTab("orders")} className={`nav-pill px-4 py-2 text-sm flex items-center gap-1.5 ${adminTab === "orders" ? "active" : ""}`}><ListOrdered size={14} /> {t("Заказы")}</button>
        <button onClick={() => setAdminTab("offline")} className={`nav-pill px-4 py-2 text-sm flex items-center gap-1.5 ${adminTab === "offline" ? "active" : ""}`}><ShoppingBag size={14} /> {t("Офлайн продажи")}</button>
        <button onClick={() => setAdminTab("products")} className={`nav-pill px-4 py-2 text-sm flex items-center gap-1.5 ${adminTab === "products" ? "active" : ""}`}><Package size={14} /> {t("Товары")}</button>
        <button onClick={() => setAdminTab("settings")} className={`nav-pill px-4 py-2 text-sm flex items-center gap-1.5 ${adminTab === "settings" ? "active" : ""}`}><SettingsIcon size={14} /> {t("Настройки")}</button>
      </div>

      {adminTab === "stats" && (
        <>
          <div className="flex gap-2 mb-5">{PERIODS.map((p) => <button key={p.id} onClick={() => setPeriod(p.id)} className={`nav-pill px-4 py-1.5 text-sm ${period === p.id ? "active" : ""}`}>{t(p.label)}</button>)}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Выручка")}</div><div className="mono text-lg font-medium mt-1">{formatSum(revenue)} сум</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Заказов")}</div><div className="mono text-lg font-medium mt-1">{ordersCount}</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Товаров продано")}</div><div className="mono text-lg font-medium mt-1">{itemsSold}</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Наличные")}</div><div className="mono text-lg font-medium mt-1">{formatSum(cashTotal)} сум</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Карта")}</div><div className="mono text-lg font-medium mt-1">{formatSum(cardTotal)} сум</div></div>
          </div>
          {ordersCount === 0 && <div className="text-xs mb-4 p-3 tag-card" style={{ color: "var(--muted)" }}>{t("Пока нет данных за этот период. Загляните на вкладку «Настройки», чтобы добавить тестовые заказы и посмотреть, как выглядит график.")}</div>}
          <div className="tag-card p-4 mb-6">
            <div className="text-sm font-medium mb-3">{t("Динамика выручки")}</div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer><BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C9C2B8" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#C7A64A" }} axisLine={{ stroke: "#C9C2B8" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#C7A64A" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}М` : v >= 1000 ? `${Math.round(v / 1000)}К` : v)} />
                <Tooltip formatter={(v) => [`${formatSum(v)} сум`, t("Выручка")]} contentStyle={{ background: "#F7F5F1", border: "1px solid #C9C2B8", borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="value" fill="#C7A64A" radius={[2, 2, 0, 0]} />
              </BarChart></ResponsiveContainer>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="tag-card p-4"><div className="text-sm font-medium mb-3">{t("Топ товаров по выручке")}</div>{topProducts.length === 0 && <div className="text-xs" style={{ color: "var(--muted)" }}>{t("Нет продаж за период")}</div>}{topProducts.map(({ product, rev }) => <div key={product.id} className="flex items-center justify-between gap-3 adm-row py-2.5 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--line)" }}>
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <Package size={18} style={{ color: "var(--muted)" }} />}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-xs mt-0.5 flex flex-wrap gap-x-2" style={{ color: "var(--muted)" }}>
                    {product.color && <span>Цвет: {product.color}</span>}
                    {product.size && <span>Размер: {product.size}</span>}
                  </div>
                </div>
              </div>
              <span className="mono shrink-0" style={{ color: "var(--accent)" }}>{formatSum(rev)} сум</span>
            </div>)}</div>
            <div className="tag-card p-4"><div className="text-sm font-medium mb-1">{t("Онлайн / офлайн")}</div><div className="text-xs mb-3" style={{ color: "var(--muted)" }}>{t("Доля продаж на сайте за выбранный период")}</div><div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: "var(--line)" }}><div style={{ width: `${Math.round(onlineShare * 100)}%`, background: "var(--accent-2)" }} /></div><div className="flex justify-between text-xs mono mt-2"><span style={{ color: "var(--accent-2)" }}>Онлайн {Math.round(onlineShare * 100)}%</span><span style={{ color: "var(--muted)" }}>Офлайн {Math.round((1 - onlineShare) * 100)}%</span></div></div>
          </div>

        </>
      )}

      {offlineSaleProduct && (
        <OfflineSaleModal
          t={t}
          product={offlineSaleProduct}
          onClose={() => setOfflineSaleProduct(null)}
          onSubmit={(size, color, qty) => {
            addOfflineToCart(offlineSaleProduct, size, color, qty);
            setOfflineSaleProduct(null);   // ← добавили эту строку
          }}
        />
      )}

      {adminTab === "offline" && (
        <>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="display text-xl font-bold">{t("Офлайн продажи")}</div>
              <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Добавляйте несколько товаров в одну корзину, затем выберите способ оплаты.</div>
            </div>
            <button disabled={!offlineCount} onClick={() => setOfflinePaymentOpen(true)} className="btn-primary px-4 py-2.5 text-sm font-medium flex items-center gap-2 disabled:opacity-40"><ShoppingBag size={15} /> Корзина · {offlineCount}</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-7">
            {products.map((p) => {
              const firstColor = (p.color || "").split(",").map((c) => c.trim()).filter(Boolean)[0];
              const image = (firstColor ? getColorImage(p.color_images, firstColor) : null) || p.image_url;
              return (
                <div key={p.id} className="tag-card overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden" style={{ background: "var(--line)" }}>
                    {image ? <img src={image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={32} style={{ color: "var(--muted)" }} /></div>}
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="mono text-sm mt-1" style={{ color: "var(--accent)" }}>{formatSum(p.price)} сум</div>
                    <div className="text-xs mt-1 mb-3" style={{ color: "var(--muted)" }}>Остаток: {p.stock}</div>
                    <button onClick={() => setOfflineSaleProduct(p)} disabled={p.stock <= 0} className="btn-primary w-full py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"><Plus size={14} /> Добавить в корзину</button>
                  </div>
                </div>
              );
            })}
          </div>

          {offlineCartItems.length > 0 && (
            <div className="tag-card p-4 mb-5">
              <div className="text-sm font-medium mb-3">Текущая корзина</div>
              {offlineCartItems.map((i) => {
                const max = i.variantStock === null ? undefined : i.variantStock;
                return (
                  <div key={i.key} className="adm-row py-2.5 flex items-center gap-3">
                    <div className="w-11 h-11 rounded overflow-hidden shrink-0" style={{ background: "var(--line)" }}>
                      {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{i.name}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {i.size} · {i.color}{max !== undefined && <> · доступно {max}</>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => changeOfflineQty(i.key, -1)} className="qty-btn btn-ghost"><Minus size={12} /></button>
                      <input
                        type="number"
                        min="0"
                        max={max}
                        value={i.qty}
                        onChange={(e) => setOfflineQty(i.key, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-14 px-1 py-1 text-center mono text-sm"
                      />
                      <button onClick={() => changeOfflineQty(i.key, 1)} className="qty-btn btn-ghost"><Plus size={12} /></button>
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] mono uppercase" style={{ color: "var(--muted)" }}>Цена продажи</label>
                      <input
                        type="number"
                        min="0"
                        value={i.salePrice}
                        onChange={(e) => setOfflineSalePrice(i.key, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-2 py-1 text-right mono text-sm"
                      />
                      {Number(i.salePrice) !== Number(i.price) && (
                        <div className="text-[10px] mt-0.5 text-right" style={{ color: "var(--muted)" }}>Цена товара: {formatSum(i.price)} сум</div>
                      )}
                    </div>
                    <div className="mono text-sm w-28 text-right">{formatSum(Number(i.salePrice ?? i.price) * i.qty)} сум</div>
                    <button onClick={() => removeOfflineItem(i.key)} title="Удалить позицию" style={{ color: "var(--accent)" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
              <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: "var(--line)" }}>
                <span className="font-medium">Итого</span>
                <span className="mono font-medium" style={{ color: "var(--accent)" }}>{formatSum(offlineTotal)} сум</span>
              </div>
            </div>
          )}

          <div className="tag-card p-4">
            <div className="text-sm font-medium mb-3">История офлайн продаж</div>
            {orders.filter(o => o.source === "offline").length === 0 ? (
              <div className="text-xs py-5 text-center" style={{ color: "var(--muted)" }}>Нет продаж за период</div>
            ) : (
              <div className="space-y-2">
                {orders.filter(o => o.source === "offline").slice(0, 30).map(o => (
                  <div key={o.id} className="adm-row py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm">№ {o.id} · {o.items?.length || 0} товар(ов)</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>
                          {new Date(o.date).toLocaleString("ru-RU")} · {o.payment?.method === "mixed" ? `Карта ${formatSum(o.payment.card)} + наличные ${formatSum(o.payment.cash)}` : o.payment?.method === "card" ? "Карта" : "Наличные"}
                        </div>
                      </div>
                      <div className="mono text-sm" style={{ color: "var(--accent)" }}>{formatSum(o.total)} сум</div>
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      {o.items?.map(i => `${i.name} (${i.size}, ${i.color}) × ${i.qty}`).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {offlinePaymentOpen && <OfflinePaymentModal t={t} total={offlineTotal} method={offlinePaymentMethod} setMethod={setOfflinePaymentMethod} cash={offlineCash} setCash={setOfflineCash} card={offlineCard} setCard={setOfflineCard} busy={busy} onClose={() => setOfflinePaymentOpen(false)} onSubmit={() => { const method = offlinePaymentMethod; const cash = method === "cash" ? offlineTotal : method === "card" ? 0 : Number(offlineCash); const card = method === "card" ? offlineTotal : method === "cash" ? 0 : Number(offlineCard); if (cash + card !== offlineTotal) { alert(`Сумма оплаты должна быть ${formatSum(offlineTotal)} сум`); return; } recordOfflineSale(offlineCartItems, { method, cash, card }); }} />}

      {adminTab === "orders" && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap"><button onClick={() => setOrderFilter("all")} className={`nav-pill px-4 py-1.5 text-sm ${orderFilter === "all" ? "active" : ""}`}>{t("Все")}</button>{STATUS_ORDER.map((s) => <button key={s} onClick={() => setOrderFilter(s)} className={`nav-pill px-4 py-1.5 text-sm ${orderFilter === s ? "active" : ""}`}>{STATUS_META[s].label}</button>)}</div>
          <div className="space-y-3">
            {filteredOrders.length === 0 && <div className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>{t("Заказов не найдено")}</div>}
            {filteredOrders.slice(0, 60).map((o) => {
              const meta = STATUS_META[o.status]; return (
                <div key={o.id} className="tag-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2"><span className="mono text-xs" style={{ color: "var(--muted)" }}>№ {o.id}</span><span className="text-xs" style={{ color: "var(--muted)" }}>{new Date(o.date).toLocaleString("ru-RU")}</span><span className="badge" style={{ background: o.source === "online" ? "#C7A64A22" : "#C7A64A22", color: o.source === "online" ? "var(--accent-2)" : "var(--muted)" }}>{o.source === "online" ? t("Сайт") : t("Офлайн")}</span></div>
                    <span className="badge" style={{ background: meta.color + "22", color: meta.color }}><meta.icon size={12} />{t(meta.label)}</span>
                  </div>
                  <div className="text-sm mb-1">{o.items.map((i) => `${i.name}${i.size !== "—" ? ` (${i.size}, ${i.color})` : ""} × ${i.qty}`).join(", ")}</div>
                  {o.customer && <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>{o.customer.name} · {o.customer.phone} · {o.customer.address}</div>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="mono text-sm" style={{ color: "var(--accent)" }}>{formatSum(o.total)} сум</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {o.source === "online" && STATUS_ORDER.map((s) => <button key={s} onClick={() => setOrderStatus(o.id, s)} className="btn-ghost px-2 py-1 text-xs" style={o.status === s ? { borderColor: meta.color, color: meta.color } : {}}>{STATUS_META[s].label}</button>)}
                      {o.source === "offline" && (
                        <button onClick={() => { if (window.confirm(t("Удалить эту запись и вернуть товар на склад?"))) deleteOrder(o); }} className="btn-ghost px-2 py-1 text-xs flex items-center gap-1" style={{ color: "var(--accent)" }}>
                          <Trash2 size={12} /> {t("Удалить (ошибка)")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {adminTab === "products" && (
        <>
          <form onSubmit={addProduct} className="tag-card p-4 mb-6 grid grid-cols-2 md:grid-cols-8 gap-3 items-end">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Название")}</label>
              <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm" placeholder={t("Название товара")} />
            </div>
            <div>
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Категория")}</label>
              <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm">
                <option value="clothing">{t("Одежда")}</option>
                <option value="shoes">{t("Обувь")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Категория")}</label>
              <select value={newProduct.subcategory || ""} onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm">
                <option value="">{t("Без типа")}</option>
                {newProduct.category === "clothing" ? <>
                  <option value="Футболки">{t("Футболки")}</option>
                  <option value="Рубашки">{t("Рубашки")}</option>
                  <option value="Ветровки">{t("Ветровки")}</option>
                  <option value="Куртки">{t("Куртки")}</option>
                  <option value="Брюки">{t("Брюки")}</option>
                  <option value="Джинсы">{t("Джинсы")}</option>
                  <option value="Худи / Свитера">{t("Худи / Свитера")}</option>
                </> : <>
                  <option value="Кроссовки">{t("Кроссовки")}</option>
                  <option value="Туфли">{t("Туфли")}</option>
                  <option value="Ботинки">{t("Ботинки")}</option>
                  <option value="Сандалии">{t("Сандалии")}</option>
                </>}
              </select>
            </div>
            <div>
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Цена, сум")}</label>
              <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Остаток")}</label>
              <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm" placeholder="0" />
            </div>

            <div className="col-span-2">
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Размеры")}</label>
              <input type="text" value={newProduct.size} onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm" placeholder="S, M, L, XL" />
            </div>
            <div className="col-span-2">
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Цвета")}</label>
              <input type="text" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} className="w-full px-3 py-2 mt-1 text-sm" placeholder="Чёрный, Белый, Бежевый" />
            </div>

            {Array.from(
              new Set(
                newProduct.color.split(",").map((c) => c.trim()).filter(Boolean)
              )
            ).map((colorName, idx) => (
              <div key={`${colorName}-${idx}`} className="col-span-2 md:col-span-1">
                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Фото {colorName}</label>
                <label className="btn-ghost w-full py-2 text-xs mt-1 flex items-center justify-center gap-1.5 cursor-pointer overflow-hidden">
                  {newProductColorImages[colorName] ? <img src={newProductColorImages[colorName]} alt="" className="w-6 h-6 rounded object-cover" /> : <ImagePlus size={14} />}
                  <span className="truncate">{newProductColorImages[colorName] ? "Загружено" : "Выбрать"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadNewProductColorPhoto(colorName, e.target.files[0])} />
                </label>
              </div>
            ))}

            <div>
              <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Фото")}</label>
              <label className="btn-ghost w-full py-2 text-xs mt-1 flex items-center justify-center gap-1.5 cursor-pointer">
                {uploadingNewPhoto ? "Загрузка…" : newProduct.image_url ? <img src={newProduct.image_url} alt="" className="w-5 h-5 rounded object-cover" /> : <ImagePlus size={14} />}
                {!uploadingNewPhoto && !newProduct.image_url && "Выбрать"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadNewProductPhoto(e.target.files[0])} />
              </label>
            </div>
            <button type="submit" className="btn-primary py-2 text-sm font-medium flex items-center justify-center gap-1.5"><Plus size={14} /> {t("Добавить")}</button>
          </form>
          <div className="tag-card overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-xs mono uppercase adm-row" style={{ color: "var(--muted)" }}>
              <div className="col-span-2"></div>
              <div className="col-span-3">{t("Товар")}</div>
              <div className="col-span-2">{t("Категория")}</div>
              <div className="col-span-2">{t("Цена")}</div>
              <div className="col-span-2">{t("Остаток")}</div>
              <div className="col-span-1"></div>
            </div>
            {products.map((p) => {
              const productColors = (p.color || "").split(",").map((c) => c.trim()).filter(Boolean);
              const colorImages = (p.color_images && typeof p.color_images === "object") ? p.color_images : {};
              return (
                <div key={p.id} className="adm-row px-4 py-3">
                  <div className="grid grid-cols-12 items-center text-sm">
                    <div className="col-span-2">
                      <label
                        className="w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
                        style={{ background: "var(--line)" }}
                        title={t("Загрузить/заменить фото")}
                      >
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImagePlus size={22} style={{ color: "var(--muted)" }} />
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && setProductPhoto(p.id, e.target.files[0])} />
                      </label>
                    </div>
                    <div className="col-span-3">
                      <div>{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{p.color || "—"} · {p.size || "—"}</div>
                    </div>
                    <div className="col-span-2 text-xs" style={{ color: "var(--muted)" }}>{p.category === "shoes" ? t("Обувь") : t("Одежда")}</div>
                    <div className="col-span-2 mono">{formatSum(p.price)}</div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <button onClick={() => adjustStock(p.id, -1, false)} className="qty-btn btn-ghost"><Minus size={12} /></button>
                      <span className="mono w-6 text-center">{p.stock}</span>
                      <button onClick={() => adjustStock(p.id, 1, false)} className="qty-btn btn-ghost"><Plus size={12} /></button>
                    </div>
                    <div className="col-span-1 text-right flex justify-end gap-2">
                      <button onClick={() => setVariantStockProduct(p)} className="btn-ghost px-2 py-1 text-[10px]">Размеры</button>
                      <button onClick={() => setEditingProduct(p)} className="btn-ghost px-2 py-1 text-[10px]" title="Изменить"><Pencil size={13} /></button>
                      <button onClick={() => deleteProduct(p.id)} style={{ color: "var(--accent)" }}><Trash2 size={15} /></button>
                    </div>
                  </div>

                  {productColors.length > 0 && (
                    <div className="mt-2 pl-1">
                      <div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>{t("Фото по цветам")}</div>
                      <div className="flex flex-wrap gap-2">
                        {productColors.map((colorName) => {
                          const existing = getColorImage(colorImages, colorName);
                          return (
                            <label key={colorName} className="btn-ghost px-2 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer overflow-hidden">
                              {existing ? <img src={existing} alt="" className="w-5 h-5 rounded object-cover" /> : <ImagePlus size={12} />}
                              <span>{colorName}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files[0] && setProductColorPhoto(p.id, colorName, e.target.files[0])}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {variantStockProduct && <VariantStockModal product={variantStockProduct} onClose={() => setVariantStockProduct(null)} onSave={async (map) => { await saveVariantStock(variantStockProduct.id, map); setVariantStockProduct(null); }} />}
      {editingProduct && <EditProductModal product={editingProduct} t={t} onClose={() => setEditingProduct(null)} onSave={async (id, values) => { await updateProduct(id, values); setEditingProduct(null); }} />}

      {adminTab === "settings" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="tag-card p-5">
            <div className="text-sm font-medium mb-1 flex items-center gap-2"><Database size={15} /> {t("Подключение к базе данных")}</div>
            <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>{t("Project Settings → API в вашем проекте Supabase")}</div>
            <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Project URL</label>
            <input type="text" value={localCfg.url || ""} onChange={(e) => setLocalCfg({ ...localCfg, url: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" />
            <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Anon key</label>
            <input type="text" value={localCfg.key || ""} onChange={(e) => setLocalCfg({ ...localCfg, key: e.target.value })} className="w-full px-3 py-2 mb-4 mt-1 text-sm" />
            <button onClick={() => setConfig(localCfg)} className="btn-primary w-full py-2.5 text-sm font-medium mb-2">{t("Сохранить и переподключиться")}</button>
            <button onClick={seedDemoOrders} className="btn-ghost w-full py-2.5 text-sm">{t("Добавить тестовые заказы (для графика)")}</button>
          </div>

          <div className="tag-card p-5">
            <div className="text-sm font-medium mb-1 flex items-center gap-2"><CreditCard size={15} /> {t("Оплата картой")}</div>
            <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>{t("Эти реквизиты покупатель увидит сразу после оформления заказа — на них он должен перевести деньги.")}</div>
            <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Номер карты")}</label>
            <input type="text" value={localCfg.cardNumber || ""} onChange={(e) => setLocalCfg({ ...localCfg, cardNumber: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="8600 1234 5678 9012" />
            <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Получатель (необязательно)")}</label>
            <input type="text" value={localCfg.cardHolder || ""} onChange={(e) => setLocalCfg({ ...localCfg, cardHolder: e.target.value })} className="w-full px-3 py-2 mb-4 mt-1 text-sm" placeholder={t("Имя Фамилия")} />
            <button onClick={() => setConfig(localCfg)} className="btn-primary w-full py-2.5 text-sm font-medium">{t("Сохранить")}</button>
          </div>

          <div className="tag-card p-5">
            <div className="text-sm font-medium mb-1 flex items-center gap-2"><Send size={15} /> {t("Уведомления в Telegram")}</div>
            <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>{t("1. Создайте бота через")} <span className="mono">@BotFather</span>.<br />{t("2. Напишите ему, затем откройте")} <span className="mono">{t("api.telegram.org/bot&lt;токен&gt;/getUpdates")}</span> и найдите <span className="mono">chat.id</span>.<br />{t("3. Уведомление придёт, когда клиент нажмёт «Я оплатил(а)» после оформления заказа.")}</div>
            <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Токен бота")}</label>
            <input type="text" value={localCfg.telegramToken || ""} onChange={(e) => setLocalCfg({ ...localCfg, telegramToken: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="123456:ABC-DEF..." />
            <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>Chat ID</label>
            <input type="text" value={localCfg.telegramChatId || ""} onChange={(e) => setLocalCfg({ ...localCfg, telegramChatId: e.target.value })} className="w-full px-3 py-2 mb-4 mt-1 text-sm" placeholder="123456789" />
            <div className="flex gap-2">
              <button onClick={() => setConfig(localCfg)} className="btn-primary flex-1 py-2.5 text-sm font-medium">{t("Сохранить")}</button>
              <button onClick={async () => { const r = await sendTelegram(localCfg, "✅ Тестовое уведомление от Paris Clothes"); setTestResult(r); }} className="btn-ghost flex-1 py-2.5 text-sm">{t("Тест")}</button>
            </div>
            {testResult && <div className="text-xs mt-3" style={{ color: testResult.ok ? "var(--accent-2)" : "var(--accent)" }}>{testResult.ok ? "Отправлено успешно." : `Ошибка: ${testResult.error}`}</div>}
            <div className="text-sm font-medium mt-5 mb-2">{t("Журнал")}</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifLog.length === 0 && <div className="text-xs" style={{ color: "var(--muted)" }}>{t("Появится, когда клиент подтвердит оплату")}</div>}
              {notifLog.map((n) => <div key={n.id + n.date} className="text-xs adm-row py-2"><div className="flex items-center justify-between"><span className="mono">{n.id}</span><span style={{ color: n.ok ? "var(--accent-2)" : "var(--accent)" }}>{n.ok ? "Отправлено" : "Ошибка"}</span></div></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}