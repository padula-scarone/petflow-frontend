import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { OrigenVenta, PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

const CLASE_OPCION = 'h-11 rounded-mediano border bg-fondo-tarjeta px-2 text-sm'

/** Props de los filtros menos usados: origen, medio de pago y numero de comprobante. */
interface FiltrosAdicionalesHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
  /** Prefijo de los ids: el popover de escritorio y la hoja mobile pueden coexistir en el DOM. */
  idPrefijo: string
}

/** Cada control lleva su propia etiqueta. Viven en "Mas filtros" (escritorio) y en la hoja (mobile). */
export function FiltrosAdicionalesHistorial({
  propiedades,
  idPrefijo,
}: FiltrosAdicionalesHistorialProps) {
  const { filtros, opciones, onCambiarFiltros } = propiedades
  const esPendientePago = filtros.estado === 'PENDIENTE_PAGO'
  const valorMedioPago = filtros.medioPago === null ? 'TODOS' : String(filtros.medioPago)

  return (
    <div className="flex flex-col gap-4">
      {/* --- ORIGEN --- */}
      <div className="flex flex-col gap-1.5">
        <span id={`${idPrefijo}-origen`} className="text-sm font-medium">
          Origen
        </span>
        <ToggleGroup
          type="single"
          spacing={2}
          aria-labelledby={`${idPrefijo}-origen`}
          className="grid w-full grid-cols-3"
          value={filtros.origen ?? 'TODOS'}
          // Radix emite '' al des-seleccionar: se ignora, siempre hay una opcion elegida
          onValueChange={(valor) => {
            if (valor) onCambiarFiltros({ origen: valor === 'TODOS' ? null : (valor as OrigenVenta) })
          }}
        >
          <ToggleGroupItem value="TODOS" className={CLASE_OPCION}>
            Todos
          </ToggleGroupItem>
          <ToggleGroupItem value="MOSTRADOR" className={CLASE_OPCION}>
            Mostrador
          </ToggleGroupItem>
          <ToggleGroupItem value="DIGITAL" className={CLASE_OPCION}>
            Digital
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* --- MEDIO DE PAGO --- */}
      {/* Con "Pendiente de pago" queda deshabilitado: un fiado todavia no tiene pagos que filtrar */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefijo}-medio-pago`} className="text-sm font-medium">
          Medio de pago
        </Label>
        <Select
          value={valorMedioPago}
          disabled={esPendientePago}
          onValueChange={(valor) =>
            onCambiarFiltros({
              medioPago: valor === 'TODOS' ? null : valor === 'MIXTO' ? 'MIXTO' : Number(valor),
            })
          }
        >
          <SelectTrigger
            id={`${idPrefijo}-medio-pago`}
            aria-describedby={esPendientePago ? `${idPrefijo}-ayuda-medio-pago` : undefined}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            {opciones.mediosPago.map((medio) => (
              <SelectItem key={medio.idMedioPago} value={String(medio.idMedioPago)}>
                {medio.nombre}
              </SelectItem>
            ))}
            <SelectItem value="MIXTO">Mixto (más de un medio)</SelectItem>
          </SelectContent>
        </Select>
        {esPendientePago && (
          <p id={`${idPrefijo}-ayuda-medio-pago`} className="text-xs text-texto-suave">
            Los fiados todavía no tienen pagos.
          </p>
        )}
      </div>

      {/* --- N.º DE COMPROBANTE --- */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefijo}-comprobante`} className="text-sm font-medium">
          N.º de comprobante
        </Label>
        <Input
          id={`${idPrefijo}-comprobante`}
          type="text"
          autoComplete="off"
          placeholder="Ej: CMP-00001040"
          className="h-11 bg-fondo-tarjeta tabular-nums"
          value={filtros.numeroComprobante}
          onChange={(evento) => onCambiarFiltros({ numeroComprobante: evento.target.value })}
        />
      </div>
    </div>
  )
}
