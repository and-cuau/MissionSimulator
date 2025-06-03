import React, { useState, useEffect } from "react";
import axios from "axios";

type ChildProps = {
  NewUsernameProp: string;
};

const TwoFASetup: React.FC<ChildProps> = ({ NewUsernameProp }) => {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendCode();
  }

  async function getQR() {
    console.log("2fa setup prop:");
    console.log(NewUsernameProp);
    const user = "andre";
    console.log("getQR ran");
    const res = await fetch(
      `http://localhost:3000/auth/2fa/setup?user=${NewUsernameProp}`,
      {
        method: "GET",
        headers: {
          "X-User-ID": "12345",
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch`);
    }

    const raw = await res.json();
    setImageUrl(raw.qr);
  }

  async function sendCode() {
    const res = await fetch(`http://localhost:3000/auth/2fa/verify/setup`, {
      method: "POST",
      body: JSON.stringify({
        user: NewUsernameProp,
        token: code,
      }),
      headers: {
        "X-User-ID": "12345",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch`);
    }

    const raw = await res.json();

    setSuccess(raw.success);
  }

  useEffect(() => {
    // getQR();

    // Optional cleanup function (like componentWillUnmount)
    return () => {
      console.log("Cleanup before next effect or unmount");
    };
  }, []); // Effect runs when `count` changes

  return (
    <>
      {success ? (
        <>2FA Enabled Succesfully</>
      ) : (
        <>
          <img src={imageUrl}></img>
          <button onClick={() => getQR()}>Test</button>

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
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </>
      )}
    </>
  );
};

export default TwoFASetup;
