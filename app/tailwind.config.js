/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000001',
        coal: '#0a0a0a',
        cinder: '#141414',
        ash: '#1f1f1f',
        graphite: '#3a3a3a',
        steel: '#6b6b6b',
        fog: '#a8a8a8',
        silver: '#d4d4d4',
        snow: '#ffffff',
        red: {
          DEFAULT: '#db1f26',
          dark: '#b81920',
          glow: 'rgba(219,31,38,0.15)',
        },
        whatsapp: '#25d166',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        formular: ['Formular', 'Helvetica Neue', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'caption': ['11px', { lineHeight: '1.7' }],
        'label': ['13px', { lineHeight: '1.5' }],
        'body': ['14px', { lineHeight: '1.6' }],
        'body-lg': ['16px', { lineHeight: '1.55' }],
        'subheading': ['18px', { lineHeight: '1.45' }],
        'heading-sm': ['20px', { lineHeight: '1.35' }],
        'heading': ['24px', { lineHeight: '1.3' }],
        'heading-md': ['32px', { lineHeight: '1.25' }],
        'heading-lg': ['40px', { lineHeight: '1.2' }],
        'display-sm': ['56px', { lineHeight: '1.1' }],
        'display': ['72px', { lineHeight: '1.0' }],
        'display-xl': ['80px', { lineHeight: '1.0' }],
      },
      borderRadius: {
        'badge': '0px',
        'input': '0px',
        'button': '0px',
        'card': '0px',
        'panel': '0px',
        'pill': '0px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '18': '72px',
      },
      boxShadow: {
        'cta': 'rgba(219,31,38,0.3) 0px 0px 0px 1.5px, rgba(219,31,38,0.15) 0px 4px 12px 0px',
        'card': '0px 1px 0px 0px rgba(255,255,255,0.04) inset',
        'focus': '0 0 0 3px rgba(219,31,38,0.25)',
        'red-glow': '0 0 40px rgba(219,31,38,0.1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        "pulse-cta": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blink": "blink 1s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "pulse-cta": "pulse-cta 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
