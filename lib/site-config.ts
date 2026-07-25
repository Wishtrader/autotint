import type { LucideIcon } from 'lucide-react'
import {
  Sun,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Layers,
  Car,
} from 'lucide-react'

export const company = {
  name: 'AutoTint',
  tagline: 'Премиальная тонировка автомобилей',
  logo: '/images/logo.png',
  city: 'Гомель',
  address: 'ул. Широкая 13',
  fullAddress: 'г. Гомель, ул. Широкая 4Б, блок 7, к.56',
  phone: '+375 (25) 653-33-33',
  phoneHref: 'tel:+375256533333',
  email: 'info@autotint.by',
  hours: 'Пн–Сб: 9:00 – 20:00',
  hoursShort: 'Ежедневно 9:00 – 20:00',
} as const

export type SocialLink = {
  label: string
  href: string
  // Brand accent color for hover state
  color: string
}

export const socials: SocialLink[] = [
  {
    label: 'Telegram',
    href: 'https://t.me/@id8413775227',
    color: '#229ED9',
  },
  {
    label: 'Viber',
    href: 'viber://chat?number=%2B375256533333',
    color: '#7360F2',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/375256533333',
    color: '#25D366',
  },
]

// Instagram выведен отдельно — это не мессенджер, показываем его в футере.
export const instagram: SocialLink = {
  label: 'Instagram',
  href: 'https://instagram.com/',
  color: '#E4405F',
}

// Все соцсети для футера (мессенджеры + Instagram).
export const footerSocials: SocialLink[] = [...socials, instagram]

export type Service = {
  icon: LucideIcon
  title: string
  description: string
  price: string
}

export const services: Service[] = [
  {
    icon: Sun,
    title: 'Атермальная плёнка',
    description:
      'Отражает до 99% ультрафиолета и инфракрасного излучения. Прохлада в салоне даже в жару, без затемнения обзора.',
    price: 'от 250 BYN',
  },
  {
    icon: Layers,
    title: 'Классическая тонировка',
    description:
      'Плёнки премиальных брендов с гарантией цвета. Идеальный уровень затемнения по вашему выбору и по ГОСТ.',
    price: 'от 250 BYN',
  },
  {
    icon: RefreshCw,
    title: 'Съёмная тонировка',
    description:
      'Тонировка на жёсткой основе для передних стёкол. Легко снимается перед техосмотром и устанавливается обратно.',
    price: 'от 90 BYN',
  },
  {
    icon: ShieldCheck,
    title: 'Бронирование стёкол',
    description:
      'Защитная плёнка от сколов, трещин и попыток взлома. Повышает безопасность и сохраняет стекло целым при ударе.',
    price: 'от 180 BYN',
  },
  {
    icon: Sparkles,
    title: 'Тонировка фар',
    description:
      'Аккуратное затемнение оптики для стильного вида. Сохраняем яркость света и соответствие требованиям.',
    price: 'от 60 BYN',
  },
  {
    icon: Car,
    title: 'Оклейка кузова',
    description:
      'Полная или частичная оклейка виниловой и защитной плёнкой. Меняем цвет и защищаем ЛКП от повреждений.',
    price: 'от 400 BYN',
  },
]

export const benefits = [
  {
    value: '2+',
    label: 'лет опыта',
    description: 'Работаем с 2025 года и знаем каждую модель авто.',
  },
  {
    value: '800+',
    label: 'авто затонировано',
    description: 'Тысячи довольных клиентов по всей Гомельской области.',
  },
  {
    value: '1 год',
    label: 'гарантии',
    description: 'Официальная гарантия на плёнку и работу мастера.',
  },
  {
    value: '1.5 часа',
    label: 'средний срок',
    description: 'Большинство работ выполняем в день обращения.',
  },
]

export type Testimonial = {
  name: string
  car: string
  rating: number
  text: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Дмитрий К.',
    car: 'BMW X5',
    rating: 5,
    text: 'Делал атермалку по кругу. В салоне реально прохладнее, обзор не пострадал. Мастера работают аккуратно, плёнка легла идеально — ни пылинки, ни пузыря.',
  },
  {
    name: 'Анна С.',
    car: 'Volkswagen Polo',
    rating: 5,
    text: 'Записалась утром, к обеду забрала машину. Всё по ГОСТ, выдали гарантийный талон. Приятный сервис и честная цена — рекомендую всем знакомым.',
  },
  {
    name: 'Сергей П.',
    car: 'Toyota Camry',
    rating: 5,
    text: 'Заказывал бронирование лобового и съёмную тонировку передних. Качество на высоте, всё объяснили про техосмотр. Спустя год плёнка как новая.',
  },
  {
    name: 'Ольга М.',
    car: 'Kia Sportage',
    rating: 5,
    text: 'Очень довольна результатом! Машина смотрится дорого и солидно. Отдельное спасибо за консультацию по выбору затемнения — помогли не ошибиться.',
  },
  {
    name: 'Виталий Р.',
    car: 'Audi A6',
    rating: 5,
    text: 'Обращался за оклейкой кузова защитной плёнкой. Работа ювелирная, сроки не сорвали. Видно, что люди любят своё дело. Буду возвращаться.',
  },
  {
    name: 'Екатерина Л.',
    car: 'Hyundai Tucson',
    rating: 5,
    text: 'Лучшая студия в Гомеле! Чистый бокс, вежливые мастера, результат превзошёл ожидания. Тонировка держится отлично, никаких нареканий.',
  },
]

export const steps = [
  {
    number: '01',
    title: 'Консультация',
    description:
      'Обсуждаем задачу, подбираем плёнку и уровень затемнения под ваш автомобиль и требования законодательства.',
  },
  {
    number: '02',
    title: 'Подготовка',
    description:
      'Тщательно моем и обезжириваем стёкла, снимаем уплотнители — залог идеального результата без пыли и пузырей.',
  },
  {
    number: '03',
    title: 'Оклейка',
    description:
      'Мастер выкраивает и наносит плёнку в чистом боксе. Работаем аккуратно, точно по контуру стекла.',
  },
  {
    number: '04',
    title: 'Приёмка',
    description:
      'Проверяем результат вместе с вами, выдаём гарантийный талон и рекомендации по уходу.',
  },
]
