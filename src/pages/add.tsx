import { api } from '@/utils/api';
import { UploadButton } from '@/utils/uploadthing';
import '@uploadthing/react/styles.css';
import { Category } from '@prisma/client';
import { type FormEvent, useState } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { TRPCClientError } from '@trpc/client';

const ImageUploader = ({
  image,
  setImage,
}: {
  image: string;
  setImage: (image: string) => void;
}) => {
  return image ? (
    <Image src={image} alt="preview" width={64} height={64} />
  ) : (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        // Do something with the response
        console.log('Files: ', res);
        setImage(res![0]!.fileUrl);
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
};

const CreateNewItem = () => {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    image: '',
    category: 'BATHROOM' as Category,
    quantity: 1,
    bag: 1,
    packed: false,
  });
  const addItem = api.addItem.useMutation();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addItem.mutateAsync(formState);
      setFormState({
        name: '',
        description: '',
        image: '',
        category: 'BATHROOM' as Category,
        quantity: 1,
        bag: 1,
        packed: false,
      });
    } catch (e) {
      // TODO: handle error better
      if (e instanceof TRPCClientError) {
        alert(e.message);
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        void submit(e);
      }}
    >
      <label className="flex flex-col gap-1 font-bold">
        Name
        <input
          autoComplete="off"
          type="text"
          name="itemname"
          className="w-full rounded-lg bg-black px-2 py-1 font-normal"
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          value={formState.name}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Description
        <textarea
          name="description"
          className="h-48 resize-none rounded-lg bg-black px-2 py-1 font-normal"
          onChange={(e) =>
            setFormState({ ...formState, description: e.target.value })
          }
          value={formState.description}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Image
        <ImageUploader
          image={formState.image}
          setImage={(image) => setFormState({ ...formState, image })}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Category
        <select
          className="rounded-lg bg-black px-2 py-1 font-normal"
          onChange={(e) =>
            setFormState({ ...formState, category: e.target.value as Category })
          }
          value={formState.category}
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
              setFormState({
                ...formState,
                quantity:
                  e.target.value === ''
                    ? ('' as unknown as number)
                    : Number(e.target.value),
              });
            }
          }}
          value={formState.quantity}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Bag
        <select
          className="rounded-lg bg-black px-2 py-1 font-normal"
          onChange={(e) =>
            setFormState({ ...formState, bag: Number(e.target.value) })
          }
          value={formState.bag}
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
      <label className="flex flex-col gap-1 font-bold">
        Packed
        <input
          type="checkbox"
          name="packed"
          className="h-6 w-6"
          onChange={(e) =>
            setFormState({ ...formState, packed: e.target.checked })
          }
          checked={formState.packed}
        />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
};

const Home = () => {
  return (
    <Layout>
      <CreateNewItem />
    </Layout>
  );
};

export default Home;
