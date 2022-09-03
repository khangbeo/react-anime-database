import { Routes, Route } from "react-router-dom";
import AnimeCardDetail from "./components/AnimeCardDetail";

import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  

  return (
    <Drawer>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/anime/:id" element={<AnimeCardDetail />} />
        </Routes>
      </div>
    </Drawer>
  );
}

export default App;
