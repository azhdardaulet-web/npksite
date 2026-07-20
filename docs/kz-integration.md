# Интеграция казахской локализации — этап 4

Эту инструкцию выполнять только после команды владельца проекта, когда параллельные изменения смержены в основную ветку, а `kz-lokalizaciya` перебазирована на неё.

## 1. Подготовка после rebase

1. Проверить конфликтующие изменения в `app/src/main.tsx`, headers, формах и API-клиенте.
2. Повторно сверить SHA-256 `content/kzversiontext.md` с зафиксированным в `docs/kz-mapping.md`.
3. Запустить проверку словарей: в `ru.ts` и `kz.ts` должно быть одинаковое множество ключей.
4. Не заменять RU-фолбэки из `docs/kz-missing.md` самостоятельным переводом.

## 2. Подключение провайдера

В `app/src/main.tsx` обернуть корневой `<App />`:

```tsx
import { LanguageProvider } from '@/i18n/LanguageContext';

<LanguageProvider>
  <App />
</LanguageProvider>
```

`LanguageProvider` уже:

- хранит `ru | kz` в `localStorage` под ключом `npk-language`;
- на первом визите выбирает KZ для browser language `kk-*`/`kz-*`, иначе RU;
- синхронизирует `document.documentElement.lang`;
- предоставляет `language`, `setLanguage` и `toggleLanguage`.

## 3. Рабочий переключатель в header

В desktop и mobile headers использовать один контекст:

```tsx
const { language, setLanguage } = useLanguage();

<button
  type="button"
  aria-pressed={language === 'kz'}
  onClick={() => setLanguage('kz')}
>
  ҚАЗ
</button>
```

Для RU — аналогично `setLanguage('ru')`. Нельзя хранить отдельный локальный state в каждом header: оба переключателя должны читать одно состояние контекста.

## 4. Замена статических строк порциями

Работать по 3–4 файла и после каждой порции останавливать интеграцию для ручной проверки RU/KZ.

Рекомендуемый порядок:

1. `DesktopHeader.tsx`, `MobileHeader.tsx`, `MobileBottomNav.tsx`, `Footer.tsx`.
2. `HeroSection.tsx`, `NewsSection.tsx`, `CandidatesSection.tsx`, `ProgramSection.tsx`.
3. `ReceptionSection.tsx`, `ReceptionFull.tsx`, `JoinSection.tsx`, `ContactSection.tsx`.
4. `BranchMapSection.tsx`, `MediaSection.tsx`, `SocialStatsSection.tsx`, `ReadAlsoSlider.tsx`.
5. Затем страницы — также по 3–4 файла.

Шаблон замены:

```tsx
import { useT } from '@/i18n/useT';

const t = useT();

return <button>{t('form.submit')}</button>;
```

Переменные подставляются вторым аргументом:

```tsx
t('news.total', { count: total });
t('reception.success.number', { number: appealNumber });
```

Не передавать в `t()` произвольную строку с сервера. Ключи типизированы через `TranslationKey`.

## 5. Контент из Supabase

Для каждой сущности выбирать RU- и KZ-поля одновременно. Значение определяется одной схемой:

```ts
function localizedValue(
  language: 'ru' | 'kz',
  valueRu: string,
  valueKz?: string | null,
) {
  return language === 'kz' && valueKz?.trim() ? valueKz : valueRu;
}
```

Пример:

```ts
const title = localizedValue(language, row.title_ru, row.title_kz);
```

Правила:

- `NULL`, пустая строка и строка из пробелов в `*_kz` дают RU-фолбэк;
- `*_ru` не изменяются;
- fallback применяется отдельно к каждому полю, а не ко всей записи;
- телефоны, email, URL, числа и даты ISO не локализуются.

## 6. Контент активной Prisma/API-схемы

Если после rebase сайт остаётся на `cms/packages/api`, использовать фактические translation-модели вместо несуществующих `*_kz`:

- передавать `lang=ru|kz` в публичные API-запросы;
- на backend выбирать translation указанного языка;
- если KZ translation отсутствует или нужное поле пустое — выбирать `lang='ru'`;
- для `Branch` использовать `cityKz/addressKz` с fallback на `cityRu/addressRu`;
- для `AppealTopic` использовать `nameKz` с fallback на `nameRu`.

До реализации выбрать только один источник данных — Supabase или Express/Prisma — согласно архитектуре после rebase.

## 7. Новости

Для списка и отдельной статьи:

1. Запрашивать выбранный язык.
2. Проверять KZ отдельно для `title`, `excerpt`, `content` и SEO-полей.
3. Если KZ-версии или конкретного поля нет, показывать RU без пометки.
4. Не вызывать машинный перевод и не записывать RU-текст как фиктивную KZ-версию в БД.

## 8. Формы и ошибки

- Локализовать labels, placeholders, consent-тексты, состояния загрузки и клиентские ошибки через `useT()`.
- Backend должен возвращать стабильный `errorCode`; UI переводит код через словарь. Произвольный `err.message` остаётся RU-фолбэком до отдельного контракта ошибок.
- Проверить обе версии SMS-шага: отправка кода, неверный код, истечение, повторная отправка, финальная отправка.
- Данные формы и payload API не должны зависеть от языка интерфейса.

## 9. Проверка каждой порции

1. Открыть изменённые маршруты на RU.
2. Переключиться на KZ без перезагрузки.
3. Обновить страницу — язык должен сохраниться.
4. Проверить `<html lang="ru">` / `<html lang="kz">`.
5. Убедиться, что в KZ нет `undefined`, пустых кнопок и необработанных `{placeholder}`.
6. Проверить mobile и desktop headers.
7. Записать оставшийся русский текст и причину в `docs/kz-missing.md`.

## 10. Граница этапа 4

После каждой порции 3–4 файлов остановиться и дождаться проверки владельца. Этап 5 начинать только после прохождения всех активных маршрутов в обеих языковых версиях.
