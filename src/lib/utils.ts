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
      shadow: ['flotante', 'superpuesto', 'perilla'],
      // Sistema de tamanos: sin esto p-contorno o text-cuerpo se confundirian con otros valores y no se resolverian
      spacing: ['contorno', 'bloque', 'interno', 'control', 'accion'],
      text: [
        'cifra-principal',
        'titulo-pagina',
        'cifra-secundaria',
        'titulo-seccion',
        'accion',
        'campo',
        'cuerpo',
        'auxiliar',
        'logo',
        'menu',
        'decorativo',
      ],
    },
  },
})

/** Combina clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...entradas: ClassValue[]) {
  return combinarClasesTailwind(clsx(entradas))
}
