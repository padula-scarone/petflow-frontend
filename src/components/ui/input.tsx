import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-mediano border border-borde-campo bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primario selection:text-texto-sobre-primario file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-texto-principal placeholder:text-texto-suave disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-foco focus-visible:ring-[3px] focus-visible:ring-foco/50",
        "aria-invalid:border-peligro aria-invalid:ring-peligro/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
