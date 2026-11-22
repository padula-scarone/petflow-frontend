import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'

/** Props de la tarjeta con los datos de contacto de un deudor. */
interface TarjetaDatosDeudorProps {
  deudor: Deudor
  onEditarDeudor: () => void
}

/** Nombre, telefono y DNI del deudor, con el boton para editarlos. */
export function TarjetaDatosDeudor({ deudor, onEditarDeudor }: TarjetaDatosDeudorProps) {
  return (
    <Card className="gap-interno p-contorno">
      <div className="flex items-center justify-between gap-interno">
        <h2 className="text-titulo-seccion font-bold">Datos del deudor</h2>
        <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={onEditarDeudor}>
          <Pencil aria-hidden="true" />
          Editar
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
        <div className="col-span-2 min-w-0">
          <dt className="text-texto-suave">Nombre y apellido</dt>
          <dd className="font-medium wrap-break-word">{deudor.nombreCompleto}</dd>
        </div>
        <div>
          <dt className="text-texto-suave">Teléfono</dt>
          <dd className="font-medium tabular-nums">{deudor.telefono}</dd>
        </div>
        <div>
          <dt className="text-texto-suave">DNI</dt>
          <dd className="font-medium tabular-nums">{deudor.dni}</dd>
        </div>
      </dl>
    </Card>
  )
}
