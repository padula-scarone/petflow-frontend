import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      // Color solido y sin transparencia (token esqueleto): el pulso anima solo la opacidad. Un color con alfa (color-mix) dentro
      // de una capa animada se repintaba en amarillo en algunos Edge. forced-color-adjust evita que un tema de
      // contraste de Windows le cambie el color.
      className={cn("animate-pulso-suave rounded-mediano bg-esqueleto [forced-color-adjust:none]", className)}
      {...props}
    />
  )
}

export { Skeleton }
