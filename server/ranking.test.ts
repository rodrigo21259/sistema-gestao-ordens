import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context for testing
function createMockContext(userId: number, role: "admin" | "user" = "user"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@test.com`,
      name: `User ${userId}`,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Ranking Router", () => {
  describe("getRanking", () => {
    it("should return ranking data for authenticated users", async () => {
      const ctx = createMockContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ranking.getRanking();

      expect(result).toBeDefined();
      expect(result.ranking).toBeInstanceOf(Array);
      expect(result.currentUserPosition).toBeDefined();
      expect(typeof result.currentUserScore).toBe("string");
    });

    it("should return ranking with proper structure", async () => {
      const ctx = createMockContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ranking.getRanking();

      if (result.ranking.length > 0) {
        const entry = result.ranking[0];
        expect(entry).toHaveProperty("userId");
        expect(entry).toHaveProperty("userName");
        expect(entry).toHaveProperty("totalRevenue");
        expect(entry).toHaveProperty("orderCount");
        expect(entry).toHaveProperty("score");
        expect(entry).toHaveProperty("position");
      }
    });
  });

  describe("getMetrics", () => {
    it("should only allow admins to get metrics", async () => {
      const userCtx = createMockContext(1, "user");
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.ranking.getMetrics();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return metrics for admin users", async () => {
      const adminCtx = createMockContext(1, "admin");
      const caller = appRouter.createCaller(adminCtx);

      const result = await caller.ranking.getMetrics();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      // Check for required metrics
      const metricNames = result.map((m) => m.metricName);
      expect(metricNames).toContain("revenue");
      expect(metricNames).toContain("orderCount");
    });

    it("should have valid metric weights", async () => {
      const adminCtx = createMockContext(1, "admin");
      const caller = appRouter.createCaller(adminCtx);

      const result = await caller.ranking.getMetrics();

      result.forEach((metric) => {
        expect(metric.weight).toBeDefined();
        const weight = parseFloat(metric.weight as string);
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("updateMetricWeight", () => {
    it("should only allow admins to update metrics", async () => {
      const userCtx = createMockContext(1, "user");
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.ranking.updateMetricWeight({
          metricId: 1,
          weight: "50.00",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admins to update metric weights", async () => {
      const adminCtx = createMockContext(1, "admin");
      const caller = appRouter.createCaller(adminCtx);

      // First get the metrics
      const metrics = await caller.ranking.getMetrics();
      if (metrics.length > 0) {
        const result = await caller.ranking.updateMetricWeight({
          metricId: metrics[0].id,
          weight: "75.00",
        });

        expect(result.success).toBe(true);
      }
    });
  });
});
