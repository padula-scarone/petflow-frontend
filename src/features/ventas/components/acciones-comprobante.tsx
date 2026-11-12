import { Pencil } from 'lucide-react'
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { formatearHora } from '@/lib/formatear-fecha-hora'

/** Props de las acciones sobre el comprobante. */
interface AccionesComprobanteProps {
  enlaceWhatsApp: string
  enlaceMail: string
  edicionDisponible: boolean
  fechaHoraLimiteEdicion: string
  onEditarVenta: () => void
  /** compacta: tres botones en fila con el icono arriba (mobile); completa: apilados (escritorio). */
  variante: 'compacta' | 'completa'
}

export function AccionesComprobante({
  enlaceWhatsApp,
  enlaceMail,
  edicionDisponible,
  fechaHoraLimiteEdicion,
  onEditarVenta,
  variante,
}: AccionesComprobanteProps) {
  const compacta = variante === 'compacta'
  const claseBoton = cn(
    'bg-fondo-tarjeta',
    compacta ? 'h-16 min-w-0 flex-1 flex-col gap-1 px-2 text-xs' : 'h-11 w-full justify-start gap-3 px-4',
  )

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex gap-2', !compacta && 'flex-col gap-3')}>
        {/* --- ENVIOS: ENLACES NATIVOS, PARA QUE EL NAVEGADOR NO LOS BLOQUEE --- */}
        <BotonesEnvioComprobante
          enlaceWhatsApp={enlaceWhatsApp}
          enlaceMail={enlaceMail}
          variante={variante}
        />

        {/* --- EDICION: PIDE CONFIRMACION PORQUE ANULA LA VENTA --- */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={claseBoton}
              disabled={!edicionDisponible}
            >
              <Pencil />
              {compacta ? 'Editar' : 'Editar venta'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Editar la venta?</AlertDialogTitle>
              <AlertDialogDescription>
                Editar anula esta venta, ajusta el stock y la caja, y vuelve a cargar los productos
                en el carrito para registrarla de nuevo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-11">Volver al comprobante</AlertDialogCancel>
              <AlertDialogAction className="h-11" onClick={onEditarVenta}>
                Sí, editar venta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* --- PLAZO DE EDICION --- */}
      <p className="text-xs text-texto-suave tabular-nums">
        {edicionDisponible
          ? `Podés editarla hasta las ${formatearHora(fechaHoraLimiteEdicion)}`
          : 'Venció el plazo de 15 minutos para editar'}
      </p>
    </div>
  )
}
