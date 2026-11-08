import { useState } from 'react'
import type {
  CampoInicioSesion,
  CredencialesInicioSesion,
  ErroresCamposInicioSesion,
  IniciarSesionProps,
} from '@/features/auth/types/inicio-sesion'

// --- DATOS DE EJEMPLO ---
// Hook temporal para probar la vista sin back: se reemplaza por el hook real de la accion Iniciar sesion.
// Con la clave "demo" el inicio es exitoso; con cualquier otra, responde como el 401 del back.
const CLAVE_EJEMPLO = 'demo'
const MILISEGUNDOS_ESPERA_EJEMPLO = 1500
const MENSAJE_CREDENCIALES_INVALIDAS = 'Credenciales inválidas'

/** Espera simulada de la red, para ver el estado "enviando". */
const esperar = (milisegundos: number) =>
  new Promise<void>((resolver) => setTimeout(resolver, milisegundos))

/** Mismas reglas que iniciarSesionSchema del back: username recortado y no vacio, clave no vacia. */
function validarCredenciales(credenciales: CredencialesInicioSesion): ErroresCamposInicioSesion {
  return {
    ...(credenciales.username.trim() === '' && { username: 'Ingresá tu usuario' }),
    ...(credenciales.clave === '' && { clave: 'Ingresá tu contraseña' }),
  }
}

export function useIniciarSesionEjemplo(
  onSesionIniciada: () => void,
): IniciarSesionProps {
  // --- ESTADOS ---
  const [credenciales, setCredenciales] = useState<CredencialesInicioSesion>({
    username: '',
    clave: '',
  })
  const [claveVisible, setClaveVisible] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [erroresCampos, setErroresCampos] = useState<ErroresCamposInicioSesion>({})

  // --- ACCIONES ---
  // Al editar un campo se limpia su error y el general, que ya no describen lo que se ve
  const cambiarCampo = (campo: CampoInicioSesion, valor: string) => {
    setCredenciales({ ...credenciales, [campo]: valor })
    setErroresCampos({ ...erroresCampos, [campo]: undefined })
    setErrorGeneral(null)
  }

  const iniciarSesion = async () => {
    // Segunda barrera contra el doble tap, ademas del boton deshabilitado
    if (enviando) return

    const errores = validarCredenciales(credenciales)
    setErroresCampos(errores)
    setErrorGeneral(null)
    if (Object.keys(errores).length > 0) return

    setEnviando(true)
    await esperar(MILISEGUNDOS_ESPERA_EJEMPLO)
    setEnviando(false)

    if (credenciales.clave === CLAVE_EJEMPLO) {
      onSesionIniciada()
      return
    }
    // Como el 401 del back: no dice si fallo el usuario o la clave. Se conserva el usuario y se vacia la clave
    setErrorGeneral(MENSAJE_CREDENCIALES_INVALIDAS)
    setCredenciales({ ...credenciales, clave: '' })
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
    onIniciarSesion: iniciarSesion,
  }
}
