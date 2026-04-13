/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-primary': '#334155',
        'brand-accent': '#3b82f6',
        'surface': '#ffffff',
        'background': '#f8fafc',
        'success-soft': '#dcfce7',
        'success': '#15803d',
        'error-soft': '#fee2e2',
        'error': '#b91c1c',
        'warning-soft': '#fef3c7',
        'warning': '#b45309'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
