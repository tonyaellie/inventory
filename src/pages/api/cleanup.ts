import { type NextApiHandler } from 'next';
import { utapi } from 'uploadthing/server';

import { prisma } from '@/server/db';

const handler: NextApiHandler = async (req, res) => {
  const unusedImages = await prisma.unusedImages.findMany();
  await utapi.deleteFiles(unusedImages.map((image) => image.id));

  res.status(200).json({ success: true });
};

export default handler;
