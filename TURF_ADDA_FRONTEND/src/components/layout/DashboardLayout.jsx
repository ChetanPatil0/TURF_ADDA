import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import useAuthStore from '../../store/authStore';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase() || 'player';

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="h-screen w-full overflow-hidden bg-[var(--color-bg-default)]">
      <Header
        onMobileMenuToggle={toggleMobile}
        role={role}
        user={user}
      />

      <div className="flex pt-16 h-[calc(100vh-4rem)]">
        <Sidebar
          variant="desktop"
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-default)] transition-all duration-300">
          <div className="container mx-auto ">
            <Outlet />
          </div>
        </main>
      </div>

      {mobileOpen && (
        <Sidebar
          variant="mobile"
          mobileOpen={mobileOpen}
          onClose={closeMobile}
        />
      )}
    </div>
  );
}