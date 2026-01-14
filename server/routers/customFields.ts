import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createCustomField,
  getActiveCustomFields,
  getAllCustomFields,
  updateCustomField,
  deleteCustomField,
} from "../db";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can manage custom fields",
    });
  }
  return next({ ctx });
});

export const customFieldsRouter = router({
  listActive: protectedProcedure.query(async () => {
    try {
      return await getActiveCustomFields();
    } catch (error) {
      console.error("Error listing active custom fields:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list custom fields",
      });
    }
  }),

  listAll: adminProcedure.query(async () => {
    try {
      return await getAllCustomFields();
    } catch (error) {
      console.error("Error listing all custom fields:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list custom fields",
      });
    }
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["TEXT", "NUMBER", "BOOLEAN", "DROPDOWN"]),
        options: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createCustomField({
          name: input.name,
          type: input.type,
          isActive: true,
          options: input.options ? JSON.stringify(input.options) : null,
        });

        return { success: true, fieldId: (result as any).insertId };
      } catch (error) {
        console.error("Error creating custom field:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create custom field",
        });
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        fieldId: z.number(),
        name: z.string().min(1).optional(),
        type: z.enum(["TEXT", "NUMBER", "BOOLEAN", "DROPDOWN"]).optional(),
        isActive: z.boolean().optional(),
        options: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updateData: any = {};
        
        if (input.name !== undefined) updateData.name = input.name;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.options !== undefined) {
          updateData.options = JSON.stringify(input.options);
        }

        await updateCustomField(input.fieldId, updateData);

        return { success: true };
      } catch (error) {
        console.error("Error updating custom field:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update custom field",
        });
      }
    }),

  delete: adminProcedure
    .input(z.object({ fieldId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await deleteCustomField(input.fieldId);
        return { success: true };
      } catch (error) {
        console.error("Error deleting custom field:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete custom field",
        });
      }
    }),

  toggleActive: adminProcedure
    .input(
      z.object({
        fieldId: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateCustomField(input.fieldId, { isActive: input.isActive });
        return { success: true };
      } catch (error) {
        console.error("Error toggling custom field:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle custom field",
        });
      }
    }),
});
