import "./App.css";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Dashboard";
import Signup from "./components/Signup";
import LogIn from "./components/LogIn";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<LogIn role="Admin" />} />
          <Route path="/commander" element={<LogIn role="Commander" />} />
          <Route path="/operator" element={<LogIn role="Operator" />} />
          <Route path="/observer" element={<LogIn role="Observer" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
