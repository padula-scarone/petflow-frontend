import type { FormEvent } from 'react'
import { Search, UserPlus, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ClienteFiado, DatosNuevoCliente } from '@/features/ventas/types/cobro'

/** Props del selector del cliente deudor de un fiado. */
interface SelectorClienteFiadoProps {
  clienteFiado: ClienteFiado | null
  textoBusqueda: string
  resultadosBusqueda: ClienteFiado[]
  onBuscarCliente: (textoBusqueda: string) => void
  onSeleccionarCliente: (idCliente: string) => void
  onQuitarCliente: () => void
  onCrearCliente: (datos: DatosNuevoCliente) => void
}

export function SelectorClienteFiado({
  clienteFiado,
  textoBusqueda,
  resultadosBusqueda,
  onBuscarCliente,
  onSeleccionarCliente,
  onQuitarCliente,
  onCrearCliente,
}: SelectorClienteFiadoProps) {
  const desplegableVisible = textoBusqueda.trim() !== ''

  // El formulario no es controlado: se leen los campos recien al enviarlo
  const enviarNuevoCliente = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const telefono = String(datos.get('telefono')).trim()
    onCrearCliente({
      nombreCompleto: String(datos.get('nombreCompleto')).trim(),
      telefono: telefono === '' ? undefined : telefono,
    })
  }

  // --- CLIENTE YA ELEGIDO ---
  if (clienteFiado) {
    return (
      <div className="flex items-center gap-3 rounded-grande border p-3">
        <UserRound aria-hidden="true" className="size-6 shrink-0 text-texto-suave" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{clienteFiado.nombreCompleto}</p>
          {clienteFiado.telefono && (
            <p className="text-sm text-texto-suave tabular-nums">{clienteFiado.telefono}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cambiar cliente"
          className="size-11 shrink-0 text-slate-500"
          onClick={onQuitarCliente}
        >
          <X />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-texto-suave">
        El fiado no ingresa a la caja: queda como deuda del cliente hasta que la liquide.
      </p>

      {/* --- BUSCADOR DE CLIENTES --- */}
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
        />
        <Input
          type="text"
          aria-label="Buscar cliente por nombre"
          placeholder="Buscar cliente por nombre"
          autoComplete="off"
          className="h-11 bg-fondo-tarjeta pl-10"
          value={textoBusqueda}
          onChange={(evento) => onBuscarCliente(evento.target.value)}
        />
        {desplegableVisible && (
          <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-md">
            {resultadosBusqueda.length === 0 ? (
              <li className="px-3 py-3 text-sm text-texto-suave">
                Sin resultados. Podés crear el cliente más abajo.
              </li>
            ) : (
              resultadosBusqueda.map((cliente) => (
                <li key={cliente.idCliente}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-mediano px-3 py-2 text-left text-sm hover:bg-fondo-hover focus-visible:bg-fondo-hover focus-visible:outline-none"
                    onClick={() => onSeleccionarCliente(cliente.idCliente)}
                  >
                    <span className="min-w-0 truncate font-medium">{cliente.nombreCompleto}</span>
                    {cliente.telefono && (
                      <span className="shrink-0 text-xs text-texto-suave tabular-nums">
                        {cliente.telefono}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* --- ALTA DE CLIENTE NUEVO --- */}
      {/* details/summary: se abre y cierra sin estado en React */}
      <details className="rounded-grande border">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-grande px-3 text-sm font-medium hover:bg-fondo-hover [&::-webkit-details-marker]:hidden">
          <UserPlus aria-hidden="true" className="size-5" />
          Crear cliente nuevo
        </summary>
        <Card className="gap-4 border-0 p-3 pt-1 shadow-none">
          <form className="flex flex-col gap-4" onSubmit={enviarNuevoCliente}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre-cliente-nuevo" className="text-sm text-texto-suave">
                Nombre completo
              </Label>
              <Input
                id="nombre-cliente-nuevo"
                name="nombreCompleto"
                required
                maxLength={80}
                autoComplete="off"
                className="h-11 bg-fondo-tarjeta"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono-cliente-nuevo" className="text-sm text-texto-suave">
                Teléfono (opcional)
              </Label>
              <Input
                id="telefono-cliente-nuevo"
                name="telefono"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                className="h-11 bg-fondo-tarjeta tabular-nums"
              />
            </div>
            <Button type="submit" className="h-11 px-6 sm:self-end">
              Guardar y seleccionar
            </Button>
          </form>
        </Card>
      </details>
    </div>
  )
}
