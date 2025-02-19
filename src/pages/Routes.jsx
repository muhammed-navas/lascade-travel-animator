import "mapbox-gl/dist/mapbox-gl.css";
import Header from "../components/layout/Header";
import Sidebar from "../components/common/Sidebar";
import Map from "../components/common/Map";

function Home() {
  return (
    <div className="min-h-screen bg-[#000000]">
      <Header />
      <div className="flex h-[89vh] gap-4 p-4">
        <Sidebar />
        <div className="flex-1 rounded-2xl relative h-full">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default Home;
