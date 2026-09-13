import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Политика обработки файлов cookie',
  description:
    'Политика в отношении обработки файлов cookie на сайте AutoTint — премиальная тонировка автомобилей в Гомеле.',
}

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        На главную
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight">
        Политика в отношении обработки файлов cookie
      </h1>

      <div className="prose prose-neutral dark:prose-invert mt-8 space-y-6 text-sm leading-relaxed">
        <p>
          1. Настоящая Политика описывает порядок использования файлов cookie на
          сайте AutoTint (далее — Сайт). Файлы cookie — это небольшие текстовые
          файлы, которые сохраняются в браузере пользователя при посещении Сайта.
          Они помогают распознавать браузер, запоминать настройки, обеспечивать
          корректную работу отдельных функций и собирать обезличенную статистику
          посещений. Файлы cookie не являются исполняемыми программами, не
          содержат вирусов и не представляют угрозы для устройства пользователя.
        </p>

        <p>2. На Сайте могут использоваться следующие категории файлов cookie:</p>

        <ul className="list-inside list-disc space-y-1 pl-4">
          <li>
            <strong>Обязательные (необходимые)</strong> — обеспечивают базовую
            работу Сайта, безопасность, сохранение выбора пользователя в баннере
            cookie, работу корзины и оформления заказа. Без них использование
            Сайта может быть невозможно или ограничено.
          </li>
          <li>
            <strong>Функциональные</strong> — запоминают предпочтения пользователя
            (например, язык интерфейса, регион, ранее просмотренные разделы) и
            делают работу с Сайтом более удобной.
          </li>
          <li>
            <strong>Целевые и аналитические</strong> — используются для анализа
            посещаемости, популярности страниц и поведения пользователей на Сайте
            в обезличенном виде с целью улучшения качества сервиса и контента.
          </li>
        </ul>

        <p>
          3. По сроку хранения файлы cookie подразделяются на:
        </p>

        <ul className="list-inside list-disc space-y-1 pl-4">
          <li>
            <strong>Сессионные cookie</strong> — хранятся только в течение
            текущего сеанса работы с браузером и удаляются после его закрытия.
          </li>
          <li>
            <strong>Постоянные cookie</strong> — сохраняются на устройстве в
            течение установленного срока (например, до 12 месяцев) и позволяют
            распознавать пользователя при повторных визитах, в том числе запоминать
            согласие на использование cookie.
          </li>
        </ul>

        <p>
          4. При первом посещении Сайта пользователю отображается уведомление о
          файлах cookie с возможностью нажать «Принять» (согласие на использование
          всех категорий cookie, указанных в уведомлении) или «Отклонить»
          (ограничение только необходимыми cookie). Выбор сохраняется и при
          повторных визитах баннер не отображается, пока пользователь не удалит
          сохранённые данные в браузере. Отключение функциональных и аналитических
          cookie может повлиять на удобство использования отдельных разделов
          Сайта.
        </p>

        <p>
          5. Пользователь может в любой момент изменить настройки cookie в
          параметрах браузера: заблокировать сохранение cookie, удалить ранее
          сохранённые файлы или включить режим приватного просмотра. Инструкции
          по управлению cookie в популярных браузерах:
        </p>

        <ul className="list-inside list-disc space-y-1 pl-4">
          <li>
            <a
              href="https://support.mozilla.org/ru/kb/udalenie-kukov-dlya-udaleniya-informacii-kotoruyu-"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647?hl=ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/ru-ru/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://help.opera.com/en/latest/web-preferences/#cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Opera
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/ru-ru/windows/удаление-файлов-cookie-и-изменение-параметров-файлов-cookie-168dab11-0753-043d-7c16-ede5947fc64d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Internet Explorer
            </a>
          </li>
          <li>
            <a
              href="https://yandex.ru/support/browser/ru/personal-data-protection/cookies.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Яндекс
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/ru-ru/microsoft-edge/удаление-файлов-cookie-в-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
      </div>
    </main>
  )
}
