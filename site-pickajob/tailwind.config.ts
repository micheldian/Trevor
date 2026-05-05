import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3faf4',
          100: '#e3f4e6',
          200: '#c7e8cd',
          300: '#9ad4a6',
          400: '#65b878',
          500: '#3f9c55',
          600: '#2e7f42',
          700: '#266537',
          800: '#21512f',
          900: '#1c4329',
        },
        wheat: {
          50: '#fdfaf2',
          100: '#faf2dc',
          200: '#f3e2ad',
          300: '#ebcd76',
          400: '#e2b746',
          500: '#d09a26',
          600: '#a87a1d',
          700: '#825d18',
          800: '#5e4311',
          900: '#3d2c0c',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        content: '72rem',
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(15, 60, 30, 0.08)',
        card: '0 8px 30px -12px rgba(15, 60, 30, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
