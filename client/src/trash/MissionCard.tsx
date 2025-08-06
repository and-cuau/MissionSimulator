// import { useEffect, useRef, useState, Suspense } from "react";

// type MissionInfoProps = {
//   getMissions: (status: string) => void;
//   fetchMissionData: (id: string) => void;
//   setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
// };

// type MissionInfoRef = {
//   ref: HTMLFormElement;
// };

// const MissionCard = forwardRef<HTMLFormElement, MissionInfoProps>(
//   ({ getMissions, fetchMissionData, setMissions }, ref) => {

//   return (
//     <>
//       <div style={styles.testcontainer}>
//         <li key={index}>
//           <div style={styles.entry_element}>
//             {mission.id + " " + mission.mission_title}
//           </div>
//           <div style={styles.entry_element}>{mission.mission_desc}</div>
//           <div style={styles.entry_element}>{mission.priority_level}</div>
//           <div style={styles.entry_element}>{mission.start_time}</div>
//           <div style={styles.entry_element}>{mission.end_time}</div>
//           <div style={styles.buttons}>
//             <button
//               onClick={() => {
//                 // setMissionId(mission.id);
//                 fetchMissionData(mission.id);
//               }}
//             >
//               View
//             </button>
//             <button onClick={() => deleteMission(mission.id)}>Delete</button>
//             <button onClick={() => scheduleMission(mission.id)}>
//               Schedule
//             </button>
//           </div>
//         </li>
//       </div>
//     </>
//   );
// };

// export default MissionCard;

// const styles = {
//  entry_element: {
//     textAlign: "left",
//   },

//   buttons: { display: "flex" },

//   sectioncontainer: {
//     display: "inline-block",
//     margin: "0px 10px",
//   },
//   inputcontainer: {
//     display: "flex",
//     justifyContent: "space-between",
//     margin: "10px 0px",
//   },
//   arrow: {
//     position: "absolute",
//     top: "50%",
//     transform: "translateY(-50%)",
//     fontSize: "2rem",
//     backgroundColor: "rgba(0,0,0,0.3)",
//     color: "white",
//     border: "none",
//     cursor: "pointer",
//     padding: "0 10px 10px 10px",
//     zIndex: 1,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     display: "block",
//   },
// };
