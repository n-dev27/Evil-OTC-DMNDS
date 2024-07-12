const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['Roboto','sans-serif'],
        'helveticaneue': 'HelveticaNeue',
        
      },
    },
    screens: {
      ssm: "540px",
      // => @media (min-width: 540px) { ... }

      sm: "650px",
      // => @media (min-width: 650px) { ... }

      md: "720px",
      // => @media (min-width: 720px) { ... }

      lg: "940px",
      // => @media (min-width: 940px) { ... }

      llg: "1000px",
      // => @media (min-width: 1000px) { ... }

      xl: "1140px",
      // => @media (min-width: 1140px) { ... }

      mmxl: "1210px",

      mxl: "1290px",
      // => @media (min-width: 1290px) { ... }

      xxl: "1360px",
      // => @media (min-width: 1360px) { ... }

      lp: "1440px",
      // => @media (min-width: 1440px) { ... }

      xxxl: "1620px",
      // => @media (min-width: 1620px) { ... }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
