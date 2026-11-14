import { AlertaEnvioInciertoCambio } from '@/features/ventas/cambios-mercaderia/components/alerta-envio-incierto-cambio'
import { AlertaErrorCambio } from '@/features/ventas/cambios-mercaderia/components/alerta-error-cambio'
import { ResumenCambio } from '@/features/ventas/cambios-mercaderia/components/resumen-cambio'
import type { AltaCambioProps } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { EstadoMediosPago } from '@/features/ventas/components/estado-medios-pago'
import { GrillaMediosPago } from '@/features/ventas/components/grilla-medios-pago'

/** Props del paso "Cobro y confirmación". */
type PasoCobroProps = Pick<
  AltaCambioProps,
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
 * el cambio o no se sabe si lo guardo, el aviso con lo que se puede hacer.
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
    <div className="flex flex-col gap-5">
      {estadoEnvio.tipo === 'incierto' && (
        <AlertaEnvioInciertoCambio
          mensaje={estadoEnvio.mensaje}
          verificando={estadoEnvio.verificando}
          onVerificar={acciones.onVerificarEnvio}
        />
      )}
      {estadoEnvio.tipo === 'error' && (
        <AlertaErrorCambio
          error={estadoEnvio.error}
          onElegirOtraVenta={acciones.onElegirOtraVenta}
          onReintentar={acciones.onConfirmarCambio}
        />
      )}

      <ResumenCambio borrador={borrador} resumenSaldo={resumenSaldo} />

      {/* --- COBRO DE LA DIFERENCIA --- */}
      <section aria-labelledby="titulo-cobro-cambio" className="flex flex-col gap-3">
        <h2 id="titulo-cobro-cambio" className="text-base font-bold">
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
              <p className="text-sm text-texto-suave">No hay medios de pago activos: no se puede cobrar la diferencia.</p>
            ) : (
              /* En un cambio el saldo se cobra sin recargo ni descuento del medio: no se muestran los ajustes */
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
            {errorMonto && <p className="text-sm text-peligro">{errorMonto}</p>}
          </>
        ) : (
          <p className="text-sm text-texto-suave">No hay diferencia para cobrar: este cambio no mueve la caja.</p>
        )}
      </section>
    </div>
  )
}
