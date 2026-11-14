import { MOTIVOS_ANULACION } from '@/features/ventas/config/motivos-venta'
import { MEDIOS_EJEMPLO } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import { calcularLimiteModificacion } from '@/features/ventas/utils/calcular-plazo-modificacion'
import type {
  DatosAnulacion,
  EstadoVentaHistorial,
  FormatoVenta,
  ModalidadEntrega,
  OrigenVenta,
  PagoVentaDetalle,
  ProductoFiltro,
  VentaDetalle,
} from '@/features/ventas/types/historial'

// --- DATOS DE EJEMPLO ---
// Temporal: lo usa Cambios posventa hasta que se integre con el back (el Historial ya usa el back).
// Las fechas se calculan contra "ahora" para que el contador de 15 minutos se pueda ver correr.

/** Producto del catalogo de ejemplo. */
export interface ProductoEjemplo extends ProductoFiltro {
  formatoVenta: FormatoVenta
  precioUnitario: number
}

export const PRODUCTOS_EJEMPLO: ProductoEjemplo[] = [
  { idProducto: 1, nombreProducto: 'Alimento balanceado perro adulto 15 kg', formatoVenta: 'UNIDAD', precioUnitario: 48500 },
  { idProducto: 2, nombreProducto: 'Alimento balanceado gato adulto 7,5 kg', formatoVenta: 'UNIDAD', precioUnitario: 31200 },
  { idProducto: 3, nombreProducto: 'Piedras sanitarias 4 kg', formatoVenta: 'UNIDAD', precioUnitario: 6800 },
  { idProducto: 4, nombreProducto: 'Alimento perro cachorro (granel)', formatoVenta: 'GRANEL', precioUnitario: 2900 },
  { idProducto: 5, nombreProducto: 'Collar antipulgas', formatoVenta: 'UNIDAD', precioUnitario: 8900 },
  { idProducto: 6, nombreProducto: 'Shampoo para perros', formatoVenta: 'UNIDAD', precioUnitario: 5400 },
  { idProducto: 7, nombreProducto: 'Rascador para gatos', formatoVenta: 'UNIDAD', precioUnitario: 21500 },
  { idProducto: 8, nombreProducto: 'Alimento gato (granel)', formatoVenta: 'GRANEL', precioUnitario: 3400 },
]

const CLIENTES_EJEMPLO = [
  'Marta López',
  'Juan Pérez',
  'Carolina Díaz',
  'Ricardo Sosa',
  'Familia Romero',
  'Paula Benítez',
]

const VENDEDORES_EJEMPLO = [
  { idUsuario: 1, nombre: 'Lucía Gómez' },
  { idUsuario: 2, nombre: 'Martín Pérez' },
  { idUsuario: 3, nombre: 'Usuario' },
]

const MILISEGUNDOS_POR_MINUTO = 60 * 1000

// --- PAGOS ---

/**
 * Arma un pago como lo registra el back: aplica el ajuste del medio sobre la parte que cubre.
 * En efectivo registra el monto recibido (si no se informa, se redondea al proximo mil) y el vuelto.
 */
function crearPagoEjemplo(
  idMedioPago: number,
  montoBase: number,
  montoRecibidoInformado?: number,
): PagoVentaDetalle {
  const medio = MEDIOS_EJEMPLO.find((candidato) => candidato.idMedioPago === idMedioPago)
  if (!medio) throw new Error(`El medio de pago ${idMedioPago} no existe en los datos de ejemplo`)

  const porcentajeAplicado =
    medio.tipoAjuste === 'descuento'
      ? -medio.porcentajeAjuste
      : medio.tipoAjuste === 'recargo'
        ? medio.porcentajeAjuste
        : 0
  const montoFinal = montoBase + Math.round((montoBase * porcentajeAplicado) / 100)
  const montoRecibido = medio.admiteVuelto
    ? (montoRecibidoInformado ?? Math.ceil(montoFinal / 1000) * 1000)
    : null

  return {
    idMedioPago,
    nombreMedioPago: medio.nombre,
    montoBase,
    porcentajeAplicado,
    montoFinal,
    admiteVuelto: medio.admiteVuelto,
    montoRecibido,
    vuelto: montoRecibido === null ? null : Math.max(montoRecibido - montoFinal, 0),
  }
}

/** Reparte el importe entre uno o dos medios (en dos, mitad y resto). */
function crearPagosEjemplo(importe: number, idsMediosPago: number[]): PagoVentaDetalle[] {
  // Un fiado pendiente (o una anulada que era fiado) no tiene pagos
  if (idsMediosPago.length === 0) return []
  if (idsMediosPago.length === 1) return [crearPagoEjemplo(idsMediosPago[0], importe)]
  const primeraParte = Math.round(importe / 2)
  return [
    crearPagoEjemplo(idsMediosPago[0], primeraParte),
    crearPagoEjemplo(idsMediosPago[1], importe - primeraParte),
  ]
}

// --- VENTAS ---

/** Descripcion compacta de una venta de ejemplo. */
interface DatosVentaEjemplo {
  idVenta: number
  /** Puede ser decimal: 14,5 es 14 minutos y 30 segundos. */
  minutosDesdeVenta: number
  estado: EstadoVentaHistorial
  origen?: OrigenVenta
  modalidadEntrega?: ModalidadEntrega
  clienteReferencia: string | null
  /** Pares [idProducto, cantidad]. */
  items: Array<[number, number]>
  descuentoManual?: { monto: number; motivo: string }
  /** Medios con los que se cobro; vacio en un fiado pendiente o en una anulada que era fiado. */
  idsMediosPago?: number[]
  /** Minutos desde que se cobro un fiado, si fue mucho despues de la venta. */
  minutosDesdePago?: number
  indiceVendedor?: number
}

/** Anulacion de ejemplo: el motivo rota segun la venta, y a veces es "Otro" con su detalle. */
function crearAnulacionEjemplo(idVenta: number, fechaHoraVenta: Date): DatosAnulacion {
  const { codigo, etiqueta } = MOTIVOS_ANULACION[idVenta % MOTIVOS_ANULACION.length]
  const vendedor = VENDEDORES_EJEMPLO[idVenta % VENDEDORES_EJEMPLO.length]
  return {
    motivo: codigo === 'OTRO' ? 'El cliente se fue sin avisar y dejó el pedido armado' : etiqueta,
    idUsuario: vendedor.idUsuario,
    nombreUsuario: vendedor.nombre,
    // Se anula a los pocos minutos de la venta, dentro de la ventana de 15
    fechaHora: new Date(fechaHoraVenta.getTime() + 5 * MILISEGUNDOS_POR_MINUTO).toISOString(),
  }
}

function crearVentaEjemplo(ahoraMilisegundos: number, datos: DatosVentaEjemplo): VentaDetalle {
  const items = datos.items.map(([idProducto, cantidad]) => {
    const producto = PRODUCTOS_EJEMPLO.find((candidato) => candidato.idProducto === idProducto)
    if (!producto) throw new Error(`El producto ${idProducto} no existe en los datos de ejemplo`)
    return {
      idProducto,
      nombreProducto: producto.nombreProducto,
      formatoVenta: producto.formatoVenta,
      cantidad,
      precioUnitario: producto.precioUnitario,
      subtotal: Math.round(producto.precioUnitario * cantidad),
    }
  })
  const subtotalBruto = items.reduce((acumulado, item) => acumulado + item.subtotal, 0)
  const descuentoManual = datos.descuentoManual?.monto ?? 0
  const importeAdeudado = subtotalBruto - descuentoManual
  const pagos = crearPagosEjemplo(importeAdeudado, datos.idsMediosPago ?? [])

  const fechaHora = new Date(ahoraMilisegundos - datos.minutosDesdeVenta * MILISEGUNDOS_POR_MINUTO)
  const fechaHoraPago =
    pagos.length === 0
      ? null
      : new Date(
          datos.minutosDesdePago === undefined
            ? fechaHora.getTime()
            : ahoraMilisegundos - datos.minutosDesdePago * MILISEGUNDOS_POR_MINUTO,
        ).toISOString()
  const origen = datos.origen ?? 'MOSTRADOR'
  const vendedor = VENDEDORES_EJEMPLO[(datos.indiceVendedor ?? datos.idVenta) % VENDEDORES_EJEMPLO.length]

  const venta: VentaDetalle = {
    idVenta: datos.idVenta,
    // Mismo formato que arma el back: CMP- y el id de la venta con 8 digitos
    numeroComprobante: `CMP-${String(datos.idVenta).padStart(8, '0')}`,
    fechaHora: fechaHora.toISOString(),
    fechaHoraPago,
    estado: datos.estado,
    // Cobrada: lo que pagaron los medios. Fiado: el importe adeudado
    montoTotal:
      pagos.length > 0
        ? pagos.reduce((acumulado, pago) => acumulado + pago.montoFinal, 0)
        : importeAdeudado,
    clienteReferencia: datos.clienteReferencia,
    origen,
    modalidadEntrega: datos.modalidadEntrega ?? 'RETIRO',
    vendedor,
    subtotalBruto,
    descuentoManual,
    motivoDescuento: datos.descuentoManual?.motivo ?? null,
    items,
    pagos,
    anulacion: datos.estado === 'ANULADA' ? crearAnulacionEjemplo(datos.idVenta, fechaHora) : null,
    fechaHoraLimiteModificacion: null,
  }
  return { ...venta, fechaHoraLimiteModificacion: calcularLimiteModificacion(venta) }
}

/** Ventas con un comportamiento fijo para probar cada caso del historial. */
function crearVentasEspeciales(ahoraMilisegundos: number): VentaDetalle[] {
  const datosEspeciales: DatosVentaEjemplo[] = [
    // Plazo vigente, sin trampas
    { idVenta: 1047, minutosDesdeVenta: 2, estado: 'COMPLETADA', clienteReferencia: null, items: [[1, 1], [3, 2]], idsMediosPago: [1] },
    // Plazo vigente, pero el servidor rechaza editar y anular con 403
    { idVenta: 1046, minutosDesdeVenta: 4, estado: 'COMPLETADA', origen: 'DIGITAL', modalidadEntrega: 'ENVIO', clienteReferencia: 'Carolina Díaz', items: [[2, 1], [5, 1]], idsMediosPago: [3] },
    // Fiado reciente: se puede cobrar, editar y anular
    { idVenta: 1045, minutosDesdeVenta: 6, estado: 'PENDIENTE_PAGO', clienteReferencia: 'Marta López', items: [[1, 1], [4, 2.5]], descuentoManual: { monto: 3000, motivo: 'Cliente frecuente' } },
    // Le quedan 30 segundos: se ve vencer en vivo
    { idVenta: 1044, minutosDesdeVenta: 14.5, estado: 'COMPLETADA', clienteReferencia: null, items: [[6, 2]], idsMediosPago: [2] },
    // Fiado de ayer saldado hace 5 minutos: el plazo corre desde el pago
    { idVenta: 1043, minutosDesdeVenta: 26 * 60, estado: 'COMPLETADA', clienteReferencia: 'Juan Pérez', items: [[7, 1], [8, 3]], idsMediosPago: [1, 2], minutosDesdePago: 5 },
    // Cobrar responde 409: ya la cobro otro usuario
    { idVenta: 1042, minutosDesdeVenta: 20, estado: 'PENDIENTE_PAGO', clienteReferencia: 'Ricardo Sosa', items: [[3, 3]] },
    // Anulada hace un rato
    { idVenta: 1039, minutosDesdeVenta: 30, estado: 'ANULADA', clienteReferencia: null, items: [[5, 1]], idsMediosPago: [4] },
    // Cobrar responde 409: no hay caja abierta
    { idVenta: 1041, minutosDesdeVenta: 60, estado: 'PENDIENTE_PAGO', clienteReferencia: 'Familia Romero', items: [[2, 2]] },
    // Cobrar responde 404: la venta ya no existe
    { idVenta: 1040, minutosDesdeVenta: 120, estado: 'PENDIENTE_PAGO', clienteReferencia: 'Paula Benítez', items: [[6, 1], [3, 1]] },
    // Fiado vencido que se puede cobrar sin problemas (el cobro no tiene limite de tiempo)
    { idVenta: 1038, minutosDesdeVenta: 180, estado: 'PENDIENTE_PAGO', origen: 'DIGITAL', modalidadEntrega: 'ENVIO', clienteReferencia: 'Marta López', items: [[1, 2]] },
  ]
  return datosEspeciales.map((datos) => crearVentaEjemplo(ahoraMilisegundos, datos))
}

/** Ventas mas viejas, generadas con un patron fijo para tener varias paginas. */
function crearVentasAnteriores(ahoraMilisegundos: number): VentaDetalle[] {
  return Array.from({ length: 37 }, (_, indice) => {
    const producto = PRODUCTOS_EJEMPLO[indice % PRODUCTOS_EJEMPLO.length]
    const otroProducto = PRODUCTOS_EJEMPLO[(indice + 3) % PRODUCTOS_EJEMPLO.length]
    const cantidadDe = (candidato: ProductoEjemplo) => (candidato.formatoVenta === 'GRANEL' ? 1.5 : 1 + (indice % 2))
    const items: Array<[number, number]> =
      indice % 3 === 0
        ? [[producto.idProducto, cantidadDe(producto)]]
        : [
            [producto.idProducto, cantidadDe(producto)],
            [otroProducto.idProducto, cantidadDe(otroProducto)],
          ]
    const subtotal = items.reduce(
      (acumulado, [idProducto, cantidad]) =>
        acumulado + Math.round((PRODUCTOS_EJEMPLO.find((candidato) => candidato.idProducto === idProducto)?.precioUnitario ?? 0) * cantidad),
      0,
    )

    const ciclo = indice % 6
    const estado: EstadoVentaHistorial =
      ciclo === 0 ? 'PENDIENTE_PAGO' : ciclo === 3 ? 'ANULADA' : 'COMPLETADA'
    const cliente = CLIENTES_EJEMPLO[indice % CLIENTES_EJEMPLO.length]
    const esFiadoSaldado = estado === 'COMPLETADA' && indice % 9 === 2
    const anuladaConPagos = estado === 'ANULADA' && indice % 2 === 0
    const tienePagos = estado === 'COMPLETADA' || anuladaConPagos
    const minutosDesdeVenta = 240 + indice * 137

    return crearVentaEjemplo(ahoraMilisegundos, {
      idVenta: 1037 - indice,
      minutosDesdeVenta,
      estado,
      origen: indice % 3 === 0 ? 'DIGITAL' : 'MOSTRADOR',
      modalidadEntrega: indice % 3 === 0 ? (indice % 2 === 0 ? 'ENVIO' : 'RETIRO') : indice % 8 === 0 ? 'ENVIO' : 'RETIRO',
      clienteReferencia:
        estado === 'PENDIENTE_PAGO' || estado === 'ANULADA' || esFiadoSaldado || indice % 4 === 0
          ? cliente
          : null,
      items,
      descuentoManual:
        indice % 7 === 3
          ? { monto: Math.round(subtotal * 0.1), motivo: 'Producto con envase dañado' }
          : undefined,
      idsMediosPago: tienePagos
        ? indice % 5 === 1 && estado === 'COMPLETADA'
          ? [1, 2]
          : [(indice % 4) + 1]
        : [],
      minutosDesdePago: esFiadoSaldado ? minutosDesdeVenta - 60 : undefined,
    })
  })
}

/** Todas las ventas de la maqueta, calculadas contra el momento en que se abre la pantalla. */
export function crearVentasEjemplo(ahoraMilisegundos: number): VentaDetalle[] {
  return [...crearVentasEspeciales(ahoraMilisegundos), ...crearVentasAnteriores(ahoraMilisegundos)]
}
