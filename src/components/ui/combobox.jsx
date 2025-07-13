"use client"
import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export default function Combobox({
  options,
  value = "",
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className,
  disabled = false,
  multiselect = false,
  maxSelectedDisplay = 3,
}) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(
    multiselect ? (Array.isArray(value) ? value : []) : (typeof value === 'string' ? value : "")
  )

  React.useEffect(() => {
    if (multiselect) {
      setInternalValue(Array.isArray(value) ? value : [])
    } else {
      setInternalValue(typeof value === 'string' ? value : "")
    }
  }, [value, multiselect])

  const handleSelect = (selectedLabel) => {
    const selectedOption = options.find(option => option.label === selectedLabel)
    if (!selectedOption) return
    
    const currentValue = selectedOption.value
    
    if (multiselect) {
      const currentArray = Array.isArray(internalValue) ? internalValue : []
      const newValue = currentArray.includes(currentValue)
        ? currentArray.filter(v => v !== currentValue)
        : [...currentArray, currentValue]
      
      setInternalValue(newValue)
      onValueChange?.(newValue)
    } else {
      const newValue = currentValue === internalValue ? "" : currentValue
      setInternalValue(newValue)
      onValueChange?.(newValue)
      setOpen(false)
    }
  }

  const handleRemoveItem = (valueToRemove, e) => {
    e.stopPropagation()
    if (multiselect && Array.isArray(internalValue)) {
      const newValue = internalValue.filter(v => v !== valueToRemove)
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }
  }

  const getDisplayContent = () => {
    if (multiselect && Array.isArray(internalValue)) {
      if (internalValue.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>
      }
      
      const selectedOptions = options.filter(option => internalValue.includes(option.value))
      
      if (selectedOptions.length <= maxSelectedDisplay) {
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map(option => (
              <Badge key={option.value} variant="secondary" className="text-xs text-black bg-gray-200">
                {option.label}
                <button
                  onClick={(e) => handleRemoveItem(option.value, e)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  type="button"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )
      } else {
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.slice(0, maxSelectedDisplay).map(option => (
              <Badge key={option.value} variant="secondary" className="text-xs text-black bg-gray-200">
                {option.label}
                <button
                  onClick={(e) => handleRemoveItem(option.value, e)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  type="button"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              +{selectedOptions.length - maxSelectedDisplay} more
            </Badge>
          </div>
        )
      }
    } else {
      const selectedOption = options.find(option => option.value === internalValue)
      return selectedOption ? selectedOption.label : <span className="text-muted-foreground">{placeholder}</span>
    }
  }

  const isSelected = (optionValue) => {
    if (multiselect && Array.isArray(internalValue)) {
      return internalValue.includes(optionValue)
    }
    return internalValue === optionValue
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full max-w-[400px] justify-between text-left font-normal",
            multiselect ? "min-h-14 h-auto py-2" : "min-h-14 truncate",
            className
          )}
          disabled={disabled}
        >
          <div className="flex-1 overflow-hidden">
            {getDisplayContent()}
          </div>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[400px] max-w-[400px] p-2">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(selectedLabel) => handleSelect(selectedLabel)}
                  className="py-4"
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
