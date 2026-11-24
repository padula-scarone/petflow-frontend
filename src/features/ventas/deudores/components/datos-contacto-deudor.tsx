import { cn } from '@/lib/utils'

/** Props del DNI y, si corresponde, el telefono de un deudor. */
interface DatosContactoDeudorProps {
  dni: string
  /**
   * El telefono solo se pasa donde se ve a una sola persona (la ficha y el comprobante). Las listas y la busqueda de
   * Registrar Venta lo omiten: muestran a varios deudores a la vez, en una pantalla que ve quien esta en el mostrador.
   */
  telefono?: string
  /**
   * Verdadero (por defecto): el componente mide su propia caja, que tiene que ser de ancho definido (un bloque o un
   * elemento que crece). Falso: mide el contenedor de arriba, que el uso marca con `@container`; sirve cuando el
   * componente esta en una fila y su ancho depende de su contenido. Solo importa si hay telefono.
   */
  contenedorPropio?: boolean
  /** Tamano y color del texto. */
  className?: string
}

/**
 * El DNI de un deudor y, debajo, su telefono si se pasa: "DNI: 25999000" y "Teléfono: +54 9 11 6000-1010". Si la caja
 * es angosta (menos de 15 rem: no entra "Teléfono: " con un numero largo) el telefono dice "Tel.:". Quien lee con un
 * lector de pantalla oye siempre "Teléfono".
 */
export function DatosContactoDeudor({ dni, telefono, contenedorPropio = true, className }: DatosContactoDeudorProps) {
  return (
    <div className={cn(telefono !== undefined && contenedorPropio && '@container', className)}>
      <p className="tabular-nums">DNI: {dni}</p>
      {telefono !== undefined && (
        <p className="tabular-nums">
          <span className="@max-[15rem]:sr-only">Teléfono</span>
          <span aria-hidden="true" className="hidden @max-[15rem]:inline">
            Tel.
          </span>
          : {telefono}
        </p>
      )}
    </div>
  )
}
