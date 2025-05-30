import MissionProgress from "./MissionProgress";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// interface MissionProg {
//   id: string;
//   mission_title: string;
//   mission_desc: string;
//   priority_level: string;
//   status: string;
//   start_time: string;
//   end_time: string;
//   // Add more fields as needed
// }

const socket = io("http://localhost:3000", {
  reconnectionAttempts: 1,
  timeout: 5000,
});

// socket.on("connect", () => {
//   console.log("Connected to server");
// });

export default function MultiMissionProgress() {
//   const [missionProgs, setMissionProgs] = useState([[]]);
//   const [progresses, setProgresses] = useState<number[]>([]);

//   const [jobId, setJobId] = useState<number>(1);

//    useEffect(() => {
//       console.log(`jobId is ${jobId}`);
//       socket.emit("subscribeToJob", jobId);
  
//       socket.on(`job-progress-${jobId}`, (data) => {
//         console.log("test received progress update");
//         console.log("updated  data.percent" + data.percent);
//         // setProgress(data.percent);
//         setProgresses([...progresses, data.percent]);
//         // console.log("updated progress test " + progress);
//         if (data.jobId === jobId) {
//         }
//       });
  
//       socket.on(`job-complete-${jobId}`, async (data) => {
//         setJobId((prev) => prev + 1);
//       });
  
//       return () => {
//         socket.off(`job-progress-${jobId}`);
//         socket.off(`job-complete-${jobId}`);
//       };
//     }, [jobId]);





  return (
    <>
      {/* {missionProgs.map((mission, index) => (
        <li key={index}> */}
          <MissionProgress></MissionProgress>
        {/* </li> */}
      {/* ))} */}
    </>
  );
}
