import { Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Props de los botones que envian el comprobante por WhatsApp o mail. */
interface BotonesEnvioComprobanteProps {
  enlaceWhatsApp: string
  enlaceMail: string
  /** compacta: icono arriba y texto corto (mobile); completa: icono al costado y texto largo. */
  variante: 'compacta' | 'completa'
}

/** Los dos envios como enlaces nativos, para que el navegador no los bloquee. */
export function BotonesEnvioComprobante({
  enlaceWhatsApp,
  enlaceMail,
  variante,
}: BotonesEnvioComprobanteProps) {
  const compacta = variante === 'compacta'
  const claseBoton = cn(
    'bg-fondo-tarjeta',
    compacta ? 'h-16 min-w-0 flex-1 flex-col gap-1 px-2 text-xs' : 'h-11 w-full justify-start gap-3 px-4',
  )

  return (
    <>
      <Button asChild variant="outline" className={claseBoton}>
        <a href={enlaceWhatsApp} target="_blank" rel="noopener noreferrer">
          <MessageCircle />
          {compacta ? 'WhatsApp' : 'Enviar por WhatsApp'}
        </a>
      </Button>
      <Button asChild variant="outline" className={claseBoton}>
        <a href={enlaceMail}>
          <Mail />
          {compacta ? 'Mail' : 'Enviar por mail'}
        </a>
      </Button>
    </>
  )
}
