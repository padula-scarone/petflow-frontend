import { describirPresentacion } from '@/features/ventas/utils/describir-presentacion'
import type { FormatoVenta } from '@/features/ventas/types/historial'
import type { FormatoArticulo } from '@/features/ventas/types/venta'

/** Props del nombre de un producto con su presentacion. */
interface NombreProductoProps {
  nombre: string
  /** Si falta (un dato que no la trae) se muestra solo el nombre. */
  formato?: FormatoArticulo | FormatoVenta
}

/**
 * El nombre de un producto seguido de su presentacion, "Alimento perro 3kg | Unidad": siempre que se muestra un
 * producto se ve si se vende por unidad o a granel, porque el nombre no lo dice. Va dentro del elemento de texto
 * de quien lo usa, que decide el peso y el corte de linea; la presentacion queda sin negrita.
 */
export function NombreProducto({ nombre, formato }: NombreProductoProps) {
  return (
    <>
      {nombre}
      {formato && <span className="font-normal whitespace-nowrap"> | {describirPresentacion(formato)}</span>}
    </>
  )
}
