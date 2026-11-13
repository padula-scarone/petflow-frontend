import * as React from "react"
import { DayFlag, DayPicker, SelectionState, UI } from "react-day-picker"
import { es } from "react-day-picker/locale"
import { cn } from "@/lib/utils"

/** Calendario de react-day-picker con los tokens del proyecto: dias de 44 px, semana desde el lunes. */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      data-slot="calendar"
      locale={es}
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={{
        [UI.Root]: "relative w-fit",
        [UI.Months]: "relative flex flex-col gap-4",
        [UI.Month]: "flex flex-col gap-1",
        [UI.MonthCaption]: "flex h-11 items-center justify-center px-12",
        [UI.CaptionLabel]: "text-sm font-bold capitalize",
        [UI.Nav]: "absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between",
        [UI.PreviousMonthButton]:
          "flex size-11 items-center justify-center rounded-mediano outline-none hover:bg-fondo-hover focus-visible:ring-[3px] focus-visible:ring-foco/50",
        [UI.NextMonthButton]:
          "flex size-11 items-center justify-center rounded-mediano outline-none hover:bg-fondo-hover focus-visible:ring-[3px] focus-visible:ring-foco/50",
        [UI.Chevron]: "size-4 fill-current",
        [UI.MonthGrid]: "w-full border-collapse",
        [UI.Weekdays]: "flex",
        [UI.Weekday]: "flex size-11 items-center justify-center text-xs font-medium text-texto-suave capitalize",
        [UI.Week]: "flex",
        [UI.Day]: "size-11 p-0 text-center text-sm",
        [UI.DayButton]:
          "size-11 rounded-mediano tabular-nums outline-none hover:bg-fondo-hover focus-visible:ring-[3px] focus-visible:ring-foco/50",
        [SelectionState.range_start]: "rounded-l-mediano bg-primario",
        [SelectionState.range_middle]: "bg-fondo-seleccion",
        [SelectionState.range_end]: "rounded-r-mediano bg-primario",
        [SelectionState.selected]: "font-bold",
        [DayFlag.today]: "font-bold underline underline-offset-4",
        [DayFlag.outside]: "text-texto-suave opacity-60",
        [DayFlag.disabled]: "opacity-40",
        [DayFlag.hidden]: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
