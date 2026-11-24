import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarEstadoCuentaApi } from '@/features/ventas/deudores/api/cuentas-corrientes-api'
import type { CuentaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { EstadoDeudaFiadoDetalle, VentaDetalle } from '@/features/ventas/types/historial'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'
import type { ResultadoApi } from '@/lib/cliente-http.types'

/** Lo ultimo que llego; se guarda con su clave para no mostrar la cuenta de otro fiado. */
interface CargaDeuda {
  clave: string
  resultado: ResultadoApi<CuentaDeudor>
}

/**
 * Lo pagado y lo que falta de un fiado pendiente con deudor, para el detalle del Historial. Ni la lista ni el detalle
 * de la venta lo traen (el detalle de un fiado muestra `pagos` vacio aunque ya tenga cobros): sale de la ficha del
 * deudor (GET /api/cuentas-corrientes/:idDeudor). Devuelve null cuando la venta no es un fiado pendiente con deudor.
 */
export function useDeudaFiadoDetalle(venta: VentaDetalle | null) {
  const { cliente } = useSesion()
  const idDeudor = venta !== null && venta.estado === 'PENDIENTE_PAGO' ? (venta.deudor?.idDeudor ?? null) : null
  const idVenta = venta?.idVenta ?? null

  // --- ESTADOS ---
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [carga, setCarga] = useState<CargaDeuda | null>(null)
  const clave = `${idDeudor}|${idVenta}|${numeroReintento}`

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de otro fiado o de un reintento anterior
  useEffect(() => {
    if (idDeudor === null) return
    let vigente = true
    void consultarEstadoCuentaApi(cliente, idDeudor).then((resultado) => {
      if (vigente) setCarga({ clave, resultado })
    })
    return () => {
      vigente = false
    }
  }, [cliente, idDeudor, clave])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoDeudaFiadoDetalle | null => {
    if (idDeudor === null) return null
    if (carga === null || carga.clave !== clave) return { tipo: 'cargando' }
    if (!carga.resultado.exitoso) {
      return {
        tipo: 'error',
        mensaje: traducirErrorConsulta(carga.resultado.error, 'lo que falta pagar', 'ver las deudas'),
      }
    }
    const fiado = carga.resultado.datos.fiados.find((candidato) => candidato.idVenta === idVenta)
    // Un fiado pendiente siempre figura en la ficha; si no esta, otra persona lo acaba de cobrar por completo
    return fiado === undefined
      ? { tipo: 'fuera-de-la-cuenta' }
      : { tipo: 'listo', montoPagado: fiado.montoPagado, montoFaltante: fiado.montoFaltante }
  }

  return {
    deudaFiado: calcularEstado(),
    reintentar: () => setNumeroReintento((actual) => actual + 1),
  }
}
