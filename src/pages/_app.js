import '../styles/globals.css'
import '../styles/pagination.scss'
import { ThemeProvider } from 'next-themes'
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import Head from 'next/head'
import Layout from '../components/layout/layout'
import React from 'react'
import { WagmiConfig } from 'wagmi'
import { wagmiConfig } from '../components/walletComponents/connectors'
import { CookiesProvider } from "react-cookie";
import Widget from './widget'

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_ENDPOINT,
  cache: new InMemoryCache(),
});

function App({ Component, pageProps }) {

  return (
    <CookiesProvider>
      <ThemeProvider enableSystem={true} attribute="class">
        <ApolloProvider client={client}>
          <WagmiConfig config={wagmiConfig}>
            <Layout>
              <Head>
                <link rel="icon" href="favicon.png" />
                {/* <link href="https://www.cdnfonts.com/helvetica-neue-55.font" rel="canonical" /> */}
                {/* <link href="https://fonts.cdnfonts.com/css/helvetica-neue-55" rel="stylesheet" /> */}
                <link rel="preconnect" href="https://fonts.googleapis.com"></link>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"></link>
                <link href="https://fonts.googleapis.com/css2?family=Abel&display=swap" rel="stylesheet"></link>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Diamond Swap</title>
              </Head>
              <Component {...pageProps} />
            </Layout>
          </WagmiConfig>
        </ApolloProvider>
      </ThemeProvider>
    </CookiesProvider>
  )
}

export default App
