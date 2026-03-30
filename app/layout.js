import './globals.css'

export const metadata = {
  title: 'Dental Medrano Training — Cursos',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
