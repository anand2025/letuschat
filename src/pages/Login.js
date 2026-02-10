//Login page of the chat webapp
//Enter your registered email address and password
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const { setCurrentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.access_token);
        setCurrentUser(data.user);
        navigate("/");
      } else {
        setErr(true);
      }
    } catch (err) {
      setErr(true);
    }
  };
  return (
    <div>
    <div className="formContainer">
    <h1>Welcome Back!</h1>
      <div className="formWrapper">
        <span className="logo">LetUsChat</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Enter your email" />
          <input type="password" placeholder="Password" />
          <button>Sign in</button>
          {err && <span>Oops! Something went wrong</span>}
        </form>
        <p>You don't have an account? <Link to="/Register">Register</Link></p>
      </div>
    </div>
    </div>
  );
};

export default Login;