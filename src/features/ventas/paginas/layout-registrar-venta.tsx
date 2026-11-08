import { useState } from 'react'
import { Outlet } from 'react-router'
import { useRegistrarVentaEjemplo } from '@/features/ventas/hooks/use-registrar-venta-ejemplo'

interface CuerpoVentaProps {
  iniciarVacia: boolean
  alIniciarNuevaVenta: () => void
}

/** Dueno del estado de una venta; al remontarse (otra key) todo vuelve a su valor inicial. */
function CuerpoVenta({ iniciarVacia, alIniciarNuevaVenta }: CuerpoVentaProps) {
  const contextoVenta = useRegistrarVentaEjemplo({ iniciarVacia, alIniciarNuevaVenta })

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
    // Cambiar la key descarta carrito, descuento, medio de pago y comprobante de la venta anterior
    <CuerpoVenta
      key={numeroVenta}
      iniciarVacia={numeroVenta > 0}
      alIniciarNuevaVenta={() => setNumeroVenta(numeroVenta + 1)}
    />
  )
}
