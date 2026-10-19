// Demos por giro para enseñárselas a un cliente. Negocios, nombres y precios son de
// ejemplo (la página lo dice). Cada demo tiene su color, como si fuera la marca del cliente,
// usado con medida: fondo claro (`tint`) y el color fuerte (`accent`) solo en lo que importa.

export type Tool =
  | 'WhatsApp'
  | 'Claude'
  | 'Google Calendar'
  | 'Google Sheets'
  | 'Google Drive'
  | 'Gmail'
  | 'CRM'
  | 'PDF'
  | 'Pago'
  | 'Recordatorio'
  | 'Tu equipo'

export type Result =
  | { type: 'calendar'; title: string; when: string; detail: string }
  | { type: 'sheet'; title: string; columns: string[]; row: string[] }
  | { type: 'reminder'; when: string; text: string }
  | { type: 'file'; name: string; detail: string }
  | { type: 'crm'; name: string; status: string; tags: string[] }
  | { type: 'payment'; amount: string; detail: string }

export type ScriptItem =
  | { kind: 'msg'; from: 'cliente' | 'negocio'; time: string; text: string; file?: string }
  | { kind: 'step'; clock: string; tool: Tool; text: string; dur?: string; result?: Result }

export type Theme = {
  /** Color vivo del giro: ícono sobre fondo oscuro (tarjetas del sitio, otras demos). */
  brand: string
  /** Texto o ícono sobre `brand`. */
  ink: string
  /** Color fuerte para resaltar sobre blanco. */
  accent: string
  /** Tinte claro para fondos resaltados sobre blanco. */
  soft: string
  /** Fondo de la página de la demo. */
  tint: string
}

export type Demo = {
  slug: string
  giro: string
  /** Quién escribe por WhatsApp: "paciente", "prospecto"… */
  audience: string
  business: string
  initials: string
  hook: string
  headline: string
  sub: string
  theme: Theme
  script: ScriptItem[]
  summary: { big: string; label: string; facts: string[] }
}

export const DEMOS: Demo[] = [
  {
    slug: 'dental',
    audience: 'paciente',
    giro: 'Clínica dental',
    business: 'Clínica Dental Sonrisa',
    initials: 'DS',
    hook: 'Una paciente pide una limpieza a las 23:47.',
    headline: 'Tu clínica agenda citas a las 23:47.',
    sub: 'La clínica ya cerró. Una paciente escribe por WhatsApp y el sistema le contesta, le agenda y le programa su recordatorio.',
    theme: { brand: '#5eead4', ink: '#042f2e', accent: '#0f766e', soft: '#ccfbf1', tint: '#f0fdfa' },
    script: [
      { kind: 'msg', from: 'cliente', time: '23:47', text: 'Hola, buenas noches. ¿Tienen espacio para una limpieza esta semana?' },
      { kind: 'step', clock: '23:47:02', tool: 'WhatsApp', text: 'Mensaje recibido · paciente nueva' },
      { kind: 'step', clock: '23:47:03', tool: 'Claude', text: 'Entiende: quiere cita de limpieza', dur: '1.1 s' },
      { kind: 'step', clock: '23:47:03', tool: 'Google Calendar', text: 'Busca horarios libres de jueves a sábado', dur: '0.4 s' },
      {
        kind: 'msg',
        from: 'negocio',
        time: '23:47',
        text: '¡Buenas noches! Sí tenemos espacio. Para limpieza dental te puedo ofrecer:\n• Jueves 10:00\n• Jueves 17:30\n• Sábado 11:00\n¿Cuál te acomoda?',
      },
      { kind: 'msg', from: 'cliente', time: '23:48', text: 'El jueves a las 5:30, a nombre de Mariana López' },
      { kind: 'step', clock: '23:48:11', tool: 'Claude', text: 'Confirma: jueves 17:30 · Mariana López', dur: '0.8 s' },
      {
        kind: 'step',
        clock: '23:48:11',
        tool: 'Google Calendar',
        text: 'Crea la cita · limpieza · 45 min',
        dur: '0.3 s',
        result: { type: 'calendar', title: 'Limpieza dental', when: 'Jueves · 17:30 – 18:15', detail: 'Mariana López · Sillón 2' },
      },
      {
        kind: 'step',
        clock: '23:48:12',
        tool: 'Google Sheets',
        text: 'Registra a la paciente',
        dur: '0.2 s',
        result: { type: 'sheet', title: 'Pacientes', columns: ['Paciente', 'Servicio', 'Origen'], row: ['Mariana López', 'Limpieza', 'WhatsApp 23:47'] },
      },
      {
        kind: 'msg',
        from: 'negocio',
        time: '23:48',
        text: 'Listo, Mariana. Te esperamos el jueves a las 17:30 para tu limpieza. Un día antes te mando un recordatorio por aquí.',
      },
      {
        kind: 'step',
        clock: '23:48:13',
        tool: 'Recordatorio',
        text: 'Programa el aviso 24 h antes',
        result: { type: 'reminder', when: 'Miércoles · 17:30', text: 'Hola Mariana, te esperamos mañana a las 17:30 para tu limpieza. Responde 1 para confirmar.' },
      },
    ],
    summary: {
      big: '71 s',
      label: 'de "hola" a cita agendada',
      facts: ['Con la clínica cerrada', 'Nadie del equipo tuvo que contestar', 'El recordatorio sale solo'],
    },
  },
  {
    slug: 'consultorio',
    audience: 'paciente',
    giro: 'Consultorio médico',
    business: 'Consultorio Dr. Ramírez',
    initials: 'DR',
    hook: 'Un paciente pide su seguimiento un domingo en la noche.',
    headline: 'Tu consultorio confirma citas mientras descansas.',
    sub: 'Domingo, 21:58. Un paciente conocido pide consulta para el lunes. El sistema lo reconoce, lo agenda con el médico y le confirma en la mañana.',
    theme: { brand: '#60a5fa', ink: '#0b1b3a', accent: '#1d4ed8', soft: '#dbeafe', tint: '#eff6ff' },
    script: [
      { kind: 'msg', from: 'cliente', time: '21:58', text: 'Buenas noches, ¿el doctor tiene consulta mañana? Es para el seguimiento de mi presión.' },
      { kind: 'step', clock: '21:58:40', tool: 'WhatsApp', text: 'Mensaje recibido · paciente registrado' },
      { kind: 'step', clock: '21:58:41', tool: 'Claude', text: 'Reconoce a Jorge Medina · última consulta: 2 de septiembre', dur: '0.9 s' },
      { kind: 'step', clock: '21:58:41', tool: 'Google Calendar', text: 'Agenda del médico · lunes · 2 horarios libres', dur: '0.4 s' },
      {
        kind: 'msg',
        from: 'negocio',
        time: '21:58',
        text: 'Buenas noches, don Jorge. Mañana el doctor tiene espacio a las 9:30 o a las 12:00. ¿Cuál le queda mejor? Si tiene sus últimas tomas de presión, tráigalas por favor.',
      },
      { kind: 'msg', from: 'cliente', time: '21:59', text: 'A las 9:30 está perfecto, gracias' },
      { kind: 'step', clock: '21:59:20', tool: 'Claude', text: 'Confirma: lunes 9:30 · seguimiento', dur: '0.7 s' },
      {
        kind: 'step',
        clock: '21:59:20',
        tool: 'Google Calendar',
        text: 'Cita en la agenda del médico · 30 min',
        dur: '0.3 s',
        result: { type: 'calendar', title: 'Seguimiento · presión arterial', when: 'Lunes · 9:30 – 10:00', detail: 'Jorge Medina · Consultorio 1' },
      },
      {
        kind: 'step',
        clock: '21:59:21',
        tool: 'Google Sheets',
        text: 'Guarda el motivo de consulta',
        dur: '0.2 s',
        result: { type: 'sheet', title: 'Consultas', columns: ['Paciente', 'Motivo', 'Llegó por'], row: ['Jorge Medina', 'Control de presión', 'WhatsApp'] },
      },
      { kind: 'msg', from: 'negocio', time: '21:59', text: 'Listo, don Jorge: mañana lunes a las 9:30. A las 8:00 le mando la confirmación por aquí.' },
      {
        kind: 'step',
        clock: '21:59:22',
        tool: 'Recordatorio',
        text: 'Confirmación el mismo día',
        result: { type: 'reminder', when: 'Lunes · 8:00', text: 'Buenos días, don Jorge. Lo esperamos hoy a las 9:30. Si no puede venir, avísenos por aquí.' },
      },
    ],
    summary: {
      big: '2.6 s',
      label: 'para la primera respuesta',
      facts: ['Un domingo a las 21:58', 'Lo reconoció por su historial', 'La recepción llega con la agenda lista'],
    },
  },
  {
    slug: 'inmobiliaria',
    audience: 'prospecto',
    giro: 'Inmobiliaria',
    business: 'Casa Bajío Inmobiliaria',
    initials: 'CB',
    hook: 'Un prospecto pregunta por la casa del anuncio.',
    headline: 'Tu inmobiliaria califica prospectos antes que la competencia.',
    sub: 'Un prospecto escribe por el anuncio a las 22:05. El sistema le da los datos, lo califica y le agenda la visita con el asesor de esa casa.',
    theme: { brand: '#fb923c', ink: '#1c0a00', accent: '#c2410c', soft: '#ffedd5', tint: '#fff7ed' },
    script: [
      { kind: 'msg', from: 'cliente', time: '22:05', text: 'Hola, vi la casa en renta del anuncio, ¿sigue disponible?' },
      { kind: 'step', clock: '22:05:18', tool: 'WhatsApp', text: 'Mensaje recibido · anuncio: casa en renta' },
      { kind: 'step', clock: '22:05:19', tool: 'Claude', text: 'Intención: rentar · falta presupuesto y fecha', dur: '1.0 s' },
      {
        kind: 'msg',
        from: 'negocio',
        time: '22:05',
        text: '¡Hola! Sí sigue disponible: 3 recámaras, 2 baños y cochera, en $14,500 al mes. Para ver si te acomoda, ¿cuál es tu presupuesto y para cuándo te quieres mudar?',
      },
      { kind: 'msg', from: 'cliente', time: '22:06', text: 'Hasta 15 mil, me mudaría el próximo mes. ¿Se puede ver el sábado?' },
      {
        kind: 'step',
        clock: '22:06:02',
        tool: 'Claude',
        text: 'Califica: listo para visitar',
        dur: '0.9 s',
        result: { type: 'crm', name: 'Prospecto · casa en renta', status: 'Listo para visitar', tags: ['Presupuesto hasta $15,000', 'Mudanza el próximo mes', 'Llegó por el anuncio'] },
      },
      {
        kind: 'step',
        clock: '22:06:03',
        tool: 'Google Calendar',
        text: 'Agenda del asesor · sábado 11:00',
        dur: '0.4 s',
        result: { type: 'calendar', title: 'Visita · casa en renta', when: 'Sábado · 11:00 – 11:45', detail: 'Con Luis, asesor de la propiedad' },
      },
      { kind: 'step', clock: '22:06:03', tool: 'CRM', text: 'Prospecto registrado con su calificación', dur: '0.3 s' },
      {
        kind: 'msg',
        from: 'negocio',
        time: '22:06',
        text: 'Perfecto. Te agendé el sábado a las 11:00 con Luis, el asesor de esa casa. Un día antes te mando la ubicación.',
      },
      {
        kind: 'step',
        clock: '22:06:05',
        tool: 'Recordatorio',
        text: 'Ubicación un día antes',
        result: { type: 'reminder', when: 'Viernes · 18:00', text: 'Hola, mañana es tu visita a las 11:00. Aquí está la ubicación. Luis te espera en la entrada.' },
      },
    ],
    summary: {
      big: '1 min',
      label: 'del anuncio a la visita agendada',
      facts: ['El prospecto ya viene calificado', 'El asesor solo llega a enseñar la casa', 'Quedó registrado de qué anuncio llegó'],
    },
  },
  {
    slug: 'contable',
    audience: 'cliente',
    giro: 'Despacho contable',
    business: 'Herrera Contadores',
    initials: 'HC',
    hook: 'Un cliente manda sus facturas del mes a las 21:30.',
    headline: 'Tu despacho recibe documentos sin ordenar nada a mano.',
    sub: 'Un cliente manda tres facturas en la noche. El sistema las lee, las archiva en su carpeta del mes, le dice qué falta y le recuerda antes del día 17.',
    theme: { brand: '#34d399', ink: '#022c22', accent: '#047857', soft: '#d1fae5', tint: '#ecfdf5' },
    script: [
      { kind: 'msg', from: 'cliente', time: '21:30', text: 'Buenas noches, ahí van mis facturas de septiembre.', file: '3 archivos PDF' },
      { kind: 'step', clock: '21:30:07', tool: 'WhatsApp', text: 'Recibidos 3 archivos · cliente registrado' },
      { kind: 'step', clock: '21:30:08', tool: 'Claude', text: 'Lee y clasifica: 2 de ingreso, 1 de gasto', dur: '1.6 s' },
      {
        kind: 'step',
        clock: '21:30:09',
        tool: 'Google Drive',
        text: 'Archiva en la carpeta del cliente y del mes',
        dur: '0.5 s',
        result: { type: 'file', name: 'Clientes / Ruiz / 2026-09', detail: '3 facturas · 2 de ingreso, 1 de gasto' },
      },
      {
        kind: 'step',
        clock: '21:30:09',
        tool: 'Google Sheets',
        text: 'Revisa qué le falta para su declaración',
        dur: '0.2 s',
        result: { type: 'sheet', title: 'Pendientes de septiembre', columns: ['Cliente', 'Documento', 'Estado'], row: ['Daniel Ruiz', 'Estado de cuenta', 'Falta'] },
      },
      {
        kind: 'msg',
        from: 'negocio',
        time: '21:30',
        text: '¡Gracias! Recibimos 2 facturas de ingreso y 1 de gasto. Solo nos falta tu estado de cuenta de septiembre para preparar tu declaración.',
      },
      { kind: 'msg', from: 'cliente', time: '21:31', text: 'Ah sí, mañana se los mando' },
      { kind: 'step', clock: '21:31:04', tool: 'Claude', text: 'Compromiso: estado de cuenta mañana', dur: '0.6 s' },
      { kind: 'msg', from: 'negocio', time: '21:31', text: 'Perfecto. Si no lo vemos mañana, te lo recuerdo el día 15 para llegar a tiempo al 17.' },
      {
        kind: 'step',
        clock: '21:31:05',
        tool: 'Recordatorio',
        text: 'Aviso antes de la fecha límite',
        result: { type: 'reminder', when: 'Día 15 · 10:00', text: 'Hola Daniel, nos falta tu estado de cuenta de septiembre. La fecha límite es el 17.' },
      },
    ],
    summary: {
      big: '0',
      label: 'facturas ordenadas a mano',
      facts: ['Cada archivo en su carpeta', 'El cliente sabe qué le falta', 'Recordatorio antes del día 17'],
    },
  },
  {
    slug: 'escuela',
    audience: 'familia',
    giro: 'Escuela privada',
    business: 'Colegio Arboleda',
    initials: 'CA',
    hook: 'Una mamá pide informes de inscripción a las 20:15.',
    headline: 'Tu escuela da informes de inscripción a cualquier hora.',
    sub: 'Temporada de inscripciones. Una mamá pregunta por lugar en primero de primaria. El sistema contesta costos, agenda la visita guiada y le manda los requisitos.',
    theme: { brand: '#facc15', ink: '#1f1600', accent: '#a16207', soft: '#fef9c3', tint: '#fefce8' },
    script: [
      {
        kind: 'msg',
        from: 'cliente',
        time: '20:15',
        text: 'Buenas noches, ¿todavía hay lugar en primero de primaria para el próximo ciclo? ¿Cuánto cuesta la inscripción?',
      },
      { kind: 'step', clock: '20:15:31', tool: 'WhatsApp', text: 'Mensaje recibido · familia nueva' },
      { kind: 'step', clock: '20:15:32', tool: 'Claude', text: 'Intención: informes de inscripción · 1º de primaria', dur: '1.0 s' },
      { kind: 'step', clock: '20:15:32', tool: 'Google Sheets', text: 'Consulta cupo: 4 lugares en 1º', dur: '0.3 s' },
      {
        kind: 'msg',
        from: 'negocio',
        time: '20:15',
        text: '¡Buenas noches! Sí, todavía tenemos lugares en primero de primaria. La inscripción es de $4,800 y la colegiatura de $3,950 al mes. ¿Te gustaría conocer la escuela? Hay visitas guiadas el jueves a las 10:00 o el sábado a las 11:00.',
      },
      { kind: 'msg', from: 'cliente', time: '20:17', text: 'El sábado a las 11 está perfecto. Soy Laura Méndez, mamá de Emilio.' },
      { kind: 'step', clock: '20:17:08', tool: 'Claude', text: 'Confirma visita: sábado 11:00 · familia Méndez', dur: '0.8 s' },
      {
        kind: 'step',
        clock: '20:17:09',
        tool: 'Google Calendar',
        text: 'Agenda la visita guiada con admisiones',
        dur: '0.3 s',
        result: { type: 'calendar', title: 'Visita guiada · admisiones', when: 'Sábado · 11:00 – 12:00', detail: 'Familia Méndez · 1º de primaria' },
      },
      {
        kind: 'step',
        clock: '20:17:09',
        tool: 'Google Sheets',
        text: 'Registra a la familia interesada',
        dur: '0.2 s',
        result: { type: 'sheet', title: 'Familias interesadas', columns: ['Familia', 'Grado', 'Siguiente paso'], row: ['Méndez (Emilio)', '1º primaria', 'Visita sábado'] },
      },
      {
        kind: 'msg',
        from: 'negocio',
        time: '20:17',
        text: 'Listo, Laura. Los esperamos el sábado a las 11:00 en la entrada principal. Te mando la lista de requisitos para ir adelantando.',
        file: 'Requisitos-1o-primaria.pdf',
      },
      {
        kind: 'step',
        clock: '20:17:10',
        tool: 'Recordatorio',
        text: 'Recordatorio de la visita',
        result: { type: 'reminder', when: 'Viernes · 18:00', text: 'Hola Laura, mañana los esperamos a las 11:00 para la visita guiada. ¡Emilio también es bienvenido!' },
      },
    ],
    summary: {
      big: '24/7',
      label: 'informes de inscripción',
      facts: ['Contesta costos y requisitos', 'Agenda la visita guiada', 'Ninguna familia se queda sin respuesta'],
    },
  },
  {
    slug: 'agencia',
    audience: 'prospecto',
    giro: 'Agencia de servicios',
    business: 'Estudio Lumen',
    initials: 'EL',
    hook: 'Un prospecto pide cotización y recibe la propuesta en el chat.',
    headline: 'Tu agencia manda propuestas mientras el cliente sigue en el chat.',
    sub: 'Un restaurante pide página web y redes a las 20:40. El sistema pregunta lo que falta, redacta la propuesta con tus precios y la manda en PDF.',
    theme: { brand: '#a78bfa', ink: '#1e0b45', accent: '#6d28d9', soft: '#ede9fe', tint: '#f5f3ff' },
    script: [
      { kind: 'msg', from: 'cliente', time: '20:40', text: 'Hola, necesito página web para mi restaurante y manejo de redes. ¿Me pueden cotizar?' },
      { kind: 'step', clock: '20:40:31', tool: 'WhatsApp', text: 'Mensaje recibido · prospecto nuevo' },
      { kind: 'step', clock: '20:40:32', tool: 'Claude', text: 'Servicios: sitio web + redes · falta volumen y presupuesto', dur: '1.0 s' },
      { kind: 'msg', from: 'negocio', time: '20:40', text: '¡Claro! Para armarte la propuesta: ¿cuántas publicaciones al mes te gustaría y tienes un presupuesto aproximado?' },
      { kind: 'msg', from: 'cliente', time: '20:41', text: 'Unas 12 al mes, y unos 15 mil para arrancar' },
      { kind: 'step', clock: '20:41:16', tool: 'Claude', text: 'Redacta la propuesta con tus plantillas y precios', dur: '6.8 s' },
      {
        kind: 'step',
        clock: '20:41:18',
        tool: 'PDF',
        text: 'Genera la propuesta con tu marca',
        dur: '1.2 s',
        result: { type: 'file', name: 'Propuesta-restaurante.pdf', detail: '4 páginas · alcance, tiempos e inversión' },
      },
      {
        kind: 'step',
        clock: '20:41:18',
        tool: 'Google Sheets',
        text: 'Registra la oportunidad en tu embudo',
        dur: '0.2 s',
        result: { type: 'sheet', title: 'Oportunidades', columns: ['Cliente', 'Servicio', 'Valor'], row: ['Restaurante', 'Sitio + redes', '$15,000'] },
      },
      {
        kind: 'msg',
        from: 'negocio',
        time: '20:41',
        text: 'Listo, aquí está tu propuesta con alcance, tiempos e inversión. Cualquier duda la vemos por aquí.',
        file: 'Propuesta-restaurante.pdf',
      },
      {
        kind: 'step',
        clock: '20:41:19',
        tool: 'Recordatorio',
        text: 'Seguimiento si no responde',
        result: { type: 'reminder', when: 'En 3 días · 10:00', text: 'Hola, ¿pudiste revisar la propuesta? Si quieres ajustamos el alcance a tu presupuesto.' },
      },
    ],
    summary: {
      big: '9 s',
      label: 'para tener la propuesta lista',
      facts: ['Con tus plantillas y tus precios', 'Enviada mientras el cliente seguía en el chat', 'Seguimiento automático a los 3 días'],
    },
  },
  {
    slug: 'comercio',
    audience: 'clienta',
    giro: 'Comercio',
    business: 'Calzado Andrade',
    initials: 'AN',
    hook: 'Una clienta compra tenis a las 22:40, con la tienda cerrada.',
    headline: 'Tu tienda vende por WhatsApp con la cortina abajo.',
    sub: 'Una clienta de Querétaro pregunta por unos tenis a las 22:40. El sistema revisa existencias, le da el envío, aparta el par y le manda el link de pago.',
    theme: { brand: '#fb7185', ink: '#3b0712', accent: '#be123c', soft: '#ffe4e6', tint: '#fff1f2' },
    script: [
      { kind: 'msg', from: 'cliente', time: '22:40', text: '¿Tienen los tenis blancos en talla 27? ¿Hacen envíos a Querétaro?' },
      { kind: 'step', clock: '22:40:12', tool: 'WhatsApp', text: 'Mensaje recibido · clienta nueva' },
      { kind: 'step', clock: '22:40:13', tool: 'Claude', text: 'Intención: compra · tenis blancos · talla 27', dur: '0.9 s' },
      { kind: 'step', clock: '22:40:13', tool: 'Google Sheets', text: 'Inventario: 2 pares en talla 27 · $1,290', dur: '0.3 s' },
      {
        kind: 'msg',
        from: 'negocio',
        time: '22:40',
        text: '¡Sí! Nos quedan 2 pares en talla 27, a $1,290. El envío a Querétaro cuesta $150 y llega en 2 a 3 días. ¿Te los aparto?',
      },
      { kind: 'msg', from: 'cliente', time: '22:41', text: 'Sí porfa, a nombre de Daniela Ruiz' },
      { kind: 'step', clock: '22:41:01', tool: 'Claude', text: 'Pedido: tenis blancos 27 · envío a Querétaro', dur: '0.7 s' },
      {
        kind: 'step',
        clock: '22:41:02',
        tool: 'Google Sheets',
        text: 'Aparta el par y actualiza el inventario',
        dur: '0.3 s',
        result: { type: 'sheet', title: 'Inventario', columns: ['Modelo', 'Talla', 'Existencias'], row: ['Tenis blancos', '27', '2 → 1'] },
      },
      {
        kind: 'step',
        clock: '22:41:02',
        tool: 'Pago',
        text: 'Genera el link de pago',
        dur: '0.4 s',
        result: { type: 'payment', amount: '$1,440', detail: 'Tenis blancos 27 + envío a Querétaro' },
      },
      { kind: 'msg', from: 'negocio', time: '22:41', text: 'Listo, Daniela. Te aparté tus tenis. Aquí va tu link de pago; en cuanto se acredite te mandamos tu guía.' },
      {
        kind: 'step',
        clock: '22:41:03',
        tool: 'Recordatorio',
        text: 'Posventa 3 días después de la entrega',
        result: { type: 'reminder', when: '3 días después de la entrega', text: 'Hola Daniela, ¿qué tal te quedaron tus tenis? Si necesitas cambio de talla, te ayudamos por aquí.' },
      },
    ],
    summary: {
      big: '22:41',
      label: 'venta cerrada con la tienda cerrada',
      facts: ['Existencias revisadas al momento', 'Link de pago en el mismo chat', 'Posventa automática'],
    },
  },
]

export function demoBySlug(slug: string | undefined) {
  return DEMOS.find((d) => d.slug === slug) ?? DEMOS[0]
}
