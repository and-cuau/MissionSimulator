import React, { useEffect, forwardRef, CSSProperties } from "react";
import { useApi } from '../contexts/APIContext';
import { useAuth } from "../contexts/AuthContext";
// import Dropdown from "./Dropdown";

interface Person {
  mission_id: string;
  name: string;
  role: string;
  assignment_time: string;
  status: string;
  clearance_level: string;
  [key: string]: string;
}

interface PersonnelProps {
  personnel: Person[];
  setPersonnel: React.Dispatch<React.SetStateAction<Person[]>>;
}

//const API_URL = process.env.REACT_APP_API_URL || "https://amiable-caring-production.up.railway.app";
// const API_URL = "http://localhost:3000";
// const API_URL = "api";
// const API_URL = 'http://localhost:8080/api';


const Personnel = forwardRef<HTMLFormElement, PersonnelProps>(
  ({ personnel, setPersonnel }, ref) => {
    const { api_url } = useApi();
    const { missionId } = useAuth();
    const { user } = useAuth();

    // const [personnel, setPersonnel] = useState<Person[]>([]);

    useEffect(() => {
      const newPerson: Person = {
        mission_id: "",
        name: "Andre",
        role: "squadleader",
        assignment_time: "",
        status: "",
        clearance_level: "confidential",
      };
      setPersonnel([newPerson]);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      console.log("test handle submit was called");
      e.preventDefault();

      console.log(personnel);

      const response = await fetch(
        `${api_url}/missions/${missionId}/personnel`,
        {
          method: "POST",
          body: JSON.stringify(personnel),
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
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const { name, value } = event.target;
      const updatedPersonnel: Person[] = [...personnel];
      updatedPersonnel[index][name] = value;
      setPersonnel(updatedPersonnel);
    };

    const handleAddPerson = () => {
      const newPerson: Person = {
        mission_id: "",
        name: "Andre",
        role: "squadleader",
        assignment_time: "",
        status: "",
        clearance_level: "confidential",
      };

      setPersonnel([...personnel, newPerson]);
    };

    return (
      <>
        <form onSubmit={handleSubmit} ref={ref} style={styles.sectioncontainer}>
          <h2>Personnel</h2>
          <div style={styles.formcontainer}>
            {personnel.map((person, index) => (
              <div style={styles.entry}>
                <div style={styles.inputcontainer}>
                  <span>Name: </span>
                  <input
                    name="name"
                    type="text"
                    value={person.name}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>

                <div style={styles.inputcontainer}>
                  <span>Role: </span>
                  <select
                    name="role"
                    value={person.role}
                    onChange={(e) => handleChange(index, e)}
                  >
                    <option value="squadleader">Squad Leader</option>
                    {/* <option value="">Select</option> */}

                    <option value="rifleman">Rifleman</option>
                    <option value="heavygunner">Heavy Gunner</option>
                    <option value="sniper">Sniper</option>
                    <option value="demolitionsexpert">
                      Demolitions Expert
                    </option>
                    <option value="combatmedic">Combat Medic</option>
                    <option value="techspecialist">Tech Specialist</option>
                    <option value="pilotdriver">Pilot/Driver</option>
                    <option value="commander">Commander</option>
                  </select>
                </div>

                <div style={styles.inputcontainer}>
                  <span>Clearance Level: </span>
                  <select
                    name="clearance_level"
                    value={person.clearance_level}
                    onChange={(e) => handleChange(index, e)}
                  >
                    {/* <option value="">Select</option> */}
                    {/* <option value="none">None</option> */}
                    <option value="confidential">Confidential</option>
                    <option value="secret">Secret</option>
                    <option value="top_secret">Top Secret</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddPerson}>
            Add Person
          </button>
          {/* <button onClick={() => handleSubmit}>Submit</button> */}
        </form>
      </>
    );
  },
);

export default Personnel;

const styles: { [key: string]: CSSProperties } = {
  formcontainer: {
    // margin: "0px 0px 10px 0px",
    // // border: "2px solid red",
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
    // verticalAlign: "top",
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
