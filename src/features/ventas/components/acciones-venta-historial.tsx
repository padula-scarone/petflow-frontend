import { Eye, Pencil, Trash2, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { FilaHistorial, PropiedadesAccionesVenta } from '@/features/ventas/types/historial'

/** Props de los botones Ver, Editar y Anular de una venta. */
interface AccionesVentaHistorialProps {
  fila: FilaHistorial
  acciones: PropiedadesAccionesVenta
  /**
   * tabla: botones de solo icono con tooltip. tarjeta: texto corto, en fila.
   * detalle: Editar y Anular en el pie del panel (Ver no hace falta: ya se esta viendo).
   */
  variante: 'tabla' | 'tarjeta' | 'detalle'
}

// Botones con texto de la tarjeta y del detalle. shrink + min-w-0 anulan el shrink-0 del Button para que los tres
// entren en 320 px; por debajo de 360 px se oculta el icono y queda solo el texto.
const CLASE_BOTON_TEXTO =
  'h-11 min-w-0 shrink flex-1 gap-1.5 bg-fondo-tarjeta px-2 max-[359px]:[&_svg]:hidden'

/** Boton de solo icono de la tabla, con su tooltip y su aria-label. */
function BotonIconoTabla({
  Icono,
  etiqueta,
  etiquetaAccesible,
  className,
  onClick,
}: {
  Icono: LucideIcon
  etiqueta: string
  etiquetaAccesible: string
  className?: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={etiquetaAccesible}
          className={cn('size-11', className)}
          onClick={onClick}
        >
          <Icono className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{etiqueta}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Editar y Anular existen solo mientras la ventana de 15 minutos esta vigente: vencida o anulada,
 * desaparecen (no se deshabilitan). "Ver detalle" queda siempre.
 */
export function AccionesVentaHistorial({ fila, acciones, variante }: AccionesVentaHistorialProps) {
  const { idVenta, numeroComprobante, ventanaVigente } = fila
  const solicitarEdicion = () => acciones.onSolicitarAccion('EDITAR', idVenta)
  const solicitarAnulacion = () => acciones.onSolicitarAccion('ANULAR', idVenta)

  // --- TABLA ---
  if (variante === 'tabla') {
    return (
      // Ancho de tres botones fijo y contenido centrado: el ojo solo queda en el centro de la columna
      <div className="mx-auto flex w-[8.75rem] items-center justify-center gap-1">
        <BotonIconoTabla
          Icono={Eye}
          etiqueta="Ver detalle"
          etiquetaAccesible={`Ver detalle del comprobante ${numeroComprobante}`}
          onClick={() => acciones.onVerDetalle(idVenta)}
        />
        {ventanaVigente && (
          <>
            <BotonIconoTabla
              Icono={Pencil}
              etiqueta="Editar venta"
              etiquetaAccesible={`Editar el comprobante ${numeroComprobante}`}
              onClick={solicitarEdicion}
            />
            <BotonIconoTabla
              Icono={Trash2}
              etiqueta="Anular venta"
              etiquetaAccesible={`Anular el comprobante ${numeroComprobante}`}
              className="text-peligro hover:text-peligro"
              onClick={solicitarAnulacion}
            />
          </>
        )}
      </div>
    )
  }

  const botonEditar = (
    <Button
      type="button"
      variant="outline"
      aria-label={`Editar el comprobante ${numeroComprobante}`}
      className={CLASE_BOTON_TEXTO}
      onClick={solicitarEdicion}
    >
      <Pencil />
      Editar
    </Button>
  )
  const botonAnular = (
    <Button
      type="button"
      variant="outline"
      aria-label={`Anular el comprobante ${numeroComprobante}`}
      className={cn(CLASE_BOTON_TEXTO, 'text-peligro hover:text-peligro')}
      onClick={solicitarAnulacion}
    >
      <Trash2 />
      Anular
    </Button>
  )

  // --- DETALLE ---
  if (variante === 'detalle') {
    return ventanaVigente ? (
      <div className="flex gap-2">
        {botonEditar}
        {botonAnular}
      </div>
    ) : null
  }

  // --- TARJETA ---
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        aria-label={`Ver detalle del comprobante ${numeroComprobante}`}
        className={CLASE_BOTON_TEXTO}
        onClick={() => acciones.onVerDetalle(idVenta)}
      >
        <Eye />
        Ver
      </Button>
      {ventanaVigente && (
        <>
          {botonEditar}
          {botonAnular}
        </>
      )}
    </div>
  )
}
