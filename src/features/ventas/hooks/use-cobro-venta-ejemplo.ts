import { useState } from 'react'
import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type {
  ClienteFiado,
  DatosDescuentoManual,
  DatosNuevoCliente,
  EstadoCobro,
  FormaPago,
  LineaPagoMixto,
  MedioPago,
  RegistrarVentaCobroProps,
} from '@/features/ventas/types/cobro'

// --- DATOS DE EJEMPLO ---
// Hook temporal para probar la vista: se reemplaza por el hook real de la accion Registrar Venta.
const MEDIOS_EJEMPLO: MedioPago[] = [
  { idMedioPago: 'efectivo', nombre: 'Efectivo', icono: Banknote, tipoAjuste: 'descuento', porcentajeAjuste: 10, admiteVuelto: true },
  { idMedioPago: 'debito', nombre: 'Débito', icono: Wallet, tipoAjuste: 'ninguno', porcentajeAjuste: 0, admiteVuelto: false },
  { idMedioPago: 'credito', nombre: 'Crédito', icono: CreditCard, tipoAjuste: 'recargo', porcentajeAjuste: 15, admiteVuelto: false },
  { idMedioPago: 'qr', nombre: 'QR', icono: QrCode, tipoAjuste: 'ninguno', porcentajeAjuste: 0, admiteVuelto: false },
]

const CLIENTES_EJEMPLO: ClienteFiado[] = [
  { idCliente: 'c1', nombreCompleto: 'María Fernández', telefono: '11 5555-1234' },
  { idCliente: 'c2', nombreCompleto: 'Juan Pérez', telefono: '11 4444-9876' },
  { idCliente: 'c3', nombreCompleto: 'Lucía Gómez' },
]

/** Lo que tipea el usuario en cada linea del pago mixto; el resto se deriva. */
interface EntradaLineaMixta {
  idMedioPago: string
  montoACubrir: number | null
  pagaCon: number | null
}

type PropiedadesCobro = Omit<
  RegistrarVentaCobroProps,
  'onVolverAlCarrito' | 'onCancelarVenta' | 'onConfirmarCobro'
>

export function useCobroVentaEjemplo(subtotalProductos: number): PropiedadesCobro {
  // --- ESTADOS ---
  const [formaPago, setFormaPago] = useState<FormaPago>('unico')
  const [idMedioSeleccionado, setIdMedioSeleccionado] = useState<string | null>(null)
  const [pagaCon, setPagaCon] = useState<number | null>(null)
  const [entradasMixtas, setEntradasMixtas] = useState<EntradaLineaMixta[]>([])
  const [datosDescuento, setDatosDescuento] = useState<DatosDescuentoManual | null>(null)
  const [formularioDescuentoAbierto, setFormularioDescuentoAbierto] = useState(false)
  const [errorFormularioDescuento, setErrorFormularioDescuento] = useState<string>()
  const [clientes, setClientes] = useState<ClienteFiado[]>(CLIENTES_EJEMPLO)
  const [clienteFiado, setClienteFiado] = useState<ClienteFiado | null>(null)
  const [textoBusquedaCliente, setTextoBusquedaCliente] = useState('')

  // --- CALCULOS ---
  const buscarMedio = (idMedioPago: string | null) =>
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
      if (lineasPagoMixto.length === 0) return 'Agregá al menos un medio de pago'
      if (sumaMontosMixtos > montoBase) return 'Los montos superan el total'
      if (faltaCubrir > 0) return `Falta cubrir ${formatearMoneda(faltaCubrir)}`
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
    if (formaPago === 'fiado' && !clienteFiado) return 'Seleccioná o creá el cliente'
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
    clienteFiado,
    descuentoManual: datosDescuento
      ? { ...datosDescuento, montoDescontado: montoDescuentoManual }
      : null,
    resumen: {
      subtotalProductos,
      montoDescuentoManual,
      montoAjusteMediosPago,
      total,
      faltaCubrir,
    },
    puedeConfirmar: motivoNoConfirmable === undefined,
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

  const seleccionarMedioPago = (idMedioPago: string) => {
    setIdMedioSeleccionado(idMedioPago)
    if (!buscarMedio(idMedioPago)?.admiteVuelto) setPagaCon(null)
  }

  // --- ACCIONES: PAGO MIXTO ---
  const actualizarEntrada = (idMedioPago: string, cambios: Partial<EntradaLineaMixta>) =>
    setEntradasMixtas(
      entradasMixtas.map((entrada) =>
        entrada.idMedioPago === idMedioPago ? { ...entrada, ...cambios } : entrada,
      ),
    )

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

  // --- ACCIONES: FIADO ---
  const textoClienteNormalizado = textoBusquedaCliente.trim().toLowerCase()
  const resultadosBusquedaCliente =
    textoClienteNormalizado === ''
      ? []
      : clientes.filter((cliente) =>
          cliente.nombreCompleto.toLowerCase().includes(textoClienteNormalizado),
        )

  const seleccionarCliente = (idCliente: string) => {
    setClienteFiado(clientes.find((cliente) => cliente.idCliente === idCliente) ?? null)
    setTextoBusquedaCliente('')
  }

  const crearCliente = (datos: DatosNuevoCliente) => {
    const clienteNuevo: ClienteFiado = { idCliente: `c${clientes.length + 1}`, ...datos }
    setClientes([...clientes, clienteNuevo])
    setClienteFiado(clienteNuevo)
    setTextoBusquedaCliente('')
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
    formularioDescuentoAbierto,
    errorFormularioDescuento,
    onAbrirFormularioDescuento: () => setFormularioDescuentoAbierto(true),
    onCerrarFormularioDescuento: cerrarFormularioDescuento,
    onAplicarDescuento: aplicarDescuento,
    onQuitarDescuento: () => setDatosDescuento(null),
    textoBusquedaCliente,
    resultadosBusquedaCliente,
    onBuscarCliente: setTextoBusquedaCliente,
    onSeleccionarCliente: seleccionarCliente,
    onQuitarCliente: () => setClienteFiado(null),
    onCrearCliente: crearCliente,
  }
}
