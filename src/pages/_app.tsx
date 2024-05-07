import { type AppType } from 'next/app';
import Head from 'next/head';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '@/utils/api';

import '@/styles/globals.css';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <script
          defer
          data-domain="inventory.tokia.dev"
          src="https://ingest.tokia.dev/js/script.js"
        ></script>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
