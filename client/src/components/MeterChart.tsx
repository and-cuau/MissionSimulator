// MeterChart.tsx
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type MeterChartProps = {
  value: number; // 0 to 100
  budget: number;
};

const MeterChart: React.FC<MeterChartProps> = ({ value, budget }) => {
  const data = {
    labels: ["Value", "Remainder"],
    datasets: [
      {
        data: [value, budget - value],
        backgroundColor: ["#36A2EB", "#E5E5E5"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    rotation: -90, // start angle
    circumference: 180, // half circle
    cutout: "50%", // adjust for meter thickness
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div style={{ width: "300px", height: "150px" }}>
      <Doughnut style={{ margin: "auto" }} data={data} options={options} />
      <div
        style={{
          position: "relative",
          top: "-160px",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        {Math.trunc((value / budget) * 100)}%
      </div>
    </div>
  );
};

export default MeterChart;
