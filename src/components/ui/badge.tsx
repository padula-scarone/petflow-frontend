import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-foco focus-visible:ring-[3px] focus-visible:ring-foco/50 aria-invalid:border-peligro aria-invalid:ring-peligro/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primario text-texto-sobre-primario [a&]:hover:bg-primario/90",
        secondary:
          "bg-fondo-secundario text-texto-sobre-secundario [a&]:hover:bg-fondo-secundario/90",
        destructive:
          "bg-peligro text-white focus-visible:ring-peligro/20 [a&]:hover:bg-peligro/90",
        outline:
          "border-borde text-texto-principal [a&]:hover:bg-fondo-hover [a&]:hover:text-texto-principal",
        ghost: "[a&]:hover:bg-fondo-hover [a&]:hover:text-texto-principal",
        link: "text-primario underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
