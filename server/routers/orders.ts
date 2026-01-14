import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  getAllOrdersWithUserNames,
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
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all orders",
      });
    }

    try {
      const allOrders = await getAllOrders();
      
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

  exportCSV: protectedProcedure
    .input(
      z.object({
        month: z.number().optional(),
        year: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can export orders",
          });
        }

        const allOrders = await getAllOrdersWithUserNames();
        
        let filteredOrders = allOrders;
        if (input.month !== undefined && input.year !== undefined) {
          filteredOrders = allOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return (
              orderDate.getMonth() === input.month &&
              orderDate.getFullYear() === input.year
            );
          });
        }

        const enrichedOrders = await Promise.all(
          filteredOrders.map(async (order: any) => {
            const customValues = await getOrderCustomValues(order.id);
            return {
              ...order,
              customValues,
            };
          })
        );

        const headers = [
          "ID",
          "Nome do Operador",
          "Cliente",
          "Produto",
          "Volume",
          "Receita",
          "Data",
        ];

        const rows = enrichedOrders.map((order: any) => [
          order.id,
          order.userName,
          order.clientCode,
          order.product,
          order.volume,
          order.revenue,
          new Date(order.createdAt).toLocaleDateString("pt-BR"),
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          csv,
          fileName: `ordens-${input.year}-${String(input.month).padStart(2, "0")}.csv`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error exporting orders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export orders",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userOrders = await getOrdersByUserId(ctx.user.id);
        const orderExists = userOrders.some((o) => o.id === input.orderId);

        if (!orderExists && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own orders",
          });
        }

        await deleteOrderCustomValues(input.orderId);
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
