import { useState } from 'react'
import { Outlet } from 'react-router'
import { useRegistrarVenta } from '@/features/ventas/hooks/use-registrar-venta'

interface CuerpoVentaProps {
  alIniciarNuevaVenta: () => void
}

/** Dueno del estado de una venta; al remontarse (otra key) todo vuelve a su valor inicial y se vuelve a pedir el catalogo. */
function CuerpoVenta({ alIniciarNuevaVenta }: CuerpoVentaProps) {
  const contextoVenta = useRegistrarVenta({ alIniciarNuevaVenta })

  return (
    <div className="mx-auto w-full max-w-6xl flex-1">
      <Outlet context={contextoVenta} />
    </div>
  )
}

/** Ruta padre de Registrar Venta: el estado de la venta no se pierde entre Carrito, Cobro y Comprobante. */
export function LayoutRegistrarVenta() {
  const [numeroVenta, setNumeroVenta] = useState(0)

  return (
    // Cambiar la key descarta carrito, descuento, medio de pago y comprobante de la venta anterior,
    // y vuelve a pedir catalogo y medios: el stock pudo cambiar
    <CuerpoVenta key={numeroVenta} alIniciarNuevaVenta={() => setNumeroVenta(numeroVenta + 1)} />
  )
}
