import { useState, useEffect, forwardRef } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import Dropdown from "./Dropdown";

// interface Mission {
//   id: string;
//   mission_title: string;
//   mission_desc: string;
//   priority_level: string;
//   status: string;
//   start_time: string;
//   end_time: string;
//   // Add more fields as needed
// }

type MissionInfoProps = {
  MissTitleErr: string;
};

// type MissionInfoRef = {
//   ref: HTMLFormElement;
// };

// export default function MissionInfo({
//   getMissions,
//   fetchMissionData,
// }: MissionInfoProps) {

const MissionInfo = forwardRef<HTMLFormElement, MissionInfoProps>(
  ({ MissTitleErr }, ref) => {
    console.log("mission info child rendered");

    // const { user, setUser } = useAuth();
    // const { missionId, setMissionId } = useAuth();
    // const formRef = useRef<HTMLFormElement | null>(null);

    const [dateTime, setDateTime] = useState("");
    const [dateTime2, setDateTime2] = useState("");

    useEffect(() => {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - offset * 60 * 1000);
      setDateTime(localDate.toISOString().slice(0, 16)); // "YYYY-MM-DDTHH:MM"

      const localDate2 = new Date(now.getTime() - offset * 60 * 1000 + 60000);
      setDateTime2(localDate2.toISOString().slice(0, 16)); // "YYYY-MM-DDTHH:MM"
    }, []);

    // const editMission = async () => {
    //   try {
    //     if (!ref.current) return;

    //     const formData = new FormData(ref.current);
    //     const plainObject = Object.fromEntries(formData.entries());

    //     const res = await fetch("http://localhost:3000/missions", {
    //       method: "PATCH",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${user?.token}`,
    //       },
    //       body: JSON.stringify({ plainObject }),
    //     });

    //     if (!res.ok) throw new Error("Server error");

    //     const data = await res.json(); // parse the
    //     console.log("Added User: ", data); // do something with it

    //     return true;
    //   } catch (err) {
    //     console.error("Failed to send message:", err);
    //     return false;
    //   }
    // };

    // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //   e.preventDefault();

    //   if (!ref.current) return;

    //   const formData = new FormData(ref.current);
    //   const plainObject = Object.fromEntries(formData.entries());

    //   console.log("plain object:");
    //   console.log(plainObject);

    //   const response = await fetch(`http://localhost:3000/missions`, {
    //     method: "POST",
    //     body: JSON.stringify(plainObject),
    //     headers: {
    //       "X-User-ID": "12345",
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${user?.token}`,
    //     },
    //   });

    //   // const result = await response.text();
    //   const result = await response.json();
    //   console.log("response from server after posting mission: ");
    //   console.log(result);
    //   setMissionId(result.id);

    //   await getMissions("draft");
    //   // await fetchMissionData(result.id);
    // };

    // const [input, setInput] = useState("");

    return (
      <>
        <form method="POST" style={styles.sectioncontainer} ref={ref}>
          <h2>Mission Info</h2>
          <div style={styles.inputcontainer}>
            <span>Mission Title: </span>
            <input name="mission_title" defaultValue="Mission"></input>
          </div>

          <div style={styles.inputcontainer}>
            <span>Mission Description: </span>
            <input name="mission_desc" defaultValue="Description"></input>
          </div>

          <div style={styles.inputcontainer}>
            <span>Priority Level: </span>
            <select name="priority_level" defaultValue="critical">
              <option value="">Select</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={styles.inputcontainer}>
            <span>Start: </span>
            <input
              name="start_time"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div style={styles.inputcontainer}>
            <span>End: </span>
            <input
              name="end_time"
              type="datetime-local"
              value={dateTime2}
              onChange={(e) => setDateTime2(e.target.value)}
            />
          </div>

          <div>{MissTitleErr}</div>
          {/* <button type="submit">Submit</button> */}
        </form>
      </>
    );
  },
);

export default MissionInfo;

const styles = {
  sectioncontainer: {
    display: "inline-block",
    margin: "0px 10px",
  },
  inputcontainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0px",
  },
  arrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "2rem",
    backgroundColor: "rgba(0,0,0,0.3)",
    color: "white",
    border: "none",
    cursor: "pointer",
    padding: "0 10px 10px 10px",
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    display: "block",
  },
};
