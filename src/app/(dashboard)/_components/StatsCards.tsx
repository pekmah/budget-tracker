"use client";
import { GetBalanceStatisticsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/skeleton/Wrapper";
import { Card } from "@/components/ui/card";
import { DateToUTC, GetFormatterForCurrency } from "@/lib/helpers";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { title } from "process";
import React from "react";
import Countup from "react-countup";

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}
const StatsCards = ({ from, to, userSettings }: Props) => {
  const statsQuery = useQuery<GetBalanceStatisticsResponseType>({
    queryKey: ["overview_stats", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${DateToUTC(from)}&to=${DateToUTC(to)}`
      ).then((res) => res.json()),
  });

  const formatter = React.useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);
  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const balance = income - expense;

  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Income"
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={expense}
          title="Expense"
          icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={balance}
          title="Balance"
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
};

export default StatsCards;
const StatCard = ({
  formatter,
  value,
  title,
  icon,
}: {
  formatter: Intl.NumberFormat;
  icon: React.ReactNode;
  title: string;
  value: number;
}) => {
  const formatFn = React.useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  );

  return (
    <Card className="flex items-center w-full gap-2 p-4 h-24">
      {icon}

      <div className="flex flex-col items-start gap-0">
        <h3 className="text-muted-foreground">{title}</h3>
        <Countup
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          duration={1}
          formattingFn={formatFn}
          className="text-2xl "
        />
      </div>
    </Card>
  );
};
