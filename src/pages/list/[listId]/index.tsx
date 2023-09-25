import { type FormEvent, useState } from 'react';

import { TRPCClientError, type TRPCClientErrorLike } from '@trpc/client';
import { type UseTRPCQueryResult } from '@trpc/react-query/shared';
import { type inferRouterOutputs } from '@trpc/server';
import Fuse from 'fuse.js';
import Image from 'next/image';
import Link from 'next/link';

import { Layout } from '@/components/Layout';
import { type AppRouter } from '@/server/api/root';
import { api } from '@/utils/api';
import { useListId } from '@/utils/useId';

type ListQuery = UseTRPCQueryResult<
  inferRouterOutputs<AppRouter>['getList'],
  TRPCClientErrorLike<AppRouter>
>;

type Item = NonNullable<ListQuery['data']>['items'][number];

const ItemDisplay = ({
  item,
  list,
  filter,
  setFilter,
  listId,
}: {
  item: Item;
  list: ListQuery;
  filter: {
    category?: number;
    bag?: number;
    packed?: boolean;
  };
  setFilter: (filter: {
    category?: number;
    bag?: number;
    packed?: boolean;
  }) => void;
  listId: number;
}) => {
  const deleteItem = api.deleteItem.useMutation();
  const updateItem = api.updateItem.useMutation();

  const [showEdit, setShowEdit] = useState(false);
  const [editState, setEditState] = useState({
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    quantity: item.quantity,
    bag: item.bag,
    packed: item.packed,
  });
  const deleteClicked = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteItem.mutateAsync({ id: item.id });
      await list.refetch();
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
      // TODO: enable this
      await updateItem.mutateAsync({ id: item.id, listId, ...editState });
      await list.refetch();
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
          <Image
            src={`https://utfs.io/f/${item.image}`}
            alt={item.name}
            width={100}
            height={100}
          />
          <div className="mx-2 flex flex-col">
            <div className="flex gap-2">
              <span className="font-bold">{item.name}</span>
              <span>{item.quantity}×</span>
            </div>
            <div className="flex select-none flex-wrap gap-2">
              <span
                className={`cursor-pointer rounded-lg px-2 capitalize ${
                  filter.category === item.categoryId
                    ? 'bg-purple-900'
                    : 'bg-purple-700'
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    category:
                      filter.category === item.categoryId
                        ? undefined
                        : item.categoryId,
                  });
                }}
              >
                {list.data?.categories.find((c) => c.id === item.categoryId)
                  ?.name || 'Unknown'}
              </span>
              <span
                className={`cursor-pointer rounded-lg px-2 ${
                  filter.bag === item.bag ? 'bg-violet-900' : 'bg-violet-700'
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    bag: filter.bag === item.bag ? undefined : item.bag,
                  });
                }}
              >
                Bag {item.bag}
              </span>
              <span
                className={`cursor-pointer rounded-lg px-2 ${
                  filter.packed === item.packed
                    ? 'bg-fuchsia-900'
                    : 'bg-fuchsia-700'
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    packed:
                      filter.packed === item.packed ? undefined : item.packed,
                  });
                }}
              >
                {item.packed ? 'Packed' : 'Unpacked'}
              </span>
            </div>
            <div>{item.description}</div>
          </div>
        </div>
        <div className="flex h-full flex-col gap-2">
          <button
            onClick={() => void deleteClicked()}
            className="rounded border border-slate-200 px-2 py-1 hover:bg-red-600"
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
                categoryId: Number(e.target.value),
              })
            }
            value={editState.categoryId}
          >
            {list.data?.categories.map((category) => (
              <option
                value={category.id}
                key={`category-${category.id}-option`}
                className="bg-black"
              >
                {category.name}
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bag) => (
              <option
                value={bag}
                key={`bag-${bag}-select`}
                className="bg-black"
              >
                {bag}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-bold">
          Packed
          <input
            type="checkbox"
            name="packed"
            className="h-6 w-6"
            onChange={(e) =>
              setEditState({ ...editState, packed: e.target.checked })
            }
            checked={editState.packed}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

const Home = () => {
  const [filter, setFilter] = useState<{
    category?: number;
    bag?: number;
    packed?: boolean;
  }>({});
  const [search, setSearch] = useState<string>('');

  const listId = useListId();

  const list = api.getList.useQuery(
    { listId: listId || -1, includeCategories: true, includeItems: true },
    {
      enabled: !!listId,
    }
  );

  if (!listId) return <Layout>Loading Id...</Layout>;

  if (list.error) return <Layout>Error: {list.error.message}</Layout>;

  if (!list.data) return <Layout>Loading...</Layout>;

  const fuse = new Fuse(list.data.items, {
    keys: ['name', 'description'],
  }).search(search);

  const filteredItems = (
    fuse.length === 0 ? list.data.items : fuse.map((item) => item.item)
  )?.filter(
    (item) =>
      (!filter.category || item.categoryId === filter.category) &&
      (!filter.bag || item.bag === filter.bag) &&
      (filter.packed === undefined || item.packed === filter.packed)
  );

  return (
    <Layout>
      <div className="flex flex-col items-center gap-2">
        <div>
          <label>
            Search
            <input
              type="text"
              className="ml-2 rounded border bg-black px-2 py-1"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </label>
        </div>
        <div className="flex select-none flex-col gap-2 rounded-lg bg-black p-2">
          <div className="flex flex-wrap gap-2">
            {list.data.categories.map((category) => (
              <span
                key={`category-${category.id}`}
                className={`cursor-pointer rounded-lg px-2 capitalize ${
                  filter.category === category.id
                    ? 'bg-violet-900'
                    : 'bg-violet-700'
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    category:
                      filter.category === category.id ? undefined : category.id,
                  });
                }}
              >
                {category.name.toLowerCase()}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`cursor-pointer rounded-lg px-2 ${
                  filter.bag === i + 1 ? 'bg-purple-900' : 'bg-purple-700'
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    bag: filter.bag === i + 1 ? undefined : i + 1,
                  });
                }}
              >
                Bag {i + 1}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <span
              className={`cursor-pointer rounded-lg px-2 ${
                filter.packed === true ? 'bg-fuchsia-900' : 'bg-fuchsia-700'
              }`}
              onClick={() => {
                setFilter({
                  ...filter,
                  packed: filter.packed === true ? undefined : true,
                });
              }}
            >
              Packed
            </span>
            <span
              className={`cursor-pointer rounded-lg px-2 ${
                filter.packed === false ? 'bg-fuchsia-900' : 'bg-fuchsia-700'
              }`}
              onClick={() => {
                setFilter({
                  ...filter,
                  packed: filter.packed === false ? undefined : false,
                });
              }}
            >
              Unpacked
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <Link
            href={`/list/${list.data.id}/add`}
            className="text-blue-500 hover:underline"
          >
            Add item
          </Link>
          <Link
            href={`/list/${list.data.id}/edit`}
            className="text-blue-500 hover:underline"
          >
            Edit list
          </Link>
        </div>
        <div className="flex w-full flex-col gap-2">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col text-center text-2xl font-bold">
              No items found
              <div>
                <Link
                  href={`/list/${list.data.id}/add`}
                  className="text-blue-500 hover:underline"
                >
                  Add one?
                </Link>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemDisplay
                item={item}
                list={list}
                filter={filter}
                setFilter={setFilter}
                listId={listId}
                key={item.id}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
