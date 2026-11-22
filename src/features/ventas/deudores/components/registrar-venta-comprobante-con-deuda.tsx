import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { BotonNuevaVenta } from '@/features/ventas/components/boton-nueva-venta'
import { EncabezadoExitoVenta } from '@/features/ventas/components/encabezado-exito-venta'
import { TarjetaComprobanteConDeuda } from '@/features/ventas/deudores/components/tarjeta-comprobante-con-deuda'
import type { RegistrarVentaComprobanteConDeudaProps } from '@/features/ventas/deudores/types/comprobante-con-deuda'

/**
 * Seccion 3 de Registrar Venta cuando la venta quedo con deuda. Igual que el comprobante de siempre, pero sin
 * Editar: editar o anular una venta con pago parcial todavia no esta definido.
 */
export function RegistrarVentaComprobanteConDeuda({
  comprobante,
  enlaceWhatsApp,
  enlaceMail,
  onNuevaVenta,
}: RegistrarVentaComprobanteConDeudaProps) {
  return (
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- ENCABEZADO DE EXITO --- */}
      <EncabezadoExitoVenta
        estado="pendiente-pago"
        titulo={comprobante.tipoDeuda === 'TOTAL' ? 'Fiado registrado' : 'Venta registrada con deuda'}
      />

      {/* --- ACCIONES (MOBILE) --- */}
      {/* Arriba: enviar el comprobante es lo primero que se hace apenas se registra */}
      <div className="flex max-w-lg gap-2 xl:hidden">
        <BotonesEnvioComprobante enlaceWhatsApp={enlaceWhatsApp} enlaceMail={enlaceMail} variante="compacta" />
      </div>

      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* --- COMPROBANTE --- */}
        <TarjetaComprobanteConDeuda comprobante={comprobante} />

        {/* --- ACCIONES (ESCRITORIO) --- */}
        <Card className="hidden gap-bloque p-contorno xl:sticky xl:top-0 xl:flex">
          <div className="flex flex-col gap-interno">
            <BotonesEnvioComprobante enlaceWhatsApp={enlaceWhatsApp} enlaceMail={enlaceMail} variante="completa" />
          </div>
          <Separator />
          <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full" />
        </Card>
      </div>

      {/* --- FOOTER NUEVA VENTA (MOBILE) --- */}
      <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno border-t bg-fondo-tarjeta p-contorno xl:hidden">
        <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full" />
      </footer>
    </section>
  )
}
