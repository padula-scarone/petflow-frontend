import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'
import type { ClienteHttp, ErrorApi, ResultadoApi } from '@/lib/cliente-http.types'

/** Como se nombra el recurso en los mensajes de error. */
interface DescripcionRecurso {
  /** Para "No pudimos cargar {recurso}", por ejemplo "los productos". */
  recurso: string
  /** Para "No tenés permiso para {accion}", por ejemplo "ver los productos". */
  accion: string
}

interface CargaResuelta<Dato> {
  /** Ultimo dato recibido con exito; se conserva si una recarga posterior falla. */
  datos: Dato | null
  error: ErrorApi | null
  /** Numero de intento al que corresponde este resultado. */
  intentoResuelto: number
}

/**
 * Carga un recurso del back al montar y permite recargarlo. Sin dato todavia, la recarga muestra "cargando";
 * con un dato ya cargado, la recarga es silenciosa: se sigue mostrando el dato anterior hasta que llegue el nuevo.
 * `cargar` debe ser una funcion estable (de modulo), porque cambia la dependencia del efecto.
 */
export function useRecursoRemoto<Dato>(
  cargar: (cliente: ClienteHttp) => Promise<ResultadoApi<Dato>>,
  descripcion: DescripcionRecurso,
) {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [numeroIntento, setNumeroIntento] = useState(0)
  const [carga, setCarga] = useState<CargaResuelta<Dato> | null>(null)

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de un efecto ya desmontado (por ejemplo al empezar una venta nueva)
  useEffect(() => {
    let vigente = true
    void cargar(cliente).then((resultado) => {
      if (!vigente) return
      setCarga((actual) =>
        resultado.exitoso
          ? { datos: resultado.datos, error: null, intentoResuelto: numeroIntento }
          : { datos: actual?.datos ?? null, error: resultado.error, intentoResuelto: numeroIntento },
      )
    })
    return () => {
      vigente = false
    }
  }, [cargar, cliente, numeroIntento])

  // --- CALCULOS ---
  const datos = carga?.datos ?? null
  const huboErrorEnEsteIntento =
    carga !== null && carga.error !== null && carga.intentoResuelto === numeroIntento
  const estado: EstadoCargaRecurso =
    datos !== null
      ? { fase: 'listo', mensajeError: null }
      : huboErrorEnEsteIntento && carga.error !== null
        ? {
            fase: 'error',
            mensajeError: traducirErrorConsulta(carga.error, descripcion.recurso, descripcion.accion),
          }
        : { fase: 'cargando', mensajeError: null }

  return { datos, estado, recargar: () => setNumeroIntento((actual) => actual + 1) }
}
