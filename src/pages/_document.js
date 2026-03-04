import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="scroll-smooth">
        <Head />
        <body className="font-inter relative">
          {/* DNS prefetch for third-party domains */}
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://connect.facebook.net" />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
