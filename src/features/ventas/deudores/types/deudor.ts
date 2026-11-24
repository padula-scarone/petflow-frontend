/** Deudor tal como lo devuelve el back (POST y PUT /api/deudores). */
export interface Deudor {
  idDeudor: number
  nombreCompleto: string
  /** Solo digitos, de 11 a 15, con codigo de pais (el back lo normaliza). Con el 549 son 13. */
  telefono: string
  /** 7 u 8 digitos, sin puntos. */
  dni: string
}

/** Lo que escribe el vendedor al dar de alta o editar un deudor. */
export interface DatosDeudor {
  nombreCompleto: string
  telefono: string
  dni: string
}

/** Campo del formulario de un deudor. */
export type CampoDeudor = keyof DatosDeudor

/** Mensaje de error por campo. Nunca incluye el valor tipeado: el DNI y el telefono no viajan en mensajes (RNF-VENTAS-03). */
export type ErroresDatosDeudor = Partial<Record<CampoDeudor, string>>

/** Resultado de guardar un deudor (alta o edicion). */
export type EstadoGuardadoDeudor =
  | { fase: 'inactivo' }
  | { fase: 'guardando' }
  | { fase: 'guardado'; deudor: Deudor }
  /** 409 DNI_DUPLICADO: el back informa a quien pertenece ese DNI. */
  | { fase: 'dni-duplicado'; deudorExistente: Deudor }
  /** 404 al editar: el deudor ya no existe. */
  | { fase: 'no-encontrado' }
  /** 400 o falla de red. Si el back marco campos concretos, `erroresCampos` los trae con texto propio. */
  | { fase: 'error'; mensaje: string; erroresCampos?: ErroresDatosDeudor }

/** Lo que devuelve una busqueda de deudores ya terminada. */
export type ResultadoBusquedaDeudor =
  | { fase: 'sin-resultados'; textoBuscado: string }
  | { fase: 'error'; mensaje: string }
  | { fase: 'con-resultados'; deudores: Deudor[] }

/** Busqueda de un deudor por nombre o DNI, en Registrar Venta. */
export type EstadoBusquedaDeudor = { fase: 'inactivo' } | { fase: 'cargando' } | ResultadoBusquedaDeudor
