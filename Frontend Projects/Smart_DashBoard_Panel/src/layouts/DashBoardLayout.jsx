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

        {/* The Scrollable Canvas: 
          flex-1 takes up the remaining height. overflow-y-auto allows 
          ONLY this specific section to scroll when you have long tables. 
        */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <main className="max-w-7xl mx-auto h-full">
            {/* React Router will inject Sales, Customers, etc., right here */}
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
};

export default DashBoardLayout;