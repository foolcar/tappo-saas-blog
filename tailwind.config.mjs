/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
