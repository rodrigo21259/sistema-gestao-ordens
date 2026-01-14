import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAllUsers,
  getAllOrders,
  getRankingMetrics,
  updateRankingMetric,
  initializeRankingMetrics,
  getOrdersByUserId,
} from "../db";
import { TRPCError } from "@trpc/server";
import Decimal from "decimal.js";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can manage ranking metrics",
    });
  }
  return next({ ctx });
});

export const rankingRouter = router({
  getMetrics: adminProcedure.query(async () => {
    try {
      let metrics = await getRankingMetrics();
      
      // Initialize if empty
      if (metrics.length === 0) {
        await initializeRankingMetrics();
        metrics = await getRankingMetrics();
      }

      return metrics;
    } catch (error) {
      console.error("Error getting ranking metrics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get ranking metrics",
      });
    }
  }),

  updateMetricWeight: adminProcedure
    .input(
      z.object({
        metricId: z.number(),
        weight: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateRankingMetric(input.metricId, input.weight);
        return { success: true };
      } catch (error) {
        console.error("Error updating metric weight:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update metric weight",
        });
      }
    }),

  getRanking: protectedProcedure.query(async ({ ctx }) => {
    try {
      await initializeRankingMetrics();
      
      const metrics = await getRankingMetrics();
      const users = await getAllUsers();
      const orders = await getAllOrders();

      // Filter only operators (exclude admins) - admins don't appear in ranking
      const operators = users.filter((user) => user.role === "user");

      // Calculate scores for each operator
      const rankings = await Promise.all(
        operators.map(async (user) => {
          const userOrders = orders.filter((o) => o.userId === user.id);
          
          // Calculate metrics
          const totalRevenue = userOrders.reduce(
            (sum, order) => sum.plus(new Decimal(order.revenue)),
            new Decimal(0)
          );
          const orderCount = userOrders.length;

          // Get metric weights
          const revenueMetric = metrics.find((m) => m.metricName === "revenue");
          const orderCountMetric = metrics.find((m) => m.metricName === "orderCount");

          const revenueWeight = revenueMetric
            ? new Decimal(revenueMetric.weight)
            : new Decimal(60);
          const orderCountWeight = orderCountMetric
            ? new Decimal(orderCountMetric.weight)
            : new Decimal(40);

          // Calculate max values across all operators for normalization
          const operatorTotals = operators.map((op) => {
            const opOrders = orders.filter((o) => o.userId === op.id);
            const opRevenue = opOrders.reduce(
              (sum, order) => sum.plus(new Decimal(order.revenue)),
              new Decimal(0)
            );
            return { userId: op.id, revenue: opRevenue, orderCount: opOrders.length };
          });

          const maxRevenue = operatorTotals.reduce(
            (max, op) => (op.revenue.greaterThan(max) ? op.revenue : max),
            new Decimal(1)
          );

          const maxOrderCount = Math.max(
            ...operatorTotals.map((op) => op.orderCount),
            1
          );

          // Normalize metrics (0-100 scale)
          const normalizedRevenue = maxRevenue.greaterThan(0)
            ? totalRevenue.dividedBy(maxRevenue).times(100)
            : new Decimal(0);
          const normalizedOrderCount = new Decimal(orderCount)
            .dividedBy(maxOrderCount)
            .times(100);

          // Calculate final score
          const score = normalizedRevenue
            .times(revenueWeight)
            .plus(normalizedOrderCount.times(orderCountWeight))
            .dividedBy(revenueWeight.plus(orderCountWeight));

          return {
            userId: user.id,
            userName: user.name || user.email || "Unknown",
            totalRevenue: totalRevenue.toString(),
            orderCount,
            score: score.toFixed(2),
          };
        })
      );

      // Sort by score descending
      rankings.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

      // Add position
      const rankedList = rankings.map((rank, index) => ({
        ...rank,
        position: index + 1,
      }));

      // Find current user position
      const currentUserRank = rankedList.find((r) => r.userId === ctx.user.id);

      return {
        ranking: rankedList,
        currentUserPosition: currentUserRank?.position || null,
        currentUserScore: currentUserRank?.score || "0.00",
      };
    } catch (error) {
      console.error("Error calculating ranking:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate ranking",
      });
    }
  }),
});
