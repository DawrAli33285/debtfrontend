import { Link } from 'react-router-dom';

import logo from '../assets/logo.jpg';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center">
   <Link to={window.location.pathname.includes('/agency') ? '/agency/dashboard' : '/dashboard'}>
      <img
        src={logo}
        alt="Logo"
        className="h-32 w-auto object-contain"
      />
    </Link>
  </nav>
  );
}