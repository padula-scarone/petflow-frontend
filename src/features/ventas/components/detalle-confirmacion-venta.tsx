import type { ReactNode } from 'react'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { FilaDetalleConfirmacion } from '@/features/ventas/components/fila-detalle-confirmacion'
import { NombreProducto } from '@/features/ventas/components/nombre-producto'
import type { ResumenConfirmacionVenta } from '@/features/ventas/types/resumen-confirmacion-venta'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'

/** Props del detalle de la venta que se revisa antes de registrarla. */
interface DetalleConfirmacionVentaProps {
  resumen: ResumenConfirmacionVenta
  /** Las filas que cierran la lista (el total y, con deuda, el deudor); van a continuacion, con una sola linea arriba. */
  children?: ReactNode
}

/** Un grupo de filas: apenas mas de aire que entre filas del mismo grupo, sin titulo ni linea. */
function Grupo({ children }: { children: ReactNode }) {
  return <div className="mt-interno flex flex-col gap-1.5 first:mt-0">{children}</div>
}

/**
 * Lo que se revisa antes de registrar una venta, como una sola lista de filas: productos y cantidades, origen y
 * entrega, descuento con su motivo y medios de pago con lo recibido y el vuelto. Lo que depende de otra fila va
 * corrido a la derecha, debajo de ella.
 */
export function DetalleConfirmacionVenta({ resumen, children }: DetalleConfirmacionVentaProps) {
  const { productos, canalVenta, tipoEntrega, datosEnvio, descuentoManual, pagos } = resumen

  return (
    <dl className="flex flex-col text-cuerpo">
      {/* --- PRODUCTOS: nombre, cantidad y subtotal en una linea --- */}
      <Grupo>
        {productos.map((producto) => (
          <FilaDetalleConfirmacion
            key={producto.idProducto}
            etiqueta={<NombreProducto nombre={producto.nombreProducto} formato={producto.formato} />}
            dato={`${formatearCantidad(producto.cantidad, producto.formato)} · ${formatearMoneda(producto.montoTotal)}`}
          />
        ))}
      </Grupo>

      {/* --- ORIGEN Y ENTREGA: con Envio, la direccion y el destinatario dependen de la entrega --- */}
      <Grupo>
        <FilaDetalleConfirmacion etiqueta="Origen" dato={canalVenta === 'mostrador' ? 'Mostrador' : 'Digital'} />
        <FilaDetalleConfirmacion etiqueta="Entrega" dato={tipoEntrega === 'envio' ? 'Envío' : 'Retiro'} />
        {datosEnvio.map((dato) => (
          <FilaDetalleConfirmacion key={dato.etiqueta} etiqueta={dato.etiqueta} dato={dato.valor} sangria />
        ))}
      </Grupo>

      {/* --- DESCUENTO MANUAL: el motivo depende del descuento --- */}
      {descuentoManual !== null && (
        <Grupo>
          <FilaDetalleConfirmacion etiqueta="Descuento" dato={formatearMonedaConSigno(-descuentoManual.monto)} />
          <FilaDetalleConfirmacion etiqueta="Motivo" dato={descuentoManual.motivo} sangria />
        </Grupo>
      )}

      {/* --- MEDIOS DE PAGO: el ajuste, lo recibido y el vuelto dependen de su medio --- */}
      {pagos.length > 0 && (
        <Grupo>
          {pagos.map((pago) => (
            <div key={pago.idMedioPago} className="flex flex-col gap-1.5">
              {/* Con ajuste la fila dice "Total": es lo que paga el medio, y debajo se explica de donde sale */}
              <FilaDetalleConfirmacion
                etiqueta={pago.montoAjuste === 0 ? pago.nombreMedioPago : `Total ${pago.nombreMedioPago}`}
                dato={formatearMoneda(pago.montoBase + pago.montoAjuste)}
              />
              {pago.montoAjuste !== 0 && (
                <FilaDetalleConfirmacion
                  etiqueta={`${pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} aplicado (${pago.descripcionAjuste} sobre ${formatearMoneda(pago.montoBase)})`}
                  dato={formatearMonedaConSigno(pago.montoAjuste)}
                  sangria
                />
              )}
              {/* Sin "Paga con" no se registra recibido ni vuelto: no hay nada que mostrar */}
              {pago.montoRecibido !== null && (
                <FilaDetalleConfirmacion etiqueta="Recibido" dato={formatearMoneda(pago.montoRecibido)} sangria />
              )}
              {pago.montoRecibido !== null && pago.vuelto !== null && (
                <FilaDetalleConfirmacion etiqueta="Vuelto" dato={formatearMoneda(pago.vuelto)} sangria />
              )}
            </div>
          ))}
        </Grupo>
      )}

      {/* --- CIERRE: una sola linea separa el total del resto --- */}
      {children && <div className="mt-interno flex flex-col gap-1.5 border-t pt-interno">{children}</div>}
    </dl>
  )
}
