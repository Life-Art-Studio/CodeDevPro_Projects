import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Package, Menu } from 'lucide-react';

export default function BottomNav({ onMoreClick, menuItems }) {
  // We extract the primary 4 tabs.
  const primaryTabs = menuItems.filter(item => 
    ['Dashboard', 'Customers', 'Beats', 'Catalogue'].includes(item.name)
  ).slice(0, 4);

  const getIcon = (name) => {
    switch(name) {
      case 'Dashboard': return <LayoutDashboard className="w-6 h-6" />;
      case 'Customers': return <Users className="w-6 h-6" />;
      case 'Beats': return <Map className="w-6 h-6" />;
      case 'Catalogue': return <Package className="w-6 h-6" />;
      default: return <LayoutDashboard className="w-6 h-6" />;
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-stretch h-16">
        {primaryTabs.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center justify-center gap-1 relative text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                {getIcon(item.name)}
                <span className="text-[10px]">{item.name}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-b-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
        
        {/* More Tab */}
        <button
          onClick={onMoreClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 relative text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors min-h-[44px]"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </div>
  );
}
