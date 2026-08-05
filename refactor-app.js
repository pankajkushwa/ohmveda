const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add React Router imports
content = content.replace(
  `import React, { useState, useEffect } from 'react';`,
  `import React, { useState, useEffect } from 'react';\nimport { Routes, Route, useNavigate, useLocation } from 'react-router-dom';`
);

// 2. Remove getPageFromLocation and currentPage state, replace with Router hooks
const stateRegex = /const getPageFromLocation[\s\S]*?\}, \[\]\);/m;
content = content.replace(stateRegex, `const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');

  // Derive current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/products')) return 'products';
    if (path.startsWith('/store')) return 'store';
    if (path.startsWith('/careers')) return 'careers';
    if (path.startsWith('/account')) return 'account';
    return 'home';
  };
  const currentPage = getCurrentPage();`);

// 3. Update handleNavigate to use React Router
const navRegex = /const getRoutePath[\s\S]*?\}\n  \};\n/m;
content = content.replace(navRegex, `const getRoutePath = (page: 'home' | 'products' | 'store' | 'careers' | 'account' | 'admin', sectionId: string = 'hero') => {
    if (page === 'products') return '/products';
    if (page === 'store') return '/store';
    if (page === 'careers') return '/careers';
    if (page === 'account') return '/account';
    if (page === 'admin') return '/admin';
    if (sectionId === 'services') return '/#services';
    if (sectionId === 'about') return '/#about';
    if (sectionId === 'contact') return '/#contact';
    return '/';
  };

  const handleNavigate = (
    page: 'home' | 'products' | 'store' | 'careers' | 'account' | 'admin',
    sectionId: string = 'hero',
    extra?: { category?: string; productId?: string; componentId?: string; jobId?: string }
  ) => {
    const routePath = getRoutePath(page, sectionId);
    navigate(routePath);

    if (page === 'admin' || page === 'careers' || page === 'account') {
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
          const elem = document.getElementById(\`store-card-\${extra.componentId}\`);
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
        setTimeout(() => {
          const elem = document.getElementById(\`product-card-\${extra.productId}\`);
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
      if (!sectionId || sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setTimeout(() => {
          const elem = document.getElementById(sectionId);
          if (elem) {
            const yOffset = -80; 
            const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      }
    }
  };
`);

// 4. Update the View conditional rendering to use <Routes>
const mainStartRegex = /<main className="grow">/;
content = content.replace(mainStartRegex, `<main className="grow">\n        <Routes>`);

// Admin
content = content.replace(
  /\{\/\* VIEW 0: ADMIN DASHBOARD[\s\S]*?\{currentPage === 'admin' && \([\s\S]*?<React.Suspense/m,
  `<Route path="/admin/*" element={
          <React.Suspense`
);
content = content.replace(
  /<\/React\.Suspense>\n\s*\)\}/m,
  `</React.Suspense>\n        } />`
);

// Careers
content = content.replace(
  /\{\/\* VIEW 1: CAREERS & PLACEMENTS PAGE[\s\S]*?\{currentPage === 'careers' && \(/m,
  `<Route path="/careers" element={`
);
content = content.replace(
  /onOpenInquiry=\{handleOpenInquiry\}\n\s*\/>\n\s*\)\}/m,
  `onOpenInquiry={handleOpenInquiry}\n          />\n        } />`
);

// Account
content = content.replace(
  /\{\/\* VIEW 1\.5: DEDICATED CUSTOMER ACCOUNT & ORDERS PAGE[\s\S]*?\{currentPage === 'account' && \(/m,
  `<Route path="/account" element={`
);
content = content.replace(
  /onNavigateToStore=\{\(\) => handleNavigate\('store'\)\}\n\s*\/>\n\s*\)\}/m,
  `onNavigateToStore={() => handleNavigate('store')}\n          />\n        } />`
);

// Store
content = content.replace(
  /\{\/\* VIEW 1: DEDICATED STORE PAGE[\s\S]*?\{currentPage === 'store' && \(/m,
  `<Route path="/store/*" element={`
);
content = content.replace(
  /customCategories=\{storeCategories\}\n\s*\/>\n\s*\)\}/m,
  `customCategories={storeCategories}\n          />\n        } />`
);

// Products
content = content.replace(
  /\{\/\* VIEW 2: DEDICATED PRODUCTS & TURNKEY SYSTEMS PAGE[\s\S]*?\{currentPage === 'products' && \(/m,
  `<Route path="/products/*" element={`
);
content = content.replace(
  /customCategories=\{productCategories\}\n\s*\/>\n\s*\)\}/m,
  `customCategories={productCategories}\n          />\n        } />`
);

// Home
content = content.replace(
  /\{\/\* VIEW 3: MAIN LANDING \/ SERVICES HOME PAGE[\s\S]*?\{currentPage === 'home' && \(\n\s*<>/m,
  `<Route path="/" element={<>`
);
content = content.replace(
  /<\/ContactSection>\n\s*<\/>\n\s*\)\}/m,
  `</ContactSection>\n          </>} />`
);

// Close Routes
content = content.replace(
  /<\/main>/,
  `</Routes>\n      </main>`
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.tsx refactored successfully.');
