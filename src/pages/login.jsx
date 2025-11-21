// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, signInWithGoogle, signInWithGithub } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { email, password } = form;
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required!");
    if (!password) return toast.error("Password is required!");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // ✅ redirect after login
    } catch (err) {
      if (err.code === "auth/invalid-email") toast.error("Invalid email!");
      else if (err.code === "auth/user-not-found") toast.error("User not registered!");
      else if (err.code === "auth/wrong-password") toast.error("Wrong password!");
      else toast.error("Login failed. Try again.");
    }
  };

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error.message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={email} placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" value={password} placeholder="Password" onChange={handleChange} />
        <button type="submit">Login</button>
      </form>

      <ToastContainer />

      <hr />
      <button onClick={signInWithGoogle}>Login with Google</button>
      <button onClick={signInWithGithub}>Login with GitHub</button>

      <p>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
