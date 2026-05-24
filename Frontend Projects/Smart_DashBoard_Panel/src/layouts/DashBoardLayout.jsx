import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
// We will build the Topbar next, but we need to import it now!
import Topbar from "../components/Topbar"; 
import ProfilePanel from "../components/Profile";
import SettingsPanel from "../components/Settings";

const DashBoardLayout = () => {
  return (
    // Master Container: Full screen, prevents the whole browser window from scrolling
    <div className="h-screen w-full flex overflow-hidden bg-transparent transition-colors duration-500">
      
      {/* Sidebar Wrapper: 
        We lock the width to 64 units (256px) and use flex-shrink-0 
        so it never gets squished on smaller screens. 
      */}
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
        
        {/* Topbar Wrapper: Fixed height of 16 units (64px) */}
        <div className="h-16 shrink-0 z-10">
          <Topbar />
        </div>

        {/* The Full Canvas: 
          flex-1 takes up the remaining height. Child components (pages) 
          are responsible for adding padding and overflow-y-auto. 
        */}
        <div className="flex-1 w-full relative h-full">
          <main className="w-full h-full">
            {/* React Router will inject Sales, Customers, etc., right here */}
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
};

export default DashBoardLayout;