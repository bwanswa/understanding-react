// src/pages/Profile.jsx
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const Profile = () => {
  const [user] = useAuthState(auth);

  if (!user) return <p>No user logged in.</p>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.displayName || "N/A"}</p>
      <p>Email: {user.email}</p>
      <p>UID: {user.uid}</p>
    </div>
  );
};

export default Profile;
