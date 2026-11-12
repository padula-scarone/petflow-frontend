import { useState } from 'react'
import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'
import type {
  DatosDescuentoManual,
  EstadoCobro,
  FormaPago,
  LineaPagoMixto,
  MedioPago,
  PropiedadesCobro,
} from '@/features/ventas/types/cobro'

// --- DATOS DE EJEMPLO ---
// Hook temporal para probar la vista: se reemplaza por el hook real de la accion Registrar Venta.
export const MEDIOS_EJEMPLO: MedioPago[] = [
  { idMedioPago: 1, nombre: 'Efectivo', icono: Banknote, tipoAjuste: 'descuento', porcentajeAjuste: 10, admiteVuelto: true },
  { idMedioPago: 2, nombre: 'Débito', icono: Wallet, tipoAjuste: 'ninguno', porcentajeAjuste: 0, admiteVuelto: false },
  { idMedioPago: 3, nombre: 'Crédito', icono: CreditCard, tipoAjuste: 'recargo', porcentajeAjuste: 15, admiteVuelto: false },
  { idMedioPago: 4, nombre: 'QR', icono: QrCode, tipoAjuste: 'ninguno', porcentajeAjuste: 0, admiteVuelto: false },
]

/** Lo que tipea el usuario en cada linea del pago mixto; el resto se deriva. */
interface EntradaLineaMixta {
  idMedioPago: number
  montoACubrir: number | null
  pagaCon: number | null
}

export function useCobroVentaEjemplo(subtotalProductos: number): PropiedadesCobro {
  // --- ESTADOS ---
  const [formaPago, setFormaPago] = useState<FormaPago>('unico')
  const [idMedioSeleccionado, setIdMedioSeleccionado] = useState<number | null>(null)
  const [pagaCon, setPagaCon] = useState<number | null>(null)
  const [entradasMixtas, setEntradasMixtas] = useState<EntradaLineaMixta[]>([])
  const [datosDescuento, setDatosDescuento] = useState<DatosDescuentoManual | null>(null)
  const [formularioDescuentoAbierto, setFormularioDescuentoAbierto] = useState(false)
  const [errorFormularioDescuento, setErrorFormularioDescuento] = useState<string>()
  const [nombreClienteFiado, setNombreClienteFiado] = useState('')

  // --- CALCULOS ---
  const buscarMedio = (idMedioPago: number | null) =>
    MEDIOS_EJEMPLO.find((medio) => medio.idMedioPago === idMedioPago)

  const calcularAjuste = (medio: MedioPago, monto: number) => {
    const ajuste = Math.round((monto * medio.porcentajeAjuste) / 100)
    if (medio.tipoAjuste === 'descuento') return -ajuste
    if (medio.tipoAjuste === 'recargo') return ajuste
    return 0
  }

  const montoDescuentoManual = datosDescuento
    ? datosDescuento.tipo === 'porcentaje'
      ? Math.round((subtotalProductos * datosDescuento.valor) / 100)
      : Math.min(datosDescuento.valor, subtotalProductos)
    : 0
  const montoBase = subtotalProductos - montoDescuentoManual

  const lineasPagoMixto: LineaPagoMixto[] = entradasMixtas.flatMap((entrada) => {
    const medio = buscarMedio(entrada.idMedioPago)
    if (!medio) return []
    const montoACubrir = entrada.montoACubrir ?? 0
    const montoAjuste = calcularAjuste(medio, montoACubrir)
    const vuelto =
      medio.admiteVuelto && entrada.pagaCon !== null
        ? Math.max(entrada.pagaCon - (montoACubrir + montoAjuste), 0)
        : null
    return [{ ...entrada, montoAjuste, vuelto }]
  })

  const medioUnico = buscarMedio(idMedioSeleccionado)
  const sumaMontosMixtos = entradasMixtas.reduce(
    (acumulado, entrada) => acumulado + (entrada.montoACubrir ?? 0),
    0,
  )
  const faltaCubrir = formaPago === 'mixto' ? Math.max(montoBase - sumaMontosMixtos, 0) : 0
  const excedente = formaPago === 'mixto' ? Math.max(sumaMontosMixtos - montoBase, 0) : 0
  const montoAjusteMediosPago =
    formaPago === 'unico'
      ? medioUnico
        ? calcularAjuste(medioUnico, montoBase)
        : 0
      : formaPago === 'mixto'
        ? lineasPagoMixto.reduce((acumulado, linea) => acumulado + linea.montoAjuste, 0)
        : 0
  const total = montoBase + montoAjusteMediosPago
  const vueltoUnico =
    medioUnico?.admiteVuelto && pagaCon !== null ? Math.max(pagaCon - total, 0) : null

  // Primer motivo que impide confirmar; si no hay ninguno, la venta se puede confirmar
  const calcularMotivoNoConfirmable = () => {
    if (formaPago === 'unico') {
      if (!medioUnico) return 'Elegí un medio de pago'
      if (medioUnico.admiteVuelto && pagaCon !== null && pagaCon < total) {
        return 'El monto con el que paga no cubre el total'
      }
    }
    if (formaPago === 'mixto') {
      // Falta cubrir y excedente no son motivos aparte: los muestra el estado de cobertura
      const lineaSinMonto = lineasPagoMixto.some((linea) => (linea.montoACubrir ?? 0) === 0)
      if (lineaSinMonto) return 'Quitá o completá los medios sin monto'
      const efectivoInsuficiente = lineasPagoMixto.some((linea) => {
        const medio = buscarMedio(linea.idMedioPago)
        return (
          medio?.admiteVuelto &&
          linea.pagaCon !== null &&
          linea.pagaCon < (linea.montoACubrir ?? 0) + linea.montoAjuste
        )
      })
      if (efectivoInsuficiente) return 'El monto con el que paga no cubre su parte'
    }
    if (formaPago === 'fiado' && nombreClienteFiado.trim() === '') {
      return 'Ingresá el nombre del cliente'
    }
    return undefined
  }
  const motivoNoConfirmable = calcularMotivoNoConfirmable()

  const estadoCobro: EstadoCobro = {
    formaPago,
    mediosDisponibles: MEDIOS_EJEMPLO,
    idMedioSeleccionado,
    pagaCon,
    vuelto: vueltoUnico,
    lineasPagoMixto,
    nombreClienteFiado,
    descuentoManual: datosDescuento
      ? { ...datosDescuento, montoDescontado: montoDescuentoManual }
      : null,
    resumen: {
      subtotalProductos,
      montoDescuentoManual,
      montoAjusteMediosPago,
      total,
      faltaCubrir,
      excedente,
    },
    puedeConfirmar:
      motivoNoConfirmable === undefined &&
      (formaPago !== 'mixto' || (faltaCubrir === 0 && excedente === 0 && entradasMixtas.length > 0)),
    motivoNoConfirmable,
  }

  // --- ACCIONES: FORMA Y MEDIOS DE PAGO ---
  const cambiarFormaPago = (nuevaFormaPago: FormaPago) => {
    // Al pasar de unico a mixto, el medio elegido se convierte en la primera linea
    if (nuevaFormaPago === 'mixto' && formaPago === 'unico' && idMedioSeleccionado) {
      setEntradasMixtas([{ idMedioPago: idMedioSeleccionado, montoACubrir: montoBase, pagaCon }])
    }
    if (nuevaFormaPago === 'unico' && formaPago === 'mixto' && entradasMixtas[0]) {
      setIdMedioSeleccionado(entradasMixtas[0].idMedioPago)
      setPagaCon(entradasMixtas[0].pagaCon)
    }
    setFormaPago(nuevaFormaPago)
  }

  const seleccionarMedioPago = (idMedioPago: number) => {
    setIdMedioSeleccionado(idMedioPago)
    if (!buscarMedio(idMedioPago)?.admiteVuelto) setPagaCon(null)
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
        const monto = entrada.montoACubrir ?? 0
        const descuento = Math.min(monto, acumulado.restante)
        const montoFinal = monto - descuento
        const sigueEnLaLista = !(descuento > 0 && montoFinal === 0)
        return {
          restante: acumulado.restante - descuento,
          lineas: sigueEnLaLista
            ? [{ ...entrada, montoACubrir: montoFinal }, ...acumulado.lineas]
            : acumulado.lineas,
        }
      },
      { restante: excedente, lineas: [] },
    )
    setEntradasMixtas(ajustadas)
  }

  // --- ACCIONES: DESCUENTO MANUAL ---
  const aplicarDescuento = (datos: DatosDescuentoManual) => {
    if (!(datos.valor > 0)) return setErrorFormularioDescuento('Ingresá un valor mayor a cero')
    if (datos.tipo === 'porcentaje' && datos.valor > 100) {
      return setErrorFormularioDescuento('El porcentaje no puede superar 100')
    }
    if (datos.tipo === 'monto' && datos.valor > subtotalProductos) {
      return setErrorFormularioDescuento('El descuento no puede superar el subtotal')
    }
    setDatosDescuento(datos)
    setFormularioDescuentoAbierto(false)
    setErrorFormularioDescuento(undefined)
  }

  const cerrarFormularioDescuento = () => {
    setFormularioDescuentoAbierto(false)
    setErrorFormularioDescuento(undefined)
  }

  return {
    estadoCobro,
    onCambiarFormaPago: cambiarFormaPago,
    onSeleccionarMedioPago: seleccionarMedioPago,
    onCambiarPagaCon: setPagaCon,
    onAgregarLineaPago: (idMedioPago) =>
      setEntradasMixtas([
        ...entradasMixtas,
        { idMedioPago, montoACubrir: faltaCubrir > 0 ? faltaCubrir : null, pagaCon: null },
      ]),
    onQuitarLineaPago: (idMedioPago) =>
      setEntradasMixtas(entradasMixtas.filter((entrada) => entrada.idMedioPago !== idMedioPago)),
    onCambiarMontoLinea: (idMedioPago, monto) =>
      actualizarEntrada(idMedioPago, { montoACubrir: monto }),
    onCambiarPagaConLinea: (idMedioPago, monto) => actualizarEntrada(idMedioPago, { pagaCon: monto }),
    onCompletarConRestante: (idMedioPago) => {
      const entrada = entradasMixtas.find((candidata) => candidata.idMedioPago === idMedioPago)
      actualizarEntrada(idMedioPago, { montoACubrir: (entrada?.montoACubrir ?? 0) + faltaCubrir })
    },
    onAjustarMontosAutomaticamente: ajustarMontosAutomaticamente,
    formularioDescuentoAbierto,
    errorFormularioDescuento,
    onAbrirFormularioDescuento: () => setFormularioDescuentoAbierto(true),
    onCerrarFormularioDescuento: cerrarFormularioDescuento,
    onAplicarDescuento: aplicarDescuento,
    onQuitarDescuento: () => setDatosDescuento(null),
    onCambiarNombreClienteFiado: setNombreClienteFiado,
  }
}
