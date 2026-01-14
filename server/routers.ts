import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ordersRouter } from "./routers/orders";
import { customFieldsRouter } from "./routers/customFields";
import { rankingRouter } from "./routers/ranking";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  orders: ordersRouter,
  customFields: customFieldsRouter,
  ranking: rankingRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
