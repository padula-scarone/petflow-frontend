import { useRef, useState } from 'react'
import { iniciarSesionApi } from '@/features/auth/api/iniciar-sesion-api'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import type {
  CampoInicioSesion,
  CredencialesInicioSesion,
  ErroresCamposInicioSesion,
  IniciarSesionProps,
} from '@/features/auth/types/inicio-sesion'
import { crearSesion } from '@/features/auth/utils/crear-sesion'
import { traducirErrorInicioSesion } from '@/features/auth/utils/traducir-error-inicio-sesion'
import { validarCredenciales } from '@/features/auth/utils/validar-credenciales'

const ESTADO_CREDENCIALES_INVALIDAS = 401

/**
 * Logica de la pantalla Iniciar Sesion: estado del formulario, validacion y envio al back.
 * Al ingresar solo guarda la sesion; volver a la ruta pedida lo resuelve la pagina.
 * @param avisoInicial Mensaje con el que arranca el error general (por ejemplo, sesion vencida).
 */
export function useIniciarSesion(avisoInicial: string | null): IniciarSesionProps {
  const { cliente, iniciarSesion } = useSesion()

  // --- ESTADOS ---
  const [credenciales, setCredenciales] = useState<CredencialesInicioSesion>({
    username: '',
    clave: '',
  })
  const [claveVisible, setClaveVisible] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(avisoInicial)
  const [erroresCampos, setErroresCampos] = useState<ErroresCamposInicioSesion>({})
  // El estado no frena un segundo toque que llega antes del siguiente render; el ref si
  const envioEnCursoRef = useRef(false)

  // --- ACCIONES ---
  // Al editar un campo se limpia su error y el general, que ya no describen lo que se ve
  const cambiarCampo = (campo: CampoInicioSesion, valor: string) => {
    setCredenciales({ ...credenciales, [campo]: valor })
    setErroresCampos({ ...erroresCampos, [campo]: undefined })
    setErrorGeneral(null)
  }

  const enviarCredenciales = async () => {
    if (envioEnCursoRef.current) return

    const errores = validarCredenciales(credenciales)
    setErroresCampos(errores)
    setErrorGeneral(null)
    if (Object.keys(errores).length > 0) return

    envioEnCursoRef.current = true
    setEnviando(true)
    // Antes de enviar: el vencimiento se cuenta desde aca, y el token se emite despues
    const momentoSolicitud = Date.now()
    const resultado = await iniciarSesionApi(cliente, {
      username: credenciales.username.trim(),
      clave: credenciales.clave,
    })
    envioEnCursoRef.current = false
    setEnviando(false)

    if (resultado.exitoso) {
      iniciarSesion(crearSesion(resultado.datos, momentoSolicitud))
      return
    }

    const traduccion = traducirErrorInicioSesion(resultado.error)
    setErrorGeneral(traduccion.errorGeneral)
    setErroresCampos(traduccion.erroresCampos)
    // Credenciales invalidas: se conserva el usuario y se vacia la clave
    if (resultado.error.estado === ESTADO_CREDENCIALES_INVALIDAS) {
      setCredenciales((actuales) => ({ ...actuales, clave: '' }))
    }
  }

  return {
    credenciales,
    claveVisible,
    enviando,
    errorGeneral,
    erroresCampos,
    onCambiarUsername: (username) => cambiarCampo('username', username),
    onCambiarClave: (clave) => cambiarCampo('clave', clave),
    onAlternarVisibilidadClave: () => setClaveVisible(!claveVisible),
    onIniciarSesion: enviarCredenciales,
  }
}
