import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

export default function Home() {
  return (
    <div className="flex p-5">
      <Sidebar />
      <MainContent />
    </div>
  );
}
