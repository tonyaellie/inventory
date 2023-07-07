import { useEffect, useState } from 'react';

import { TRPCClientError } from '@trpc/client';

import { Layout } from '@/components/Layout';
import { ListEditor } from '@/components/ListEditor';
import { api } from '@/utils/api';
import { useListId } from '@/utils/useId';

const Edit = () => {
  const listId = useListId();

  const [config, setConfig] = useState({
    name: '',
    categories: [] as string[],
  });

  const list = api.getList.useQuery(
    { listId: listId || -1, includeCategories: true, includeItems: true },
    {
      enabled: !!listId,
    }
  );
  const updateList = api.updateList.useMutation();

  useEffect(() => {
    if (!list.data) return;
    setConfig({
      name: list.data.name,
      categories: list.data.categories.map((category) => category.name), // TODO: use both id and name
    });
  }, [list.data]);

  if (!listId) return <Layout>Loading Id...</Layout>;

  if (list.error) return <Layout>Error: {list.error.message}</Layout>;

  if (!list.data) return <Layout>Loading...</Layout>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // check if category being removed is in use
    const categoriesInUse = list.data?.items
      .map((item) => list.data?.categories[item.categoryId]?.name || '')
      .filter((category) => !config.categories.includes(category)) || []; // FIXME: this doesnt work, luckily the backend will catch it
    if (categoriesInUse.length > 0) {
      alert(
        `Cannot remove categories that are in use: ${categoriesInUse.join(
          ', '
        )}`
      );
      return;
    }

    try {
      await updateList.mutateAsync({
        listId,
        name: config.name,
        categoriesAdded: config.categories.filter(
          (category) =>
            !list.data?.categories
              .map((category) => category.name)
              .includes(category)
        ),
        categoriesRemoved:
          list.data?.categories
            .map((category) => category.name)
            .filter((category) => !config.categories.includes(category)) || [],
      });
      await list.refetch();
    } catch (e) {
      // TODO: handle error better
      if (e instanceof TRPCClientError) {
        alert(e.message);
      }
    }
  };

  return (
    <Layout>
      <ListEditor
        handleSubmit={handleSubmit}
        config={config}
        setConfig={setConfig}
        editable={typeof window !== 'undefined' && !!list.data}
      />
    </Layout>
  );
};

export default Edit;
