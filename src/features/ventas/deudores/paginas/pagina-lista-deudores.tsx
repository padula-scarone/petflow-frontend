import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ContenedorDialogoDeudor } from '@/features/ventas/deudores/components/contenedor-dialogo-deudor'
import { Deudores } from '@/features/ventas/deudores/components/deudores'
import { construirRutaFichaDeudor } from '@/features/ventas/deudores/config/rutas-deudores'
import { crearDeudorApiEjemplo } from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import { DATOS_DEUDOR_VACIOS } from '@/features/ventas/deudores/hooks/use-formulario-deudor'
import { useListaDeudoresEjemplo } from '@/features/ventas/deudores/hooks/use-lista-deudores-ejemplo'

/** Ruta de Ventas > Deudores: conecta el hook con la vista. */
export function PaginaListaDeudores() {
  const lista = useListaDeudoresEjemplo()
  const navegar = useNavigate()
  // Solo estado de presentacion: si el dialogo de nuevo deudor esta abierto
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  const abrirFicha = (idDeudor: number) => navegar(construirRutaFichaDeudor(idDeudor))

  return (
    <>
      <Deudores
        filtros={lista.filtros}
        estadoLista={lista.estadoLista}
        onCambiarBusqueda={lista.cambiarBusqueda}
        onCambiarIncluirSinDeuda={lista.cambiarIncluirSinDeuda}
        onCambiarPagina={lista.cambiarPagina}
        onAbrirFicha={abrirFicha}
        onNuevoDeudor={() => setDialogoAbierto(true)}
        onReintentar={lista.reintentar}
      />
      {dialogoAbierto && (
        <ContenedorDialogoDeudor
          modo="alta"
          valoresIniciales={DATOS_DEUDOR_VACIOS}
          guardar={crearDeudorApiEjemplo}
          // Un deudor nuevo todavia no debe nada y la lista oculta a quien no debe: se abre su ficha para que se vea
          alGuardar={(deudor) => abrirFicha(deudor.idDeudor)}
          // En el alta de la lista un DNI repetido deja el aviso en el dialogo, con el boton para ver esa ficha
          onVerDeudorExistente={(deudor) => abrirFicha(deudor.idDeudor)}
          onCerrar={() => setDialogoAbierto(false)}
        />
      )}
    </>
  )
}
