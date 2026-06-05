/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Official brand tokens
        gold:     '#C5A059',
        offwhite: '#FAFAFA',
        charcoal: '#2A2A2A',
        mint:     '#C6E2D4',
        beige:    '#F2E7DB',
        // Ported design-reference palette
        ivory:    '#f7f2e9',
        cream:    '#efe6d6',
        paper:    '#fbf8f1',
        gold2:    '#d9bd7e',
        gold3:    '#8c6f2a',
        goldSoft: '#e7cd8f',
        mint2:    '#8cc6ab',
        mintDeep: '#4f8e74',
        forest:   '#2c4a3c',
        ink:      '#26241f',
        muted:    '#7a7367',
        line:     'rgba(140,111,42,0.18)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans:  ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
