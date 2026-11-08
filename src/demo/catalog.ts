// Solo lo que pintan las tarjetas de la portada. Los guiones completos viven en data.ts.
import type { Demo } from './types'

export type DemoPreview = Pick<Demo, 'slug' | 'giro' | 'business' | 'theme' | 'script'>

export const DEMO_CATALOG: DemoPreview[] = [
  {
    "slug": "dental",
    "giro": "Clínica dental",
    "business": "Clínica Dental Sonrisa",
    "theme": {
      "brand": "#5eead4",
      "ink": "#042f2e",
      "accent": "#0f766e",
      "soft": "#ccfbf1",
      "tint": "#f0fdfa"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "23:47",
        "text": "Hola, buenas noches. ¿Tienen espacio para una limpieza esta semana?"
      },
      {
        "kind": "msg",
        "from": "negocio",
        "time": "23:47",
        "text": "¡Buenas noches! Sí tenemos espacio. Para limpieza dental te puedo ofrecer:\n• Jueves 10:00\n• Jueves 17:30\n• Sábado 11:00\n¿Cuál te acomoda?"
      },
      {
        "kind": "msg",
        "from": "cliente",
        "time": "23:48",
        "text": "El jueves a las 5:30, a nombre de Mariana López"
      }
    ]
  },
  {
    "slug": "consultorio",
    "giro": "Consultorio médico",
    "business": "Consultorio Dr. Ramírez",
    "theme": {
      "brand": "#60a5fa",
      "ink": "#0b1b3a",
      "accent": "#1d4ed8",
      "soft": "#dbeafe",
      "tint": "#eff6ff"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "21:58",
        "text": "Buenas noches, ¿el doctor tiene consulta mañana? Es para el seguimiento de mi presión."
      }
    ]
  },
  {
    "slug": "inmobiliaria",
    "giro": "Inmobiliaria",
    "business": "Casa Bajío Inmobiliaria",
    "theme": {
      "brand": "#fb923c",
      "ink": "#1c0a00",
      "accent": "#c2410c",
      "soft": "#ffedd5",
      "tint": "#fff7ed"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "22:05",
        "text": "Hola, vi la casa en renta del anuncio, ¿sigue disponible?"
      }
    ]
  },
  {
    "slug": "contable",
    "giro": "Despacho contable",
    "business": "Herrera Contadores",
    "theme": {
      "brand": "#34d399",
      "ink": "#022c22",
      "accent": "#047857",
      "soft": "#d1fae5",
      "tint": "#ecfdf5"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "21:30",
        "text": "Buenas noches, ahí van mis facturas de septiembre.",
        "file": "3 archivos PDF"
      }
    ]
  },
  {
    "slug": "escuela",
    "giro": "Escuela privada",
    "business": "Colegio Arboleda",
    "theme": {
      "brand": "#facc15",
      "ink": "#1f1600",
      "accent": "#a16207",
      "soft": "#fef9c3",
      "tint": "#fefce8"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "20:15",
        "text": "Buenas noches, ¿todavía hay lugar en primero de primaria para el próximo ciclo? ¿Cuánto cuesta la inscripción?"
      }
    ]
  },
  {
    "slug": "agencia",
    "giro": "Agencia de servicios",
    "business": "Estudio Lumen",
    "theme": {
      "brand": "#a78bfa",
      "ink": "#1e0b45",
      "accent": "#6d28d9",
      "soft": "#ede9fe",
      "tint": "#f5f3ff"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "20:40",
        "text": "Hola, necesito página web para mi restaurante y manejo de redes. ¿Me pueden cotizar?"
      }
    ]
  },
  {
    "slug": "comercio",
    "giro": "Comercio",
    "business": "Calzado Andrade",
    "theme": {
      "brand": "#fb7185",
      "ink": "#3b0712",
      "accent": "#be123c",
      "soft": "#ffe4e6",
      "tint": "#fff1f2"
    },
    "script": [
      {
        "kind": "msg",
        "from": "cliente",
        "time": "22:40",
        "text": "¿Tienen los tenis blancos en talla 27? ¿Hacen envíos a Querétaro?"
      }
    ]
  }
]
