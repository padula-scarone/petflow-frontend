import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { CobroDeudor } from '@/features/ventas/deudores/components/cobro-deudor'
import { ComprobanteCobroDeudor } from '@/features/ventas/deudores/components/comprobante-cobro-deudor'
import { construirRutaFichaDeudor } from '@/features/ventas/deudores/config/rutas-deudores'
import { useCobroDeudorEjemplo } from '@/features/ventas/deudores/hooks/use-cobro-deudor-ejemplo'
import { useContextoFichaDeudor } from '@/features/ventas/deudores/hooks/use-contexto-ficha-deudor'
import type { FilaFiadoSeleccionable } from '@/features/ventas/deudores/types/cobro-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import type { MedioPago } from '@/features/ventas/types/cobro'

// Lista vacia estable: asi un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_MEDIOS: MedioPago[] = []

/** Ruta de Ventas > Deudores > un deudor > Cobro: cobra los fiados que se tildaron en la ficha. */
export function PaginaCobroDeudor() {
  const { idDeudor, ficha, seleccion } = useContextoFichaDeudor()
  // Se toma una foto al entrar: al cobrar, la cuenta se vuelve a pedir y la seleccion se limpia, pero el cobro (y su
  // recibo) siguen siendo los de lo que se eligio
  const [deudor] = useState<Deudor | null>(() =>
    ficha.estadoFicha.tipo === 'listo' ? ficha.estadoFicha.deudor : null,
  )
  const [filasACobrar] = useState(() =>
    seleccion.resumen.puedeCobrar ? seleccion.filas.filter((fila) => fila.seleccionado) : [],
  )

  // Acceso directo o recarga: sin fiados tildados (o con montos invalidos) no hay nada que cobrar
  if (deudor === null || filasACobrar.length === 0) {
    return <Navigate to={construirRutaFichaDeudor(idDeudor)} replace />
  }

  return <ContenidoCobroDeudor deudor={deudor} filasACobrar={filasACobrar} alCobrar={seleccion.limpiar} />
}

/** Props del contenido del cobro, ya con lo que se cobra. */
interface ContenidoCobroDeudorProps {
  deudor: Deudor
  filasACobrar: FilaFiadoSeleccionable[]
  alCobrar: () => void
}

/** Conecta el cobro con los medios de pago reales (que ya existen en el back) y con el cobro de ejemplo. */
function ContenidoCobroDeudor({ deudor, filasACobrar, alCobrar }: ContenidoCobroDeudorProps) {
  const navegar = useNavigate()
  const mediosPago = useMediosPago()
  const cobro = useCobroDeudorEjemplo({
    deudor,
    filasACobrar,
    medios: mediosPago.datos ?? SIN_MEDIOS,
    estadoMediosPago: mediosPago.estado,
    onReintentarMediosPago: mediosPago.recargar,
    // Despues de cobrar la cuenta cambia: lo tildado ya no corresponde
    alCobrar,
  })
  // replace: con el cobro hecho, "atras" no tiene que volver a esta pantalla
  const volverALaFicha = () => void navegar(construirRutaFichaDeudor(deudor.idDeudor), { replace: true })

  if (cobro.recibo) return <ComprobanteCobroDeudor recibo={cobro.recibo} onVolverALaFicha={volverALaFicha} />

  return (
    <CobroDeudor
      deudor={deudor}
      filasACobrar={filasACobrar}
      totalACobrar={cobro.totalACobrar}
      propiedadesCobro={cobro.propiedadesCobro}
      enviando={cobro.enviando}
      error={cobro.error}
      onConfirmarCobro={() => void cobro.confirmarCobro()}
      onVolverALaFicha={volverALaFicha}
    />
  )
}
