/** Estado de carga de un recurso remoto (catalogo de productos, medios de pago). */
export interface EstadoCargaRecurso {
  fase: 'cargando' | 'listo' | 'error'
  /** Texto para la vista; solo existe en la fase 'error'. */
  mensajeError: string | null
}
