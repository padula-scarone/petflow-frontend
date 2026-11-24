import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ContenedorDialogoDeudor } from '@/features/ventas/deudores/components/contenedor-dialogo-deudor'
import { FichaDeudor } from '@/features/ventas/deudores/components/ficha-deudor'
import { construirRutaCobroDeudor, RUTA_DEUDORES } from '@/features/ventas/deudores/config/rutas-deudores'
import { editarDeudorApiEjemplo } from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import { useContextoFichaDeudor } from '@/features/ventas/deudores/hooks/use-contexto-ficha-deudor'
import { obtenerTelefonoLocal } from '@/features/ventas/deudores/utils/validar-datos-deudor'

/** Ruta de Ventas > Deudores > un deudor: conecta la cuenta y la seleccion con la ficha. */
export function PaginaFichaDeudor() {
  const { idDeudor, ficha, seleccion } = useContextoFichaDeudor()
  const navegar = useNavigate()
  // Solo estado de presentacion: si el dialogo de edicion esta abierto
  const [edicionAbierta, setEdicionAbierta] = useState(false)
  const { estadoFicha } = ficha

  return (
    <>
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
          guardar={(datos) => editarDeudorApiEjemplo(idDeudor, datos)}
          // Al guardar, el almacen avisa y la ficha se vuelve a pedir sola
          alGuardar={() => setEdicionAbierta(false)}
          onCerrar={() => setEdicionAbierta(false)}
        />
      )}
    </>
  )
}
