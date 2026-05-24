import { Outlet } from "react-router-dom";

const AuthLayouts = () => {
  return (
    <div className="min-h-screen w-full bg-gray-500 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayouts; 