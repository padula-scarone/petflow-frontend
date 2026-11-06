import { useState } from 'react'
import { MenuDoble } from '@/features/navegacion/components/menu-doble'
import { MODULOS_MENU } from '@/features/navegacion/config/modulos-menu'
import { useMenuDoble } from '@/features/navegacion/hooks/use-menu-doble'
import { RegistrarVentaCarrito } from '@/features/ventas/components/registrar-venta-carrito'
import { RegistrarVentaCobro } from '@/features/ventas/components/registrar-venta-cobro'
import { useCobroVentaEjemplo } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import type {
  ArticuloCarrito,
  CanalVenta,
  ResultadoBusqueda,
  TipoEntrega,
} from '@/features/ventas/types/venta'

// --- DATOS DE EJEMPLO ---
// Vista de prueba temporal: se reemplaza por el hook de la accion Registrar Venta.
const CATALOGO_EJEMPLO: ResultadoBusqueda[] = [
  { idProducto: 'p1', nombreProducto: 'Alimento balanceado perro adulto 15 kg', precioUnitario: 48500, stockDisponible: 12 },
  { idProducto: 'p2', nombreProducto: 'Alimento balanceado gato adulto 7,5 kg', precioUnitario: 31200, stockDisponible: 2 },
  { idProducto: 'p3', nombreProducto: 'Piedras sanitarias 4 kg', precioUnitario: 6800, stockDisponible: 30 },
]

function crearArticulo(producto: ResultadoBusqueda): ArticuloCarrito {
  return {
    ...producto,
    categoria: 'Alimentos',
    formato: 'unidad',
    cantidad: 1,
    montoTotal: producto.precioUnitario,
  }
}

function recalcularArticulo(articulo: ArticuloCarrito, cantidad: number): ArticuloCarrito {
  return { ...articulo, cantidad, montoTotal: articulo.precioUnitario * cantidad }
}

function App() {
  const { idModuloActivo, idSeccionActiva, seleccionarModulo, seleccionarSeccion } =
    useMenuDoble(MODULOS_MENU)
  const [mostrandoCobro, setMostrandoCobro] = useState(false)
  const [canalVenta, setCanalVenta] = useState<CanalVenta>('mostrador')
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('retiro')
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [articulos, setArticulos] = useState<ArticuloCarrito[]>([
    crearArticulo(CATALOGO_EJEMPLO[0]),
    { ...recalcularArticulo(crearArticulo(CATALOGO_EJEMPLO[1]), 3) },
  ])

  const resultadosBusqueda = CATALOGO_EJEMPLO.filter((producto) =>
    producto.nombreProducto.toLowerCase().includes(textoBusqueda.trim().toLowerCase()),
  )
  const subtotal = articulos.reduce((acumulado, articulo) => acumulado + articulo.montoTotal, 0)
  const propiedadesCobro = useCobroVentaEjemplo(subtotal)

  const cambiarCantidad = (idProducto: string, variacion: number) =>
    setArticulos(
      articulos.map((articulo) =>
        articulo.idProducto === idProducto
          ? recalcularArticulo(articulo, articulo.cantidad + variacion)
          : articulo,
      ),
    )

  const agregarProducto = (idProducto: string) => {
    const existente = articulos.find((articulo) => articulo.idProducto === idProducto)
    const producto = CATALOGO_EJEMPLO.find((candidato) => candidato.idProducto === idProducto)
    if (existente) cambiarCantidad(idProducto, 1)
    else if (producto) setArticulos([...articulos, crearArticulo(producto)])
    setTextoBusqueda('')
  }

  return (
    <MenuDoble
      modulos={MODULOS_MENU}
      idModuloActivo={idModuloActivo}
      idSeccionActiva={idSeccionActiva}
      nombreUsuario="Usuario"
      onSeleccionarModulo={seleccionarModulo}
      onSeleccionarSeccion={seleccionarSeccion}
      onAbrirMenuUsuario={() => undefined}
    >
      {idSeccionActiva !== 'registrar-venta' ? (
        <p className="py-10 text-center text-texto-suave">Sección en construcción</p>
      ) : (
        <div className="mx-auto max-w-6xl">
          {mostrandoCobro ? (
            <RegistrarVentaCobro
              {...propiedadesCobro}
              onVolverAlCarrito={() => setMostrandoCobro(false)}
              onCancelarVenta={() => setMostrandoCobro(false)}
              onConfirmarCobro={() => setMostrandoCobro(false)}
            />
          ) : (
          <RegistrarVentaCarrito
            estadoVenta={{ canalVenta, tipoEntrega, articulos, subtotal }}
            textoBusqueda={textoBusqueda}
            resultadosBusqueda={textoBusqueda.trim() === '' ? [] : resultadosBusqueda}
            onBuscarProducto={setTextoBusqueda}
            onAgregarProducto={agregarProducto}
            onCambiarCanal={setCanalVenta}
            onCambiarEntrega={setTipoEntrega}
            onAumentarCantidad={(idProducto) => cambiarCantidad(idProducto, 1)}
            onDisminuirCantidad={(idProducto) => cambiarCantidad(idProducto, -1)}
            onEliminarArticulo={(idProducto) =>
              setArticulos(articulos.filter((articulo) => articulo.idProducto !== idProducto))
            }
            onContinuarACobro={() => setMostrandoCobro(true)}
          />
          )}
        </div>
      )}
    </MenuDoble>
  )
}

export default App
