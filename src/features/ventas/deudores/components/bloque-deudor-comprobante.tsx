import { DatosContactoDeudor } from '@/features/ventas/deudores/components/datos-contacto-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import { describirFechaEstimada } from '@/features/ventas/deudores/utils/fechas-estimadas'

/** Props del bloque con a quien se le fio y para cuando. */
interface BloqueDeudorComprobanteProps {
  deudor: Deudor
  /** AAAA-MM-DD; null = "Sin fecha". */
  fechaEstimadaPago: string | null
}

/** A nombre de quien queda la deuda y la fecha en que se estima que se paga. */
export function BloqueDeudorComprobante({ deudor, fechaEstimadaPago }: BloqueDeudorComprobanteProps) {
  return (
    <section aria-labelledby="titulo-deudor" className="flex flex-col gap-interno">
      <h2 id="titulo-deudor" className="text-titulo-seccion font-bold">
        A nombre de
      </h2>
      <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
        <div className="col-span-2 min-w-0">
          <dt className="text-texto-suave">Deudor</dt>
          <dd className="truncate font-medium">{deudor.nombreCompleto}</dd>
        </div>
        <div className="col-span-2">
          <dt className="sr-only">DNI y teléfono</dt>
          <dd>
            <DatosContactoDeudor dni={deudor.dni} telefono={deudor.telefono} className="text-texto-suave" />
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-texto-suave">Fecha estimada de pago</dt>
          <dd className="font-medium tabular-nums">{describirFechaEstimada(fechaEstimadaPago)}</dd>
        </div>
      </dl>
    </section>
  )
}
