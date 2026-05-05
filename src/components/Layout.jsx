import LangToggle from './LangToggle';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <LangToggle/>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}