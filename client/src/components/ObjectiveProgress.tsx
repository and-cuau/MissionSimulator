import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

import { useEffect } from "react";
// import { io } from "socket.io-client";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface progress {
  prog: number;
  objective: string;
}

type MissionProgressProps = {
  progressprop: progress;
};

export default function ObjectiveProgress({
  progressprop,
}: MissionProgressProps) {

  const data = {
    labels: [progressprop.objective],
    datasets: [
      {
        label: progressprop.objective,
        data: [progressprop.prog],
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderRadius: 10,
        barThickness: 30,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        min: 0,
        max: 100,

        display: true, // make sure display is true to show the axis
        title: {
          display: true,
          // text: progressprop.prog, // <-- desired label here
          font: {
            size: 14,
          },
          color: "#666",
        },
      },

      y: {
        display: true,
      },
    },
  };

  const jobId = 1;

  useEffect(() => {}, [jobId]);

  return (
    <>
      <div style={styles.test}>
        <Bar data={data} options={options} />
      </div>
    </>
  );
}

const styles = {
  test: {
    margin: "0px 10px",
    height: "60px",
    width: "140px",
  },
};
