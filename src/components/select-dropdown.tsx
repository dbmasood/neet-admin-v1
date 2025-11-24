import { Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SelectDropdownProps = {
  onValueChange?: (value: string) => void
  defaultValue: string | undefined
  placeholder?: string
  isPending?: boolean
  items: { label: string; value: string }[] | undefined
  disabled?: boolean
  className?: string
  isControlled?: boolean
}

export function SelectDropdown({
  defaultValue,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
  isControlled = false,
}: SelectDropdownProps) {
  const EMPTY_VALUE = '__select-empty-value__'
  const hasEmptyItem = Boolean(items?.some((item) => item.value === ''))

  const mapItemValue = (value: string) =>
    value === '' ? EMPTY_VALUE : value

  const mapSelectedValue = (value?: string) => {
    if (value === undefined) return undefined
    if (value === '' && hasEmptyItem) return EMPTY_VALUE
    return value
  }

  const handleChange = (value: string) => {
    if (!onValueChange) return
    onValueChange(value === EMPTY_VALUE ? '' : value)
  }

  const selectProps = isControlled
    ? { value: mapSelectedValue(defaultValue), onValueChange: handleChange }
    : {
        defaultValue: mapSelectedValue(defaultValue),
        onValueChange: handleChange,
      }

  return (
    <Select {...selectProps}>
      <SelectTrigger disabled={disabled} className={cn(className)}>
        <SelectValue placeholder={placeholder ?? 'Select'} />
      </SelectTrigger>
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <Loader className='h-5 w-5 animate-spin' />
              {'  '}
              Loading...
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem
              key={value || `empty-${label}`}
              value={mapItemValue(value)}
            >
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
