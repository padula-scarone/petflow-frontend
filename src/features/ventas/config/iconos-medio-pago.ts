import { ArrowLeftRight, Banknote, CreditCard, Wallet, type LucideIcon } from 'lucide-react'
import type { TipoMedioPagoApi } from '@/features/ventas/types/api-ventas'

/** Icono de cada tipo de medio de pago; el back no manda icono, se elige por tipo. */
export const ICONOS_MEDIO_PAGO: Record<TipoMedioPagoApi, LucideIcon> = {
  EFECTIVO: Banknote,
  TRANSFERENCIA: ArrowLeftRight,
  TARJETA: CreditCard,
  BILLETERA_VIRTUAL: Wallet,
}
