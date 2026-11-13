import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  SelectorMotivo,
  type OpcionSelectorMotivo,
} from '@/features/ventas/components/selector-motivo'

/** Rechazo del servidor que el dialogo sabe mostrar. */
export interface ErrorDialogoMotivo {
  estadoHttp: number
  mensaje: string
}

/** Props del dialogo que confirma una accion irreversible y pide el motivo. */
interface DialogoConfirmarConMotivoProps {
  abierto: boolean
  titulo: ReactNode
  descripcion: ReactNode
  /** true: el boton de confirmar va en rojo (anulaciones). */
  esDestructiva: boolean
  etiquetaConfirmar: string
  etiquetaEnviando: string
  opcionesMotivo: OpcionSelectorMotivo[]
  /** Distingue los ids del selector de motivo. */
  idPrefijoMotivo: string
  codigoMotivo: string | null
  detalleMotivo: string
  motivoValido: boolean
  enviando: boolean
  error: ErrorDialogoMotivo | null
  /** Titulo del aviso segun el codigo HTTP del rechazo. */
  titulosError: Record<number, string>
  onConfirmar: () => void
  onCancelar: () => void
  onSeleccionarMotivo: (codigoMotivo: string) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

export function DialogoConfirmarConMotivo({
  abierto,
  titulo,
  descripcion,
  esDestructiva,
  etiquetaConfirmar,
  etiquetaEnviando,
  opcionesMotivo,
  idPrefijoMotivo,
  codigoMotivo,
  detalleMotivo,
  motivoValido,
  enviando,
  error,
  titulosError,
  onConfirmar,
  onCancelar,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: DialogoConfirmarConMotivoProps) {
  return (
    <AlertDialog
      open={abierto}
      // Mientras se espera al servidor no se puede cerrar: la accion ya esta en camino
      onOpenChange={(estaAbierto) => {
        if (!estaAbierto && !enviando) onCancelar()
      }}
    >
      {/* Con la lista de motivos el contenido puede superar la pantalla: scrollea dentro del dialogo */}
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>

        {/* --- MOTIVO (SOLO ANTES DE ENVIAR; UN RECHAZO DEL SERVIDOR LO REEMPLAZA) --- */}
        {!error && (
          <SelectorMotivo
            idPrefijo={idPrefijoMotivo}
            opciones={opcionesMotivo}
            codigoMotivo={codigoMotivo}
            detalleMotivo={detalleMotivo}
            deshabilitado={enviando}
            onSeleccionarMotivo={onSeleccionarMotivo}
            onCambiarDetalleMotivo={onCambiarDetalleMotivo}
          />
        )}

        {/* --- RECHAZO DEL SERVIDOR --- */}
        {error && (
          <Alert variant="destructive">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>{titulosError[error.estadoHttp] ?? 'No se pudo completar la acción'}</AlertTitle>
            <AlertDescription>
              <p>{error.mensaje}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Por que el boton esta deshabilitado */}
        {!error && !motivoValido && (
          <p role="status" className="text-xs text-texto-suave">
            {codigoMotivo === null ? 'Elegí un motivo para continuar.' : 'Escribí el motivo para continuar.'}
          </p>
        )}

        <AlertDialogFooter>
          {error ? (
            <AlertDialogCancel className="h-11 px-6">Entendido</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel className="h-11 px-6" disabled={enviando}>
                Volver
              </AlertDialogCancel>
              <AlertDialogAction
                variant={esDestructiva ? 'destructive' : 'default'}
                className="h-11 px-6"
                disabled={enviando || !motivoValido}
                // preventDefault: el dialogo queda abierto hasta que responda el servidor
                onClick={(evento) => {
                  evento.preventDefault()
                  onConfirmar()
                }}
              >
                {enviando ? etiquetaEnviando : etiquetaConfirmar}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
