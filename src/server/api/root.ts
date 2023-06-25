import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import { prisma } from '../db';
import { utapi } from 'uploadthing/server';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  addItem: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        image: z.string().url(),
        category: z.enum(['KITCHEN', 'BEDROOM', 'BATHROOM', 'PERSONAL']),
        quantity: z.number().int().positive(),
        bag: z.number().int().positive().lt(10),
      })
    )
    .mutation(async ({ input }) =>
      prisma.items.create({
        data: input,
      })
    ),
  getItems: protectedProcedure.query(async () => prisma.items.findMany()),
  deleteItem: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    // TODO: also delete image from uploadthing
    .mutation(async ({ input }) => {
      const item = await prisma.items.delete({
        where: {
          id: input.id,
        },
      });
      await utapi.deleteFiles([item.image]);
      return item;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
