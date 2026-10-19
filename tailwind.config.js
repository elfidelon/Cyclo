/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superficies: negro con tinte del teal de marca (hue 211)
        bg: '#051013',
        raised: '#0c1a1c',
        sunken: '#142326',
        line: '#28393c',
        // Tinta
        fg: '#dedbc8',
        muted: '#a7a596',
        faint: '#898779',
        // Marca
        teal: {
          DEFAULT: '#008998',
          text: '#4fc4d1',
          drench: '#00a3b4',
          deep: '#004049',
        },
        ink: {
          DEFAULT: '#051214',
          muted: '#022c33',
        },
        // Series de la gráfica (validadas contra raised en modo oscuro)
        series: {
          team: '#4c67a3',
          wait: '#c48218',
          cyclo: '#00a0a6',
        },
      },
      fontFamily: {
        sans: ['Recursive', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        page: '1240px',
      },
      zIndex: {
        nav: '40',
        float: '45',
        menu: '50',
        skip: '60',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
