import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';

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
      <main className="mx-auto max-w-2xl text-slate-200 accent-purple-700">
        <header className="mb-2 flex gap-2 border-b border-slate-200 p-2">
          <Link
            // TODO: use the cool segments display, steel from uploadthing
            href={sessionData?.user?.name === 'tonya_' ? '/list' : '/'}
            className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
          >
            Home
          </Link>
          <Link
            href="/list/new"
            className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
          >
            New
          </Link>
          <div className="flex-grow" />
          {sessionData?.user?.name === 'tonya_' ? (
            <button
              onClick={() => void signOut()}
              className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => void signIn()}
              className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
            >
              Sign in
            </button>
          )}
        </header>
        {sessionData?.user?.name === 'tonya_' ? (
          <div className="mx-4">{children}</div>
        ) : (
          <div className="mx-4">sign in as authorised user</div>
        )}
      </main>
    </>
  );
};
