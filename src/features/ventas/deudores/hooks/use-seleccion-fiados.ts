import { useState } from 'react'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type {
  FilaFiadoSeleccionable,
  ResumenSeleccionFiados,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type { FiadoPendiente } from '@/features/ventas/deudores/types/cuenta-corriente'
import { convertirCentavosAPesos, convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

/** Lo que el vendedor hizo con un fiado: si lo tildo y, si lo cambio, el monto que escribio. */
interface EntradaFiado {
  seleccionado: boolean
  /** undefined = no lo toco: se cobra lo que falta. null = dejo el campo vacio. */
  montoEscrito?: number | null
}

const MENSAJE_MONTO_VACIO = 'Ingresá un monto mayor a cero'

/** Valida el monto de un fiado tildado contra lo que le falta; devuelve el error o null. */
function validarMontoFiado(montoACobrar: number | null, fiado: FiadoPendiente) {
  if (montoACobrar === null || convertirPesosACentavos(montoACobrar) <= 0) return MENSAJE_MONTO_VACIO
  if (convertirPesosACentavos(montoACobrar) > convertirPesosACentavos(fiado.montoFaltante)) {
    return `No puede superar lo que falta (${formatearMoneda(fiado.montoFaltante)})`
  }
  return null
}

/**
 * Seleccion de los fiados a cobrar desde la ficha: cual esta tildado y cuanto se cobra de cada uno. Tildar un
 * fiado propone cobrar todo lo que falta, y el monto se puede bajar para un pago parcial. Un fiado puede llegar
 * ya tildado (desde "Ver deuda" del Historial).
 */
export function useSeleccionFiados(fiados: FiadoPendiente[], idFiadoInicial: number | null) {
  // --- ESTADOS ---
  // Por id de venta y no por posicion: la lista se vuelve a pedir y cambia entre cobros
  const [entradas, setEntradas] = useState<Record<number, EntradaFiado>>(() =>
    idFiadoInicial === null ? {} : { [idFiadoInicial]: { seleccionado: true } },
  )

  // --- CALCULOS ---
  const filas: FilaFiadoSeleccionable[] = fiados.map((fiado) => {
    const entrada = entradas[fiado.idVenta]
    const seleccionado = entrada?.seleccionado === true
    const montoACobrar = entrada?.montoEscrito === undefined ? fiado.montoFaltante : entrada.montoEscrito
    return {
      fiado,
      seleccionado,
      montoACobrar,
      errorMonto: seleccionado ? validarMontoFiado(montoACobrar, fiado) : null,
      resaltado: fiado.idVenta === idFiadoInicial,
    }
  })

  const seleccionadas = filas.filter((fila) => fila.seleccionado)
  const totalACobrarCentavos = seleccionadas.reduce(
    (acumulado, fila) => acumulado + convertirPesosACentavos(fila.montoACobrar ?? 0),
    0,
  )
  const hayErrores = seleccionadas.some((fila) => fila.errorMonto !== null)
  const resumen: ResumenSeleccionFiados = {
    cantidadSeleccionados: seleccionadas.length,
    totalACobrar: convertirCentavosAPesos(totalACobrarCentavos),
    todosSeleccionados: filas.length > 0 && seleccionadas.length === filas.length,
    hayErrores,
    puedeCobrar: seleccionadas.length > 0 && !hayErrores,
  }

  // --- ACCIONES ---
  const alternarFiado = (idVenta: number) => {
    const estabaTildado = entradas[idVenta]?.seleccionado === true
    // Al tildar se propone lo que falta; al destildar se descarta lo que se habia escrito
    setEntradas({ ...entradas, [idVenta]: { seleccionado: !estabaTildado } })
  }

  const cambiarMontoFiado = (idVenta: number, monto: number | null) =>
    setEntradas({ ...entradas, [idVenta]: { seleccionado: true, montoEscrito: monto } })

  const seleccionarTodos = () => {
    const seleccionar = !resumen.todosSeleccionados
    setEntradas(
      Object.fromEntries(fiados.map((fiado) => [fiado.idVenta, { seleccionado: seleccionar }])),
    )
  }

  return {
    filas,
    resumen,
    alternarFiado,
    cambiarMontoFiado,
    seleccionarTodos,
    /** Destilda todo: despues de un cobro, la cuenta cambio y lo elegido ya no corresponde. */
    limpiar: () => setEntradas({}),
  }
}
