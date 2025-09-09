import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ro-RO" data-locale="ro-RO">
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Language" content="ro-RO" />
        <meta name="format-detection" content="date=dd/mm/yyyy" />
        <meta name="locale" content="ro-RO" />
        <meta name="date-format" content="dd/mm/yyyy" />
        <meta name="time-format" content="24h" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <meta name="description" content="Transio - Sistem de Management Transport Marfă" />
        <meta name="keywords" content="transport, marfă, logistică, management, TMS" />
        <meta name="author" content="Transio" />
        
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="Transio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Transio" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
      </Head>
      <body className="antialiased" data-locale="ro-RO" data-date-format="dd/mm/yyyy" data-time-format="24h">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}