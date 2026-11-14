import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useCarritoVenta } from '@/features/ventas/hooks/use-carrito-venta'
import { useCatalogoProductos } from '@/features/ventas/hooks/use-catalogo-productos'
import { useCobroVenta } from '@/features/ventas/hooks/use-cobro-venta'
import { useComprobanteVenta } from '@/features/ventas/hooks/use-comprobante-venta'
import { useEnvioVenta } from '@/features/ventas/hooks/use-envio-venta'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { ContextoRegistrarVenta } from '@/features/ventas/types/contexto-registrar-venta'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { construirSolicitudVenta } from '@/features/ventas/utils/construir-solicitud-venta'
import { leerBorradorRepoblado } from '@/features/ventas/utils/leer-borrador-repoblado'

// Listas vacias estables: asi un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_PRODUCTOS: ProductoCatalogo[] = []
const SIN_MEDIOS: MedioPago[] = []

interface OpcionesRegistrarVenta {
  /** Avisa al layout para que descarte esta venta; el estado se reinicia al remontarse. */
  alIniciarNuevaVenta: () => void
}

/**
 * Orquesta Registrar Venta (carrito, cobro y comprobante) contra el back y entrega el contexto que
 * comparten las tres pantallas. Cada parte vive en su propio hook; aca solo se conectan.
 */
export function useRegistrarVenta({ alIniciarNuevaVenta }: OpcionesRegistrarVenta): ContextoRegistrarVenta {
  // --- VENTA EDITADA ---
  // Si se llego desde Editar en el Historial, el state del router trae la venta anulada para volver a cargarla.
  // Se lee una sola vez y se limpia: un reload o un "atras" no deben repoblar de nuevo
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const [borrador] = useState(() => leerBorradorRepoblado(ubicacion.state))
  useEffect(() => {
    if (leerBorradorRepoblado(ubicacion.state) === null) return
    navegar({ pathname: ubicacion.pathname, search: ubicacion.search }, { replace: true, state: null })
  }, [ubicacion.state, ubicacion.pathname, ubicacion.search, navegar])

  // --- DATOS DEL BACK ---
  const catalogo = useCatalogoProductos()
  const mediosPago = useMediosPago()
  const medios = mediosPago.datos ?? SIN_MEDIOS

  // --- VENTA EN CURSO ---
  const carrito = useCarritoVenta(catalogo.datos ?? SIN_PRODUCTOS, catalogo.estado.fase === 'listo', borrador)
  // Tras un rechazo por stock, producto o medio inexistente, lo que se ve puede estar desactualizado
  const envio = useEnvioVenta({
    articulos: carrito.articulos,
    alNecesitarRecargarDatos: () => {
      catalogo.recargar()
      mediosPago.recargar()
    },
  })
  const cobro = useCobroVenta({
    subtotalCentavos: carrito.subtotalCentavos,
    medios,
    estadoMediosPago: mediosPago.estado,
    onReintentarMediosPago: mediosPago.recargar,
    estadoEnvio: envio.estadoEnvio,
    borrador,
  })

  // --- COMPROBANTE ---
  const registro = envio.estadoEnvio.fase === 'registrada' ? envio.estadoEnvio.registro : null
  const comprobante = useComprobanteVenta(registro, medios)

  // --- ACCIONES ---
  const confirmarCobro = async () => {
    if (!cobro.propiedadesCobro.estadoCobro.puedeConfirmar) return
    await envio.enviarVenta(
      construirSolicitudVenta({
        canalVenta: carrito.canalVenta,
        tipoEntrega: carrito.tipoEntrega,
        articulos: carrito.articulos,
        datosCobro: cobro.datosCobro,
      }),
    )
  }

  return {
    propiedadesCarrito: {
      ...carrito.propiedadesCarrito,
      estadoCatalogo: catalogo.estado,
      onReintentarCatalogo: catalogo.recargar,
      avisosRepoblado: [...carrito.avisosRepoblado, ...cobro.avisosRepoblado],
      onCerrarAvisosRepoblado: () => {
        carrito.descartarAvisosRepoblado()
        cobro.descartarAvisosRepoblado()
      },
    },
    propiedadesCobro: cobro.propiedadesCobro,
    registro,
    estadoComprobante: comprobante.estadoComprobante,
    onReintentarComprobante: comprobante.reintentarComprobante,
    confirmarCobro,
    descartarRechazoEnvio: envio.descartarRechazo,
    iniciarNuevaVenta: alIniciarNuevaVenta,
  }
}
