import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonCancelarVenta } from '@/features/ventas/components/boton-cancelar-venta'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoCobertura } from '@/features/ventas/components/estado-cobertura'
import { PanelFormaPago } from '@/features/ventas/components/panel-forma-pago'
import { PanelResumenCobro } from '@/features/ventas/components/panel-resumen-cobro'
import { TarjetaDescuentoManual } from '@/features/ventas/components/tarjeta-descuento-manual'
import type { RegistrarVentaCobroProps } from '@/features/ventas/types/cobro'

export function RegistrarVentaCobro({
  estadoCobro,
  onVolverAlCarrito,
  onCancelarVenta,
  onConfirmarCobro,
  onCambiarFormaPago,
  onSeleccionarMedioPago,
  onCambiarPagaCon,
  onAgregarLineaPago,
  onQuitarLineaPago,
  onCambiarMontoLinea,
  onCambiarPagaConLinea,
  onCompletarConRestante,
  onAjustarMontosAutomaticamente,
  formularioDescuentoAbierto,
  errorFormularioDescuento,
  onAbrirFormularioDescuento,
  onCerrarFormularioDescuento,
  onAplicarDescuento,
  onQuitarDescuento,
  textoBusquedaCliente,
  resultadosBusquedaCliente,
  onBuscarCliente,
  onSeleccionarCliente,
  onQuitarCliente,
  onCrearCliente,
}: RegistrarVentaCobroProps) {
  const { resumen, formaPago, puedeConfirmar, motivoNoConfirmable } = estadoCobro

  return (
    <section className="flex flex-col gap-6">
      {/* --- ENCABEZADO --- */}
      <header>
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 h-11 gap-2 px-3"
          onClick={onVolverAlCarrito}
        >
          <ArrowLeft />
          Volver al carrito
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* --- DESCUENTO Y FORMA DE PAGO --- */}
        <div className="flex min-w-0 flex-col gap-6">
          <TarjetaDescuentoManual
            descuentoManual={estadoCobro.descuentoManual}
            formularioAbierto={formularioDescuentoAbierto}
            error={errorFormularioDescuento}
            onAbrirFormulario={onAbrirFormularioDescuento}
            onCerrarFormulario={onCerrarFormularioDescuento}
            onAplicar={onAplicarDescuento}
            onQuitar={onQuitarDescuento}
          />
          <PanelFormaPago
            estadoCobro={estadoCobro}
            textoBusquedaCliente={textoBusquedaCliente}
            resultadosBusquedaCliente={resultadosBusquedaCliente}
            onCambiarFormaPago={onCambiarFormaPago}
            onSeleccionarMedioPago={onSeleccionarMedioPago}
            onCambiarPagaCon={onCambiarPagaCon}
            onAgregarLineaPago={onAgregarLineaPago}
            onQuitarLineaPago={onQuitarLineaPago}
            onCambiarMontoLinea={onCambiarMontoLinea}
            onCambiarPagaConLinea={onCambiarPagaConLinea}
            onCompletarConRestante={onCompletarConRestante}
            onBuscarCliente={onBuscarCliente}
            onSeleccionarCliente={onSeleccionarCliente}
            onQuitarCliente={onQuitarCliente}
            onCrearCliente={onCrearCliente}
          />
        </div>

        {/* --- RESUMEN --- */}
        <PanelResumenCobro
          resumen={resumen}
          formaPago={formaPago}
          puedeConfirmar={puedeConfirmar}
          motivoNoConfirmable={motivoNoConfirmable}
          onConfirmarCobro={onConfirmarCobro}
          onCancelarVenta={onCancelarVenta}
          onAjustarMontosAutomaticamente={onAjustarMontosAutomaticamente}
        />
      </div>

      {/* --- CANCELAR (MOBILE) --- */}
      {/* Al final del contenido, lejos del pulgar, para evitar toques accidentales */}
      <div className="lg:hidden">
        <BotonCancelarVenta etiqueta="Cancelar venta" onCancelarVenta={onCancelarVenta} />
      </div>

      {/* --- FOOTER CONFIRMAR (MOBILE) --- */}
      {/* Mismo patron que la Seccion 1: pegado al borde inferior del area con scroll */}
      <footer className="sticky -bottom-4 z-10 -mx-4 -mb-4 flex flex-col gap-2 border-t bg-fondo-tarjeta p-4 lg:hidden">
        {/* El estado va en su propia linea: dentro de la columna del total ensancharia y desbordaria el boton */}
        {formaPago === 'mixto' && (
          <EstadoCobertura
            faltaCubrir={resumen.faltaCubrir}
            excedente={resumen.excedente}
            onAjustarAutomaticamente={onAjustarMontosAutomaticamente}
          />
        )}
        {motivoNoConfirmable && !puedeConfirmar && (
          <p role="status" className="text-xs text-amber-700 tabular-nums">
            {motivoNoConfirmable}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 flex-col">
            <span className="text-sm text-texto-suave">Total</span>
            <span className="text-xl font-bold tabular-nums">{formatearMoneda(resumen.total)}</span>
          </p>
          <BotonConfirmarCobro
            formaPago={formaPago}
            habilitado={puedeConfirmar}
            onConfirmarCobro={onConfirmarCobro}
            className="flex-1 sm:flex-none"
          />
        </div>
      </footer>
    </section>
  )
}
