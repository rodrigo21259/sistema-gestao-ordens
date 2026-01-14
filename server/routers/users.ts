import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAllUsers, updateUserRole, updateUserTheme, upsertUser } from "../db";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can manage users",
    });
  }
  return next({ ctx });
});

export const usersRouter = router({
  listAll: adminProcedure.query(async () => {
    try {
      const users = await getAllUsers();
      return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      }));
    } catch (error) {
      console.error("Error listing users:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list users",
      });
    }
  }),

  createOperator: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const generatedOpenId = `operator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await upsertUser({
          openId: generatedOpenId,
          name: input.name,
          email: input.email,
          loginMethod: "admin-created",
          role: "user",
        });

        return {
          success: true,
          message: `Operador ${input.name} criado com sucesso. Ele poderá fazer login com seu email.`,
        };
      } catch (error) {
        console.error("Error creating operator:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create operator",
        });
      }
    }),

  promoteToAdmin: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot change your own role",
          });
        }

        await updateUserRole(input.userId, "admin");
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error promoting user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to promote user",
        });
      }
    }),

  demoteToOperator: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot change your own role",
          });
        }

        await updateUserRole(input.userId, "user");
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error demoting user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to demote user",
        });
      }
    }),

  updateTheme: protectedProcedure
    .input(z.object({ theme: z.enum(["light", "dark"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        await updateUserTheme(ctx.user.id, input.theme);
        return { success: true };
      } catch (error) {
        console.error("Error updating theme:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update theme",
        });
      }
    }),
});
