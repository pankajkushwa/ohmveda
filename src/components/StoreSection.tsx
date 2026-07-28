import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Cpu, Wifi, Zap, Monitor, Wrench, Check, Plus, ShieldCheck, Tag, Star, ArrowLeft, ChevronRight, Package, Truck, PhoneCall, Layers, Smartphone, Activity, Filter, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { StoreCategory, StoreItem } from '../types';
import { ImageCarousel } from './ImageCarousel';
import { DEFAULT_STORE_CATEGORIES } from '../services/dataStorage';

interface StoreSectionProps {
  onAddToCart: (product: StoreItem) => void;
  cartItemIds: string[];
  initialCategory?: string;
  initialComponentId?: string | null;
  onBackToHome?: () => void;
  onOpenInquiry?: (category?: string) => void;
  customStoreProducts?: StoreItem[];
  customCategories?: StoreCategory[];
}

export const StoreSection: React.FC<StoreSectionProps> = ({
  onAddToCart,
  cartItemIds,
  initialCategory = 'all',
  initialComponentId = null,
  onBackToHome,
  onOpenInquiry,
  customStoreProducts,
  customCategories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  
  // Dedicated Product Detail Page State (Amazon/Flipkart style)
  const [selectedComponent, setSelectedComponent] = useState<StoreItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [detailTab, setDetailTab] = useState<'overview' | 'specs' | 'applications'>('overview');

  const activeProductsList = customStoreProducts !== undefined ? customStoreProducts : STORE_PRODUCTS;
  const activeCategories = customCategories !== undefined ? customCategories : DEFAULT_STORE_CATEGORIES;

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Cpu': return Cpu;
      case 'Zap': return Zap;
      case 'Wifi': return Wifi;
      case 'Smartphone': return Smartphone;
      case 'Monitor': return Monitor;
      case 'Wrench': return Wrench;
      case 'Layers': return Layers;
      case 'Activity': return Activity;
      default: return Tag;
    }
  };

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialComponentId) {
      const found = activeProductsList.find((p) => p.id === initialComponentId);
      if (found) {
        setSelectedComponent(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setTimeout(() => {
          const elem = document.getElementById(`store-card-${initialComponentId}`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [initialCategory, initialComponentId, activeProductsList]);

  const categories = [
    { id: 'all', label: 'All Components', icon: Tag },
    ...activeCategories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      icon: getCategoryIcon(cat.icon),
    })),
  ];

  const getCategoryCount = (catId: string) => {
    const matchedCatObj = activeCategories.find((c) => c.id === catId || c.label.toLowerCase() === catId.toLowerCase());
    const catLabelLower = matchedCatObj ? matchedCatObj.label.toLowerCase() : '';
    const catIdLower = catId.trim().toLowerCase();

    return activeProductsList.filter((p) => {
      if (!p) return false;
      if (catId === 'all') return true;
      const productCatLower = (p.category || '').trim().toLowerCase();
      return productCatLower === catIdLower || (catLabelLower !== '' && productCatLower === catLabelLower);
    }).length;
  };

  const filteredProducts = activeProductsList.filter((product) => {
    if (!product) return false;
    const matchedCatObj = activeCategories.find((c) => c.id === selectedCategory || c.label.toLowerCase() === selectedCategory.toLowerCase());
    const catLabelLower = matchedCatObj ? matchedCatObj.label.toLowerCase() : '';
    const catIdLower = selectedCategory.trim().toLowerCase();
    const productCatLower = (product.category || '').trim().toLowerCase();

    const matchesCategory =
      selectedCategory === 'all' ||
      productCatLower === catIdLower ||
      (catLabelLower !== '' && productCatLower === catLabelLower);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (product.name || '').toLowerCase().includes(q) ||
      (product.sku || '').toLowerCase().includes(q) ||
      (product.shortDesc || '').toLowerCase().includes(q);
    const matchesStock = !inStockOnly || ((product.stock ?? 0) > 0 && product.inStock);
    const matchesSale = !onSaleOnly || (
      ((product.discountPercent ?? 0) > 0) ||
      (product.originalPrice ? product.originalPrice > product.price : false)
    );
    return matchesCategory && matchesSearch && matchesStock && matchesSale;
  });

  const handleAdd = (product: StoreItem, qty: number = 1) => {
    onAddToCart(product, qty);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // If a component is clicked, render full Amazon/Flipkart style Detail Page
  if (selectedComponent) {
    const inCart = cartItemIds.includes(selectedComponent.id);
    const isJustAdded = addedItem === selectedComponent.id;
    const compCategory = activeCategories.find((c) => c.id === selectedComponent.category);
    
    // Normalize image gallery for component
    const allCompImages: string[] = [];
    if (selectedComponent.images && Array.isArray(selectedComponent.images)) {
      selectedComponent.images.forEach((img) => {
        if (img && typeof img === 'string' && img.trim()) allCompImages.push(img.trim());
      });
    }
    if (selectedComponent.image && !allCompImages.includes(selectedComponent.image.trim())) {
      allCompImages.unshift(selectedComponent.image.trim());
    }

    // Similar / Related Components
    const relatedComponents = activeProductsList.filter(
      (p) => p.id !== selectedComponent.id && (p.category === selectedComponent.category || selectedCategory === 'all')
    ).slice(0, 4);

    const discountAmount = selectedComponent.originalPrice
      ? selectedComponent.originalPrice - selectedComponent.price
      : 0;
    const discountPercent = selectedComponent.originalPrice
      ? Math.round((discountAmount / selectedComponent.originalPrice) * 100)
      : 0;

    return (
      <section className="py-10 bg-slate-50 text-slate-900 border-b border-slate-200 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Navigation & Back to Store */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-bold text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                  <span>Home</span>
                </button>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setSelectedComponent(null)}
                className="hover:text-blue-600 font-bold text-slate-700 cursor-pointer"
              >
                Electronics Store
              </button>
              {compCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-medium">{compCategory.label}</span>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-600 font-bold truncate max-w-xs">{selectedComponent.name}</span>
            </div>

            <button
              onClick={() => setSelectedComponent(null)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Back to Component Catalogue</span>
            </button>
          </div>

          {/* MAIN PRODUCT DETAIL CONTAINER (Amazon / Flipkart Style) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* LEFT COLUMN: Image Gallery Carousel & Badges (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm h-80 sm:h-96">
                  <ImageCarousel
                    images={allCompImages}
                    alt={selectedComponent.name}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                  {selectedComponent.badge && (
                    <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-xs text-xs font-bold text-white font-mono uppercase tracking-wider border border-white/20">
                      {selectedComponent.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-xs font-extrabold text-slate-900 font-mono shadow-xs">
                    SKU: {selectedComponent.sku}
                  </span>
                </div>

                {/* Multi-Image Note */}
                {allCompImages.length > 1 && (
                  <p className="text-[11px] font-mono text-slate-500 text-center flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auto-scrolling gallery (3s right-to-left animation)</span>
                  </p>
                )}

                {/* Key Verification Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-[11px]">
                      <div className="font-bold text-slate-800">100% Genuine OEM</div>
                      <div className="text-slate-500">Bench voltage verified</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="text-[11px]">
                      <div className="font-bold text-slate-800">Express Dispatch</div>
                      <div className="text-slate-500">Ships within 24 Hrs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Component Specs, Pricing, Stock & Add to Cart (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Title & Ratings */}
                <div className="space-y-2 border-b border-slate-100 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold uppercase">
                      OhmVeda Supply
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold font-mono">
                      Category: {compCategory?.label || selectedComponent.category}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {selectedComponent.name}
                  </h1>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{selectedComponent.rating}</span>
                    </div>
                    <span className="text-slate-500 font-medium">({selectedComponent.reviewsCount} Customer Reviews)</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-mono font-bold">Part No: {selectedComponent.sku}</span>
                  </div>
                </div>

                {/* Price & Savings Box */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono">
                      ₹{selectedComponent.price.toLocaleString()}
                    </span>
                    {selectedComponent.originalPrice && selectedComponent.originalPrice > selectedComponent.price && (
                      <span className="text-base font-semibold text-slate-400 line-through font-mono">
                        ₹{selectedComponent.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-bold font-mono">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Price inclusive of all taxes. GST invoice provided for business tax credit.</span>
                  </p>
                </div>

                {/* Stock Status & Delivery Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-extrabold text-emerald-700">
                      In Stock ({selectedComponent.stock} units available)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Fast Delivery & Fulfilment</span>
                    </div>
                    <p className="text-slate-600 pl-5">
                      Orders placed before 3:00 PM are dispatched the same business day from our Ahmedabad warehouse.
                    </p>
                  </div>
                </div>

                {/* Short Description & Highlights */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Key Features & Specifications
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedComponent.shortDesc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(selectedComponent.specs || []).map((spec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector & Add to Cart Controls */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    
                    {/* Quantity Selector */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">Quantity</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3.5 py-2.5 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 py-2.5 text-xs font-mono font-extrabold text-slate-900 min-w-10 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(selectedComponent.stock, quantity + 1))}
                          className="px-3.5 py-2.5 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total Calculation */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono">Subtotal</label>
                      <div className="text-xl font-extrabold text-slate-900 font-mono py-1">
                        ₹{(selectedComponent.price * quantity).toLocaleString()}
                      </div>
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAdd(selectedComponent, quantity)}
                      className={`flex-1 px-6 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : inCart
                          ? 'bg-slate-800 text-white hover:bg-slate-900'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added ({quantity} Units) to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>{inCart ? 'Add More Units to Cart' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>

                    {onOpenInquiry && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAdd(selectedComponent, quantity);
                          onOpenInquiry('electronics_embedded');
                        }}
                        className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Buy Now / Request Quote</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* DEEP SPECIFICATIONS & TECHNICAL DETAILS TABS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'overview', label: 'Technical Overview' },
                { id: 'specs', label: 'Parameter Specifications' },
                { id: 'applications', label: 'Recommended Applications' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    detailTab === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {detailTab === 'overview' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  The <strong className="text-slate-900">{selectedComponent.name}</strong> ({selectedComponent.sku}) is an industrial-grade electronics component selected and tested specifically for embedded systems, IoT gateways, custom PCB prototypes, and OEM hardware manufacturing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Quality Inspection & Testing</div>
                    <p className="text-slate-500">Every batch undergoes rigorous power-on pin voltage checks, signal integrity analysis, and ESD safe packaging.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Technical Support & Datasheet</div>
                    <p className="text-slate-500">Complete pinouts, schematic symbol references, and Arduino/ESP-IDF sample code available on request.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPECS TABLE */}
            {detailTab === 'specs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <tbody className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-700 w-1/3">Part SKU / Code</td>
                      <td className="px-4 py-3 text-slate-900 font-bold">{selectedComponent.sku}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-700">Category</td>
                      <td className="px-4 py-3 text-slate-900">{compCategory?.label || selectedComponent.category}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-700">Unit Stock Count</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">{selectedComponent.stock} units available</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-700">Key Highlights</td>
                      <td className="px-4 py-3 text-slate-900">{(selectedComponent.specs || []).join(', ')}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-700">GST Invoice & Tax</td>
                      <td className="px-4 py-3 text-slate-900">Included (18% GST invoice provided)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: APPLICATIONS */}
            {detailTab === 'applications' && (
              <div className="space-y-3 text-xs text-slate-600">
                <h4 className="font-bold text-slate-900">Recommended Hardware Applications:</h4>
                <ul className="list-disc list-inside space-y-1.5 pl-2 font-medium">
                  <li>Industrial IoT automation & remote telemetry monitoring</li>
                  <li>Custom microcontroller PCB assembly and firmware prototyping</li>
                  <li>Smart agriculture, environmental sensing, and energy metering</li>
                  <li>Robotics, motor drive controllers, and embedded edge node computing</li>
                </ul>
              </div>
            )}
          </div>

          {/* SIMILAR / RECOMMENDED COMPONENTS (Amazon/Flipkart Style Strip) */}
          {relatedComponents.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Frequently Viewed Electronics Components</span>
                </h3>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All in Catalogue &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedComponents.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedComponent(rel);
                      setQuantity(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 rounded-xl overflow-hidden bg-slate-900 mb-2 border border-slate-100">
                        <ImageCarousel
                          images={rel.images}
                          image={rel.image}
                          alt={rel.name}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{rel.sku}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {rel.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        ₹{rel.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        View Details
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    );
  }

  // STANDARD CATALOGUE GRID VIEW
  return (
    <section id="store" className="py-12 sm:py-16 bg-slate-50 text-slate-900 border-b border-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb Bar & Enhanced Search Bar Top Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 font-bold text-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Home</span>
              </button>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-bold">Store</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-bold">{currentCategoryObj?.label}</span>
              </>
            )}
          </div>

          {/* Top Right Enhanced Search Bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center w-full sm:w-96 shadow-2xs rounded-xl overflow-hidden border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 bg-white"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components, SKU, specs..."
                className="w-full bg-transparent text-slate-900 text-xs pl-9 pr-8 py-2.5 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border-l border-blue-600"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Filters & Categories</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {selectedCategory !== 'all' ? currentCategoryObj?.label : 'All'}
            </span>
          </button>
          {(selectedCategory !== 'all' || searchQuery || inStockOnly || onSaleOnly) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setInStockOnly(false);
                setOnSaleOnly(false);
              }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* MAIN E-COMMERCE LAYOUT (Amazon/Flipkart Sidebar & Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT SIDEBAR FILTER PANEL */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1 space-y-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs sticky top-20`}>
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Filters</h3>
              </div>
              {(selectedCategory !== 'all' || searchQuery || inStockOnly || onSaleOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setInStockOnly(false);
                    setOnSaleOnly(false);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Categories
              </h4>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  const count = getCategoryCount(cat.id);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-blue-200/60 text-blue-800 font-bold' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability & Discount Filter Section */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Item Status
              </h4>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Discounted / On Sale</span>
              </label>
            </div>

          </aside>

          {/* RIGHT MAIN CATALOGUE GRID */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Results Active Summary Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Showing</span>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                  {filteredProducts.length} components
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-xs text-slate-500">
                    in <strong className="text-blue-600 font-bold">{currentCategoryObj?.label}</strong>
                  </span>
                )}
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 text-xs text-blue-700 font-medium">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-blue-900 font-bold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const inCart = cartItemIds.includes(product.id);
                const isJustAdded = addedItem === product.id;

                return (
                  <div
                    id={`store-card-${product.id}`}
                    key={product.id}
                    onClick={() => {
                      setSelectedComponent(product);
                      setQuantity(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`scroll-mt-36 bg-white rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden p-4 sm:p-5 cursor-pointer hover:border-blue-400 ${
                      initialComponentId === product.id
                        ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/30'
                        : 'border-slate-200 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Badge & Image */}
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-4/3 mb-3 border border-slate-100">
                        <ImageCarousel
                          images={product.images}
                          image={product.image}
                          alt={product.name}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                        {product.badge && (
                          <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded bg-slate-900/90 backdrop-blur-xs text-[10px] font-bold text-white font-mono uppercase tracking-wider">
                            {product.badge}
                          </span>
                        )}
                        <span className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 font-mono">
                          {product.sku}
                        </span>
                      </div>

                      {/* Rating & Review */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold ml-1 text-slate-800">{product.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">({product.reviewsCount} reviews)</span>
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-snug font-normal">
                        {product.shortDesc}
                      </p>

                      {/* Specs Pill List */}
                      <div className="mt-3 space-y-1">
                        {(product.specs || []).slice(0, 2).map((spec, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span className="truncate">{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & Add To Cart Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-slate-900 font-mono">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs font-medium text-slate-400 line-through font-mono">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {((product.discountPercent && product.discountPercent > 0) || (product.originalPrice && product.originalPrice > product.price)) && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono">
                              {product.discountPercent || Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 block">
                          In Stock ({product.stock} units)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(product);
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : inCart
                            ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 mt-2 p-8 space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No electronics components found.</p>
                {(searchQuery || selectedCategory !== 'all' || inStockOnly || onSaleOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setInStockOnly(false);
                      setOnSaleOnly(false);
                    }}
                    className="mt-2 px-4 py-2 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Store Assurance Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center shadow-xs">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">100% Quality Inspected</h4>
            <p className="text-[11px] text-slate-500 font-medium">All microcontrollers & sensors undergo bench voltage testing.</p>
          </div>
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Same-Day Dispatch</h4>
            <p className="text-[11px] text-slate-500 font-medium font-mono">Orders before 3 PM dispatched same working day.</p>
          </div>
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold mb-2">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Bulk BOM Sourcing</h4>
            <p className="text-[11px] text-slate-500 font-medium">Custom component procurement for PCB manufacturing.</p>
          </div>
        </div>

        {/* Bulk Order CTA Banner */}
        {onOpenInquiry && (
          <div className="mt-10 p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">Bulk Component Procurement</span>
              <h3 className="text-xl font-bold">Need Wholesale Quantities or Custom PCB BOM Assembly?</h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                We provide custom component sourcing, reel-packaged IC procurement, and pre-flashed microcontroller provisioning for industrial batch production.
              </p>
            </div>
            <button
              onClick={() => onOpenInquiry('electronics_embedded')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Request Component RFQ</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
