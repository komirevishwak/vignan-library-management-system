/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6fe',
          100: '#ddecfc',
          200: '#c3ddfb',
          300: '#9ac6f8',
          400: '#6aa6f3',
          500: '#4484ee',
          600: '#2f66e3',
          700: '#254fd0',
          800: '#2341a9',
          900: '#213985',
          950: '#142251',
        },
      },
    },
  },
  plugins: [],
};
