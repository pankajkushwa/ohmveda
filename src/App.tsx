import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductsSection } from './components/ProductsSection';
import { ServiceCategories } from './components/ServiceCategories';
import { EndToEndPipeline } from './components/EndToEndPipeline';
import { StoreSection } from './components/StoreSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AdminDashboard } from './components/AdminDashboard';
import { ProjectModal } from './components/ProjectModal';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { CareersSection } from './components/CareersSection';
import { CartItem, JobRole, ProductCategory, StoreCategory, StoreItem, TurnkeyProduct, UserProfile } from './types';
import { ShoppingBag, ArrowRight, Zap, Wifi, ShieldCheck } from 'lucide-react';
import { 
  addAdminLog,
  getStoredCustomLogo,
  getStoredJobRoles,
  getStoredProductCategories, 
  getStoredStoreCategories, 
  getStoredStoreItems, 
  getStoredTurnkeyProducts, 
  saveStoredJobRoles,
  saveStoredProductCategories, 
  saveStoredStoreCategories, 
  saveStoredStoreItems, 
  saveStoredTurnkeyProducts,
  subscribeToFirestoreData
} from './services/dataStorage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'store' | 'careers' | 'admin'>('home');
  const [activeSection, setActiveSection] = useState('hero');
  const [storeCategory, setStoreCategory] = useState<string>('all');
  const [storeComponentId, setStoreComponentId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Dynamic Products, Store Datasets, Categories & Job Roles (Persisted in Cloud Firestore & Local Storage)
  const [products, setProducts] = useState<TurnkeyProduct[]>(getStoredTurnkeyProducts());
  const [storeItems, setStoreItems] = useState<StoreItem[]>(getStoredStoreItems());
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(getStoredProductCategories());
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>(getStoredStoreCategories());
  const [jobRoles, setJobRoles] = useState<JobRole[]>(getStoredJobRoles());

  // Subscribe to real-time Cloud Firestore updates across all devices & browsers
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreData((data) => {
      if (data.products) setProducts(data.products);
      if (data.storeItems) setStoreItems(data.storeItems);
      if (data.productCategories) setProductCategories(data.productCategories);
      if (data.storeCategories) setStoreCategories(data.storeCategories);
      if (data.jobRoles) setJobRoles(data.jobRoles);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize document favicon and OpenGraph metadata for Google search and browser tabs
  useEffect(() => {
    const syncFaviconAndMeta = () => {
      const customLogo = getStoredCustomLogo();
      const faviconEl = document.getElementById('app-favicon') as HTMLLinkElement | null;
      const ogMetaEl = document.getElementById('og-image-meta') as HTMLMetaElement | null;
      const logoUrl = customLogo || '/favicon.svg';
      if (faviconEl) {
        faviconEl.href = logoUrl;
      }
      if (ogMetaEl) {
        ogMetaEl.content = logoUrl;
      }
    };

    syncFaviconAndMeta();
    window.addEventListener('ohmveda_logo_updated', syncFaviconAndMeta);
    return () => window.removeEventListener('ohmveda_logo_updated', syncFaviconAndMeta);
  }, []);

  const handleUpdateProducts = (updated: TurnkeyProduct[]) => {
    setProducts(updated);
    saveStoredTurnkeyProducts(updated);
  };

  const handleUpdateStoreItems = (updated: StoreItem[]) => {
    setStoreItems(updated);
    saveStoredStoreItems(updated);
  };

  const handleUpdateProductCategories = (updated: ProductCategory[]) => {
    setProductCategories(updated);
    saveStoredProductCategories(updated);
  };

  const handleUpdateStoreCategories = (updated: StoreCategory[]) => {
    setStoreCategories(updated);
    saveStoredStoreCategories(updated);
  };

  const handleUpdateJobRoles = (updated: JobRole[]) => {
    setJobRoles(updated);
    saveStoredJobRoles(updated);
  };

  // Inquiry Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryCategory, setInquiryCategory] = useState<string>('connected_product');
  const [inquiryModules, setInquiryModules] = useState<string[]>([]);
  const [inquiryType, setInquiryType] = useState<string>('iot_product');

  // Store & Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // User Auth State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ohmveda_user_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading stored user profile:', err);
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('ohmveda_user_profile_v1', JSON.stringify(profile));
    } catch (err) {
      console.error('Error saving user profile:', err);
    }
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('ohmveda_user_profile_v1');
    } catch (err) {
      console.error('Error clearing user profile:', err);
    }
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
  };

  // Scroll Spy Effect when on Main / Home Page
  useEffect(() => {
    if (currentPage !== 'home') return;

    const sectionIds = ['hero', 'services', 'process', 'about', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220; // Offset for sticky navbar

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  const handleNavigate = (
    page: 'home' | 'products' | 'store' | 'careers' | 'admin',
    sectionId: string = 'hero',
    extra?: { category?: string; productId?: string; componentId?: string; jobId?: string }
  ) => {
    setCurrentPage(page);

    if (page === 'admin' || page === 'careers') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'store') {
      if (extra?.category) {
        setStoreCategory(extra.category);
      } else {
        setStoreCategory('all');
      }
      if (extra?.componentId) {
        setStoreComponentId(extra.componentId);
        setTimeout(() => {
          const elem = document.getElementById(`store-card-${extra.componentId}`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
      } else {
        setStoreComponentId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (page === 'products') {
      if (extra?.productId) {
        setSelectedProductId(extra.productId);
        // Delay slightly to ensure component mounted, then scroll to product card
        setTimeout(() => {
          const elem = document.getElementById(`product-card-${extra.productId}`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        setSelectedProductId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (page === 'home') {
      setActiveSection(sectionId);
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleOpenInquiry = (category: string = 'connected_product') => {
    setInquiryCategory(category);
    setInquiryModules([]);
    setInquiryModalOpen(true);
  };

  const handleExploreCapabilities = () => {
    handleNavigate('home', 'services');
  };

  // Cart operations
  const handleAddToCart = (product: StoreItem, quantityToAdd: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { product, quantity: quantityToAdd }];
    });
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderPlaced = (orderedCart: CartItem[]) => {
    if (!orderedCart || orderedCart.length === 0) return;

    // Deduct stock quantities from storeItems state
    const updatedStore = storeItems.map((item) => {
      const cartMatch = orderedCart.find((c) => c.product.id === item.id);
      if (cartMatch) {
        const remainingStock = Math.max(0, item.stock - cartMatch.quantity);
        return { ...item, stock: remainingStock };
      }
      return item;
    });

    setStoreItems(updatedStore);
    saveStoredStoreItems(updatedStore);

    addAdminLog({
      action: 'UPDATE',
      target: 'STORE',
      title: 'Inventory Deducted (Order Placed)',
      details: `Automatic stock deduction for ${orderedCart.length} item line(s) upon order checkout.`,
    });

    // Clear cart after order is placed
    setCart([]);
  };

  const handleCheckoutFromCart = () => {
    setInquiryCategory('electronics_embedded');
    setInquiryModules(cart.map((c) => c.product.sku));
    setInquiryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
      {/* Sticky Top Navigation Bar with Page & Submenu Routing (Hidden in Admin Panel) */}
      {currentPage !== 'admin' && (
        <Header
          onOpenInquiry={handleOpenInquiry}
          activeSection={activeSection}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
          userProfile={userProfile}
          onOpenCart={() => setCartOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      <main className="grow">
        {/* VIEW 0: ADMIN DASHBOARD */}
        {currentPage === 'admin' && (
          <AdminDashboard
            products={products}
            storeItems={storeItems}
            productCategories={productCategories}
            storeCategories={storeCategories}
            jobRoles={jobRoles}
            userProfile={userProfile}
            onOpenAuth={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
            onUpdateProducts={handleUpdateProducts}
            onUpdateStoreItems={handleUpdateStoreItems}
            onUpdateProductCategories={handleUpdateProductCategories}
            onUpdateStoreCategories={handleUpdateStoreCategories}
            onUpdateJobRoles={handleUpdateJobRoles}
            onBackToHome={() => handleNavigate('home', 'hero')}
            onNavigateToProducts={() => handleNavigate('products')}
            onNavigateToStore={() => handleNavigate('store')}
          />
        )}

        {/* VIEW 1: CAREERS & PLACEMENTS PAGE */}
        {currentPage === 'careers' && (
          <CareersSection
            jobRoles={jobRoles}
            onBackToHome={() => handleNavigate('home', 'hero')}
            onOpenInquiry={handleOpenInquiry}
          />
        )}

        {/* VIEW 1: DEDICATED STORE PAGE */}
        {currentPage === 'store' && (
          <StoreSection
            onAddToCart={handleAddToCart}
            cartItemIds={cart.map((i) => i.product.id)}
            initialCategory={storeCategory}
            initialComponentId={storeComponentId}
            onBackToHome={() => handleNavigate('home', 'hero')}
            onOpenInquiry={handleOpenInquiry}
            customStoreProducts={storeItems}
            customCategories={storeCategories}
          />
        )}

        {/* VIEW 2: DEDICATED PRODUCTS & TURNKEY SYSTEMS PAGE */}
        {currentPage === 'products' && (
          <ProductsSection
            onOpenInquiry={handleOpenInquiry}
            selectedProductId={selectedProductId}
            onBackToHome={() => handleNavigate('home', 'hero')}
            customProducts={products}
            customCategories={productCategories}
          />
        )}

        {/* VIEW 3: MAIN LANDING / SERVICES HOME PAGE */}
        {currentPage === 'home' && (
          <>
            {/* Hero Section */}
            <HeroSection
              onOpenInquiry={handleOpenInquiry}
              onExploreCapabilities={handleExploreCapabilities}
            />

            {/* Engineering Services & Capabilities */}
            <ServiceCategories onOpenInquiry={handleOpenInquiry} />

            {/* Engineering Process: End-To-End Pipeline */}
            <EndToEndPipeline onOpenInquiry={handleOpenInquiry} />

            {/* Electronics Store Teaser Section */}
            <section id="store-preview" className="py-16 bg-slate-900 border-b border-slate-800 text-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-950 border border-blue-800/60 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
                  <div className="space-y-3 max-w-2xl">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                      Need Hardware Components & Dev Boards?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      Browse our dedicated store page featuring microcontrollers (ESP32-S3, STM32, Raspberry Pi Pico W), sensors, LoRa/BLE wireless radios, motor drivers, and prototyping parts with instant dispatch.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleNavigate('store')}
                      className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Open Electronics Store Page</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigate('store', 'store', { category: 'microcontrollers' })}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors text-center cursor-pointer"
                    >
                      Browse Microcontrollers & Dev Boards
                    </motion.button>
                  </div>
                </div>
              </div>
            </section>

            {/* About Us & Mission */}
            <AboutSection onOpenInquiry={() => handleOpenInquiry('connected_product')} />

            {/* Contact Section with Address, Phone, Email & Message Form */}
            <ContactSection onOpenInquiry={() => handleOpenInquiry('connected_product')} />
          </>
        )}
      </main>

      {/* Footer (Hidden in Admin Mode) */}
      {currentPage !== 'admin' && (
        <Footer
          onOpenInquiry={() => handleOpenInquiry('connected_product')}
          onNavigate={handleNavigate}
        />
      )}

      {/* Proposal & Project Inquiry Modal */}
      <ProjectModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialCategory={inquiryCategory}
        initialModules={inquiryModules}
        initialType={inquiryType}
        cart={cart}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Authentication Modal (Login / Signup) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Component Shopping Basket Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckoutFromCart}
      />

    </div>
  );
}
