import { Outlet } from "react-router-dom";

const AuthLayouts = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 min-h-screen flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayouts; 