import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, ArrowRight, Zap, ShoppingCart, User, LogOut, ChevronDown, ChevronRight, Layers, Radio, Activity, Smartphone, Wrench, Wifi, Monitor, Package, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { OhmVedaLogo } from './OhmVedaLogo';
import { isAuthorizedAdminEmail } from '../services/dataStorage';

interface HeaderProps {
  onOpenInquiry: (category?: string) => void;
  activeSection: string;
  currentPage: 'home' | 'products' | 'store' | 'careers' | 'admin';
  onNavigate: (
    page: 'home' | 'products' | 'store' | 'careers' | 'admin',
    sectionId?: string,
    extra?: { category?: string; productId?: string; componentId?: string; jobId?: string }
  ) => void;
  cartCount: number;
  userProfile: UserProfile | null;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenInquiry,
  activeSection,
  currentPage,
  onNavigate,
  cartCount,
  userProfile,
  onOpenCart,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [productsHover, setProductsHover] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('gateways');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dedicated Products Categories (Components live strictly in Store)
  const productCategories = [
    {
      id: 'gateways',
      title: 'IoT Edge Gateways & Hubs',
      desc: 'RS485 Modbus, CAN Bus, Wi-Fi & 4G LTE cellular hubs',
      icon: Radio,
      badge: 'Gateways',
      page: 'products' as const,
      items: [
        {
          id: 'ov-gateway-x1',
          title: 'OhmVeda Edge IoT Gateway X1',
          desc: 'RS485 Modbus, CAN Bus, Wi-Fi & 4G LTE Edge Hub',
          sku: 'OV-HW-X1',
          page: 'products' as const,
          productId: 'ov-gateway-x1',
          icon: Radio,
        },
        {
          id: 'ov-modbus-hub',
          title: 'Compact Modbus RTU Edge Controller',
          desc: 'DIN Rail dual-serial industrial telemetry hub',
          sku: 'OV-HW-MB1',
          page: 'products' as const,
          productId: 'ov-modbus-hub',
          icon: Radio,
        },
      ],
    },
    {
      id: 'sensing',
      title: 'Wireless Sensing & Field Nodes',
      desc: 'LoRaWAN & BLE environmental & remote field telemetry',
      icon: Activity,
      badge: 'Sensing',
      page: 'products' as const,
      items: [
        {
          id: 'ov-smart-node',
          title: 'Wireless Environmental Sensing Node',
          desc: 'LoRaWAN ultra-low power sensor field node',
          sku: 'OV-HW-SENS',
          page: 'products' as const,
          productId: 'ov-smart-node',
          icon: Activity,
        },
        {
          id: 'ov-solar-telemetry',
          title: 'Solar Remote Field Telemetry System',
          desc: 'IP67 weatherproof sealed solar monitoring station',
          sku: 'OV-HW-SOLAR',
          page: 'products' as const,
          productId: 'ov-solar-telemetry',
          icon: Activity,
        },
      ],
    },
    {
      id: 'telematics',
      title: 'Automotive & Fleet Telematics',
      desc: 'GPS CAN Bus diagnostics, fleet tracking & OBD-II hubs',
      icon: Smartphone,
      badge: 'Fleet',
      page: 'products' as const,
      items: [
        {
          id: 'ov-fleet-tracker',
          title: 'Smart OBD-II Fleet Telemetry Hub',
          desc: 'Automotive GPS CAN Bus diagnostic tracker',
          sku: 'OV-HW-FLEET',
          page: 'products' as const,
          productId: 'ov-fleet-tracker',
          icon: Smartphone,
        },
        {
          id: 'ov-asset-beacon',
          title: 'High-Precision GNSS Asset Beacon',
          desc: 'Geo-fencing, shock & tamper tracking beacon',
          sku: 'OV-HW-BEACON',
          page: 'products' as const,
          productId: 'ov-asset-beacon',
          icon: Smartphone,
        },
      ],
    },
    {
      id: 'automation',
      title: 'Industrial Embedded Controllers',
      desc: 'Programmable logic controllers & heavy motor drive systems',
      icon: Cpu,
      badge: 'Automation',
      page: 'products' as const,
      items: [
        {
          id: 'ov-custom-controller',
          title: 'Custom Embedded Automation Board',
          desc: 'PLC alternative with 8x optically isolated relays',
          sku: 'OV-HW-PLC',
          page: 'products' as const,
          productId: 'ov-custom-controller',
          icon: Cpu,
        },
        {
          id: 'ov-motor-drive-sys',
          title: 'Industrial Motor Drive Controller',
          desc: 'Dual-bridge heavy duty motor PLC system',
          sku: 'OV-HW-DRIVE',
          page: 'products' as const,
          productId: 'ov-motor-drive-sys',
          icon: Wrench,
        },
      ],
    },
  ];

  const currentCategoryObj = productCategories.find((c) => c.id === activeCategory) || productCategories[0];

  const handleNavClick = (page: 'home' | 'products' | 'store' | 'careers' | 'admin', sectionId: string = 'hero') => {
    setMobileMenuOpen(false);
    setProductsHover(false);
    onNavigate(page, sectionId);
  };

  const handleItemClick = (item: {
    page: 'products' | 'store';
    category?: string;
    productId?: string;
    componentId?: string;
  }) => {
    setMobileMenuOpen(false);
    setProductsHover(false);
    onNavigate('products', 'products', { productId: item.productId });
  };

  const handleCategoryNav = (cat: typeof productCategories[0]) => {
    setMobileMenuOpen(false);
    setProductsHover(false);
    onNavigate('products', 'products');
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/70 backdrop-blur-md border-b border-slate-200/60 text-slate-900 shadow-sm' 
        : 'bg-white border-b border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <div 
            onClick={() => handleNavClick('home', 'hero')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <OhmVedaLogo variant="light" size="lg" showSubtitle={false} />
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80 relative">
            
            {/* Home Link */}
            <button
              onClick={() => handleNavClick('home', 'hero')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPage === 'home' && activeSection === 'hero' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Home
            </button>

            {/* Products Dropdown Item */}
            <div 
              className="relative"
              onMouseEnter={() => setProductsHover(true)}
              onMouseLeave={() => setProductsHover(false)}
            >
              <button
                onClick={() => handleNavClick('products', 'products')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                  currentPage === 'products' || (currentPage === 'home' && activeSection === 'products')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <span>Products</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsHover ? 'rotate-180 text-blue-600' : 'text-slate-500'}`} />
              </button>

              {/* Products Submenu Cascading Flyout Dropdown Panel */}
              {productsHover && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[760px] animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex divide-x divide-slate-800/80 overflow-hidden min-h-[380px]">
                    
                    {/* Primary Left Column: Categories List */}
                    <div className="w-[320px] p-3 space-y-1 bg-slate-950/90 shrink-0">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center justify-between border-b border-slate-800/80 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-blue-400" />
                          <span>Product Categories</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-normal">Hover to expand</span>
                      </div>

                      {productCategories.map((cat, idx) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;

                        return (
                          <motion.button
                            key={cat.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15, delay: idx * 0.02 }}
                            whileHover={{ x: 3 }}
                            onMouseEnter={() => setActiveCategory(cat.id)}
                            onClick={() => handleCategoryNav(cat)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'hover:bg-slate-900 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                  isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-900 border border-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-xs font-bold truncate ${
                                  isActive ? 'text-white' : 'text-slate-100 group-hover:text-blue-400'
                                }`}
                              >
                                {cat.title}
                              </span>
                            </div>

                            <ChevronRight
                              className={`w-4 h-4 transition-transform shrink-0 ${
                                isActive
                                  ? 'text-white translate-x-0.5'
                                  : 'text-slate-600 group-hover:text-slate-300'
                              }`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Secondary Right Column: Animated Product Scroll Panel Showing Only Product Names */}
                    <div className="w-[440px] p-4 bg-slate-900/95 flex flex-col justify-between">
                      <div>
                        {/* Header of Active Category */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white tracking-wide uppercase">
                              {currentCategoryObj.title}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/80">
                              {currentCategoryObj.items.length} Products
                            </span>
                          </div>

                          <button
                            onClick={() => handleCategoryNav(currentCategoryObj)}
                            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline transition-colors"
                          >
                            <span>View All</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Animated Product Names List */}
                        <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentCategoryObj.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="space-y-1.5"
                            >
                              {currentCategoryObj.items.map((item, index) => {
                                return (
                                  <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15, delay: index * 0.03 }}
                                    whileHover={{ x: 4 }}
                                    onClick={() => handleItemClick(item)}
                                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-800/80 hover:border-blue-500/50 transition-all flex items-center justify-between group/item shadow-xs hover:shadow-md cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover/item:scale-125 group-hover/item:bg-blue-400 transition-all shrink-0" />
                                      <span className="text-xs font-bold text-slate-100 group-hover/item:text-blue-400 transition-colors truncate">
                                        {item.title}
                                      </span>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-blue-400 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Footer info line */}
                      <div className="pt-3 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-blue-400" />
                          <span>OhmVeda Telematics Systems</span>
                        </span>
                        <button
                          onClick={() => {
                            setProductsHover(false);
                            onOpenInquiry(currentCategoryObj.title);
                          }}
                          className="text-blue-400 font-bold hover:underline"
                        >
                          Request Custom Specs
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            <button
              onClick={() => handleNavClick('home', 'services')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPage === 'home' && activeSection === 'services' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Services
            </button>

            {/* Store (Dedicated Page) */}
            <button
              onClick={() => handleNavClick('store', 'store')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPage === 'store' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Store
            </button>

            {/* Careers (Dedicated Page) */}
            <button
              onClick={() => handleNavClick('careers', 'careers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPage === 'careers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Careers
            </button>

            {/* About */}
            <button
              onClick={() => handleNavClick('home', 'about')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPage === 'home' && activeSection === 'about' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              About
            </button>

            {/* Contact */}
            <button
              onClick={() => handleNavClick('home', 'contact')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentPage === 'home' && activeSection === 'contact' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Contact
            </button>


          </nav>

          {/* Right Utilities (Cart, Auth, Proposal CTA) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 transition-colors flex items-center justify-center"
              title="Shopping Cart / Component Basket"
            >
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center font-mono animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-3 py-2 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200/80 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-extrabold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{userProfile.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-slate-900 text-xs font-medium space-y-1">
                    <div className="p-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{userProfile.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{userProfile.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Login / Sign Up</span>
              </button>
            )}

            {/* Proposal CTA */}
            <button
              onClick={() => onOpenInquiry()}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Get Proposal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Navigation controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('home', 'hero')}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors ${
                currentPage === 'home' && activeSection === 'hero'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors flex items-center justify-between col-span-2 ${
                currentPage === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Products & Categories</span>
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Expandable Categories */}
            {mobileProductsOpen && (
              <div className="col-span-2 space-y-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                {productCategories.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => handleCategoryNav(cat)}
                        className="w-full text-left py-1.5 px-2 text-xs font-extrabold text-blue-400 hover:text-white flex items-center justify-between border-b border-slate-800/80"
                      >
                        <span className="flex items-center gap-1.5">
                          <CatIcon className="w-3.5 h-3.5" />
                          <span>{cat.title}</span>
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>

                      <div className="pl-3 space-y-1 pt-1">
                        {cat.items.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleItemClick(sub)}
                            className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-800 text-[11px] font-medium text-slate-300 flex items-center justify-between group"
                          >
                            <span className="truncate group-hover:text-blue-400 transition-colors">{sub.title}</span>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => handleNavClick('home', 'services')}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors ${
                currentPage === 'home' && activeSection === 'services'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Services
            </button>

            <button
              onClick={() => handleNavClick('store', 'store')}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors ${
                currentPage === 'store'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Store (Components)
            </button>

            <button
              onClick={() => handleNavClick('careers', 'careers')}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors ${
                currentPage === 'careers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Careers & Placements
            </button>

            <button
              onClick={() => handleNavClick('home', 'about')}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors ${
                currentPage === 'home' && activeSection === 'about'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('home', 'contact')}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-colors ${
                currentPage === 'home' && activeSection === 'contact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Contact Us
            </button>


          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!userProfile && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span>Login / Sign Up</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInquiry();
              }}
              className="w-full py-3 rounded-lg text-xs font-bold text-white bg-blue-600 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Get Project Proposal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
