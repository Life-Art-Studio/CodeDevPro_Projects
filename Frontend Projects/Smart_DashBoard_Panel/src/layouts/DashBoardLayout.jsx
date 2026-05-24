import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/Profile";
import SettingsPanel from "../components/Settings";
import Footer from "../components/Footer";

const DashBoardLayout = () => {
  return (
    // Master Container: Full screen, prevents the whole browser window from scrolling
    <div className="h-screen w-full flex overflow-hidden bg-transparent transition-colors duration-500">
      {/* Sidebar Wrapper */}
      <div className="shrink-0 md:block z-30">
        <Sidebar />
      </div>

      <div className="absolute z-50 right-0">
        <ProfilePanel />
      </div>
      <div className="absolute z-50 right-0">
        <SettingsPanel />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col w-full bg-transparent">
        {/* Topbar */}
        <div className="h-16 shrink-0 z-10">
          <Topbar />
        </div>

        {/* Content Canvas */}
        <div className="flex-1 w-full relative h-full flex flex-col">
          <main className="flex-1 w-full h-full overflow-y-auto">
            <Outlet />
          </main>
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashBoardLayout;