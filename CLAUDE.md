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
- **Archivos y Carpetas:** `kebab-case` (ej. `/devoluciones`, `use-registrar-venta.ts`).
- **Componentes React e Interfaces:** `PascalCase` (ej. `<GrillaVentas />`, `interface Venta`).
- **Variables, Funciones y Hooks:** `camelCase` (ej. `montoTotal`, `calcularVuelto()`, `useRegistrarVenta()`).
- **Comentarios y Documentación:**
  - Archivos extensos deben usar separadores lógicos (ej. `// --- ESTADOS ---`).
  - Los comentarios en línea explican el *qué* y el *por qué*, nunca lo obvio.
  - Documentar tipos e interfaces obligatoriamente con estándar JSDoc (`/** ... */`).
- **Caracteres Permitidos (ASCII):** Prohibido usar tildes, diéresis o la letra "ñ" en el código fuente (nombres de variables, funciones, archivos, bases de datos o ramas). Escribe en español limitándote al alfabeto inglés. Para palabras con "ñ", utiliza sinónimos semánticos en lugar de reemplazarla por "n" (ej. prohibido usar `año` o `anio`, usa `periodo` o `ejercicio`; en lugar de `tamano`, usa `dimension` o `medida`).

# Sistema de Tamaños (Diseño)
- **Fuente única:** los tokens viven en `src/index.css`, dentro de `@theme`. Cada rol tiene un valor para celular y otro para PC; el cambio ocurre en `lg` (1024 px), el mismo punto donde el menú pasa a barra lateral. Los componentes usan el **nombre del rol** y no repiten el cambio de tamaño con prefijos responsive.
- **Espaciado** (sirve en cualquier clase de espacio: `p-contorno`, `gap-bloque`, `h-control`, `-mx-contorno`):

  | Rol | Celular | PC | Uso |
  |---|---|---|---|
  | `contorno` | 12 | 24 | Relleno de todo contenedor: página, tarjeta, barra, diálogo |
  | `bloque` | 16 | 24 | Separación entre bloques hermanos: tarjetas, secciones |
  | `interno` | 8 | 12 | Separación dentro de un grupo: etiqueta y control, filas, botones contiguos |
  | `control` | 40 | 40 | Alto de todo lo que se toca o se escribe: botón, pestaña, toggle, campo |
  | `accion` | 48 | 48 | Alto de la acción principal de la pantalla (COBRAR, CONFIRMAR) |

- **Tipografía** (clases `text-<rol>`; el interlineado viene incluido):

  | Rol | Celular | PC | Uso |
  |---|---|---|---|
  | `cifra-principal` | 24 | 30 | Total que se cobra |
  | `titulo-pagina` | 20 | 24 | Título de una pantalla |
  | `cifra-secundaria` | 18 | 20 | Totales de tarjetas y pies, vuelto, saldo, subtotal |
  | `titulo-seccion` | 16 | 18 | Título de tarjeta, sección o diálogo |
  | `accion` | 16 | 18 | Texto de la acción principal |
  | `campo` | 16 | 14 | Texto dentro de un campo (en celular 16 px para que Safari no haga zoom) |
  | `cuerpo` | 14 | 14 | Contenido, etiquetas, botones, pestañas, valores de listas |
  | `auxiliar` | 12 | 12 | Ayudas, metadatos, contadores |
| `logo` | 24 | 24 | Solo la marca "PetFlow" (barras y acceso) |
| `menu` | 10 | 10 | Solo las etiquetas de la barra inferior del celular |
| `decorativo` | 60 | 60 | Solo el "404" |

- **Pesos:** solo tres. `font-normal` para texto corrido, `font-medium` para etiquetas y énfasis leve, `font-bold` para títulos y cifras. No usar `font-semibold`.
- **Reglas:**
  - No usar números sueltos (`p-4`, `gap-3`, `h-11`, `text-sm`) para lo que ya tiene rol. Se usa el rol.
  - La escala de texto de Tailwind (`text-xs`, `text-sm`, `text-base`, `text-lg`...) está desactivada: usarla no genera ningún estilo. Solo existen los roles de la tabla.
  - Los espacios de hasta 8 px dentro de un mismo componente (icono y texto) usan la escala numérica de Tailwind: ahí el valor no debe crecer en PC.
  - Al agregar un token nuevo, sumarlo también a `src/lib/utils.ts` (configuración de `tailwind-merge`); si no, `cn()` no resuelve los conflictos con las clases nuevas.
  - Los componentes base de `src/components/ui/` ya traen estos tamaños por defecto: no hace falta repetirlos en cada uso.
  - Los **tamaños** (letra, espacios, alturas) cambian en `lg`. El **reordenamiento de columnas** de una pantalla (por ejemplo pasar a dos columnas) depende del ancho del contenido, no del de la ventana: la barra lateral ocupa 240 px desde `lg`, así que a 1024 px el contenido mide unos 736 px. Por eso esos cambios de diseño usan `xl:` y no `lg:`.

# Sombras y Bordes (Diseño)
- **Una sombra significa que algo flota sobre la página.** Todo lo que está apoyado en ella va plano, sin sombra: tarjetas, campos, selectores, toggles y todos los botones, incluida la acción principal. Se distinguen por borde y color.
- **Las únicas sombras** (en `src/index.css`):

  | Clase | Uso |
  |---|---|
  | `shadow-flotante` | Lo que se despliega sobre el contenido: menús, sugerencias del buscador, calendario, lista del selector, popover |
  | `shadow-superpuesto` | Lo que tapa la pantalla: diálogos y hoja de filtros |
  | `shadow-perilla` | Solo la perilla del interruptor, que es parte de su dibujo |

- La escala de Tailwind (`shadow-sm`, `shadow-md`...) está desactivada: usarla no genera ningún estilo. Un componente nuevo no lleva sombra salvo que flote o tape.
- **Bordes:** los controles (botones de contorno, campos, pestañas, toggles, selectores, pasos de cantidad) usan `border-borde-campo`; los contenedores (tarjetas, paneles, avisos, listas desplegables) usan `border`, que toma el color por defecto, más oscuro.

# Control de Versiones (Git)
- **Ramas:** `tipo/id-nombre-tarea` (ej. `feat/1-alta-venta`, `fix/15-calculo-total`).
- **Commits (Conventional Commits):** `tipo(alcance): accion en imperativo y minuscula`.
  - *Tipos:* `feat`, `fix`, `style`, `refactor`, `docs`, `chore`.
  - *Alcances permitidos:* `ventas`, `caja`, `auth`, `ui`, `api`, `db`.

