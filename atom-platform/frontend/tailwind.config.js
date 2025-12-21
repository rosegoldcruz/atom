/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ATOM Brand Colors
        'atom-primary': '#1a1a2e',
        'atom-secondary': '#16213e',
        'atom-accent': '#0f3460',
        'atom-highlight': '#e94560',
        'atom-success': '#00d4aa',
        'atom-warning': '#ff9f43',
        'atom-error': '#ff4757',
        'atom-info': '#3742fa',
        
        // Status colors
        'status-live': '#00d4aa',
        'status-paused': '#ff9f43',
        'status-protected': '#ff4757',
        'status-degraded': '#ffa502',
        
        // Data visualization
        'data-primary': '#3742fa',
        'data-secondary': '#ff6348',
        'data-tertiary': '#2ed573',
        'data-quaternary': '#ffa502',
      },
      fontFamily: {
        'atom': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}