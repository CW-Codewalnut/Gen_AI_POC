import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { CatalogComponent } from '../types'

const HEADING = {
  1: 'text-2xl font-semibold tracking-tight',
  2: 'text-lg font-semibold tracking-tight',
  3: 'text-base font-medium',
} as const

export const HeadingView: CatalogComponent<'Heading'> = ({ node }) => {
  const level = (node.level === 1 || node.level === 3 ? node.level : 2) as keyof typeof HEADING
  const Tag = `h${level}` as const
  return <Tag className={cn('text-balance', HEADING[level])}>{node.text}</Tag>
}

const TEXT_SIZE = { sm: 'text-sm', md: 'text-sm/relaxed', lg: 'text-base/relaxed' } as const

export const TextView: CatalogComponent<'Text'> = ({ node }) => (
  <p
    className={cn(
      'text-pretty whitespace-pre-line',
      TEXT_SIZE[node.size ?? 'md'],
      node.tone === 'muted' ? 'text-muted-foreground' : 'text-foreground',
    )}
  >
    {node.text}
  </p>
)

const BADGE_TONES = {
  success: 'bg-success/10 text-success',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
} as const

export const BadgeView: CatalogComponent<'Badge'> = ({ node }) => {
  if (!node.text) return null
  const variant = node.variant ?? 'secondary'
  if (variant === 'success' || variant === 'warning') {
    return <Badge className={BADGE_TONES[variant]}>{node.text}</Badge>
  }
  return <Badge variant={variant}>{node.text}</Badge>
}

const ALERTS = {
  info: { icon: Info, className: 'border-primary/20 bg-primary/5 *:[svg]:text-primary' },
  success: { icon: CheckCircle2, className: 'border-success/25 bg-success/5 *:[svg]:text-success' },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-500/30 bg-amber-500/5 *:[svg]:text-amber-600 dark:*:[svg]:text-amber-400',
  },
  destructive: { icon: XCircle, className: 'border-critical/30 bg-critical/5 *:[svg]:text-critical' },
} as const

export const AlertView: CatalogComponent<'Alert'> = ({ node }) => {
  const { icon: Icon, className } = ALERTS[node.variant ?? 'info']
  return (
    <Alert className={className}>
      <Icon />
      <AlertTitle>{node.title}</AlertTitle>
      {node.description && <AlertDescription>{node.description}</AlertDescription>}
    </Alert>
  )
}

export const SeparatorView: CatalogComponent<'Separator'> = () => <Separator />
