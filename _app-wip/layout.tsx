export const metadata = {
  title: 'RELUXE Med Spa',
  description: 'RELUXE Med Spa — Premium aesthetic services in Indiana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
