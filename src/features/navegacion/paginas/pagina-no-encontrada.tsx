import { useNavigate } from 'react-router'
import { NoEncontrada } from '@/features/navegacion/components/no-encontrada'
import { RUTA_RAIZ } from '@/features/navegacion/config/rutas'

export function PaginaNoEncontrada() {
  const navegar = useNavigate()
  return <NoEncontrada onVolverAlInicio={() => navegar(RUTA_RAIZ, { replace: true })} />
}
