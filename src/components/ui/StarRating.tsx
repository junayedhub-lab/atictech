import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
  className?: string
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({ rating, max = 5, size = 14, className, interactive, onChange }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors duration-150',
            i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600',
            interactive && 'cursor-pointer hover:fill-amber-300 hover:text-amber-300'
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  )
}
