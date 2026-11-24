import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { cn } from '@/lib/utils'

/** Props de las acciones sobre el comprobante. */
interface AccionesComprobanteProps {
  enlaceWhatsApp: string
  enlaceMail: string
  /** compacta: botones en fila con el icono arriba (mobile); completa: apilados (escritorio). */
  variante: 'compacta' | 'completa'
}

/** Envio del comprobante por WhatsApp o Mail. Una venta registrada no se edita: solo se anula desde el Historial. */
export function AccionesComprobante({ enlaceWhatsApp, enlaceMail, variante }: AccionesComprobanteProps) {
  const compacta = variante === 'compacta'

  return (
    <div className={cn('flex gap-2', !compacta && 'flex-col gap-interno')}>
      {/* --- ENVIOS: ENLACES NATIVOS, PARA QUE EL NAVEGADOR NO LOS BLOQUEE --- */}
      <BotonesEnvioComprobante enlaceWhatsApp={enlaceWhatsApp} enlaceMail={enlaceMail} variante={variante} />
    </div>
  )
}
