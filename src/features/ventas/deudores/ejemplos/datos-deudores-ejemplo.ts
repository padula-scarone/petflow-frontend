import {
  ID_VENTA_FIADO_CAJA_CERRADA_EJEMPLO,
  ID_VENTA_FIADO_MONTO_SUPERA_FALTANTE_EJEMPLO,
  ID_VENTA_FIADO_YA_NO_PENDIENTE_EJEMPLO,
} from '@/features/ventas/deudores/ejemplos/disparadores-ejemplo'
import type {
  DeudorAlmacenado,
  EstadoAlmacenDeudores,
  FiadoAlmacenado,
} from '@/features/ventas/deudores/ejemplos/tipos-almacen-ejemplo'
import { obtenerFechaHoy, sumarDiasAFecha } from '@/features/ventas/deudores/utils/fechas-estimadas'
import { convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

// Datos de ejemplo de la maqueta. Las fechas son relativas a hoy, para que "vencido" y "proximo pago" se vean bien
// cualquier dia que se abra la demo.

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000

/** Cuando se hizo la venta: tantos dias atras, al mediodia. */
function fechaHoraHaceDias(dias: number) {
  const instante = new Date(Date.now() - dias * MILISEGUNDOS_POR_DIA)
  instante.setHours(12, 0, 0, 0)
  return instante.toISOString()
}

/** Numero de comprobante de ejemplo para una venta fiada. */
export function armarNumeroComprobanteEjemplo(idVenta: number) {
  return `V-${String(idVenta).padStart(6, '0')}`
}

interface DatosFiadoEjemplo {
  idVenta: number
  diasDesdeLaVenta: number
  /** Dias hasta la fecha estimada (negativo = ya vencio); null = sin fecha. */
  diasHastaLaFecha: number | null
  importePesos: number
  pagadoPesos: number
}

function crearFiado(datos: DatosFiadoEjemplo): FiadoAlmacenado {
  return {
    idVenta: datos.idVenta,
    numeroComprobante: armarNumeroComprobanteEjemplo(datos.idVenta),
    fechaHora: fechaHoraHaceDias(datos.diasDesdeLaVenta),
    fechaEstimadaPago:
      datos.diasHastaLaFecha === null ? null : sumarDiasAFecha(obtenerFechaHoy(), datos.diasHastaLaFecha),
    importeAdeudadoCentavos: convertirPesosACentavos(datos.importePesos),
    montoPagadoCentavos: convertirPesosACentavos(datos.pagadoPesos),
  }
}

function crearDeudor(
  idDeudor: number,
  nombreCompleto: string,
  telefono: string,
  dni: string,
  fiados: DatosFiadoEjemplo[],
): DeudorAlmacenado {
  return { deudor: { idDeudor, nombreCompleto, telefono, dni }, fiados: fiados.map(crearFiado) }
}

/** Estado con el que arranca el almacen. */
export function crearEstadoInicialDeudores(): EstadoAlmacenDeudores {
  return {
    deudores: [
      crearDeudor(1, 'Marta Gimenez', '+54 9 11 4455-6677', '20111222', [
        { idVenta: 9001, diasDesdeLaVenta: 20, diasHastaLaFecha: -3, importePesos: 18500, pagadoPesos: 5000 },
        { idVenta: 9002, diasDesdeLaVenta: 6, diasHastaLaFecha: 7, importePesos: 12000, pagadoPesos: 0 },
      ]),
      crearDeudor(2, 'Carlos Perez', '+54 9 351 555-0102', '30222333', [
        { idVenta: 9003, diasDesdeLaVenta: 10, diasHastaLaFecha: 5, importePesos: 24300, pagadoPesos: 10000 },
      ]),
      crearDeudor(3, 'Lucia Fernandez', '+54 9 11 2233-4455', '28444555', [
        { idVenta: 9004, diasDesdeLaVenta: 30, diasHastaLaFecha: null, importePesos: 9800, pagadoPesos: 0 },
        { idVenta: 9005, diasDesdeLaVenta: 12, diasHastaLaFecha: null, importePesos: 15250, pagadoPesos: 0 },
        { idVenta: 9006, diasDesdeLaVenta: 2, diasHastaLaFecha: 15, importePesos: 6400, pagadoPesos: 0 },
      ]),
      crearDeudor(4, 'Roberto Sosa', '+54 9 261 444-0188', '17555666', [
        { idVenta: 9007, diasDesdeLaVenta: 45, diasHastaLaFecha: -10, importePesos: 41200, pagadoPesos: 12000 },
      ]),
      crearDeudor(5, 'Valeria Rios', '+54 9 341 6677-8899', '33666777', [
        { idVenta: 9008, diasDesdeLaVenta: 3, diasHastaLaFecha: 1, importePesos: 7300, pagadoPesos: 0 },
      ]),
      crearDeudor(6, 'Diego Alvarez', '+54 9 11 3344-5566', '29777888', [
        { idVenta: 9009, diasDesdeLaVenta: 15, diasHastaLaFecha: 20, importePesos: 32800, pagadoPesos: 0 },
      ]),
      crearDeudor(7, 'Sofia Benitez', '+54 9 223 480-1122', '36888999', [
        { idVenta: 9010, diasDesdeLaVenta: 8, diasHastaLaFecha: null, importePesos: 5600, pagadoPesos: 0 },
      ]),
      // Cobrarle devuelve un 409 distinto segun el fiado que se incluya (ver disparadores-ejemplo)
      crearDeudor(8, 'Conflicto Demo', '+54 9 11 5555-0000', '31000001', [
        {
          idVenta: ID_VENTA_FIADO_YA_NO_PENDIENTE_EJEMPLO,
          diasDesdeLaVenta: 7,
          diasHastaLaFecha: 3,
          importePesos: 8000,
          pagadoPesos: 0,
        },
        {
          idVenta: ID_VENTA_FIADO_MONTO_SUPERA_FALTANTE_EJEMPLO,
          diasDesdeLaVenta: 6,
          diasHastaLaFecha: 4,
          importePesos: 9000,
          pagadoPesos: 0,
        },
        {
          idVenta: ID_VENTA_FIADO_CAJA_CERRADA_EJEMPLO,
          diasDesdeLaVenta: 5,
          diasHastaLaFecha: 6,
          importePesos: 10000,
          pagadoPesos: 0,
        },
      ]),
      // Confirmar una venta a su nombre devuelve 404 (ver disparadores-ejemplo)
      crearDeudor(9, 'Ex Deudor Demo', '+54 9 11 5555-0001', '31000002', []),
      crearDeudor(10, 'Ana Martinez', '+54 9 11 6000-1010', '25999000', [
        { idVenta: 9011, diasDesdeLaVenta: 60, diasHastaLaFecha: null, importePesos: 8000, pagadoPesos: 8000 },
      ]),
      crearDeudor(11, 'Hector Molina', '+54 9 11 7000-2020', '22123123', [
        { idVenta: 9012, diasDesdeLaVenta: 5, diasHastaLaFecha: 2, importePesos: 13900, pagadoPesos: 0 },
      ]),
      crearDeudor(12, 'Patricia Luna', '+54 9 11 8000-3030', '27234234', [
        { idVenta: 9013, diasDesdeLaVenta: 9, diasHastaLaFecha: -1, importePesos: 21000, pagadoPesos: 6000 },
      ]),
      crearDeudor(13, 'Julian Castro', '+54 9 11 9000-4040', '38345345', [
        { idVenta: 9014, diasDesdeLaVenta: 4, diasHastaLaFecha: 30, importePesos: 4500, pagadoPesos: 0 },
      ]),
      crearDeudor(14, 'Nora Quiroga', '+54 9 11 1000-5050', '14456456', [
        { idVenta: 9015, diasDesdeLaVenta: 22, diasHastaLaFecha: -6, importePesos: 19900, pagadoPesos: 0 },
      ]),
      crearDeudor(15, 'Mateo Ferreyra', '+54 9 11 2000-6060', '40567567', []),
      crearDeudor(16, 'Ines Vega', '+54 9 11 3000-7070', '26678678', [
        { idVenta: 9016, diasDesdeLaVenta: 70, diasHastaLaFecha: null, importePesos: 3000, pagadoPesos: 3000 },
      ]),
    ],
    proximoIdDeudor: 17,
    proximoIdVenta: 9200,
    proximoIdCobro: 1,
  }
}
