import { escribirEstadoAlmacen, leerEstadoAlmacen } from '@/features/ventas/deudores/ejemplos/estado-almacen-ejemplo'
import type {
  DeudorAlmacenado,
  FiadoAlmacenado,
} from '@/features/ventas/deudores/ejemplos/tipos-almacen-ejemplo'
import type { FilaDeudor, FiltrosDeudores } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { DatosDeudor, Deudor } from '@/features/ventas/deudores/types/deudor'
import {
  esFechaPasada,
  obtenerDomingoDeLaSemana,
  obtenerFechaHoy,
} from '@/features/ventas/deudores/utils/fechas-estimadas'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'
import { normalizarTextoBusqueda } from '@/features/ventas/utils/normalizar-texto-busqueda'

// Lecturas y altas del almacen de deudores. Hace el papel de GET y POST /api/deudores y PUT /api/deudores/:idDeudor.

// --- CALCULOS DE LA CUENTA ---
/** Lo ya pagado de un fiado: la suma de sus pagos, en centavos. */
export function calcularPagadoFiadoCentavos(fiado: FiadoAlmacenado) {
  return fiado.pagos.reduce((acumulado, pago) => acumulado + pago.montoCentavos, 0)
}

/** Lo que falta pagar de un fiado, en centavos. */
export function calcularFaltanteFiadoCentavos(fiado: FiadoAlmacenado) {
  return Math.max(fiado.importeAdeudadoCentavos - calcularPagadoFiadoCentavos(fiado), 0)
}

/** Fiados que todavia tienen algo por pagar. */
export function filtrarFiadosPendientes(fiados: FiadoAlmacenado[]) {
  return fiados.filter((fiado) => calcularFaltanteFiadoCentavos(fiado) > 0)
}

/** Saldo del deudor: lo que falta de todos sus fiados pendientes, en centavos. */
export function calcularSaldoDeudorCentavos(deudor: DeudorAlmacenado) {
  return deudor.fiados.reduce((acumulado, fiado) => acumulado + calcularFaltanteFiadoCentavos(fiado), 0)
}

/** La fecha estimada mas cercana entre los fiados pendientes; null si ninguno tiene fecha. */
function buscarProximaFechaEstimada(deudor: DeudorAlmacenado) {
  const fechas = filtrarFiadosPendientes(deudor.fiados).flatMap((fiado) =>
    fiado.fechaEstimadaPago === null ? [] : [fiado.fechaEstimadaPago],
  )
  return fechas.length === 0 ? null : [...fechas].sort()[0]
}

/** La fecha de venta del fiado pendiente mas antiguo; null si no tiene fiados pendientes. */
function buscarFiadoMasAntiguo(deudor: DeudorAlmacenado) {
  const fechas = filtrarFiadosPendientes(deudor.fiados).map((fiado) => fiado.fechaHora)
  return fechas.length === 0 ? null : [...fechas].sort()[0]
}

function convertirAFilaDeudor(deudor: DeudorAlmacenado, hoy: string): FilaDeudor {
  const proximaFecha = buscarProximaFechaEstimada(deudor)
  return {
    idDeudor: deudor.deudor.idDeudor,
    nombreCompleto: deudor.deudor.nombreCompleto,
    telefono: deudor.deudor.telefono,
    dni: deudor.deudor.dni,
    cantidadFiadosPendientes: filtrarFiadosPendientes(deudor.fiados).length,
    saldo: convertirCentavosAPesos(calcularSaldoDeudorCentavos(deudor)),
    proximaFechaEstimadaPago: proximaFecha,
    proximoPagoVencido: proximaFecha !== null && esFechaPasada(proximaFecha, hoy),
    fiadoDesde: buscarFiadoMasAntiguo(deudor),
  }
}

/** Coincide si el texto esta en el nombre o en el DNI, sin distinguir mayusculas ni tildes. */
function coincideConBusqueda(deudor: Deudor, textoNormalizado: string) {
  if (textoNormalizado === '') return true
  return (
    normalizarTextoBusqueda(deudor.nombreCompleto).includes(textoNormalizado) ||
    deudor.dni.includes(textoNormalizado)
  )
}

function ordenarPorNombre<Elemento>(elementos: Elemento[], obtenerNombre: (elemento: Elemento) => string) {
  return [...elementos].sort((primero, segundo) =>
    obtenerNombre(primero).localeCompare(obtenerNombre(segundo), 'es'),
  )
}

/** Compara dos valores que pueden faltar: el que falta va siempre al final, sin importar el sentido. */
function compararConFaltantes<Valor extends string | number>(
  primero: Valor | null,
  segundo: Valor | null,
  signo: 1 | -1,
) {
  if (primero === null && segundo === null) return 0
  if (primero === null) return 1
  if (segundo === null) return -1
  if (primero === segundo) return 0
  return (primero < segundo ? -1 : 1) * signo
}

/** Ordena las filas segun el criterio y el sentido elegidos; a igual valor, por nombre. */
function ordenarFilasDeudores(filas: FilaDeudor[], filtros: FiltrosDeudores) {
  const signo = filtros.sentido === 'ASCENDENTE' ? 1 : -1
  const comparar = (primera: FilaDeudor, segunda: FilaDeudor) => {
    if (filtros.ordenarPor === 'NOMBRE') {
      return primera.nombreCompleto.localeCompare(segunda.nombreCompleto, 'es') * signo
    }
    if (filtros.ordenarPor === 'FIADOS_PENDIENTES') {
      return compararConFaltantes(primera.cantidadFiadosPendientes, segunda.cantidadFiadosPendientes, signo)
    }
    if (filtros.ordenarPor === 'SALDO') return compararConFaltantes(primera.saldo, segunda.saldo, signo)
    if (filtros.ordenarPor === 'PROXIMO_PAGO') {
      return compararConFaltantes(primera.proximaFechaEstimadaPago, segunda.proximaFechaEstimadaPago, signo)
    }
    return compararConFaltantes(primera.fiadoDesde, segunda.fiadoDesde, signo)
  }
  return [...filas].sort(
    (primera, segunda) =>
      comparar(primera, segunda) || primera.nombreCompleto.localeCompare(segunda.nombreCompleto, 'es'),
  )
}

/** Coincide con el filtro por proximo pago. Quien no debe nada no tiene proximo pago: no entra en ningun filtro. */
function coincideConProximoPago(fila: FilaDeudor, filtros: FiltrosDeudores, hoy: string) {
  if (filtros.proximoPago === null) return true
  if (fila.saldo === 0) return false
  const proxima = fila.proximaFechaEstimadaPago
  if (filtros.proximoPago === 'VENCIDOS') return fila.proximoPagoVencido
  if (filtros.proximoPago === 'SIN_FECHA') return proxima === null
  if (filtros.proximoPago === 'HOY') return proxima === hoy
  // ESTA_SEMANA: de hoy al domingo; lo vencido tiene su propia opcion
  return proxima !== null && proxima >= hoy && proxima <= obtenerDomingoDeLaSemana(hoy)
}

// --- LECTURAS ---
/**
 * Una pagina de GET /api/deudores. Sin busqueda trae solo a quienes tienen saldo; con busqueda tambien a quien no
 * debe nada, para poder encontrarlo.
 */
export function leerPaginaDeudores(filtros: FiltrosDeudores, pagina: number, cantidadPorPagina: number) {
  const hoy = obtenerFechaHoy()
  const textoNormalizado = normalizarTextoBusqueda(filtros.busqueda)
  const coincidentes = leerEstadoAlmacen()
    .deudores.filter((deudor) => coincideConBusqueda(deudor.deudor, textoNormalizado))
    .map((deudor) => convertirAFilaDeudor(deudor, hoy))
    .filter((fila) => textoNormalizado !== '' || fila.saldo > 0)
    .filter((fila) => coincideConProximoPago(fila, filtros, hoy))
  const ordenadas = ordenarFilasDeudores(coincidentes, filtros)

  const totalPaginas = Math.ceil(ordenadas.length / cantidadPorPagina)
  const paginacion: PaginacionResultados = {
    pagina,
    cantidadPorPagina,
    totalRegistros: ordenadas.length,
    totalPaginas,
  }
  const desde = (pagina - 1) * cantidadPorPagina
  return { deudores: ordenadas.slice(desde, desde + cantidadPorPagina), paginacion }
}

/** Busca deudores por nombre o DNI para elegir uno en Registrar Venta; no filtra por saldo. */
export function leerDeudoresPorBusqueda(texto: string, cantidadMaxima: number): Deudor[] {
  const textoNormalizado = normalizarTextoBusqueda(texto)
  const coincidentes = leerEstadoAlmacen()
    .deudores.map((deudor) => deudor.deudor)
    .filter((deudor) => coincideConBusqueda(deudor, textoNormalizado))
  return ordenarPorNombre(coincidentes, (deudor) => deudor.nombreCompleto).slice(0, cantidadMaxima)
}

/** El deudor con su cuenta; null si no existe (el back responde 404). */
export function leerDeudorAlmacenado(idDeudor: number) {
  return leerEstadoAlmacen().deudores.find((deudor) => deudor.deudor.idDeudor === idDeudor) ?? null
}

// --- ALTA Y EDICION ---
/** Resultado de dar de alta un deudor. */
export type ResultadoAltaDeudorEjemplo =
  | { tipo: 'creado'; deudor: Deudor }
  | { tipo: 'dni-duplicado'; deudorExistente: Deudor }

/** Resultado de editar un deudor. */
export type ResultadoEdicionDeudorEjemplo =
  | { tipo: 'editado'; deudor: Deudor }
  | { tipo: 'no-encontrado' }
  | { tipo: 'dni-duplicado'; deudorExistente: Deudor }

/** POST /api/deudores: 201 con el deudor creado, o 409 si el DNI ya es de otra persona. */
export function crearDeudorAlmacenado(datos: DatosDeudor): ResultadoAltaDeudorEjemplo {
  const existente = leerEstadoAlmacen().deudores.find((deudor) => deudor.deudor.dni === datos.dni)
  if (existente) return { tipo: 'dni-duplicado', deudorExistente: existente.deudor }

  const nuevo: Deudor = { idDeudor: leerEstadoAlmacen().proximoIdDeudor, ...datos }
  escribirEstadoAlmacen((estado) => ({
    ...estado,
    deudores: [...estado.deudores, { deudor: nuevo, fiados: [] }],
    proximoIdDeudor: estado.proximoIdDeudor + 1,
  }))
  return { tipo: 'creado', deudor: nuevo }
}

/** PUT /api/deudores/:idDeudor: 200, 404 si no existe, o 409 si el DNI pertenece a otro deudor. */
export function editarDeudorAlmacenado(idDeudor: number, datos: DatosDeudor): ResultadoEdicionDeudorEjemplo {
  const actual = leerDeudorAlmacenado(idDeudor)
  if (actual === null) return { tipo: 'no-encontrado' }
  const otroConElMismoDni = leerEstadoAlmacen().deudores.find(
    (deudor) => deudor.deudor.dni === datos.dni && deudor.deudor.idDeudor !== idDeudor,
  )
  if (otroConElMismoDni) return { tipo: 'dni-duplicado', deudorExistente: otroConElMismoDni.deudor }

  const editado: Deudor = { idDeudor, ...datos }
  escribirEstadoAlmacen((estado) => ({
    ...estado,
    deudores: estado.deudores.map((deudor) =>
      deudor.deudor.idDeudor === idDeudor ? { ...deudor, deudor: editado } : deudor,
    ),
  }))
  return { tipo: 'editado', deudor: editado }
}
