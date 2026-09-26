/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kratos-dark': '#0f172a',
        'kratos-darker': '#020617',
        'kratos-border': '#1e293b',
        'kratos-text': '#e5e7eb',
        'kratos-text-dim': '#94a3b8',
        'kratos-blue': '#60a5fa',
        'kratos-blue-dark': '#2563eb',
        'kratos-blue-darker': '#1d4ed8',
      },
    },
  },
  plugins: [],
}
