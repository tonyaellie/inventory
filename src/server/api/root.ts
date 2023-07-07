import { TRPCError } from '@trpc/server';
import { utapi } from 'uploadthing/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { prisma } from '../db';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  createList: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        categories: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: use an id instead of name
      if (!ctx?.session?.user?.name) {
        throw new Error('Not logged in');
      }
      return prisma.lists.create({
        data: {
          name: input.name,
          categories: {
            create: input.categories.map((category) => ({
              name: category,
            })),
          },
          owner: ctx.session.user.name,
        },
      });
    }),
  getLists: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx?.session?.user?.name) {
      throw new Error('Not logged in');
    }
    return prisma.lists.findMany({
      where: {
        owner: ctx.session.user.name,
      },
    });
  }),
  getList: protectedProcedure
    .input(
      z.object({
        listId: z.number().int().positive(),
        includeItems: z.boolean().optional(),
        includeCategories: z.boolean().optional(),
      })
    )
    .query(
      async ({ input: { listId, includeCategories, includeItems }, ctx }) => {
        const data = await prisma.lists.findFirst({
          where: {
            id: listId,
          },
          include: {
            items: includeItems,
            categories: includeCategories,
          },
        });

        if (data?.owner !== ctx?.session?.user?.name) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You do not have access to this list',
          });
        }

        return data;
      }
    ),
  deleteList: protectedProcedure
    .input(z.object({ listId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const list = await prisma.lists.delete({
        where: {
          id: input.listId,
        },
        include: {
          items: true,
          categories: true,
        },
      });
      const deleteImages = await utapi.deleteFiles(
        list.items.map((item) =>
          item.image.replace('https://uploadthing.com/f/', '')
        )
      );
      console.log('deleted', list.name, deleteImages);
      return list;
    }),
  updateList: protectedProcedure
    .input(
      z.object({
        listId: z.number().int().positive(),
        name: z.string(),
        categoriesAdded: z.array(z.string()),
        categoriesRemoved: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const list = await prisma.lists.update({
        where: {
          id: input.listId,
        },
        data: {
          name: input.name,
          categories: {
            createMany: {
              data: input.categoriesAdded.map((category) => ({
                name: category,
              })),
            },
            deleteMany: {
              name: {
                in: input.categoriesRemoved,
              },
            },
          },
        },
      });
      return list;
    }),
  addItem: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        image: z.string().url(),
        categoryId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        bag: z.number().int().positive().lt(10),
        packed: z.boolean(),
        listId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx?.session?.user?.name) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to add an item',
        });
      }

      const list = await prisma.lists.findFirst({
        where: {
          id: input.listId,
        },
        include: {
          categories: true,
        },
      });

      if (list?.owner !== ctx?.session?.user?.name) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to this list',
        });
      }

      if (
        !list?.categories.find((category) => category.id === input.categoryId)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Category does not exist',
        });
      }

      // TODO: check if category is valid
      return prisma.items.create({
        data: {
          ...input,
          owner: ctx.session.user.name,
        },
      });
    }),
  deleteItem: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const item = await prisma.items.delete({
        where: {
          id: input.id,
        },
      });
      const deleteImage = await utapi.deleteFiles([
        item.image.replace('https://uploadthing.com/f/', ''),
      ]);
      console.log('deleted', item.name, deleteImage);
      return item;
    }),
  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string(),
        description: z.string(),
        categoryId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        bag: z.number().int().positive().lt(10),
        packed: z.boolean(),
        listId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) =>
      prisma.items.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      })
    ),
});

// export type definition of API
export type AppRouter = typeof appRouter;
