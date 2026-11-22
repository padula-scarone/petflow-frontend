import { DialogoCobroDeudor } from '@/features/ventas/deudores/components/dialogo-cobro-deudor'
import { useCobroDeudorEjemplo } from '@/features/ventas/deudores/hooks/use-cobro-deudor-ejemplo'
import type { FilaFiadoSeleccionable } from '@/features/ventas/deudores/types/cobro-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import type { MedioPago } from '@/features/ventas/types/cobro'

// Lista vacia estable: asi un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_MEDIOS: MedioPago[] = []

/** Props del contenedor del cobro de fiados. */
interface ContenedorCobroDeudorProps {
  deudor: Deudor
  filasACobrar: FilaFiadoSeleccionable[]
  /** El cobro se aplico: la seleccion de fiados ya no corresponde a la cuenta. */
  alCobrar: () => void
  onCerrar: () => void
}

/**
 * Conecta el dialogo de cobro con los medios de pago reales (que ya existen en el back) y con el cobro de ejemplo.
 * Se monta al abrirse y se desmonta al cerrarse, asi cada cobro arranca limpio.
 */
export function ContenedorCobroDeudor({ deudor, filasACobrar, alCobrar, onCerrar }: ContenedorCobroDeudorProps) {
  const mediosPago = useMediosPago()
  const cobro = useCobroDeudorEjemplo({
    deudor,
    filasACobrar,
    medios: mediosPago.datos ?? SIN_MEDIOS,
    estadoMediosPago: mediosPago.estado,
    onReintentarMediosPago: mediosPago.recargar,
    alCobrar,
  })

  return (
    <DialogoCobroDeudor
      deudor={deudor}
      filasACobrar={filasACobrar}
      totalACobrar={cobro.totalACobrar}
      propiedadesCobro={cobro.propiedadesCobro}
      enviando={cobro.enviando}
      error={cobro.error}
      recibo={cobro.recibo}
      onConfirmarCobro={() => void cobro.confirmarCobro()}
      onCerrar={onCerrar}
    />
  )
}
