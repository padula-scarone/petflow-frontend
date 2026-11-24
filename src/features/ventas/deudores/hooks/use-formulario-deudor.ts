import { useState } from 'react'
import type {
  CampoDeudor,
  DatosDeudor,
  ErroresDatosDeudor,
  EstadoGuardadoDeudor,
} from '@/features/ventas/deudores/types/deudor'
import {
  normalizarDatosDeudor,
  validarCampoDeudor,
  validarDatosDeudor,
} from '@/features/ventas/deudores/utils/validar-datos-deudor'
import { MENSAJE_GUARDADO_DEUDOR_FALLIDO } from '@/features/ventas/deudores/config/mensajes-deudores'

/** Datos de un formulario de deudor vacio. */
export const DATOS_DEUDOR_VACIOS: DatosDeudor = { nombreCompleto: '', telefono: '', dni: '' }

/** Lo que necesita el formulario para guardar. */
interface OpcionesFormularioDeudor {
  /** Con lo que se abre: vacio en un alta, el deudor actual en una edicion. */
  valoresIniciales: DatosDeudor
  /** Guarda en el back; devuelve como termino. */
  guardar: (datos: DatosDeudor) => Promise<EstadoGuardadoDeudor>
}

/**
 * Estado de un formulario de deudor: valores, errores de formato y guardado. Valida al salir de cada campo y al
 * enviar, y nunca repite en un mensaje lo que la persona escribio.
 */
export function useFormularioDeudor({ valoresIniciales, guardar }: OpcionesFormularioDeudor) {
  // --- ESTADOS ---
  const [valores, setValores] = useState<DatosDeudor>(valoresIniciales)
  // Un campo se valida recien al salir de el: no se marca un error mientras todavia se esta escribiendo
  const [camposTocados, setCamposTocados] = useState<CampoDeudor[]>([])
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardadoDeudor>({ fase: 'inactivo' })

  // --- CALCULOS ---
  const erroresCompletos = validarDatosDeudor(valores)
  // Solo se muestran los errores de campos ya tocados, o todos despues de intentar enviar
  const errores: ErroresDatosDeudor = Object.fromEntries(
    Object.entries(erroresCompletos).filter(
      ([campo]) => intentoEnviar || camposTocados.includes(campo as CampoDeudor),
    ),
  )
  const guardando = estadoGuardado.fase === 'guardando'

  // --- ACCIONES ---
  const cambiarValor = (campo: CampoDeudor, valor: string) => {
    setValores({ ...valores, [campo]: valor })
    // Si el DNI cambio, el aviso de "ya existe" deja de corresponder
    if (estadoGuardado.fase !== 'inactivo' && estadoGuardado.fase !== 'guardando') {
      setEstadoGuardado({ fase: 'inactivo' })
    }
  }

  const salirDelCampo = (campo: CampoDeudor) => {
    if (validarCampoDeudor(campo, valores[campo]) !== undefined && !camposTocados.includes(campo)) {
      setCamposTocados([...camposTocados, campo])
    }
  }

  /** Valida y guarda. Devuelve el resultado para que quien abrio el formulario decida que hacer. */
  const enviar = async (): Promise<EstadoGuardadoDeudor> => {
    setIntentoEnviar(true)
    if (Object.keys(erroresCompletos).length > 0) return { fase: 'inactivo' }

    setEstadoGuardado({ fase: 'guardando' })
    try {
      const resultado = await guardar(normalizarDatosDeudor(valores))
      setEstadoGuardado(resultado)
      return resultado
    } catch {
      const fallo: EstadoGuardadoDeudor = { fase: 'error', mensaje: MENSAJE_GUARDADO_DEUDOR_FALLIDO }
      setEstadoGuardado(fallo)
      return fallo
    }
  }

  return { valores, errores, estadoGuardado, guardando, cambiarValor, salirDelCampo, enviar }
}
