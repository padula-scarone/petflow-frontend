import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormularioDeudor } from '@/features/ventas/deudores/components/formulario-deudor'
import type {
  CampoDeudor,
  DatosDeudor,
  Deudor,
  ErroresDatosDeudor,
  EstadoGuardadoDeudor,
} from '@/features/ventas/deudores/types/deudor'

/** Alta de un deudor nuevo o edicion de uno existente. */
export type ModoDialogoDeudor = 'alta' | 'edicion'

/** Props del dialogo de alta y edicion de un deudor. */
interface DialogoDeudorProps {
  modo: ModoDialogoDeudor
  valores: DatosDeudor
  errores: ErroresDatosDeudor
  estadoGuardado: EstadoGuardadoDeudor
  onCambiarValor: (campo: CampoDeudor, valor: string) => void
  onSalirDelCampo: (campo: CampoDeudor) => void
  onEnviar: () => void
  onCerrar: () => void
  /** Solo en el alta: abre la ficha de quien ya tenia ese DNI. */
  onVerDeudorExistente?: (deudor: Deudor) => void
}

const ID_FORMULARIO_DEUDOR = 'formulario-deudor'

/** Aviso que corresponde al resultado del guardado; null si no hay nada que avisar. */
function AvisoGuardado({
  modo,
  estadoGuardado,
  onVerDeudorExistente,
}: Pick<DialogoDeudorProps, 'modo' | 'estadoGuardado' | 'onVerDeudorExistente'>) {
  if (estadoGuardado.fase === 'dni-duplicado') {
    const { deudorExistente } = estadoGuardado
    return (
      <Alert variant="destructive">
        <AlertTitle>
          {modo === 'alta' ? 'Ya hay un deudor con ese DNI' : 'Ese DNI pertenece a otro deudor'}
        </AlertTitle>
        <AlertDescription>
          {modo === 'alta' && onVerDeudorExistente ? (
            <>
              <p>Está registrado a nombre de {deudorExistente.nombreCompleto}.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-interno bg-fondo-tarjeta text-texto-principal"
                onClick={() => onVerDeudorExistente(deudorExistente)}
              >
                Ver ficha de {deudorExistente.nombreCompleto}
              </Button>
            </>
          ) : (
            <p>Revisá el número: cada persona tiene un solo DNI.</p>
          )}
        </AlertDescription>
      </Alert>
    )
  }
  if (estadoGuardado.fase === 'no-encontrado') {
    return (
      <Alert variant="destructive">
        <AlertTitle>El deudor ya no existe</AlertTitle>
        <AlertDescription>
          <p>No se guardaron los cambios.</p>
        </AlertDescription>
      </Alert>
    )
  }
  if (estadoGuardado.fase === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudo guardar</AlertTitle>
        <AlertDescription>
          <p>{estadoGuardado.mensaje}</p>
        </AlertDescription>
      </Alert>
    )
  }
  return null
}

/** Dialogo con el formulario de un deudor. Con foco atrapado y cierre con Escape, como todo dialogo de la app. */
export function DialogoDeudor({
  modo,
  valores,
  errores,
  estadoGuardado,
  onCambiarValor,
  onSalirDelCampo,
  onEnviar,
  onCerrar,
  onVerDeudorExistente,
}: DialogoDeudorProps) {
  const guardando = estadoGuardado.fase === 'guardando'

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !guardando && onCerrar()}>
      <DialogContent aria-describedby="descripcion-dialogo-deudor">
        <DialogHeader>
          <DialogTitle>{modo === 'alta' ? 'Nuevo deudor' : 'Editar deudor'}</DialogTitle>
          <DialogDescription id="descripcion-dialogo-deudor">
            {modo === 'alta'
              ? 'Con estos datos vas a poder registrar fiados y cobrarle después.'
              : 'Cambiá los datos de contacto del deudor.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <FormularioDeudor
            idFormulario={ID_FORMULARIO_DEUDOR}
            valores={valores}
            errores={errores}
            deshabilitado={guardando}
            onCambiarValor={onCambiarValor}
            onSalirDelCampo={onSalirDelCampo}
            onEnviar={onEnviar}
          />
          <AvisoGuardado modo={modo} estadoGuardado={estadoGuardado} onVerDeudorExistente={onVerDeudorExistente} />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={guardando} className="bg-fondo-tarjeta" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form={ID_FORMULARIO_DEUDOR} disabled={guardando}>
            {guardando && <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
            {guardando ? 'Guardando…' : modo === 'alta' ? 'Guardar deudor' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
