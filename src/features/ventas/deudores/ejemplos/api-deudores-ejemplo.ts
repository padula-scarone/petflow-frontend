import {
  cobrarFiadosAlmacenados,
  leerFichaDeudor,
  registrarVentaConDeudaAlmacenada,
  type FiadoACobrar,
  type ResultadoCobroEjemplo,
  type ResultadoRegistroConDeudaEjemplo,
  type VentaConDeudaARegistrar,
} from '@/features/ventas/deudores/ejemplos/cuenta-corriente-ejemplo'
import {
  crearDeudorAlmacenado,
  editarDeudorAlmacenado,
  leerDeudoresPorBusqueda,
  leerPaginaDeudores,
} from '@/features/ventas/deudores/ejemplos/almacen-deudores-ejemplo'
import {
  BUSQUEDA_CON_ERROR_EJEMPLO,
  BUSQUEDA_SIN_RESULTADOS_EJEMPLO,
  ID_DEUDOR_CON_ERROR_EJEMPLO,
} from '@/features/ventas/deudores/ejemplos/disparadores-ejemplo'
import { simularLatencia } from '@/features/ventas/deudores/ejemplos/simular-latencia'
import { MENSAJE_BUSQUEDA_DEUDORES_FALLIDA } from '@/features/ventas/deudores/config/mensajes-deudores'
import { SUGERENCIAS_DEUDOR_MAXIMAS } from '@/features/ventas/deudores/config/reglas-deudores'
import type { FilaDeudor, FiltrosDeudores } from '@/features/ventas/deudores/types/cuenta-corriente'
import type {
  DatosDeudor,
  EstadoGuardadoDeudor,
  ResultadoBusquedaDeudor,
} from '@/features/ventas/deudores/types/deudor'
import type { FichaDeudorAlmacenada } from '@/features/ventas/deudores/ejemplos/cuenta-corriente-ejemplo'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { ErrorApi, ResultadoApi } from '@/lib/cliente-http.types'

// Hace el papel de la capa de API de Deudores: cada funcion es el endpoint que el back todavia no tiene (o el que ya
// existe, pero con los campos nuevos que se le piden). Todas esperan un rato, como una respuesta real.

const ERROR_SIN_RED: ErrorApi = {
  tipo: 'SIN_RED',
  estado: null,
  mensaje: null,
  codigo: null,
  errores: [],
}


// --- LISTA ---
/** Una pagina de la lista de Deudores, como la devolveria GET /api/deudores. */
export interface PaginaDeudoresConsultada {
  deudores: FilaDeudor[]
  paginacion: PaginacionResultados
}

/** GET /api/deudores con saldo, fiados pendientes y proxima fecha (campos nuevos). */
export async function consultarDeudoresApiEjemplo(
  filtros: FiltrosDeudores,
  pagina: number,
  cantidadPorPagina: number,
): Promise<ResultadoApi<PaginaDeudoresConsultada>> {
  await simularLatencia()
  if (filtros.busqueda.trim().toLowerCase() === BUSQUEDA_CON_ERROR_EJEMPLO) {
    return { exitoso: false, error: ERROR_SIN_RED }
  }
  return { exitoso: true, datos: leerPaginaDeudores(filtros, pagina, cantidadPorPagina) }
}

/** GET /api/deudores?busqueda= para elegir un deudor en Registrar Venta. */
export async function buscarDeudoresApiEjemplo(texto: string): Promise<ResultadoBusquedaDeudor> {
  await simularLatencia()
  const textoNormalizado = texto.trim().toLowerCase()
  if (textoNormalizado === BUSQUEDA_CON_ERROR_EJEMPLO) {
    return { fase: 'error', mensaje: MENSAJE_BUSQUEDA_DEUDORES_FALLIDA }
  }
  const deudores =
    textoNormalizado === BUSQUEDA_SIN_RESULTADOS_EJEMPLO ? [] : leerDeudoresPorBusqueda(texto, SUGERENCIAS_DEUDOR_MAXIMAS)
  return deudores.length === 0
    ? { fase: 'sin-resultados', textoBuscado: texto.trim() }
    : { fase: 'con-resultados', deudores }
}

// --- ALTA Y EDICION ---
/** POST /api/deudores. */
export async function crearDeudorApiEjemplo(datos: DatosDeudor): Promise<EstadoGuardadoDeudor> {
  await simularLatencia()
  const resultado = crearDeudorAlmacenado(datos)
  return resultado.tipo === 'creado'
    ? { fase: 'guardado', deudor: resultado.deudor }
    : { fase: 'dni-duplicado', deudorExistente: resultado.deudorExistente }
}

/** PUT /api/deudores/:idDeudor. */
export async function editarDeudorApiEjemplo(idDeudor: number, datos: DatosDeudor): Promise<EstadoGuardadoDeudor> {
  await simularLatencia()
  const resultado = editarDeudorAlmacenado(idDeudor, datos)
  if (resultado.tipo === 'editado') return { fase: 'guardado', deudor: resultado.deudor }
  if (resultado.tipo === 'no-encontrado') return { fase: 'no-encontrado' }
  return { fase: 'dni-duplicado', deudorExistente: resultado.deudorExistente }
}

// --- FICHA ---
/** Resultado del estado de cuenta de un deudor. */
export type ResultadoFichaDeudor =
  | { tipo: 'listo'; ficha: FichaDeudorAlmacenada }
  | { tipo: 'no-encontrado' }
  | { tipo: 'error' }

/** GET /api/deudores/:idDeudor, con su saldo y fiados pendientes. */
export async function consultarFichaApiEjemplo(idDeudor: number): Promise<ResultadoFichaDeudor> {
  await simularLatencia()
  if (idDeudor === ID_DEUDOR_CON_ERROR_EJEMPLO) return { tipo: 'error' }
  const ficha = leerFichaDeudor(idDeudor)
  return ficha === null ? { tipo: 'no-encontrado' } : { tipo: 'listo', ficha }
}

// --- VENTA CON DEUDA Y COBRO ---
/** POST /api/ventas con pago parcial, idDeudor y fecha estimada. */
export async function registrarVentaConDeudaApiEjemplo(
  venta: VentaConDeudaARegistrar,
): Promise<ResultadoRegistroConDeudaEjemplo> {
  await simularLatencia()
  return registrarVentaConDeudaAlmacenada(venta)
}

/** POST /api/deudores/:idDeudor/cobros. Todo o nada. */
export async function cobrarFiadosApiEjemplo(
  idDeudor: number,
  fiados: FiadoACobrar[],
): Promise<ResultadoCobroEjemplo> {
  await simularLatencia()
  return cobrarFiadosAlmacenados(idDeudor, fiados)
}
