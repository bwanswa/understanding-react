import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

function Home() {
  // State for signup
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');

  // State for login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    console.log('Signup:', signupUser, signupPass);
    // Later: send to PHP API or Firebase
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login:', loginUser, loginPass);
    // Later: send to PHP API or Firebase
  };

  return (
    <div>
      <h1>Hello World</h1>
      <Link to="/page2">Go to Page 2</Link>

      <h2>Create Account</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={signupUser}
          onChange={(e) => setSignupUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={signupPass}
          onChange={(e) => setSignupPass(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={loginUser}
          onChange={(e) => setLoginUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPass}
          onChange={(e) => setLoginPass(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function Page2() {
  return (
    <div>
      <h1>This is Page 2</h1>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page2" element={<Page2 />} />
      </Routes>
    </Router>
  );
}

export default App;
