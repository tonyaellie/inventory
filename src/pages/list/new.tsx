import { useState } from 'react';

import { TRPCClientError } from '@trpc/client';

import { Layout } from '@/components/Layout';
import { ListEditor } from '@/components/ListEditor';
import { api } from '@/utils/api';

const New = () => {
  const [config, setConfig] = useState({
    name: '',
    categories: [] as string[],
  });

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
      <ListEditor
        handleSubmit={handleSubmit}
        config={config}
        setConfig={setConfig}
        editable={typeof window !== 'undefined'}
      />
    </Layout>
  );
};

export default New;
