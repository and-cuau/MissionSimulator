import ObjectiveProgress from "./ObjectiveProgress";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

type MissionProgressProps = {
  missionId: string;
};

// const API_URL = process.env.REACT_APP_API_URL || "https://amiable-caring-production.up.railway.app";
const API_URL = "http://localhost:3000";

interface progress {
  prog: number;
  objective: string;
}

export default function MissionProgress({ missionId }: MissionProgressProps) {
  //{ jobId }: MissionProgressProps

  const [jobId, setJobId] = useState<number>(1);

  const [progresses, setProgresses] = useState<progress[]>([]);

  // const [progress, setProgress] = useState<number>(1);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // console.log('Component mounted');
    socketRef.current = io(`${API_URL}`, {
      reconnectionAttempts: 1,
      timeout: 5000,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
    });

    return () => {
      // console.log('Component unmounted');
    };
  }, []);

  useEffect(() => {
    // this useffect runs after the other useffect because it is declared after it

    if (!socketRef.current) return;

    const combinedId = missionId + "-" + jobId;
    console.log(`jobId is ${combinedId}`);
    socketRef.current.emit("subscribeToJob", combinedId);

    socketRef.current.on(`job-progress-${combinedId}`, (data) => {
      console.log("test received progress update");
      console.log("updated  data.percent" + data.percent);
      // setProgress(data.percent);

      const prog_obj: progress = {
        prog: data.percent,
        objective: data.message,
      };

      setProgresses([...progresses, prog_obj]);
      // console.log("updated progress test " + progress);
      if (data.jobId === combinedId) {
      }
    });

    socketRef.current.on(`job-complete-${combinedId}`, async () => {
      // deleted "data" parameter
      setJobId((prev) => prev + 1);
    });

    return () => {
      if (!socketRef.current) return;
      socketRef.current.off(`job-progress-${combinedId}`);
      socketRef.current.off(`job-complete-${combinedId}`);
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
