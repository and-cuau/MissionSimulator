import { useEffect, useRef, useState } from "react";
import "../App.css";

import MissionInfo from "./MissionInfo";
import Personnel from "./Personnel";
import Assets from "./Assets";
import Objectives from "./Objectives";

import { useAuth } from "../contexts/AuthContext";

interface Mission {
  id: string;
  mission_title: string;
  mission_desc: string;
  priority_level: string;
  start_time: string;
  end_time: string;
  // Add more fields as needed
}

interface Person {
  mission_id: string;
  name: string;
  role: string;
  assignment_time: string;
  status: string;
  clearance_level: string;
}

interface Asset {
  mission_id: string;
  asset_type: string;
  status: string;
  location: string;
  capabilities: string;
}

interface Objective {
  mission_id: string;
  description: string;
  status: string;
  depends_on: string;
  est_duration: string;
  start_time: string;
  end_time: string;
}

export default function Dashboard() {
  const { missionId, setMissionId } = useAuth();
  const { user, setUser } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);

  useEffect(() => {
    console.log("Component mounted");

    const id = "1";

    (async () => {
      try {
        await getMissions(id ?? "0");
      } catch (err) {
        console.error("Failed to fetch mission in useEffect:", err);
      }
    })();

    fetchMissionData(missionId ?? "0");

    // Optional cleanup function
    return () => {
      console.log("Component unmounted");
    };
  }, []); // Empty dependency array

  function fetchMissionData(id: string) {
    (async () => {
      try {
        await getMissionPersonnel(id ?? "0");
      } catch (err) {
        console.error("Failed to fetch mission in useEffect:", err);
      }
    })();

    (async () => {
      try {
        await getMissionAssets(id ?? "0");
      } catch (err) {
        console.error("Failed to fetch mission in useEffect:", err);
      }
    })();

    (async () => {
      try {
        await getMissionObjectives(id ?? "0");
      } catch (err) {
        console.error("Failed to fetch mission in useEffect:", err);
      }
    })();
  }

  async function getMissions(id: string): Promise<Mission[]> {
    const res = await fetch(`http://localhost:3000/missions/`); // /${id}

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();

    const data: Mission[] = raw;

    setMissions(
      data.map((el) => ({
        id: el.id,
        mission_title: el.mission_title,
        mission_desc: el.mission_desc,
        priority_level: el.priority_level,
        start_time: el.start_time,
        end_time: el.end_time,
      })),
    );

    return data;
  }

  async function getMissionPersonnel(id: string): Promise<Person[]> {
    const res = await fetch(`http://localhost:3000/missions/${id}/personnel`); // /${id}

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();
    const data: Person[] = raw;

    console.log("personnel data: ");
    console.log(data);

    setPersonnel(
      data.map((el) => ({
        mission_id: el.mission_id,
        name: el.name,
        role: el.role,
        assignment_time: el.assignment_time,
        status: el.status,
        clearance_level: el.clearance_level,
      })),
    );

    return data;
  }

  async function getMissionAssets(id: string): Promise<Asset[]> {
    const res = await fetch(`http://localhost:3000/missions/${id}/assets`); // /${id}

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();
    const data: Asset[] = raw;

    console.log("fetched mission assets");
    console.log(data);

    setAssets(
      data.map((el) => ({
        mission_id: el.mission_id,
        asset_type: el.asset_type,
        status: el.status,
        location: el.location,
        capabilities: el.capabilities,
      })),
    );

    return data;
  }

  async function getMissionObjectives(id: string): Promise<Objective[]> {
    const res = await fetch(`http://localhost:3000/missions/${id}/objectives`); // /${id}

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();
    const data: Objective[] = raw;

    console.log("fetched mission objectives");
    console.log(data);

    setObjectives(
      data.map((el) => ({
        mission_id: el.mission_id,
        description: el.description,
        status: el.status,
        est_duration: el.est_duration,
        depends_on: el.depends_on,
        start_time: el.start_time,
        end_time: el.end_time,
      })),
    );

    return data;
  }

  const deleteMission = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/missions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the
      console.log("Placeholder: ", data); // do something with it

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const startMission = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/missions/${id}/start`, {
        method: "POST",
      }); // issue is that role prop is capitalized

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the
      console.log("Mission started: ", data); // do something with it

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  // user?.user_name will render as blank if user is null
  return (
    <>
      <h1>MissionSimulator</h1>
      <h2>
        {user?.user_id} {user?.user_name} {user?.role} {user?.token}
      </h2>
      <h2>{missionId}</h2>
      <div className="dash">
        <div>
          <MissionInfo></MissionInfo>
          <Personnel></Personnel>
        </div>

        <div>
          <Assets></Assets>
          <Objectives></Objectives>
        </div>

        <div style={styles.listcontainer}>
          <ul>
            {missions.map((mission, index) => (
              <li key={index}>
                <div style={styles.entry_element}>
                  {mission.id + " " + mission.mission_title}
                </div>
                <div style={styles.entry_element}>{mission.mission_desc}</div>
                <div style={styles.entry_element}>{mission.priority_level}</div>
                <div style={styles.entry_element}>{mission.start_time}</div>
                <div style={styles.entry_element}>{mission.end_time}</div>
                <div style={styles.buttons}>
                  <button
                    onClick={() => {
                      setMissionId(mission.id);
                      fetchMissionData(mission.id);
                    }}
                  >
                    View
                  </button>
                  <button onClick={() => deleteMission(mission.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.listcontainer}>
          <ul>
            {personnel.map((person, index) => (
              <li key={index}>
                <div style={styles.entry_element}>{person.mission_id}</div>
                <div style={styles.entry_element}>{person.name}</div>
                <div style={styles.entry_element}>{person.role}</div>
                <div style={styles.entry_element}>{person.assignment_time}</div>
                <div style={styles.entry_element}>{person.status}</div>
                <div style={styles.entry_element}>{person.clearance_level}</div>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.listcontainer}>
          <ul>
            {assets.map((asset, index) => (
              <li key={index}>
                <div style={styles.entry_element}>{asset.mission_id}</div>
                <div style={styles.entry_element}>{asset.asset_type}</div>
                <div style={styles.entry_element}>{asset.status}</div>
                <div style={styles.entry_element}>{asset.location}</div>
                <div style={styles.entry_element}>{asset.capabilities}</div>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.listcontainer}>
          <ul>
            {objectives.map((objective, index) => (
              <li key={index}>
                <div style={styles.entry_element}>{objective.mission_id}</div>
                <div style={styles.entry_element}>{objective.description}</div>
                <div style={styles.entry_element}>{objective.status}</div>
                <div style={styles.entry_element}>{objective.depends_on}</div>
                <div style={styles.entry_element}>{objective.est_duration}</div>
                <div style={styles.entry_element}>{objective.start_time}</div>
                <div style={styles.entry_element}>{objective.end_time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

const styles = {
  entry_element: {
    textAlign: "left",
  },

  dash: { width: "700px", height: "1200px", overflowY: "auto" },
  buttons: { display: "flex" },
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
  listcontainer: {
    display: "inline-block",
    verticalAlign: "top",
    height: "500px",
    overflowY: "auto",
  },
};
