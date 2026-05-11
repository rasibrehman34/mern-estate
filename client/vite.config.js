// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({

//   server: {
//     port: 3001,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3000',
//         secure: false,
//       },
//     },
//   },


//   plugins: [
//     tailwindcss(),
//     react()
//   ],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true,


    watch: {
      usePolling: true,
      interval: 100,
    },

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
    },
  },

  plugins: [
    tailwindcss(),
    react(),
  ],
})