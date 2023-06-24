import { createUploadthing, type FileRouter } from 'uploadthing/next-legacy';
import { authOptions } from './auth';
import { getServerSession } from 'next-auth';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '32MB', maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const user = await getServerSession(req, res, authOptions);

      // If you throw, the user will not be able to upload
      if (user?.user.name !== 'tonya_') throw new Error('Unauthorized');

      // This is passed to onUploadComplete as metadata
      return {};
    })
    .onUploadComplete(({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('file url', file.url);
      // TODO: store urls and later check if they have been used, if not, delete them
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
