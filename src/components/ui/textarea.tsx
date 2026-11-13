import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full min-w-0 resize-none rounded-mediano border border-borde-campo bg-fondo-tarjeta px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-texto-suave focus-visible:border-foco focus-visible:ring-[3px] focus-visible:ring-foco/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peligro aria-invalid:ring-peligro/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
