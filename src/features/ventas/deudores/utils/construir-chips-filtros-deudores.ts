import type { FiltrosDeudores, OpcionProximoPago } from '@/features/ventas/deudores/types/cuenta-corriente'
import { describirOpcionProximoPago } from '@/features/ventas/deudores/utils/describir-proximo-pago-filtro'
import type { ChipFiltro } from '@/features/ventas/types/compartidos'

/**
 * Arma los chips de los filtros de Deudores que no estan a la vista, con la misma regla que Historial y Devoluciones.
 * Escritorio: ninguno, el proximo pago se ve en la barra. Mobile: el proximo pago, porque esta en la hoja cerrada.
 * El buscador de nombre o DNI y el orden nunca llevan chip: uno esta siempre a la vista y el otro no filtra.
 */
export function construirChipsFiltrosDeudores(
  filtros: FiltrosDeudores,
  onCambiarProximoPago: (proximoPago: OpcionProximoPago | null) => void,
): ChipFiltro[] {
  if (filtros.proximoPago === null) return []
  return [
    {
      clave: 'proximo-pago',
      etiqueta: describirOpcionProximoPago(filtros.proximoPago),
      descripcion: 'el próximo pago',
      onQuitar: () => onCambiarProximoPago(null),
    },
  ]
}
