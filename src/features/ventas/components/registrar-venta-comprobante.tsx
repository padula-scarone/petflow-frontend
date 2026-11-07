import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AccionesComprobante } from '@/features/ventas/components/acciones-comprobante'
import { BotonNuevaVenta } from '@/features/ventas/components/boton-nueva-venta'
import { EncabezadoExitoVenta } from '@/features/ventas/components/encabezado-exito-venta'
import { TarjetaComprobante } from '@/features/ventas/components/tarjeta-comprobante'
import type { RegistrarVentaComprobanteProps } from '@/features/ventas/types/comprobante'

export function RegistrarVentaComprobante({
  comprobante,
  enlaceWhatsApp,
  enlaceMail,
  edicionDisponible,
  fechaHoraLimiteEdicion,
  onEditarVenta,
  onNuevaVenta,
}: RegistrarVentaComprobanteProps) {
  const propiedadesAcciones = {
    enlaceWhatsApp,
    enlaceMail,
    edicionDisponible,
    fechaHoraLimiteEdicion,
    onEditarVenta,
  }

  return (
    <section className="flex flex-col gap-6">
      {/* --- ENCABEZADO DE EXITO --- */}
      <EncabezadoExitoVenta estado={comprobante.estado} />

      {/* --- ACCIONES (MOBILE) --- */}
      {/* Arriba: enviar el comprobante es lo primero que se hace apenas se cobra */}
      <div className="lg:hidden">
        <AccionesComprobante {...propiedadesAcciones} variante="compacta" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* --- COMPROBANTE --- */}
        <TarjetaComprobante comprobante={comprobante} />

        {/* --- ACCIONES (ESCRITORIO) --- */}
        <Card className="hidden gap-4 p-4 shadow-none lg:sticky lg:top-0 lg:flex">
          <AccionesComprobante {...propiedadesAcciones} variante="completa" />
          <Separator />
          <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full" />
        </Card>
      </div>

      {/* --- FOOTER NUEVA VENTA (MOBILE) --- */}
      {/* Mismo patron que las secciones anteriores: pegado al borde inferior del area con scroll */}
      <footer className="sticky -bottom-4 z-10 -mx-4 -mb-4 border-t bg-fondo-tarjeta p-4 lg:hidden">
        <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full" />
      </footer>
    </section>
  )
}
