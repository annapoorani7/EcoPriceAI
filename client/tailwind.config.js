/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#2E7D32',
        sky: '#4FC3F7',
        orange: '#FF9800',
        mist: '#F5F7F4',
        slate: '#163127',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(46, 125, 50, 0.25)',
      },
    },
  },
  plugins: [],
};
