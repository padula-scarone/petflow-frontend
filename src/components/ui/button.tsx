import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-mediano text-cuerpo font-medium whitespace-nowrap transition-all outline-none focus-visible:border-foco focus-visible:ring-[3px] focus-visible:ring-foco/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-peligro aria-invalid:ring-peligro/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primario text-texto-sobre-primario hover:bg-primario/90",
        exito:
          "bg-exito text-texto-sobre-exito hover:bg-exito-hover",
        destructive:
          "bg-peligro text-white hover:bg-peligro/90 focus-visible:ring-peligro/20",
        outline:
          "border bg-fondo-pagina shadow-xs hover:bg-fondo-hover hover:text-texto-principal",
        secondary:
          "bg-fondo-secundario text-texto-sobre-secundario hover:bg-fondo-hover",
        ghost:
          "hover:bg-fondo-hover hover:text-texto-principal",
        link: "text-primario underline-offset-4 hover:underline",
      },
      size: {
        // Solo hay dos alturas: control (todo lo que se toca) y accion (la accion principal de la pantalla)
        default: "h-control px-4 has-[>svg]:px-3",
        lg: "h-accion px-6 text-accion font-bold has-[>svg]:px-4",
        icon: "size-control",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
