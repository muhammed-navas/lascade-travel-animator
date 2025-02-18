import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Routes";
import { WaypointsProvider } from "./context/WaypointsContext";

function App() {
  return (
    <WaypointsProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </WaypointsProvider>
  );
}

export default App;
