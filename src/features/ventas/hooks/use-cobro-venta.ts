import { useState } from 'react'
import {
  CLIENTE_REFERENCIA_LONGITUD_MAXIMA,
  MONTO_RECIBIDO_MAXIMO_CENTAVOS,
  MOTIVO_DESCUENTO_LONGITUD_MAXIMA,
} from '@/features/ventas/config/reglas-venta'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type { BorradorRepoblado } from '@/features/ventas/types/borrador-repoblado'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type {
  DatosDescuentoManual,
  EstadoCobro,
  FormaPago,
  LineaPagoMixto,
  MedioPago,
  PropiedadesCobroRegistrarVenta,
} from '@/features/ventas/types/cobro'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'
import type { DatosCobroSolicitud, PagoSolicitud } from '@/features/ventas/types/solicitud-venta'
import {
  calcularAjusteBasisPoints,
  calcularDescuentoPorcentajeCentavos,
  calcularMontoFinalCentavos,
  convertirCentavosAPesos,
  convertirPesosACentavos,
} from '@/features/ventas/utils/calcular-centavos'

// Todo el calculo se hace en centavos enteros, con las formulas del back. Hacia la vista se exponen pesos.

// --- TIPOS INTERNOS ---
/** Lo que tipea el usuario en cada linea del pago mixto; el resto se deriva. */
interface EntradaLineaMixta {
  idMedioPago: number
  montoACubrirCentavos: number | null
  pagaConCentavos: number | null
}

/** Una linea del pago mixto con sus montos derivados. */
interface LineaCalculada {
  entrada: EntradaLineaMixta
  medio: MedioPago
  montoCentavos: number
  ajusteCentavos: number
}

/** Lo que necesita el hook de cobro de la venta en curso. */
interface OpcionesCobroVenta {
  subtotalCentavos: number
  medios: MedioPago[]
  estadoMediosPago: EstadoCargaRecurso
  onReintentarMediosPago: () => void
  estadoEnvio: EstadoEnvioVenta
  /** Venta editada cuyo descuento, medios de pago y cliente se vuelven a cargar; null en una venta nueva. */
  borrador?: BorradorRepoblado | null
}

/** Cobro de una venta editada, traducido a los estados del hook. */
interface CobroRepoblado {
  formaPago: FormaPago
  idMedioSeleccionado: number | null
  pagaConCentavos: number | null
  entradasMixtas: EntradaLineaMixta[]
  descuento: DatosDescuentoManual | null
  avisos: string[]
}

/**
 * Traduce el descuento y los pagos de la venta anulada al cobro de hoy. Lo que ya no sirve se omite y se avisa
 * sin bloquear el resto: un medio dado de baja, un descuento mayor al nuevo subtotal. Los montos de un pago
 * mixto se cargan tal cual y, si ya no suman el total, la pantalla muestra lo que falta o sobra.
 */
function repoblarCobro(
  borrador: BorradorRepoblado,
  subtotalCentavos: number,
  medios: MedioPago[],
): CobroRepoblado {
  const avisos: string[] = []

  const montoDescuentoCentavos =
    borrador.descuentoManual === null ? 0 : convertirPesosACentavos(borrador.descuentoManual.monto)
  const descuentoCabe = borrador.descuentoManual !== null && montoDescuentoCentavos <= subtotalCentavos
  if (borrador.descuentoManual !== null && !descuentoCabe) {
    avisos.push(
      `El descuento manual de ${formatearMoneda(borrador.descuentoManual.monto)} supera el subtotal actual y no se cargó.`,
    )
  }
  const descuento: DatosDescuentoManual | null =
    borrador.descuentoManual !== null && descuentoCabe
      ? { motivo: borrador.descuentoManual.motivo, tipo: 'monto', valor: borrador.descuentoManual.monto }
      : null

  // Un fiado se vuelve a cargar como fiado; el cliente ya viene en el estado inicial
  if (borrador.pagos.length === 0) {
    return {
      formaPago: borrador.clienteReferencia !== null ? 'fiado' : 'unico',
      idMedioSeleccionado: null,
      pagaConCentavos: null,
      entradasMixtas: [],
      descuento,
      avisos,
    }
  }

  const pagosDisponibles = borrador.pagos.filter((pago) =>
    medios.some((medio) => medio.idMedioPago === pago.idMedioPago),
  )
  for (const pago of borrador.pagos) {
    if (!pagosDisponibles.includes(pago)) {
      avisos.push(`El medio de pago ${pago.nombreMedioPago} ya no está disponible y no se cargó.`)
    }
  }
  const aCentavosRecibido = (pago: BorradorRepoblado['pagos'][number]) =>
    pago.montoRecibido === null ? null : convertirPesosACentavos(pago.montoRecibido)

  if (pagosDisponibles.length >= 2) {
    return {
      formaPago: 'mixto',
      idMedioSeleccionado: null,
      pagaConCentavos: null,
      entradasMixtas: pagosDisponibles.map((pago) => ({
        idMedioPago: pago.idMedioPago,
        montoACubrirCentavos: convertirPesosACentavos(pago.montoBase),
        pagaConCentavos: aCentavosRecibido(pago),
      })),
      descuento,
      avisos,
    }
  }
  const [pagoUnico] = pagosDisponibles
  return {
    formaPago: 'unico',
    idMedioSeleccionado: pagoUnico?.idMedioPago ?? null,
    pagaConCentavos: pagoUnico === undefined ? null : aCentavosRecibido(pagoUnico),
    entradasMixtas: [],
    descuento,
    avisos,
  }
}

function calcularDescuentoCentavos(datos: DatosDescuentoManual, subtotalCentavos: number) {
  return datos.tipo === 'porcentaje'
    ? calcularDescuentoPorcentajeCentavos(subtotalCentavos, datos.valor)
    : Math.min(convertirPesosACentavos(datos.valor), subtotalCentavos)
}

const aCentavosOpcional = (pesos: number | null) => (pesos === null ? null : convertirPesosACentavos(pesos))
const aPesosOpcional = (centavos: number | null) => (centavos === null ? null : convertirCentavosAPesos(centavos))

export function useCobroVenta({
  subtotalCentavos,
  medios,
  estadoMediosPago,
  onReintentarMediosPago,
  estadoEnvio,
  borrador = null,
}: OpcionesCobroVenta): {
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  /** Lo que el cobro aporta a la solicitud de alta; ya validado por `puedeConfirmar`. */
  datosCobro: DatosCobroSolicitud
  /** Lo que no se pudo volver a cargar de la venta editada. */
  avisosRepoblado: string[]
  descartarAvisosRepoblado: () => void
} {
  // --- ESTADOS ---
  const [formaPago, setFormaPago] = useState<FormaPago>('unico')
  const [idMedioSeleccionado, setIdMedioSeleccionado] = useState<number | null>(null)
  const [pagaConCentavos, setPagaConCentavos] = useState<number | null>(null)
  const [entradasMixtas, setEntradasMixtas] = useState<EntradaLineaMixta[]>([])
  const [datosDescuento, setDatosDescuento] = useState<DatosDescuentoManual | null>(null)
  const [formularioDescuentoAbierto, setFormularioDescuentoAbierto] = useState(false)
  const [errorFormularioDescuento, setErrorFormularioDescuento] = useState<string>()
  const [nombreClienteFiado, setNombreClienteFiado] = useState(borrador?.clienteReferencia ?? '')
  // Venta editada que espera al subtotal y a los medios para volver a cargarse; null si no hay nada pendiente
  const [borradorPendiente, setBorradorPendiente] = useState(borrador)
  const [avisosRepoblado, setAvisosRepoblado] = useState<string[]>([])

  // Se repuebla una sola vez: con el subtotal ya calculado y, si hubo pagos, con los medios cargados.
  // Se ajusta durante el render, sin efecto aparte
  if (
    borradorPendiente !== null &&
    subtotalCentavos > 0 &&
    (borradorPendiente.pagos.length === 0 || estadoMediosPago.fase === 'listo')
  ) {
    const repoblado = repoblarCobro(borradorPendiente, subtotalCentavos, medios)
    setBorradorPendiente(null)
    setFormaPago(repoblado.formaPago)
    setIdMedioSeleccionado(repoblado.idMedioSeleccionado)
    setPagaConCentavos(repoblado.pagaConCentavos)
    setEntradasMixtas(repoblado.entradasMixtas)
    setDatosDescuento(repoblado.descuento)
    setAvisosRepoblado(repoblado.avisos)
  }

  // --- CALCULOS ---
  const buscarMedio = (idMedioPago: number | null) =>
    medios.find((medio) => medio.idMedioPago === idMedioPago)

  /** Ajuste del medio sobre una porcion base: monto final menos base, redondeando el final como el back. */
  const calcularAjusteCentavos = (medio: MedioPago, baseCentavos: number) =>
    calcularMontoFinalCentavos(baseCentavos, calcularAjusteBasisPoints(medio)) - baseCentavos

  const montoDescuentoCentavos = datosDescuento
    ? calcularDescuentoCentavos(datosDescuento, subtotalCentavos)
    : 0
  const baseCentavos = subtotalCentavos - montoDescuentoCentavos

  // Un medio que ya no esta entre los activos deja de contar: ni se muestra ni se envia
  const lineasCalculadas: LineaCalculada[] = entradasMixtas.flatMap((entrada) => {
    const medio = buscarMedio(entrada.idMedioPago)
    if (!medio) return []
    const montoCentavos = entrada.montoACubrirCentavos ?? 0
    return [{ entrada, medio, montoCentavos, ajusteCentavos: calcularAjusteCentavos(medio, montoCentavos) }]
  })
  const lineasPagoMixto: LineaPagoMixto[] = lineasCalculadas.map(
    ({ entrada, medio, montoCentavos, ajusteCentavos }) => ({
      idMedioPago: entrada.idMedioPago,
      montoACubrir: aPesosOpcional(entrada.montoACubrirCentavos),
      pagaCon: aPesosOpcional(entrada.pagaConCentavos),
      vuelto:
        medio.admiteVuelto && entrada.pagaConCentavos !== null
          ? convertirCentavosAPesos(
              Math.max(entrada.pagaConCentavos - (montoCentavos + ajusteCentavos), 0),
            )
          : null,
      montoAjuste: convertirCentavosAPesos(ajusteCentavos),
    }),
  )

  const medioUnico = buscarMedio(idMedioSeleccionado)
  const sumaMontosMixtosCentavos = lineasCalculadas.reduce(
    (acumulado, linea) => acumulado + linea.montoCentavos,
    0,
  )
  const faltaCubrirCentavos =
    formaPago === 'mixto' ? Math.max(baseCentavos - sumaMontosMixtosCentavos, 0) : 0
  const excedenteCentavos =
    formaPago === 'mixto' ? Math.max(sumaMontosMixtosCentavos - baseCentavos, 0) : 0
  const ajusteMediosCentavos =
    formaPago === 'unico'
      ? medioUnico
        ? calcularAjusteCentavos(medioUnico, baseCentavos)
        : 0
      : formaPago === 'mixto'
        ? lineasCalculadas.reduce((acumulado, linea) => acumulado + linea.ajusteCentavos, 0)
        : 0
  const totalCentavos = baseCentavos + ajusteMediosCentavos
  const vueltoUnicoCentavos =
    medioUnico?.admiteVuelto && pagaConCentavos !== null
      ? Math.max(pagaConCentavos - totalCentavos, 0)
      : null

  // Primer motivo que impide confirmar; si no hay ninguno, la venta se puede confirmar
  const calcularMotivoNoConfirmable = () => {
    // El fiado no usa medios de pago: se puede registrar aunque no hayan cargado
    if (formaPago !== 'fiado') {
      if (estadoMediosPago.fase === 'cargando') return 'Cargando los medios de pago'
      if (estadoMediosPago.fase === 'error') return 'No se pudieron cargar los medios de pago'
      // El back exige montos positivos en cada pago: con total cero solo queda registrarlo como fiado
      if (baseCentavos <= 0) return 'El descuento deja el total en cero: no hay nada para cobrar'
    }
    if (formaPago === 'unico') {
      if (!medioUnico) return 'Elegí un medio de pago'
      if (medioUnico.admiteVuelto && pagaConCentavos !== null) {
        if (pagaConCentavos < totalCentavos) return 'El monto con el que paga no cubre el total'
        if (pagaConCentavos > MONTO_RECIBIDO_MAXIMO_CENTAVOS) {
          return 'El monto con el que paga es demasiado alto'
        }
      }
    }
    if (formaPago === 'mixto') {
      // Falta cubrir y excedente no son motivos aparte: los muestra el estado de cobertura
      if (lineasCalculadas.some((linea) => linea.montoCentavos === 0)) {
        return 'Quitá o completá los medios sin monto'
      }
      const efectivoInsuficiente = lineasCalculadas.some(
        (linea) =>
          linea.medio.admiteVuelto &&
          linea.entrada.pagaConCentavos !== null &&
          linea.entrada.pagaConCentavos < linea.montoCentavos + linea.ajusteCentavos,
      )
      if (efectivoInsuficiente) return 'El monto con el que paga no cubre su parte'
      const efectivoDemasiadoAlto = lineasCalculadas.some(
        (linea) =>
          linea.medio.admiteVuelto &&
          linea.entrada.pagaConCentavos !== null &&
          linea.entrada.pagaConCentavos > MONTO_RECIBIDO_MAXIMO_CENTAVOS,
      )
      if (efectivoDemasiadoAlto) return 'El monto con el que paga es demasiado alto'
    }
    if (formaPago === 'fiado') {
      const nombreCliente = nombreClienteFiado.trim()
      if (nombreCliente === '') return 'Ingresá el nombre del cliente'
      if (nombreCliente.length > CLIENTE_REFERENCIA_LONGITUD_MAXIMA) {
        return `El nombre del cliente admite hasta ${CLIENTE_REFERENCIA_LONGITUD_MAXIMA} caracteres`
      }
    }
    return undefined
  }
  const motivoNoConfirmable = calcularMotivoNoConfirmable()
  // Con la venta en camino, registrada o con resultado incierto no se puede volver a confirmar
  const envioPermitido = estadoEnvio.fase === 'inactivo' || estadoEnvio.fase === 'rechazado'

  const estadoCobro: EstadoCobro = {
    formaPago,
    mediosDisponibles: medios,
    idMedioSeleccionado,
    pagaCon: aPesosOpcional(pagaConCentavos),
    vuelto: aPesosOpcional(vueltoUnicoCentavos),
    lineasPagoMixto,
    nombreClienteFiado,
    descuentoManual: datosDescuento
      ? { ...datosDescuento, montoDescontado: convertirCentavosAPesos(montoDescuentoCentavos) }
      : null,
    resumen: {
      subtotalProductos: convertirCentavosAPesos(subtotalCentavos),
      montoDescuentoManual: convertirCentavosAPesos(montoDescuentoCentavos),
      montoAjusteMediosPago: convertirCentavosAPesos(ajusteMediosCentavos),
      total: convertirCentavosAPesos(totalCentavos),
      faltaCubrir: convertirCentavosAPesos(faltaCubrirCentavos),
      excedente: convertirCentavosAPesos(excedenteCentavos),
    },
    puedeConfirmar:
      envioPermitido &&
      motivoNoConfirmable === undefined &&
      (formaPago !== 'mixto' ||
        (faltaCubrirCentavos === 0 && excedenteCentavos === 0 && lineasCalculadas.length > 0)),
    motivoNoConfirmable,
  }

  // --- DATOS PARA LA SOLICITUD ---
  const pagosSolicitud: PagoSolicitud[] =
    formaPago === 'unico'
      ? medioUnico
        ? [
            {
              idMedioPago: medioUnico.idMedioPago,
              montoBaseCentavos: baseCentavos,
              // El monto recibido solo existe en efectivo
              montoRecibidoCentavos: medioUnico.admiteVuelto ? pagaConCentavos : null,
            },
          ]
        : []
      : formaPago === 'mixto'
        ? lineasCalculadas.map((linea) => ({
            idMedioPago: linea.entrada.idMedioPago,
            montoBaseCentavos: linea.montoCentavos,
            montoRecibidoCentavos: linea.medio.admiteVuelto ? linea.entrada.pagaConCentavos : null,
          }))
        : []
  const datosCobro: DatosCobroSolicitud = {
    pagos: pagosSolicitud,
    // Sin descuento efectivo no se envia ni el monto ni el motivo: el back rechaza un motivo suelto
    descuentoManual:
      datosDescuento && montoDescuentoCentavos > 0
        ? { montoCentavos: montoDescuentoCentavos, motivo: datosDescuento.motivo.trim() }
        : null,
    clienteReferencia: formaPago === 'fiado' ? nombreClienteFiado.trim() : null,
  }

  // --- ACCIONES: FORMA Y MEDIOS DE PAGO ---
  const cambiarFormaPago = (nuevaFormaPago: FormaPago) => {
    // Al pasar de unico a mixto, el medio elegido se convierte en la primera linea
    if (nuevaFormaPago === 'mixto' && formaPago === 'unico' && idMedioSeleccionado) {
      setEntradasMixtas([
        { idMedioPago: idMedioSeleccionado, montoACubrirCentavos: baseCentavos, pagaConCentavos },
      ])
    }
    if (nuevaFormaPago === 'unico' && formaPago === 'mixto' && entradasMixtas[0]) {
      setIdMedioSeleccionado(entradasMixtas[0].idMedioPago)
      setPagaConCentavos(entradasMixtas[0].pagaConCentavos)
    }
    setFormaPago(nuevaFormaPago)
  }

  const seleccionarMedioPago = (idMedioPago: number) => {
    setIdMedioSeleccionado(idMedioPago)
    if (!buscarMedio(idMedioPago)?.admiteVuelto) setPagaConCentavos(null)
  }

  // --- ACCIONES: PAGO MIXTO ---
  const actualizarEntrada = (idMedioPago: number, cambios: Partial<EntradaLineaMixta>) =>
    setEntradasMixtas(
      entradasMixtas.map((entrada) =>
        entrada.idMedioPago === idMedioPago ? { ...entrada, ...cambios } : entrada,
      ),
    )

  // Descuenta el excedente desde el ultimo medio hacia atras; los que quedan sin monto se quitan
  const ajustarMontosAutomaticamente = () => {
    const { lineas: ajustadas } = entradasMixtas.reduceRight<{
      restante: number
      lineas: EntradaLineaMixta[]
    }>(
      (acumulado, entrada) => {
        const monto = entrada.montoACubrirCentavos ?? 0
        const descuento = Math.min(monto, acumulado.restante)
        const montoFinal = monto - descuento
        const sigueEnLaLista = !(descuento > 0 && montoFinal === 0)
        return {
          restante: acumulado.restante - descuento,
          lineas: sigueEnLaLista
            ? [{ ...entrada, montoACubrirCentavos: montoFinal }, ...acumulado.lineas]
            : acumulado.lineas,
        }
      },
      { restante: excedenteCentavos, lineas: [] },
    )
    setEntradasMixtas(ajustadas)
  }

  // --- ACCIONES: DESCUENTO MANUAL ---
  const aplicarDescuento = (datos: DatosDescuentoManual) => {
    const motivo = datos.motivo.trim()
    if (!(datos.valor > 0)) return setErrorFormularioDescuento('Ingresá un valor mayor a cero')
    if (motivo === '') return setErrorFormularioDescuento('Ingresá el motivo del descuento')
    if (motivo.length > MOTIVO_DESCUENTO_LONGITUD_MAXIMA) {
      return setErrorFormularioDescuento(
        `El motivo admite hasta ${MOTIVO_DESCUENTO_LONGITUD_MAXIMA} caracteres`,
      )
    }
    if (datos.tipo === 'porcentaje' && datos.valor > 100) {
      return setErrorFormularioDescuento('El porcentaje no puede superar 100')
    }
    if (datos.tipo === 'monto' && convertirPesosACentavos(datos.valor) > subtotalCentavos) {
      return setErrorFormularioDescuento('El descuento no puede superar el subtotal')
    }
    // Un descuento que redondea a cero centavos no restaria nada, y el back no admite motivo sin descuento
    if (calcularDescuentoCentavos(datos, subtotalCentavos) <= 0) {
      return setErrorFormularioDescuento('El descuento es tan chico que no resta nada del subtotal')
    }
    setDatosDescuento({ ...datos, motivo })
    setFormularioDescuentoAbierto(false)
    setErrorFormularioDescuento(undefined)
  }

  const cerrarFormularioDescuento = () => {
    setFormularioDescuentoAbierto(false)
    setErrorFormularioDescuento(undefined)
  }

  return {
    propiedadesCobro: {
      estadoCobro,
      onCambiarFormaPago: cambiarFormaPago,
      onSeleccionarMedioPago: seleccionarMedioPago,
      onCambiarPagaCon: (monto) => setPagaConCentavos(aCentavosOpcional(monto)),
      onAgregarLineaPago: (idMedioPago) =>
        setEntradasMixtas([
          ...entradasMixtas,
          {
            idMedioPago,
            montoACubrirCentavos: faltaCubrirCentavos > 0 ? faltaCubrirCentavos : null,
            pagaConCentavos: null,
          },
        ]),
      onQuitarLineaPago: (idMedioPago) =>
        setEntradasMixtas(entradasMixtas.filter((entrada) => entrada.idMedioPago !== idMedioPago)),
      onCambiarMontoLinea: (idMedioPago, monto) =>
        actualizarEntrada(idMedioPago, { montoACubrirCentavos: aCentavosOpcional(monto) }),
      onCambiarPagaConLinea: (idMedioPago, monto) =>
        actualizarEntrada(idMedioPago, { pagaConCentavos: aCentavosOpcional(monto) }),
      onCompletarConRestante: (idMedioPago) => {
        const entrada = entradasMixtas.find((candidata) => candidata.idMedioPago === idMedioPago)
        actualizarEntrada(idMedioPago, {
          montoACubrirCentavos: (entrada?.montoACubrirCentavos ?? 0) + faltaCubrirCentavos,
        })
      },
      onAjustarMontosAutomaticamente: ajustarMontosAutomaticamente,
      formularioDescuentoAbierto,
      errorFormularioDescuento,
      onAbrirFormularioDescuento: () => setFormularioDescuentoAbierto(true),
      onCerrarFormularioDescuento: cerrarFormularioDescuento,
      onAplicarDescuento: aplicarDescuento,
      onQuitarDescuento: () => setDatosDescuento(null),
      onCambiarNombreClienteFiado: setNombreClienteFiado,
      estadoMediosPago,
      onReintentarMediosPago,
      estadoEnvio,
    },
    datosCobro,
    avisosRepoblado,
    descartarAvisosRepoblado: () => setAvisosRepoblado([]),
  }
}
