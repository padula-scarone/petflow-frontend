import { FilterX, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FiltroEstado } from '@/features/ventas/components/filtro-estado'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { FiltrosAdicionalesHistorial } from '@/features/ventas/components/filtros-adicionales-historial'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props de la hoja de filtros de mobile. */
interface HojaFiltrosHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
}

/** Mobile: un boton que abre una hoja con todos los filtros, cada uno con su etiqueta. */
export function HojaFiltrosHistorial({ propiedades }: HojaFiltrosHistorialProps) {
  const {
    filtros,
    opciones,
    cantidadFiltrosActivos,
    periodoRapidoActivo,
    totalResultados,
    onCambiarFiltros,
    onSeleccionarPeriodoRapido,
    onBuscarProducto,
    onSeleccionarProducto,
    onLimpiarFiltros,
  } = propiedades

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="h-11 w-full gap-2 bg-fondo-tarjeta">
          <SlidersHorizontal />
          Filtros
          {cantidadFiltrosActivos > 0 && (
            <Badge className="size-6 justify-center rounded-full p-0 tabular-nums">
              <span className="sr-only">Activos: </span>
              {cantidadFiltrosActivos}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Los resultados se actualizan al elegir cada filtro.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <FiltroRangoFechas
            idCampo="hoja-fecha"
            variante="hoja"
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            periodoRapidoActivo={periodoRapidoActivo}
            onCambiarFiltros={onCambiarFiltros}
            onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
          />
          <FiltroProducto
            idCampo="hoja-producto"
            variante="hoja"
            productoSeleccionado={filtros.productoSeleccionado}
            textoBusqueda={opciones.textoBusquedaProducto}
            productosCoincidentes={opciones.productosCoincidentes}
            onBuscarProducto={onBuscarProducto}
            onSeleccionarProducto={onSeleccionarProducto}
          />
          <FiltroEstado
            idCampo="hoja-estado"
            variante="hoja"
            estado={filtros.estado}
            onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
          />
          {filtros.estado === 'PENDIENTE_PAGO' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hoja-cliente" className="text-sm font-medium">
                Cliente
              </Label>
              <Input
                id="hoja-cliente"
                type="text"
                autoComplete="off"
                placeholder="Buscar por nombre"
                className="h-11 bg-fondo-tarjeta"
                value={filtros.textoCliente}
                onChange={(evento) => onCambiarFiltros({ textoCliente: evento.target.value })}
              />
            </div>
          )}
          <FiltrosAdicionalesHistorial propiedades={propiedades} idPrefijo="hoja-adicionales" />
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" className="h-12 text-base font-bold tabular-nums">
              {totalResultados === null
                ? 'Ver resultados'
                : `Ver ${totalResultados} ${totalResultados === 1 ? 'venta' : 'ventas'}`}
            </Button>
          </SheetClose>
          {/* Solo cuando hay algo que limpiar */}
          {cantidadFiltrosActivos > 0 && (
            <Button type="button" variant="ghost" className="h-11 gap-2" onClick={onLimpiarFiltros}>
              <FilterX />
              Limpiar filtros
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
