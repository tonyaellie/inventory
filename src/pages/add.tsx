import { signIn, signOut, useSession } from 'next-auth/react';
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
      });
    } catch (e) {
      // TODO: handle error better
      if (e instanceof TRPCClientError) {
        alert(e.message);
      }
    }
  };

  return (
    <form className="flex max-w-xl flex-col" onSubmit={(e) => {
      void submit(e);
    }}>
      <label>
        Name:
        <input
          type="text"
          name="itemname"
          className="bg-black"
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          value={formState.name}
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          className="bg-black"
          onChange={(e) =>
            setFormState({ ...formState, description: e.target.value })
          }
          value={formState.description}
        />
      </label>
      <label>
        Image:
        <ImageUploader
          image={formState.image}
          setImage={(image) => setFormState({ ...formState, image })}
        />
      </label>
      <label>
        Category:
        <select
          className="bg-black"
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
      <label>
        Quantity:
        <input
          type="number"
          name="quantity"
          className="bg-black"
          onChange={(e) =>
            setFormState({ ...formState, quantity: Number(e.target.value) })
          }
          value={formState.quantity}
        />
      </label>
      <label>
        Bag:
        <select
          className="bg-black"
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
