import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { enrutador } from '@/app/enrutador'
import { ProveedorSesion } from '@/features/auth/components/proveedor-sesion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* La sesion envuelve al router: el guard y las pantallas la leen con useSesion */}
    <ProveedorSesion>
      <RouterProvider router={enrutador} />
    </ProveedorSesion>
  </StrictMode>,
)
