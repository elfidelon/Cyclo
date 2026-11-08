Auditoría de rendimiento de Cyclo · 7 de noviembre de 2026

**1. Resultado y método**

Builds completos sin red: TypeScript, Vite de cliente, Vite SSR y prerender. Repetí el build en una copia de cada commit para aislar el efecto de cada cambio. La base es `e3c3f59df980b3ef5f4f53b3029d52f333e5b9f5`.

Los tamaños son bytes UTF-8 reales y `gzipSync` por archivo. Vite muestra algunos tamaños de JS según la longitud de la cadena; por eso sus cifras pueden ser ligeramente menores. El grafo de JS inmediato se obtiene de los scripts, modulepreload e imports estáticos del HTML. No es una captura de solicitudes de navegador. Los datos completos están en `rendimiento-mediciones.json`.

| Recurso de la portada | Antes raw | Después raw | Antes gzip | Después gzip |
|---|---:|---:|---:|---:|
| JS inmediato | 437,035 | 404,601 | 138,542 | 129,894 |
| CSS enlazado | 50,838 | 40,893 | 10,324 | 8,586 |
| HTML prerenderizado | 159,124 | 147,661 | 27,917 | 25,935 |
| Fuente WOFF2 | 83,596 | 83,596 | — | — |

El JS inmediato baja **7.4 % raw / 6.2 % gzip**. Sin movimiento reducido, se solicita Lenis desde el efecto después de la hidratación: **19,866 raw / 5,742 gzip** adicionales. Esa visita completa carga **424,467 raw / 135,636 gzip de JS**, una reducción de 12,568 raw / 2,906 gzip frente al inicio original. Con movimiento reducido no se solicita Lenis.

El total de JS generado para todas las rutas aumenta de 471,525 a 472,368 raw y de 150,286 a 151,400 gzip, por la separación de chunks y el código de coordinación. La mejora principal está en el JS que bloqueaba el arranque y en el trabajo que se evita, no en una reducción de todos los archivos del sitio.

Reproducción:

```sh
npm run build
npm run measure:build
npm run inspect:chunks
npm run check:scroll
```

`inspect:chunks` reconstruye en memoria y muestra los módulos incluidos. Su `renderedLength` es previo a minificar, no tamaño de transferencia.

**2. Cambios, efecto y riesgo**

Los deltas de JS son contra el commit anterior; los cambios de hash y de distribución entre chunks también se contabilizan.

| Commit | Cambio | Efecto medido | Riesgo |
|---|---|---|---|
| `53743de` | Scripts para medir bytes, gzip, grafo inicial y módulos de cada chunk. | 0 bytes en producción. | Bajo; solo herramientas locales. |
| `9ebf55b` | Catálogo pequeño para las tarjetas; metadatos y mensajes de vista previa compartidos con los guiones completos. Tipos en un módulo separado. | JS inmediato **−13,961 raw / −4,069 gzip**. Los guiones completos dejan de entrar en la portada. | Bajo. Comparación profunda de las siete demos contra la base y HTML prerenderizado idéntico. Las tarjetas y las demos comparten la misma fuente de datos. |
| `ab7a356` | Import dinámico de Lenis desde el efecto; anclas tempranas esperan su carga; cancelación por generación y respeto del bloqueo antes de instanciar. | JS inmediato **−18,553 raw / −4,578 gzip**. Chunk de Lenis de 19,866 / 5,742 solo sin movimiento reducido. | Medio: la primera ancla puede esperar la descarga. Conserva duración, curva, offset y foco; si falla la descarga usa el scroll nativo. |
| `ac44024` | Reloj de Lenis a demanda; mantiene `syncTouch: false`. | **+364 raw / +148 gzip** de JS. Elimina el RAF continuo de Lenis en reposo y durante gestos táctiles; despierta con rueda o anclas y se detiene al terminar. | Medio: cambia la coordinación de frames. Pruebas de reanudación tras inactividad, finalización, eventos nativos y limpieza. Falta validación en dispositivo físico. |
| `425f6ae` | Prepara el contenido del diálogo cuando aparece su botón, después del hero, y lo deja montado desde entonces. | **+69 raw / +12 gzip** de JS; HTML **−11,465 raw / −1,984 gzip**; **81 elementos menos** en el DOM inicial. Evita hidratar otra copia del chat y sus efectos de medición. | Bajo a medio: se prepara cerrado antes del clic para conservar la primera apertura; permanece montado para mantener borrador, scroll y conversación. |
| `b92acd9` | El lienzo oculto por debajo de `xl` no se suscribe al scroll ni mide offsets. La suscripción se recrea al cambiar el breakpoint. | JS **−325 raw / −144 gzip** por eliminar el helper de `useScroll`. En móvil elimina el seguimiento de un SVG que no se muestra. | Bajo: conserva valores iniciales, puntos del recorrido y breakpoint de 1280 px. HTML inicial idéntico. |
| `ac2003e` | Tailwind específico de la portada, con tokens y reglas compartidas. | CSS **−9,945 raw / −1,738 gzip**; JS **−28 raw / −17 gzip** por el cambio de entrada CSS. Se retiran 172 selectores ajenos a la portada. | Bajo para el aspecto: los 690 selectores retenidos conservan exactamente sus declaraciones. Las otras rutas conservan el CSS original. Visitar después una demo descarga la hoja completa de esa ruta: hay menor reutilización de caché entre rutas y dos hojas generadas en el build. |

También se añadieron pruebas del ciclo de vida de la carga de Lenis (`df8796c`), sin bytes en producción: movimiento reducido sin importar el módulo, doble efecto de StrictMode, ancla durante la carga, bloqueo previo a resolver, scroll táctil, rueda y desmontaje.

**3. Qué contiene cada chunk final**

| Archivo | Raw | Gzip | Portada inmediata |
|---|---:|---:|---|
| `assets/DemoPage-Ev4k2yzp.js` | 43,839 | 13,522 | No |
| `assets/catalog-C27OVYKI.js` | 144,694 | 49,086 | Sí |
| `assets/client-CSnVvLDg.js` | 133,984 | 43,144 | Sí |
| `assets/lenis-8HJNiqEX.js` | 19,866 | 5,742 | No |
| `assets/main-COodjznQ.js` | 3,255 | 1,743 | No |
| `assets/main-Cusb_z_l.js` | 122,859 | 35,961 | Sí |
| `assets/main-TYJKJ99I.js` | 807 | 499 | No |
| `assets/modulepreload-polyfill-B5Qt9EMX.js` | 711 | 399 | Sí |
| `assets/sanitize-D4ObYL94.js` | 2,353 | 1,304 | Sí |

- `main-Cusb_z_l.js`: React de la portada, calculadora, demo del hero, secciones, chat y formulario. La calculadora sigue hidratándose de inmediato.
- `catalog-C27OVYKI.js`: React, iconos compartidos, logos, catálogo de tarjetas y framer-motion. El nombre del chunk no describe todo su contenido.
- `client-CSnVvLDg.js`: React DOM y scheduler.
- `sanitize-D4ObYL94.js`: saneamiento y helper de precarga de Vite compartido con los QR.
- `modulepreload-polyfill`: compatibilidad de modulepreload.
- `lenis-*`: motor de scroll, importado desde el efecto.
- `DemoPage-*`: interfaz de demo, datos completos, resultados y sonidos sintetizados. La portada no lo solicita. `/demos/` conserva su precarga al quedar libre el navegador.
- `main-TYJKJ99I.js`: entrada de las siete demos.
- `main-COodjznQ.js`: formularios estáticos de los QR; esas páginas siguen sin montar React. La precarga existente de DemoPage en `/demos/` sí puede descargar módulos compartidos con React como antes.

Antes, `data-Bz98EQmN.js` (158,682 raw / 53,177 gzip) mezclaba los guiones completos con React, iconos y animación y sí pertenecía al grafo de la portada. El inventario de Rollup mostró framer-motion con animación, proyección/layout y drag/pan. No se incluyen todos los exports de la biblioteca, pero sí funcionalidades de arrastre que el sitio no usa.

**4. Validaciones y límites**

- Build offline y pruebas de scroll correctos. No se añadieron dependencias.
- Datos, temas, textos, orden y guiones de las siete demos idénticos a la base por comparación profunda.
- HTML de la portada fuera del diálogo cerrado idéntico byte a byte; conserva todo el contenido de las secciones, incluido calculadora y agente.
- Comparación local del primer render con `renderToString` y una ventana simulada antes de cargar framer-motion: servidor y cliente normal iguales. Con movimiento reducido hay 18 diferencias preexistentes, idénticas antes y después; detalle en el JSON de mediciones. Esta simulación no sustituye a `hydrateRoot` en un navegador.
- CSP de las 11 páginas idéntica a la base, incluido `connect-src` con los webhooks y `font-src 'self'`. URLs, QR, enlaces y rutas conservados; sin enlaces internos rotos ni IDs duplicados en los HTML generados.
- CSS de las demás rutas idéntico byte a byte. Verifiqué con PostCSS y el parser de selectores que la hoja de la portada es un subconjunto de las reglas anteriores con las mismas declaraciones y contexto de media query.
- Fuente ya recortada y precargada; sin fotografías en el contenido. SVG e iconos con viewBox y tamaños por clases; el PNG de Open Graph no forma parte de la carga normal del hero. CSS y fuente sin modificaciones visuales.
- Formularios y cliente de API del agente sin modificaciones; no se realizaron envíos reales a los webhooks.
- No medí LCP, TBT, INP, CLS ni tareas largas en navegador: el entorno negó iniciar el servidor local (`listen EPERM`) y DevTools requiere una aprobación que este entorno no permite. Tampoco hubo comprobación visual en un teléfono. No se atribuyen mejoras en milisegundos ni en Core Web Vitals a los cambios.

**5. Errores funcionales encontrados y conservados**

1. **Primer render con movimiento reducido distinto al SSR.** `src/components/Navbar.tsx:83` calcula `initial` con `useReducedMotion`: el servidor pinta opacidad 0 / translateY(−80px), y el cliente con esa preferencia pinta opacidad 1 / sin transformación. `src/components/Behind.tsx:160` y `:188` cambian atributos SVG y opacidad con la misma preferencia durante el render. La comparación local detecta 18 diferencias (1 nav, 8 paths, 9 grupos) tanto en la base como en el resultado. Posibles avisos y atributos sin reconciliar durante la hidratación. El efecto que modifica `drawn` no evita esas diferencias de los atributos iniciales. No lo corregí por la regla de documentar errores funcionales.
2. **El foco puede salir del menú móvil superpuesto.** `src/components/Navbar.tsx:67` solo gestiona Escape y el foco inicial; el panel en `:150` es un div y el resto de la página sigue disponible al teclado. Falta contención del foco o hacer inerte el fondo. Hallazgo de revisión del código, pendiente de reproducir con navegador; no lo modifiqué.

No se detectaron enlaces internos rotos en el build. Sin consola de navegador disponible no se puede asegurar que no existan otros errores.

**6. Recomendaciones no implementadas**

- **Resolver el primer render con movimiento reducido en una tarea funcional separada.** Aplicar la preferencia en un efecto con un valor inicial común y validar también el cambio de preferencia en vivo.
- **Hidratación diferida de calculadora y secciones lejanas conservando SSR.** Requiere fronteras de Suspense y prerender asíncrono, o una estrategia equivalente de hidratación parcial. `React.lazy` con fallback vacío y `renderToString` perdería HTML; lazy por sí solo tampoco evita solicitar todas las secciones al hidratar. Sin navegador disponible no introduje ese cambio arquitectónico ni el riesgo de perder eventos, foco o IDs.
- **LazyMotion + m.** Lo probé y lo descarté: la prueba de empaquetado con `m` y las funciones de layout de `domMax` seguía incluyendo drag/pan y no mostró ahorro útil. `domAnimation` por sí solo elimina las transiciones `layout="position"` del hero y del chat. Para retirar drag/pan haría falta diferir esas funciones o mantener un bundle selectivo; debe medirse y validarse visualmente antes de adoptarlo.
- **content-visibility.** No lo apliqué: sin alturas intrínsecas verificadas en los breakpoints puede cambiar geometría, restauración de scroll y llegada a anclas. También necesita comprobarse con los observadores y el lienzo de scroll.
- **CSS compartido más un suplemento por ruta.** Puede recuperar reutilización de caché al pasar de portada a demos; debe preservar el orden de la cascada. El recorte actual favorece la primera visita a la portada.
- **No forzar listeners wheel/touch de Lenis a pasivos.** Lenis necesita cancelar algunos eventos para suavizar la rueda y bloquear scroll en modales. Los listeners propios de scroll ya eran pasivos y siguen así.
- **No cambiar formatos de imagen ni volver a recortar la fuente.** No hay imagen LCP y la fuente ya es WOFF2 local con preload y fallback ajustado. No hay un ahorro comprobado que justifique un cambio visual.
- **Medir con Chrome móvil y un teléfono real.** Carga fría y caliente, CPU limitada, scroll rápido, regreso desde demos, anclas durante la descarga de Lenis, apertura y reapertura del agente, conversación guardada y ambos formularios con respuestas simuladas. Haría falta esa medición para decidir cuánto ayudan los cambios al LCP/TBT/INP/CLS reales.

**7. Commits y limitación del entorno**

Los archivos de trabajo contienen todos los cambios. `.git` del clon es de solo lectura: `git add` y `git commit` fallan al crear `index.lock`. Los commits se crearon en una copia de sus metadatos en `/tmp/cyclo-perf/git`, sobre la misma rama `codex/rendimiento`, y se entregan en `/tmp/cyclo-perf/rendimiento.bundle`. El HEAD del clon original sigue en la base; no se simuló una actualización de esa referencia.

Cuando `.git` sea escribible, desde esta carpeta y con la rama `codex/rendimiento` seleccionada, se puede importar el historial sin reescribir los archivos de trabajo:

```sh
git fetch /tmp/cyclo-perf/rendimiento.bundle codex/rendimiento
git update-ref refs/heads/codex/rendimiento FETCH_HEAD e3c3f59df980b3ef5f4f53b3029d52f333e5b9f5
git reset --mixed HEAD
git status --short
```

`update-ref` comprueba que la rama aún esté en la base antes de actualizarla; `reset --mixed` sincroniza el índice y conserva los archivos de trabajo.
