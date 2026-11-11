import { createContext } from 'react'
import type { ContextoSesion } from '@/features/auth/types/sesion'

/** Contexto de la sesion. Vive en un archivo aparte del proveedor por la regla de react-refresh. */
export const ContextoDeSesion = createContext<ContextoSesion | null>(null)
