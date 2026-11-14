import { listarMediosPagoApi } from '@/features/ventas/api/listar-medios-pago-api'
import { useRecursoRemoto } from '@/features/ventas/hooks/use-recurso-remoto'

const DESCRIPCION_MEDIOS_PAGO = { recurso: 'los medios de pago', accion: 'ver los medios de pago' }

/** Medios de pago activos del back, ya traducidos a los del front (ajuste, icono y si admiten vuelto). */
export function useMediosPago() {
  return useRecursoRemoto(listarMediosPagoApi, DESCRIPCION_MEDIOS_PAGO)
}
