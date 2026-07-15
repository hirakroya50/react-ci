import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import {
  LogOut,
  LayoutDashboard,
  User,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate("/");
      setMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isHomeRoute = location.pathname === "/";
  const navbarStateClass = scrolled || !isHomeRoute ? "scrolled" : "";

  return (
    <nav className={`navbar ${navbarStateClass} transition-all! duration-300!`}>
      <div className="nav-inner max-w-7xl! mx-auto px-4! sm:px-6! lg:px-8!">
        <Link
          to="/"
          className="nav-logo flex items-center gap-2! group"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-8! h-8! bg-gradient-to-br! from-indigo-600! to-indigo-500! rounded-lg! flex items-center justify-center text-white font-bold group-hover:scale-110! transition-transform! shadow-sm!">
            N
          </div>
          <span className="text-xl font-black text-[var(--heading)]! tracking-tighter">
            Nexus
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8!">
          {session && (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2! text-sm font-bold transition-colors ${isActive("/dashboard") ? "text-indigo-600!" : "text-[var(--text-muted)]! hover:text-[var(--heading)]!"}`}
              >
                <LayoutDashboard size={16} />
                Workspace
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2! text-sm font-bold transition-colors ${isActive("/profile") ? "text-indigo-600!" : "text-[var(--text-muted)]! hover:text-[var(--heading)]!"}`}
              >
                <User size={16} />
                Profile
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3!">
          <button
            type="button"
            className="p-2! rounded-xl! bg-[var(--bg2)]! text-[var(--text-muted)]! hover:text-indigo-600! transition-colors"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2! px-4! py-2! rounded-xl! bg-red-50! text-red-600! dark:bg-red-950/20! text-sm font-bold hover:bg-red-100! transition-colors shadow-sm!"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary px-6! py-2! rounded-xl! text-sm font-bold shadow-indigo-500/20!"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            className="md:hidden p-2! text-[var(--heading)]!"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[72px]! left-0 right-0 bg-[var(--surface)]! border-b border-[var(--border)]! p-6! md:hidden shadow-xl!"
          >
            <div className="flex flex-col gap-4!">
              {session ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3! p-3! rounded-xl! bg-[var(--bg2)]! font-bold text-[var(--heading)]!"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={20} className="text-indigo-600" />
                    Workspace
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3! p-3! rounded-xl! bg-[var(--bg2)]! font-bold text-[var(--heading)]!"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={20} className="text-indigo-600" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-3! p-3! rounded-xl! bg-red-50! text-red-600! font-bold"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary w-full! justify-center! py-3!"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
