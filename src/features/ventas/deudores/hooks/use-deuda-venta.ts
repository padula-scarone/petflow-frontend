import { useState } from 'react'
import { MENSAJE_GUARDADO_DEUDOR_FALLIDO } from '@/features/ventas/deudores/config/mensajes-deudores'
import { useBuscarDeudores } from '@/features/ventas/deudores/hooks/use-buscar-deudores'
import { useGuardarDeudor } from '@/features/ventas/deudores/hooks/use-guardar-deudor'
import type { DatosDeudor, Deudor, EstadoGuardadoDeudor } from '@/features/ventas/deudores/types/deudor'
import type { FechaEstimadaPago } from '@/features/ventas/deudores/types/pago-con-deuda'

/**
 * La parte "Deuda" de una venta: a quien se le debe, para cuando y la busqueda o el alta de ese deudor. Lo elegido
 * se conserva aunque el bloque desaparezca (por ejemplo si el vendedor cubre el total y despues lo vuelve a bajar),
 * pero solo viaja con la venta mientras quede una deuda.
 */
export function useDeudaVenta() {
  const busqueda = useBuscarDeudores()
  const { crear } = useGuardarDeudor()

  // --- ESTADOS ---
  const [deudorElegido, setDeudorElegido] = useState<Deudor | null>(null)
  const [fechaEstimada, setFechaEstimada] = useState<FechaEstimadaPago | null>(null)
  const [avisoDniExistente, setAvisoDniExistente] = useState(false)

  // --- ACCIONES ---
  const seleccionarDeudor = (deudor: Deudor) => {
    setDeudorElegido(deudor)
    setAvisoDniExistente(false)
    busqueda.limpiar()
  }

  const cambiarDeudor = () => {
    setDeudorElegido(null)
    setAvisoDniExistente(false)
  }

  /** Da de alta un deudor; si el DNI ya existia (409), selecciona a esa persona y avisa. */
  const crearDeudor = async (datos: DatosDeudor): Promise<EstadoGuardadoDeudor> => {
    try {
      const resultado = await crear(datos)
      if (resultado.fase === 'guardado') {
        // Uno nuevo tiene que poder aparecer en la proxima busqueda
        busqueda.olvidarResultados()
        seleccionarDeudor(resultado.deudor)
      }
      if (resultado.fase === 'dni-duplicado') {
        seleccionarDeudor(resultado.deudorExistente)
        setAvisoDniExistente(true)
      }
      return resultado
    } catch {
      return { fase: 'error', mensaje: MENSAJE_GUARDADO_DEUDOR_FALLIDO }
    }
  }

  const reiniciar = () => {
    setDeudorElegido(null)
    setFechaEstimada(null)
    setAvisoDniExistente(false)
    busqueda.limpiar()
  }

  return {
    deudorElegido,
    fechaEstimada,
    avisoDniExistente,
    textoBusqueda: busqueda.textoBusqueda,
    estadoBusqueda: busqueda.estadoBusqueda,
    buscar: busqueda.buscar,
    reintentarBusqueda: busqueda.reintentar,
    seleccionarDeudor,
    cambiarDeudor,
    crearDeudor,
    cambiarFechaEstimada: setFechaEstimada,
    reiniciar,
  }
}
