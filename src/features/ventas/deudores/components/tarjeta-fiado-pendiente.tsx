import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatearFecha } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonPagosFiado } from '@/features/ventas/deudores/components/boton-pagos-fiado'
import { CampoMontoFiado } from '@/features/ventas/deudores/components/campo-monto-fiado'
import { EstadoProximoPago } from '@/features/ventas/deudores/components/estado-proximo-pago'
import { ListaPagosFiado } from '@/features/ventas/deudores/components/lista-pagos-fiado'
import type { FilaFiadoSeleccionable } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props de la tarjeta de un fiado pendiente (mobile y pantallas medianas). */
interface TarjetaFiadoPendienteProps {
  fila: FilaFiadoSeleccionable
  onAlternarFiado: (idVenta: number) => void
  onCambiarMontoFiado: (idVenta: number, monto: number | null) => void
}

/** Tarjeta de un fiado: tildarlo lo elige para cobrar, y aparece el monto a cobrar para poder bajarlo. */
export function TarjetaFiadoPendiente({ fila, onAlternarFiado, onCambiarMontoFiado }: TarjetaFiadoPendienteProps) {
  const { fiado } = fila
  const referencia = useRef<HTMLDivElement>(null)
  // Solo estado de presentacion: si los pagos estan desplegados
  const [pagosAbiertos, setPagosAbiertos] = useState(false)
  const idListaPagos = `pagos-fiado-tarjeta-${fiado.idVenta}`

  // El fiado que llego desde "Ver deuda" se lleva a la vista
  useEffect(() => {
    if (fila.resaltado) referencia.current?.scrollIntoView({ block: 'center' })
  }, [fila.resaltado])

  return (
    <Card
      ref={referencia}
      className={cn(
        'h-full min-w-0 gap-interno p-contorno',
        fila.seleccionado && 'border-texto-principal bg-fondo-seleccion/50',
        fila.resaltado && 'bg-fondo-seleccion',
      )}
    >
      {/* --- CASILLA, COMPROBANTE Y FECHA --- */}
      {/* Todo el encabezado es un label: tocar el comprobante tilda el fiado, con un area de al menos 44 px */}
      <label className="-mt-1 flex min-h-11 cursor-pointer items-center gap-interno">
        <Checkbox
          checked={fila.seleccionado}
          aria-label={`Cobrar el fiado ${fiado.numeroComprobante}`}
          onCheckedChange={() => onAlternarFiado(fiado.idVenta)}
        />
        <span className="min-w-0">
          <span className="block font-bold tabular-nums">{fiado.numeroComprobante}</span>
          <span className="block text-cuerpo text-texto-suave tabular-nums">{formatearFecha(fiado.fechaHora)}</span>
        </span>
        <span className="ml-auto flex shrink-0 flex-col items-end">
          <span className="text-auxiliar text-texto-suave">Falta</span>
          <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(fiado.montoFaltante)}</span>
        </span>
      </label>

      {/* --- IMPORTES Y FECHA ESTIMADA --- */}
      <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno border-t pt-interno text-cuerpo">
        <div>
          <dt className="text-auxiliar text-texto-suave">Adeudado</dt>
          <dd className="font-medium tabular-nums">{formatearMoneda(fiado.importeAdeudado)}</dd>
        </div>
        <div>
          <dt className="text-auxiliar text-texto-suave">Pagado</dt>
          <dd className="font-medium">
            {/* -ml-3: el boton trae su propio aire; asi el monto queda alineado con el de al lado */}
            <BotonPagosFiado
              idLista={idListaPagos}
              numeroComprobante={fiado.numeroComprobante}
              montoPagado={fiado.montoPagado}
              cantidadPagos={fiado.pagos.length}
              abierto={pagosAbiertos}
              onAlternar={() => setPagosAbiertos(!pagosAbiertos)}
              className="-my-2 -ml-3 font-medium"
            />
          </dd>
        </div>
        {pagosAbiertos && (
          <div className="col-span-2 rounded-grande bg-fondo-suave p-interno">
            <ListaPagosFiado idLista={idListaPagos} numeroComprobante={fiado.numeroComprobante} pagos={fiado.pagos} />
          </div>
        )}
        <div className="col-span-2">
          <dt className="text-auxiliar text-texto-suave">Fecha estimada de pago</dt>
          <dd className="font-medium">
            <EstadoProximoPago fecha={fiado.fechaEstimadaPago} vencido={fiado.fechaEstimadaVencida} tieneSaldo />
          </dd>
        </div>
      </dl>

      {/* --- MONTO A COBRAR --- */}
      <div className="flex items-start justify-between gap-interno border-t pt-interno">
        <span className="pt-2 text-cuerpo font-medium">A cobrar</span>
        <CampoMontoFiado
          idCampo={`monto-fiado-tarjeta-${fiado.idVenta}`}
          etiquetaAccesible={`Monto a cobrar del fiado ${fiado.numeroComprobante}`}
          valor={fila.montoACobrar}
          deshabilitado={!fila.seleccionado}
          error={fila.errorMonto}
          onCambiar={(monto) => onCambiarMontoFiado(fiado.idVenta, monto)}
          className="w-44"
        />
      </div>
    </Card>
  )
}
