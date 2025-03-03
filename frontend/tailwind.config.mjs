// tailwind.config.mjs
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx,css}',
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
    './config/**/*.{js,ts,jsx,tsx,mdx,css}',
    './types/**/*.{js,ts,jsx,tsx,mdx,css}',
    './styles/**/*.{js,ts,jsx,tsx,mdx,css}'
  ],
  theme: {
    extend: {
      cursor: {
        wait: 'wait'
      },
      colors: {
        lightBlue: colors.sky,
        warmGray: colors.stone,
        trueGray: colors.neutral,
        coolGray: colors.gray,
        blueGray: colors.slate,
        error: 'rgba(255, 0, 0, 0.1)',
        autoFillCorrection: 'aqua'
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-10px)' },
          '40%, 80%': { transform: 'translateX(10px)' }
        },
        pulse: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 128, 0, 0.7)' },
          '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(0, 128, 0, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 128, 0, 0)' }
        },
        rainbowColor: {
          '0%': { color: 'red' },
          '20%': { color: 'orange' },
          '40%': { color: 'yellow' },
          '60%': { color: 'green' },
          '80%': { color: 'blue' },
          '100%': { color: 'purple' }
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)'
          },
          '40%': {
            transform: 'translateY(-30px)'
          },
          '60%': {
            transform: 'translateY(-15px)'
          }
        },
        'fade-blur-in': {
          '0%': { filter: 'blur(0)', opacity: '1' },
          '100%': { filter: 'blur(1px)', opacity: '0.75' }
        },
        'fade-blur-out': {
          '0%': { filter: 'blur(1px)', opacity: '0.75' },
          '100%': { filter: 'blur(0)', opacity: '1' }
        },
        expand: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(1.2)', opacity: 1 }
        },
        shrink: {
          '0%': { transform: 'scale(1.2)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        }
      },
      animation: {
        shake: 'shake 0.5s',
        pulse: 'pulse 2s infinite',
        rainbowColor: 'rainbowColor 6s linear infinite',
        rotate: 'rotate 2s linear infinite',
        bounce: 'bounce 0.5s',
        'fade-blur-in': 'fade-blur-in 0.15s ease forwards',
        'fade-blur-out': 'fade-blur-out 0.15s ease forwards',
        'pulse-no-opacity': 'pulse-no-opacity 2s infinite',
        expand: 'expand 0.3s ease-out forwards',
        shrink: 'shrink 0.3s ease-in forwards'
      },
      textColor: {
        error: 'red',
        null: 'white'
      },
      fontSize: {
        xs: '0.75rem'
      },
      fontWeight: {
        bold: 'bold'
      },
      boxShadow: {
        joyride: '0 0 0 9999px rgba(0, 0, 0, 0.75)'
      }
    }
  },
  darkMode: 'class',
  variants: {},
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities(
        {
          '.tw-wrap-text': {
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          },
          '.fullWidthAutoComplete': {
            width: '100%'
          },
          '.dataGridCell': {
            overflow: 'visible !important'
          },
          '.error-row': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)'
          },
          '.error-cell': {
            textDecoration: 'line-through',
            color: 'red'
          },
          '.null-cell': {
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem'
          },
          '.auto-fill-correction': {
            color: 'aqua'
          },
          '.joyride__spotlight': {
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)'
          },
          '.sub_div': {
            position: 'absolute',
            bottom: '5%',
            left: '35%'
          },
          body: {
            margin: '0'
          },
          '.deprecated': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)' // Light yellow background for deprecated rows
          },
          '@keyframes pulse-no-opacity': {
            '0%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 0 rgba(0, 128, 0, 1)'
            },
            '70%': {
              transform: 'scale(1.2)',
              boxShadow: '0 0 0 30px rgba(0, 128, 0, 0)'
            },
            '100%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 0 rgba(0, 128, 0, 0)'
            }
          }
        },
        ['responsive', 'hover']
      );
    })
  ],
  xwind: {
    mode: 'objectstyles'
  }
};
