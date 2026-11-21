import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AccionesAltaDevolucion, DevolucionDetalle } from '@/features/ventas/devoluciones/types/devolucion'
import {
  describirCantidadArticulo,
  describirPesoKg,
} from '@/features/ventas/devoluciones/utils/describir-articulo-devolucion'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del estado de exito del alta. */
interface ExitoDevolucionProps {
  devolucion: DevolucionDetalle
  acciones: Pick<AccionesAltaDevolucion, 'onCargarOtraDevolucion' | 'onVerDetalleDevolucionCreada' | 'onSolicitarCierre'>
}

/** Confirmacion de que la devolución quedo registrada, con lo que paso con el stock y la caja. */
export function ExitoDevolucion({ devolucion, acciones }: ExitoDevolucionProps) {
  const { articuloDevuelto, articuloEntregado, pagoSaldo } = devolucion

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CircleCheck aria-hidden="true" className="size-5 text-green-700" />
          Devolución registrada
        </DialogTitle>
        <DialogDescription className="tabular-nums">Devolución N.º {devolucion.idDevolucion}</DialogDescription>
      </DialogHeader>

      <DialogBody>
        <ul className="flex flex-col gap-2 text-cuerpo">
          <li>
            <span className="text-texto-suave">Entró al stock: </span>
            <span className="font-medium tabular-nums">
              {articuloDevuelto.esBolsaAbierta
                ? `${describirPesoKg(articuloDevuelto.pesoDevueltoKg ?? 0)} de «${articuloDevuelto.nombreProductoStockIngresado}» (a granel)`
                : `${describirCantidadArticulo(articuloDevuelto.cantidad, articuloDevuelto.formatoVenta)} de «${articuloDevuelto.nombreProducto}»`}
            </span>
          </li>
          <li>
            <span className="text-texto-suave">Salió del stock: </span>
            <span className="font-medium tabular-nums">
              {describirCantidadArticulo(articuloEntregado.cantidad, articuloEntregado.formatoVenta)} de «
              {articuloEntregado.nombreProducto}»
            </span>
          </li>
          <li>
            <span className="text-texto-suave">Caja: </span>
            <span className="font-medium tabular-nums">
              {devolucion.saldoResultante > 0
                ? `ingresaron ${formatearMoneda(devolucion.saldoResultante)} con ${pagoSaldo?.nombreMedioPago ?? 'el medio elegido'}`
                : 'sin movimiento (no hubo diferencia)'}
            </span>
          </li>
          {pagoSaldo?.vuelto !== null && pagoSaldo?.vuelto !== undefined && pagoSaldo.vuelto > 0 && (
            <li>
              <span className="text-texto-suave">Vuelto: </span>
              <span className="font-medium tabular-nums">{formatearMoneda(pagoSaldo.vuelto)}</span>
            </li>
          )}
        </ul>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={acciones.onCargarOtraDevolucion}>
          Cargar otra devolución
        </Button>
        <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={acciones.onVerDetalleDevolucionCreada}>
          Ver detalle
        </Button>
        <Button type="button" onClick={acciones.onSolicitarCierre}>
          Cerrar
        </Button>
      </DialogFooter>
    </>
  )
}
