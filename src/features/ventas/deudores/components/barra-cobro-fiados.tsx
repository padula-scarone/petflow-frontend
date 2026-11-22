import { HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type { ResumenSeleccionFiados } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props de la barra con el total a cobrar. */
interface BarraCobroFiadosProps {
  resumen: ResumenSeleccionFiados
  onCobrarFiados: () => void
}

/**
 * Barra pegada al borde inferior con el total a cobrar y el boton COBRAR. Va abajo y no en una columna aparte: la
 * tabla de fiados ocupa casi todo el ancho disponible.
 */
export function BarraCobroFiados({ resumen, onCobrarFiados }: BarraCobroFiadosProps) {
  const { cantidadSeleccionados, totalACobrar, hayErrores, puedeCobrar } = resumen

  return (
    <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno flex items-center justify-between gap-interno border-t bg-fondo-tarjeta p-contorno">
      <p className="flex min-w-0 flex-col">
        <span className="text-cuerpo text-texto-suave">
          {cantidadSeleccionados === 0
            ? 'Tildá los fiados que se cobran'
            : `Total a cobrar · ${cantidadSeleccionados} ${cantidadSeleccionados === 1 ? 'fiado' : 'fiados'}`}
        </span>
        <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(totalACobrar)}</span>
        {hayErrores && (
          <span role="status" className="text-auxiliar text-peligro">
            Revisá los montos marcados
          </span>
        )}
      </p>
      <Button
        type="button"
        variant="exito"
        size="lg"
        className="min-w-0 px-4 tracking-wide"
        disabled={!puedeCobrar}
        onClick={onCobrarFiados}
      >
        COBRAR
        <HandCoins aria-hidden="true" className="size-5 max-sm:hidden lg:size-6" />
      </Button>
    </footer>
  )
}
