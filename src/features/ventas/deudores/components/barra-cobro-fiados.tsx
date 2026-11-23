import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonCobrarFiados } from '@/features/ventas/deudores/components/boton-cobrar-fiados'
import type { ResumenSeleccionFiados } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props de la barra con el total a cobrar (mobile y pantallas medianas). */
interface BarraCobroFiadosProps {
  resumen: ResumenSeleccionFiados
  onCobrarFiados: () => void
}

/** Pie pegado al borde inferior, el mismo de Registrar Venta: el total a cobrar y COBRAR. Desde xl lo reemplaza el panel. */
export function BarraCobroFiados({ resumen, onCobrarFiados }: BarraCobroFiadosProps) {
  const { totalACobrar, hayErrores, puedeCobrar } = resumen

  return (
    <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno flex flex-col gap-interno border-t bg-fondo-tarjeta p-contorno xl:hidden">
      {hayErrores && (
        <p role="status" className="text-auxiliar text-peligro">
          Revisá los montos marcados
        </p>
      )}
      <div className="flex items-center justify-between gap-interno">
        <p className="flex min-w-0 flex-col">
          <span className="text-cuerpo text-texto-suave">A cobrar</span>
          <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(totalACobrar)}</span>
        </p>
        <BotonCobrarFiados habilitado={puedeCobrar} onCobrarFiados={onCobrarFiados} className="flex-1 sm:flex-none" />
      </div>
    </footer>
  )
}
