import BottomSheet from './ui/BottomSheet';
import { NavLink } from 'react-router-dom';
import { Users, FileText, BarChart, LogOut, MapPin, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MoreMenuSheet({ isOpen, onClose, menuItems }) {
  const { handleLogout } = useAuth();
  
  // Secondary tabs
  const secondaryTabs = menuItems.filter(item => 
    !['Dashboard', 'Customers', 'Beats', 'Catalogue'].includes(item.name)
  );

  const getIcon = (name) => {
    switch(name) {
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Audit Trail': return <FileText className="w-5 h-5" />;
      case 'Sales': return <BarChart className="w-5 h-5" />;
      case 'Map View': return <MapPin className="w-5 h-5" />;
      case 'Collections': return <Wallet className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Menu">
      <div className="flex flex-col gap-1 pb-6">
        {secondaryTabs.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-colors min-h-[56px] ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`
            }
          >
            {getIcon(item.name)}
            <span className="text-base">{item.name}</span>
          </NavLink>
        ))}

        <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
        
        <button
          onClick={() => {
            onClose();
            handleLogout();
          }}
          className="flex items-center gap-4 px-4 py-4 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left min-h-[56px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-base">Logout</span>
        </button>
      </div>
    </BottomSheet>
  );
}
