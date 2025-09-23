import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ✅ OPTIMIZED: Use CSS variables for fonts
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      // ✅ OPTIMIZED: Font display utilities
      fontDisplay: {
        'swap': 'swap',
        'fallback': 'fallback',
        'optional': 'optional',
      }
    },
  },
  plugins: [],
}
export default config
