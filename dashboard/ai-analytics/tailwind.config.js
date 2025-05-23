/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    extend: {
      colors: {
        // dark mode
        'dark-tremor': {
          brand: {
            faint: '#0B1229', // custom
            muted: '#172554', // blue-950
            subtle: '#262626',
            DEFAULT: '#27F795',
            emphasis: '#353535',
            inverted: '#030712', // gray-950
          },
          background: {
            muted: '#131A2B', // custom
            subtle: '#353535',
            DEFAULT: '#0A0A0A',
            emphasis: '#353535',
          },
          border: {
            DEFAULT: '#1f2937', // gray-800
          },
          ring: {
            DEFAULT: '#1f2937', // gray-800
          },
          content: {
            subtle: '#4b5563', // gray-600
            DEFAULT: '#C6C6C6', // gray-500
            emphasis: '#e5e7eb', // gray-200
            strong: '#f9fafb', // gray-50
            inverted: '#000000', // black
          },
        },
      },
      boxShadow: {
        // light
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        // dark
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
      },
      fontSize: {
        'tremor-label': ['0.75rem'],
        'tremor-default': ['0.875rem', { 
          lineHeight: '1.25rem',
          fontFamily: ['Roboto', 'sans-serif']
        }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['24px', { 
          lineHeight: '20px',
          fontFamily: ['Roboto Mono', 'monospace'],
          fontWeight: '400',
          fontStyle: 'normal'
        }],
        'tremor-metric-xl': ['48px', { 
          lineHeight: '48px',
          fontFamily: ['Roboto Mono', 'monospace'],
          fontWeight: '400',
          fontStyle: 'normal'
        }],
        'tremor-tab': ['14px', { lineHeight: '20px' }], // custom tab font size
      },
      // Add Tremor chart styles
      tremor: {
        chart: {
          axis: {
            label: {
              color: '#C6C6C6',
            },
          },
        },
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    // Add custom colors to safelist using flatMap
    ...['#27F795', '#27F795CC', '#27F79599', '#27F79566', '#27F79533'].flatMap((customColor) => [
      `bg-[${customColor}]`,
      `border-[${customColor}]`,
      `hover:bg-[${customColor}]`,
      `hover:border-[${customColor}]`,
      `hover:text-[${customColor}]`,
      `fill-[${customColor}]`,
      `ring-[${customColor}]`,
      `stroke-[${customColor}]`,
      `text-[${customColor}]`,
      `ui-selected:bg-[${customColor}]`,
      `ui-selected:border-[${customColor}]`,
      `ui-selected:text-[${customColor}]`,
    ]),
  ],
  plugins: [],
} 