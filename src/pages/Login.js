//Login page of the chat webapp
//Enter your registered email address and password
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/")
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