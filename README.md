# MKH_LOG

Персональное портфолио Михаила: проекты, полевые заметки и рабочий контекст в интерфейсе, вдохновлённом терминалом.

Сайт создан не как обычный лендинг, а как небольшая личная лаборатория. В нём собраны открытые репозитории, заметки об AI и разработке, используемый стек, контакты и интерактивная CLI-строка для навигации.

## О проекте

Я работаю с веб-разработкой, локальными AI-инструментами и автоматизацией. Мне интересны понятные системы: от интерфейса и документации до связки локальной LLM, генерации изображений и инфраструктуры.

В портфолио сейчас представлены:

- [`sd-webui-ai-wdywfm`](https://github.com/mikhailfur/sd-webui-ai-wdywfm) - AI-помощник, превращающий идею в аккуратный prompt для Stable Diffusion WebUI Forge Neo.
- `terminal-blog` - это портфолио: Next.js-сайт с терминальным интерфейсом, Markdown-заметками и настраиваемой навигацией.

Больше репозиториев: [github.com/mikhailfur](https://github.com/mikhailfur).

## Что есть на сайте

- Терминальный интерфейс `MKH_LOG` с разделами проектов, стека, профиля и заметок.
- Настраиваемые команды, алиасы и быстрые действия.
- Архив статей в Markdown: на главной видны три последние заметки, полный список открывается в отдельном окне.
- Полная локализация: English (по умолчанию), русский и 한국어.
- Рендеринг Markdown с абзацами, заголовками, списками, блоками кода, ссылками и выделением текста.
- Контакты из переменных окружения, без захардкоженных ссылок в интерфейсе.
- Опциональный статус текущего трека из Яндекс Музыки. Токен обрабатывается только на сервере.
- Команда `message <текст>` для отправки посетителем сообщения в личный чат Telegram.
- Цветной ANSI-арт в главном терминальном окне.

## Стек

- Next.js 16 и React 19
- TypeScript
- Tailwind CSS и собственные глобальные стили
- Node.js API route для серверной интеграции с Ynison

## Запуск

Требуется Node.js `>= 22.13.0`.

```bash
npm install
npm run dev
```

После запуска открой адрес из вывода Next.js. Для production-сборки:

```bash
npm run build
npm run start
```

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```

## Настройка контента

Большая часть данных находится в `src/data`.

| Что изменить | Где находится |
| --- | --- |
| Проекты, интересы, стек, команды и строки интерфейса | `src/data/site-content.ts` |
| Заметки | `src/data/articles/*.md` |
| Контактные ссылки и токен Яндекс Музыки | `.env` по шаблону `.env.example` |

### Добавление заметки

Открой локально `tools/article-editor/index.html`: редактор не запускает сервер, не загружается на сайт и скачивает готовый файл `case-id.language.md`. Справа доступен live preview на листе A4 в оформлении окна чтения на сайте. Перемести скачанный файл в `src/data/articles`.

Формат файла, например `case-004.ru.md`:

```md
---
id: case-004
type: FIELD NOTE
title: Название заметки
date: 06 AUG 2026
excerpt: Короткое описание для списка заметок.
redacted: фрагмент для скрытия|ещё один фрагмент
---

Первый абзац заметки.

## Подзаголовок

- Пункт списка
- **Жирный текст** и [ссылка](https://example.com)
```

Все Markdown-файлы загружаются автоматически и сортируются по полю `date` от новых к старым. Поле `redacted` необязательно; перечисленные в нём фрагменты будут скрыты в окне заметки.

### Перевод статей

Добавь `OPENROUTER_API_KEY` в `.env`, затем запусти:

```bash
npm run article:translate
```

Команда берёт каждый `*.ru.md` исходник и создаёт отсутствующие соседние `*.en.md` и `*.ko.md` переводы через `google/gemma-4-31b-it` в OpenRouter. Уже существующие переводы пропускаются. Ключ не попадает в браузер и не должен иметь префикс `NEXT_PUBLIC_`. Если для аккаунта нужен другой идентификатор модели, задай `OPENROUTER_MODEL`.

### Добавление команды

Измени функцию `getTerminalCommands` в `src/data/site-content.ts`:

```ts
{ name: "projects", description: "open projects", action: "projects", quick: true }
```

`name` - команда, `aliases` - дополнительные названия, `description` - строка в `help`, `quick` - кнопка под терминалом. Поле `action` использует существующее действие: `about`, `archive`, `clear`, `github`, `help`, `hobbies`, `message`, `projects` или `stack`.

### Сообщения из терминала

Команда `message <текст>` отправляет текст в Telegram через серверный маршрут. Добавь в `.env` приватные значения:

```env
TELEGRAM_BOT_TOKEN=123456:bot-token-from-botfather
TELEGRAM_CHAT_ID=123456789
```

Создай бота в [@BotFather](https://t.me/BotFather), напиши ему `/start` со своего аккаунта, затем открой `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates` и возьми `message.chat.id` из ответа. Не публикуй эти значения и не используй для них префикс `NEXT_PUBLIC_`. Маршрут принимает до 2 000 символов и ограничивает отправку до пяти сообщений с одного IP за десять минут.

## Переменные окружения

Скопируй `.env.example` в `.env` и заполни нужные значения:

```env
NEXT_PUBLIC_GITHUB_URL=https://github.com/mikhailfur
NEXT_PUBLIC_TELEGRAM_URL=
YANDEX_MUSIC_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
OPENROUTER_API_KEY=
```

Все `NEXT_PUBLIC_*` переменные доступны в браузере, поэтому в них должны быть только публичные ссылки. `YANDEX_MUSIC_TOKEN`, `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` не нужно публиковать, добавлять в git или переименовывать с префиксом `NEXT_PUBLIC_`.

## Структура

```text
src/
  app/                    # Страницы, API и глобальные стили
  components/home/         # Основной интерфейс MKH_LOG
  data/
    articles/              # Архив: *.ru.md, *.en.md, *.ko.md
    articles.ts             # Загрузка и проверка frontmatter
    site-content.ts         # Локализованные UI, команды и портфолио
  types/                   # Общие TypeScript-типы
tools/article-editor/      # Автономный локальный редактор Markdown (не входит в сборку)
```

## Контакты

- GitHub: [@mikhailfur](https://github.com/mikhailfur)
- Email: [me@mikhailfur.ru](mailto:me@mikhailfur.ru)
- Taplink: [tap.mikhailfur.ru](https://tap.mikhailfur.ru)

© 2026 MikhailFur
