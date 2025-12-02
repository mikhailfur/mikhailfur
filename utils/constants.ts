import type { Project, Stat, Contact, NavigationItem } from '~/types'

export const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Главная', href: '/#home' },
  { id: 'projects', label: 'Проекты', href: '/#projects' },
  { id: 'about', label: 'О себе', href: '/#about' },
  { id: 'contact', label: 'Контакты', href: '/#contact' }
]

export const projects: Project[] = [
  {
    id: 'alyabot',
    title: 'AlyaBot',
    description: 'ИИ аниме-тян из аниме с персонализированным общением и уникальным характером',
    tags: ['ИИ', 'Чат-бот', 'Аниме'],
    link: 'https://t.me/youralyasanbot',
    icon: 'fas fa-robot',
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    id: 'furrypay',
    title: 'FurryPay',
    description: 'Сервис для оплаты зарубежных сервисов в России с удобным интерфейсом',
    tags: ['Платежи', 'Финансы', 'Сервис'],
    link: 'https://pay.mikhailfur.ru',
    icon: 'fas fa-credit-card',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'comic',
    title: 'Монолог программиста',
    description: 'Комикс о жизни программиста, написанный и проиллюстрированный мной',
    tags: ['Комикс', 'Творчество'],
    link: 'https://t.me/mikhailfurry',
    icon: 'fa-solid fa-newspaper',
    gradient: 'from-orange-500 to-red-500'
  }
]

// Маппинг градиентов для hover эффектов
export const projectBorderColors: Record<string, string> = {
  alyabot: 'hover:border-pink-500/50',
  furrypay: 'hover:border-green-500/50',
  comic: 'hover:border-orange-500/50'
}

// Маппинг цветов для ссылок
export const projectLinkColors: Record<string, string> = {
  alyabot: 'text-pink-400 hover:text-pink-300',
  furrypay: 'text-green-400 hover:text-green-300',
  comic: 'text-orange-400 hover:text-orange-300'
}

export const stats: Stat[] = [
  { value: 8, label: 'Проектов', color: 'blue-400' },
  { value: 3, label: 'Лет опыта', color: 'green-400' },
  { value: 18, label: 'Мой возраст', color: 'purple-400' },
  { value: 24, label: 'Часа в сутках', color: 'pink-400' }
]

export const contacts: Contact[] = [
  {
    type: 'email',
    label: 'Email',
    value: 'me@mikhailfur.ru',
    icon: 'fas fa-envelope',
    link: 'mailto:me@mikhailfur.ru'
  },
  {
    type: 'taplink',
    label: 'Taplink',
    value: 'tap.mikhailfur.ru',
    icon: 'fa-solid fa-link',
    link: 'https://tap.mikhailfur.ru'
  },
  {
    type: 'github',
    label: 'GitHub',
    value: 'github.com/mikhailfur',
    icon: 'fab fa-github',
    link: 'https://github.com/mikhailfur'
  }
]

export const typedStrings = [
  'Frontend Разработчик',
  'GameDeveloper',
  'UI/UX Дизайнер',
  'Создатель проектов'
]

export interface Skill {
  name: string
  gradient: string
  bgGradient: string
  borderColor: string
}

export const skills: Skill[] = [
  {
    name: 'Tailwind CSS',
    gradient: 'from-cyan-400 to-blue-500',
    bgGradient: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30'
  },
  {
    name: 'Python',
    gradient: 'from-yellow-400 to-blue-500',
    bgGradient: 'bg-gradient-to-r from-yellow-500/20 to-blue-500/20',
    borderColor: 'border-yellow-500/30'
  },
  {
    name: 'C#/C++',
    gradient: 'from-purple-400 to-indigo-500',
    bgGradient: 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    name: 'TypeScript',
    gradient: 'from-blue-400 to-cyan-500',
    bgGradient: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30'
  }
]

