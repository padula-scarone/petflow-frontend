import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

/** Casilla de dos estados. Se usa dentro de un label o una fila de al menos 44 px de alto para que sea facil de tocar. */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-chico border border-borde-campo bg-fondo-pagina outline-none transition-colors focus-visible:border-foco focus-visible:ring-[3px] focus-visible:ring-foco/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peligro aria-invalid:ring-peligro/20 data-[state=checked]:border-texto-principal data-[state=checked]:bg-texto-principal data-[state=checked]:text-fondo-pagina motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon aria-hidden="true" className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
