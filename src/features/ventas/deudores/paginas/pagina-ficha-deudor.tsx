import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { ContenedorDialogoDeudor } from '@/features/ventas/deudores/components/contenedor-dialogo-deudor'
import { FichaDeudor } from '@/features/ventas/deudores/components/ficha-deudor'
import { PARAMETRO_FIADO_RESALTADO, RUTA_DEUDORES } from '@/features/ventas/deudores/config/rutas-deudores'
import { editarDeudorApiEjemplo } from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import { ContenedorCobroDeudor } from '@/features/ventas/deudores/paginas/contenedor-cobro-deudor'
import { useFichaDeudorEjemplo } from '@/features/ventas/deudores/hooks/use-ficha-deudor-ejemplo'
import { useSeleccionFiados } from '@/features/ventas/deudores/hooks/use-seleccion-fiados'
import type { FiadoOrigenHistorial } from '@/features/ventas/deudores/types/cuenta-corriente'
import { leerFiadoOrigenHistorial } from '@/features/ventas/deudores/utils/leer-fiado-origen-historial'

/** Convierte un parametro de la ruta en un id; null si no es un entero positivo. */
function leerIdPositivo(texto: string | null) {
  const numero = Number(texto)
  return texto !== null && Number.isInteger(numero) && numero > 0 ? numero : null
}

/** Ruta de Ventas > Deudores > un deudor: conecta los hooks con la ficha. */
export function PaginaFichaDeudor() {
  const { idDeudor: parametroIdDeudor } = useParams()
  const [parametrosBusqueda] = useSearchParams()
  const ubicacion = useLocation()
  const navegar = useNavigate()

  const idDeudor = leerIdPositivo(parametroIdDeudor ?? null)
  // Se leen una sola vez: el fiado que llega desde "Ver deuda" arranca tildado, y despues manda lo que haga el vendedor
  const [idFiadoInicial] = useState(() => leerIdPositivo(parametrosBusqueda.get(PARAMETRO_FIADO_RESALTADO)))
  const [fiadoOrigen] = useState<FiadoOrigenHistorial | null>(() => leerFiadoOrigenHistorial(ubicacion.state))

  // Un id que no es un numero no puede existir: se vuelve a la lista
  if (idDeudor === null) return <Navigate to={RUTA_DEUDORES} replace />

  return (
    <ContenidoFichaDeudor
      key={idDeudor}
      idDeudor={idDeudor}
      idFiadoInicial={idFiadoInicial}
      fiadoOrigen={fiadoOrigen}
      onVolver={() => navegar(RUTA_DEUDORES)}
    />
  )
}

/** Props del contenido de la ficha, ya con el id validado. */
interface ContenidoFichaDeudorProps {
  idDeudor: number
  idFiadoInicial: number | null
  fiadoOrigen: FiadoOrigenHistorial | null
  onVolver: () => void
}

/** La ficha de un deudor ya identificado: arma sus hooks y el dialogo de edicion. */
function ContenidoFichaDeudor({ idDeudor, idFiadoInicial, fiadoOrigen, onVolver }: ContenidoFichaDeudorProps) {
  const ficha = useFichaDeudorEjemplo(idDeudor, fiadoOrigen)
  const fiados = ficha.estadoFicha.tipo === 'listo' ? ficha.estadoFicha.fiados : []
  const seleccion = useSeleccionFiados(fiados, idFiadoInicial)
  // Solo estado de presentacion: si estan abiertos el dialogo de edicion o el de cobro
  const [edicionAbierta, setEdicionAbierta] = useState(false)
  const [cobroAbierto, setCobroAbierto] = useState(false)

  return (
    <>
      <FichaDeudor
        estadoFicha={ficha.estadoFicha}
        filasFiados={seleccion.filas}
        resumenSeleccion={seleccion.resumen}
        onVolver={onVolver}
        onReintentar={ficha.reintentar}
        onEditarDeudor={() => setEdicionAbierta(true)}
        onAlternarFiado={seleccion.alternarFiado}
        onCambiarMontoFiado={seleccion.cambiarMontoFiado}
        onSeleccionarTodos={seleccion.seleccionarTodos}
        onCobrarFiados={() => setCobroAbierto(true)}
      />
      {cobroAbierto && ficha.estadoFicha.tipo === 'listo' && (
        <ContenedorCobroDeudor
          deudor={ficha.estadoFicha.deudor}
          filasACobrar={seleccion.filas.filter((fila) => fila.seleccionado)}
          // Despues de cobrar, la cuenta cambia (el almacen avisa y la ficha se vuelve a pedir): lo tildado ya no sirve
          alCobrar={seleccion.limpiar}
          onCerrar={() => setCobroAbierto(false)}
        />
      )}
      {edicionAbierta && ficha.estadoFicha.tipo === 'listo' && (
        <ContenedorDialogoDeudor
          modo="edicion"
          valoresIniciales={{
            nombreCompleto: ficha.estadoFicha.deudor.nombreCompleto,
            telefono: ficha.estadoFicha.deudor.telefono,
            dni: ficha.estadoFicha.deudor.dni,
          }}
          guardar={(datos) => editarDeudorApiEjemplo(idDeudor, datos)}
          // Al guardar, el almacen avisa y la ficha se vuelve a pedir sola
          alGuardar={() => setEdicionAbierta(false)}
          onCerrar={() => setEdicionAbierta(false)}
        />
      )}
    </>
  )
}
