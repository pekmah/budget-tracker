"use server";
import { OverviewQuerySchema } from "@/app/schema/overview";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });
  if (!queryParams.success) {
    return Response.json(queryParams.error.message, { status: 400 });
  }

  const statistics = await getBalanceStatistics(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(statistics);
}

export type GetBalanceStatisticsResponseType = Awaited<
  ReturnType<typeof getBalanceStatistics>
>;

async function getBalanceStatistics(userId: string, from: Date, to: Date) {
  // Your implementation here
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
    income: totals.find((t) => t.type === "income")?._sum.amount || 0,
  };
}
