import { useSesion } from '@/features/auth/hooks/use-sesion'
import { crearDeudorApi, editarDeudorApi } from '@/features/ventas/deudores/api/deudores-api'
import type { DatosDeudor, EstadoGuardadoDeudor } from '@/features/ventas/deudores/types/deudor'
import { traducirErrorGuardadoDeudor } from '@/features/ventas/deudores/utils/traducir-error-deudores'

/**
 * El alta y la edicion de un deudor contra el back, ya traducidas al estado que entiende el formulario. Los datos
 * llegan normalizados (el telefono con el 549). Un DNI repetido no es un error: devuelve al deudor que ya lo tiene.
 */
export function useGuardarDeudor() {
  const { cliente } = useSesion()

  // --- ACCIONES ---
  const crear = async (datos: DatosDeudor): Promise<EstadoGuardadoDeudor> => {
    const resultado = await crearDeudorApi(cliente, datos)
    return resultado.exitoso ? { fase: 'guardado', deudor: resultado.datos } : traducirErrorGuardadoDeudor(resultado.error)
  }

  const editar = async (idDeudor: number, datos: DatosDeudor): Promise<EstadoGuardadoDeudor> => {
    const resultado = await editarDeudorApi(cliente, idDeudor, datos)
    return resultado.exitoso ? { fase: 'guardado', deudor: resultado.datos } : traducirErrorGuardadoDeudor(resultado.error)
  }

  return { crear, editar }
}
