import ObjectiveProgress from "./ObjectiveProgress";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  reconnectionAttempts: 1,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("Connected to server");
});

type MissionProgressProps = {
  jobId: string;
};

export default function MissionProgress() {
  //{ jobId }: MissionProgressProps

  const [jobId, setJobId] = useState<number>(1);

  const [progresses, setProgresses] = useState<number[]>([]);

  const [progress, setProgress] = useState<number>(1);
  useEffect(() => {
    console.log(`jobId is ${jobId}`);
    socket.emit("subscribeToJob", jobId);

    socket.on(`job-progress-${jobId}`, (data) => {
      console.log("test received progress update");
      console.log("updated  data.percent" + data.percent);
      setProgress(data.percent);
      setProgresses([...progresses, data.percent]);
      console.log("updated progress test " + progress);
      if (data.jobId === jobId) {
      }
    });

    socket.on(`job-complete-${jobId}`, async (data) => {
      setJobId((prev) => prev + 1);
    });

    return () => {
      socket.off(`job-progress-${jobId}`);
      socket.off(`job-complete-${jobId}`);
    };
  }, [jobId]);

  return (
    <>
      {progresses.map((progress, index) => (
        <ObjectiveProgress progressprop={progress}></ObjectiveProgress>
      ))}

      {/* <button onClick={() => setJobId(prev => prev + 1)}>Test Subscribe</button> */}
    </>
  );
}

//   const socket = io("http://localhost:3000", {
//     reconnectionAttempts: 1,
//     timeout: 5000,
//   });

//   socket.on("connect", () => {
//     console.log("Connected to server");
//   });

//   socket.on("connect_error", (err) => {
//     console.error("Connection error:", err.message);
//   });

//   socket.on("disconnect", () => {
//     console.warn("Disconnected from server");
//   });
