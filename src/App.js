import { Routes, Route } from "react-router-dom";
import AnimeCardDetail from "./components/AnimeCardDetail";

import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Drawer>
      <Navbar />
      <div className="px-5 xl:px-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeCardDetail />} />
        </Routes>
      </div>
      <Footer />
    </Drawer>
  );
}

export default App;
