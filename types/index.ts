// Типы для проекта

export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  link: string
  icon: string
  gradient: string
}

export interface Stat {
  value: number
  label: string
  color: string
}

export interface Contact {
  type: string
  label: string
  value: string
  icon: string
  link: string
}

export interface NavigationItem {
  label: string
  href: string
  id: string
}

export interface Skill {
  name: string
  gradient: string
  bgGradient: string
  borderColor: string
}

