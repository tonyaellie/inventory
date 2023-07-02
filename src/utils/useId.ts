import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export const useListId = () => {
  const [id, setId] = useState<number | undefined>(undefined);

  const router = useRouter();

  useEffect(() => {
    const { listId } = router.query;
    if (typeof listId === 'string' && !Number.isInteger(Number(listId)))
      setId(undefined);
    else setId(Number(listId));
  }, [router.query]);

  return id;
};
