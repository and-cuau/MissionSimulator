import React, { useState, useRef, useEffect, forwardRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Dropdown from "./Dropdown";

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




interface ObjectivesProps {
  objectives: Objective[];
  setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
}

const Objectives = forwardRef<HTMLFormElement, ObjectivesProps>(
  ({ objectives, setObjectives }, ref) => {
    const { missionId, setMissionId } = useAuth();
    const { user, setUser } = useAuth();

    // const [objectives, setObjectives] = useState<Objective[]>([]);

    useEffect(() => {
      const newObjective: Objective = {
        mission_id: "",
        description: "",
        status: "",
        depends_on: "0",
        est_duration: "",
        start_time: "",
        end_time: "",
      };
      setObjectives([newObjective]);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      console.log("test handle submit was called");
      e.preventDefault();

      const response = await fetch(
        `http://localhost:3000/missions/${missionId}/objectives`,
        {
          method: "POST",
          body: JSON.stringify(objectives),
          headers: {
            "X-User-ID": "12345",
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      const result = await response.text();
      console.log(result);
    };

    const handleChange = (
      index: number,
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const { name, value } = event.target;
      const updatedObjectives: Objective[] = [...objectives];
      updatedObjectives[index][name] = value;
      setObjectives(updatedObjectives);
    };

    const handleAddObjective = () => {
      // const lastItem = objectives[objectives.length - 1];

      const newObjective: Objective = {
        mission_id: "",
        description: "",
        status: "",
        depends_on: "",
        est_duration: "",
        start_time: "",
        end_time: "",
      };

      setObjectives([...objectives, newObjective]);
    };

    return (
      <>
        <form onSubmit={handleSubmit} ref={ref} style={styles.sectioncontainer}>
          <h2>Objectives</h2>
          <div style={styles.formcontainer}>
            {objectives.map((objective, index) => (
              <div style={styles.entry}>
                <div style={styles.inputcontainer}>
                  <span>Description: </span>
                  <input
                    name="description"
                    type="text"
                    value={objective.description}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div style={styles.inputcontainer}>
                  <span>Depends On: </span>
                  <input
                    name="depends_on"
                    type="text"
                    value={objective.depends_on}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
                <div style={styles.inputcontainer}>
                  <span>Estimated Duration: </span>
                  <input
                    name="est_duration"
                    type="text"
                    value={objective.est_duration}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>

                {/* <div style={styles.inputcontainer}>
                <span>Start Time: </span>
                <input
                  name="start_time"
                  type="datetime-local"
                  value={objective.start_time}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
              <div style={styles.inputcontainer}>
                <span>End Time: </span>
                <input
                  name="end_time"
                  type="datetime-local"
                  value={objective.end_time}
                  onChange={(e) => handleChange(index, e)}
                />
              </div> */}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddObjective}>
            Add Objective
          </button>
          {/* <button onClick={() => handleSubmit}>Submit</button> */}
        </form>
      </>
    );
  },
);

export default Objectives;

const styles = {
  formcontainer: {
    margin: "0px 0px 10px 0px",
    // border: "2px solid red",
    width: "350px",
    height: "180px",
    overflowY: "auto",
  },
  entry: {
    margin: "0px 0px 10px 0px",
  },
  sectioncontainer: {
    display: "inline-block",
    margin: "0px 20px",
    // border: "2px solid white",
    verticalAlign: "top",
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
