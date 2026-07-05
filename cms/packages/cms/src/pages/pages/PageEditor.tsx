import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, ChevronRight, Save, CheckCircle, Globe,
  Plus, X, Trash2, GripVertical, MapPin, Phone, Mail, Clock, User, ImageIcon, Loader2,
} from 'lucide-react';
import { useMediaPicker } from '@/components/MediaLibrary/MediaPicker';
import { usePageContent, useSavePageContent } from '@/hooks/usePageContent';

type Lang = 'ru' | 'kz' | 'en' | 'zh';
type FieldType = 'text' | 'textarea' | 'image' | 'images' | 'documents';

interface Field {
  key: string;
  label: string;
  type: FieldType;
  bilingual?: boolean;
  placeholder?: string;
  rows?: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  custom?: boolean;
}

interface PageDef {
  slug: string;
  label: string;
  description: string;
  sections: Section[];
  custom?: boolean;
}

// ─── Default field template for new custom sections ───────────────────────────
function makeDefaultSection(title: string): Section {
  const id = `custom_${Date.now()}`;
  return {
    id,
    title,
    custom: true,
    fields: [
      { key: `${id}_heading`, label: 'Заголовок', type: 'text', bilingual: true },
      { key: `${id}_content`, label: 'Содержимое', type: 'textarea', bilingual: true, rows: 5 },
      { key: `${id}_image`, label: 'Изображение (путь)', type: 'image' },
    ],
  };
}

// ─── Predefined pages ─────────────────────────────────────────────────────────
const INITIAL_PAGES: PageDef[] = [
  {
    slug: 'home',
    label: 'Главная',
    description: 'Главная страница сайта (корень /)',
    sections: [
      {
        id: 'hero',
        title: 'Герой — первый экран',
        description: 'Видео-фон, вращающиеся слова, подзаголовок, статистика, бегущая строка',
        fields: [
          { key: 'hero_subtitle', label: 'Подзаголовок', type: 'text', bilingual: true, placeholder: 'с собственным парком локомотивов:' },
          { key: 'hero_word_1', label: 'Анимируемое слово 1', type: 'text', bilingual: true, placeholder: 'надежно' },
          { key: 'hero_word_2', label: 'Анимируемое слово 2', type: 'text', bilingual: true, placeholder: 'вовремя' },
          { key: 'hero_word_3', label: 'Анимируемое слово 3', type: 'text', bilingual: true, placeholder: 'эффективно' },
          { key: 'hero_cta_primary', label: 'Кнопка 1', type: 'text', bilingual: true, placeholder: 'Узнать больше' },
          { key: 'hero_cta_secondary', label: 'Кнопка 2', type: 'text', bilingual: true, placeholder: 'Наши услуги' },
          { key: 'hero_ticker', label: 'Бегущая строка', type: 'textarea', bilingual: true, rows: 2, placeholder: 'Лидирующие позиции по количеству локомотивов на сети Казахстана' },
          { key: 'hero_stat1_value', label: 'Стат. 1 — значение', type: 'text', placeholder: '40+' },
          { key: 'hero_stat1_label', label: 'Стат. 1 — подпись', type: 'text', bilingual: true, placeholder: 'Локомотивов' },
          { key: 'hero_stat2_value', label: 'Стат. 2 — значение', type: 'text', placeholder: '550+' },
          { key: 'hero_stat2_label', label: 'Стат. 2 — подпись', type: 'text', bilingual: true, placeholder: 'Сотрудников' },
          { key: 'hero_stat3_value', label: 'Стат. 3 — значение', type: 'text', placeholder: '370' },
          { key: 'hero_stat3_label', label: 'Стат. 3 — подпись', type: 'text', bilingual: true, placeholder: 'Бригад' },
          { key: 'hero_stat4_value', label: 'Стат. 4 — значение', type: 'text', placeholder: '8+' },
          { key: 'hero_stat4_label', label: 'Стат. 4 — подпись', type: 'text', bilingual: true, placeholder: 'Лет опыта' },
          { key: 'hero_video', label: 'Видео-фон (путь)', type: 'image', placeholder: '/images/hero-bg.mp4' },
        ],
      },
      {
        id: 'about_home',
        title: 'Блок «О компании»',
        description: 'Три абзаца, статистика, изображение локомотива',
        fields: [
          { key: 'about_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'О КОМПАНИИ' },
          { key: 'about_para1', label: 'Абзац 1', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'about_para2', label: 'Абзац 2', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'about_para3', label: 'Абзац 3', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'about_stat1_value', label: 'Карточка 1 — значение', type: 'text', placeholder: '550+' },
          { key: 'about_stat1_label', label: 'Карточка 1 — подпись', type: 'text', bilingual: true, placeholder: 'Персонал' },
          { key: 'about_stat2_value', label: 'Карточка 2 — значение', type: 'text', placeholder: '370' },
          { key: 'about_stat2_label', label: 'Карточка 2 — подпись', type: 'text', bilingual: true, placeholder: 'Бригад' },
          { key: 'about_stat3_value', label: 'Карточка 3 — значение', type: 'text', placeholder: '40+' },
          { key: 'about_stat3_label', label: 'Карточка 3 — подпись', type: 'text', bilingual: true, placeholder: 'Локомотивов' },
          { key: 'about_year', label: 'Год основания (бейдж)', type: 'text', placeholder: '2016' },
          { key: 'about_image', label: 'Изображение', type: 'image', placeholder: '/images/about-locomotive.png' },
        ],
      },
      {
        id: 'services_home',
        title: 'Блок «Наши услуги»',
        description: '3 услуги с раскрытием при наведении',
        fields: [
          { key: 'svc_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'НАШИ УСЛУГИ' },
          { key: 'svc_subtitle', label: 'Подзаголовок', type: 'text', bilingual: true, placeholder: 'Полный спектр железнодорожных перевозок' },
          { key: 'svc1_title', label: 'Услуга 1 — название', type: 'text', bilingual: true, placeholder: 'Перевозка грузов ж/д транспортом' },
          { key: 'svc1_desc', label: 'Услуга 1 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'svc1_image', label: 'Услуга 1 — фото', type: 'image', placeholder: '/images/hero-train.jpg' },
          { key: 'svc2_title', label: 'Услуга 2 — название', type: 'text', bilingual: true, placeholder: 'Экспедирование грузов' },
          { key: 'svc2_desc', label: 'Услуга 2 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'svc2_image', label: 'Услуга 2 — фото', type: 'image', placeholder: '/images/rail-yard.jpg' },
          { key: 'svc3_title', label: 'Услуга 3 — название', type: 'text', bilingual: true, placeholder: 'Мультимодальные перевозки' },
          { key: 'svc3_desc', label: 'Услуга 3 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'svc3_image', label: 'Услуга 3 — фото', type: 'image', placeholder: '/images/container-terminal.jpg' },
        ],
      },
      {
        id: 'advantages_home',
        title: 'Блок «Наши преимущества»',
        description: '8 карточек — технологические преимущества',
        fields: [
          { key: 'adv_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'НАШИ ПРЕИМУЩЕСТВА' },
          { key: 'adv_subtitle', label: 'Подзаголовок', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'adv1_title', label: 'Преим. 1 — заголовок', type: 'text', bilingual: true, placeholder: 'Собственная разработка АСУП' },
          { key: 'adv1_desc', label: 'Преим. 1 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv2_title', label: 'Преим. 2 — заголовок', type: 'text', bilingual: true, placeholder: 'Экологические технологии' },
          { key: 'adv2_desc', label: 'Преим. 2 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv3_title', label: 'Преим. 3 — заголовок', type: 'text', bilingual: true, placeholder: 'Автоматизация ТОиР' },
          { key: 'adv3_desc', label: 'Преим. 3 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv4_title', label: 'Преим. 4 — заголовок', type: 'text', bilingual: true, placeholder: 'Цифровая безопасность' },
          { key: 'adv4_desc', label: 'Преим. 4 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv5_title', label: 'Преим. 5 — заголовок', type: 'text', bilingual: true, placeholder: 'Оперативная аналитика' },
          { key: 'adv5_desc', label: 'Преим. 5 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv6_title', label: 'Преим. 6 — заголовок', type: 'text', bilingual: true, placeholder: 'Международные перевозки' },
          { key: 'adv6_desc', label: 'Преим. 6 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv7_title', label: 'Преим. 7 — заголовок', type: 'text', bilingual: true, placeholder: 'Круглосуточный контроль' },
          { key: 'adv7_desc', label: 'Преим. 7 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'adv8_title', label: 'Преим. 8 — заголовок', type: 'text', bilingual: true, placeholder: 'Высокие стандарты' },
          { key: 'adv8_desc', label: 'Преим. 8 — описание', type: 'textarea', bilingual: true, rows: 3 },
        ],
      },
      {
        id: 'videosection',
        title: 'Видео-секция «Движущая сила»',
        description: 'Параллакс-видео с заголовком по центру',
        fields: [
          { key: 'vid_eyebrow', label: 'Надпись над заголовком', type: 'text', bilingual: true, placeholder: 'О компании' },
          { key: 'vid_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'ДВИЖУЩАЯ СИЛА КАЗАХСТАНА' },
          { key: 'vid_desc', label: 'Описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'vid_founded', label: 'Строка об основании', type: 'text', bilingual: true, placeholder: 'Основан в 2017 году' },
          { key: 'vid_file', label: 'Видео (путь)', type: 'image', placeholder: '/images/about-us.mp4' },
        ],
      },
      {
        id: 'geography_home',
        title: 'Блок «География перевозок»',
        description: 'Вводный текст + карта',
        fields: [
          { key: 'geo_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'ГЕОГРАФИЯ ПЕРЕВОЗОК' },
          { key: 'geo_intro', label: 'Вводный абзац', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'geo_map', label: 'Карта (путь к SVG)', type: 'image', placeholder: '/images/geography-map.svg' },
        ],
      },
      {
        id: 'partners_home',
        title: 'Блок «Ассоциации и партнёры»',
        description: 'Бегущая строка с логотипами (логотипы — в разделе Партнёры)',
        fields: [
          { key: 'partners_eyebrow', label: 'Надпись над заголовком', type: 'text', bilingual: true, placeholder: 'Членство и партнёрство' },
          { key: 'partners_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'УЧАСТИЕ В АССОЦИАЦИЯХ' },
          { key: 'partners_text1', label: 'Абзац 1', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'partners_text2', label: 'Абзац 2', type: 'textarea', bilingual: true, rows: 3 },
        ],
      },
      {
        id: 'footer',
        title: 'Футер',
        fields: [
          { key: 'footer_desc', label: 'Описание компании', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'footer_phone', label: 'Телефон', type: 'text', placeholder: '+7 (7172) 39 99 88' },
          { key: 'footer_email', label: 'Email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'footer_address', label: 'Адрес', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'footer_copyright', label: 'Копирайт', type: 'text', placeholder: '© 2024 ТОО «Dar Rail».' },
        ],
      },
    ],
  },
  {
    slug: 'about',
    label: 'О компании',
    description: 'Страница /about со всеми подразделами из бокового меню',
    sections: [
      {
        id: 'about_hero',
        title: 'Герой страницы',
        fields: [
          { key: 'hero_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'О компании' },
          { key: 'hero_subtitle', label: 'Подзаголовок', type: 'textarea', bilingual: true, rows: 2, placeholder: 'ТОО «DAR RAIL» является лицензированным железнодорожным Перевозчиком...' },
          { key: 'hero_image', label: 'Фоновое изображение', type: 'image', placeholder: '/images/about-bg.jpg' },
        ],
      },
      {
        id: 'about_main',
        title: 'О компании — вступление и статистика',
        description: 'Подраздел «О компании»: вводный блок + 8 ключевых показателей + 5 текстовых блоков',
        fields: [
          { key: 'intro_eyebrow', label: 'Надпись-метка «Кто мы»', type: 'text', bilingual: true, placeholder: 'Кто мы' },
          { key: 'intro_text', label: 'Вступительный текст', type: 'textarea', bilingual: true, rows: 5, placeholder: 'ТОО «DAR Rail» — лицензированный железнодорожный перевозчик с собственным парком...' },
          { key: 'stat1_value', label: 'Показатель 1 — значение', type: 'text', placeholder: '26,9 млн т' },
          { key: 'stat1_label', label: 'Показатель 1 — подпись', type: 'text', bilingual: true, placeholder: 'Среднегодовой грузооборот, 2021–2025' },
          { key: 'stat2_value', label: 'Показатель 2 — значение', type: 'text', placeholder: '7,4 млн т' },
          { key: 'stat2_label', label: 'Показатель 2 — подпись', type: 'text', bilingual: true, placeholder: 'Среднегодовой объём экспедирования' },
          { key: 'stat3_value', label: 'Показатель 3 — значение', type: 'text', placeholder: '44' },
          { key: 'stat3_label', label: 'Показатель 3 — подпись', type: 'text', bilingual: true, placeholder: 'Магистральных локомотива' },
          { key: 'stat4_value', label: 'Показатель 4 — значение', type: 'text', placeholder: '1 600' },
          { key: 'stat4_label', label: 'Показатель 4 — подпись', type: 'text', bilingual: true, placeholder: 'Грузовых вагонов ежесуточно' },
          { key: 'stat5_value', label: 'Показатель 5 — значение', type: 'text', placeholder: '20%' },
          { key: 'stat5_label', label: 'Показатель 5 — подпись', type: 'text', bilingual: true, placeholder: 'Доля контейнерного экспедирования' },
          { key: 'stat6_value', label: 'Показатель 6 — значение', type: 'text', placeholder: '600+' },
          { key: 'stat6_label', label: 'Показатель 6 — подпись', type: 'text', bilingual: true, placeholder: 'Сотрудников' },
          { key: 'stat7_value', label: 'Показатель 7 — значение', type: 'text', placeholder: '2 800 км' },
          { key: 'stat7_label', label: 'Показатель 7 — подпись', type: 'text', bilingual: true, placeholder: 'Эксплуатационная длина маршрутов' },
          { key: 'stat8_value', label: 'Показатель 8 — значение', type: 'text', placeholder: '17%' },
          { key: 'stat8_label', label: 'Показатель 8 — подпись', type: 'text', bilingual: true, placeholder: 'Доля от всей сети Казахстана' },
          { key: 'block1_label', label: 'Блок «С чего начинали» — метка', type: 'text', bilingual: true, placeholder: 'С чего начинали' },
          { key: 'block1_text', label: 'Блок «С чего начинали» — текст', type: 'textarea', bilingual: true, rows: 5, placeholder: 'В 2017 году получена государственная лицензия...' },
          { key: 'block2_label', label: 'Блок «Что перевозим» — метка', type: 'text', bilingual: true, placeholder: 'Что мы перевозим и для кого' },
          { key: 'block2_text1', label: 'Блок «Что перевозим» — абзац 1', type: 'textarea', bilingual: true, rows: 4, placeholder: 'Мы обеспечиваем железнодорожные грузовые перевозки...' },
          { key: 'block2_text2', label: 'Блок «Что перевозим» — абзац 2', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'block3_label', label: 'Блок «География» — метка', type: 'text', bilingual: true, placeholder: 'География и инфраструктура' },
          { key: 'block3_text1', label: 'Блок «География» — абзац 1', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'block3_text2', label: 'Блок «География» — абзац 2', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'block4_label', label: 'Блок «Цифровизация» — метка', type: 'text', bilingual: true, placeholder: 'Цифровизация' },
          { key: 'block4_text', label: 'Блок «Цифровизация» — текст', type: 'textarea', bilingual: true, rows: 5 },
          { key: 'block5_label', label: 'Блок «Команда» — метка', type: 'text', bilingual: true, placeholder: 'Команда' },
          { key: 'block5_text', label: 'Блок «Команда» — текст', type: 'textarea', bilingual: true, rows: 4 },
        ],
      },
      {
        id: 'about_history',
        title: 'История компании',
        description: 'Подраздел «История компании» — хронология и ключевые этапы',
        fields: [
          { key: 'hist_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'История компании' },
          { key: 'hist_intro', label: 'Вступительный абзац', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'hist_year1', label: 'Год 1', type: 'text', placeholder: '2016' },
          { key: 'hist_event1', label: 'Событие 1', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Основание компании ТОО «DAR Rail»' },
          { key: 'hist_year2', label: 'Год 2', type: 'text', placeholder: '2017' },
          { key: 'hist_event2', label: 'Событие 2', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Получение государственной лицензии на перевозку грузов' },
          { key: 'hist_year3', label: 'Год 3', type: 'text', placeholder: '2018' },
          { key: 'hist_event3', label: 'Событие 3', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Подписание договора с АО «НК «ҚТЖ»' },
          { key: 'hist_year4', label: 'Год 4', type: 'text', placeholder: '2021' },
          { key: 'hist_event4', label: 'Событие 4', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Запуск собственной АСУП DAR Rail' },
          { key: 'hist_year5', label: 'Год 5', type: 'text', placeholder: '2024' },
          { key: 'hist_event5', label: 'Событие 5', type: 'textarea', bilingual: true, rows: 3 },
        ],
      },
      {
        id: 'about_mission',
        title: 'Миссия и цели',
        description: 'Подраздел «Миссия и цели» — миссия, видение, ценности',
        fields: [
          { key: 'mission_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Миссия и цели' },
          { key: 'mission_eyebrow', label: 'Метка «Наша миссия»', type: 'text', bilingual: true, placeholder: 'Наша миссия' },
          { key: 'mission_text', label: 'Текст миссии', type: 'textarea', bilingual: true, rows: 5, placeholder: 'Обеспечивать надёжные, безопасные и эффективные железнодорожные перевозки...' },
          { key: 'vision_eyebrow', label: 'Метка «Наше видение»', type: 'text', bilingual: true, placeholder: 'Наше видение' },
          { key: 'vision_text', label: 'Текст видения', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'values_heading', label: 'Заголовок «Наши ценности»', type: 'text', bilingual: true, placeholder: 'Наши ценности' },
          { key: 'value1_title', label: 'Ценность 1 — название', type: 'text', bilingual: true, placeholder: 'Безопасность' },
          { key: 'value1_desc', label: 'Ценность 1 — описание', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'value2_title', label: 'Ценность 2 — название', type: 'text', bilingual: true, placeholder: 'Надёжность' },
          { key: 'value2_desc', label: 'Ценность 2 — описание', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'value3_title', label: 'Ценность 3 — название', type: 'text', bilingual: true, placeholder: 'Инновации' },
          { key: 'value3_desc', label: 'Ценность 3 — описание', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'value4_title', label: 'Ценность 4 — название', type: 'text', bilingual: true, placeholder: 'Клиентоориентированность' },
          { key: 'value4_desc', label: 'Ценность 4 — описание', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'goals_heading', label: 'Заголовок «Стратегические цели»', type: 'text', bilingual: true, placeholder: 'Стратегические цели' },
          { key: 'goals_text', label: 'Текст о целях', type: 'textarea', bilingual: true, rows: 5 },
        ],
      },
      {
        id: 'about_management',
        title: 'Руководство',
        description: 'Подраздел «Руководство» — топ-менеджмент компании',
        fields: [
          { key: 'mgmt_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Руководство' },
          { key: 'mgmt_intro', label: 'Вступительный текст', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'person1_name', label: 'Руководитель 1 — ФИО', type: 'text', bilingual: true, placeholder: 'Иванов Иван Иванович' },
          { key: 'person1_role', label: 'Руководитель 1 — должность', type: 'text', bilingual: true, placeholder: 'Генеральный директор' },
          { key: 'person1_bio', label: 'Руководитель 1 — биография', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'person1_photo', label: 'Руководитель 1 — фото', type: 'image' },
          { key: 'person2_name', label: 'Руководитель 2 — ФИО', type: 'text', bilingual: true },
          { key: 'person2_role', label: 'Руководитель 2 — должность', type: 'text', bilingual: true },
          { key: 'person2_bio', label: 'Руководитель 2 — биография', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'person2_photo', label: 'Руководитель 2 — фото', type: 'image' },
          { key: 'person3_name', label: 'Руководитель 3 — ФИО', type: 'text', bilingual: true },
          { key: 'person3_role', label: 'Руководитель 3 — должность', type: 'text', bilingual: true },
          { key: 'person3_bio', label: 'Руководитель 3 — биография', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'person3_photo', label: 'Руководитель 3 — фото', type: 'image' },
        ],
      },
      {
        id: 'about_quality',
        title: 'Управление качеством',
        description: 'Подраздел «Управление качеством» — ISO, системы менеджмента',
        fields: [
          { key: 'qual_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Управление качеством' },
          { key: 'qual_intro', label: 'Вступительный текст', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'qual_cert1_name', label: 'Сертификат 1 — название', type: 'text', bilingual: true, placeholder: 'ISO 9001:2015 — Система менеджмента качества' },
          { key: 'qual_cert1_desc', label: 'Сертификат 1 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'qual_cert2_name', label: 'Сертификат 2 — название', type: 'text', bilingual: true, placeholder: 'ISO 14001:2015 — Система экологического менеджмента' },
          { key: 'qual_cert2_desc', label: 'Сертификат 2 — описание', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'qual_cert3_name', label: 'Сертификат 3 — название', type: 'text', bilingual: true, placeholder: 'ISO 45001:2018 — Охрана труда и профессиональная безопасность' },
          { key: 'qual_cert4_name', label: 'Сертификат 4 — название', type: 'text', bilingual: true, placeholder: 'ISO 50001:2018 — Система энергетического менеджмента' },
          { key: 'qual_policy_heading', label: 'Политика качества — заголовок', type: 'text', bilingual: true, placeholder: 'Политика в области качества и безопасности' },
          { key: 'qual_policy_text', label: 'Политика качества — текст', type: 'textarea', bilingual: true, rows: 5 },
          { key: 'qual_documents', label: 'Документы для скачивания (PDF, Word)', type: 'documents' } as Field,
        ],
      },
      {
        id: 'about_safety',
        title: 'Безопасность',
        description: 'Подраздел «Безопасность» — охрана труда и промышленная безопасность',
        fields: [
          { key: 'safety_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Безопасность' },
          { key: 'safety_intro', label: 'Вступительный текст', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'safety_block1_title', label: 'Блок 1 — заголовок', type: 'text', bilingual: true, placeholder: 'Охрана труда' },
          { key: 'safety_block1_text', label: 'Блок 1 — текст', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'safety_block2_title', label: 'Блок 2 — заголовок', type: 'text', bilingual: true, placeholder: 'Промышленная безопасность' },
          { key: 'safety_block2_text', label: 'Блок 2 — текст', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'safety_block3_title', label: 'Блок 3 — заголовок', type: 'text', bilingual: true, placeholder: 'Цифровая безопасность' },
          { key: 'safety_block3_text', label: 'Блок 3 — текст', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'safety_stat1_value', label: 'Показатель 1 — значение', type: 'text', placeholder: '0' },
          { key: 'safety_stat1_label', label: 'Показатель 1 — подпись', type: 'text', bilingual: true, placeholder: 'Смертельных случаев' },
          { key: 'safety_stat2_value', label: 'Показатель 2 — значение', type: 'text', placeholder: '24/7' },
          { key: 'safety_stat2_label', label: 'Показатель 2 — подпись', type: 'text', bilingual: true, placeholder: 'Мониторинг состояния локомотивов' },
        ],
      },
      {
        id: 'about_cup',
        title: 'ЦУП',
        description: 'Подраздел «ЦУП» — Центр управления перевозками',
        fields: [
          { key: 'cup_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Центр управления перевозками (ЦУП)' },
          { key: 'cup_intro', label: 'Вступительный текст', type: 'textarea', bilingual: true, rows: 4, placeholder: 'Центр управления перевозками работает 24/7...' },
          { key: 'cup_func_heading', label: 'Заголовок «Функции ЦУП»', type: 'text', bilingual: true, placeholder: 'Функции и задачи' },
          { key: 'cup_func1', label: 'Функция 1', type: 'text', bilingual: true, placeholder: 'Оперативное планирование движения поездов' },
          { key: 'cup_func2', label: 'Функция 2', type: 'text', bilingual: true, placeholder: 'GPS/ГЛОНАСС мониторинг всего парка локомотивов' },
          { key: 'cup_func3', label: 'Функция 3', type: 'text', bilingual: true, placeholder: 'Управление локомотивными бригадами' },
          { key: 'cup_func4', label: 'Функция 4', type: 'text', bilingual: true, placeholder: 'Координация с диспетчерами КТЖ' },
          { key: 'cup_func5', label: 'Функция 5', type: 'text', bilingual: true, placeholder: 'BI-аналитика и отчётность в реальном времени' },
          { key: 'cup_tech_heading', label: 'Заголовок «Технологии»', type: 'text', bilingual: true, placeholder: 'Технологии и системы' },
          { key: 'cup_tech_text', label: 'Описание технологий', type: 'textarea', bilingual: true, rows: 4, placeholder: 'АСУП DAR Rail интегрирована с АСКУЭ и внешними системами КТЖ...' },
          { key: 'cup_image', label: 'Изображение ЦУП', type: 'image' },
        ],
      },
      {
        id: 'about_tradeunion',
        title: 'Профсоюз',
        description: 'Подраздел «Профсоюз» — деятельность профсоюзной организации',
        fields: [
          { key: 'tu_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Профсоюз DAR Rail' },
          { key: 'tu_intro', label: 'Вводный текст', type: 'textarea', bilingual: true, rows: 4, placeholder: 'Общественное объединение «Локальный профессиональный союз «DAR RAIL»»...' },
          { key: 'tu_chairman_name', label: 'Председатель профсоюза — ФИО', type: 'text', bilingual: true, placeholder: 'Дюсенов Серик Тастыбаевич' },
          { key: 'tu_chairman_phone', label: 'Председатель — телефон', type: 'text', placeholder: '+7 7172 399988 (доб. 592)' },
          { key: 'tu_chairman_email', label: 'Председатель — email', type: 'text', placeholder: 's.dyussenov@darrail.com' },
          { key: 'tu_documents', label: 'Документы профсоюза (PDF, Word)', type: 'documents' } as Field,
          { key: 'tu_image', label: 'Изображение / фото', type: 'image' },
        ],
      },
      {
        id: 'about_routes',
        title: 'Схема перевозок',
        description: 'Подраздел «Схема перевозок» — карта и описание маршрутов',
        fields: [
          { key: 'routes_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Схема организации грузоперевозок' },
          { key: 'routes_intro', label: 'Вводный текст', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Основные цели DAR Rail — бесперебойное и качественное обеспечение потребностей экономики в перевозках...' },
          { key: 'routes_map', label: '📍 Карта/схема маршрутов — загрузить изображение', type: 'image', placeholder: '/maps/map.svg' },
          { key: 'routes_legend', label: 'Нормативная база / описание маршрутов', type: 'textarea', bilingual: true, rows: 5 },
        ],
      },
      {
        id: 'about_personnel',
        title: 'Персонал',
        description: 'Подраздел «Персонал» — состав, цифры, развитие сотрудников',
        fields: [
          { key: 'pers_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Персонал' },
          { key: 'pers_intro', label: 'Вступительный текст', type: 'textarea', bilingual: true, rows: 4, placeholder: 'Штатная численность — более 600 человек. 95% из них — производственный персонал...' },
          { key: 'pers_stat1_value', label: 'Показатель 1 — значение', type: 'text', placeholder: '600+' },
          { key: 'pers_stat1_label', label: 'Показатель 1 — подпись', type: 'text', bilingual: true, placeholder: 'Сотрудников' },
          { key: 'pers_stat2_value', label: 'Показатель 2 — значение', type: 'text', placeholder: '95%' },
          { key: 'pers_stat2_label', label: 'Показатель 2 — подпись', type: 'text', bilingual: true, placeholder: 'Производственный персонал' },
          { key: 'pers_stat3_value', label: 'Показатель 3 — значение', type: 'text', placeholder: '370' },
          { key: 'pers_stat3_label', label: 'Показатель 3 — подпись', type: 'text', bilingual: true, placeholder: 'Локомотивных бригад' },
          { key: 'pers_dev_heading', label: 'Заголовок «Развитие персонала»', type: 'text', bilingual: true, placeholder: 'Развитие персонала' },
          { key: 'pers_dev_text', label: 'Текст о развитии', type: 'textarea', bilingual: true, rows: 4 },
          { key: 'pers_image', label: 'Изображение', type: 'image' },
        ],
      },
      {
        id: 'about_privacy',
        title: 'Политика конфиденциальности',
        description: 'Подраздел «Политика конфиденциальности»',
        fields: [
          { key: 'priv_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Политика конфиденциальности' },
          { key: 'priv_updated', label: 'Дата последнего обновления', type: 'text', placeholder: '01 января 2024 года' },
          { key: 'priv_section1_title', label: 'Раздел 1 — заголовок', type: 'text', bilingual: true, placeholder: 'Общие положения' },
          { key: 'priv_section1_text', label: 'Раздел 1 — текст', type: 'textarea', bilingual: true, rows: 6 },
          { key: 'priv_section2_title', label: 'Раздел 2 — заголовок', type: 'text', bilingual: true, placeholder: 'Собираемые данные' },
          { key: 'priv_section2_text', label: 'Раздел 2 — текст', type: 'textarea', bilingual: true, rows: 6 },
          { key: 'priv_section3_title', label: 'Раздел 3 — заголовок', type: 'text', bilingual: true, placeholder: 'Цели обработки данных' },
          { key: 'priv_section3_text', label: 'Раздел 3 — текст', type: 'textarea', bilingual: true, rows: 6 },
          { key: 'priv_section4_title', label: 'Раздел 4 — заголовок', type: 'text', bilingual: true, placeholder: 'Права субъектов персональных данных' },
          { key: 'priv_section4_text', label: 'Раздел 4 — текст', type: 'textarea', bilingual: true, rows: 6 },
          { key: 'priv_contact', label: 'Контакт для обращений', type: 'text', placeholder: 'info@darrail.com' },
        ],
      },
      {
        id: 'about_surveys',
        title: 'Анкеты удовлетворённости',
        description: 'Подраздел «Анкеты удовлетворённости» — ссылки на анкеты',
        fields: [
          { key: 'survey_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Анкеты удовлетворённости' },
          { key: 'survey_intro', label: 'Вводный текст', type: 'textarea', bilingual: true, rows: 3 },
          { key: 'survey1_title', label: 'Анкета 1 — название', type: 'text', bilingual: true, placeholder: 'Анкета удовлетворённости клиентов' },
          { key: 'survey1_url', label: 'Анкета 1 — ссылка', type: 'text', placeholder: '/survey/client' },
          { key: 'survey2_title', label: 'Анкета 2 — название', type: 'text', bilingual: true, placeholder: 'Анкета удовлетворённости сотрудников' },
          { key: 'survey2_url', label: 'Анкета 2 — ссылка', type: 'text', placeholder: '/survey/employee' },
          { key: 'survey3_title', label: 'Анкета 3 — название', type: 'text', bilingual: true },
          { key: 'survey3_url', label: 'Анкета 3 — ссылка', type: 'text' },
        ],
      },
    ],
  },
  {
    slug: 'services',
    label: 'Услуги',
    description: 'Страница /services — 5 видов услуг',
    sections: [
      {
        id: 'svc_hero',
        title: 'Герой страницы',
        fields: [
          { key: 'hero_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'Услуги' },
          { key: 'hero_subtitle', label: 'Подзаголовок', type: 'text', bilingual: true, placeholder: 'Клиентоориентированность — одна из основных ценностей' },
          { key: 'hero_image', label: 'Фоновое изображение', type: 'image' },
        ],
      },
      {
        id: 'svc_intro',
        title: 'Вводный текст',
        fields: [
          { key: 'intro_text1', label: 'Абзац 1', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Ведь именно благодаря надежным партнерским отношениям...' },
          { key: 'intro_text2', label: 'Абзац 2', type: 'textarea', bilingual: true, rows: 3 },
        ],
      },
      {
        id: 'svc_list',
        title: '5 видов услуг',
        description: 'Название, описание, детали и изображение для каждой услуги',
        fields: [
          { key: 'svc1_title', label: 'Услуга 1 — название', type: 'text', bilingual: true, placeholder: 'Перевозка грузов железнодорожным транспортом' },
          { key: 'svc1_desc', label: 'Услуга 1 — краткое описание', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Перевозка грузов с использованием собственного парка локомотивов...' },
          { key: 'svc1_details', label: 'Услуга 1 — детали', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'svc1_image', label: 'Услуга 1 — изображение', type: 'image', placeholder: '/images/services/freight.jpg' },
          { key: 'svc2_title', label: 'Услуга 2 — название', type: 'text', bilingual: true, placeholder: 'Экспедирование грузов, перевозимых ж/д транспортом' },
          { key: 'svc2_desc', label: 'Услуга 2 — краткое описание', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Гибкие и выгодные условия экспедирования в необходимом объёме...' },
          { key: 'svc2_details', label: 'Услуга 2 — детали', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'svc2_image', label: 'Услуга 2 — изображение', type: 'image', placeholder: '/images/services/forwarding.jpg' },
          { key: 'svc3_title', label: 'Услуга 3 — название', type: 'text', bilingual: true, placeholder: 'Организация мультимодальных и контейнерных перевозок' },
          { key: 'svc3_desc', label: 'Услуга 3 — краткое описание', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Доставка контейнеров до портов Китая по гибкой тарифной политике...' },
          { key: 'svc3_details', label: 'Услуга 3 — детали', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'svc3_image', label: 'Услуга 3 — изображение', type: 'image', placeholder: '/images/services/multimodal.jpg' },
          { key: 'svc4_title', label: 'Услуга 4 — название', type: 'text', bilingual: true, placeholder: 'Предоставление железнодорожного подвижного состава' },
          { key: 'svc4_desc', label: 'Услуга 4 — краткое описание', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Обеспечение перевозок необходимым количеством подвижного состава...' },
          { key: 'svc4_details', label: 'Услуга 4 — детали', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'svc4_image', label: 'Услуга 4 — изображение', type: 'image', placeholder: '/images/services/rolling-stock.jpg' },
          { key: 'svc5_title', label: 'Услуга 5 — название', type: 'text', bilingual: true, placeholder: 'Предоставление услуг локомотивной тяги' },
          { key: 'svc5_desc', label: 'Услуга 5 — краткое описание', type: 'textarea', bilingual: true, rows: 3, placeholder: 'Услуги тяги собственным парком локомотивов...' },
          { key: 'svc5_details', label: 'Услуга 5 — детали', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'svc5_image', label: 'Услуга 5 — изображение', type: 'image', placeholder: '/images/services/traction.jpg' },
        ],
      },
    ],
  },
  {
    slug: 'esg',
    label: 'Устойчивое развитие',
    description: 'Страница /esg — ESG, отчёты, нормативные документы',
    sections: [
      {
        id: 'esg_hero',
        title: 'Герой страницы',
        fields: [
          { key: 'hero_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'УСТОЙЧИВОЕ РАЗВИТИЕ, ESG' },
          { key: 'hero_subtitle', label: 'Подзаголовок', type: 'textarea', bilingual: true, rows: 2 },
          { key: 'hero_image', label: 'Фоновое изображение', type: 'image' },
        ],
      },
      {
        id: 'esg_content',
        title: 'Основной контент',
        fields: [
          { key: 'intro_text', label: 'Главный абзац', type: 'textarea', bilingual: true, rows: 4, placeholder: 'Мы стремимся быть частью позитивных глобальных изменений...' },
          { key: 'normative_heading', label: 'Заголовок раздела документов', type: 'text', bilingual: true, placeholder: 'Внутренние нормативные документы' },
          { key: 'normative_intro', label: 'Описание раздела документов', type: 'textarea', bilingual: true, rows: 3 },
        ],
      },
    ],
  },
  {
    slug: 'contacts',
    label: 'Контакты',
    description: 'Страница /contacts — офисы, форма обратной связи',
    sections: [
      {
        id: 'contacts_hero',
        title: 'Герой страницы',
        fields: [
          { key: 'hero_heading', label: 'Заголовок', type: 'text', bilingual: true, placeholder: 'КОНТАКТЫ' },
          { key: 'hero_subtitle', label: 'Подзаголовок', type: 'textarea', bilingual: true, rows: 2 },
        ],
      },
      {
        id: 'contacts_main',
        title: 'Главная контактная полоса',
        description: 'Красная полоса с телефоном, email и адресом',
        fields: [
          { key: 'main_phone', label: 'Телефон', type: 'text', placeholder: '+7 (7172) 39 99 88' },
          { key: 'main_email', label: 'Email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'main_address', label: 'Адрес', type: 'text', bilingual: true, placeholder: 'г. Астана, пр-т Р. Кошкарбаева, 1/5' },
        ],
      },
      {
        id: 'contacts_inquiries',
        title: 'Типы обращений',
        description: '5 направлений для email-запросов',
        fields: [
          { key: 'inq1_label', label: 'Запрос 1 — название', type: 'text', bilingual: true, placeholder: 'Запрос на перевозку' },
          { key: 'inq1_email', label: 'Запрос 1 — email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'inq2_label', label: 'Запрос 2 — название', type: 'text', bilingual: true, placeholder: 'Коммерческие вопросы' },
          { key: 'inq2_email', label: 'Запрос 2 — email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'inq3_label', label: 'Запрос 3 — название', type: 'text', bilingual: true, placeholder: 'Закупки и тендеры' },
          { key: 'inq3_email', label: 'Запрос 3 — email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'inq4_label', label: 'Запрос 4 — название', type: 'text', bilingual: true, placeholder: 'HR и карьера' },
          { key: 'inq4_email', label: 'Запрос 4 — email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'inq5_label', label: 'Запрос 5 — название', type: 'text', bilingual: true, placeholder: 'Пресс-служба' },
          { key: 'inq5_email', label: 'Запрос 5 — email', type: 'text', placeholder: 'info@darrail.com' },
        ],
      },
      {
        id: 'contacts_offices',
        title: 'Карточки офисов',
        description: 'Офисы и представительства компании (до 4 карточек)',
        fields: [
          { key: 'offices_heading', label: 'Заголовок раздела', type: 'text', bilingual: true, placeholder: 'Наши офисы' },
          { key: 'office1_name', label: 'Офис 1 — название', type: 'text', bilingual: true, placeholder: 'Главный офис' },
          { key: 'office1_city', label: 'Офис 1 — город', type: 'text', bilingual: true, placeholder: 'Астана' },
          { key: 'office1_address', label: 'Офис 1 — адрес', type: 'textarea', bilingual: true, rows: 2, placeholder: 'пр-т Р. Кошкарбаева, 1/5' },
          { key: 'office1_phone', label: 'Офис 1 — телефон', type: 'text', placeholder: '+7 (7172) 39 99 88' },
          { key: 'office1_email', label: 'Офис 1 — email', type: 'text', placeholder: 'info@darrail.com' },
          { key: 'office1_hours', label: 'Офис 1 — режим работы', type: 'text', bilingual: true, placeholder: 'Пн–Пт: 09:00–18:00' },
          { key: 'office1_map', label: 'Офис 1 — ссылка на карту', type: 'text', placeholder: 'https://maps.google.com/...' },
          { key: 'office1_photo', label: 'Офис 1 — фото руководителя', type: 'image' },
          { key: 'office1_manager', label: 'Офис 1 — руководитель (ФИО)', type: 'text', bilingual: true, placeholder: 'Иванов Иван Иванович' },
          { key: 'office1_position', label: 'Офис 1 — должность', type: 'text', bilingual: true, placeholder: 'Директор' },
          { key: 'office2_name', label: 'Офис 2 — название', type: 'text', bilingual: true, placeholder: 'Алматинский офис' },
          { key: 'office2_city', label: 'Офис 2 — город', type: 'text', bilingual: true, placeholder: 'Алматы' },
          { key: 'office2_address', label: 'Офис 2 — адрес', type: 'textarea', bilingual: true, rows: 2, placeholder: '' },
          { key: 'office2_phone', label: 'Офис 2 — телефон', type: 'text', placeholder: '+7 (727) ...' },
          { key: 'office2_email', label: 'Офис 2 — email', type: 'text', placeholder: 'almaty@darrail.com' },
          { key: 'office2_hours', label: 'Офис 2 — режим работы', type: 'text', bilingual: true, placeholder: 'Пн–Пт: 09:00–18:00' },
          { key: 'office2_map', label: 'Офис 2 — ссылка на карту', type: 'text', placeholder: 'https://maps.google.com/...' },
          { key: 'office2_photo', label: 'Офис 2 — фото руководителя', type: 'image' },
          { key: 'office2_manager', label: 'Офис 2 — руководитель (ФИО)', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office2_position', label: 'Офис 2 — должность', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office3_name', label: 'Офис 3 — название', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office3_city', label: 'Офис 3 — город', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office3_address', label: 'Офис 3 — адрес', type: 'textarea', bilingual: true, rows: 2, placeholder: '' },
          { key: 'office3_phone', label: 'Офис 3 — телефон', type: 'text', placeholder: '' },
          { key: 'office3_email', label: 'Офис 3 — email', type: 'text', placeholder: '' },
          { key: 'office3_hours', label: 'Офис 3 — режим работы', type: 'text', bilingual: true, placeholder: 'Пн–Пт: 09:00–18:00' },
          { key: 'office3_map', label: 'Офис 3 — ссылка на карту', type: 'text', placeholder: 'https://maps.google.com/...' },
          { key: 'office3_photo', label: 'Офис 3 — фото руководителя', type: 'image' },
          { key: 'office3_manager', label: 'Офис 3 — руководитель (ФИО)', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office3_position', label: 'Офис 3 — должность', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office4_name', label: 'Офис 4 — название', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office4_city', label: 'Офис 4 — город', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office4_address', label: 'Офис 4 — адрес', type: 'textarea', bilingual: true, rows: 2, placeholder: '' },
          { key: 'office4_phone', label: 'Офис 4 — телефон', type: 'text', placeholder: '' },
          { key: 'office4_email', label: 'Офис 4 — email', type: 'text', placeholder: '' },
          { key: 'office4_hours', label: 'Офис 4 — режим работы', type: 'text', bilingual: true, placeholder: 'Пн–Пт: 09:00–18:00' },
          { key: 'office4_map', label: 'Офис 4 — ссылка на карту', type: 'text', placeholder: 'https://maps.google.com/...' },
          { key: 'office4_photo', label: 'Офис 4 — фото руководителя', type: 'image' },
          { key: 'office4_manager', label: 'Офис 4 — руководитель (ФИО)', type: 'text', bilingual: true, placeholder: '' },
          { key: 'office4_position', label: 'Офис 4 — должность', type: 'text', bilingual: true, placeholder: '' },
        ],
      },
    ],
  },
];

// ─── Value store helpers ──────────────────────────────────────────────────────
type FieldValues = Record<string, Record<Lang, string>>;

function initPageValues(page: PageDef): FieldValues {
  const v: FieldValues = {};
  for (const s of page.sections) {
    for (const f of s.fields) {
      v[f.key] = { ru: '', kz: '', en: '', zh: '' };
    }
  }
  return v;
}

function initAllValues(pages: PageDef[]): Record<string, FieldValues> {
  const result: Record<string, FieldValues> = {};
  for (const p of pages) result[p.slug] = initPageValues(p);
  return result;
}

// ─── Offices custom editor ────────────────────────────────────────────────────

function OfficesEditor({
  lang, getVal, setVal, openMediaPicker,
}: {
  lang: Lang;
  getVal: (key: string, l: Lang) => string;
  setVal: (key: string, l: Lang, val: string) => void;
  openMediaPicker: (cb: (url: string) => void, accept?: string) => void;
}) {
  const [officeIds, setOfficeIds] = useState<number[]>([1, 2]);
  const nextId = () => Math.max(...officeIds) + 1;

  const inputCls = 'w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] placeholder:text-[#89837E]/40 focus:outline-none focus:border-[#D64338] transition-colors';
  const labelCls = 'text-[10px] font-bold text-[#89837E] uppercase tracking-wider mb-1 flex items-center gap-1';
  const LangBadge = () => (
    <span className="text-[10px] font-bold px-1 py-0.5 bg-[#F2EBE3] text-[#89837E] rounded uppercase">{lang}</span>
  );

  return (
    <div className="border-t border-[#DFDFDF] px-5 py-5 space-y-4">
      {/* Section heading */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>Заголовок раздела</label>
          <LangBadge />
        </div>
        <input
          type="text"
          value={getVal('offices_heading', lang)}
          onChange={e => setVal('offices_heading', lang, e.target.value)}
          placeholder="Наши офисы"
          className={inputCls}
        />
      </div>

      {/* Office cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {officeIds.map((n, idx) => {
          const k = (field: string) => `office${n}_${field}`;
          const photo = getVal(k('photo'), 'ru');
          const isFirst = idx === 0;

          return (
            <div key={n} className="bg-[#F9F8F6] rounded-xl border border-[#DFDFDF] overflow-hidden">
              {/* Card header */}
              <div className="bg-[#383233] px-4 py-2.5 flex items-center justify-between">
                <p className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                  Офис {idx + 1} {isFirst && <span className="text-white/50 font-normal normal-case">· Главный</span>}
                </p>
                <div className="flex items-center gap-2">
                  {getVal(k('name'), lang) && (
                    <span className="text-white/60 text-xs truncate max-w-[120px]">{getVal(k('name'), lang)}</span>
                  )}
                  {!isFirst && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Удалить офис ${idx + 1}?`)) {
                          setOfficeIds(prev => prev.filter(id => id !== n));
                        }
                      }}
                      className="ml-1 w-5 h-5 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Photo + manager row */}
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <p className={labelCls}><User size={10} /> Фото руководителя</p>
                    {photo ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#DFDFDF] group">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => openMediaPicker(url => setVal(k('photo'), 'ru', url), 'image/*')}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon size={16} className="text-white" />
                        </button>
                        <button type="button"
                          onClick={() => setVal(k('photo'), 'ru', '')}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button type="button"
                        onClick={() => openMediaPicker(url => setVal(k('photo'), 'ru', url), 'image/*')}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-[#DFDFDF] hover:border-[#D64338] flex flex-col items-center justify-center gap-1 transition-colors group">
                        <User size={18} className="text-[#89837E] group-hover:text-[#D64338]" />
                        <span className="text-[10px] text-[#89837E] group-hover:text-[#D64338] text-center leading-tight">Загрузить фото</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className={labelCls}><User size={10} /> ФИО руководителя</p>
                        <LangBadge />
                      </div>
                      <input type="text" value={getVal(k('manager'), lang)}
                        onChange={e => setVal(k('manager'), lang, e.target.value)}
                        placeholder="Иванов Иван Иванович" className={inputCls} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className={labelCls}>Должность</p>
                        <LangBadge />
                      </div>
                      <input type="text" value={getVal(k('position'), lang)}
                        onChange={e => setVal(k('position'), lang, e.target.value)}
                        placeholder="Директор" className={inputCls} />
                    </div>
                  </div>
                </div>

                <hr className="border-[#DFDFDF]" />

                {/* Name + City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className={labelCls}>Название</p>
                      <LangBadge />
                    </div>
                    <input type="text" value={getVal(k('name'), lang)}
                      onChange={e => setVal(k('name'), lang, e.target.value)}
                      placeholder={isFirst ? 'Главный офис' : `Офис ${idx + 1}`}
                      className={inputCls} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className={labelCls}><MapPin size={10} /> Город</p>
                      <LangBadge />
                    </div>
                    <input type="text" value={getVal(k('city'), lang)}
                      onChange={e => setVal(k('city'), lang, e.target.value)}
                      placeholder={isFirst ? 'Астана' : ''}
                      className={inputCls} />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className={labelCls}><MapPin size={10} /> Адрес</p>
                    <LangBadge />
                  </div>
                  <textarea rows={2} value={getVal(k('address'), lang)}
                    onChange={e => setVal(k('address'), lang, e.target.value)}
                    placeholder={isFirst ? 'пр-т Р. Кошкарбаева, 1/5' : ''}
                    className={`${inputCls} resize-none`} />
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={labelCls}><Phone size={10} /> Телефон</p>
                    <input type="text" value={getVal(k('phone'), 'ru')}
                      onChange={e => setVal(k('phone'), 'ru', e.target.value)}
                      placeholder={isFirst ? '+7 (7172) 39 99 88' : ''}
                      className={inputCls} />
                  </div>
                  <div>
                    <p className={labelCls}><Mail size={10} /> Email</p>
                    <input type="text" value={getVal(k('email'), 'ru')}
                      onChange={e => setVal(k('email'), 'ru', e.target.value)}
                      placeholder={isFirst ? 'info@darrail.com' : ''}
                      className={inputCls} />
                  </div>
                </div>

                {/* Hours + Map */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className={labelCls}><Clock size={10} /> Режим работы</p>
                      <LangBadge />
                    </div>
                    <input type="text" value={getVal(k('hours'), lang)}
                      onChange={e => setVal(k('hours'), lang, e.target.value)}
                      placeholder="Пн–Пт: 09:00–18:00"
                      className={inputCls} />
                  </div>
                  <div>
                    <p className={labelCls}><MapPin size={10} /> Ссылка на карту</p>
                    <input type="text" value={getVal(k('map'), 'ru')}
                      onChange={e => setVal(k('map'), 'ru', e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add office button */}
      <button
        type="button"
        onClick={() => setOfficeIds(prev => [...prev, nextId()])}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#DFDFDF] text-sm text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-all"
      >
        <Plus className="w-4 h-4" />
        Добавить офис
      </button>
    </div>
  );
}

// ─── AddDocumentForm ──────────────────────────────────────────────────────────
function AddDocumentForm({
  onAdd,
  openMediaPicker,
}: {
  onAdd: (doc: { name: string; url: string; fileType: 'pdf' | 'word' | 'other' }) => void;
  openMediaPicker: (cb: (url: string) => void, accept?: string) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'word' | 'other'>('pdf');

  const inputCls = 'flex-1 px-2.5 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-xs text-[#383233] placeholder:text-[#89837E]/40 focus:outline-none focus:border-[#D64338] transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F2EBE3]/50 rounded-xl border border-dashed border-[#DFDFDF]">
      <select
        value={fileType}
        onChange={e => setFileType(e.target.value as 'pdf' | 'word' | 'other')}
        className="px-2 py-2 text-xs border border-[#DFDFDF] rounded-lg bg-white text-[#383233] focus:outline-none focus:border-[#D64338]"
      >
        <option value="pdf">PDF</option>
        <option value="word">Word</option>
        <option value="other">Другой</option>
      </select>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Название документа..."
        className={inputCls}
        style={{ minWidth: 140 }}
      />
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="URL или путь..."
          className={`${inputCls} font-mono`}
          style={{ minWidth: 140 }}
        />
        <button
          type="button"
          onClick={() => openMediaPicker((u) => setUrl(u))}
          className="px-2 py-2 bg-white border border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors whitespace-nowrap"
        >
          Выбрать
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!url.trim()) return;
          onAdd({ name: name.trim() || url.split('/').pop() || 'Документ', url: url.trim(), fileType });
          setName('');
          setUrl('');
        }}
        disabled={!url.trim()}
        className="px-3 py-2 bg-[#D64338] text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-[#b8362d] transition-colors"
      >
        + Добавить
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PageEditor() {
  const [pages, setPages] = useState<PageDef[]>(INITIAL_PAGES);
  const [activeSlug, setActiveSlug] = useState(INITIAL_PAGES[0].slug);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    { [INITIAL_PAGES[0].sections[0].id]: true }
  );
  const [lang, setLang] = useState<Lang>('ru');
  const [values, setValues] = useState<Record<string, FieldValues>>(initAllValues(INITIAL_PAGES));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track which slugs have already been hydrated from API (avoid re-overwriting user edits)
  const hydratedRef = useRef<Set<string>>(new Set());

  // Array fields: galleries and document sets (keyed as `${slug}__${fieldKey}`)
  const [imageGalleries, setImageGalleries] = useState<Record<string, string[]>>({});
  const [documentSets, setDocumentSets] = useState<Record<string, Array<{ name: string; url: string; fileType: 'pdf' | 'word' | 'other' }>>>({});

  const galleryKey = (fieldKey: string) => `${activeSlug}__${fieldKey}`;
  const getGallery = (fieldKey: string) => imageGalleries[galleryKey(fieldKey)] ?? [];
  const setGallery = (fieldKey: string, imgs: string[]) =>
    setImageGalleries(prev => ({ ...prev, [galleryKey(fieldKey)]: imgs }));

  const getDocSet = (fieldKey: string) =>
    documentSets[galleryKey(fieldKey)] ?? [];
  const setDocSet = (fieldKey: string, docs: Array<{ name: string; url: string; fileType: 'pdf' | 'word' | 'other' }>) =>
    setDocumentSets(prev => ({ ...prev, [galleryKey(fieldKey)]: docs }));

  // ── API: load/save ──────────────────────────────────────────────────────────
  const { data: remoteContent, isLoading: contentLoading } = usePageContent(activeSlug);
  const saveMutation = useSavePageContent(activeSlug);

  // Hydrate state from API when switching pages (once per slug)
  useEffect(() => {
    if (!remoteContent || hydratedRef.current.has(activeSlug)) return;
    hydratedRef.current.add(activeSlug);

    // Merge remote fields into local values (remote wins for loaded keys)
    if (Object.keys(remoteContent.fields).length > 0) {
      setValues(prev => ({
        ...prev,
        [activeSlug]: {
          ...initPageValues(pages.find(p => p.slug === activeSlug)!),
          ...remoteContent.fields,
        },
      }));
    }

    // Merge galleries
    if (Object.keys(remoteContent.galleries).length > 0) {
      const prefixed: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(remoteContent.galleries)) {
        prefixed[`${activeSlug}__${k}`] = v;
      }
      setImageGalleries(prev => ({ ...prev, ...prefixed }));
    }

    // Merge document sets
    if (Object.keys(remoteContent.documents).length > 0) {
      const prefixed: Record<string, Array<{ name: string; url: string; fileType: 'pdf' | 'word' | 'other' }>> = {};
      for (const [k, v] of Object.entries(remoteContent.documents)) {
        prefixed[`${activeSlug}__${k}`] = v;
      }
      setDocumentSets(prev => ({ ...prev, ...prefixed }));
    }
  }, [remoteContent, activeSlug, pages]);

  // ── New page form ───────────────────────────────────────────────────────────
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageLabel, setNewPageLabel] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');

  // New section form
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const activePage = pages.find(p => p.slug === activeSlug)!;
  const { open: openMediaPicker, element: mediaPickerEl } = useMediaPicker();

  const toggleSection = (id: string) =>
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const getVal = (key: string, l: Lang) => values[activeSlug]?.[key]?.[l] ?? '';
  const setVal = (key: string, l: Lang, val: string) =>
    setValues(prev => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], [key]: { ...prev[activeSlug]?.[key], [l]: val } },
    }));

  const handleSave = async () => {
    setSaveError(null);
    // Build galleries/documents payload (strip slug prefix from keys)
    const prefix = `${activeSlug}__`;
    const galleries: Record<string, string[]> = {};
    const documents: Record<string, Array<{ name: string; url: string; fileType: 'pdf' | 'word' | 'other' }>> = {};

    for (const [k, v] of Object.entries(imageGalleries)) {
      if (k.startsWith(prefix)) galleries[k.slice(prefix.length)] = v;
    }
    for (const [k, v] of Object.entries(documentSets)) {
      if (k.startsWith(prefix)) documents[k.slice(prefix.length)] = v;
    }

    try {
      await saveMutation.mutateAsync({
        fields: values[activeSlug] ?? {},
        galleries,
        documents,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError('Ошибка сохранения. Проверьте подключение к API.');
    }
  };

  const handleCreatePage = () => {
    if (!newPageLabel.trim() || !newPageSlug.trim()) return;
    const slug = newPageSlug.toLowerCase().replace(/\s+/g, '-');
    const newPage: PageDef = {
      slug,
      label: newPageLabel.trim(),
      description: newPageDesc.trim() || `Страница /${slug}`,
      sections: [],
      custom: true,
    };
    setPages(prev => [...prev, newPage]);
    setValues(prev => ({ ...prev, [slug]: {} }));
    setActiveSlug(slug);
    setExpandedSections({});
    setNewPageLabel('');
    setNewPageSlug('');
    setNewPageDesc('');
    setShowNewPage(false);
  };

  const handleDeletePage = (slug: string) => {
    if (!pages.find(p => p.slug === slug)?.custom) return;
    setPages(prev => prev.filter(p => p.slug !== slug));
    const remaining = pages.filter(p => p.slug !== slug);
    if (remaining.length > 0) setActiveSlug(remaining[0].slug);
  };

  const handleCreateSection = () => {
    if (!newSectionTitle.trim()) return;
    const section = makeDefaultSection(newSectionTitle.trim());
    setPages(prev =>
      prev.map(p =>
        p.slug === activeSlug ? { ...p, sections: [...p.sections, section] } : p
      )
    );
    setValues(prev => ({
      ...prev,
      [activeSlug]: {
        ...prev[activeSlug],
        ...Object.fromEntries(section.fields.map(f => [f.key, { ru: '', kz: '' }])),
      },
    }));
    setExpandedSections(prev => ({ ...prev, [section.id]: true }));
    setNewSectionTitle('');
    setShowNewSection(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    setPages(prev =>
      prev.map(p =>
        p.slug === activeSlug
          ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) }
          : p
      )
    );
  };

  const autoSlug = (label: string) =>
    label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <>
    <div className="flex h-full min-h-screen bg-[#F9F8F6]">
      {/* ── Pages sidebar ── */}
      <aside className="w-56 shrink-0 bg-white border-r border-[#DFDFDF] flex flex-col">
        <div className="px-4 py-3 border-b border-[#DFDFDF] flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#89837E]">Страницы</p>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col p-2 gap-0.5">
          {pages.map(page => (
            <div key={page.slug} className="group relative">
              <button
                onClick={() => {
                  setActiveSlug(page.slug);
                  setExpandedSections(page.sections[0] ? { [page.sections[0].id]: true } : {});
                  setShowNewSection(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-all pr-8 ${
                  activeSlug === page.slug
                    ? 'bg-[#383233] text-white font-medium'
                    : 'text-[#383233] hover:bg-[#F2EBE3]'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0 opacity-50" />
                <span className="truncate">{page.label}</span>
              </button>
              {page.custom && (
                <button
                  onClick={() => handleDeletePage(page.slug)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-[#89837E] hover:text-[#D64338] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Create page */}
        <div className="p-3 border-t border-[#DFDFDF]">
          {showNewPage ? (
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={newPageLabel}
                onChange={e => {
                  setNewPageLabel(e.target.value);
                  setNewPageSlug(autoSlug(e.target.value));
                }}
                placeholder="Название страницы"
                className="w-full px-2.5 py-2 text-xs border border-[#DFDFDF] rounded-lg focus:outline-none focus:border-[#D64338] bg-[#F9F8F6]"
              />
              <input
                type="text"
                value={newPageSlug}
                onChange={e => setNewPageSlug(e.target.value)}
                placeholder="slug (url)"
                className="w-full px-2.5 py-2 text-xs border border-[#DFDFDF] rounded-lg focus:outline-none focus:border-[#D64338] bg-[#F9F8F6] font-mono"
              />
              <input
                type="text"
                value={newPageDesc}
                onChange={e => setNewPageDesc(e.target.value)}
                placeholder="Описание (опционально)"
                className="w-full px-2.5 py-2 text-xs border border-[#DFDFDF] rounded-lg focus:outline-none focus:border-[#D64338] bg-[#F9F8F6]"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleCreatePage}
                  disabled={!newPageLabel.trim() || !newPageSlug.trim()}
                  className="flex-1 py-1.5 bg-[#D64338] text-white text-xs font-bold rounded-lg disabled:opacity-40"
                >
                  Создать
                </button>
                <button
                  onClick={() => { setShowNewPage(false); setNewPageLabel(''); setNewPageSlug(''); }}
                  className="px-3 py-1.5 bg-[#F2EBE3] text-[#383233] text-xs rounded-lg"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewPage(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#DFDFDF] text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Создать страницу
            </button>
          )}
        </div>
      </aside>

      {/* ── Editor area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-[#DFDFDF] px-6 py-3.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-[#383233] text-base leading-tight">{activePage.label}</h1>
            <p className="text-[#89837E] text-xs mt-0.5">{activePage.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#F2EBE3] rounded-lg p-1 gap-0.5">
              {(['ru', 'kz', 'en', 'zh'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    lang === l ? 'bg-[#383233] text-white' : 'text-[#383233] hover:bg-white'
                  }`}
                >
                  {l === 'zh' ? '中文' : l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || contentLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60 ${
                  saved ? 'bg-green-500 text-white' : 'bg-[#D64338] text-white hover:bg-[#b8362d]'
                }`}
              >
                {saveMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</>
                  : saved
                    ? <><CheckCircle className="w-4 h-4" /> Сохранено</>
                    : <><Save className="w-4 h-4" /> Сохранить</>}
              </button>
              {saveError && <p className="text-[11px] text-red-500">{saveError}</p>}
            </div>
          </div>
        </div>

        {/* Sections list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {contentLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-[#89837E] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Загрузка данных страницы...
            </div>
          )}
          {!contentLoading && activePage.sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F2EBE3] flex items-center justify-center mb-4">
                <GripVertical className="w-6 h-6 text-[#89837E]" />
              </div>
              <p className="text-[#383233] font-semibold mb-1">Нет секций</p>
              <p className="text-[#89837E] text-sm">Добавьте первый блок с помощью кнопки ниже</p>
            </div>
          )}

          {activePage.sections.map(section => {
            const isOpen = !!expandedSections[section.id];
            return (
              <div key={section.id} className="bg-white rounded-xl border border-[#DFDFDF] overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F9F8F6] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-left min-w-0">
                    <div className="w-1 h-5 bg-[#D64338] rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#383233] text-sm">{section.title}</p>
                      {section.description && (
                        <p className="text-[#89837E] text-xs mt-0.5 truncate">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {section.custom && (
                      <span
                        onClick={e => { e.stopPropagation(); handleDeleteSection(section.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-[#D64338] text-[#89837E] transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-[#89837E]" />
                      : <ChevronRight className="w-4 h-4 text-[#89837E]" />}
                  </div>
                </button>

                {isOpen && (
                  section.id === 'contacts_offices'
                    ? <OfficesEditor
                        lang={lang}
                        getVal={getVal}
                        setVal={setVal}
                        openMediaPicker={openMediaPicker}
                      />
                    : <div className="border-t border-[#DFDFDF] px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {section.fields.map(field => {
                          const isImage = field.type === 'image';
                          const activeLang = isImage ? 'ru' : lang;
                          const wide = field.type === 'textarea' || isImage || field.type === 'images' || field.type === 'documents';

                          return (
                            <div key={field.key} className={`flex flex-col gap-1.5 ${wide ? 'md:col-span-2' : ''}`}>
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-[#383233] uppercase tracking-wider">
                                  {field.label}
                                </label>
                                {field.bilingual && !isImage && field.type !== 'images' && field.type !== 'documents' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#F2EBE3] text-[#89837E] rounded uppercase">
                                    {lang}
                                  </span>
                                )}
                              </div>

                              {field.type === 'textarea' ? (
                                <textarea
                                  rows={field.rows ?? 3}
                                  value={getVal(field.key, activeLang)}
                                  onChange={e => setVal(field.key, activeLang, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] placeholder:text-[#89837E]/40 focus:outline-none focus:border-[#D64338] transition-colors resize-none"
                                />
                              ) : isImage ? (
                                <div className="space-y-2">
                                  {getVal(field.key, 'ru') ? (
                                    <div className="relative rounded-xl overflow-hidden border border-[#DFDFDF] group bg-[#F9F8F6]" style={{ maxHeight: 220 }}>
                                      <img
                                        src={getVal(field.key, 'ru')}
                                        alt=""
                                        className="w-full object-contain"
                                        style={{ maxHeight: 220 }}
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() => openMediaPicker((url) => setVal(field.key, 'ru', url), 'image/*')}
                                          className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-[#383233] hover:bg-[#F2EBE3] transition-colors"
                                        >
                                          Сменить
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setVal(field.key, 'ru', '')}
                                          className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-bold text-white hover:bg-red-700 transition-colors"
                                        >
                                          Удалить
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openMediaPicker((url) => setVal(field.key, 'ru', url), 'image/*')}
                                      className="w-full h-32 rounded-xl border-2 border-dashed border-[#DFDFDF] hover:border-[#D64338] flex flex-col items-center justify-center gap-2 transition-colors group bg-[#F9F8F6]"
                                    >
                                      <ImageIcon className="w-7 h-7 text-[#89837E] group-hover:text-[#D64338] transition-colors" />
                                      <span className="text-xs text-[#89837E] group-hover:text-[#D64338] transition-colors font-medium">
                                        Нажмите для выбора изображения
                                      </span>
                                    </button>
                                  )}
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={getVal(field.key, 'ru')}
                                      onChange={e => setVal(field.key, 'ru', e.target.value)}
                                      placeholder={field.placeholder ?? '/images/...'}
                                      className="flex-1 px-2.5 py-1.5 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-xs text-[#383233] placeholder:text-[#89837E]/40 focus:outline-none focus:border-[#D64338] transition-colors font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => openMediaPicker((url) => setVal(field.key, 'ru', url), 'image/*')}
                                      className="px-2.5 py-1.5 bg-[#F2EBE3] text-[#383233] rounded-lg text-xs font-medium hover:bg-[#DFDFDF] transition-colors whitespace-nowrap"
                                    >
                                      Выбрать
                                    </button>
                                  </div>
                                </div>
                              ) : field.type === 'images' ? (
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    {getGallery(field.key).map((url, idx) => (
                                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#DFDFDF] group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => setGallery(field.key, getGallery(field.key).filter((_, i) => i !== idx))}
                                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X size={10} className="text-white" />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => openMediaPicker((url) => setGallery(field.key, [...getGallery(field.key), url]), 'image/*')}
                                      className="w-20 h-20 rounded-lg border-2 border-dashed border-[#DFDFDF] hover:border-[#D64338] flex flex-col items-center justify-center gap-1 transition-colors group"
                                    >
                                      <Plus className="w-5 h-5 text-[#89837E] group-hover:text-[#D64338]" />
                                      <span className="text-[10px] text-[#89837E] group-hover:text-[#D64338]">Добавить</span>
                                    </button>
                                  </div>
                                  {getGallery(field.key).length === 0 && (
                                    <p className="text-xs text-[#89837E]/60">Нет изображений. Нажмите «+», чтобы добавить.</p>
                                  )}
                                </div>
                              ) : field.type === 'documents' ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {getDocSet(field.key).map((doc, idx) => {
                                      const isPdf = doc.fileType === 'pdf';
                                      const isWord = doc.fileType === 'word';
                                      return (
                                        <div key={idx} className="flex items-center gap-3 bg-[#F9F8F6] border border-[#DFDFDF] rounded-xl p-3 group">
                                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white ${isPdf ? 'bg-red-600' : isWord ? 'bg-blue-600' : 'bg-[#89837E]'}`}>
                                            {isPdf ? 'PDF' : isWord ? 'DOC' : 'FILE'}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-[#383233] truncate">{doc.name || 'Без названия'}</p>
                                            <p className="text-[10px] text-[#89837E] truncate font-mono">{doc.url || '—'}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setDocSet(field.key, getDocSet(field.key).filter((_, i) => i !== idx))}
                                            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center transition-opacity shrink-0"
                                          >
                                            <X size={10} className="text-red-600" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <AddDocumentForm
                                    onAdd={(doc) => setDocSet(field.key, [...getDocSet(field.key), doc])}
                                    openMediaPicker={openMediaPicker}
                                  />
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={getVal(field.key, activeLang)}
                                  onChange={e => setVal(field.key, activeLang, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] placeholder:text-[#89837E]/40 focus:outline-none focus:border-[#D64338] transition-colors"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                )}
              </div>
            );
          })}

          {/* Add section */}
          <div className="pt-1">
            {showNewSection ? (
              <div className="bg-white rounded-xl border border-[#D64338]/40 p-4 flex gap-3">
                <input
                  autoFocus
                  type="text"
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateSection()}
                  placeholder="Название секции..."
                  className="flex-1 px-3 py-2.5 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] placeholder:text-[#89837E]/50 focus:outline-none focus:border-[#D64338] transition-colors"
                />
                <button
                  onClick={handleCreateSection}
                  disabled={!newSectionTitle.trim()}
                  className="px-4 py-2.5 bg-[#D64338] text-white text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-[#b8362d] transition-colors"
                >
                  Создать
                </button>
                <button
                  onClick={() => { setShowNewSection(false); setNewSectionTitle(''); }}
                  className="px-3 py-2.5 bg-[#F2EBE3] text-[#383233] text-sm rounded-lg hover:bg-[#DFDFDF] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewSection(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#DFDFDF] text-sm text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-all"
              >
                <Plus className="w-4 h-4" />
                Добавить секцию
              </button>
            )}
          </div>

          {/* Bottom save */}
          <div className="flex flex-col items-end gap-2 pt-2 pb-6">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                saved ? 'bg-green-500 text-white' : 'bg-[#D64338] text-white hover:bg-[#b8362d]'
              }`}
            >
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</>
                : saved
                  ? <><CheckCircle className="w-4 h-4" /> Сохранено</>
                  : <><Save className="w-4 h-4" /> Сохранить изменения</>}
            </button>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </div>
        </div>
      </div>
    </div>
    {mediaPickerEl}
    </>
  );
}
