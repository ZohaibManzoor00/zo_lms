"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive area chart";

// const dummyEnrollmentData = [
//   { date: "2024-06-30", enrollments: 12 },
//   { date: "2024-07-01", enrollments: 10 },
//   { date: "2024-07-02", enrollments: 20 },
//   { date: "2024-07-03", enrollments: 60 },
//   { date: "2024-07-04", enrollments: 12 },
//   { date: "2024-07-05", enrollments: 20 },
//   { date: "2024-07-06", enrollments: 25 },
//   { date: "2024-07-07", enrollments: 20 },
//   { date: "2024-07-08", enrollments: 8 },
//   { date: "2024-07-09", enrollments: 3 },
//   { date: "2024-07-10", enrollments: 10 },
//   { date: "2024-07-11", enrollments: 15 },
//   { date: "2024-07-12", enrollments: 10 },
//   { date: "2024-07-13", enrollments: 12 },
//   { date: "2024-07-14", enrollments: 20 },
//   { date: "2024-07-15", enrollments: 39 },
//   { date: "2024-07-16", enrollments: 3 },
//   { date: "2024-07-17", enrollments: 5 },
//   { date: "2024-07-18", enrollments: 10 },
//   { date: "2024-07-19", enrollments: 12 },
//   { date: "2024-07-20", enrollments: 10 },
//   { date: "2024-07-21", enrollments: 15 },
//   { date: "2024-07-22", enrollments: 10 },
//   { date: "2024-07-23", enrollments: 12 },
//   { date: "2024-07-24", enrollments: 10 },
//   { date: "2024-07-25", enrollments: 50 },
//   { date: "2024-07-26", enrollments: 10 },
//   { date: "2024-07-27", enrollments: 12 },
//   { date: "2024-07-28", enrollments: 10 },
//   { date: "2024-07-29", enrollments: 12 },
//   { date: "2024-07-30", enrollments: 10 },
//   { date: "2024-07-31", enrollments: 12 },
// ];

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface Props {
  data: { date: string; enrollments: number }[];
}
export function ChartAreaInteractive({ data }: Props) {
  const totalEnrollmentsNumber = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.enrollments, 0);
  }, [data]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total enrollments for the last 30 days: {totalEnrollmentsNumber}
          </span>
          <span className="@[540px]/card:hidden">
            Total enrollments for the last 30 days: {totalEnrollmentsNumber}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart margin={{ right: 12, left: 12 }} data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={"preserveStartEnd"}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
              }
            />

            <Bar dataKey="enrollments" fill={chartConfig.enrollments.color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
