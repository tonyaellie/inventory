import { useSession, signOut, signIn } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>{`Ell's Inventory Manager`}</title>
        <meta name="description" content="manage my inventory 🤷‍♀️" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="text-slate-200">
        <header className="mb-2 flex gap-2 border-b border-slate-200 p-2">
          <button
            className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
          <button
            className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
          <Link href="/add/" className=''>Add item</Link>
        </header>
        {sessionData?.user.name === 'tonya_' ? (
          <div className="mx-4">{children}</div>
        ) : (
          <div className="mx-4">sign in as authorised user</div>
        )}
      </main>
    </>
  );
};
