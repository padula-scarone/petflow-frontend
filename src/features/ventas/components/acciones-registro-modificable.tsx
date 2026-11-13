import { FileText, Pencil, Trash2, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** Props de los botones Ver, Editar y Anular de un registro sujeto a la ventana de 15 minutos. */
interface AccionesRegistroModificableProps {
  /** Como se nombra el registro en los aria-label, por ejemplo "comprobante CMP-00001047" o "cambio 2012". */
  nombreRegistro: string
  /** Para los textos cortos: "venta" o "cambio". */
  sustantivo: string
  ventanaVigente: boolean
  onVerDetalle: () => void
  onEditar: () => void
  onAnular: () => void
  /**
   * tabla: botones de solo icono con tooltip. tarjeta: texto corto, en fila.
   * detalle: Editar y Anular en el pie del panel (Ver no hace falta: ya se esta viendo).
   */
  variante: 'tabla' | 'tarjeta' | 'detalle'
}

// Editar y Anular, con texto: se reparten por mitades la fila que comparten (min-w-0 + shrink anulan
// el shrink-0 del Button para que nunca desborden).
const CLASE_BOTON_TEXTO = 'h-11 min-w-0 shrink flex-1 gap-1.5 bg-fondo-tarjeta px-2'

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
export function AccionesRegistroModificable({
  nombreRegistro,
  sustantivo,
  ventanaVigente,
  onVerDetalle,
  onEditar,
  onAnular,
  variante,
}: AccionesRegistroModificableProps) {
  // --- TABLA ---
  if (variante === 'tabla') {
    return (
      // Ancho de tres botones fijo y contenido centrado: el ojo solo queda en el centro de la columna
      <div className="mx-auto flex w-[8.75rem] items-center justify-center gap-1">
        <BotonIconoTabla
          Icono={FileText}
          etiqueta="Ver detalle"
          etiquetaAccesible={`Ver detalle del ${nombreRegistro}`}
          onClick={onVerDetalle}
        />
        {ventanaVigente && (
          <>
            <BotonIconoTabla
              Icono={Pencil}
              etiqueta={`Editar ${sustantivo}`}
              etiquetaAccesible={`Editar el ${nombreRegistro}`}
              onClick={onEditar}
            />
            <BotonIconoTabla
              Icono={Trash2}
              etiqueta={`Anular ${sustantivo}`}
              etiquetaAccesible={`Anular el ${nombreRegistro}`}
              className="text-peligro hover:text-peligro"
              onClick={onAnular}
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
      aria-label={`Editar el ${nombreRegistro}`}
      className={CLASE_BOTON_TEXTO}
      onClick={onEditar}
    >
      <Pencil />
      Editar
    </Button>
  )
  const botonAnular = (
    <Button
      type="button"
      variant="outline"
      aria-label={`Anular el ${nombreRegistro}`}
      className={cn(CLASE_BOTON_TEXTO, 'text-peligro hover:text-peligro')}
      onClick={onAnular}
    >
      <Trash2 />
      Anular
    </Button>
  )

  // --- DETALLE ---
  if (variante === 'detalle') {
    // Fragmento: Editar y Anular comparten la fila del pie con otros botones, que arman esa fila
    return ventanaVigente ? (
      <>
        {botonEditar}
        {botonAnular}
      </>
    ) : null
  }

  // --- TARJETA ---
  // "Ver detalle" va completo y a ancho total en su propia fila; Editar y Anular, que solo existen en la
  // ventana de 15 minutos, se reparten una fila aparte. Asi el texto entero entra en 320 px.
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        aria-label={`Ver detalle del ${nombreRegistro}`}
        className="h-11 w-full gap-1.5 bg-fondo-tarjeta px-2"
        onClick={onVerDetalle}
      >
        <FileText />
        Ver detalle
      </Button>
      {ventanaVigente && <div className="flex gap-2">{botonEditar}{botonAnular}</div>}
    </div>
  )
}
