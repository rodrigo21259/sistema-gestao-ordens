import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  deleteOrder,
  getOrderCustomValues,
  createOrderCustomValue,
  deleteOrderCustomValues,
} from "../db";
import { TRPCError } from "@trpc/server";

export const ordersRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        clientCode: z.string().min(1),
        product: z.string().min(1),
        volume: z.string(),
        revenue: z.string(),
        customValues: z.array(
          z.object({
            fieldId: z.number(),
            value: z.string().nullable(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createOrder({
          userId: ctx.user.id,
          clientCode: input.clientCode,
          product: input.product,
          volume: input.volume,
          revenue: input.revenue,
        });

        const orderId = (result as any).insertId;

        // Create custom field values
        if (input.customValues && input.customValues.length > 0) {
          for (const customValue of input.customValues) {
            await createOrderCustomValue({
              orderId,
              fieldId: customValue.fieldId,
              value: customValue.value,
            });
          }
        }

        return { success: true, orderId };
      } catch (error) {
        console.error("Error creating order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }
    }),

  listByUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userOrders = await getOrdersByUserId(ctx.user.id);
      
      // Enrich orders with custom values
      const enrichedOrders = await Promise.all(
        userOrders.map(async (order) => {
          const customValues = await getOrderCustomValues(order.id);
          return {
            ...order,
            customValues,
          };
        })
      );

      return enrichedOrders;
    } catch (error) {
      console.error("Error listing user orders:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list orders",
      });
    }
  }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can list all orders
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all orders",
      });
    }

    try {
      const allOrders = await getAllOrders();
      
      // Enrich orders with custom values
      const enrichedOrders = await Promise.all(
        allOrders.map(async (order) => {
          const customValues = await getOrderCustomValues(order.id);
          return {
            ...order,
            customValues,
          };
        })
      );

      return enrichedOrders;
    } catch (error) {
      console.error("Error listing all orders:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list orders",
      });
    }
  }),

  delete: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership or admin status
        const userOrders = await getOrdersByUserId(ctx.user.id);
        const orderExists = userOrders.some((o) => o.id === input.orderId);

        if (!orderExists && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own orders",
          });
        }

        // Delete custom values first
        await deleteOrderCustomValues(input.orderId);
        
        // Delete order
        await deleteOrder(input.orderId);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete order",
        });
      }
    }),
});
