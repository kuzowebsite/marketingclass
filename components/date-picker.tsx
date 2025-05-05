"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onUpdate: (start: Date | undefined, end: Date | undefined) => void
}

export function DatePicker({ startDate, endDate, onUpdate }: DatePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  })

  React.useEffect(() => {
    if (startDate !== date?.from || endDate !== date?.to) {
      setDate({
        from: startDate,
        to: endDate,
      })
    }
  }, [startDate, endDate])

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onUpdate(range?.from, range?.to)
  }

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Огноо сонгох</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
