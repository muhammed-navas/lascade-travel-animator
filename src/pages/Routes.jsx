import "mapbox-gl/dist/mapbox-gl.css";
import Header from "../components/layout/Header";
import Sidebar from "../components/common/Sidebar";
import Map from "../components/common/Map";
import { WaypointsProvider } from "../context/WaypointsContext";

function Home() {
  return (
    <WaypointsProvider>
      <div className="min-h-screen bg-[#000000]">
        <Header />
        <div className="flex gap-4 p-4">
          <Sidebar />
          <div className="flex-1 rounded-2xl overflow-hidden">
            <Map />
          </div>
        </div>
      </div>
    </WaypointsProvider>
  );
}

export default Home;
