import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
function App() {
  return (
    <h1>Hello World from React!</h1>
  );
}
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      {/* Link to Page 2 */}
      <Link to="/page2">Go to Page 2</Link>
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


export default App;

