import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag, X, Plus, Minus, Search, Check, Shirt, Footprints, ChevronRight,
  LayoutDashboard, Package, BarChart3, Lock, LogOut, Trash2, Star, Ruler, Send,
  Clock, XCircle, CheckCircle2, Bell, PhoneCall, ListOrdered, Settings as SettingsIcon,
  Database, AlertTriangle, RefreshCw, ImagePlus, CreditCard,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

/* ---------------------------- static data ---------------------------- */

const GRADIENTS = [["#7A2E2E", "#9C4A3F"], ["#4B5D46", "#6B7F5E"], ["#3E4C59", "#5A6B78"], ["#8B5E34", "#A97B4F"]];
const COLOR_PALETTE = [
  { name: "Чёрный", hex: "#1F1D1B" }, { name: "Белый", hex: "#F2F0EA" }, { name: "Бежевый", hex: "#C9B79C" },
  { name: "Оливковый", hex: "#5C6B4F" }, { name: "Бордовый", hex: "#7A2E2E" }, { name: "Серый", hex: "#8B8478" },
];
const SIZE_CHART = {
  clothing: [{ size: "XS", chest: "84–88", waist: "64–68" }, { size: "S", chest: "88–92", waist: "68–72" }, { size: "M", chest: "92–96", waist: "72–76" }, { size: "L", chest: "96–100", waist: "76–80" }, { size: "XL", chest: "100–104", waist: "80–84" }, { size: "XXL", chest: "104–108", waist: "84–88" }],
  shoes: [{ size: "36", foot: "23.0" }, { size: "37", foot: "23.5" }, { size: "38", foot: "24.5" }, { size: "39", foot: "25.0" }, { size: "40", foot: "25.5" }, { size: "41", foot: "26.5" }, { size: "42", foot: "27.0" }, { size: "43", foot: "27.5" }, { size: "44", foot: "28.5" }, { size: "45", foot: "29.0" }],
};
const ADMIN_PASSWORD = "parij2024";
const MONTH_LABELS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const WEEKDAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const PERIODS = [{ id: "day", label: "День" }, { id: "week", label: "Неделя" }, { id: "month", label: "Месяц" }, { id: "year", label: "Год" }];
const STATUS_META = {
  new: { label: "Ждёт оплаты", color: "#7A2E2E", icon: Bell },
  processing: { label: "В обработке", color: "#8B5E34", icon: Clock },
  delivered: { label: "Доставлен", color: "#4B5D46", icon: CheckCircle2 },
  cancelled: { label: "Отменён", color: "#8B8478", icon: XCircle },
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
    "Все": "Все", "Одежда": "Одежда", "Обувь": "Обувь", "Поиск товара": "Поиск товара", "Нет в наличии": "Нет в наличии",
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
    "Оформление заказа": "Оформление заказа", "Имя": "Имя", "Телефон": "Телефон", "Адрес доставки": "Адрес доставки", "Подтвердить заказ": "Подтвердить заказ",
    "Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.": "Оплата только картой. Номер карты для перевода появится на следующем шаге, сразу после оформления заказа.",
    "Оплата получена": "Оплата получена", "Спасибо,": "Спасибо,", "Вернуться в каталог": "Вернуться в каталог", "Заказ принят": "Заказ принят",
    "Оплатите картой": "Оплатите картой", "Продавец ещё не указал номер карты. Свяжитесь с нами для оплаты.": "Продавец ещё не указал номер карты. Свяжитесь с нами для оплаты.",
    "Переведите сумму на карту выше, затем нажмите кнопку ниже — мы получим уведомление о вашей оплате.": "Переведите сумму на карту выше, затем нажмите кнопку ниже — мы получим уведомление о вашей оплате.",
    "Оплачу позже / вернуться в каталог": "Оплачу позже / вернуться в каталог", "Фото-заглушки — продавец ещё не загрузил настоящее фото": "Фото-заглушки — продавец ещё не загрузил настоящее фото",
    "Пока нет отзывов": "Пока нет отзывов", "· выберите": "· выберите", "Таблица размеров": "Таблица размеров", "С этим покупают": "С этим покупают",
    "Отзывы": "Отзывы", "Будьте первым, кто оставит отзыв": "Будьте первым, кто оставит отзыв", "Отправить": "Отправить", "Размер": "Размер",
    "Грудь, см": "Грудь, см", "Талия, см": "Талия, см", "Стопа, см": "Стопа, см", "Введите номер телефона, указанный при заказе": "Введите номер телефона, указанный при заказе",
    "Заказы не найдены": "Заказы не найдены", "Записать продажу и списать со склада": "Записать продажу и списать со склада",
    "Paris Clothes · вход для администратора": "Paris Clothes · вход для администратора", "Неверный пароль": "Неверный пароль", "Войти": "Войти",
    "← Вернуться в магазин": "← Вернуться в магазин", "Обновить": "Обновить", "В магазин": "В магазин", "Выйти": "Выйти", "Статистика": "Статистика",
    "Заказы": "Заказы", "Товары": "Товары", "Настройки": "Настройки", "Заказов": "Заказов", "Товаров продано": "Товаров продано", "Средний чек": "Средний чек",
    "Динамика выручки": "Динамика выручки", "Топ товаров по выручке": "Топ товаров по выручке", "Нет продаж за период": "Нет продаж за период",
    "Онлайн / офлайн": "Онлайн / офлайн", "Доля продаж на сайте за выбранный период": "Доля продаж на сайте за выбранный период",
    "Быстрая корректировка остатков": "Быстрая корректировка остатков", "Заказов не найдено": "Заказов не найдено", "Удалить (ошибка)": "Удалить (ошибка)",
    "Название": "Название", "Категория": "Категория", "Цена, сум": "Цена, сум", "Остаток": "Остаток", "Фото": "Фото", "Добавить": "Добавить", "Товар": "Товар", "Цена": "Цена",
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
    "Все": "Barchasi", "Одежда": "Kiyim", "Обувь": "Oyoq kiyim", "Поиск товара": "Mahsulot qidirish", "Нет в наличии": "Mavjud emas",
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
    "Оформление заказа": "Buyurtmani rasmiylashtirish", "Имя": "Ism", "Телефон": "Telefon", "Адрес доставки": "Yetkazib berish manzili", "Подтвердить заказ": "Buyurtmani tasdiqlash",
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
    "Заказы": "Buyurtmalar", "Товары": "Mahsulotlar", "Настройки": "Sozlamalar", "Заказов": "Buyurtmalar", "Товаров продано": "Sotilgan mahsulotlar", "Средний чек": "O‘rtacha chek",
    "Динамика выручки": "Tushum dinamikasi", "Топ товаров по выручке": "Tushum bo‘yicha top mahsulotlar", "Нет продаж за период": "Bu davrda sotuvlar yo‘q",
    "Онлайн / офлайн": "Onlayn / oflayn", "Доля продаж на сайте за выбранный период": "Tanlangan davrdagi saytdagi sotuvlar ulushi",
    "Быстрая корректировка остатков": "Qoldiqni tezkor o‘zgartirish", "Удалить (ошибка)": "O‘chirish (xato)",
    "Название": "Nomi", "Категория": "Kategoriya", "Цена, сум": "Narx, so‘m", "Остаток": "Qoldiq", "Фото": "Rasm", "Добавить": "Qo‘shish", "Товар": "Mahsulot", "Цена": "Narx",
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

/* -------------------------------- app --------------------------------- */

export default function App() {
  const [config, setConfig] = useState(null); // { url, key, telegramToken, telegramChatId, cardNumber, cardHolder }
  const [configLoading, setConfigLoading] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("site_lang") || "ru");
  const t = useMemo(() => makeT(lang), [lang]);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});

  useEffect(() => { (async () => { const c = await loadLocal("admin_config", null); setConfig(c); setConfigLoading(false); })(); }, []);
  useEffect(() => { localStorage.setItem("site_lang", lang); }, [lang]);

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

  if (configLoading) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#8B8478" }}>{t("Загрузка…")}</div>;

  if (!config?.url || !config?.key || (!connected && !loadingData)) {
    return (
      <div className="store-root"><GlobalStyles />
        <ConnectionSetup
          initial={config} loading={loadingData} error={connectError} lang={lang} setLang={setLang} t={t}
          onSave={async (cfg) => { await saveConfig({ ...(config || {}), ...cfg }); }}
        />
      </div>
    );
  }
  if (loadingData) return <div className="store-root"><GlobalStyles /><div style={{ padding: 40, color: "#8B8478" }}>{t("Подключаемся к базе данных…")}</div></div>;

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
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [activeProduct, setActiveProduct] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [statusLookupOpen, setStatusLookupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [adminTab, setAdminTab] = useState("stats");
  const [period, setPeriod] = useState("week");
  const [orderFilter, setOrderFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({ name: "", category: "clothing", price: "", stock: "", size: "", color: "", image_url: "", color_images: {} });
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

  const filtered = useMemo(() => products.filter((p) => (category === "all" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  const cartItems = useMemo(() => Object.entries(cart).filter(([, v]) => v.qty > 0).map(([key, v]) => {
    const product = products.find((p) => p.id === v.productId);
    return product ? { key, ...v, name: product.name, price: product.price } : null;
  }).filter(Boolean), [cart, products]);
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cartItems.reduce((s, i) => s + i.qty, 0);
  const qtyInCartForProduct = (id) => cartItems.filter((i) => i.productId === id).reduce((s, i) => s + i.qty, 0);

  const addToCart = (product, size, color) => {
    if (qtyInCartForProduct(product.id) >= product.stock) return;
    const key = cartKey(product.id, size, color);
    setCart((c) => ({ ...c, [key]: { productId: product.id, size, color, qty: (c[key]?.qty || 0) + 1 } }));
    setActiveProduct(null); setCartOpen(true);
  };
  const changeQty = (key, delta) => setCart((c) => { const next = { ...c }; const qty = (next[key]?.qty || 0) + delta; if (qty <= 0) delete next[key]; else next[key] = { ...next[key], qty }; return next; });

  const placeOrder = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return;
    withErrorHandling(async () => {
      const now = new Date();
      const orderId = `ORD-${now.getTime().toString().slice(-8)}`;
      const orderRow = {
        id: orderId, items: cartItems.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color })),
        total, customer: { ...form }, status: "new", source: "online",
      };
      const insertedRows = await sb(config, "orders", { method: "POST", body: orderRow });
      const inserted = Array.isArray(insertedRows) ? insertedRows[0] : insertedRows;
      if (!inserted) throw new Error("Заказ не был сохранён. Проверьте INSERT policy для таблицы orders в Supabase.");

      const totals = {};
      cartItems.forEach((i) => { totals[i.productId] = (totals[i.productId] || 0) + i.qty; });
      await Promise.all(Object.entries(totals).map(async ([id, qty]) => {
        const p = products.find((x) => x.id === Number(id));
        if (!p) throw new Error(`Товар с ID ${id} не найден.`);
        const updatedRows = await sb(config, `products?id=eq.${id}`, { method: "PATCH", body: { stock: Math.max(0, p.stock - qty) } });
        if (Array.isArray(updatedRows) && updatedRows.length === 0) {
          throw new Error(`Не удалось обновить остаток товара ID ${id}. Проверьте UPDATE policy для products в Supabase.`);
        }
      }));

      setOrders((os) => [{ ...inserted, date: new Date(inserted.created_at || Date.now()) }, ...os]);
      setProducts((ps) => ps.map((p) => (totals[p.id] ? { ...p, stock: Math.max(0, p.stock - totals[p.id]) } : p)));
      // Заказ создан, но клиент ещё не оплатил — уведомление в Telegram отправится только
      // после того, как он нажмёт «Я оплатил(а)» (см. confirmPayment ниже).
      setOrderPlaced(inserted);
    });
  };

  const confirmPayment = (order) => withErrorHandling(async () => {
    await sb(config, `orders?id=eq.${order.id}`, { method: "PATCH", body: { status: "processing" } });
    setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status: "processing" } : o)));
    setOrderPlaced((op) => (op && op.id === order.id ? { ...op, status: "processing" } : op));
    const itemsText = order.items.map((i) => `• ${i.name} (${i.size}, ${i.color}) × ${i.qty}`).join("\n");
    const text = `💳 Клиент подтвердил оплату заказа ${order.id}\n${itemsText}\nИтого: ${formatSum(order.total)} сум\nКлиент: ${order.customer?.name || ""}, ${order.customer?.phone || ""}\nАдрес: ${order.customer?.address || ""}`;
    const result = await sendTelegram(config, text);
    setNotifLog((log) => [{ id: order.id, date: new Date(), ok: result.ok, error: result.error }, ...log]);
  });

  const resetOrder = () => { setCart({}); setOrderPlaced(null); setCheckoutOpen(false); setForm({ name: "", phone: "", address: "" }); };

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
  const recordOfflineSale = (productId, size, color) => withErrorHandling(async () => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;
    const newStock = Math.max(0, product.stock - 1);
    await sb(config, `products?id=eq.${productId}`, { method: "PATCH", body: { stock: newStock } });
    setProducts((ps) => ps.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
    const now = new Date();
    const row = { id: `OFF-${now.getTime().toString().slice(-8)}`, items: [{ productId, name: product.name, price: product.price, qty: 1, size, color }], total: product.price, customer: null, status: "delivered", source: "offline" };
    const [inserted] = await sb(config, "orders", { method: "POST", body: row });
    setOrders((os) => [{ ...inserted, date: new Date(inserted.created_at) }, ...os]);
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

  const deleteProductRemote = (id) => withErrorHandling(async () => { await sb(config, `products?id=eq.${id}`, { method: "DELETE" }); setProducts((ps) => ps.filter((p) => p.id !== id)); });
  const addProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    withErrorHandling(async () => {
      const [inserted] = await sb(config, "products", { method: "POST", body: { name: newProduct.name, category: newProduct.category, price: Number(newProduct.price), stock: Number(newProduct.stock) || 0, size: newProduct.size.trim(), color: newProduct.color.trim(), image_url: newProduct.image_url || null, color_images: newProductColorImages } });
      setProducts((ps) => [...ps, inserted]);
      setNewProduct({ name: "", category: "clothing", price: "", stock: "", size: "", color: "", image_url: "", color_images: {} });
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
        return p ? sb(config, `products?id=eq.${id}`, { method: "PATCH", body: { stock: p.stock + qty } }) : null;
      }));
      setProducts((ps) => ps.map((p) => (totals[p.id] ? { ...p, stock: p.stock + totals[p.id] } : p)));
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
  const avgCheck = ordersCount ? revenue / ordersCount : 0;
  const onlineShare = ordersCount ? periodOrders.filter((o) => o.source === "online").length / ordersCount : 0;

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
        <div className="fixed top-0 left-0 right-0 z-[100] text-center text-xs py-2 px-4 flex items-center justify-center gap-3" style={{ background: "#7A2E2E", color: "white" }}>
          <span>{t("Ошибка:")} {errorBanner}</span>
          <button onClick={() => setErrorBanner("")}><X size={13} /></button>
        </div>
      )}
      {view === "store" ? (
        <StoreView
          products={products} filtered={filtered} category={category} setCategory={setCategory} query={query} setQuery={setQuery}
          count={count} cartOpen={cartOpen} setCartOpen={setCartOpen} cart={cart} changeQty={changeQty} cartItems={cartItems} total={total}
          checkoutOpen={checkoutOpen} setCheckoutOpen={setCheckoutOpen} orderPlaced={orderPlaced} form={form} setForm={setForm}
          placeOrder={placeOrder} resetOrder={resetOrder} goAdmin={() => setView("admin")} activeProduct={activeProduct} setActiveProduct={setActiveProduct}
          addToCart={addToCart} reviews={reviews} addReview={addReview} setSizeChartOpen={setSizeChartOpen} setStatusLookupOpen={setStatusLookupOpen}
          config={config} confirmPayment={confirmPayment} busy={busy} lang={lang} setLang={setLang} t={t}
        />
      ) : (
        <AdminView
          adminAuthed={adminAuthed} pwInput={pwInput} setPwInput={setPwInput} pwError={pwError}
          onLogin={() => { if (pwInput === ADMIN_PASSWORD) { setAdminAuthed(true); setPwError(false); } else setPwError(true); }}
          onLogout={() => { setAdminAuthed(false); setPwInput(""); }} goStore={() => setView("store")} adminTab={adminTab} setAdminTab={setAdminTab}
          products={products} adjustStock={adjustStock} recordOfflineSale={recordOfflineSale} deleteProduct={deleteProductRemote} newProduct={newProduct} setNewProduct={setNewProduct} addProduct={addProduct}
          setProductPhoto={setProductPhoto} setProductColorPhoto={setProductColorPhoto} uploadNewProductPhoto={uploadNewProductPhoto} uploadingNewPhoto={uploadingNewPhoto}
          newProductColorImages={newProductColorImages} uploadNewProductColorPhoto={uploadNewProductColorPhoto}
          period={period} setPeriod={setPeriod} revenue={revenue} itemsSold={itemsSold} ordersCount={ordersCount} avgCheck={avgCheck} onlineShare={onlineShare}
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
      .store-root { --canvas:#E8E6E1; --card:#F7F5F1; --ink:#211F1C; --muted:#8B8478; --line:#C9C2B8; --accent:#7A2E2E; --accent-2:#4B5D46;
        font-family:'Inter',ui-sans-serif,system-ui,sans-serif; background:var(--canvas); color:var(--ink); min-height:100%; position:relative; }
      .display { font-family:'Bricolage Grotesque','Inter',sans-serif; letter-spacing:-0.02em; }
      .mono { font-family:'IBM Plex Mono',ui-monospace,monospace; }
      .tear-line { border-top:1.5px dashed var(--line); }
      .tag-card { background:var(--card); border:1px solid var(--line); border-radius:4px; position:relative; transition:transform .15s ease, box-shadow .15s ease; }
      .tag-card.hoverable:hover { transform:translateY(-3px); box-shadow:0 10px 24px -12px rgba(33,31,28,.35); cursor:pointer; }
      .tag-hole { position:absolute; top:10px; left:10px; width:14px; height:14px; border-radius:50%; background:var(--canvas); border:1.5px solid var(--line); z-index:2; }
      .nav-pill { border:1px solid var(--line); border-radius:999px; transition:all .15s ease; }
      .nav-pill.active { background:var(--ink); color:var(--card); border-color:var(--ink); }
      .btn-primary { background:var(--accent); color:#F7F5F1; border-radius:3px; transition:opacity .15s ease; }
      .btn-primary:hover { opacity:.88; } .btn-primary:disabled { opacity:.4; cursor:not-allowed; }
      .btn-ghost { border:1px solid var(--line); border-radius:3px; transition:all .15s ease; } .btn-ghost:hover { border-color:var(--ink); }
      .drawer { transition:transform .28s cubic-bezier(.32,.72,0,1); }
      input[type="text"],input[type="tel"],input[type="password"],input[type="number"],select,textarea { background:var(--card); border:1px solid var(--line); color:var(--ink); border-radius:3px; }
      input:focus,textarea:focus,select:focus { outline:none; border-color:var(--accent); }
      ::selection { background:var(--accent); color:white; }
      .stat-card { background:var(--card); border:1px solid var(--line); border-radius:4px; }
      .adm-row:not(:last-child) { border-bottom:1px solid var(--line); }
      .qty-btn { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
      .swatch { width:22px; height:22px; border-radius:50%; border:2px solid transparent; cursor:pointer; }
      .swatch.selected { border-color:var(--accent); }
      .size-chip { border:1px solid var(--line); border-radius:3px; padding:6px 10px; font-size:13px; cursor:pointer; }
      .size-chip.selected { background:var(--ink); color:var(--card); border-color:var(--ink); }
      .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:999px; font-size:11px; }
    `}</style>
  );
}
function Stars({ value, size = 13 }) {
  return <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} fill={n <= Math.round(value) ? "#7A2E2E" : "none"} color={n <= Math.round(value) ? "#7A2E2E" : "#C9C2B8"} />)}</div>;
}
function avgRating(list) { if (!list || list.length === 0) return null; return list.reduce((s, r) => s + r.rating, 0) / list.length; }

/* ------------------------------ store view ------------------------------ */

function StoreView(props) {
  const { lang, setLang, t, products, filtered, category, setCategory, query, setQuery, count, cartOpen, setCartOpen, cart, changeQty, cartItems, total,
    checkoutOpen, setCheckoutOpen, orderPlaced, form, setForm, placeOrder, resetOrder, goAdmin, activeProduct, setActiveProduct,
    addToCart, reviews, addReview, setSizeChartOpen, setStatusLookupOpen, config, confirmPayment, busy } = props;

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-sm" style={{ background: "rgba(232,230,225,0.92)", borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="display text-2xl font-bold tracking-tight">Paris Clothes</div>
          <div className="flex items-center gap-1"><button onClick={() => setLang("ru")} className={`nav-pill px-2 py-1 text-[10px] ${lang === "ru" ? "active" : ""}`}>RU</button><button onClick={() => setLang("uz")} className={`nav-pill px-2 py-1 text-[10px] ${lang === "uz" ? "active" : ""}`}>UZ</button></div>
          <div className="flex items-center gap-4">
            <button onClick={() => setStatusLookupOpen(true)} className="text-xs mono hidden sm:flex items-center gap-1" style={{ color: "var(--muted)" }}><PhoneCall size={13} /> {t("Статус заказа")}</button>
            <button onClick={goAdmin} className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Панель управления")}</button>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 px-3 py-2 nav-pill"><ShoppingBag size={18} /><span className="mono text-sm">{count}</span></button>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-10">
        <div className="mono text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent-2)" }}>{t("Новая коллекция")}</div>
        <h1 className="display text-5xl md:text-7xl font-bold leading-[0.95] max-w-3xl">{t("Одежда и обувь, которую хочется носить каждый день.")}</h1>
        <p className="mt-5 max-w-xl text-base" style={{ color: "var(--muted)" }}>{t("Магазин Paris Clothes теперь онлайн — выбирайте, добавляйте в корзину и оформляйте заказ в пару кликов.")}</p>
      </section>
      <section className="max-w-6xl mx-auto px-5 mb-8">
        <div className="tear-line pt-6 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-2">{[{ id: "all", label: "Все" }, { id: "clothing", label: "Одежда" }, { id: "shoes", label: "Обувь" }].map((c) => <button key={c.id} onClick={() => setCategory(c.id)} className={`nav-pill px-4 py-1.5 text-sm ${category === c.id ? "active" : ""}`}>{t(c.label)}</button>)}</div>
          <div className="flex items-center gap-2 nav-pill px-3 py-1.5 w-full sm:w-64"><Search size={15} style={{ color: "var(--muted)" }} /><input type="text" placeholder={t("Поиск товара")} value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" style={{ background: "transparent", border: "none" }} /></div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const [g1, g2] = GRADIENTS[p.id % GRADIENTS.length]; const Icon = p.category === "shoes" ? Footprints : Shirt; const outOfStock = p.stock <= 0; const rating = avgRating(reviews[p.id]);
            return (
              <div key={p.id} className="tag-card hoverable overflow-hidden" onClick={() => setActiveProduct(p)}>
                <div className="tag-hole" />
                <div className="h-36 md:h-44 flex items-center justify-center overflow-hidden" style={{ background: p.image_url ? "var(--line)" : `linear-gradient(135deg, ${g1}, ${g2})`, opacity: outOfStock ? 0.5 : 1 }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Icon size={40} color="rgba(255,255,255,0.85)" strokeWidth={1.25} />}
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

      {activeProduct && <ProductModal lang={lang} t={t} product={activeProduct} allProducts={products} onClose={() => setActiveProduct(null)} addToCart={addToCart} reviews={reviews[activeProduct.id] || []} addReview={addReview} openOther={(p) => setActiveProduct(p)} onOpenSizeChart={() => setSizeChartOpen(true)} qtyInCart={cartItems.filter((i) => i.productId === activeProduct.id).reduce((s, i) => s + i.qty, 0)} />}

      {cartOpen && <div className="fixed inset-0 z-40" style={{ background: "rgba(33,31,28,0.4)" }} onClick={() => setCartOpen(false)} />}
      <div className="drawer fixed top-0 right-0 h-full w-full sm:w-96 z-50 flex flex-col" style={{ background: "var(--card)", transform: cartOpen ? "translateX(0)" : "translateX(100%)", borderLeft: "1px solid var(--line)" }}>
        <div className="flex items-center justify-between px-5 py-4 tear-line"><div className="display font-bold text-lg">{t("Корзина")}</div><button onClick={() => setCartOpen(false)}><X size={20} /></button></div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cartItems.length === 0 && <div className="text-sm py-10 text-center" style={{ color: "var(--muted)" }}>{t("Корзина пуста")}</div>}
          {cartItems.map((item) => (
            <div key={item.key} className="flex items-center gap-3 py-3 tear-line first:border-t-0">
              <div className="text-sm flex-1"><div className="font-medium leading-snug">{item.name}</div><div className="text-xs" style={{ color: "var(--muted)" }}>Размер {item.size} · {item.color}</div><div className="mono text-xs mt-1" style={{ color: "var(--accent)" }}>{formatSum(item.price)} сум</div></div>
              <div className="flex items-center gap-2 nav-pill px-2 py-1"><button onClick={() => changeQty(item.key, -1)}><Minus size={12} /></button><span className="mono text-xs w-4 text-center">{item.qty}</span><button onClick={() => changeQty(item.key, 1)}><Plus size={12} /></button></div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 tear-line">
          <div className="flex items-center justify-between mb-4"><span className="text-sm" style={{ color: "var(--muted)" }}>{t("Итого")}</span><span className="mono text-lg font-medium">{formatSum(total)} сум</span></div>
          <button disabled={cartItems.length === 0} onClick={() => setCheckoutOpen(true)} className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2">{t("Оформить заказ")} <ChevronRight size={16} /></button>
        </div>
      </div>

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
                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Телефон")}</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 mb-3 mt-1 text-sm" placeholder="+998 90 123 45 67" />
                <label className="text-xs mono uppercase" style={{ color: "var(--muted)" }}>{t("Адрес доставки")}</label>
                <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 mb-4 mt-1 text-sm" placeholder={t("Город, улица, дом")} />
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
                    <div className="display text-xl font-bold mb-1">{t("Заказ принят")}</div>
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
                    <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>{t("Переведите сумму на карту выше, затем нажмите кнопку ниже — мы получим уведомление о вашей оплате.")}</div>
                    <button onClick={() => confirmPayment(orderPlaced)} disabled={busy} className="btn-primary w-full py-3 text-sm font-medium mb-2">{busy ? "Отправляем…" : "Я оплатил(а)"}</button>
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

function ProductModal({ lang, t, product, allProducts, onClose, addToCart, reviews, addReview, openOther, onOpenSizeChart, qtyInCart }) {
  const productSizes = (product.size || "").split(",").map((x) => x.trim()).filter(Boolean);
  const productColors = (product.color || "").split(",").map((x) => x.trim()).filter(Boolean);
  const sizes = productSizes.length ? productSizes : sizesFor(product.category);
  const colors = productColors.length ? productColors.map((name) => ({ name, hex: COLOR_PALETTE.find((c) => c.name.toLowerCase() === name.toLowerCase())?.hex || "#C9C2B8" })) : colorsFor(product.id);
  const [size, setSize] = useState(productSizes[0] || null);
  const colorImages = product.color_images && typeof product.color_images === "object" ? product.color_images : {};
  const [color, setColor] = useState(productColors[0] || null);
  const [photoIdx, setPhotoIdx] = useState(0);
  // Ищем фото ровно для выбранного цвета (без учёта пробелов и регистра);
  // если для этого цвета фото не загружено — используем общее фото товара.
  const selectedPhoto = getColorImage(colorImages, color) || product.image_url;
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, comment: "" });
  const [g1, g2] = GRADIENTS[product.id % GRADIENTS.length];
  const Icon = product.category === "shoes" ? Footprints : Shirt;
  const rating = avgRating(reviews);
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const noSelection = !size || !color;
  const outOfStock = product.stock <= 0 || qtyInCart >= product.stock;

  const submitReview = (e) => { e.preventDefault(); if (!reviewForm.author || !reviewForm.comment) return; addReview(product.id, { author: reviewForm.author, rating: Number(reviewForm.rating), comment: reviewForm.comment }); setReviewForm({ author: "", rating: 5, comment: "" }); };

  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" style={{ background: "rgba(33,31,28,0.6)" }}>
      <div className="w-full max-w-3xl tag-card p-5 sm:p-6 relative my-6" style={{ background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10"><X size={18} /></button>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="h-72 rounded flex items-center justify-center mb-3 overflow-hidden" style={{ background: selectedPhoto ? "var(--line)" : `linear-gradient(135deg, ${g1}, ${g2})` }}>
              {selectedPhoto ? <img src={selectedPhoto} alt={product.name} className="w-full h-full object-cover" /> : <Icon size={64} color="rgba(255,255,255,0.9)" strokeWidth={1} style={{ transform: `rotate(${photoIdx * 8}deg)` }} />}
            </div>
            {!selectedPhoto && (
              <>
                <div className="flex gap-2">{[0, 1, 2].map((i) => <button key={i} onClick={() => setPhotoIdx(i)} className="h-14 flex-1 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, border: photoIdx === i ? "2px solid var(--accent)" : "2px solid transparent" }}><Icon size={20} color="rgba(255,255,255,0.85)" strokeWidth={1.25} /></button>)}</div>
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
              <div className="flex flex-wrap gap-2">{sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`size-chip ${size === s ? "selected" : ""}`}>{s}</button>)}</div>
            </div>
            <div className="mt-4"><div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>Цвет {color ? `— ${color}` : <span style={{ color: "var(--accent)" }}>{t("· выберите")}</span>}</div><div className="flex gap-2">{colors.map((c) => <button key={c.name} onClick={() => setColor(c.name)} className={`swatch ${color === c.name ? "selected" : ""}`} style={{ background: c.hex }} title={t(c.name)} />)}</div></div>
            <div className="text-xs mono mt-4" style={{ color: outOfStock ? "var(--accent)" : "var(--muted)" }}>{product.stock <= 0 ? "Нет в наличии" : `${t("В наличии:")} ${product.stock}`}</div>
            <button disabled={outOfStock || noSelection} onClick={() => addToCart(product, size, color)} className="btn-primary w-full py-3 text-sm font-medium mt-3 flex items-center justify-center gap-2"><ShoppingBag size={15} /> {noSelection ? "Выберите размер и цвет" : "Добавить в корзину"}</button>
          </div>
        </div>
        {related.length > 0 && (
          <div className="mt-8 pt-5 tear-line">
            <div className="text-sm font-medium mb-3">{t("С этим покупают")}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{related.map((p) => {
              const [rg1, rg2] = GRADIENTS[p.id % GRADIENTS.length]; const RIcon = p.category === "shoes" ? Footprints : Shirt; return (
                <div key={p.id} className="tag-card hoverable overflow-hidden" onClick={() => openOther(p)}>
                  <div className="h-20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rg1}, ${rg2})` }}><RIcon size={24} color="rgba(255,255,255,0.85)" strokeWidth={1.25} /></div>
                  <div className="p-2"><div className="text-xs font-medium truncate">{p.name}</div><div className="mono text-xs" style={{ color: "var(--accent)" }}>{formatSum(p.price)} сум</div></div>
                </div>
              );
            })}</div>
          </div>
        )}
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
  const colors = productColors.length ? productColors.map((name) => ({ name, hex: COLOR_PALETTE.find((c) => c.name.toLowerCase() === name.toLowerCase())?.hex || "#C9C2B8" })) : colorsFor(product.id);
  const [size, setSize] = useState(productSizes[Math.floor(productSizes.length / 2)] || sizes[Math.floor(sizes.length / 2)]);
  const [color, setColor] = useState(productColors[0] || colors[0].name);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(33,31,28,0.6)" }}>
      <div className="w-full max-w-sm tag-card p-6 relative" style={{ background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4"><X size={18} /></button>
        <div className="display text-lg font-bold mb-1">{t("Продано офлайн")}</div>
        <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>{product.name}</div>
        <div className="mb-3">
          <div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>{t("Размер")}</div>
          <div className="flex flex-wrap gap-2">{sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`size-chip ${size === s ? "selected" : ""}`}>{s}</button>)}</div>
        </div>
        <div className="mb-5">
          <div className="text-xs mono uppercase mb-1.5" style={{ color: "var(--muted)" }}>Цвет — {color}</div>
          <div className="flex gap-2">{colors.map((c) => <button key={c.name} onClick={() => setColor(c.name)} className={`swatch ${color === c.name ? "selected" : ""}`} style={{ background: c.hex }} title={t(c.name)} />)}</div>
        </div>
        <button onClick={() => onSubmit(size, color)} className="btn-primary w-full py-3 text-sm font-medium">{t("Записать продажу и списать со склада")}</button>
      </div>
    </div>
  );
}

/* ------------------------------ admin view ------------------------------ */

function AdminView(props) {
  const { lang, setLang, t, adminAuthed, pwInput, setPwInput, pwError, onLogin, onLogout, goStore, adminTab, setAdminTab,
    products, adjustStock, recordOfflineSale, deleteProduct, newProduct, setNewProduct, addProduct,
    setProductPhoto, setProductColorPhoto, uploadNewProductPhoto, uploadingNewPhoto,
    newProductColorImages, uploadNewProductColorPhoto,
    period, setPeriod, revenue, itemsSold, ordersCount, avgCheck, onlineShare, chartData, topProducts,
    orders, filteredOrders, orderFilter, setOrderFilter, setOrderStatus, deleteOrder, config, setConfig, notifLog, seedDemoOrders, reloadAll, busy } = props;

  const [testResult, setTestResult] = useState(null);
  const [localCfg, setLocalCfg] = useState(config);
  const [offlineSaleProduct, setOfflineSaleProduct] = useState(null);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Выручка")}</div><div className="mono text-lg font-medium mt-1">{formatSum(revenue)} сум</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Заказов")}</div><div className="mono text-lg font-medium mt-1">{ordersCount}</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Товаров продано")}</div><div className="mono text-lg font-medium mt-1">{itemsSold}</div></div>
            <div className="stat-card p-4"><div className="text-xs mono" style={{ color: "var(--muted)" }}>{t("Средний чек")}</div><div className="mono text-lg font-medium mt-1">{formatSum(avgCheck)} сум</div></div>
          </div>
          {ordersCount === 0 && <div className="text-xs mb-4 p-3 tag-card" style={{ color: "var(--muted)" }}>{t("Пока нет данных за этот период. Загляните на вкладку «Настройки», чтобы добавить тестовые заказы и посмотреть, как выглядит график.")}</div>}
          <div className="tag-card p-4 mb-6">
            <div className="text-sm font-medium mb-3">{t("Динамика выручки")}</div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer><BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C9C2B8" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8B8478" }} axisLine={{ stroke: "#C9C2B8" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8B8478" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}М` : v >= 1000 ? `${Math.round(v / 1000)}К` : v)} />
                <Tooltip formatter={(v) => [`${formatSum(v)} сум`, t("Выручка")]} contentStyle={{ background: "#F7F5F1", border: "1px solid #C9C2B8", borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="value" fill="#7A2E2E" radius={[2, 2, 0, 0]} />
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
          <div className="tag-card p-4">
            <div className="text-sm font-medium mb-1">{t("Быстрая корректировка остатков")}</div>
            <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>{t("«–» — продано офлайн: укажете размер и цвет, товар спишется со склада и попадёт в статистику. «+» — новое поступление.")}</div>
            {products.map((p) => (
              <div key={p.id} className="adm-row py-2.5 flex items-center justify-between gap-3">
                <div className="text-sm flex-1 min-w-0"><div className="truncate">{p.name}</div><div className="text-xs mono" style={{ color: "var(--muted)" }}>Остаток: {p.stock}</div></div>
                <div className="flex items-center gap-2"><button onClick={() => setOfflineSaleProduct(p)} disabled={p.stock <= 0} className="qty-btn btn-ghost disabled:opacity-30" title="Продано офлайн"><Minus size={13} /></button><span className="mono text-sm w-6 text-center">{p.stock}</span><button onClick={() => adjustStock(p.id, 1, false)} className="qty-btn btn-ghost" title="Поступление"><Plus size={13} /></button></div>
              </div>
            ))}
          </div>
        </>
      )}

      {offlineSaleProduct && (
        <OfflineSaleModal
          t={t}
          product={offlineSaleProduct}
          onClose={() => setOfflineSaleProduct(null)}
          onSubmit={(size, color) => { recordOfflineSale(offlineSaleProduct.id, size, color); setOfflineSaleProduct(null); }}
        />
      )}

      {adminTab === "offline" && (
        <>
          <div className="mb-5">
            <div className="display text-xl font-bold">{t("Офлайн продажи")}</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Выберите товар, который продали в магазине. Остаток автоматически уменьшится, а продажа попадёт в статистику как офлайн.
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-7">
            {products.map((p) => {
              const firstColor = (p.color || "").split(",").map((c) => c.trim()).filter(Boolean)[0];
              const colorImage = firstColor ? getColorImage(p.color_images, firstColor) : null;
              const image = colorImage || p.image_url;
              return (
                <div key={p.id} className="tag-card overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden" style={{ background: "var(--line)" }}>
                    {image ? (
                      <img src={image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} style={{ color: "var(--muted)" }} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="mono text-sm mt-1" style={{ color: "var(--accent)" }}>{formatSum(p.price)} сум</div>
                    <div className="text-xs mt-1 mb-3" style={{ color: "var(--muted)" }}>
                      {t("Остаток:")} {p.stock}
                    </div>
                    <button
                      onClick={() => setOfflineSaleProduct(p)}
                      disabled={p.stock <= 0}
                      className="btn-primary w-full py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <Minus size={14} /> {t("Продать")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tag-card p-4">
            <div className="text-sm font-medium mb-3">{t("Офлайн продажи")}</div>
            {orders.filter((o) => o.source === "offline").length === 0 ? (
              <div className="text-xs py-5 text-center" style={{ color: "var(--muted)" }}>{t("Нет продаж за период")}</div>
            ) : (
              <div className="space-y-2">
                {orders.filter((o) => o.source === "offline").slice(0, 30).map((o) => {
                  const item = o.items?.[0];
                  const product = item ? products.find((p) => p.id === Number(item.productId)) : null;
                  const image = product ? (getColorImage(product.color_images, item.color) || product.image_url) : null;
                  return (
                    <div key={o.id} className="adm-row flex items-center gap-3 py-2.5">
                      <div className="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: "var(--line)" }}>
                        {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <Package size={18} style={{ color: "var(--muted)", margin: "15px" }} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">{item?.name || "—"} × {item?.qty || 1}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>
                          {new Date(o.date).toLocaleString("ru-RU")} · {item?.size || "—"} · {item?.color || "—"}
                        </div>
                      </div>
                      <div className="mono text-sm shrink-0" style={{ color: "var(--accent)" }}>{formatSum(o.total)} сум</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {adminTab === "orders" && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap"><button onClick={() => setOrderFilter("all")} className={`nav-pill px-4 py-1.5 text-sm ${orderFilter === "all" ? "active" : ""}`}>{t("Все")}</button>{STATUS_ORDER.map((s) => <button key={s} onClick={() => setOrderFilter(s)} className={`nav-pill px-4 py-1.5 text-sm ${orderFilter === s ? "active" : ""}`}>{STATUS_META[s].label}</button>)}</div>
          <div className="space-y-3">
            {filteredOrders.length === 0 && <div className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>{t("Заказов не найдено")}</div>}
            {filteredOrders.slice(0, 60).map((o) => {
              const meta = STATUS_META[o.status]; return (
                <div key={o.id} className="tag-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2"><span className="mono text-xs" style={{ color: "var(--muted)" }}>№ {o.id}</span><span className="text-xs" style={{ color: "var(--muted)" }}>{new Date(o.date).toLocaleString("ru-RU")}</span><span className="badge" style={{ background: o.source === "online" ? "#4B5D4622" : "#8B847822", color: o.source === "online" ? "var(--accent-2)" : "var(--muted)" }}>{o.source === "online" ? t("Сайт") : t("Офлайн")}</span></div>
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
                    <div className="col-span-1 text-right">
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