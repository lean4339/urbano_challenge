import { BookOpen, Home, LogOut, Users } from 'react-feather';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import sideBarBg from '../../assets/sidemenu-bg.jpg';
import logo from '../../assets/urbano-logo-white.png';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/AuthService';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  className: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const history = useHistory();

  const { authenticatedUser, setAuthenticatedUser } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    setAuthenticatedUser(null);
    history.push('/login');
  };

  return (
    <div
      className={'sidebar ' + className}
      style={{ backgroundImage: `url(${sideBarBg})` }}
    >
      <Link to="/" className="no-underline text-black">
        <img
          src={logo}
          alt="Urbano logo"
          style={{ backgroundColor: 'transparent' }}
        />
      </Link>
      <nav className="mt-5 flex flex-col gap-3  flex-grow">
        <SidebarItem className="bg:brand-bg-primary" to="/">
          <Home /> Dashboard
        </SidebarItem>
        <SidebarItem className="bg:brand-bg-primary" to="/courses">
          <BookOpen /> Courses
        </SidebarItem>
        {authenticatedUser.role === 'admin' ? (
          <SidebarItem className="bg:brand-bg-primary" to="/users">
            <Users /> Users
          </SidebarItem>
        ) : null}
      </nav>
      <button
        className="text-red-500 rounded-md p-3 transition-colors flex gap-3 justify-center items-center font-semibold focus:outline-none"
        onClick={handleLogout}
      >
        <LogOut /> Logout
      </button>
    </div>
  );
}
