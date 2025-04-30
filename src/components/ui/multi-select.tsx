'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
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
  selected,
  onChange,
  className,
  disabled = false,
  placeholder = "Seleziona opzioni..."
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedItems = options.filter((option) => selected.includes(option.value))

  const handleUnselect = React.useCallback((value: string) => {
    onChange(selected.filter((v) => v !== value))
  }, [onChange, selected])

  const handleSelect = React.useCallback((value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }, [onChange, selected])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            selectedItems.length > 0 ? 'h-full min-h-[2.5rem] py-2' : 'h-10',
            className
          )}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedItems.length > 0 ? (
              selectedItems.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(option.value)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnselect(option.value)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Cerca opzione..." className="h-9" />
          <CommandEmpty>Nessuna opzione trovata.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  handleSelect(option.value)
                  setOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Checkbox
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => handleSelect(option.value)}
                  className="mr-2"
                  id={`checkbox-${option.value}`}
                />
                <span>{option.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 