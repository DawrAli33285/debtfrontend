import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center">
    <Link to="/">
      <img
        src="/logo.jpg"
        alt="Logo"
        className="h-32 w-auto object-contain"
      />
    </Link>
  </nav>
  );
}