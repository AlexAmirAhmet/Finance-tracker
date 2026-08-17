import {
  Briefcase,
  Hammer,
  HandCoins,
  Sparkles,
  ShoppingCart,
  Car,
  Home,
  PartyPopper,
  HeartPulse,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  hammer: Hammer,
  'hand-coins': HandCoins,
  sparkles: Sparkles,
  'shopping-cart': ShoppingCart,
  car: Car,
  home: Home,
  'party-popper': PartyPopper,
  'heart-pulse': HeartPulse,
  'more-horizontal': MoreHorizontal,
}

export const AVAILABLE_ICON_KEYS = Object.keys(CATEGORY_ICONS)

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? MoreHorizontal
}
