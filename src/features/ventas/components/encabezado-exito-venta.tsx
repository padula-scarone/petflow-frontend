import { CircleCheck, NotebookPen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comprobante } from '@/features/ventas/types/comprobante'

/** Props del encabezado que confirma que la venta quedo registrada. */
interface EncabezadoExitoVentaProps {
  estado: Comprobante['estado']
}

export function EncabezadoExitoVenta({ estado }: EncabezadoExitoVentaProps) {
  const cobrada = estado === 'completada'
  const Icono = cobrada ? CircleCheck : NotebookPen

  return (
    <header className="flex items-center gap-4">
      {/* Verde cuando entra dinero; morado en el fiado, igual que el boton de la Seccion 2 */}
      <span
        className={cn(
          'flex size-14 shrink-0 items-center justify-center rounded-full',
          cobrada
            ? 'bg-exito text-texto-sobre-exito'
            : 'bg-primario text-texto-sobre-primario',
        )}
      >
        <Icono aria-hidden="true" className="size-8" />
      </span>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold">{cobrada ? 'Venta confirmada' : 'Fiado registrado'}</h1>
        <p className="text-texto-suave">Comprobante emitido</p>
      </div>
    </header>
  )
}
