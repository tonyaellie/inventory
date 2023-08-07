import { createUploadthing, type FileRouter } from 'uploadthing/next-legacy';

import { auth } from '@/utils/auth';

import { prisma } from './db';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '32MB', maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const user = await auth(req, res);

      console.log('user', user);

      // FIXME: auth is not working, so we're just going to allow all uploads for now

      // If you throw, the user will not be able to upload
      // if (user?.user?.name !== 'tonya_') throw new Error('Unauthorized');

      // This is passed to onUploadComplete as metadata
      return {};
    })
    .onUploadComplete(({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('file url', file.url);
      void prisma.unusedImages.create({
        data: {
          id: file.key,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
