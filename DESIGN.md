# Design

## Idea

Lo que ve el cliente / lo que pasa detrás. Toda la página enseña la máquina: la demo del hero (chat + bitácora sincronizados), el lienzo del flujo, los pasos de cada sistema y el diagnóstico de ejemplo.

La demo del hero tiene un guion por giro (`SCENARIOS` en `src/components/LiveDemo.tsx`): se escriben los pasos y `buildScript` calcula los tiempos. Rota sola hasta que el visitante elige un giro, y la hora del titular ("Son las 23:47") sigue al primer mensaje del guion, así que todas las conversaciones pasan después del cierre.

## Recorrido (octubre 2026)

Hero → cinta de la bitácora → calculadora (cuántas horas recuperas) → sistemas por giro (incluye escuela privada) → **demos por giro** → **el agente en vivo** → contacto (el formulario, justo debajo del agente) → lo que hay detrás → así trabajamos → preguntas → footer con la marca gigante.

- **Menú en cápsula** (`Navbar.tsx`): flota centrado, se esconde al bajar y vuelve al subir (o con el foco dentro). Lleva la hora real de León (`useLeonTime`). En móvil abre un menú a pantalla completa con enlaces grandes.
- **Hero**: el titular dice qué hace Cyclo: "Automatizamos la atención de tu negocio por WhatsApp." (con "por WhatsApp." en `teal-text`), revelado palabra por palabra (`.display`, tope 4.6rem; tres renglones en escritorio). Es concreto a propósito: nunca el genérico "Automatiza tu negocio con IA". A la derecha, la ubicación con la hora de León y un acceso al agente real. Debajo, una sola frase de apoyo y la demo.
- **Calculadora** (`CostCalculator.tsx`, 2026-10-18): un solo dato (mensajes al día) y la diferencia al instante en barras: horas de tu equipo sin y con Cyclo, mensajes que esperan horas, y "Recuperas N h al mes". Los supuestos van escritos abajo. Se quitó "Una noche cualquiera en León" (sección fija de 300vh): Fidel sentía que perdía mucho tiempo ahí.
- **El agente** (`components/agent/`): chat real conectado al workflow "Cyclo · Agente del sitio" en n8n cloud (`VITE_N8N_AGENT_URL`), que pasa cada mensaje al "Cerebro del agente" (el mismo que contesta en WhatsApp). Desde 2026-10-19 también agenda el diagnóstico (paso "Agenda" en la bitácora). Usa el mismo lenguaje que la demo: lo que ves (chat, voz casual) y lo que pasa detrás (bitácora mono con los pasos reales que devuelve el webhook y el tiempo de cada uno). Un botón flotante abre el mismo chat en un `<dialog>` nativo; se esconde en el hero, las demos, el agente, el contacto y el footer.
- **Lo que hay detrás**: las aristas del plano se dibujan con el scroll (columna por columna) y los puntos que viajan aparecen cuando el trazo termina. Debajo: tres compromisos junto a un **panel de operación** de ejemplo (`OpsPanel.tsx`: una alerta que se cierra sola y una urgencia que pasa a una persona) y **"Con qué está hecho"** con los logos de las herramientas.
- **Logos** (`BrandLogo.tsx`): trazos de Simple Icons (CC0, v16.32.0) copiados al código, en un solo color (`currentColor`). Aparecen en las bitácoras (demo y agente), en los pasos y conexiones de cada sistema, en los nodos del plano y en "Con qué está hecho". Nada de colores de marca: siguen la paleta.
- **Texto**: una idea por bloque. Pasos de sistemas en frases de 3 a 7 palabras, método en una línea por etapa, 6 preguntas.
- **Así trabajamos** (`Method.tsx`, 2026-10-18): las 4 etapas en una fila con una línea que se llena al aparecer (números en círculos porque sí son secuencia) y el bloque "Formal y seguro": factura CFDI, precio cerrado, tus datos en tus cuentas, conexiones y contraseñas cifradas, API oficial de WhatsApp y Claude por API comercial (Anthropic no entrena con esos datos). Solo afirmaciones que describen cómo está hecho el sistema; nada de sellos ni certificaciones. Se quitó la hoja de "Diagnóstico operacional".
- **Footer**: la marca "Cyclo" a todo lo ancho en `teal`, sangrando por abajo. Al pasar el mouse cambia al eje MONO, como "detrás".

## Tipografía

Una sola familia, elegida por sus ejes: **Recursive** (Google Fonts, variable completa).

| Voz | Ejes | Dónde |
|---|---|---|
| Sans lineal | `MONO 0`, `CASL 0` | Todo el texto de la página |
| Mono | `MONO 1` (clase `.mono`) | Lo que hace la máquina: bitácora, herramientas, datos, horas |
| Casual | `CASL 1` (clase `.casual`) | Lo que ve el cliente: burbujas del chat, mensajes de ejemplo |

Los ejes se controlan con las variables `--mono` y `--casl` (registradas con `@property`, así que se pueden animar; ver `.morph-mono`). Escalas: `.display` (hero), `.heading` (h2), `.lead`. Tracking mínimo −0.04em.

## Color (tokens en `tailwind.config.js`)

| Token | Hex | Uso |
|---|---|---|
| `bg` | #051013 | Fondo (negro con tinte teal) |
| `raised` / `sunken` | #0c1a1c / #142326 | Paneles / campos y burbujas |
| `line` | #28393c | Bordes y separadores |
| `fg` | #DEDBC8 | Texto principal y botón primario (crema de marca) |
| `muted` / `faint` | #a7a596 / #898779 | Texto secundario / metadatos (no usar `faint` sobre `sunken`) |
| `teal` | #008998 | Marca (rellenos, no texto pequeño) |
| `teal-text` | #4fc4d1 | Teal para texto e íconos sobre fondo oscuro |
| `teal-drench` | #00A3B4 | Fondo de la sección de contacto, con texto `ink` |
| `teal-deep` | #004049 | Burbujas salientes, nodo humano, resumen |
| `ink` / `ink-muted` | #051214 / #022c33 | Texto sobre crema o teal |
| `series-*` | #4c67a3 / #c48218 / #00a0a6 | Gráfica: equipo / esperando / Cyclo (validadas para daltonismo) |

El crema sobre teal de marca da solo 3:1: el botón primario siempre es crema con texto oscuro.

### Demos por giro (`demos/<giro>.html`, código en `src/demo/`)

Excepción a la paleta: cada demo es la página que vería el cliente de ese giro y lleva su color (`theme` en `src/demo/data.ts`), pero con medida (Fidel los sintió muy fuertes el 2026-10-18): fondo claro `tint`, texto slate-900, y el color fuerte `accent` solo en botones, barra de progreso, ícono y resumen; `soft` para resaltados sobre blanco. `brand` (vivo) solo va en el ícono del giro sobre fondo oscuro. En el sitio, las tarjetas de `#demos` son oscuras con un 9 % del color del giro (`color-mix`), ícono del giro (`GiroIcon.tsx`) y el nombre grande.

- Cada demo es su propia página en la misma pestaña, para que la flecha de "atrás" del navegador regrese al sitio (vuelve al mismo scroll; al salir se deja `#demos` en la dirección por si acaso). "Volver" en la demo usa `history.back()` si llegaste desde el sitio. "Otras demos" cambia con `location.replace` para no apilar historial. Cada demo es su propia entrada en `build.rollupOptions.input` y comparte la CSP del sitio.
- Los logos de marca (con qué está hecho, se conecta con) llevan su color oficial (`BRAND_COLORS`) y enlazan a su sitio (`BRAND_URLS`) en otra pestaña.
- Pantalla de inicio con "Iniciar demo con sonido" / "Ver sin sonido": el navegador solo deja sonar después de un clic. Los sonidos se sintetizan con Web Audio en `src/demo/sound.ts` (sin archivos); la preferencia se guarda en `localStorage`.
- El guion de cada giro (mensajes y pasos) vive en `data.ts`; `DemoPage.tsx` lo convierte en una línea de tiempo con pausa, reinicio, velocidad 1×/1.5×/2× y barra de progreso. Con movimiento reducido arranca en el estado final.
- El teléfono imita WhatsApp con la letra del sistema (`.chat-font`). En celular el orden es título → teléfono → resultados → pasos, y al iniciar la página baja al teléfono.

## Reglas

- Sin etiquetas en mayúsculas sobre cada sección; los números solo donde hay secuencia real (método, siguientes pasos).
- Ejemplos marcados como ejemplo; nada de clientes, testimonios ni cifras inventadas.
- Movimiento: entradas con `cubic-bezier(0.16, 1, 0.3, 1)`; `MotionConfig reducedMotion="user"`; la demo arranca en su estado final y en pausa con movimiento reducido y siempre tiene botón de pausa.
- Grids de sección con `grid-cols-1` en móvil para que nada estire la página.
- Scroll suave con Lenis (`src/lib/smooth.ts`), sin movimiento reducido. Los clics a anclas (`#seccion`) los maneja `smooth.ts`: curva de aceleración y frenado, duración según la distancia (0.9–2.2 s), espera a que se libere el scroll si el menú estaba abierto y deja el foco en la sección. Lenis resta el `scroll-padding-top` del CSS, por eso el `OFFSET` es +88. Todo contenedor con scroll propio lleva `data-lenis-prevent`. `lockScroll()` congela la página con el chat o el menú abiertos.
- El botón principal del hero se acerca unos píxeles al cursor (`Magnetic.tsx`), solo con mouse.
- Capas: `nav` 40, `float` 45 (botón del agente), `menu` 50, `skip` 60. El chat flotante vive en la capa superior del `<dialog>`.
