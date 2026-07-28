import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, ArrowRight, Layers, Radio, Activity, Smartphone, ArrowLeft, ChevronRight, CheckCircle2, FileText, Download, Zap, Box, Terminal, X, Shield, Server, Gauge, Check } from 'lucide-react';
import { ProductCategory, TurnkeyProduct } from '../types';
import { ImageCarousel } from './ImageCarousel';
import { INITIAL_TURNKEY_PRODUCTS } from '../data/turnkeyProducts';
import { DEFAULT_PRODUCT_CATEGORIES } from '../services/dataStorage';

interface ProductsSectionProps {
  onOpenInquiry: (category?: string) => void;
  selectedProductId?: string | null;
  onBackToHome?: () => void;
  customProducts?: TurnkeyProduct[];
  customCategories?: ProductCategory[];
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  onOpenInquiry,
  selectedProductId = null,
  onBackToHome,
  customProducts,
  customCategories,
}) => {
  const [activeProductId, setActiveProductId] = useState<string | null>(selectedProductId);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [detailModalProduct, setDetailModalProduct] = useState<TurnkeyProduct | null>(null);

  const rawList = customProducts !== undefined ? customProducts : INITIAL_TURNKEY_PRODUCTS;
  const categoryTabs = customCategories !== undefined ? customCategories : DEFAULT_PRODUCT_CATEGORIES;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Radio': return Radio;
      case 'Activity': return Activity;
      case 'Smartphone': return Smartphone;
      case 'Cpu': return Cpu;
      case 'Wifi': return Wifi;
      default: return Radio;
    }
  };

  const scrollToProduct = (id: string | null) => {
    setActiveProductId(id);
    if (id) {
      setTimeout(() => {
        const elem = document.getElementById(`product-card-${id}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      const topElem = document.getElementById('products');
      if (topElem) {
        topElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      scrollToProduct(selectedProductId);
    }
  }, [selectedProductId]);

  const filteredProducts = selectedCategoryFilter === 'all'
    ? rawList
    : rawList.filter(p => p.categoryGroup === selectedCategoryFilter);

  return (
    <section id="products" className="py-12 sm:py-16 bg-white text-slate-900 border-b border-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 font-bold text-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Home</span>
              </button>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-bold">Products</span>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <span>← Back to Home Portal</span>
            </button>
          )}
        </div>

        {/* Section Title Header */}
        <div className="max-w-3xl space-y-3 mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Our Products
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Production-ready electronic equipment engineered by OhmVeda Technologies for immediate deployment across factories, agricultural field assets, fleet tracking, and off-grid remote installations.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-slate-200">
          {[
            { id: 'all', label: 'All Products' },
            ...categoryTabs,
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards List */}
        <div className="mt-10 space-y-10">
          {filteredProducts.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center my-8 shadow-xs">
              <Box className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Products Available</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No products are currently listed in this category. You can create and publish new products via the Admin Portal.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const Icon = getIcon(product.iconName);
              const isSelected = activeProductId === product.id;

              return (
                <div
                  id={`product-card-${product.id}`}
                  key={product.id}
                  className={`scroll-mt-36 bg-slate-50 rounded-2xl border transition-all duration-300 p-6 sm:p-8 ${
                    isSelected
                      ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20 bg-blue-50/10'
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Product Information & Specs */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Product Image Carousel Banner */}
                    <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                      <ImageCarousel
                        images={product.images}
                        image={product.image}
                        alt={product.title}
                        className="w-full h-full"
                        objectFit="cover"
                        fallbackIcon={<Icon className="w-10 h-10 opacity-30 text-blue-400" />}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider block">
                            {product.category}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                            {product.title}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                          {product.sku}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold border border-amber-200">
                          {product.badge}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                      {product.shortDesc}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                        Key Engineering Features
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {product.specs.map((spec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Parameters Table */}
                    <div className="pt-2">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="text-[11px] font-bold text-slate-900 font-mono uppercase">
                          Technical Parameters Summary
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                          <div>
                            <span className="text-slate-400 font-mono block">Compute Core</span>
                            <span className="font-semibold text-slate-800">{product.techParams.mcu}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-mono block">Connectivity</span>
                            <span className="font-semibold text-slate-800">{product.techParams.connectivity}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-mono block">Power Input</span>
                            <span className="font-semibold text-slate-800">{product.techParams.power}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-mono block">Enclosure</span>
                            <span className="font-semibold text-slate-800">{product.techParams.enclosure}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-mono block">Firmware/OS</span>
                            <span className="font-semibold text-slate-800">{product.techParams.software}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-mono block">Operating Temp</span>
                            <span className="font-semibold text-slate-800">{product.techParams.tempRange}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setDetailModalProduct(product)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Inspect Full Overview</span>
                      </button>

                      <button
                        onClick={() => onOpenInquiry(product.categoryGroup)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                      >
                        <span>Request Customization & Quote</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Right Column: Architectural Pipeline Diagram & Applications */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Architectural Pipeline Box */}
                    <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>System Dataflow Pipeline</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Isolated Bus</span>
                      </div>

                      <div className="space-y-2">
                        {product.blockDiagram.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                            <div className="w-5 h-5 rounded bg-blue-900/80 border border-blue-700/80 text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </div>
                            <span className="font-medium text-[11px]">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Typical Industrial Applications */}
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                        Target Field Deployment Domains
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.applications.map((app, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
        </div>

      </div>

      {/* Full Description & Specifications Detail Modal */}
      {detailModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-900">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-600 text-white font-bold">
                  {React.createElement(getIcon(detailModalProduct.iconName), { className: 'w-6 h-6' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 font-mono uppercase">
                      {detailModalProduct.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {detailModalProduct.sku}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {detailModalProduct.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setDetailModalProduct(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
              
              {/* Product Gallery Carousel in Modal */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
                <ImageCarousel
                  images={detailModalProduct.images}
                  image={detailModalProduct.image}
                  alt={detailModalProduct.title}
                  className="w-full h-full"
                  objectFit="cover"
                />
              </div>

              {/* Detailed Narrative Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Product Overview & Engineering Architecture</span>
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {detailModalProduct.fullDesc}
                </p>
              </div>

              {/* Complete Specifications List */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Hardware & Electrical Specifications</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailModalProduct.specs.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Parameters Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Subsystem Specifications Table</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 font-mono">
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">MCU / Core</span>
                      <span className="text-slate-200 font-bold">{detailModalProduct.techParams.mcu}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Memory</span>
                      <span className="text-slate-200 font-bold">{detailModalProduct.techParams.memory}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Connectivity</span>
                      <span className="text-slate-200 font-bold">{detailModalProduct.techParams.connectivity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Power Input</span>
                      <span className="text-slate-200 font-bold">{detailModalProduct.techParams.power}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Enclosure</span>
                      <span className="text-slate-200 font-bold">{detailModalProduct.techParams.enclosure}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Software / OS</span>
                      <span className="text-slate-200 font-bold">{detailModalProduct.techParams.software}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setDetailModalProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
              >
                Close Window
              </button>
              <button
                onClick={() => {
                  setDetailModalProduct(null);
                  onOpenInquiry(detailModalProduct.categoryGroup);
                }}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
