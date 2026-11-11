import { useState } from 'react'
import type { ModuloMenu } from '@/features/navegacion/types/menu'

/** Maneja el modulo y la seccion activos del menu doble. */
export function useMenuDoble(modulos: ModuloMenu[]) {
  const [idModuloActivo, setIdModuloActivo] = useState(modulos[0]?.idModulo ?? '')
  const [idSeccionActiva, setIdSeccionActiva] = useState(
    modulos[0]?.secciones[0]?.idSeccion ?? '',
  )

  // Al cambiar de modulo se abre su primera seccion
  const seleccionarModulo = (idModulo: string) => {
    const moduloElegido = modulos.find((modulo) => modulo.idModulo === idModulo)
    if (!moduloElegido) return
    setIdModuloActivo(idModulo)
    setIdSeccionActiva(moduloElegido.secciones[0]?.idSeccion ?? '')
  }

  const seleccionarSeccion = (idSeccion: string) => setIdSeccionActiva(idSeccion)

  return { idModuloActivo, idSeccionActiva, seleccionarModulo, seleccionarSeccion }
}
