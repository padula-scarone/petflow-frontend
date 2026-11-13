import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AccionesAltaCambio, CambioMercaderiaDetalle } from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  describirCantidadArticulo,
  describirPesoKg,
} from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del estado de exito del alta. */
interface ExitoCambioProps {
  cambio: CambioMercaderiaDetalle
  acciones: Pick<AccionesAltaCambio, 'onCargarOtroCambio' | 'onVerDetalleCambioCreado' | 'onSolicitarCierre'>
}

/** Confirmacion de que el cambio quedo registrado, con lo que paso con el stock y la caja. */
export function ExitoCambio({ cambio, acciones }: ExitoCambioProps) {
  const { articuloDevuelto, articuloEntregado, pagoSaldo } = cambio

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CircleCheck aria-hidden="true" className="size-5 text-green-700" />
          Cambio registrado
        </DialogTitle>
        <DialogDescription className="tabular-nums">Cambio N.º {cambio.idCambio}</DialogDescription>
      </DialogHeader>

      <DialogBody>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <span className="text-texto-suave">Entró al stock: </span>
            <span className="font-medium tabular-nums">
              {articuloDevuelto.esBolsaAbierta
                ? `${describirPesoKg(articuloDevuelto.cantidad)} de «${articuloDevuelto.nombreProductoStockIngresado}» (a granel)`
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
              {cambio.saldoResultante > 0
                ? `ingresaron ${formatearMoneda(cambio.saldoResultante)} con ${pagoSaldo?.nombreMedioPago ?? 'el medio elegido'}`
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
        <Button type="button" variant="outline" className="h-11 bg-fondo-tarjeta px-6" onClick={acciones.onCargarOtroCambio}>
          Cargar otro cambio
        </Button>
        <Button type="button" variant="outline" className="h-11 bg-fondo-tarjeta px-6" onClick={acciones.onVerDetalleCambioCreado}>
          Ver detalle
        </Button>
        <Button type="button" className="h-11 px-6" onClick={acciones.onSolicitarCierre}>
          Cerrar
        </Button>
      </DialogFooter>
    </>
  )
}
