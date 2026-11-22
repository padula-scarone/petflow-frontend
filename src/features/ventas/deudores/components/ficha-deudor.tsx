import { ArrowLeft, CircleCheck, UserRoundX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoVacioLista } from '@/features/ventas/components/estado-vacio-lista'
import { BarraCobroFiados } from '@/features/ventas/deudores/components/barra-cobro-fiados'
import { TablaFiadosPendientes } from '@/features/ventas/deudores/components/tabla-fiados-pendientes'
import { TarjetaDatosDeudor } from '@/features/ventas/deudores/components/tarjeta-datos-deudor'
import { TarjetaFiadoPendiente } from '@/features/ventas/deudores/components/tarjeta-fiado-pendiente'
import { TarjetaSaldoDeudor } from '@/features/ventas/deudores/components/tarjeta-saldo-deudor'
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
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-bloque xl:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

/**
 * Ficha de un deudor: sus datos, su saldo y sus fiados pendientes. Desde aca se tildan los fiados que se cobran y
 * se elige cuanto de cada uno; un fiado a medias sigue pendiente. Tabla desde xl y tarjetas en pantallas menores.
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
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
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

  const { deudor, saldo, fiados } = estadoFicha

  return (
    <section className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* --- ENCABEZADO --- */}
      <header className="flex flex-col gap-interno">
        <BotonVolverADeudores onVolver={onVolver} />
        <h1 className="text-titulo-pagina font-bold wrap-break-word">{deudor.nombreCompleto}</h1>
      </header>

      {/* --- DATOS Y SALDO --- */}
      <div className="grid gap-bloque xl:grid-cols-2">
        <TarjetaDatosDeudor deudor={deudor} onEditarDeudor={onEditarDeudor} />
        <TarjetaSaldoDeudor saldo={saldo} cantidadFiadosPendientes={fiados.length} />
      </div>

      {/* --- FIADOS PENDIENTES --- */}
      <section aria-labelledby="titulo-fiados" className="flex flex-col gap-interno">
        <h2 id="titulo-fiados" className="text-titulo-seccion font-bold">
          Fiados pendientes
        </h2>

        {filasFiados.length === 0 ? (
          <Card className="items-center gap-interno px-contorno py-10 text-center">
            <CircleCheck aria-hidden="true" className="size-8 text-green-700" />
            <p className="font-medium">No tiene fiados pendientes</p>
            <p className="text-cuerpo text-texto-suave">
              Cuando se le fíe una venta, la vas a ver acá y la vas a poder cobrar.
            </p>
          </Card>
        ) : (
          <>
            {/* --- TARJETAS (HASTA XL) --- */}
            <div className="flex flex-col gap-interno xl:hidden">
              <label className="flex min-h-11 w-fit cursor-pointer items-center gap-interno text-cuerpo font-medium">
                <Checkbox
                  checked={resumenSeleccion.todosSeleccionados}
                  onCheckedChange={onSeleccionarTodos}
                />
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

      {/* --- TOTAL A COBRAR --- */}
      {filasFiados.length > 0 && <BarraCobroFiados resumen={resumenSeleccion} onCobrarFiados={onCobrarFiados} />}
    </section>
  )
}
