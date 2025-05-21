import { useEffect, useRef, useState } from "react";
// import "../Observer.css";
import { useAuth } from "../contexts/AuthContext";

interface User {
  user_name: string;
  user_id: string;
  role: "admin" | "commander" | "operator" | "observer";
  token: string;
}

export default function Observer() {
  const { user, setUser } = useAuth();
  const [newusername, setNewusername] = useState("");
  const [newpassword, setNewpassword] = useState("");

  const [uname, setUname] = useState("");
  const [pword, setPword] = useState("");

  const sendUser = async () => {
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newusername,
          password: newpassword,
          role: "observer",
        }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const checkUser = async (username: string, password: string) => {
    console.log("username: " + username);
    console.log("password: " + password);
    try {
      const res = await fetch(`http://localhost:3000/users/observer/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      if (res.ok) {
        console.log("Login successful:", data);

        localStorage.setItem("token", data.token); // JSON.stringify was causing the token alteration problem. its not necessary and it adds extra quotes

        const data2: User = {
          user_name: data.userInfo.username,
          role: "observer",
          user_id: data.userInfo.id,
          token: data.token,
        };

        console.log(data2);

        setUser(data2);

        return { success: true, data }; // contains userInfo + token
      } else {
        console.warn("Login failed:", data.error);
        return { success: false, error: data.error };
      }

      // return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  return (
    <>
      <h1>Observer</h1>

      <div className="doublepanel" style={styles.doublepanel}>
        <div className="panel" style={styles.panel}>
          <h2>Sign up</h2>

          <p>New username:</p>
          <input
            className="createuname"
            placeholder="username"
            value={newusername}
            onChange={(e) => setNewusername(e.target.value)}
          ></input>

          <p>New password:</p>
          <input
            className="createpword"
            placeholder="password"
            value={newpassword}
            onChange={(e) => setNewpassword(e.target.value)}
          ></input>
          <button onClick={() => sendUser()}>Enter</button>
        </div>

        <div className="panel">
          <h2>Log in</h2>
          <p>Username:</p>
          <input
            className="createuname"
            placeholder="username"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
          ></input>

          <p>Password:</p>

          <input
            className="createpword"
            placeholder="password"
            value={pword}
            onChange={(e) => setPword(e.target.value)}
          ></input>
          <button onClick={() => checkUser(uname, pword)}>Enter</button>
        </div>
      </div>
    </>
  );
}

const styles = {
  doublepanel: {
    display: "flex",
    width: "500px",
  },
  panel: {
    flexGrow: 1,
    display: "block",
  },
  input: {
    display: "block",
    margin: "0 auto",
  },
  button: {
    margin: "16px 0",
  },
};
