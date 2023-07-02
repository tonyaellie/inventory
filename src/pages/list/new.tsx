import { useState } from 'react';

import { TRPCClientError } from '@trpc/client';

import { Layout } from '@/components/Layout';
import { api } from '@/utils/api';

const New = () => {
  const [config, setConfig] = useState({
    name: '',
    categories: [] as string[],
  });
  const [newCategory, setNewCategory] = useState('');

  const addList = api.createList.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (config.name === '' || config.categories.length === 0) {
      return;
    }
    try {
      await addList.mutateAsync(config);
      setConfig({
        name: '',
        categories: [],
      });
    } catch (e) {
      // TODO: handle error better
      if (e instanceof TRPCClientError) {
        alert(e.message);
      }
    }
  };

  return (
    <Layout>
      <form onSubmit={(e) => void handleSubmit(e)} id="new-list" />
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 font-bold">
          Name
          <input
            className="w-full rounded-lg bg-black px-2 py-1 font-normal"
            // not sure if this works
            disabled={typeof window === 'undefined'}
            type="text"
            name="name"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            form="new-list"
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-2 font-bold">
          Categories
          <div className="flex flex-wrap gap-2">
            {config.categories.map((category, index) => (
              <div
                className="rounded-lg border bg-black px-2 py-1 font-normal hover:cursor-pointer hover:bg-red-600"
                key={index}
                onClick={() =>
                  setConfig({
                    ...config,
                    categories: config.categories.filter((_, i) => i !== index),
                  })
                }
              >
                {category}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (config.categories.includes(newCategory)) {
                return;
              }
              setConfig({
                ...config,
                categories: [...config.categories, newCategory],
              });
              setNewCategory('');
            }}
          >
            <input
              className={`w-full rounded-lg bg-black px-2 py-1 font-normal outline-none focus:border ${
                newCategory === '' || config.categories.includes(newCategory)
                  ? 'border-red-600'
                  : 'border-black'
              }`}
              // not sure if this works
              disabled={typeof window === 'undefined'}
              type="text"
              name="newCategory"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              autoComplete="off"
            />
            <input
              type="submit"
              value="Add"
              className="rounded-lg border bg-black px-2 py-1 font-normal"
            />
          </form>
        </label>
        <input
          type="submit"
          value="Submit"
          form="new-list"
          className={`rounded-lg border bg-black px-2 py-1 font-normal ${
            config.name === '' || config.categories.length === 0
              ? 'cursor-not-allowed border-red-600'
              : 'hover:cursor-pointer'
          }`}
        />
      </div>
    </Layout>
  );
};

export default New;
