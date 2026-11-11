import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Props de la imagen de un producto; el tamano se define desde afuera con className. */
interface ImagenProductoProps {
  /** URL de la imagen; si falta, se muestra un marcador de posicion. */
  urlImagen?: string
  className?: string
}

export function ImagenProducto({ urlImagen, className }: ImagenProductoProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-mediano bg-fondo-suave text-texto-suave',
        className,
      )}
    >
      {urlImagen ? (
        // loading lazy: no descarga las imagenes que quedan fuera de la zona visible
        <img
          src={urlImagen}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <ImageIcon aria-hidden="true" className="size-6" />
      )}
    </div>
  )
}
