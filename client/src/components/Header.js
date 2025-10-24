import React, { useState, useEffect } from 'react';
import {
  FiUserPlus, FiMenu, FiX, FiUser, FiSettings,
  FiHelpCircle, FiLogOut, FiChevronDown, FiDatabase,
  FiCode, FiLayers, FiZap
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../images/hlogo.png';

const Header = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { name: 'Features', href: '#features', icon: FiZap },
    { name: 'Database', href: '#database', icon: FiDatabase },
    { name: 'Docs', href: '#docs', icon: FiCode },
    { name: 'About', href: '#about', icon: FiLayers },
  ];

  const profileMenuItems = [
    { label: 'My Profile', icon: FiUser },
    { label: 'Settings', icon: FiSettings },
    { label: 'Help', icon: FiHelpCircle },
    { label: 'Sign Out', icon: FiLogOut, action: onLogout, isLast: true },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      className="fixed w-full z-50 transition-all duration-300"
      style={{ top: '0.5cm' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <nav className={`relative transition-all duration-500 ${isScrolled
          ? 'bg-white/90 backdrop-blur-3xl shadow-2xl border border-white/50 rounded-full px-8 py-2.5'
          : 'bg-white/95 backdrop-blur-2xl shadow-xl border border-white/40 rounded-full px-8 py-2.5'
          }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="Tova AI Logo"
                  className="h-8 w-auto drop-shadow-lg"
                />
              </div>
              <div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-semibold transition-all rounded-full hover:bg-gray-100/80 flex items-center space-x-2"
                >
                  <item.icon size={16} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {user ? (
                /* Profile Menu */
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60 rounded-full hover:from-blue-100 hover:to-purple-100 transition-all shadow-lg hover:shadow-xl"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                      {user.firstName} {user.lastName}
                    </span>
                    <FiChevronDown
                      className={`text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                      size={16}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 py-3 z-50"
                      >
                        {profileMenuItems.map((item, index) => (
                          <motion.button
                            key={item.label}
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              if (item.action) item.action();
                              setProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all ${item.isLast
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Auth Buttons */
                <div className="hidden lg:flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 text-gray-700 rounded-full font-bold transition-all shadow-lg hover:shadow-2xl flex items-center space-x-2"
                    style={{ backgroundColor: '#F69EAE' }}
                  >
                    <FiUserPlus size={16} />
                    <span>Get Started</span>
                  </motion.button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-3 rounded-full text-gray-600 hover:bg-gray-100/80 transition-all shadow-md hover:shadow-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden absolute top-full left-0 right-0 mt-4 mx-4"
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden">
                  <div className="p-6 space-y-1">
                    {navItems.map((item) => (
                      <motion.a
                        key={item.name}
                        href={item.href}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-4 px-4 py-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl transition-all font-medium text-base"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <item.icon size={20} className="text-gray-600" />
                        </div>
                        <span>{item.name}</span>
                      </motion.a>
                    ))}

                    {!user && (
                      <div className="pt-4 mt-4 border-t border-gray-200/60">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-black rounded-xl font-bold shadow-lg text-base"
                          style={{ backgroundColor: '#F69EAE' }}
                        >
                          <FiUserPlus size={20} />
                          <span>Get Started</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  );
};


export default Header;