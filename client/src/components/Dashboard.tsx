import { useEffect, useRef, useState, CSSProperties } from "react"; // removed suspense
import "../App.css";

import MissionInfo from "./MissionInfo";
import Personnel from "./Personnel";
import Assets from "./Assets";
import Objectives from "./Objectives";
import MissionProgress from "./MissionProgress";
import AuditLogs from "./AuditLogs";
import ErrorBoundary from "./ErrorBoundary";

// const session = require('express-session');

import { useAuth } from "../contexts/AuthContext";

interface Mission {
  id: string;
  mission_title: string;
  mission_desc: string;
  priority_level: string;
  status: string;
  start_time: string;
  end_time: string;
}

interface Person {
  mission_id: string;
  name: string;
  role: string;
  assignment_time: string;
  status: string;
  clearance_level: string;
  [key: string]: string;
}

interface Asset {
  mission_id: string;
  asset_type: string;
  status: string;
  location: string;
  capabilities: string;
  [key: string]: string;
}

interface Objective {
  mission_id: string;
  description: string;
  status: string;
  depends_on: string;
  est_duration: string;
  start_time: string;
  end_time: string;
  [key: string]: string;
}

// const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = "https://amiable-caring-production.up.railway.app";
// const API_URL = "http://localhost:3000";

const API_URL = "http://localhost:3000";

export default function Dashboard() {
  // const { missionId, setMissionId } = useAuth();
  const [viewId, setViewId] = useState<string>("-1");

  const [missionCreated, setMissionCreated] = useState<boolean | undefined>(
    undefined,
  );

  const [missionId2, setMissionId2] = useState<string | undefined>(undefined);

  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [scheduledMissions, setScheduledMissions] = useState<Mission[]>([]);

  const [formPersonnel, setFormPersonnel] = useState<Person[]>([]);
  const [formAssets, setFormAssets] = useState<Asset[]>([]);
  const [formObjectives, setFormObjectives] = useState<Objective[]>([]);

  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);

  const [trigger, setTrigger] = useState<boolean>(false);

  const [missTitleErr, setMissTitleErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        await getMissions("draft");
      } catch (err) {
        console.error("Failed to fetch mission in useEffect:", err);
      }
    })();

    (async () => {
      try {
        await getMissions("scheduled");
      } catch (err) {
        console.error("Failed to fetch mission in useEffect:", err);
      }
    })();

    fetchMissionData(missionId2 ?? "0");

    return () => {};
  }, []);

  function fetchMissionData(id: string | null) {
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

  async function getMissions(status: string): Promise<Mission[]> {
    const res = await fetch(`${API_URL}/missions/?status=${status}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();

    const data: Mission[] = raw;

    if (status === "draft") {
      setMissions(
        data.map((el) => ({
          id: el.id,
          mission_title: el.mission_title,
          mission_desc: el.mission_desc,
          priority_level: el.priority_level,
          status: el.status,
          start_time: el.start_time,
          end_time: el.end_time,
        })),
      );
    } else {
      setScheduledMissions(
        data.map((el) => ({
          id: el.id,
          mission_title: el.mission_title,
          mission_desc: el.mission_desc,
          priority_level: el.priority_level,
          status: el.status,
          start_time: el.start_time,
          end_time: el.end_time,
        })),
      );
    }

    return data;
  }

  async function getMissionPersonnel(id: string | null): Promise<Person[]> {
    const res = await fetch(`${API_URL}/missions/${id}/personnel`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();
    const data: Person[] = raw;

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

  async function getMissionAssets(id: string | null): Promise<Asset[]> {
    const res = await fetch(`${API_URL}/missions/${id}/assets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();
    const data: Asset[] = raw;

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

  async function getMissionObjectives(id: string | null): Promise<Objective[]> {
    const res = await fetch(`${API_URL}/missions/${id}/objectives`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch mission ${id}`);
    }

    const raw = await res.json();
    const data: Objective[] = raw;

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
      const res = await fetch(`${API_URL}/missions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the

      console.log(data);

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const scheduleMission = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/missions/${id}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      }); // issue is that role prop is capitalizedF

      if (!res.ok) throw new Error("Server error");

      if (id == viewId) {
        setAssets([]);
        setPersonnel([]);
        setObjectives([]);
      }

      const data = await res.json(); // parse the

      console.log(data); // uncertain about this

      setTrigger((prev) => !prev);

      await getMissions("draft");

      await getMissions("scheduled");

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const sendMissionInfo = async (
    obj: Record<string, string>,
  ): Promise<boolean> => {
    const res = await fetch(`${API_URL}/missions`, {
      method: "POST",
      body: JSON.stringify(obj),
      headers: {
        "X-User-ID": "12345",
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    });

    if (!res.ok) {
      setMissTitleErr("Mission title is already taken.");
      return false;
    }

    setMissTitleErr("Mission created.");
    const result = await res.json();
    setMissionId2(result.id);
    // setMissionCreated((prev) => !prev);

    await getMissions("draft");
    await new Promise((resolve) => setTimeout(resolve, 0));
    return true;
  };

  const sendAssets = async (obj: Asset[]) => {
    const response = await fetch(`${API_URL}/missions/${missionId2}/assets`, {
      method: "POST",
      body: JSON.stringify(obj),
      headers: {
        "X-User-ID": "12345",
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    });

    console.log(response);

    // const result = await response.text();
  };

  const sendPersonnel = async (obj: Person[]) => {
    const response = await fetch(
      `${API_URL}/missions/${missionId2}/personnel`,
      {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "X-User-ID": "12345",
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      },
    );

    console.log(response);
    // const result = await response.text();
  };

  const sendObjectives = async (obj: Objective[]) => {
    const response = await fetch(
      `${API_URL}/missions/${missionId2}/objectives`,
      {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "X-User-ID": "12345",
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      },
    );

    console.log(response);
    // const result = await response.text();
  };

  const sendMasterLog = async (
    mission: Record<string, string>,
    asset: Asset[],
    person: Person[],
    obj: Objective[],
  ) => {
    const masterItem = {
      missioninfo: mission,
      assets: asset,
      persons: person,
      objs: obj,
    };

    const response = await fetch(`${API_URL}/auditlogs`, {
      method: "POST",
      body: JSON.stringify({
        mission_id: missionId2,
        user_id: user?.user_id,
        data: masterItem,
      }),
      headers: {
        "X-User-ID": "12345",
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    });

    console.log(response);

    // const result = await response.text();

    setTrigger((prev) => !prev);
  };

  const MissionInfoRef = useRef<HTMLFormElement>(null);
  const PersonnelRef = useRef(null);
  const AssetsRef = useRef(null);
  const ObjectivesRef = useRef(null);

  let dataObj: Record<string, string> = {};

  const handleMasterSubmit = async () => {
    if (MissionInfoRef.current) {
      const formData = new FormData(MissionInfoRef.current);
      // let dataObj: Record<string, string> = {};
      formData.forEach((value, key) => {
        dataObj[key] = value.toString();
      });

      if (await sendMissionInfo(dataObj)) {
      }
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (missionId2) {
        (async () => {
          try {
            await sendAssets(formAssets);
          } catch (err) {
            console.error("Failed to fetch mission in useEffect:", err);
          }
        })();

        (async () => {
          try {
            await sendPersonnel(formPersonnel);
          } catch (err) {
            console.error("Failed to fetch mission in useEffect:", err);
          }
        })();

        (async () => {
          try {
            await sendObjectives(formObjectives);
          } catch (err) {
            console.error("Failed to fetch mission in useEffect:", err);
          }
        })();

        (async () => {
          try {
            await sendMasterLog(
              dataObj,
              formAssets,
              formPersonnel,
              formObjectives,
            );
          } catch (err) {
            console.error("Failed to fetch mission in useEffect:", err);
          }
        })();
      }
    }
  }, [missionId2]);

  useEffect(() => {
    if (!user) {
      setAssets([]);
      setPersonnel([]);
      setObjectives([]);
      setMissions([]);
      setScheduledMissions([]);
      setMissTitleErr("");
    }
  }, [user]);

  // user?.user_name will render as blank if user is null
  //  {user?.token}
  return (
    <>
      {/* <button onClick={() => setTrigger((prev) => !prev)}>Trigger</button> */}
      {user ? (
        <h2>
          You are logged in as: {user?.user_name} ID: {user?.user_id} Role:{" "}
          {user?.role}
        </h2>
      ) : (
        <h2>You are logged out</h2>
      )}

      {/* <h2>{missionId}</h2> */}
      <div style={styles.dash}>
        <div style={styles.twopanel}>
          <MissionInfo
            MissTitleErr={missTitleErr}
            ref={MissionInfoRef}
          ></MissionInfo>
          <Personnel
            personnel={formPersonnel}
            setPersonnel={setFormPersonnel}
            ref={PersonnelRef}
          ></Personnel>
        </div>

        <div>
          <Assets
            assets={formAssets}
            setAssets={setFormAssets}
            ref={AssetsRef}
          ></Assets>
          <Objectives
            objectives={formObjectives}
            setObjectives={setFormObjectives}
            ref={ObjectivesRef}
          ></Objectives>
        </div>
        <button onClick={() => handleMasterSubmit()}>Submit</button>
        <div style={styles.spacer}></div>

        <div style={styles.missiondetails}>
          <div style={styles.listcontainer1}>
            <ul>
              {missions.map((mission, index) => (
                <div style={styles.missioncard}>
                  <li key={index}>
                    <div style={styles.entry_element}>
                      {mission.id + " " + mission.mission_title}
                    </div>
                    <div style={styles.entry_element}>
                      {mission.mission_desc}
                    </div>
                    <div style={styles.entry_element}>
                      {mission.priority_level}
                    </div>
                    <div style={styles.entry_element}>{mission.start_time}</div>
                    <div style={styles.entry_element}>{mission.end_time}</div>
                    <div style={styles.buttons}>
                      <button
                        onClick={() => {
                          fetchMissionData(mission.id);
                          setViewId(mission.id);
                        }}
                      >
                        View
                      </button>
                      <button onClick={() => deleteMission(mission.id)}>
                        Delete
                      </button>
                      <button onClick={() => scheduleMission(mission.id)}>
                        Schedule
                      </button>
                    </div>
                  </li>
                </div>
              ))}
            </ul>
          </div>

          <>
            <div style={styles.listcontainer}>
              <div style={styles.header}> Personnel</div>
              <div style={styles.listcontainer2}>
                <ul>
                  {personnel.map((person, index) => (
                    <div style={styles.testcontainer}>
                      <li key={index}>
                        <div style={styles.entry_element}>
                          <span>Name: </span>
                          {person.name}
                        </div>
                        <div style={styles.entry_element}>
                          <span>Role: </span>
                          {person.role}
                        </div>
                        <div style={styles.entry_element}>
                          {person.assignment_time}
                        </div>
                        <div style={styles.entry_element}>{person.status}</div>
                        <div style={styles.entry_element}>
                          {" "}
                          <span>Clearance: </span>
                          {person.clearance_level}
                        </div>
                      </li>
                    </div>
                  ))}
                </ul>
              </div>
            </div>

            <div style={styles.listcontainer}>
              <div style={styles.header}>Assets</div>
              <div style={styles.listcontainer2}>
                <ul>
                  {assets.map((asset, index) => (
                    <div style={styles.testcontainer}>
                      <li key={index}>
                        <div style={styles.entry_element}>
                          <span>Type: </span>
                          {asset.asset_type}
                        </div>
                        <div style={styles.entry_element}>
                          <span>Status: </span>
                          {asset.status}
                        </div>
                        <div style={styles.entry_element}>
                          <span>Location: </span>
                          {asset.location}
                        </div>
                        <div style={styles.entry_element}>
                          <span>Cap: </span>
                          {asset.capabilities}
                        </div>
                      </li>
                    </div>
                  ))}
                </ul>
              </div>
            </div>

            <div style={styles.listcontainer}>
              <div style={styles.header}>Objectives</div>
              <div style={styles.listcontainer2}>
                <ul>
                  {objectives.map((objective, index) => (
                    <div style={styles.testcontainer}>
                      <li key={index} style={styles.list}>
                        <div style={styles.entry_element}>
                          <span>Desc: </span>
                          {objective.description}
                        </div>
                        <div style={styles.entry_element}>
                          {objective.status}
                        </div>
                        <div style={styles.entry_element}>
                          <span>Depends on: </span>
                          {objective.depends_on}
                        </div>
                        <div style={styles.entry_element}>
                          <span>Est. Duration: </span>
                          {objective.est_duration}
                        </div>
                        <div style={styles.entry_element}>
                          {objective.start_time}
                        </div>
                        <div style={styles.entry_element}>
                          {objective.end_time}
                        </div>
                      </li>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          </>
        </div>

        <div style={styles.scheduled}>
          {scheduledMissions.map(
            (
              mission, // got rid of index
            ) => (
              <>
                <div style={styles.splitgrid}>
                  <div>
                    <div style={styles.entry_element}>
                      {mission.id + " " + mission.mission_title}
                    </div>
                    <div style={styles.entry_element}>
                      {mission.mission_desc}
                    </div>
                    <div style={styles.entry_element}>
                      {mission.priority_level}
                    </div>
                    <div style={styles.entry_element}>{mission.start_time}</div>
                    <div style={styles.entry_element}>{mission.end_time}</div>
                    <div style={styles.buttons}></div>
                  </div>

                  <MissionProgress
                    key={mission.id}
                    missionId={mission.id}
                  ></MissionProgress>
                </div>
              </>
            ),
          )}
        </div>

        <ErrorBoundary fallback={<h2>Something went wrong.</h2>}>
          <AuditLogs trigger={trigger}></AuditLogs>
        </ErrorBoundary>
      </div>
    </>
  );
}

const styles: { [key: string]: CSSProperties } = {
  twopanel: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },

  missioncard: {
    border: "2px solid white",
  },
  splitgrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    height: "200px",
    border: "2px solid",
  },
  missiondetails: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    border: "2px solid white",
  },
  list: {
    marginBottom: "10px",
  },
  spacer: {
    height: "15px",
  },
  entry_element: {
    textAlign: "left",
  },

  dash: {
    width: "795px",
    height: "2700px",
    overflowY: "auto",
    border: "2px solid white",
  },
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
  listcontainer1: {
    display: "block",
    flexGrow: "1",
    height: "500px",
    overflowY: "auto",
    border: "2px solid white",
  },

  listcontainer2: {
    flexGrow: "1",
    height: "500px",
    overflowY: "auto",
  },

  listcontainer: {
    width: "190px",
    height: "500px",
  },
  scheduled: {
    height: "500px",
    width: "100%",
    overflowY: "auto",
    border: "2px solid white",
  },
  scheduled_list: {
    display: "inline-block",
    height: "500px",
    overflowY: "auto",
    border: "2px solid white",
  },
};
