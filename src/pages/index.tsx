import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';
import { type Category } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';

const Home = () => {
  const [filter, setFilter] = useState<{
    category?: Category;
    bag?: number;
  }>({});

  const items = api.getItems.useQuery();
  const deleteItem = api.deleteItem.useMutation();

  // TODO: add loading, error
  if (!items.data) return <Layout>Loading...</Layout>;

  // TODO: implement sorting and filtering, store in url

  return (
    <Layout>
      <div
        className={`flex gap-2 ${filter.category || filter.bag ? 'pb-2' : ''}`}
      >
        {filter.category && (
          <span
            className="cursor-pointer rounded-lg bg-violet-700 px-2 lowercase"
            onClick={() => {
              setFilter({
                ...filter,
                category: undefined,
              });
            }}
          >
            {filter.category}
          </span>
        )}
        {filter.bag && (
          <span
            className="cursor-pointer rounded-lg bg-fuchsia-700 px-2"
            onClick={() => {
              setFilter({
                ...filter,
                bag: undefined,
              });
            }}
          >
            Bag {filter.bag}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {
          // TODO: format good
          // lock text to image
          items.data
            ?.filter(
              (item) =>
                (!filter.category || item.category === filter.category) &&
                (!filter.bag || item.bag === filter.bag)
            )
            .map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                  />
                  <div className="mx-2 flex flex-col">
                    <div className="flex gap-2">
                      <span className="font-bold">{item.name}</span>
                      <span>{item.quantity}×</span>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="cursor-pointer rounded-lg bg-violet-700 px-2 lowercase"
                        onClick={() => {
                          setFilter({
                            ...filter,
                            category: item.category,
                          });
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        className="cursor-pointer rounded-lg bg-fuchsia-700 px-2"
                        onClick={() => {
                          setFilter({
                            ...filter,
                            bag: item.bag,
                          });
                        }}
                      >
                        Bag {item.bag}
                      </span>
                    </div>
                    <div>{item.description}</div>
                  </div>
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
