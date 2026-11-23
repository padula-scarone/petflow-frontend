import { cn } from '@/lib/utils'

/** Props del DNI y el telefono de un deudor. */
interface DatosContactoDeudorProps {
  dni: string
  telefono: string
  /**
   * Verdadero (por defecto): el componente mide su propia caja, que tiene que ser de ancho definido (un bloque o un
   * elemento que crece). Falso: mide el contenedor de arriba, que el uso marca con `@container`; sirve cuando el
   * componente esta en una fila y su ancho depende de su contenido.
   */
  contenedorPropio?: boolean
  /** Tamano y color del texto. */
  className?: string
}

/**
 * El DNI y el telefono de un deudor, siempre asi: "DNI: 25999000" y, debajo, "Teléfono: +54 9 11 6000-1010". Si la caja
 * es angosta (menos de 15 rem: no entra "Teléfono: " con un numero largo) el telefono dice "Tel.:". Quien lee con un
 * lector de pantalla oye siempre "Teléfono".
 */
export function DatosContactoDeudor({ dni, telefono, contenedorPropio = true, className }: DatosContactoDeudorProps) {
  return (
    <div className={cn(contenedorPropio && '@container', className)}>
      <p className="tabular-nums">DNI: {dni}</p>
      <p className="tabular-nums">
        <span className="@max-[15rem]:sr-only">Teléfono</span>
        <span aria-hidden="true" className="hidden @max-[15rem]:inline">
          Tel.
        </span>
        : {telefono}
      </p>
    </div>
  )
}
