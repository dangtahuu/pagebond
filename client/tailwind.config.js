/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    mode: "jit",
    content: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
    theme: {
        extends: {
            backgroundImage: {
                space: "url('/images/bg.png')",
            },
        },
        extend: {
            colors: {
                navBar: '#14181c',
                mainbg: '#1c2127',
                dialogue: '#445566',
                smallText: '#99aabb',
                mainText: '#ccd7ff',
                greenBtn: '#00a11d',
                altDialogue: '#2c3440',
                inputBg: '#ccddee',
              }
        }
      
    },
    variants: {
        scrollbar: ["dark"],
    },
    plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar"), require('@tailwindcss/typography')],
};
