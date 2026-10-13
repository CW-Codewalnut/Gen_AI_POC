import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AssistantAvatar({ active = false }: { active?: boolean }) {
  return (
    <div
      className={cn(
        'relative grid size-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-white shadow-sm',
        active && 'after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-primary/30',
      )}
      aria-hidden
    >
      <Sparkles className="size-3.5" />
    </div>
  )
}
