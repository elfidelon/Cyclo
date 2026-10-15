# Design

## Idea

Lo que ve el cliente / lo que pasa detrás. Toda la página enseña la máquina: la demo del hero (chat + bitácora sincronizados), el lienzo del flujo, los pasos de cada sistema y el diagnóstico de ejemplo.

La demo del hero tiene un guion por giro (`SCENARIOS` en `src/components/LiveDemo.tsx`): se escriben los pasos y `buildScript` calcula los tiempos. Rota sola hasta que el visitante elige un giro, y la hora del titular ("Son las 23:47") sigue al primer mensaje del guion, así que todas las conversaciones pasan después del cierre.

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

## Reglas

- Sin etiquetas en mayúsculas sobre cada sección; los números solo donde hay secuencia real (método, siguientes pasos).
- Ejemplos marcados como ejemplo; nada de clientes, testimonios ni cifras inventadas.
- Movimiento: entradas con `cubic-bezier(0.16, 1, 0.3, 1)`; `MotionConfig reducedMotion="user"`; la demo arranca en su estado final y en pausa con movimiento reducido y siempre tiene botón de pausa.
- Grids de sección con `grid-cols-1` en móvil para que nada estire la página.
