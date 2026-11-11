# Referencia de Contexto Global
Para consultar el modelo de datos relacional, los Casos de Uso Base (CUB) y las reglas de negocio completas, debes leer obligatoriamente: `../petflow-workspace/SSOT.md`.

# Stack Tecnológico
- **Base:** React + Vite, TypeScript.
- **Estilos y Maquetado:** Tailwind CSS + shadcn//ui (maquetación en archivo único, sin hojas de estilo externas).
- **Enrutamiento:** React Router (rutas protegidas por roles de usuario).
- **Integraciones Nativas:** Uso de URL Schemes (`wa.me` / `mailto:`) para envíos mediante Deep Links.

# Paradigmas y Arquitectura
- **Screaming Architecture (Feature-Sliced):** El código se agrupa por módulos de negocio en la carpeta `/features/` (ej. `/features/ventas/`), conteniendo sus propios componentes y lógica.
- **Paradigma Funcional:** Prohibidas las mutaciones y las clases. Uso obligatorio de inmutabilidad (ej. `setEstado([...viejo, nuevo])`).
- **Segregación Vista/Lógica:**
  - *Vistas:* Componentes presentacionales "tontos" enfocados 100% en renderizar HTML/Tailwind.
  - *Lógica:* Todo manejo de estado, peticiones HTTP y reglas de negocio debe extraerse a **Custom Hooks**.

# Estándares y Convenciones
- **Regla de Oro:** CERO abreviaciones. Las variables deben ser explícitas en español (ej. `cantidadProducto`, no `cantProd`).
- **Archivos y Carpetas:** `kebab-case` (ej. `/cambios-mercaderia`, `use-registrar-venta.ts`).
- **Componentes React e Interfaces:** `PascalCase` (ej. `<GrillaVentas />`, `interface Venta`).
- **Variables, Funciones y Hooks:** `camelCase` (ej. `montoTotal`, `calcularVuelto()`, `useRegistrarVenta()`).
- **Comentarios y Documentación:**
  - Archivos extensos deben usar separadores lógicos (ej. `// --- ESTADOS ---`).
  - Los comentarios en línea explican el *qué* y el *por qué*, nunca lo obvio.
  - Documentar tipos e interfaces obligatoriamente con estándar JSDoc (`/** ... */`).
- **Caracteres Permitidos (ASCII):** Prohibido usar tildes, diéresis o la letra "ñ" en el código fuente (nombres de variables, funciones, archivos, bases de datos o ramas). Escribe en español limitándote al alfabeto inglés. Para palabras con "ñ", utiliza sinónimos semánticos en lugar de reemplazarla por "n" (ej. prohibido usar `año` o `anio`, usa `periodo` o `ejercicio`; en lugar de `tamano`, usa `dimension` o `medida`).

# Control de Versiones (Git)
- **Ramas:** `tipo/id-nombre-tarea` (ej. `feat/1-alta-venta`, `fix/15-calculo-total`).
- **Commits (Conventional Commits):** `tipo(alcance): accion en imperativo y minuscula`.
  - *Tipos:* `feat`, `fix`, `style`, `refactor`, `docs`, `chore`.
  - *Alcances permitidos:* `ventas`, `caja`, `auth`, `ui`, `api`, `db`.

