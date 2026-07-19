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
        // red.DEFAULT = --accent-brand (эталон из логотипа, см. index.css) —
        // значение продублировано здесь т.к. классы bg-red/text-red/shadow-cta
        // используются в компонентах, ещё не мигрированных на токен accent-brand.
        red: {
          DEFAULT: '#dc0f2d',
          dark: '#b70c25',
          glow: 'rgba(220,15,45,0.15)',
        },
        whatsapp: '#25d166',
        // ─── Семантические токены темы (Этап 2) — роль, не значение ───────
        // Использовать в новых/мигрируемых компонентах вместо bg-black,
        // text-white и т.п., чтобы текст и фон не сливались при смене темы.
        // rgb(var(--x-rgb) / <alpha-value>) — так Tailwind умеет применять
        // модификаторы прозрачности (bg-bg/95) к CSS-переменным.
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        'text-base': 'rgb(var(--text-rgb) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        line: 'rgb(var(--line-rgb) / <alpha-value>)',
        'accent-brand': 'rgb(var(--accent-brand-rgb) / <alpha-value>)',
        'accent-brand-text': 'rgb(var(--accent-brand-text-rgb) / <alpha-value>)',
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
      // Острые углы — фирменный стиль (План правок №2, A1). Вся шкала — 0,
      // кроме full: он используется под функциональные круги (аватары,
      // точки-индикаторы, тумблеры), не под скругление карточек/кнопок.
      borderRadius: {
        'none': '0px',
        'sm': '0px',
        'DEFAULT': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '9999px',
        'badge': '0px',
        'input': '0px',
        'button': '0px',
        'card': '0px',
        'panel': '0px',
        'pill': '0px',
      },
      spacing: {
        '18': '72px',
      },
      boxShadow: {
        'cta': 'rgba(220,15,45,0.3) 0px 0px 0px 1.5px, rgba(220,15,45,0.15) 0px 4px 12px 0px',
        'card': '0px 1px 0px 0px rgba(255,255,255,0.04) inset',
        'focus': '0 0 0 3px rgba(220,15,45,0.25)',
        'red-glow': '0 0 40px rgba(220,15,45,0.1)',
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
