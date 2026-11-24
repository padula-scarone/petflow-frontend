import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonCancelarVenta } from '@/features/ventas/components/boton-cancelar-venta'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoMediosPago } from '@/features/ventas/components/estado-medios-pago'
import { SeccionEntrega } from '@/features/ventas/components/seccion-entrega'
import { TarjetaDescuentoManual } from '@/features/ventas/components/tarjeta-descuento-manual'
import { BloqueDeuda } from '@/features/ventas/deudores/components/bloque-deuda'
import { ContenedorDialogoDeudor } from '@/features/ventas/deudores/components/contenedor-dialogo-deudor'
import { DialogoResumenVentaConDeuda } from '@/features/ventas/deudores/components/dialogo-resumen-venta-con-deuda'
import { EstadoSaldoPago } from '@/features/ventas/deudores/components/estado-saldo-pago'
import { PanelPagoAhora } from '@/features/ventas/deudores/components/panel-pago-ahora'
import { PanelResumenPagoConDeuda } from '@/features/ventas/deudores/components/panel-resumen-pago-con-deuda'
import { DATOS_DEUDOR_VACIOS } from '@/features/ventas/deudores/hooks/use-formulario-deudor'
import type { PropiedadesPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import type { PropiedadesCobroRegistrarVenta } from '@/features/ventas/types/cobro'
import type { PropiedadesEntrega } from '@/features/ventas/types/venta'

/** Props del paso de pago de Registrar Venta con deuda. */
interface RegistrarVentaCobroConDeudaProps {
  propiedadesPago: PropiedadesPagoConDeuda
  /** El cobro de siempre: de el salen el descuento manual, los medios y el envio de una venta de contado. */
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  /** Entrega de la venta: se define aca, al final, y no al armar el carrito. */
  propiedadesEntrega: PropiedadesEntrega
  onVolverAlCarrito: () => void
  onCancelarVenta: () => void
}

/**
 * Seccion 2 de Registrar Venta con deuda. El pago responde "con que paga ahora" y lo que no se paga queda como
 * deuda: cuando eso pasa aparece el bloque Deuda, con el deudor y la fecha estimada. Sin deuda es la venta de
 * contado de siempre.
 */
export function RegistrarVentaCobroConDeuda({
  propiedadesPago,
  propiedadesCobro,
  propiedadesEntrega,
  onVolverAlCarrito,
  onCancelarVenta,
}: RegistrarVentaCobroConDeudaProps) {
  const { estadoPago, estadoConfirmacion } = propiedadesPago
  const { estadoCobro, estadoEnvio } = propiedadesCobro
  const { resumen, deuda, puedeConfirmar, motivoNoConfirmable, formaPago } = estadoPago
  // Solo estado de presentacion: si el dialogo de nuevo deudor esta abierto
  const [dialogoDeudorAbierto, setDialogoDeudorAbierto] = useState(false)

  const registrandoConDeuda = estadoConfirmacion.fase === 'enviando'
  // Mientras la venta viaja no se puede volver ni cancelar: la venta puede registrarse en ese momento
  const enviando = estadoEnvio.fase === 'enviando' || registrandoConDeuda
  const resumenAbierto = estadoConfirmacion.fase !== 'cerrada'

  return (
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- ENCABEZADO --- */}
      <header>
        <Button
          type="button"
          variant="ghost"
          className="-ml-3"
          disabled={enviando}
          onClick={onVolverAlCarrito}
        >
          <ArrowLeft />
          Volver al carrito
        </Button>
      </header>

      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* --- DESCUENTO, PAGO Y DEUDA --- */}
        <div className="flex min-w-0 flex-col gap-bloque">
          <TarjetaDescuentoManual
            descuentoManual={estadoCobro.descuentoManual}
            formularioAbierto={propiedadesCobro.formularioDescuentoAbierto}
            error={propiedadesCobro.errorFormularioDescuento}
            onAbrirFormulario={propiedadesCobro.onAbrirFormularioDescuento}
            onCerrarFormulario={propiedadesCobro.onCerrarFormularioDescuento}
            onAplicar={propiedadesCobro.onAplicarDescuento}
            onQuitar={propiedadesCobro.onQuitarDescuento}
          />
          <EstadoMediosPago
            estadoMediosPago={propiedadesCobro.estadoMediosPago}
            cantidadMedios={estadoPago.mediosDisponibles.length}
            onReintentar={propiedadesCobro.onReintentarMediosPago}
          />
          <PanelPagoAhora
            estadoPago={estadoPago}
            onCambiarFormaPago={propiedadesPago.onCambiarFormaPago}
            onSeleccionarMedioPago={propiedadesPago.onSeleccionarMedioPago}
            onCambiarMontoAhora={propiedadesPago.onCambiarMontoAhora}
            onCambiarPagaCon={propiedadesPago.onCambiarPagaCon}
            onFiarTodo={propiedadesPago.onFiarTodo}
            onCobrarAlgoAhora={propiedadesPago.onCobrarAlgoAhora}
            onAgregarLineaPago={propiedadesPago.onAgregarLineaPago}
            onQuitarLineaPago={propiedadesPago.onQuitarLineaPago}
            onCambiarMontoLinea={propiedadesPago.onCambiarMontoLinea}
            onCambiarPagaConLinea={propiedadesPago.onCambiarPagaConLinea}
            onCompletarConRestante={propiedadesPago.onCompletarConRestante}
          />
          {deuda && (
            <BloqueDeuda
              deuda={deuda}
              onBuscarDeudor={propiedadesPago.onBuscarDeudor}
              onReintentarBusquedaDeudor={propiedadesPago.onReintentarBusquedaDeudor}
              onSeleccionarDeudor={propiedadesPago.onSeleccionarDeudor}
              onCambiarDeudor={propiedadesPago.onCambiarDeudor}
              onCambiarFechaEstimada={propiedadesPago.onCambiarFechaEstimada}
              onNuevoDeudor={() => setDialogoDeudorAbierto(true)}
            />
          )}
          {/* --- ENTREGA: lo ultimo que se define con el cliente --- */}
          <SeccionEntrega propiedades={propiedadesEntrega} deshabilitado={enviando} />
        </div>

        {/* --- RESUMEN --- */}
        <PanelResumenPagoConDeuda
          estadoPago={estadoPago}
          estadoEnvio={estadoEnvio}
          tipoEntrega={propiedadesEntrega.tipoEntrega}
          registrandoConDeuda={registrandoConDeuda}
          onConfirmarPago={propiedadesPago.onConfirmarPago}
          onCancelarVenta={onCancelarVenta}
          onAjustarMontosAutomaticamente={propiedadesPago.onAjustarMontosAutomaticamente}
        />
      </div>

      {/* --- CANCELAR (MOBILE) --- */}
      {/* Al final del contenido, lejos del pulgar, para evitar toques accidentales */}
      <div className="xl:hidden">
        <BotonCancelarVenta etiqueta="Cancelar venta" onCancelarVenta={onCancelarVenta} deshabilitado={enviando} />
      </div>

      {/* --- FOOTER CONFIRMAR (MOBILE) --- */}
      {/* Mismo patron que la Seccion 1: pegado al borde inferior del area con scroll */}
      <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno flex flex-col gap-interno border-t bg-fondo-tarjeta p-contorno xl:hidden">
        {/* El estado va en su propia linea: dentro de la columna del total ensancharia y desbordaria el boton */}
        <EstadoSaldoPago
          queDebe={resumen.queDebe}
          excedente={resumen.excedente}
          puedeAjustarAutomaticamente={formaPago === 'mixto'}
          onAjustarAutomaticamente={propiedadesPago.onAjustarMontosAutomaticamente}
        />
        {motivoNoConfirmable && !puedeConfirmar && (
          <p role="status" className="text-auxiliar text-amber-700 tabular-nums">
            {motivoNoConfirmable}
          </p>
        )}
        <div className="flex items-center justify-between gap-interno">
          <p className="flex min-w-0 flex-col">
            <span className="text-cuerpo text-texto-suave">Cobrás ahora</span>
            <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(resumen.cobradoAhora)}</span>
          </p>
          <BotonConfirmarCobro
            formaPago={deuda ? 'fiado' : 'unico'}
            etiqueta={deuda ? undefined : 'REGISTRAR VENTA'}
            habilitado={puedeConfirmar && !enviando}
            enviando={enviando}
            onConfirmarCobro={propiedadesPago.onConfirmarPago}
            className="flex-1 sm:flex-none"
          />
        </div>
      </footer>

      {/* --- DIALOGOS --- */}
      {dialogoDeudorAbierto && (
        <ContenedorDialogoDeudor
          modo="alta"
          valoresIniciales={DATOS_DEUDOR_VACIOS}
          guardar={propiedadesPago.onCrearDeudor}
          alGuardar={() => setDialogoDeudorAbierto(false)}
          // Si el DNI ya existia, el hook selecciona a esa persona y avisa en el bloque Deuda
          alDniDuplicado={() => setDialogoDeudorAbierto(false)}
          onCerrar={() => setDialogoDeudorAbierto(false)}
        />
      )}
      {resumenAbierto && (
        <DialogoResumenVentaConDeuda
          estadoPago={estadoPago}
          estadoConfirmacion={estadoConfirmacion}
          resumenConfirmacion={propiedadesPago.resumenConfirmacion}
          onCerrar={propiedadesPago.onCerrarResumen}
          onConfirmar={propiedadesPago.onConfirmarVenta}
          onContinuarSinPagoInicial={propiedadesPago.onContinuarSinPagoInicial}
          onAbandonarVentaIncierta={propiedadesPago.onAbandonarVentaIncierta}
          onCambiarDeudor={() => {
            propiedadesPago.onCerrarResumen()
            propiedadesPago.onCambiarDeudor()
          }}
        />
      )}
    </section>
  )
}
