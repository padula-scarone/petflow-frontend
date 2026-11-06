import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge necesita conocer los tokens propios (index.css) para resolver conflictos
const combinarClasesTailwind = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'fondo-pagina',
        'fondo-tarjeta',
        'fondo-desplegable',
        'fondo-suave',
        'fondo-secundario',
        'fondo-hover',
        'fondo-seleccion',
        'texto-principal',
        'texto-tarjeta',
        'texto-desplegable',
        'texto-suave',
        'texto-sobre-secundario',
        'texto-sobre-primario',
        'primario',
        'peligro',
        'exito',
        'exito-hover',
        'texto-sobre-exito',
        'foco',
        'borde',
        'borde-campo',
      ],
      radius: ['chico', 'mediano', 'grande', 'extragrande'],
    },
  },
})

/** Combina clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...entradas: ClassValue[]) {
  return combinarClasesTailwind(clsx(entradas))
}
