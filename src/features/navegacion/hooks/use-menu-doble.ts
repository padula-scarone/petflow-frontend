import { useLocation, useNavigate } from 'react-router'
import type { ModuloMenu } from '@/features/navegacion/types/menu'
import { construirRutaSeccion } from '@/features/navegacion/utils/construir-ruta-seccion'

/** Deriva el modulo y la seccion activos de la URL, y navega al seleccionarlos. */
export function useMenuDoble(modulos: ModuloMenu[]) {
  const { pathname } = useLocation()
  const navegar = useNavigate()

  // --- ESTADO DERIVADO DE LA URL ---
  // El router no distingue mayusculas, por eso se compara en minusculas
  const [segmentoModulo = '', segmentoSeccion = ''] = pathname
    .toLowerCase()
    .split('/')
    .filter((segmento) => segmento !== '')
  const moduloActivo = modulos.find((modulo) => modulo.idModulo === segmentoModulo)
  const idModuloActivo = moduloActivo?.idModulo ?? ''
  // Los modulos sin subrutas no traen seccion en la URL: se marca su primera seccion
  const idSeccionActiva =
    moduloActivo?.secciones.find((seccion) => seccion.idSeccion === segmentoSeccion)?.idSeccion ??
    moduloActivo?.secciones[0]?.idSeccion ??
    ''

  // --- ACCIONES ---
  // /<modulo> abre su primera seccion: el router redirige los modulos con subrutas
  const seleccionarModulo = (idModulo: string) => {
    if (!modulos.some((modulo) => modulo.idModulo === idModulo)) return
    navegar(`/${idModulo}`)
  }

  const seleccionarSeccion = (idSeccion: string) => {
    if (idSeccion === idSeccionActiva) return
    navegar(construirRutaSeccion(idModuloActivo, idSeccion))
  }

  return { idModuloActivo, idSeccionActiva, seleccionarModulo, seleccionarSeccion }
}
