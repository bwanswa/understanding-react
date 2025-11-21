// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, signInWithGoogle, signInWithGithub } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const { fullName, email, password } = form;
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) return toast.error("Full Name is required!");
    if (!email) return toast.error("Email is required!");
    if (!password) return toast.error("Password is required!");
    if (password.length < 8) return toast.error("Password must be at least 8 characters!");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // ✅ redirect after signup
    } catch (err) {
      if (err.code === "auth/email-already-in-use") toast.error("Email already registered!");
      else toast.error("Registration failed. Try again.");
    }
  };

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: "red" }}>{error.message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" value={fullName} placeholder="Full Name" onChange={handleChange} />
        <input type="email" name="email" value={email} placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" value={password} placeholder="Password" onChange={handleChange} />
        <button type="submit">Register</button>
      </form>

      <ToastContainer />

      <hr />
      <button onClick={signInWithGoogle}>Register with Google</button>
      <button onClick={signInWithGithub}>Register with GitHub</button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
