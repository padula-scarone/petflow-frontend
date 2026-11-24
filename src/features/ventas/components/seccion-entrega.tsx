import { CamposDatosEnvio } from '@/features/ventas/components/campos-datos-envio'
import {
  TarjetaSelectorOpciones,
  type OpcionSelector,
} from '@/features/ventas/components/tarjeta-selector-opciones'
import type { PropiedadesEntrega, TipoEntrega } from '@/features/ventas/types/venta'

const OPCIONES_ENTREGA: OpcionSelector<TipoEntrega>[] = [
  { valor: 'retiro', etiqueta: 'Retiro' },
  { valor: 'envio', etiqueta: 'Envío' },
]

/** Props de la seccion Entrega del cobro. */
interface SeccionEntregaProps {
  propiedades: PropiedadesEntrega
  /** Verdadero mientras la venta viaja al back: no se cambia nada. */
  deshabilitado: boolean
}

/**
 * Como recibe la mercaderia el cliente: Retiro o Envio y, con Envio, la direccion y el destinatario. Va al final del
 * cobro porque es lo ultimo que se acuerda con el cliente.
 */
export function SeccionEntrega({ propiedades, deshabilitado }: SeccionEntregaProps) {
  const {
    tipoEntrega,
    direccionEnvio,
    destinatarioEnvio,
    erroresDatosEnvio,
    intentosFallidos,
    onCambiarEntrega,
    onCambiarDireccionEnvio,
    onCambiarDestinatarioEnvio,
  } = propiedades

  return (
    <TarjetaSelectorOpciones
      idTitulo="titulo-entrega"
      titulo="Entrega"
      opciones={OPCIONES_ENTREGA}
      valor={tipoEntrega}
      onCambiar={onCambiarEntrega}
      deshabilitado={deshabilitado}
    >
      {/* --- DATOS DEL ENVIO: solo con Envio --- */}
      {tipoEntrega === 'envio' && (
        <CamposDatosEnvio
          direccionEnvio={direccionEnvio}
          destinatarioEnvio={destinatarioEnvio}
          errores={erroresDatosEnvio}
          intentosFallidos={intentosFallidos}
          deshabilitado={deshabilitado}
          onCambiarDireccionEnvio={onCambiarDireccionEnvio}
          onCambiarDestinatarioEnvio={onCambiarDestinatarioEnvio}
        />
      )}
    </TarjetaSelectorOpciones>
  )
}
