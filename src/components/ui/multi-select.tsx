'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  className,
  disabled = false,
  placeholder = "Seleziona opzioni..."
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    const search = inputValue.toLowerCase().trim()
    if (!search) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(search)
    )
  }, [options, inputValue])

  const selectedItems = options.filter((option) => selected.includes(option.value))

  const handleUnselect = (value: string) => {
    onChange(selected.filter((v) => v !== value))
  }

  const handleSelect = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, value])
    } else {
      onChange(selected.filter((v) => v !== value))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            selectedItems.length > 0 ? 'h-full min-h-[2.5rem] py-2' : 'h-10',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selectedItems.length > 0 ? (
              selectedItems.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 mb-1 flex items-center gap-1"
                >
                  {option.label}
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-1 cursor-pointer rounded-full outline-none hover:bg-gray-400/20 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(option.value)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUnselect(option.value)
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="shrink-0 opacity-50">▼</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[200px] p-0" 
        align="start"
        style={{ zIndex: 9999 }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="overflow-visible">
          <CommandInput 
            placeholder="Cerca opzione..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>Nessuna opzione trovata.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSelect(option.value, !selected.includes(option.value))
                }}
              >
                <Checkbox
                  id={option.value}
                  checked={selected.includes(option.value)}
                  onCheckedChange={(checked) => handleSelect(option.value, checked as boolean)}
                />
                <label
                  htmlFor={option.value}
                  className="flex-grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  onClick={(e) => e.stopPropagation()}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 