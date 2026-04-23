import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
}

export default function Card({ children, className, glass, hover }: CardProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-700/50 bg-slate-800/40',
      glass && 'glass',
      hover && 'transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/70',
      className
    )}>
      {children}
    </div>
  )
}
