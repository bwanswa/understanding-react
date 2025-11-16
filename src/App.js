import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

function Home() {
  const [signupUser, setSignupUser] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupUser, signupPass);
      console.log("Signup success:", userCredential.user);
    } catch (error) {
      console.error("Signup error:", error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginUser, loginPass);
      console.log("Login success:", userCredential.user);
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  return (
    <div>
      <h1>Hello World</h1>

      <h2>Create Account</h2>
      <form onSubmit={handleSignup}>
        <input type="email" placeholder="Email" value={signupUser} onChange={(e) => setSignupUser(e.target.value)} />
        <input type="password" placeholder="Password" value={signupPass} onChange={(e) => setSignupPass(e.target.value)} />
        <button type="submit">Sign Up</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
        <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Home;
