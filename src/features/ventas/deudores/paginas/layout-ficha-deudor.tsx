import { useState } from 'react'
import { Navigate, Outlet, useLocation, useParams, useSearchParams } from 'react-router'
import {
  leerOrigenFicha,
  type OrigenFicha,
  PARAMETRO_FIADO_RESALTADO,
  RUTA_DEUDORES,
} from '@/features/ventas/deudores/config/rutas-deudores'
import type { ContextoFichaDeudor } from '@/features/ventas/deudores/hooks/use-contexto-ficha-deudor'
import { useFichaDeudor } from '@/features/ventas/deudores/hooks/use-ficha-deudor'
import { useSeleccionFiados } from '@/features/ventas/deudores/hooks/use-seleccion-fiados'

/** Convierte un parametro de la ruta en un id; null si no es un entero positivo. */
function leerIdPositivo(texto: string | null) {
  const numero = Number(texto)
  return texto !== null && Number.isInteger(numero) && numero > 0 ? numero : null
}

/** Props del cuerpo del layout, ya con el id validado. */
interface CuerpoFichaDeudorProps {
  idDeudor: number
  idFiadoInicial: number | null
  origen: OrigenFicha
}

/** Dueno de la cuenta del deudor y de los fiados tildados; los comparte con la ficha y con el cobro. */
function CuerpoFichaDeudor({ idDeudor, idFiadoInicial, origen }: CuerpoFichaDeudorProps) {
  const ficha = useFichaDeudor(idDeudor)
  const fiados = ficha.estadoFicha.tipo === 'listo' ? ficha.estadoFicha.fiados : []
  const seleccion = useSeleccionFiados(fiados, idFiadoInicial)
  const contexto: ContextoFichaDeudor = { idDeudor, idFiadoInicial, origen, ficha, seleccion }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1">
      <Outlet context={contexto} />
    </div>
  )
}

/**
 * Ruta padre de la ficha de un deudor, como LayoutRegistrarVenta: lo tildado no se pierde entre la ficha y la
 * pantalla de cobro.
 */
export function LayoutFichaDeudor() {
  const { idDeudor: parametroIdDeudor } = useParams()
  const [parametrosBusqueda] = useSearchParams()
  const { state: estadoUbicacion } = useLocation()

  const idDeudor = leerIdPositivo(parametroIdDeudor ?? null)
  // Se leen una sola vez: el fiado que llega desde "Ver deuda" arranca tildado, y despues manda lo que haga el vendedor
  const [idFiadoInicial] = useState(() => leerIdPositivo(parametrosBusqueda.get(PARAMETRO_FIADO_RESALTADO)))

  // Tambien una sola vez: al volver del cobro a la ficha (con replace) el estado de la ubicacion ya no esta, pero el origen sigue valiendo
  const [origen] = useState(() => leerOrigenFicha(estadoUbicacion))

  // Un id que no es un numero no puede existir: se vuelve a la lista
  if (idDeudor === null) return <Navigate to={RUTA_DEUDORES} replace />

  // Otra key por deudor: pasar de una ficha a otra arranca de cero
  return <CuerpoFichaDeudor key={idDeudor} idDeudor={idDeudor} idFiadoInicial={idFiadoInicial} origen={origen} />
}
