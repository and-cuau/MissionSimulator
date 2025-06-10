import { useState } from "react";
// import "../Admin.css";
import { useAuth } from "../contexts/AuthContext";

import TwoFASetup from "./2fa-setup";

interface User {
  user_name: string;
  user_id: string;
  role: "admin" | "commander" | "operator" | "observer";
  token: string;
}

type MissionProgressProps = {
  role: string;
};

//const API_URL = process.env.REACT_APP_API_URL || "https://amiable-caring-production.up.railway.app";
const API_URL = "http://localhost:3000";

export default function LogIn({ role }: MissionProgressProps) {
  const { setUser } = useAuth();
  const [newusername, setNewusername] = useState<string>("");
  const [newpassword, setNewpassword] = useState<string>("");

  const [uname, setUname] = useState<string>("");
  const [pword, setPword] = useState<string>("");

  const [showPassword1, setShowPassword1] = useState<Boolean>(false);
  const [showPassword, setShowPassword] = useState<Boolean>(false);

  const [signupSuccessful, setSignupSuccessful] = useState<Boolean>(false);

  const [loginSuccess, setLoginSuccess] = useState<Boolean>(false);

  const [twoFASuccess, setTwoFASuccess] = useState<Boolean>(false);

  const [errMsg, setErrMessage] = useState<string>("");

  const [code, setCode] = useState<string>("");

  console.log("LOGIN COMPONENT CODE RAN");

  const sendUser = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // sent username and password in body for security purposes
          username: newusername,
          password: newpassword,
          role: role.toLowerCase(),
        }),
      }); // issue is that role prop is capitalized

      if (!res.ok) throw new Error("Server error");

      setSignupSuccessful(true);

      const data = await res.json(); // parse the
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
      const res = await fetch(`${API_URL}/users/login`, {
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

        // localStorage.setItem("token", data.token); // JSON.stringify was causing the token alteration problem. its not necessary and it adds extra quotes

        // const data2: User = {
        //   user_name: data.userInfo.username,
        //   role: data.userInfo.role,
        //   user_id: data.userInfo.id,
        //   token: data.token,
        // };

        // console.log("logged in user:");
        // console.log(data2);

        // setUser(data2);

        setLoginSuccess(true);

        return { success: true, data }; // contains userInfo + token
      } else {
        setErrMessage("Incorrect username or password.");
        console.warn("Login failed:", data.error);
        return { success: false, error: data.error };
      }

      // return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleChange = () => {
    setIsChecked(!isChecked);
  };

  async function sendCode() {
    const res = await fetch(`${API_URL}/auth/2fa/verify/login`, {
      method: "POST",
      body: JSON.stringify({
        user: uname,
        token: code,
      }),
      headers: {
        "X-User-ID": "12345",
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Failed to fetch`);
    }

    localStorage.setItem("token", data.token); // JSON.stringify was causing the token alteration problem. its not necessary and it adds extra quotes

    const data2: User = {
      user_name: data.userInfo.username,
      role: data.userInfo.role,
      user_id: data.userInfo.id,
      token: data.token,
    };

    console.log("logged in user:");
    console.log(data2);

    setUser(data2);
    setTwoFASuccess(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    sendCode();
    e.preventDefault();
  }

  return (
    <>
      <h1>{role}</h1>

      <div className="doublepanel" style={styles.doublepanel}>
        {signupSuccessful ? (
          isChecked ? (
            <div className="panel" style={styles.panel}>
              <TwoFASetup NewUsernameProp={newusername}></TwoFASetup>
            </div>
          ) : (
            <div>You have succesfully signed-up.</div>
          )
        ) : (
          <>
            <div className="panel" style={styles.panel}>
              <h2>Sign up</h2>

              <p>New username:</p>
              <input
                className="createuname"
                placeholder="username"
                type="text"
                value={newusername}
                onChange={(e) => setNewusername(e.target.value)}
              ></input>

              <p>New password:</p>
              <input
                className="createpword"
                placeholder="password"
                type={showPassword1 ? "text" : "password"}
                value={newpassword}
                onChange={(e) => setNewpassword(e.target.value)}
              ></input>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleChange}
                  />
                  Enable 2FA
                </label>
                {/* <p>{isChecked ? "Subscribed ✅" : "Not Subscribed ❌"}</p> */}
              </div>
              <button onClick={() => sendUser()}>Enter</button>
            </div>
          </>
        )}

        {loginSuccess ? (
          twoFASuccess ? (
            <div className="panel">2FA Successful. You are now logged in.</div>
          ) : (
            <div className="panel">
              <form onSubmit={handleSubmit}>
                <label htmlFor="token">Enter 6-digit code:</label>
                <input
                  id="token"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                ></input>
                <button type="submit">Verify</button>
                {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
              </form>
            </div>
          )
        ) : (
          <div className="panel" style={styles.panel}>
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
              type={showPassword ? "text" : "password"}
              value={pword}
              onChange={(e) => setPword(e.target.value)}
            ></input>

            <div>
              <span>{errMsg}</span>
            </div>

            <div>
              <button
                onClick={() => {
                  checkUser(uname, pword);
                }}
              >
                Enter
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  doublepanel: {
    display: "flex",
    width: "800px",
    border: "2px solid red",
  },
  panel: {
    flexGrow: 1,
    display: "block",
    border: "2px solid red",
  },
  input: {
    display: "block",
    margin: "0 auto",
  },
  button: {
    margin: "16px 0",
  },
};
