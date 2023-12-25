import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: {
          DEFAULT: '#C850C0',
          dark: '#A3419D',
        },
        secondary: {
          DEFAULT: '#4158D0',
        },
        tertiary: {
          DEFAULT: '#FFCC70',
        },
        black: {
          100: '#170316',
          75: '#514250',
          65: '#685B68',
          50: '#8B818A',
          25: '#C5C0C5',
          10: '#E8E6E8',
          5: '#F3F2F3',
        },
        online: {
          DEFAULT: '#5AD539',
        },
      },
    },
  },
  plugins: [],
}
export default config
