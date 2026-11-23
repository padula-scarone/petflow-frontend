import { useRef, useState } from 'react'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { cobrarFiadosApiEjemplo } from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import type {
  ErrorCobroDeudor,
  FilaFiadoSeleccionable,
  ReciboCobroDeudor,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import { armarPagosComprobanteConDeuda } from '@/features/ventas/deudores/utils/armar-pagos-comprobante-con-deuda'
import {
  construirEnlaceMailConTexto,
  construirEnlaceWhatsAppConTexto,
  construirTextoReciboCobro,
} from '@/features/ventas/deudores/utils/construir-enlaces-deudores'
import { useCobroVenta } from '@/features/ventas/hooks/use-cobro-venta'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'
import { convertirCentavosAPesos, convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

/** El doble toque se bloquea con un ref en este hook, asi que el cobro nunca ve un envio en curso. */
const ESTADO_ENVIO_INACTIVO: EstadoEnvioVenta = { fase: 'inactivo' }

const MENSAJE_COBRO_FALLIDO = 'No pudimos registrar el cobro. No se cobró ningún fiado: intentá de nuevo.'

/** Lo que necesita el cobro de los fiados tildados. */
interface OpcionesCobroDeudor {
  deudor: Deudor
  /** Solo los fiados tildados, cada uno con el monto que se cobra de el. */
  filasACobrar: FilaFiadoSeleccionable[]
  /** Medios de pago activos, ya cargados. */
  medios: MedioPago[]
  estadoMediosPago: EstadoCargaRecurso
  onReintentarMediosPago: () => void
  /** El cobro se aplico: la seleccion de fiados ya no corresponde a la cuenta. */
  alCobrar: () => void
}

/**
 * Cobro de uno o varios fiados de un deudor. Reutiliza los calculos en centavos del cobro de Registrar Venta (medios,
 * recargos y descuentos, efectivo con vuelto, pago mixto) sin descuento manual ni fiado: el SSOT no los admite al
 * cobrar. Es todo o nada: si el servidor rechaza uno, no se cobra ninguno. El cobro es de ejemplo hasta que el back
 * tenga el endpoint de cobro por deudor.
 */
export function useCobroDeudorEjemplo({
  deudor,
  filasACobrar,
  medios,
  estadoMediosPago,
  onReintentarMediosPago,
  alCobrar,
}: OpcionesCobroDeudor) {
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorCobroDeudor | null>(null)
  const [recibo, setRecibo] = useState<ReciboCobroDeudor | null>(null)
  const envioBloqueadoRef = useRef(false)

  // --- CALCULOS ---
  const totalACobrarCentavos = filasACobrar.reduce(
    (acumulado, fila) => acumulado + convertirPesosACentavos(fila.montoACobrar ?? 0),
    0,
  )
  // Reutiliza el cobro de Registrar Venta: la pantalla de cobro no muestra descuento manual ni la opcion de fiado
  const cobro = useCobroVenta({
    subtotalCentavos: totalACobrarCentavos,
    medios,
    estadoMediosPago,
    onReintentarMediosPago,
    estadoEnvio: ESTADO_ENVIO_INACTIVO,
  })

  // --- ACCIONES ---
  const confirmarCobro = async () => {
    if (envioBloqueadoRef.current || !cobro.propiedadesCobro.estadoCobro.puedeConfirmar) return
    envioBloqueadoRef.current = true
    setEnviando(true)
    setError(null)

    try {
      const resultado = await cobrarFiadosApiEjemplo(
        deudor.idDeudor,
        filasACobrar.map((fila) => ({
          idVenta: fila.fiado.idVenta,
          montoCentavos: convertirPesosACentavos(fila.montoACobrar ?? 0),
        })),
      )
      if (resultado.tipo === 'rechazado') {
        setError(resultado.error)
        return
      }

      const pagos = armarPagosComprobanteConDeuda(cobro.datosCobro.pagos, medios)
      const vuelto = pagos.reduce((suma, pago) => suma + (pago.admiteVuelto ? (pago.vuelto ?? 0) : 0), 0)
      const datosRecibo = {
        idCobro: resultado.idCobro,
        numeroRecibo: resultado.numeroRecibo,
        fechaHora: resultado.fechaHora,
        deudor,
        nombreVendedor: usuario.nombre,
        fiadosAbonados: resultado.fiadosAbonados,
        pagos,
        montoAbonado: convertirCentavosAPesos(totalACobrarCentavos),
        montoTotalCobrado: pagos.reduce((suma, pago) => suma + pago.montoFinal, 0),
        vuelto: vuelto > 0 ? vuelto : null,
        saldoRestanteDeudor: convertirCentavosAPesos(resultado.saldoRestanteCentavos),
      }
      const texto = construirTextoReciboCobro(datosRecibo)
      setRecibo({
        ...datosRecibo,
        enlaceWhatsApp: construirEnlaceWhatsAppConTexto(texto),
        enlaceMail: construirEnlaceMailConTexto(`PetFlow - Recibo ${datosRecibo.numeroRecibo}`, texto),
      })
      alCobrar()
    } catch {
      setError({ estadoHttp: null, motivo: 'DESCONOCIDO', mensaje: MENSAJE_COBRO_FALLIDO, reintentable: true })
    } finally {
      envioBloqueadoRef.current = false
      setEnviando(false)
    }
  }

  return {
    propiedadesCobro: cobro.propiedadesCobro,
    totalACobrar: convertirCentavosAPesos(totalACobrarCentavos),
    enviando,
    error,
    recibo,
    confirmarCobro,
  }
}
