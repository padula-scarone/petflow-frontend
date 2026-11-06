import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilaPagoMixto } from '@/features/ventas/components/fila-pago-mixto'
import type { LineaPagoMixto, MedioPago } from '@/features/ventas/types/cobro'

/** Props de la lista de lineas del pago mixto. */
interface ListaPagoMixtoProps {
  lineas: LineaPagoMixto[]
  mediosDisponibles: MedioPago[]
  faltaCubrir: number
  onAgregarLineaPago: (idMedioPago: string) => void
  onQuitarLineaPago: (idMedioPago: string) => void
  onCambiarMontoLinea: (idMedioPago: string, monto: number | null) => void
  onCambiarPagaConLinea: (idMedioPago: string, monto: number | null) => void
  onCompletarConRestante: (idMedioPago: string) => void
}

export function ListaPagoMixto({
  lineas,
  mediosDisponibles,
  faltaCubrir,
  onAgregarLineaPago,
  onQuitarLineaPago,
  onCambiarMontoLinea,
  onCambiarPagaConLinea,
  onCompletarConRestante,
}: ListaPagoMixtoProps) {
  // Un medio no se repite: solo se ofrecen los que todavia no tienen linea
  const mediosSinUsar = mediosDisponibles.filter(
    (medio) => !lineas.some((linea) => linea.idMedioPago === medio.idMedioPago),
  )

  return (
    <div className="flex flex-col gap-3">
      {/* --- LINEAS --- */}
      {lineas.length === 0 && (
        <p className="rounded-grande border border-dashed px-4 py-6 text-center text-texto-suave">
          Agregá los medios de pago con los que se cobra la venta
        </p>
      )}
      {lineas.map((linea) => {
        const medio = mediosDisponibles.find(
          (candidato) => candidato.idMedioPago === linea.idMedioPago,
        )
        if (!medio) return null
        return (
          <FilaPagoMixto
            key={linea.idMedioPago}
            linea={linea}
            medio={medio}
            faltaCubrir={faltaCubrir}
            onQuitar={onQuitarLineaPago}
            onCambiarMonto={onCambiarMontoLinea}
            onCambiarPagaCon={onCambiarPagaConLinea}
            onCompletarConRestante={onCompletarConRestante}
          />
        )
      })}

      {/* --- AGREGAR MEDIO --- */}
      {mediosSinUsar.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediosSinUsar.map((medio) => (
            <Button
              key={medio.idMedioPago}
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-full bg-fondo-tarjeta px-4"
              onClick={() => onAgregarLineaPago(medio.idMedioPago)}
            >
              <Plus />
              {medio.nombre}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
