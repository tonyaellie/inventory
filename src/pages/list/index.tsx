import Link from 'next/link';

import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';

const Home = () => {
  const lists = api.getLists.useQuery();

  return (
    <Layout>
      <div className="flex flex-col gap-2">
        {lists.data?.map((list) => (
          <Link
            // TODO: add delete button
            href={`/list/${list.id}`}
            key={list.id}
            className="rounded-lg border bg-black px-2 py-1 font-normal hover:cursor-pointer hover:bg-slate-900"
          >
            {list.name}
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
