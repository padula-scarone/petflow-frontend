import {
  ETIQUETA_POR_MOTIVO_CAMBIO,
} from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'

/** Texto de un motivo ya guardado: la etiqueta, o "Otro: detalle" cuando se escribio uno. */
export function describirMotivoCambio(codigoMotivo: string, detalleMotivo: string | null) {
  return codigoMotivo === CODIGO_MOTIVO_OTRO && detalleMotivo
    ? `Otro: ${detalleMotivo}`
    : (ETIQUETA_POR_MOTIVO_CAMBIO[codigoMotivo] ?? codigoMotivo)
}
