// setup.mjs — crea la estructura de carpetas del frontend
// Ejecutar con: node setup.mjs
import { mkdirSync } from 'fs'

const dirs = [
  'src/types',
  'src/lib',
  'src/router',
  'src/pages',
  'src/components/layout',
  'src/components/ui',
  'src/features/auth/components',
  'src/features/auth/hooks',
  'src/features/auth/store',
  'src/features/auth/api',
  'src/features/auth/schemas',
  'src/features/tickets/components',
  'src/features/tickets/hooks',
  'src/features/tickets/api',
  'src/features/tickets/schemas',
  'src/features/tickets/store',
  'src/features/comments/components',
  'src/features/comments/hooks',
  'src/features/comments/api',
  'src/features/dashboard/components',
  'src/features/dashboard/hooks',
  'src/features/dashboard/api',
  'src/features/admin/components',
  'src/features/admin/hooks',
  'src/features/admin/api',
  'src/features/admin/schemas',
]

dirs.forEach(d => {
  mkdirSync(d, { recursive: true })
  console.log('✓', d)
})

console.log('\n✅ Estructura de carpetas lista. Ahora ejecuta: npm install')
