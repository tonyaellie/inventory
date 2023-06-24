import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';
import Image from 'next/image';

const Home = () => {
  const items = api.getItems.useQuery();
  const deleteItem = api.deleteItem.useMutation();

  // TODO: add loading, error
  if (!items.data) return <Layout>Loading...</Layout>;

  // TODO: implement sorting and filtering, store in url

  return (
    <Layout>
      <div className="flex flex-col gap-2">
        {
          // TODO: format good
          items.data?.map((item) => (
            <div key={item.id} className="flex justify-between">
              <Image
                src={item.image}
                alt={item.name}
                width={100}
                height={100}
              />
              <div className="flex flex-col">
                <span>{`${item.name} - ${item.category}`}</span>
                <span>{`${item.quantity}× - Bag ${item.bag}`}</span>
                <span>{item.description}</span>
              </div>
              <button
                // TODO: add confirmation
                // TODO: add edit
                // TODO: add loading, error and proper async
                onClick={() =>
                  void deleteItem
                    .mutateAsync({
                      id: item.id,
                    })
                    .then(() => {
                      void items.refetch();
                    })
                }
                className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
              >
                Delete
              </button>
            </div>
          ))
        }
      </div>
    </Layout>
  );
};

export default Home;
