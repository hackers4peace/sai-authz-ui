/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Composables
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VSkeletonLoader,
  },
  blueprint: md3,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          agent: '#2196F3',
        },
      },
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          agent: '#2196F3',
        },
      },
    },
  },
})
