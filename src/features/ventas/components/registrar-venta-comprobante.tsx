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
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- ENCABEZADO DE EXITO --- */}
      <EncabezadoExitoVenta estado={comprobante.estado} />

      {/* --- ACCIONES (MOBILE) --- */}
      {/* Arriba: enviar el comprobante es lo primero que se hace apenas se cobra */}
      <div className="max-w-lg xl:hidden">
        <AccionesComprobante {...propiedadesAcciones} variante="compacta" />
      </div>

      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* --- COMPROBANTE --- */}
        <TarjetaComprobante comprobante={comprobante} />

        {/* --- ACCIONES (ESCRITORIO) --- */}
        <Card className="hidden gap-bloque p-contorno shadow-none xl:sticky xl:top-0 xl:flex">
          <AccionesComprobante {...propiedadesAcciones} variante="completa" />
          <Separator />
          <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full" />
        </Card>
      </div>

      {/* --- FOOTER NUEVA VENTA (MOBILE) --- */}
      {/* Mismo patron que las secciones anteriores: pegado al borde inferior del area con scroll */}
      <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno border-t bg-fondo-tarjeta p-contorno xl:hidden">
        <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full" />
      </footer>
    </section>
  )
}
