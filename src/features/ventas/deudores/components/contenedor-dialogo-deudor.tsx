import { DialogoDeudor, type ModoDialogoDeudor } from '@/features/ventas/deudores/components/dialogo-deudor'
import { useFormularioDeudor } from '@/features/ventas/deudores/hooks/use-formulario-deudor'
import type { DatosDeudor, Deudor, EstadoGuardadoDeudor } from '@/features/ventas/deudores/types/deudor'

/** Props del contenedor que conecta el dialogo con su formulario. */
interface ContenedorDialogoDeudorProps {
  modo: ModoDialogoDeudor
  /** Con lo que se abre: vacio en un alta, el deudor actual en una edicion. */
  valoresIniciales: DatosDeudor
  /** Guarda en el back; devuelve como termino. */
  guardar: (datos: DatosDeudor) => Promise<EstadoGuardadoDeudor>
  /** Se llama cuando el guardado sale bien, con el deudor guardado. */
  alGuardar: (deudor: Deudor) => void
  /** Se llama cuando el DNI ya existia. Si no se informa, el dialogo se queda abierto mostrando el aviso. */
  alDniDuplicado?: (deudorExistente: Deudor) => void
  onCerrar: () => void
}

/**
 * Conecta el formulario de un deudor con su dialogo. Se monta al abrirse y se desmonta al cerrarse, asi los campos
 * arrancan siempre con los valores iniciales y sin errores.
 */
export function ContenedorDialogoDeudor({
  modo,
  valoresIniciales,
  guardar,
  alGuardar,
  alDniDuplicado,
  onCerrar,
}: ContenedorDialogoDeudorProps) {
  const formulario = useFormularioDeudor({ valoresIniciales, guardar })

  const enviar = async () => {
    const resultado = await formulario.enviar()
    if (resultado.fase === 'guardado') alGuardar(resultado.deudor)
    if (resultado.fase === 'dni-duplicado' && alDniDuplicado) alDniDuplicado(resultado.deudorExistente)
  }

  return (
    <DialogoDeudor
      modo={modo}
      valores={formulario.valores}
      errores={formulario.errores}
      estadoGuardado={formulario.estadoGuardado}
      datosCompletos={formulario.datosCompletos}
      onCambiarValor={formulario.cambiarValor}
      onSalirDelCampo={formulario.salirDelCampo}
      onEnviar={() => void enviar()}
      onCerrar={onCerrar}
    />
  )
}
