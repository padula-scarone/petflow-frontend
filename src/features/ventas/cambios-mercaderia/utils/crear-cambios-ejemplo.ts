import { MEDIOS_EJEMPLO } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import type {
  CambioMercaderiaDetalle,
  CodigoMotivoAccionCambio,
  CodigoMotivoCambio,
  EstadoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  CATALOGO_CAMBIOS_EJEMPLO,
  obtenerProductoCambioEjemplo,
  type ProductoCambioEjemplo,
} from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'
import { calcularLimiteModificacionCambio } from '@/features/ventas/cambios-mercaderia/utils/calcular-ventana-cambio'
import { MOTIVOS_CAMBIO } from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import type { VentaDetalle } from '@/features/ventas/types/historial'

// --- DATOS DE EJEMPLO ---
// Temporal: reemplaza al back hasta la Integracion. Las fechas se calculan contra "ahora" para que el
// contador de 15 minutos se pueda ver correr. Los cambios 2006 a 2012 tienen un comportamiento fijo
// (ver la tabla en use-cambios-posventa-ejemplo.ts); los demas siguen un patron para tener varias paginas.

const MILISEGUNDOS_POR_MINUTO = 60 * 1000

const VENDEDORES_EJEMPLO = [
  { idUsuario: 1, nombre: 'Lucía Gómez' },
  { idUsuario: 2, nombre: 'Martín Pérez' },
  { idUsuario: 3, nombre: 'Usuario' },
]

/** Descripcion compacta de un cambio de ejemplo. */
interface DatosCambioEjemplo {
  idCambio: number
  /** Puede ser decimal: 14,5 es 14 minutos y 30 segundos. */
  minutosDesdeCambio: number
  estado?: EstadoCambio
  /** Venta original; null = cambio desvinculado. */
  idVentaOriginal: number | null
  idProductoDevuelto: number
  /** Con bolsa abierta es el peso devuelto en kg. */
  cantidadDevuelta: number
  esBolsaAbierta?: boolean
  idProductoEntregado: number
  cantidadEntregada: number
  /** Medio con el que se cobro el saldo; solo si hay saldo. */
  idMedioPago?: number
  codigoMotivo: CodigoMotivoCambio
  detalleMotivo?: string
  /** Solo en un cambio anulado. */
  anulacion?: { codigoMotivo: CodigoMotivoAccionCambio; minutosDespues: number }
}

/** Numero de comprobante de una venta, con el mismo formato que arma el back. */
export function crearNumeroComprobante(idVenta: number) {
  return `CMP-${String(idVenta).padStart(8, '0')}`
}

function crearCambioEjemplo(
  ahoraMilisegundos: number,
  ventas: VentaDetalle[],
  datos: DatosCambioEjemplo,
): CambioMercaderiaDetalle {
  const productoDevuelto = obtenerProductoCambioEjemplo(datos.idProductoDevuelto)
  const productoEntregado = obtenerProductoCambioEjemplo(datos.idProductoEntregado)
  const esBolsaAbierta = datos.esBolsaAbierta ?? false
  const venta = datos.idVentaOriginal === null ? null : ventas.find((candidata) => candidata.idVenta === datos.idVentaOriginal)
  if (datos.idVentaOriginal !== null && !venta) {
    throw new Error(`La venta ${datos.idVentaOriginal} no existe en los datos de ejemplo`)
  }

  // --- PRECIO DEVUELTO: EL PAGADO SI HAY VENTA, EL ACTUAL SI NO; BOLSA ABIERTA SE VALUA POR KG ---
  const itemVenta = venta?.items.find((item) => item.idProducto === datos.idProductoDevuelto)
  const precioPagadoOActual = itemVenta?.precioUnitario ?? productoDevuelto.precioUnitario
  let precioUnitarioDevuelto = precioPagadoOActual
  let productoStockIngresado: ProductoCambioEjemplo = productoDevuelto
  if (esBolsaAbierta && productoDevuelto.idProductoGranel !== null && productoDevuelto.pesoNominalKg !== null) {
    productoStockIngresado = obtenerProductoCambioEjemplo(productoDevuelto.idProductoGranel)
    precioUnitarioDevuelto = itemVenta
      ? itemVenta.precioUnitario / productoDevuelto.pesoNominalKg
      : productoStockIngresado.precioUnitario
  }
  const valorDevuelto = Math.round(datos.cantidadDevuelta * precioUnitarioDevuelto)
  const valorEntregado = Math.round(datos.cantidadEntregada * productoEntregado.precioUnitario)
  const saldo = valorEntregado - valorDevuelto
  if (saldo < 0) throw new Error(`El cambio ${datos.idCambio} de ejemplo tiene saldo negativo`)

  // --- PAGO DEL SALDO ---
  const medio = saldo > 0 ? MEDIOS_EJEMPLO.find((candidato) => candidato.idMedioPago === (datos.idMedioPago ?? 1)) : undefined
  const montoRecibido = medio?.admiteVuelto ? Math.ceil(saldo / 1000) * 1000 : null
  const fechaHora = new Date(ahoraMilisegundos - datos.minutosDesdeCambio * MILISEGUNDOS_POR_MINUTO)
  const estado = datos.estado ?? 'ACTIVO'
  const vendedor = VENDEDORES_EJEMPLO[datos.idCambio % VENDEDORES_EJEMPLO.length]

  const cambio: CambioMercaderiaDetalle = {
    idCambio: datos.idCambio,
    fechaHora: fechaHora.toISOString(),
    estado,
    ventaVinculada: venta
      ? { idVenta: venta.idVenta, numeroComprobante: venta.numeroComprobante }
      : null,
    saldoResultante: saldo,
    articuloDevuelto: {
      idProducto: productoDevuelto.idProducto,
      nombreProducto: productoDevuelto.nombreProducto,
      formatoVenta: productoDevuelto.formatoVenta,
      cantidad: datos.cantidadDevuelta,
      precioUnitario: precioUnitarioDevuelto,
      subtotal: valorDevuelto,
      esBolsaAbierta,
      idProductoStockIngresado: productoStockIngresado.idProducto,
      nombreProductoStockIngresado: productoStockIngresado.nombreProducto,
    },
    articuloEntregado: {
      idProducto: productoEntregado.idProducto,
      nombreProducto: productoEntregado.nombreProducto,
      formatoVenta: productoEntregado.formatoVenta,
      cantidad: datos.cantidadEntregada,
      precioUnitario: productoEntregado.precioUnitario,
      subtotal: valorEntregado,
    },
    valorDevuelto,
    valorEntregado,
    pagoSaldo: medio
      ? {
          idMedioPago: medio.idMedioPago,
          nombreMedioPago: medio.nombre,
          montoRecibido,
          vuelto: montoRecibido === null ? null : montoRecibido - saldo,
        }
      : null,
    motivo: {
      codigoMotivo: datos.codigoMotivo,
      detalleMotivo: datos.codigoMotivo === CODIGO_MOTIVO_OTRO ? (datos.detalleMotivo ?? null) : null,
    },
    vendedor,
    anulacion:
      estado === 'ANULADO' && datos.anulacion
        ? {
            accion: 'ANULAR',
            codigoMotivo: datos.anulacion.codigoMotivo,
            detalleMotivo: null,
            nombreUsuario: VENDEDORES_EJEMPLO[(datos.idCambio + 1) % VENDEDORES_EJEMPLO.length].nombre,
            fechaHora: new Date(fechaHora.getTime() + datos.anulacion.minutosDespues * MILISEGUNDOS_POR_MINUTO).toISOString(),
          }
        : null,
    fechaHoraLimiteModificacion: null,
  }
  return { ...cambio, fechaHoraLimiteModificacion: calcularLimiteModificacionCambio(cambio) }
}

/** Cambios con un comportamiento fijo para probar cada caso (ver la tabla del hook). */
function crearCambiosEspeciales(ahoraMilisegundos: number, ventas: VentaDetalle[]): CambioMercaderiaDetalle[] {
  const datosEspeciales: DatosCambioEjemplo[] = [
    // Plazo vigente, vinculado, con un articulo a granel entregado
    { idCambio: 2012, minutosDesdeCambio: 2, idVentaOriginal: 1046, idProductoDevuelto: 5, cantidadDevuelta: 1, idProductoEntregado: 8, cantidadEntregada: 3, idMedioPago: 4, codigoMotivo: 'NO_LE_GUSTO_A_LA_MASCOTA' },
    // Plazo vigente, pero el servidor rechaza editar y anular con 403
    { idCambio: 2011, minutosDesdeCambio: 4, idVentaOriginal: null, idProductoDevuelto: 6, cantidadDevuelta: 1, idProductoEntregado: 5, cantidadEntregada: 1, idMedioPago: 2, codigoMotivo: 'ERROR_EN_LA_ENTREGA' },
    // Le quedan 30 segundos: se ve vencer en vivo. Sin saldo
    { idCambio: 2010, minutosDesdeCambio: 14.5, idVentaOriginal: 1044, idProductoDevuelto: 6, cantidadDevuelta: 1, idProductoEntregado: 6, cantidadEntregada: 1, codigoMotivo: 'MEDIDA_INCORRECTA' },
    // Desvinculado, con bolsa abierta devuelta (peso real menor al nominal); anular responde 409
    { idCambio: 2009, minutosDesdeCambio: 8, idVentaOriginal: null, idProductoDevuelto: 2, cantidadDevuelta: 7.2, esBolsaAbierta: true, idProductoEntregado: 8, cantidadEntregada: 8, idMedioPago: 1, codigoMotivo: 'PRODUCTO_DEFECTUOSO' },
    // Agoto el tope de las piedras sanitarias de la venta 1047 (se vendieron 2)
    { idCambio: 2008, minutosDesdeCambio: 90, idVentaOriginal: 1047, idProductoDevuelto: 3, cantidadDevuelta: 2, idProductoEntregado: 7, cantidadEntregada: 1, idMedioPago: 3, codigoMotivo: 'OTRO', detalleMotivo: 'Las piedras tenían olor fuerte y la gata no las usa' },
    // Anulado: no cuenta para el tope y conserva su auditoria
    { idCambio: 2007, minutosDesdeCambio: 50, estado: 'ANULADO', idVentaOriginal: 1046, idProductoDevuelto: 2, cantidadDevuelta: 1, idProductoEntregado: 1, cantidadEntregada: 1, idMedioPago: 1, codigoMotivo: 'NO_LE_GUSTO_A_LA_MASCOTA', anulacion: { codigoMotivo: 'CLIENTE_SE_ARREPINTIO', minutosDespues: 6 } },
    // Vinculado a una venta con producto a granel
    { idCambio: 2006, minutosDesdeCambio: 180, idVentaOriginal: 1043, idProductoDevuelto: 8, cantidadDevuelta: 1.5, idProductoEntregado: 4, cantidadEntregada: 2, idMedioPago: 2, codigoMotivo: 'NO_LE_GUSTO_A_LA_MASCOTA' },
  ]
  return datosEspeciales.map((datos) => crearCambioEjemplo(ahoraMilisegundos, ventas, datos))
}

/** Cambios mas viejos, generados con un patron fijo para tener varias paginas. */
function crearCambiosAnteriores(ahoraMilisegundos: number, ventas: VentaDetalle[]): CambioMercaderiaDetalle[] {
  // Cada venta se vincula a lo sumo una vez: asi nunca se supera lo que vendio
  const ventasVinculables = ventas.filter(
    (venta) => venta.estado === 'COMPLETADA' && venta.idVenta <= 1037 && venta.items.length > 0,
  )
  const productosPorPrecio = CATALOGO_CAMBIOS_EJEMPLO.filter((producto) => producto.formatoVenta === 'UNIDAD').toSorted(
    (primero, segundo) => primero.precioUnitario - segundo.precioUnitario,
  )
  let indiceVenta = 0

  return Array.from({ length: 33 }, (_, indice) => {
    const desvinculado = indice % 4 === 0 || indiceVenta >= ventasVinculables.length
    const venta = desvinculado ? null : ventasVinculables[indiceVenta++]
    const itemVenta = venta?.items[0]

    // Lo devuelto: el primer renglon de la venta, o un producto barato del catalogo
    const productoDevuelto = itemVenta
      ? obtenerProductoCambioEjemplo(itemVenta.idProducto)
      : productosPorPrecio[indice % 3]
    const cantidadDevuelta = itemVenta?.formatoVenta === 'GRANEL' ? Math.min(1, itemVenta.cantidad) : 1
    const precioDevuelto = itemVenta?.precioUnitario ?? productoDevuelto.precioUnitario
    const valorDevuelto = Math.round(cantidadDevuelta * precioDevuelto)

    // Lo entregado: el producto mas barato que iguale o supere ese valor; si no hay, varias unidades del mas caro
    const productoEntregado =
      productosPorPrecio.find(
        (producto) => producto.idProducto !== productoDevuelto.idProducto && producto.precioUnitario >= valorDevuelto,
      ) ?? productosPorPrecio[productosPorPrecio.length - 1]
    const cantidadEntregada = Math.max(1, Math.ceil(valorDevuelto / productoEntregado.precioUnitario))

    const anulado = indice % 7 === 5
    return crearCambioEjemplo(ahoraMilisegundos, ventas, {
      idCambio: 2005 - indice,
      minutosDesdeCambio: 240 + indice * 131,
      estado: anulado ? 'ANULADO' : 'ACTIVO',
      idVentaOriginal: venta?.idVenta ?? null,
      idProductoDevuelto: productoDevuelto.idProducto,
      cantidadDevuelta,
      idProductoEntregado: productoEntregado.idProducto,
      cantidadEntregada,
      idMedioPago: (indice % 4) + 1,
      codigoMotivo: MOTIVOS_CAMBIO[indice % MOTIVOS_CAMBIO.length].codigo,
      detalleMotivo: 'El cliente prefirió otra marca',
      anulacion: anulado ? { codigoMotivo: 'ERROR_DE_CARGA', minutosDespues: 7 } : undefined,
    })
  })
}

/** Todos los cambios de la maqueta, calculados contra el momento en que se abre la pantalla. */
export function crearCambiosEjemplo(ahoraMilisegundos: number, ventas: VentaDetalle[]): CambioMercaderiaDetalle[] {
  return [...crearCambiosEspeciales(ahoraMilisegundos, ventas), ...crearCambiosAnteriores(ahoraMilisegundos, ventas)]
}
