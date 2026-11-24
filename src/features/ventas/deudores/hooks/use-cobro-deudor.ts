import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import {
  consultarCobroApi,
  consultarEstadoCuentaApi,
  registrarCobroApi,
} from '@/features/ventas/deudores/api/cuentas-corrientes-api'
import {
  MENSAJE_COBRO_APLICADO_SIN_RECIBO,
  MENSAJE_COBRO_INCIERTO,
} from '@/features/ventas/deudores/config/mensajes-deudores'
import type {
  CobroDeudorRegistrado,
  ErrorCobroDeudor,
  FilaFiadoSeleccionable,
  ReciboCobroDeudor,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { RegistrarCobroRequest } from '@/features/ventas/deudores/types/api-deudores'
import { armarReciboCobroDeudor, completarCobroConsultado } from '@/features/ventas/deudores/utils/armar-recibo-cobro-deudor'
import { traducirErrorCobro } from '@/features/ventas/deudores/utils/traducir-error-deudores'
import { verificarCobroEnFicha } from '@/features/ventas/deudores/utils/verificar-resultado-deuda'
import { useCobroVenta } from '@/features/ventas/hooks/use-cobro-venta'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'
import { convertirCentavosAPesos, convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

/** El doble toque se bloquea con un ref en este hook, asi que el cobro nunca ve un envio en curso. */
const ESTADO_ENVIO_INACTIVO: EstadoEnvioVenta = { fase: 'inactivo' }

/** Lo que necesita el cobro de los fiados tildados. */
interface OpcionesCobroDeudor {
  deudor: Deudor
  /** Solo los fiados tildados, cada uno con el monto que se cobra de el. */
  filasACobrar: FilaFiadoSeleccionable[]
  /** Medios de pago activos, ya cargados. */
  medios: MedioPago[]
  estadoMediosPago: EstadoCargaRecurso
  onReintentarMediosPago: () => void
  /** El cobro se aplico: la seleccion de fiados ya no corresponde a la cuenta y hay que volver a pedirla. */
  alCobrar: () => void
  /** Un rechazo dice que la cuenta cambio (un fiado ya no esta pendiente, o el monto no entra): hay que volver a pedirla. */
  alCambiarLaCuenta: () => void
}

/**
 * Cobro de uno o varios fiados de un deudor (POST /api/cuentas-corrientes/:idDeudor/cobros). Reutiliza los calculos
 * en centavos del cobro de Registrar Venta (medios, recargos y descuentos, efectivo con vuelto, pago mixto) sin
 * descuento manual ni fiado. Es todo o nada: si el servidor rechaza uno, no se cobra ninguno.
 *
 * El cobro no tiene clave de idempotencia: si no hay respuesta util NO se reenvia a ciegas. Se mira la ficha del
 * deudor: si el cobro se aplico, se muestra su recibo; si no, se puede reintentar; si no se puede saber, se pide
 * revisar la cuenta antes de volver a confirmar.
 */
export function useCobroDeudor({
  deudor,
  filasACobrar,
  medios,
  estadoMediosPago,
  onReintentarMediosPago,
  alCobrar,
  alCambiarLaCuenta,
}: OpcionesCobroDeudor) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorCobroDeudor | null>(null)
  const [recibo, setRecibo] = useState<ReciboCobroDeudor | null>(null)
  // Un ref y no un estado: un segundo toque puede llegar antes del siguiente render
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
  const mostrarRecibo = (cobroRegistrado: CobroDeudorRegistrado, deudorDelRecibo: Deudor, nombreVendedor: string) => {
    setRecibo(armarReciboCobroDeudor(cobroRegistrado, deudorDelRecibo, nombreVendedor))
    alCobrar()
  }

  /** Despues de un resultado incierto: mira la ficha y decide si el cobro se aplico, no se aplico o no se sabe. */
  const resolverResultadoIncierto = async (cuerpo: RegistrarCobroRequest, enviadoEnMilisegundos: number) => {
    const cuenta = await consultarEstadoCuentaApi(cliente, deudor.idDeudor)
    const verificacion = cuenta.exitoso
      ? verificarCobroEnFicha(
          cuenta.datos,
          cuerpo.fiados.map((fiado) => ({ idVenta: fiado.idVenta, monto: fiado.monto })),
          enviadoEnMilisegundos,
        )
      : { tipo: 'indeterminado' as const }

    if (cuenta.exitoso && verificacion.tipo === 'no-aplicado') {
      // La ficha muestra que no se cobro: es seguro volver a confirmar
      setError({
        estadoHttp: null,
        motivo: 'DESCONOCIDO',
        mensaje: 'No pudimos registrar el cobro. No se cobró nada: intentá de nuevo.',
        reintentable: true,
        refrescarFicha: false,
      })
      return
    }

    if (cuenta.exitoso && verificacion.tipo === 'aplicado') {
      const consultado = await consultarCobroApi(cliente, verificacion.idCobroDeudor, medios)
      if (consultado.exitoso) {
        mostrarRecibo(completarCobroConsultado(consultado.datos, cuenta.datos), cuenta.datos.deudor, usuario.nombre)
        return
      }
      // Se cobro, pero sin el recibo no hay nada que mostrar: se manda a la cuenta
      alCobrar()
      setError({
        estadoHttp: null,
        motivo: 'RESULTADO_INCIERTO',
        mensaje: MENSAJE_COBRO_APLICADO_SIN_RECIBO,
        reintentable: false,
        refrescarFicha: true,
      })
      return
    }

    // No se puede saber: no se reenvia a ciegas
    alCambiarLaCuenta()
    setError({
      estadoHttp: null,
      motivo: 'RESULTADO_INCIERTO',
      mensaje: MENSAJE_COBRO_INCIERTO,
      reintentable: false,
      refrescarFicha: true,
    })
  }

  const confirmarCobro = async () => {
    if (envioBloqueadoRef.current || !cobro.propiedadesCobro.estadoCobro.puedeConfirmar) return
    envioBloqueadoRef.current = true
    setEnviando(true)
    setError(null)

    const cuerpo: RegistrarCobroRequest = {
      fiados: filasACobrar.map((fila) => ({
        idVenta: fila.fiado.idVenta,
        monto: convertirCentavosAPesos(convertirPesosACentavos(fila.montoACobrar ?? 0)),
      })),
      // monto es la porcion BASE de cada medio; montoRecibido solo existe en efectivo
      pagos: cobro.datosCobro.pagos.map((pago) => ({
        idMedioPago: pago.idMedioPago,
        monto: convertirCentavosAPesos(pago.montoBaseCentavos),
        ...(pago.montoRecibidoCentavos !== null && { montoRecibido: convertirCentavosAPesos(pago.montoRecibidoCentavos) }),
      })),
    }
    const enviadoEnMilisegundos = Date.now()

    try {
      const resultado = await registrarCobroApi(cliente, deudor.idDeudor, cuerpo, medios)
      if (resultado.exitoso) {
        mostrarRecibo(resultado.datos, deudor, usuario.nombre)
        return
      }

      const traduccion = traducirErrorCobro(resultado.error)
      if (traduccion.tipo === 'rechazado') {
        setError(traduccion.error)
        if (traduccion.error.refrescarFicha) alCambiarLaCuenta()
        return
      }
      await resolverResultadoIncierto(cuerpo, enviadoEnMilisegundos)
    } finally {
      // Una vez cobrado, el recibo reemplaza a la pantalla: no hay un segundo envio posible
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
