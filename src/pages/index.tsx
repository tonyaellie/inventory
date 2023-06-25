import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';
import { Category } from '@prisma/client';
import Image from 'next/image';
import { type FormEvent, useState } from 'react';
import Fuse from 'fuse.js';
import { TRPCClientError } from '@trpc/client';

const Home = () => {
  const [filter, setFilter] = useState<{
    category?: Category;
    bag?: number;
  }>({});
  const [search, setSearch] = useState<string>('');

  const items = api.getItems.useQuery();

  const ItemDisplay = (item: {
    id: number;
    name: string;
    description: string;
    image: string;
    category: Category;
    quantity: number;
    bag: number;
  }) => {
    const [showEdit, setShowEdit] = useState(false);
    const [editState, setEditState] = useState({
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      bag: item.bag,
    });

    const deleteItem = api.deleteItem.useMutation();
    const updateItem = api.updateItem.useMutation();

    const deleteClicked = async () => {
      try {
        await deleteItem.mutateAsync({ id: item.id });
        await items.refetch();
      } catch (e) {
        // TODO: handle error better
        if (e instanceof TRPCClientError) {
          alert(e.message);
        }
      }
    };

    const updateClicked = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await updateItem.mutateAsync({ id: item.id, ...editState });
        await items.refetch();
      } catch (e) {
        // TODO: handle error better
        if (e instanceof TRPCClientError) {
          alert(e.message);
        }
      }
    };

    return (
      <div>
        <div className="flex justify-between">
          <div className="flex">
            <Image src={item.image} alt={item.name} width={100} height={100} />
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
          <div className="flex h-full flex-col gap-2">
            <button
              onClick={() => void deleteClicked()}
              className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setShowEdit(!showEdit);
              }}
              className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-200 hover:text-slate-900"
            >
              Edit
            </button>
          </div>
        </div>
        <form
          className={showEdit ? 'flex flex-col gap-2' : 'hidden'}
          onSubmit={(e) => {
            void updateClicked(e);
          }}
        >
          <label className="flex flex-col gap-1 font-bold">
            Name
            <input
              autoComplete="off"
              type="text"
              name="itemname"
              className="w-full rounded-lg bg-black px-2 py-1 font-normal"
              onChange={(e) =>
                setEditState({ ...editState, name: e.target.value })
              }
              value={editState.name}
            />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Description
            <textarea
              name="description"
              className="h-48 resize-none rounded-lg bg-black px-2 py-1 font-normal"
              onChange={(e) =>
                setEditState({ ...editState, description: e.target.value })
              }
              value={editState.description}
            />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Category
            <select
              className="rounded-lg bg-black px-2 py-1 font-normal"
              onChange={(e) =>
                setEditState({
                  ...editState,
                  category: e.target.value as Category,
                })
              }
              value={editState.category}
            >
              {Object.keys(Category).map((category) => (
                <option value={category} key={category} className="bg-black">
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Quantity
            <input
              type="text"
              name="quantity"
              className="rounded-lg bg-black px-2 py-1 font-normal"
              onChange={(e) => {
                if (Number(e.target.value) > 0 || e.target.value === '') {
                  setEditState({
                    ...editState,
                    quantity:
                      e.target.value === ''
                        ? ('' as unknown as number)
                        : Number(e.target.value),
                  });
                }
              }}
              value={editState.quantity}
            />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Bag
            <select
              className="rounded-lg bg-black px-2 py-1 font-normal"
              onChange={(e) =>
                setEditState({ ...editState, bag: Number(e.target.value) })
              }
              value={editState.bag}
            >
              <option value={1} className="bg-black">
                1
              </option>
              <option value={2} className="bg-black">
                2
              </option>
              <option value={3} className="bg-black">
                3
              </option>
              <option value={4} className="bg-black">
                4
              </option>
            </select>
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  };

  if (items.error) return <Layout>Error: {items.error.message}</Layout>;

  if (!items.data) return <Layout>Loading...</Layout>;

  const fuse = new Fuse(items.data, {
    keys: ['name', 'description'],
  }).search(search);

  return (
    <Layout>
      <div>
        <label>
          Search
          <input
            type="text"
            className="mb-2 ml-2 rounded border bg-black px-2 py-1"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </label>
      </div>
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
        {(fuse.length === 0 ? items.data : fuse.map((item) => item.item))
          ?.filter(
            (item) =>
              (!filter.category || item.category === filter.category) &&
              (!filter.bag || item.bag === filter.bag)
          )
          .map((item) => (
            <ItemDisplay {...item} key={item.id} />
          ))}
      </div>
    </Layout>
  );
};

export default Home;
