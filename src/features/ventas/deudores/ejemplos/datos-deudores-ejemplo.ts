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

/** Numero de recibo de ejemplo de un cobro de fiados: numeracion propia, distinta de la de las ventas. */
export function armarNumeroReciboEjemplo(idCobro: number) {
  return `REC-${String(idCobro).padStart(8, '0')}`
}

interface DatosPagoEjemplo {
  diasDesdeElPago: number
  pesos: number
  /** Id del cobro que lo registro. El pago inicial de un fiado tambien es un cobro, con su recibo. */
  idCobro: number
}

interface DatosFiadoEjemplo {
  idVenta: number
  diasDesdeLaVenta: number
  /** Dias hasta la fecha estimada (negativo = ya vencio); null = sin fecha. */
  diasHastaLaFecha: number | null
  importePesos: number
  pagos?: DatosPagoEjemplo[]
}

function crearFiado(datos: DatosFiadoEjemplo): FiadoAlmacenado {
  return {
    idVenta: datos.idVenta,
    numeroComprobante: armarNumeroComprobanteEjemplo(datos.idVenta),
    fechaHora: fechaHoraHaceDias(datos.diasDesdeLaVenta),
    fechaEstimadaPago:
      datos.diasHastaLaFecha === null ? null : sumarDiasAFecha(obtenerFechaHoy(), datos.diasHastaLaFecha),
    importeAdeudadoCentavos: convertirPesosACentavos(datos.importePesos),
    pagos: (datos.pagos ?? []).map((pago) => ({
      fechaHora: fechaHoraHaceDias(pago.diasDesdeElPago),
      montoCentavos: convertirPesosACentavos(pago.pesos),
      numeroRecibo: armarNumeroReciboEjemplo(pago.idCobro),
    })),
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
      crearDeudor(1, 'Marta Gimenez', '5491144556677', '20111222', [
        {
          idVenta: 9001,
          diasDesdeLaVenta: 20,
          diasHastaLaFecha: -3,
          importePesos: 18500,
          pagos: [
            { diasDesdeElPago: 20, pesos: 3000, idCobro: 41 },
            { diasDesdeElPago: 12, pesos: 2000, idCobro: 51 },
          ],
        },
        { idVenta: 9002, diasDesdeLaVenta: 6, diasHastaLaFecha: 7, importePesos: 12000 },
      ]),
      crearDeudor(2, 'Carlos Perez', '5493515550102', '30222333', [
        {
          idVenta: 9003,
          diasDesdeLaVenta: 10,
          diasHastaLaFecha: 5,
          importePesos: 24300,
          pagos: [
            { diasDesdeElPago: 10, pesos: 4000, idCobro: 42 },
            { diasDesdeElPago: 6, pesos: 3500, idCobro: 53 },
            { diasDesdeElPago: 2, pesos: 2500, idCobro: 57 },
          ],
        },
      ]),
      crearDeudor(3, 'Lucia Fernandez', '5491122334455', '28444555', [
        { idVenta: 9004, diasDesdeLaVenta: 30, diasHastaLaFecha: null, importePesos: 9800 },
        { idVenta: 9005, diasDesdeLaVenta: 12, diasHastaLaFecha: null, importePesos: 15250 },
        { idVenta: 9006, diasDesdeLaVenta: 2, diasHastaLaFecha: 15, importePesos: 6400 },
      ]),
      crearDeudor(4, 'Roberto Sosa', '5492614440188', '17555666', [
        {
          idVenta: 9007,
          diasDesdeLaVenta: 45,
          diasHastaLaFecha: -10,
          importePesos: 41200,
          pagos: [{ diasDesdeElPago: 45, pesos: 12000, idCobro: 43 }],
        },
      ]),
      crearDeudor(5, 'Valeria Rios', '5493416677889', '33666777', [
        { idVenta: 9008, diasDesdeLaVenta: 3, diasHastaLaFecha: 1, importePesos: 7300 },
      ]),
      crearDeudor(6, 'Diego Alvarez', '5491133445566', '29777888', [
        { idVenta: 9009, diasDesdeLaVenta: 15, diasHastaLaFecha: 20, importePesos: 32800 },
      ]),
      crearDeudor(7, 'Sofia Benitez', '5492234801122', '36888999', [
        { idVenta: 9010, diasDesdeLaVenta: 8, diasHastaLaFecha: null, importePesos: 5600 },
      ]),
      // Cobrarle devuelve un 409 distinto segun el fiado que se incluya (ver disparadores-ejemplo)
      crearDeudor(8, 'Conflicto Demo', '5491155550000', '31000001', [
        {
          idVenta: ID_VENTA_FIADO_YA_NO_PENDIENTE_EJEMPLO,
          diasDesdeLaVenta: 7,
          diasHastaLaFecha: 3,
          importePesos: 8000,
        },
        {
          idVenta: ID_VENTA_FIADO_MONTO_SUPERA_FALTANTE_EJEMPLO,
          diasDesdeLaVenta: 6,
          diasHastaLaFecha: 4,
          importePesos: 9000,
        },
        {
          idVenta: ID_VENTA_FIADO_CAJA_CERRADA_EJEMPLO,
          diasDesdeLaVenta: 5,
          diasHastaLaFecha: 6,
          importePesos: 10000,
        },
      ]),
      // Confirmar una venta a su nombre devuelve 404 (ver disparadores-ejemplo)
      crearDeudor(9, 'Ex Deudor Demo', '5491155550001', '31000002', []),
      crearDeudor(10, 'Ana Martinez', '5491160001010', '25999000', [
        {
          idVenta: 9011,
          diasDesdeLaVenta: 60,
          diasHastaLaFecha: null,
          importePesos: 8000,
          pagos: [
            { diasDesdeElPago: 60, pesos: 2000, idCobro: 44 },
            { diasDesdeElPago: 40, pesos: 6000, idCobro: 50 },
          ],
        },
      ]),
      crearDeudor(11, 'Hector Molina', '5491170002020', '22123123', [
        { idVenta: 9012, diasDesdeLaVenta: 5, diasHastaLaFecha: 2, importePesos: 13900 },
      ]),
      crearDeudor(12, 'Patricia Luna', '5491180003030', '27234234', [
        {
          idVenta: 9013,
          diasDesdeLaVenta: 9,
          diasHastaLaFecha: -1,
          importePesos: 21000,
          pagos: [{ diasDesdeElPago: 5, pesos: 6000, idCobro: 55 }],
        },
      ]),
      crearDeudor(13, 'Julian Castro', '5491190004040', '38345345', [
        { idVenta: 9014, diasDesdeLaVenta: 4, diasHastaLaFecha: 30, importePesos: 4500 },
      ]),
      crearDeudor(14, 'Nora Quiroga', '5491110005050', '14456456', [
        { idVenta: 9015, diasDesdeLaVenta: 22, diasHastaLaFecha: -6, importePesos: 19900 },
      ]),
      crearDeudor(15, 'Mateo Ferreyra', '5491120006060', '40567567', []),
      crearDeudor(16, 'Ines Vega', '5491130007070', '26678678', [
        {
          idVenta: 9016,
          diasDesdeLaVenta: 70,
          diasHastaLaFecha: null,
          importePesos: 3000,
          pagos: [{ diasDesdeElPago: 50, pesos: 3000, idCobro: 52 }],
        },
      ]),
    ],
    proximoIdDeudor: 17,
    proximoIdVenta: 9200,
    // Los recibos de ejemplo usan ids menores a 100: los cobros de la demo arrancan despues
    proximoIdCobro: 100,
  }
}
