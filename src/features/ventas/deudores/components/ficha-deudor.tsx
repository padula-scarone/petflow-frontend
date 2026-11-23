import { ArrowLeft, CircleCheck, Pencil, UserRoundX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoVacioLista } from '@/features/ventas/components/estado-vacio-lista'
import { BarraCobroFiados } from '@/features/ventas/deudores/components/barra-cobro-fiados'
import { PanelCobroFiados } from '@/features/ventas/deudores/components/panel-cobro-fiados'
import { TablaFiadosPendientes } from '@/features/ventas/deudores/components/tabla-fiados-pendientes'
import { TarjetaFiadoPendiente } from '@/features/ventas/deudores/components/tarjeta-fiado-pendiente'
import type { FichaDeudorProps } from '@/features/ventas/deudores/types/cobro-deudor'

/** Boton para volver a la lista de Deudores. */
function BotonVolverADeudores({ onVolver }: { onVolver: () => void }) {
  return (
    <Button type="button" variant="ghost" className="-ml-3 self-start" onClick={onVolver}>
      <ArrowLeft aria-hidden="true" />
      Volver a Deudores
    </Button>
  )
}

/** Marcador de posicion mientras se pide la cuenta del deudor. */
function EstadoCargandoFicha() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-bloque">
      <span className="sr-only">Cargando el deudor</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

/**
 * Ficha de un deudor. Arriba su nombre y contacto; abajo sus fiados pendientes con el saldo total, y al costado (en
 * mobile, abajo) lo que se va a cobrar. Se tildan los fiados y se elige cuanto de cada uno: un fiado a medias sigue
 * pendiente. Tabla desde xl y tarjetas en pantallas menores.
 */
export function FichaDeudor({
  estadoFicha,
  filasFiados,
  resumenSeleccion,
  onVolver,
  onReintentar,
  onEditarDeudor,
  onAlternarFiado,
  onCambiarMontoFiado,
  onSeleccionarTodos,
  onCobrarFiados,
}: FichaDeudorProps) {
  if (estadoFicha.tipo !== 'listo') {
    return (
      <section className="flex flex-1 flex-col gap-bloque">
        <h1 className="sr-only">Deudor</h1>
        <BotonVolverADeudores onVolver={onVolver} />
        {estadoFicha.tipo === 'cargando' && <EstadoCargandoFicha />}
        {estadoFicha.tipo === 'error' && (
          <EstadoErrorLista
            titulo="No se pudo cargar el deudor"
            mensaje={estadoFicha.mensaje}
            onReintentar={onReintentar}
          />
        )}
        {estadoFicha.tipo === 'no-encontrado' && (
          <EstadoVacioLista
            icono={UserRoundX}
            titulo="No encontramos a este deudor"
            descripcion="Puede que se haya eliminado. Volvé a la lista para buscarlo."
            accion={
              <Button type="button" onClick={onVolver}>
                Volver a Deudores
              </Button>
            }
          />
        )}
      </section>
    )
  }

  const { deudor, saldo } = estadoFicha
  const hayFiados = filasFiados.length > 0

  return (
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- ENCABEZADO: QUIEN ES --- */}
      {/* El nombre va una sola vez, como titulo; debajo solo lo que no esta en el titulo */}
      <header className="flex flex-col gap-interno">
        <BotonVolverADeudores onVolver={onVolver} />
        <div className="flex items-start justify-between gap-interno">
          <div className="min-w-0">
            <h1 className="text-titulo-pagina font-bold wrap-break-word">{deudor.nombreCompleto}</h1>
            <p className="flex flex-wrap gap-x-bloque text-cuerpo text-texto-suave tabular-nums">
              <span>DNI {deudor.dni}</span>
              <span>Tel. {deudor.telefono}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            aria-label={`Editar los datos de ${deudor.nombreCompleto}`}
            className="shrink-0 bg-fondo-tarjeta"
            onClick={onEditarDeudor}
          >
            <Pencil aria-hidden="true" />
            Editar
          </Button>
        </div>
      </header>

      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* --- FIADOS PENDIENTES, CON CUANTOS SON Y EL SALDO TOTAL --- */}
        <section aria-labelledby="titulo-fiados" className="flex min-w-0 flex-col gap-interno">
          <div className="flex flex-wrap items-baseline justify-between gap-x-bloque gap-y-1">
            <h2 id="titulo-fiados" className="text-titulo-seccion font-bold">
              Fiados pendientes <span className="font-normal text-texto-suave tabular-nums">({filasFiados.length})</span>
            </h2>
            <p className="flex items-baseline gap-2">
              <span className="text-cuerpo text-texto-suave">Saldo total</span>
              <span
                className={cn(
                  'text-cifra-secundaria font-bold tabular-nums',
                  saldo > 0 ? 'text-amber-700' : 'font-normal text-texto-suave',
                )}
              >
                {formatearMoneda(saldo)}
              </span>
            </p>
          </div>

          {!hayFiados ? (
            <Card className="items-center gap-interno px-contorno py-10 text-center">
              <CircleCheck aria-hidden="true" className="size-8 text-green-700" />
              <p className="font-medium">No tiene fiados pendientes</p>
            </Card>
          ) : (
            <>
              {/* --- TARJETAS (HASTA XL) --- */}
              <div className="flex flex-col gap-interno xl:hidden">
                <label className="flex min-h-11 w-fit cursor-pointer items-center gap-interno text-cuerpo font-medium">
                  <Checkbox checked={resumenSeleccion.todosSeleccionados} onCheckedChange={onSeleccionarTodos} />
                  Seleccionar todo
                </label>
                {/* grid-cols-1 = minmax(0, 1fr): sin esto la columna crece al ancho del contenido y la tarjeta se corta */}
                <ul className="grid grid-cols-1 gap-interno md:grid-cols-2">
                  {filasFiados.map((fila) => (
                    <li key={fila.fiado.idVenta} className="min-w-0">
                      <TarjetaFiadoPendiente
                        fila={fila}
                        onAlternarFiado={onAlternarFiado}
                        onCambiarMontoFiado={onCambiarMontoFiado}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* --- TABLA (DESDE XL) --- */}
              <div className="hidden xl:block">
                <TablaFiadosPendientes
                  filas={filasFiados}
                  resumen={resumenSeleccion}
                  onAlternarFiado={onAlternarFiado}
                  onCambiarMontoFiado={onCambiarMontoFiado}
                  onSeleccionarTodos={onSeleccionarTodos}
                />
              </div>
            </>
          )}
        </section>

        {/* --- LO QUE SE COBRA (ESCRITORIO) --- */}
        {hayFiados && (
          <PanelCobroFiados
            resumen={resumenSeleccion}
            cantidadFiados={filasFiados.length}
            onCobrarFiados={onCobrarFiados}
            className="hidden xl:flex"
          />
        )}
      </div>

      {/* --- LO QUE SE COBRA (MOBILE) --- */}
      {hayFiados && <BarraCobroFiados resumen={resumenSeleccion} onCobrarFiados={onCobrarFiados} />}
    </section>
  )
}
