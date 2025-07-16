import ObjectiveProgress from "./ObjectiveProgress";
import { useEffect, useState, useRef } from "react";
import { useApi } from '../contexts/APIContext';
import { io, Socket } from "socket.io-client";

type MissionProgressProps = {
  missionId: string;
  startTime: string;
  endTime: string;
};

// const API_URL = process.env.REACT_APP_API_URL || "https://amiable-caring-production.up.railway.app";
// const API_URL = "http://localhost:3000";

// const API_URL = "api";
// const API_URL = 'http://localhost:8080/api';


interface progress {
  prog: number;
  objective: string;
}

export default function MissionProgress({
  missionId,
  startTime,
  endTime,
}: MissionProgressProps) {
  const { api_url } = useApi();
  const [estTime, setEstTime] = useState<string>("");
  let intervalId: NodeJS.Timeout;

  const [jobId, setJobId] = useState<number>(1);
  const [progresses, setProgresses] = useState<progress[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const end_time_obj: Date = new Date(endTime);
  const start_time_obj: Date = new Date(startTime);

  function updateCountdown() {
    const now = new Date();

    console.log("now information: "+ now.getTimezoneOffset());

    const diffStart: number = start_time_obj.getTime() - now.getTime();

    const diffCompletion: number = end_time_obj.getTime() - now.getTime();

    if (diffCompletion <= 0) {
      setEstTime("Mission Completed");
      return;
    }

    let msg = "Mission started. Est. time until completion: ";

    let diffSet = diffCompletion;

    if (diffStart >= 0) {
      msg = "Mission pending. Time until launch: ";
      diffSet = diffStart;
    }

    const minutes = Math.floor(diffSet / 60000);
    const seconds = Math.floor((diffSet % 60000) / 1000);

    const stringTime = msg + minutes + " : " + seconds;

    setEstTime(stringTime);

    // // document.getElementById("countdown").textContent =
    //   `${minutes}m ${seconds}s remaining`;
  }

  useEffect(() => {
    intervalId = setInterval(updateCountdown, 1000);

    // console.log('Component mounted');
    socketRef.current = io(`${api_url}}`, {
      reconnectionAttempts: 1,
      timeout: 5000,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
    });

    return () => {
       clearInterval(intervalId); 
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
        <div>{estTime}</div>
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
      </div>
    </>
  );
}
