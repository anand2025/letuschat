//Register page of the chat webapp
//Enter your display name, email address, password and profile photo to create an acccount
import React, { useState, useContext } from "react";
import Add from "../img/addAvatar1.png";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      const formData = new FormData();
      formData.append("display_name", displayName);
      formData.append("email", email);
      formData.append("password", password);
      if (file) formData.append("file", file);

      const res = await fetch("http://localhost:8000/register", {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
    <h1>Welcome to LetUsChat!</h1>
      <div className="formWrapper">
        <span className="logo">LetUsChat</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="Display name" />
          <input required type="email" placeholder="Enter your email" />
          <input required type="password" placeholder="Password" />
          <input required style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <img src={Add} alt="" />
            <span>Add an avatar</span>
          </label>
          <button disabled={loading}>Sign up</button>
          {loading && "You have successfully signed up!"}
          {err && <span>Oops! Something went wrong</span>}
        </form>
        <p>
          You do have an account? <Link to="/Login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;