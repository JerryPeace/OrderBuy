import React, { useState } from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { Flex, ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from '@@components/Error/ErrorBoundary';
import '../styles/app.css';
import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

function MyApp(props: any) {
  const { Component, pageProps } = props;
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <Hydrate state={pageProps.dehydratedState}>
            <Head>
              <title>Order Buy App</title>
              <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width"
              />
            </Head>
            <ToastContainer />
            <Flex>
              <ErrorBoundary>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <Component {...pageProps} />
              </ErrorBoundary>
            </Flex>
          </Hydrate>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
