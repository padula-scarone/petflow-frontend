import type { DatoEnvio } from '@/features/ventas/utils/listar-datos-envio'

/** Props de las filas con los datos del envio. */
interface FilasDatosEnvioProps {
  /** Ya filtrados con `listarDatosEnvio`: solo los que corresponde mostrar. */
  datos: DatoEnvio[]
}

/**
 * Una fila de lista de definiciones por cada dato del envio, para usar dentro de un `<dl>` de dos columnas. Ocupan
 * todo el ancho porque una direccion es larga y se parte en lineas. Sin datos no dibuja nada.
 */
export function FilasDatosEnvio({ datos }: FilasDatosEnvioProps) {
  return (
    <>
      {datos.map((dato) => (
        <div key={dato.etiqueta} className="col-span-2 min-w-0">
          <dt className="text-texto-suave">{dato.etiqueta}</dt>
          <dd className="break-words font-medium">{dato.valor}</dd>
        </div>
      ))}
    </>
  )
}
