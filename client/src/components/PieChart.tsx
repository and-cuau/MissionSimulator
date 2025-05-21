import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseEntry {
  ID: number;
  Date: string;
  Housing: number;
  Transportation: number;
  Food: number;
  Clothes: number;
  Healthcare: number;
  PersonalCare: number;
  Education: number;
  DebtPayments: number;
  SavingsInvestments: number;
  Entertainment: number;
  GiftsDonations: number;
  Misc: number;
  Total: number;
}

const ExpensePieChart = ({ myProp }: { myProp: ExpenseEntry[] }) => {
  if (!myProp || myProp.length === 0) {
    return <p>No data to display</p>;
  } else {
    const entry = myProp[0];

    console.log(entry);

    const labels = Object.keys(entry).filter(
      (key) => !["ID", "Date", "Total"].includes(key),
    ) as (keyof ExpenseEntry)[];

    const values = labels.map((label) => entry[label] as number);

    console.log("values: ");

    console.log(values);

    const backgroundColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#C9CBCF",
      "#5FAD56",
      "#F2C14E",
      "#F78154",
      "#A2D2FF",
      "#B5838D",
    ];

    const chartData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors.slice(0, values.length),
          borderWidth: 1,
        },
      ],
    };

    // width was "100%"
    return (
      <div style={{ width: "350px", maxWidth: 500, margin: "auto" }}>
        {/* <h3>Expense Breakdown (Pie)</h3> */}
        <Pie data={chartData} />
      </div>
    );
  }
};

export default ExpensePieChart;
