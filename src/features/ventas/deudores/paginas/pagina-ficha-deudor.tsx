import { Info } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContenedorDialogoDeudor } from '@/features/ventas/deudores/components/contenedor-dialogo-deudor'
import { FichaDeudor } from '@/features/ventas/deudores/components/ficha-deudor'
import { construirRutaCobroDeudor, RUTA_DEUDORES } from '@/features/ventas/deudores/config/rutas-deudores'
import { useContextoFichaDeudor } from '@/features/ventas/deudores/hooks/use-contexto-ficha-deudor'
import { useGuardarDeudor } from '@/features/ventas/deudores/hooks/use-guardar-deudor'
import { obtenerTelefonoLocal } from '@/features/ventas/deudores/utils/validar-datos-deudor'

/** Ruta de Ventas > Deudores > un deudor: conecta la cuenta y la seleccion con la ficha. */
export function PaginaFichaDeudor() {
  const { idDeudor, idFiadoInicial, ficha, seleccion } = useContextoFichaDeudor()
  const navegar = useNavigate()
  const { editar } = useGuardarDeudor()
  // Solo estado de presentacion: si el dialogo de edicion esta abierto
  const [edicionAbierta, setEdicionAbierta] = useState(false)
  const { estadoFicha } = ficha
  // "Ver deuda" llego con un fiado que ya no esta pendiente (se cobro por completo): se avisa sin bloquear la ficha
  const fiadoInicialYaNoPendiente =
    idFiadoInicial !== null &&
    estadoFicha.tipo === 'listo' &&
    !estadoFicha.fiados.some((fiado) => fiado.idVenta === idFiadoInicial)

  return (
    <>
      {fiadoInicialYaNoPendiente && (
        <Alert role="status" className="mb-bloque">
          <Info aria-hidden="true" />
          <AlertDescription>Ese fiado ya no está pendiente: se cobró por completo.</AlertDescription>
        </Alert>
      )}
      <FichaDeudor
        estadoFicha={estadoFicha}
        filasFiados={seleccion.filas}
        resumenSeleccion={seleccion.resumen}
        onVolver={() => void navegar(RUTA_DEUDORES)}
        onReintentar={ficha.reintentar}
        onEditarDeudor={() => setEdicionAbierta(true)}
        onAlternarFiado={seleccion.alternarFiado}
        onCambiarMontoFiado={seleccion.cambiarMontoFiado}
        onSeleccionarTodos={seleccion.seleccionarTodos}
        onCobrarFiados={() => void navegar(construirRutaCobroDeudor(idDeudor))}
      />
      {edicionAbierta && estadoFicha.tipo === 'listo' && (
        <ContenedorDialogoDeudor
          modo="edicion"
          valoresIniciales={{
            nombreCompleto: estadoFicha.deudor.nombreCompleto,
            // El formulario pide los 10 digitos; el 549 se agrega solo al guardar
            telefono: obtenerTelefonoLocal(estadoFicha.deudor.telefono),
            dni: estadoFicha.deudor.dni,
          }}
          guardar={(datos) => editar(idDeudor, datos)}
          // Al guardar, la verdad la tiene el servidor: se vuelve a pedir la ficha sin mostrar "cargando"
          alGuardar={() => {
            setEdicionAbierta(false)
            ficha.refrescar()
          }}
          onCerrar={() => setEdicionAbierta(false)}
        />
      )}
    </>
  )
}
