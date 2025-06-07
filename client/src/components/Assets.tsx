import React, { useEffect, forwardRef, CSSProperties } from "react";
import { useAuth } from "../contexts/AuthContext";
// import Dropdown from "./Dropdown";

interface Asset {
  mission_id: string;
  asset_type: string;
  status: string;
  location: string;
  capabilities: string;
  [key: string]: string;
}

interface AssetsProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const API_URL = process.env.REACT_APP_API_URL || "https://amiable-caring-production.up.railway.app";
// const API_URL = "http://localhost:3000";

const Assets = forwardRef<HTMLFormElement, AssetsProps>(
  ({ assets, setAssets }, ref) => {
    const { missionId } = useAuth();
    const { user } = useAuth();
    // const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
      const newAsset: Asset = {
        mission_id: "",
        asset_type: "",
        status: "ready",
        location: "",
        capabilities: "",
      };
      setAssets([newAsset]);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      console.log("test handle submit was called");
      e.preventDefault();

      console.log(assets);

      const response = await fetch(
        `${API_URL}/missions/${missionId}/assets`,
        {
          method: "POST",
          body: JSON.stringify(assets),
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
      const updatedAssets: Asset[] = [...assets];
      updatedAssets[index][name] = value;
      setAssets(updatedAssets);
    };

    const handleAddAsset = () => {
      const newAsset: Asset = {
        mission_id: "",
        asset_type: "",
        status: "",
        location: "",
        capabilities: "",
      };

      setAssets([...assets, newAsset]);
    };

    return (
      <>
        <form onSubmit={handleSubmit} ref={ref} style={styles.sectioncontainer}>
          <h2>Assets</h2>
          <div style={styles.formcontainer}>
            {assets.map((asset, index) => (
              <div style={styles.entry}>
                <div style={styles.inputcontainer}>
                  <span>Asset Type: </span>
                  <select
                    name="asset_type"
                    value={asset.asset_type}
                    onChange={(e) => handleChange(index, e)}
                  >
                    <option value="">Select</option>
                    <option value="truck">Truck</option>
                    <option value="drone">Drone</option>
                    <option value="helicopter">Helicopter</option>
                    <option value="radio">Radio</option>
                    <option value="camera">Camera</option>
                    <option value="generator">Generator</option>
                    <option value="laptop">Laptop</option>
                    <option value="toolkit">Toolkit</option>
                    <option value="med_kit">Med Kit</option>
                    <option value="supply_crate">Supply Crate</option>
                  </select>
                </div>

                {/* <div style={styles.inputcontainer}>
                <span>Status: </span>
                <Dropdown
                  options={[
                    "available",
                    "asigned",
                    "in use",
                    "maintenance",
                    "damaged",
                    "decomissioned",
                    "lost",
                  ]}
                ></Dropdown>
              </div> */}

                <div style={styles.inputcontainer}>
                  <span>Location: </span>
                  <input
                    name="location"
                    type="text"
                    value={asset.location}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>

                <div style={styles.inputcontainer}>
                  <span>Capabilities: </span>
                  <input
                    name="capabilities"
                    type="text"
                    value={asset.capabilities}
                    onChange={(e) => handleChange(index, e)}
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddAsset}>
            Add Asset
          </button>
          {/* <button onClick={() => handleSubmit}>Submit</button> */}
        </form>
      </>
    );
  },
);

export default Assets;

const styles: { [key: string]: CSSProperties } = {
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

// asset_type
//status
//location
//capabilities
