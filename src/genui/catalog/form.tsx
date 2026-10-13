import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CatalogIcon } from '../icons'
import { useActionsDisabled, useField, useGenUIStore } from '../store'
import type { CatalogComponent } from '../types'

export const InputView: CatalogComponent<'Input'> = ({ node, specId }) => {
  const id = useId()
  const [value, setValue] = useField(specId, node.name, node.defaultValue ?? '')
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{node.label}</Label>
      <Input
        id={id}
        type={node.inputType ?? 'text'}
        placeholder={node.placeholder}
        value={String(value ?? '')}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

export const TextareaView: CatalogComponent<'Textarea'> = ({ node, specId }) => {
  const id = useId()
  const [value, setValue] = useField(specId, node.name, '')
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{node.label}</Label>
      <Textarea
        id={id}
        placeholder={node.placeholder}
        value={String(value ?? '')}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

export const SelectView: CatalogComponent<'Select'> = ({ node, specId }) => {
  const id = useId()
  const options = (node.options ?? []).filter((option): option is string => Boolean(option))
  const [value, setValue] = useField(specId, node.name, node.defaultValue)
  const current = typeof value === 'string' && options.includes(value) ? value : undefined
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{node.label}</Label>
      <Select value={current} onValueChange={setValue}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={node.placeholder ?? 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export const CheckboxView: CatalogComponent<'Checkbox'> = ({ node, specId }) => {
  const id = useId()
  const [value, setValue] = useField(specId, node.name, node.defaultChecked ?? false)
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={value === true} onCheckedChange={(checked) => setValue(checked === true)} />
      <Label htmlFor={id} className="font-normal">
        {node.label}
      </Label>
    </div>
  )
}

export const SwitchView: CatalogComponent<'Switch'> = ({ node, specId }) => {
  const id = useId()
  const [value, setValue] = useField(specId, node.name, node.defaultChecked ?? false)
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="grid gap-0.5">
        <Label htmlFor={id}>{node.label}</Label>
        {node.description && <span className="text-sm text-muted-foreground">{node.description}</span>}
      </div>
      <Switch id={id} checked={value === true} onCheckedChange={setValue} />
    </div>
  )
}

export const ButtonView: CatalogComponent<'Button'> = ({ node, specId }) => {
  const disabled = useActionsDisabled(specId)
  const runAction = useGenUIStore((s) => s.runAction)
  return (
    <Button
      size="lg"
      variant={node.variant ?? 'default'}
      disabled={disabled || !node.action?.message}
      onClick={() => node.action && runAction(specId, node.action)}
    >
      <CatalogIcon name={node.icon} data-icon="inline-start" />
      {node.label}
    </Button>
  )
}
