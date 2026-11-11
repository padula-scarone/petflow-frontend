import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-mediano text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-fondo-hover hover:text-texto-principal focus-visible:border-foco focus-visible:ring-[3px] focus-visible:ring-foco/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-peligro aria-invalid:ring-peligro/20 data-[state=on]:bg-fondo-seleccion data-[state=on]:hover:bg-fondo-seleccion data-[state=on]:text-texto-principal [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-borde-campo bg-transparent shadow-xs hover:bg-fondo-hover hover:text-texto-principal",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
