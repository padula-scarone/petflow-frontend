import { AlertaEnvioInciertoDevolucion } from '@/features/ventas/devoluciones/components/alerta-envio-incierto-devolucion'
import { AlertaErrorDevolucion } from '@/features/ventas/devoluciones/components/alerta-error-devolucion'
import { ResumenDevolucion } from '@/features/ventas/devoluciones/components/resumen-devolucion'
import type { AltaDevolucionProps } from '@/features/ventas/devoluciones/types/devolucion'
import { EstadoMediosPago } from '@/features/ventas/components/estado-medios-pago'
import { GrillaMediosPago } from '@/features/ventas/components/grilla-medios-pago'

/** Props del paso "Cobro y confirmación". */
type PasoCobroProps = Pick<
  AltaDevolucionProps,
  | 'borrador'
  | 'mediosPago'
  | 'estadoMediosPago'
  | 'onReintentarMediosPago'
  | 'resumenSaldo'
  | 'validacion'
  | 'estadoEnvio'
  | 'acciones'
>

/**
 * Paso 4: resumen previo, cobro de la diferencia (solo si hay saldo) y, si el servidor rechazo
 * la devolución o no se sabe si la guardo, el aviso con lo que se puede hacer.
 */
export function PasoCobro({
  borrador,
  mediosPago,
  estadoMediosPago,
  onReintentarMediosPago,
  resumenSaldo,
  validacion,
  estadoEnvio,
  acciones,
}: PasoCobroProps) {
  const errorMonto = validacion.erroresCampo.montoRecibido

  return (
    <div className="flex flex-col gap-bloque">
      {estadoEnvio.tipo === 'incierto' && (
        <AlertaEnvioInciertoDevolucion
          mensaje={estadoEnvio.mensaje}
          verificando={estadoEnvio.verificando}
          onVerificar={acciones.onVerificarEnvio}
        />
      )}
      {estadoEnvio.tipo === 'error' && (
        <AlertaErrorDevolucion
          error={estadoEnvio.error}
          onElegirOtraVenta={acciones.onElegirOtraVenta}
          onReintentar={acciones.onConfirmarDevolucion}
        />
      )}

      <ResumenDevolucion borrador={borrador} resumenSaldo={resumenSaldo} />

      {/* --- COBRO DE LA DIFERENCIA --- */}
      <section aria-labelledby="titulo-cobro-devolucion" className="flex flex-col gap-interno">
        <h2 id="titulo-cobro-devolucion" className="text-titulo-seccion font-bold">
          Cobro de la diferencia
        </h2>
        {resumenSaldo.situacion === 'A_COBRAR' ? (
          <>
            {estadoMediosPago.fase !== 'listo' ? (
              <EstadoMediosPago
                estadoMediosPago={estadoMediosPago}
                cantidadMedios={mediosPago.length}
                onReintentar={onReintentarMediosPago}
              />
            ) : mediosPago.length === 0 ? (
              <p className="text-cuerpo text-texto-suave">No hay medios de pago activos: no se puede cobrar la diferencia.</p>
            ) : (
              /* En una devolución el saldo se cobra sin recargo ni descuento del medio: no se muestran los ajustes */
              <GrillaMediosPago
                medios={mediosPago}
                idMedioSeleccionado={borrador.idMedioPago}
                pagaCon={borrador.montoRecibido}
                vuelto={resumenSaldo.vuelto}
                mostrarAjustes={false}
                onSeleccionarMedioPago={acciones.onSeleccionarMedioPago}
                onCambiarPagaCon={acciones.onCambiarMontoRecibido}
              />
            )}
            {errorMonto && <p className="text-cuerpo text-peligro">{errorMonto}</p>}
          </>
        ) : (
          <p className="text-cuerpo text-texto-suave">No hay diferencia para cobrar: esta devolución no mueve la caja.</p>
        )}
      </section>
    </div>
  )
}
