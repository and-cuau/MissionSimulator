import ObjectiveProgress from "./ObjectiveProgress";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type MissionProgressProps = {
  missionId: string;
};

export default function MissionProgress({ missionId }: MissionProgressProps) {
  //{ jobId }: MissionProgressProps

  const [jobId, setJobId] = useState<number>(1);

  const [progresses, setProgresses] = useState<number[]>([]);

  const [progress, setProgress] = useState<number>(1);
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      reconnectionAttempts: 1,
      timeout: 5000,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    const combinedId = missionId + "-" + jobId;
    console.log(`jobId is ${combinedId}`);
    socket.emit("subscribeToJob", combinedId);

    socket.on(`job-progress-${combinedId}`, (data) => {
      console.log("test received progress update");
      console.log("updated  data.percent" + data.percent);
      setProgress(data.percent);
      setProgresses([...progresses, data.percent]);
      console.log("updated progress test " + progress);
      if (data.jobId === combinedId) {
      }
    });

    socket.on(`job-complete-${combinedId}`, async () => {
      // deleted "data" parameter
      setJobId((prev) => prev + 1);
    });

    return () => {
      socket.off(`job-progress-${combinedId}`);
      socket.off(`job-complete-${combinedId}`);
    };
  }, [jobId]);

  return (
    <>
      <div>
        {progresses.map(
          (
            progress, // got rid of index n (progress, index)
          ) => (
            <ObjectiveProgress progressprop={progress}></ObjectiveProgress>
          ),
        )}
      </div>

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
