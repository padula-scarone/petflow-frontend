import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { EncabezadoExitoVenta } from '@/features/ventas/components/encabezado-exito-venta'
import { TarjetaReciboCobroDeudor } from '@/features/ventas/deudores/components/recibo-cobro-deudor'
import type { ReciboCobroDeudor } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props de la pantalla que sigue a un cobro exitoso. */
interface ComprobanteCobroDeudorProps {
  recibo: ReciboCobroDeudor
  onVolverALaFicha: () => void
}

/** Boton para volver a la ficha del deudor, ya con la cuenta actualizada. */
function BotonVolverALaFicha({ onVolverALaFicha }: Pick<ComprobanteCobroDeudorProps, 'onVolverALaFicha'>) {
  return (
    <Button type="button" variant="outline" className="w-full bg-fondo-tarjeta" onClick={onVolverALaFicha}>
      <ArrowLeft aria-hidden="true" />
      Volver a la ficha
    </Button>
  )
}

/**
 * Cobro registrado. Misma forma que el comprobante de Registrar Venta: el recibo a la izquierda y el envio por
 * WhatsApp o mail a la derecha (en mobile, arriba).
 */
export function ComprobanteCobroDeudor({ recibo, onVolverALaFicha }: ComprobanteCobroDeudorProps) {
  return (
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- ENCABEZADO DE EXITO --- */}
      <EncabezadoExitoVenta estado="completada" titulo="Cobro registrado" />

      {/* --- ACCIONES (MOBILE) --- */}
      {/* Arriba: enviar el recibo es lo primero que se hace apenas se cobra */}
      <div className="flex max-w-lg gap-2 xl:hidden">
        <BotonesEnvioComprobante enlaceWhatsApp={recibo.enlaceWhatsApp} enlaceMail={recibo.enlaceMail} variante="compacta" />
      </div>

      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* --- RECIBO --- */}
        <TarjetaReciboCobroDeudor recibo={recibo} />

        {/* --- ACCIONES (ESCRITORIO) --- */}
        <Card className="hidden gap-bloque p-contorno xl:sticky xl:top-0 xl:flex">
          <div className="flex flex-col gap-interno">
            <BotonesEnvioComprobante enlaceWhatsApp={recibo.enlaceWhatsApp} enlaceMail={recibo.enlaceMail} variante="completa" />
          </div>
          <Separator />
          <BotonVolverALaFicha onVolverALaFicha={onVolverALaFicha} />
        </Card>
      </div>

      {/* --- FOOTER VOLVER (MOBILE) --- */}
      <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno border-t bg-fondo-tarjeta p-contorno xl:hidden">
        <BotonVolverALaFicha onVolverALaFicha={onVolverALaFicha} />
      </footer>
    </section>
  )
}
