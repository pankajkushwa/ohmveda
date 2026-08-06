import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, ShoppingBag, Cpu, Wifi, Zap, Monitor, Wrench, Check, Plus, ShieldCheck, Tag, Star, 
  ArrowLeft, ChevronRight, ChevronLeft, Package, Truck, PhoneCall, Layers, Smartphone, Activity, Filter, 
  SlidersHorizontal, RotateCcw, X, FileText, Download, FileCode, 
  MessageSquare, Send, ThumbsUp, HelpCircle, CheckCircle2, User, Eye, FileSpreadsheet, Sparkles,
  ChevronDown, ChevronUp, FolderTree, CornerDownRight, Menu, Heart, ArrowUpDown, CheckSquare, Square,
  ExternalLink, Layers3, RefreshCcw, Loader2
} from 'lucide-react';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { 
  StoreCategory, StoreItem, StoreQaItem, StoreReviewItem, TechnicalDocument, 
  Specification, SpecTemplate, SpecGroup, StoreItemSpecValue 
} from '../types';
import { ImageCarousel } from './ImageCarousel';
import { 
  DEFAULT_STORE_CATEGORIES, 
  getStoredStoreQas, 
  addStoreQuestion, 
  getStoredStoreReviews, 
  addStoreReview,
  getStoredSpecifications,
  getStoredSpecTemplates,
  getStoredSpecGroups
} from '../services/dataStorage';
import { getMoqTiersForProduct, getUnitPriceForQuantity, getRewardPointsForProduct } from '../utils/priceUtils';
import { 
  buildCategoryTree, 
  itemMatchesCategoryFilter, 
  getCategoryBreadcrumbChain, 
  getCategoryProductCount 
} from '../utils/categoryUtils';

interface StoreSectionProps {
  onAddToCart: (product: StoreItem, quantity?: number) => void;
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
  
  // Common Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [hasDatasheetOnly, setHasDatasheetOnly] = useState<boolean>(false);
  const [rohsOnly, setRohsOnly] = useState<boolean>(false);

  // Dynamic Specification Filters State: specCode -> selected value strings
  const [specFilters, setSpecFilters] = useState<Record<string, string[]>>({});

  // Sorting Option
  const [sortOption, setSortOption] = useState<string>('relevance');

  // UI Drawer & Modal States
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [isFilteringLoading, setIsFilteringLoading] = useState<boolean>(false);

  // Collapsible Accordion Sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [filterSearchQueries, setFilterSearchQueries] = useState<Record<string, string>>({});
  const [showMoreFilters, setShowMoreFilters] = useState<Record<string, boolean>>({});

  // Product Comparison & Quick View & Wishlist
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [highlightCompareDiffs, setHighlightCompareDiffs] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreItem | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Specifications & Templates Engine Data
  const [allSpecs, setAllSpecs] = useState<Specification[]>(() => getStoredSpecifications());
  const [allTemplates, setAllTemplates] = useState<SpecTemplate[]>(() => getStoredSpecTemplates());
  const [allGroups, setAllGroups] = useState<SpecGroup[]>(() => getStoredSpecGroups());

  useEffect(() => {
    const handleSpecSync = () => {
      setAllSpecs(getStoredSpecifications());
      setAllTemplates(getStoredSpecTemplates());
      setAllGroups(getStoredSpecGroups());
    };
    window.addEventListener('ohmveda_specifications_updated', handleSpecSync);
    window.addEventListener('ohmveda_spec_templates_updated', handleSpecSync);
    window.addEventListener('ohmveda_spec_groups_updated', handleSpecSync);
    return () => {
      window.removeEventListener('ohmveda_specifications_updated', handleSpecSync);
      window.removeEventListener('ohmveda_spec_templates_updated', handleSpecSync);
      window.removeEventListener('ohmveda_spec_groups_updated', handleSpecSync);
    };
  }, []);

  // Pagination State (10 items per page)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset pagination & trigger subtle loading when category or filters change
  useEffect(() => {
    setCurrentPage(1);
    setIsFilteringLoading(true);
    const timer = setTimeout(() => setIsFilteringLoading(false), 180);
    return () => clearTimeout(timer);
  }, [
    selectedCategory, searchQuery, selectedBrands, priceMin, priceMax, 
    inStockOnly, onSaleOnly, hasDatasheetOnly, rohsOnly, specFilters, sortOption
  ]);

  // When selected category changes, clear category-specific spec filters
  const prevCategoryRef = useRef(selectedCategory);
  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory) {
      setSpecFilters({});
      prevCategoryRef.current = selectedCategory;
    }
  }, [selectedCategory]);
  
  // Dedicated Product Detail Page State (OhmVeda style)
  const [selectedComponent, setSelectedComponent] = useState<StoreItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [detailTab, setDetailTab] = useState<'description' | 'specification' | 'reviews' | 'qa' | 'attachments' | 'origin'>('description');
  const [pincodeQuery, setPincodeQuery] = useState<string>('390012');
  const [pincodeResult, setPincodeResult] = useState<{ location: string; express: string; standard: string } | null>({
    location: 'Vadodara, GUJARAT',
    express: 'Mon, 10th Aug (via BlueDart Air)',
    standard: 'Wed, 12th Aug (Standard Shipping)',
  });
  const [filterLayoutMode, setFilterLayoutMode] = useState<'matrix' | 'sidebar'>('matrix');

  // Q&A & Reviews
  const [storeQas, setStoreQas] = useState<StoreQaItem[]>(() => getStoredStoreQas());
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionName, setNewQuestionName] = useState('');
  const [newQuestionEmail, setNewQuestionEmail] = useState('');
  const [qaSubmittedToast, setQaSubmittedToast] = useState(false);

  const [storeReviews, setStoreReviews] = useState<StoreReviewItem[]>(() => getStoredStoreReviews());
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewEmail, setNewReviewEmail] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);

  const [viewingDocModal, setViewingDocModal] = useState<TechnicalDocument | null>(null);

  useEffect(() => {
    const handleQaSync = () => setStoreQas(getStoredStoreQas());
    const handleReviewSync = () => setStoreReviews(getStoredStoreReviews());

    window.addEventListener('ohmveda_store_qas_updated', handleQaSync);
    window.addEventListener('ohmveda_store_reviews_updated', handleReviewSync);

    return () => {
      window.removeEventListener('ohmveda_store_qas_updated', handleQaSync);
      window.removeEventListener('ohmveda_store_reviews_updated', handleReviewSync);
    };
  }, []);

  // Cascading Flyout Menu State
  const [flyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [activeFlyoutMainId, setActiveFlyoutMainId] = useState<string | null>(null);
  const [activeFlyoutSubId, setActiveFlyoutSubId] = useState<string | null>(null);
  const flyoutCloseTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFlyoutEnter = () => {
    if (flyoutCloseTimer.current) {
      clearTimeout(flyoutCloseTimer.current);
      flyoutCloseTimer.current = null;
    }
    setFlyoutOpen(true);
  };

  const handleFlyoutLeave = () => {
    flyoutCloseTimer.current = setTimeout(() => {
      setFlyoutOpen(false);
    }, 250);
  };

  const activeProductsList = customStoreProducts !== undefined ? customStoreProducts : STORE_PRODUCTS;
  const activeCategories = customCategories !== undefined ? customCategories : DEFAULT_STORE_CATEGORIES;

  const categoryTree = buildCategoryTree(activeCategories);

  const activeMainCatObj = activeFlyoutMainId
    ? categoryTree.find((c) => c.id === activeFlyoutMainId)
    : categoryTree[0] || null;

  const activeSubCatObj = activeMainCatObj && activeFlyoutSubId
    ? activeMainCatObj.subcategories.find((s) => s.id === activeFlyoutSubId)
    : activeMainCatObj?.subcategories[0] || null;

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
    return getCategoryProductCount(catId, activeCategories, activeProductsList);
  };

  // Helper to extract brand/manufacturer cleanly
  const getProductBrand = (p: StoreItem): string => {
    if (p.manufacturer && p.manufacturer.trim()) return p.manufacturer.trim();
    const commonBrands = ['Espressif', 'STMicroelectronics', 'Texas Instruments', 'Microchip', 'NXP', 'Arduino', 'Raspberry Pi', 'Adafruit', 'SparkFun', 'Seeed Studio', 'Infineon', 'Bosch', 'Analog Devices', 'Vishay', 'TDK', 'Samsung', 'Murata'];
    for (const b of commonBrands) {
      if (p.name.toLowerCase().includes(b.toLowerCase())) return b;
    }
    return 'Generic / Unbranded';
  };

  // Helper to check if item has a datasheet
  const productHasDatasheet = (p: StoreItem): boolean => {
    return (p.documents && p.documents.length > 0) || Boolean(p.datasheetUrl);
  };

  // Products belonging to current category selection (Scope for extracting category-specific filter options)
  const categoryProducts = useMemo(() => {
    return activeProductsList.filter((product) => {
      if (!product) return false;
      return itemMatchesCategoryFilter(product, selectedCategory, activeCategories);
    });
  }, [activeProductsList, selectedCategory, activeCategories]);

  // Find Specification Template assigned to selected category
  const currentCategorySpecTemplate = useMemo(() => {
    if (selectedCategory === 'all') return null;
    const match = allTemplates.find((t) => t.categoryIds.includes(selectedCategory));
    if (match) return match;
    // Fallback: check parent category if subcategory selected
    const catObj = activeCategories.find((c) => c.id === selectedCategory);
    if (catObj && catObj.parentId) {
      return allTemplates.find((t) => t.categoryIds.includes(catObj.parentId!)) || null;
    }
    return null;
  }, [selectedCategory, allTemplates, activeCategories]);

  // Extract filterable specifications for current category
  const filterableSpecifications = useMemo(() => {
    let specsToUse: Specification[] = [];

    if (currentCategorySpecTemplate) {
      specsToUse = currentCategorySpecTemplate.specifications
        .map((ts) => allSpecs.find((s) => s.id === ts.specId))
        .filter((s): s is Specification => s !== undefined && s.isFilterable === true);
    } else {
      // If no template explicitly mapped or category is 'all', pick specs marked isFilterable that exist in category products
      specsToUse = allSpecs.filter((s) => s.isFilterable === true);
    }

    // Sort specs by order in spec template or group
    return specsToUse;
  }, [currentCategorySpecTemplate, allSpecs]);

  // Calculate available filter options with product counts dynamically from category products
  const dynamicFilterOptions = useMemo(() => {
    // 1. Brands
    const brandCounts: Record<string, number> = {};
    categoryProducts.forEach((p) => {
      const brand = getProductBrand(p);
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    // 2. Specifications Options Map: specCode -> Array<{ value: string; count: number }>
    const specOptionsMap: Record<string, Array<{ value: string; count: number }>> = {};

    filterableSpecifications.forEach((spec) => {
      const counts: Record<string, number> = {};

      categoryProducts.forEach((p) => {
        let valStr: string | null = null;

        // Check structured specifications
        if (p.specifications && p.specifications[spec.code]) {
          const specVal = p.specifications[spec.code];
          if (specVal.value !== undefined && specVal.value !== null && specVal.value !== '') {
            valStr = specVal.unit ? `${specVal.value} ${specVal.unit}` : String(specVal.value);
          }
        }

        // Fallback: scan legacy specs string array
        if (!valStr && p.specs && Array.isArray(p.specs)) {
          const foundSpecLine = p.specs.find((s) => s.toLowerCase().includes(spec.name.toLowerCase()));
          if (foundSpecLine) {
            const parts = foundSpecLine.split(':');
            valStr = parts.length > 1 ? parts[1].trim() : foundSpecLine;
          }
        }

        if (valStr) {
          counts[valStr] = (counts[valStr] || 0) + 1;
        }
      });

      const optionsList = Object.entries(counts).map(([value, count]) => ({ value, count }));
      // Sort options logically (numeric if possible, otherwise alphabetical)
      optionsList.sort((a, b) => {
        const numA = parseFloat(a.value);
        const numB = parseFloat(b.value);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.value.localeCompare(b.value);
      });

      if (optionsList.length > 0) {
        specOptionsMap[spec.code] = optionsList;
      }
    });

    return {
      brands: Object.entries(brandCounts).map(([brand, count]) => ({ value: brand, count })).sort((a, b) => a.value.localeCompare(b.value)),
      specs: specOptionsMap,
    };
  }, [categoryProducts, filterableSpecifications]);

  // Main Product Filtering & Sorting Pipeline
  const filteredProducts = useMemo(() => {
    return activeProductsList.filter((product) => {
      if (!product) return false;

      // 1. Category Filter
      if (!itemMatchesCategoryFilter(product, selectedCategory, activeCategories)) {
        return false;
      }

      // 2. Search Query (Name, SKU, MPN, Brand, Short Summary, Full Description, Specs)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const brand = getProductBrand(product).toLowerCase();
        const matchesName = (product.name || '').toLowerCase().includes(q);
        const matchesSku = (product.sku || '').toLowerCase().includes(q);
        const matchesMpn = (product.mpn || '').toLowerCase().includes(q);
        const matchesBrand = brand.includes(q);
        const matchesDesc = (product.shortDesc || '').toLowerCase().includes(q) || (product.fullDesc || '').toLowerCase().includes(q);
        
        let matchesSpecVal = false;
        if (product.specifications) {
          matchesSpecVal = Object.values(product.specifications).some((sv: StoreItemSpecValue) => 
            String(sv.value).toLowerCase().includes(q) || (sv.unit && sv.unit.toLowerCase().includes(q))
          );
        }
        if (!matchesSpecVal && product.specs) {
          matchesSpecVal = product.specs.some((s) => s.toLowerCase().includes(q));
        }

        if (!matchesName && !matchesSku && !matchesMpn && !matchesBrand && !matchesDesc && !matchesSpecVal) {
          return false;
        }
      }

      // 3. Manufacturer / Brand Filter
      if (selectedBrands.length > 0) {
        const brand = getProductBrand(product);
        if (!selectedBrands.includes(brand)) return false;
      }

      // 4. Price Range Filter
      if (priceMin !== '' && product.price < priceMin) return false;
      if (priceMax !== '' && product.price > priceMax) return false;

      // 5. Stock Status & Availability Filters
      if (inStockOnly && (!product.inStock || (product.stock ?? 0) <= 0)) return false;
      if (onSaleOnly && (!product.discountPercent && !(product.originalPrice && product.originalPrice > product.price))) return false;
      if (hasDatasheetOnly && !productHasDatasheet(product)) return false;
      if (rohsOnly && product.rohsCompliant === false) return false;

      // 6. Dynamic Specification Filters
      for (const [specCode, selectedVals] of Object.entries(specFilters) as [string, string[]][]) {
        if (!selectedVals || selectedVals.length === 0) continue;

        let productValStr: string | null = null;
        if (product.specifications && product.specifications[specCode]) {
          const specVal: StoreItemSpecValue = product.specifications[specCode];
          if (specVal.value !== undefined && specVal.value !== null) {
            productValStr = specVal.unit ? `${specVal.value} ${specVal.unit}` : String(specVal.value);
          }
        }

        // Fallback: search in legacy specs array
        if (!productValStr && product.specs) {
          const specDef = allSpecs.find((s) => s.code === specCode);
          if (specDef) {
            const foundLine = product.specs.find((s) => s.toLowerCase().includes(specDef.name.toLowerCase()));
            if (foundLine) {
              const parts = foundLine.split(':');
              productValStr = parts.length > 1 ? parts[1].trim() : foundLine;
            }
          }
        }

        if (!productValStr) return false;

        const matches = selectedVals.some((sv) => 
          productValStr!.toLowerCase().trim() === sv.toLowerCase().trim() ||
          productValStr!.toLowerCase().includes(sv.toLowerCase())
        );

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'brand_asc':
          return getProductBrand(a).localeCompare(getProductBrand(b));
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'popular':
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        default: // 'relevance'
          return 0;
      }
    });
  }, [
    activeProductsList, selectedCategory, activeCategories, searchQuery, selectedBrands,
    priceMin, priceMax, inStockOnly, onSaleOnly, hasDatasheetOnly, rohsOnly, specFilters, sortOption, allSpecs
  ]);

  // Calculate pagination variables
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Active Filters Count & Reset Handler
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (priceMin !== '' || priceMax !== '') count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (hasDatasheetOnly) count++;
    if (rohsOnly) count++;
    (Object.values(specFilters) as string[][]).forEach((arr: string[]) => {
      count += arr.length;
    });
    return count;
  }, [searchQuery, selectedBrands, priceMin, priceMax, inStockOnly, onSaleOnly, hasDatasheetOnly, rohsOnly, specFilters]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setPriceMin('');
    setPriceMax('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setHasDatasheetOnly(false);
    setRohsOnly(false);
    setSpecFilters({});
  };

  // Toggle Spec Value Filter
  const toggleSpecFilterValue = (specCode: string, value: string) => {
    setSpecFilters((prev) => {
      const current = prev[specCode] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      const newFilters = { ...prev };
      if (updated.length > 0) {
        newFilters[specCode] = updated;
      } else {
        delete newFilters[specCode];
      }
      return newFilters;
    });
  };

  // Toggle Brand Filter
  const toggleBrandFilter = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Compare Product Toggle
  const toggleCompareProduct = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 components simultaneously.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Wishlist Toggle
  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = (product: StoreItem, qty: number = 1) => {
    onAddToCart(product, qty);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // If a component is clicked, render full detailed Product View (matching images 2, 3 & 4)
  if (selectedComponent) {
    const inCart = cartItemIds.includes(selectedComponent.id);
    const isJustAdded = addedItem === selectedComponent.id;
    const isCompared = compareIds.includes(selectedComponent.id);
    const isWishlisted = wishlistIds.includes(selectedComponent.id);
    const compCategory = activeCategories.find((c) => c.id === selectedComponent.category);
    const brand = getProductBrand(selectedComponent);

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

    const discountAmount = selectedComponent.originalPrice
      ? selectedComponent.originalPrice - selectedComponent.price
      : 0;
    const discountPercent = selectedComponent.originalPrice
      ? Math.round((discountAmount / selectedComponent.originalPrice) * 100)
      : 0;

    // Build specs array for Specifications Tab Table
    const specTableRows: Array<{ label: string; val: string }> = [];
    specTableRows.push({ label: 'Manufacturer / Brand', val: brand });
    if (selectedComponent.mpn) specTableRows.push({ label: 'MPN (Manufacturer Part Number)', val: selectedComponent.mpn });
    specTableRows.push({ label: 'Category', val: compCategory?.label || selectedComponent.category || 'Electronic Component' });
    specTableRows.push({ label: 'SKU Code', val: selectedComponent.sku });

    if (selectedComponent.specifications) {
      (Object.entries(selectedComponent.specifications) as [string, StoreItemSpecValue][]).forEach(([code, valObj]) => {
        const specDef = allSpecs.find((s) => s.code === code);
        specTableRows.push({
          label: specDef ? specDef.name : code,
          val: `${valObj.value} ${valObj.unit || ''}`.trim(),
        });
      });
    } else if (selectedComponent.specs && Array.isArray(selectedComponent.specs)) {
      selectedComponent.specs.forEach((line) => {
        const parts = line.split(':');
        if (parts.length > 1) {
          specTableRows.push({ label: parts[0].trim(), val: parts.slice(1).join(':').trim() });
        } else {
          specTableRows.push({ label: 'Feature', val: line });
        }
      });
    }

    // Filter reviews for this product
    const productReviews = storeReviews.filter((r) => r.productId === selectedComponent.id);
    const productQas = storeQas.filter((q) => q.productId === selectedComponent.id);

    return (
      <section className="py-8 bg-slate-50 text-slate-900 min-h-screen border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* TOP BREADCRUMB & BACK TO STORE BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="hover:text-purple-700 transition-colors flex items-center gap-1 font-bold text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-purple-700" />
                  <span>Home</span>
                </button>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setSelectedComponent(null)}
                className="hover:text-purple-700 font-bold text-slate-700 cursor-pointer"
              >
                Store
              </button>
              {compCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-semibold">{compCategory.label}</span>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-purple-800 font-bold truncate max-w-xs">{selectedComponent.name}</span>
            </div>

            <button
              onClick={() => setSelectedComponent(null)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-purple-700" />
              <span>Back to Store Catalogue</span>
            </button>
          </div>

          {/* MAIN PRODUCT TOP CONTAINER */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* Header info matching Reference Image 2 */}
            <div className="mb-6 space-y-1.5 border-b border-slate-150 pb-4">
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase font-mono">
                {compCategory?.label || selectedComponent.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug uppercase">
                {selectedComponent.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Star
                        key={st}
                        className={`w-3.5 h-3.5 ${
                          st <= Math.round(selectedComponent.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-500 font-medium">({selectedComponent.reviewsCount || 0} customer review)</span>
                </div>

                <span className="text-slate-300">•</span>

                {/* SKU Code */}
                <span className="font-mono font-bold text-purple-900">
                  SKU: <span className="text-purple-700 font-extrabold">{selectedComponent.sku}</span>
                </span>
              </div>
            </div>

            {/* 2-COLUMN GRID (Images/Pincode on Left, Price/MOQ/Specs/Buttons on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Gallery + Estimated Delivery Checker */}
              <div className="lg:col-span-5 space-y-5">
                {/* Main Product Image Carousel */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-xs aspect-square p-4 flex items-center justify-center group">
                  <ImageCarousel
                    images={allCompImages}
                    alt={selectedComponent.name}
                    className="w-full h-full max-h-80 object-contain"
                    objectFit="contain"
                  />
                  {selectedComponent.badge && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-purple-900 text-[10px] font-extrabold text-white font-mono uppercase tracking-wider">
                      {selectedComponent.badge}
                    </span>
                  )}
                </div>

                {/* Estimated Delivery Checker Box (Matching Image 3) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Truck className="w-4 h-4 text-purple-700" />
                    <span>Check estimated delivery</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pincodeQuery}
                      onChange={(e) => setPincodeQuery(e.target.value)}
                      placeholder="Enter 6 digit Pincode"
                      maxLength={6}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (pincodeQuery.length >= 6) {
                          setPincodeResult({
                            location: `Vadodara, GUJARAT (${pincodeQuery})`,
                            express: 'Mon, 10th Aug (via BlueDart Air)',
                            standard: 'Wed, 12th Aug (Standard Shipping)',
                          });
                        } else {
                          alert('Please enter a valid 6-digit Pincode');
                        }
                      }}
                      className="px-4 py-2 bg-purple-900 text-white rounded-xl text-xs font-extrabold hover:bg-purple-950 transition-colors cursor-pointer shadow-2xs"
                    >
                      Check
                    </button>
                  </div>

                  {pincodeResult && (
                    <div className="space-y-2 pt-2 text-xs border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="text-rose-500 font-bold">📍</span>
                        <span>Delivering to <strong className="text-slate-900">{pincodeResult.location}</strong></span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-[11px]">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>✈️</span>
                          <span>Estimated Delivery by {pincodeResult.express}</span>
                        </div>
                        <div className="text-emerald-700 font-medium flex items-center gap-1.5">
                          <span>🚚</span>
                          <span>Or by {pincodeResult.standard}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Pricing, Points, Specs Table, MOQ Table, Buttons, Support */}
              <div className="lg:col-span-7 space-y-5">
                {(() => {
                  const activeUnitPrice = getUnitPriceForQuantity(selectedComponent, quantity);
                  const moqTiers = getMoqTiersForProduct(selectedComponent);
                  const ptsPerUnit = getRewardPointsForProduct(selectedComponent);
                  const totalEarnedPoints = ptsPerUnit * quantity;
                  const totalPrice = activeUnitPrice * quantity;

                  return (
                    <>
                      {/* Price Display */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-extrabold text-purple-950 font-mono">
                            ₹{activeUnitPrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-slate-500">(Incl. GST)</span>

                          {selectedComponent.originalPrice && selectedComponent.originalPrice > activeUnitPrice && (
                            <span className="text-base font-semibold text-slate-400 line-through font-mono">
                              ₹{selectedComponent.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-purple-900 font-medium flex items-center gap-1.5 bg-purple-50 p-2 rounded-xl border border-purple-100">
                          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                          <span>Purchase this product now and earn <strong className="font-extrabold text-purple-950 text-sm">{totalEarnedPoints.toLocaleString()} OhmVeda Points!</strong></span>
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="font-bold text-slate-600">Availability:</span>
                          <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            In Stock ({selectedComponent.stock || 100} units available)
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium pt-1">
                          For bulk orders or B2B inquiries, email us: <a href="mailto:sales@ohmveda.in" className="text-purple-800 font-bold hover:underline">sales@ohmveda.in</a>
                        </p>
                      </div>

                      {/* Quick Spec Highlights List (Matching Reference) */}
                      <div className="space-y-2 text-xs font-medium text-slate-800 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900">1. Ic Name:</span>
                          <span className="text-slate-700 font-mono">{selectedComponent.name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900">2. Package/Case:</span>
                          <span className="text-slate-700 font-mono">
                            {selectedComponent.specifications?.['package']?.value ||
                             selectedComponent.specifications?.['package_case']?.value ||
                             'TQFN-48 / Surface Mount'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-slate-900">MPN</span>
                            <span className="text-purple-800 font-bold">{selectedComponent.mpn || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-slate-900">Brand</span>
                            <span className="text-slate-800">{brand}</span>
                          </div>
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-slate-900">Category</span>
                            <span className="text-slate-800 truncate max-w-[150px]">{compCategory?.label || selectedComponent.category}</span>
                          </div>
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-slate-900">Data Sheet</span>
                            {productHasDatasheet(selectedComponent) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedComponent.documents && selectedComponent.documents.length > 0) {
                                    setViewingDocModal(selectedComponent.documents[0]);
                                  } else if (selectedComponent.datasheetUrl) {
                                    window.open(selectedComponent.datasheetUrl, '_blank');
                                  }
                                }}
                                className="text-purple-800 hover:text-purple-950 font-extrabold flex items-center gap-1 cursor-pointer underline"
                              >
                                <span>Click to Download</span>
                                <Download className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-slate-400">Available on Request</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic MOQ Bulk Discount Table */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                        <div className="bg-slate-100 font-extrabold text-slate-800 px-4 py-2 text-center uppercase tracking-wider border-b border-slate-200 flex items-center justify-between">
                          <span>MOQ Tiered Discount</span>
                          <span className="text-[10px] text-purple-800 font-bold font-mono">Selected Qty: {quantity}</span>
                        </div>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              <th className="px-4 py-2 border-r border-slate-200">Quantity Range</th>
                              <th className="px-4 py-2">Price / Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono">
                            {moqTiers.map((tier, idx) => {
                              const isActive = quantity >= tier.minQty && (tier.maxQty === undefined || quantity <= tier.maxQty);
                              const rangeStr = tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`;
                              return (
                                <tr
                                  key={idx}
                                  className={isActive ? 'bg-purple-100 font-extrabold text-purple-950 border-l-4 border-l-purple-700' : 'hover:bg-slate-50 text-slate-800'}
                                >
                                  <td className="px-4 py-2 border-r border-slate-200 flex items-center justify-between">
                                    <span>{rangeStr}</span>
                                    {isActive && <span className="text-[10px] bg-purple-700 text-white px-1.5 py-0.5 rounded font-sans uppercase font-bold">Active Tier</span>}
                                  </td>
                                  <td className="px-4 py-2 font-bold">₹{tier.pricePerUnit.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Quantity Controls with Editable Manual Input, Wishlist, Compare & Cart Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={selectedComponent.stock || 9999}
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) {
                                setQuantity(Math.min(selectedComponent.stock || 9999, val));
                              } else if (e.target.value === '') {
                                setQuantity(1);
                              }
                            }}
                            className="w-14 text-center text-xs font-extrabold font-mono text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 rounded py-1"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(selectedComponent.stock || 99, q + 1))}
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(selectedComponent.id, e)}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            isWishlisted ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Add to Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleCompareProduct(selectedComponent.id, e)}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            isCompared ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Compare Component"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAdd(selectedComponent, quantity)}
                          className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-purple-900 text-white hover:bg-purple-950'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Added to Cart!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleAdd(selectedComponent, quantity);
                          }}
                          className="px-5 py-3 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </>
                  );
                })()}

                {/* Service Icons Row (Matching Image 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px] font-bold text-slate-800 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1">
                    <span className="text-purple-800">📦</span>
                    <span>Have a Bulk Order?</span>
                    <span className="text-purple-700 font-extrabold text-[10px] underline cursor-pointer" onClick={() => onOpenInquiry?.(selectedComponent.category)}>Click Here</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1">
                    <span className="text-purple-800">🎧</span>
                    <span>Need Support?</span>
                    <span className="text-purple-700 font-extrabold text-[10px] underline cursor-pointer" onClick={() => onOpenInquiry?.()}>Click Here</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1">
                    <span className="text-purple-800">🚚</span>
                    <span>Free Delivery</span>
                    <span className="text-slate-500 text-[10px]">Above ₹999</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1">
                    <span className="text-purple-800">💵</span>
                    <span>Cash on Delivery*</span>
                    <span className="text-slate-500 text-[10px]">Available</span>
                  </div>
                </div>

                <div className="text-center text-xs font-extrabold text-purple-900 underline cursor-pointer pt-1" onClick={() => onOpenInquiry?.(selectedComponent.category)}>
                  Didn't find what you are looking for?
                </div>

              </div>
            </div>
          </div>

          {/* BOTTOM TABS SECTION (Description | Specification | Reviews | QnA | Attachments | Country Of Origin) matching Images 3 & 4 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Navigation Header Bar */}
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-none">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specification', label: 'Specification' },
                { id: 'reviews', label: `Reviews (${productReviews.length})` },
                { id: 'qa', label: `QnA (${productQas.length})` },
                { id: 'attachments', label: 'Attachments' },
                { id: 'origin', label: 'Country Of Origin' },
              ].map((tb) => {
                const isActive = detailTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => setDetailTab(tb.id as any)}
                    className={`px-6 py-3.5 text-xs font-extrabold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                      isActive
                        ? 'border-purple-800 text-purple-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {tb.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: DESCRIPTION */}
              {detailTab === 'description' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Product Description</h3>
                  <p className="whitespace-pre-line">
                    {selectedComponent.fullDesc || selectedComponent.shortDesc || `${selectedComponent.name} microcontrollers/components are designed for high-performance, cost-effective, low-power embedded applications. Featuring industrial standard interfaces, fast bench response, and broad system compatibility.`}
                  </p>
                  
                  {selectedComponent.applications && selectedComponent.applications.length > 0 && (
                    <div className="pt-3">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Target Applications:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedComponent.applications.map((app, idx) => (
                          <li key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SPECIFICATION (Matching Reference Image 4) */}
              {detailTab === 'specification' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Technical Specifications</h3>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-200">
                        {specTableRows.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="px-4 py-2.5 font-bold text-slate-800 w-1/3 border-r border-slate-200">{row.label}:</td>
                            <td className="px-4 py-2.5 text-slate-900 font-mono font-medium">{row.val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS */}
              {detailTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-extrabold text-slate-900">Customer Reviews & Ratings</h3>
                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{selectedComponent.rating} / 5.0</span>
                    </div>
                  </div>

                  {productReviews.length > 0 ? (
                    <div className="space-y-3">
                      {productReviews.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">{rev.authorName}</span>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <h4 className="font-bold text-slate-800">{rev.title}</h4>
                          <p className="text-slate-600">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No reviews submitted yet for this product. Be the first to review!</p>
                  )}

                  {/* Add Review Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 pt-4">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Write a Product Review</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={newReviewEmail}
                        onChange={(e) => setNewReviewEmail(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">Rating:</span>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReviewRating(s)}
                          className="cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${s <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Review Title"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                    />
                    <textarea
                      rows={3}
                      placeholder="Write your review comments..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newReviewName || !newReviewComment) {
                          alert('Please provide your name and review comment');
                          return;
                        }
                        addStoreReview(
                          selectedComponent.id,
                          newReviewName,
                          newReviewEmail,
                          newReviewRating,
                          newReviewTitle || 'Great component',
                          newReviewComment
                        );
                        setNewReviewName('');
                        setNewReviewEmail('');
                        setNewReviewTitle('');
                        setNewReviewComment('');
                        setReviewSubmittedToast(true);
                        setTimeout(() => setReviewSubmittedToast(false), 3000);
                      }}
                      className="px-5 py-2.5 bg-purple-900 text-white font-extrabold text-xs rounded-xl hover:bg-purple-950 transition-colors cursor-pointer"
                    >
                      Submit Review
                    </button>
                    {reviewSubmittedToast && (
                      <p className="text-xs text-emerald-600 font-bold">Review submitted successfully!</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: QnA */}
              {detailTab === 'qa' && (
                <div className="space-y-6">
                  <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Questions & Answers</h3>
                  {productQas.length > 0 ? (
                    <div className="space-y-3">
                      {productQas.map((qa) => (
                        <div key={qa.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-purple-700">Q:</span>
                            <span>{qa.question}</span>
                          </div>
                          {qa.answer && (
                            <div className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                              <span className="text-emerald-600 font-extrabold">A:</span>
                              <span>{qa.answer}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No questions asked yet about this product.</p>
                  )}

                  {/* Ask Question Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Have a Question? Ask Us</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={newQuestionName}
                        onChange={(e) => setNewQuestionName(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={newQuestionEmail}
                        onChange={(e) => setNewQuestionEmail(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Type your technical or compatibility question..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newQuestionText || !newQuestionName) {
                          alert('Please enter your name and question');
                          return;
                        }
                        addStoreQuestion(
                          selectedComponent.id,
                          newQuestionName,
                          newQuestionEmail,
                          newQuestionText
                        );
                        setNewQuestionName('');
                        setNewQuestionEmail('');
                        setNewQuestionText('');
                        setQaSubmittedToast(true);
                        setTimeout(() => setQaSubmittedToast(false), 3000);
                      }}
                      className="px-5 py-2.5 bg-purple-900 text-white font-extrabold text-xs rounded-xl hover:bg-purple-950 transition-colors cursor-pointer"
                    >
                      Submit Question
                    </button>
                    {qaSubmittedToast && (
                      <p className="text-xs text-emerald-600 font-bold">Question submitted! Our engineers will respond shortly.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: ATTACHMENTS */}
              {detailTab === 'attachments' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Datasheets & Technical Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedComponent.documents && selectedComponent.documents.length > 0 ? (
                      selectedComponent.documents.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-purple-700 shrink-0" />
                            <div>
                              <div className="font-extrabold text-slate-900">{doc.title}</div>
                              <div className="text-slate-400 font-mono text-[10px]">{doc.fileType.toUpperCase()} • {doc.size || '1.2 MB'}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingDocModal(doc)}
                            className="px-3 py-1.5 bg-purple-900 text-white rounded-lg text-xs font-bold hover:bg-purple-950 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Download</span>
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:col-span-2">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-purple-700 shrink-0" />
                          <div>
                            <div className="font-extrabold text-slate-900">{selectedComponent.name} Datasheet (PDF)</div>
                            <div className="text-slate-400 font-mono text-[10px]">Official Manufacturer Datasheet • PDF Format</div>
                          </div>
                        </div>
                        {selectedComponent.datasheetUrl ? (
                          <a
                            href={selectedComponent.datasheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-purple-900 text-white rounded-lg text-xs font-bold hover:bg-purple-950 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Download PDF</span>
                            <Download className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => alert(`Datasheet for ${selectedComponent.name} will be downloaded or requested.`)}
                            className="px-3 py-1.5 bg-purple-900 text-white rounded-lg text-xs font-bold hover:bg-purple-950 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Download PDF</span>
                            <Download className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: COUNTRY OF ORIGIN */}
              {detailTab === 'origin' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                  <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Country Of Origin & Compliance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium">Country of Origin:</span>
                      <div className="font-extrabold text-slate-900 text-sm">Taiwan / India / USA</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium">HSN Code:</span>
                      <div className="font-extrabold text-slate-900 text-sm font-mono">85423100</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium">GST Rate:</span>
                      <div className="font-extrabold text-slate-900 text-sm font-mono">18% Standard Business GST</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium">RoHS Compliance:</span>
                      <div className="font-extrabold text-emerald-700 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>RoHS 3 Compliant</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    );
  }

  // RENDER FILTER PANEL (REUSABLE FOR DESKTOP & MOBILE DRAWER)
  const renderFilterPanel = () => (
    <div className="space-y-5 text-slate-900">
      {/* Sidebar Filter Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Filter Components
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* COMMON FILTER 1: MANUFACTURER / BRAND */}
      {dynamicFilterOptions.brands.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
          <button
            type="button"
            onClick={() => setCollapsedSections((prev) => ({ ...prev, brand: !prev.brand }))}
            className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900 uppercase tracking-wider text-left cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Manufacturer / Brand</span>
            </span>
            {collapsedSections.brand ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </button>

          {!collapsedSections.brand && (
            <div className="space-y-2 pt-1">
              {dynamicFilterOptions.brands.length > 6 && (
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={filterSearchQueries.brand || ''}
                    onChange={(e) => setFilterSearchQueries((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {dynamicFilterOptions.brands
                  .filter((b) => !filterSearchQueries.brand || b.value.toLowerCase().includes(filterSearchQueries.brand.toLowerCase()))
                  .slice(0, showMoreFilters.brand ? undefined : 6)
                  .map(({ value: brandName, count }) => {
                    const isSelected = selectedBrands.includes(brandName);
                    return (
                      <label
                        key={brandName}
                        onClick={() => toggleBrandFilter(brandName)}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors select-none ${
                          isSelected ? 'bg-blue-50 font-bold text-blue-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{brandName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-semibold shrink-0">
                          {count}
                        </span>
                      </label>
                    );
                  })}
              </div>

              {dynamicFilterOptions.brands.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowMoreFilters((p) => ({ ...p, brand: !p.brand }))}
                  className="text-[11px] font-bold text-blue-600 hover:underline pt-1 cursor-pointer"
                >
                  {showMoreFilters.brand ? 'Show Less' : `+ Show All (${dynamicFilterOptions.brands.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMMON FILTER 2: PRICE RANGE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
        <button
          type="button"
          onClick={() => setCollapsedSections((prev) => ({ ...prev, price: !prev.price }))}
          className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900 uppercase tracking-wider text-left cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Price Range (₹)</span>
          </span>
          {collapsedSections.price ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {!collapsedSections.price && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="₹ Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="₹ Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '< ₹250', min: '', max: 250 },
                { label: '₹250 - ₹1,000', min: 250, max: 1000 },
                { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
                { label: '> ₹5,000', min: 5000, max: '' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPriceMin(p.min);
                    setPriceMax(p.max);
                  }}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-bold text-slate-700 transition-colors cursor-pointer border border-slate-200"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COMMON FILTER 3: AVAILABILITY & VERIFICATIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
        <button
          type="button"
          onClick={() => setCollapsedSections((prev) => ({ ...prev, availability: !prev.availability }))}
          className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900 uppercase tracking-wider text-left cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Availability & Badges</span>
          </span>
          {collapsedSections.availability ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {!collapsedSections.availability && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg select-none">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Discounted / On Sale</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg select-none">
              <input
                type="checkbox"
                checked={hasDatasheetOnly}
                onChange={(e) => setHasDatasheetOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Datasheet Available</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg select-none">
              <input
                type="checkbox"
                checked={rohsOnly}
                onChange={(e) => setRohsOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>RoHS Compliant</span>
            </label>
          </div>
        )}
      </div>

      {/* DYNAMIC CATEGORY SPECIFICATION FILTERS */}
      {filterableSpecifications.map((spec) => {
        const optionsList = dynamicFilterOptions.specs[spec.code] || [];
        if (optionsList.length === 0) return null; // Hide empty filter sections with no products

        const groupObj = allGroups.find((g) => g.id === spec.groupId);
        const isCollapsed = collapsedSections[spec.code];
        const selectedForSpec = specFilters[spec.code] || [];
        const isShowMore = showMoreFilters[spec.code];
        const searchQueryForSpec = filterSearchQueries[spec.code] || '';

        const filteredOptions = optionsList.filter((o) =>
          !searchQueryForSpec || o.value.toLowerCase().includes(searchQueryForSpec.toLowerCase())
        );

        return (
          <div key={spec.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
            <button
              type="button"
              onClick={() => setCollapsedSections((prev) => ({ ...prev, [spec.code]: !prev[spec.code] }))}
              className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900 uppercase tracking-wider text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{spec.name}</span>
                {selectedForSpec.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-mono font-bold">
                    {selectedForSpec.length}
                  </span>
                )}
              </div>
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>

            {!isCollapsed && (
              <div className="space-y-2 pt-1">
                {optionsList.length > 6 && (
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={`Search ${spec.name.toLowerCase()}...`}
                      value={searchQueryForSpec}
                      onChange={(e) => setFilterSearchQueries((p) => ({ ...p, [spec.code]: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {filteredOptions
                    .slice(0, isShowMore ? undefined : 5)
                    .map(({ value, count }) => {
                      const isSelected = selectedForSpec.includes(value);
                      return (
                        <label
                          key={value}
                          onClick={() => toggleSpecFilterValue(spec.code, value)}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors select-none ${
                            isSelected ? 'bg-blue-50 font-bold text-blue-800' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{value}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-semibold shrink-0">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                </div>

                {optionsList.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreFilters((p) => ({ ...p, [spec.code]: !p[spec.code] }))}
                    className="text-[11px] font-bold text-blue-600 hover:underline pt-1 cursor-pointer"
                  >
                    {isShowMore ? 'Show Less' : `+ Show All (${optionsList.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // RENDER HORIZONTAL PARAMETRIC FILTER MATRIX (MOUSER / DIGIKEY / LCSC STYLE)
  const renderHorizontalFilterMatrix = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Parametric Component Filter Matrix
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Column Container */}
      <div className="flex overflow-x-auto gap-3 pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-300">
        
        {/* CARD 1: COMMON ATTRIBUTES */}
        <div className="w-56 shrink-0 bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200 mb-2.5">
              Common Attributes
            </h4>
            <div className="space-y-3">
              <div>
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Stocking Options
                </span>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[11px] text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>In stock</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => setOnSaleOnly(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Discounted / Sale</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Compliance & Media
                </span>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[11px] text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={hasDatasheetOnly}
                      onChange={(e) => setHasDatasheetOnly(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Datasheet Available</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={rohsOnly}
                      onChange={(e) => setRohsOnly(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>RoHS Compliant</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: MANUFACTURER / BRAND */}
        {dynamicFilterOptions.brands.length > 0 && (
          <div className="w-56 shrink-0 bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200 mb-2">
                Filter by Brands:
              </h4>
              <div className="relative mb-2">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="Search Brands..."
                  value={filterSearchQueries.brand || ''}
                  onChange={(e) => setFilterSearchQueries((p) => ({ ...p, brand: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {dynamicFilterOptions.brands
                  .filter((b) => !filterSearchQueries.brand || b.value.toLowerCase().includes(filterSearchQueries.brand.toLowerCase()))
                  .map(({ value: brandName, count }) => {
                    const isSelected = selectedBrands.includes(brandName);
                    return (
                      <label
                        key={brandName}
                        onClick={() => toggleBrandFilter(brandName)}
                        className={`flex items-center justify-between px-1.5 py-1 rounded text-[11px] cursor-pointer transition-colors select-none ${
                          isSelected ? 'bg-indigo-50 font-bold text-indigo-800' : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{brandName}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-100 shrink-0">
                          {count}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* CARDS FOR DYNAMIC CATEGORY SPECIFICATIONS */}
        {filterableSpecifications.map((spec) => {
          const optionsList = dynamicFilterOptions.specs[spec.code] || [];
          if (optionsList.length === 0) return null;

          const selectedForSpec = specFilters[spec.code] || [];
          const searchQueryForSpec = filterSearchQueries[spec.code] || '';
          const filteredOptions = optionsList.filter((o) =>
            !searchQueryForSpec || o.value.toLowerCase().includes(searchQueryForSpec.toLowerCase())
          );

          return (
            <div key={spec.id} className="w-56 shrink-0 bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200 mb-2 truncate" title={spec.name}>
                  Filter by {spec.name}:
                </h4>
                <div className="relative mb-2">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    placeholder={`Search ${spec.name}...`}
                    value={searchQueryForSpec}
                    onChange={(e) => setFilterSearchQueries((p) => ({ ...p, [spec.code]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {filteredOptions.map(({ value, count }) => {
                    const isSelected = selectedForSpec.includes(value);
                    return (
                      <label
                        key={value}
                        onClick={() => toggleSpecFilterValue(spec.code, value)}
                        className={`flex items-center justify-between px-1.5 py-1 rounded text-[11px] cursor-pointer transition-colors select-none ${
                          isSelected ? 'bg-indigo-50 font-bold text-indigo-800' : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{value}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-100 shrink-0">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );

  // STANDARD CATALOGUE GRID VIEW
  return (
    <section id="store" className="py-10 bg-slate-50 text-slate-900 border-b border-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb Bar & Main Search Bar Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
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
              onClick={() => setSelectedCategory('all')}
              className={`hover:text-blue-600 transition-colors cursor-pointer ${
                selectedCategory === 'all' ? 'text-blue-600 font-bold' : 'text-slate-700 font-bold'
              }`}
            >
              Store Catalogue
            </button>
            {selectedCategory !== 'all' && (() => {
              const chain = getCategoryBreadcrumbChain(selectedCategory, activeCategories);
              return chain.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => setSelectedCategory(item.id)}
                    className={`cursor-pointer transition-colors ${
                      idx === chain.length - 1
                        ? 'text-slate-900 font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200'
                        : 'text-slate-600 hover:text-blue-600 font-bold'
                    }`}
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              ));
            })()}
          </div>

          {/* Top Right Intelligent Search Bar */}
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
                placeholder="Search components, MPN, SKU, specs..."
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

        {/* CASCADING FLYOUT CATEGORY MENU */}
        <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="relative" onMouseLeave={handleFlyoutLeave}>
            <button
              type="button"
              onClick={() => setFlyoutOpen(!flyoutOpen)}
              onMouseEnter={handleFlyoutEnter}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all shadow-xs"
            >
              <Menu className="w-4 h-4 text-blue-400" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-400 ${flyoutOpen ? 'rotate-180' : ''}`} />
            </button>

            {flyoutOpen && (
              <div 
                className="absolute top-full left-0 mt-1.5 bg-white border border-slate-200 shadow-2xl rounded-2xl flex overflow-hidden z-50 text-slate-900 border-t-2 border-t-blue-600 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={handleFlyoutEnter}
                onMouseLeave={handleFlyoutLeave}
              >
                {/* COLUMN 1: MAIN CATEGORIES */}
                <div className="w-64 bg-slate-50/90 border-r border-slate-200 py-2 shrink-0 max-h-[480px] overflow-y-auto">
                  <div className="px-4 pb-2 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Categories
                  </div>
                  {categoryTree.map((mainCat) => {
                    const isHovered = activeMainCatObj?.id === mainCat.id;
                    const hasChildren = mainCat.subcategories.length > 0;
                    return (
                      <div
                        key={mainCat.id}
                        onMouseEnter={() => {
                          setActiveFlyoutMainId(mainCat.id);
                          if (mainCat.subcategories.length > 0) {
                            setActiveFlyoutSubId(mainCat.subcategories[0].id);
                          } else {
                            setActiveFlyoutSubId(null);
                          }
                        }}
                        onClick={() => {
                          setSelectedCategory(mainCat.id);
                          setFlyoutOpen(false);
                        }}
                        className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          isHovered
                            ? 'bg-white text-blue-600 border-l-4 border-blue-600 shadow-2xs'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{mainCat.label}</span>
                        {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* COLUMN 2: SUBCATEGORIES */}
                {activeMainCatObj && activeMainCatObj.subcategories.length > 0 && (
                  <div className="w-64 bg-white border-r border-slate-200 py-2 shrink-0 max-h-[480px] overflow-y-auto">
                    <div className="px-4 pb-2 border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider truncate">
                      {activeMainCatObj.label}
                    </div>
                    {activeMainCatObj.subcategories.map((subCat) => {
                      const isHovered = activeSubCatObj?.id === subCat.id;
                      const hasChildren = subCat.subcategories.length > 0;
                      return (
                        <div
                          key={subCat.id}
                          onMouseEnter={() => setActiveFlyoutSubId(subCat.id)}
                          onClick={() => {
                            setSelectedCategory(subCat.id);
                            setFlyoutOpen(false);
                          }}
                          className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                            isHovered
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-extrabold'
                              : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{subCat.label}</span>
                          {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* COLUMN 3: SUB-SUBCATEGORIES */}
                {activeSubCatObj && activeSubCatObj.subcategories.length > 0 && (
                  <div className="w-64 bg-slate-50/50 py-2 shrink-0 max-h-[480px] overflow-y-auto">
                    <div className="px-4 pb-2 border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider truncate">
                      {activeSubCatObj.label}
                    </div>
                    {activeSubCatObj.subcategories.map((subSub) => (
                      <div
                        key={subSub.id}
                        onClick={() => {
                          setSelectedCategory(subSub.id);
                          setFlyoutOpen(false);
                        }}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">• {subSub.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Scope:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {currentCategoryObj ? currentCategoryObj.label : selectedCategory === 'all' ? 'All Catalogue Items' : selectedCategory}
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                ({getCategoryCount(selectedCategory)} items)
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER BAR CHIPS */}
        {activeFilterCount > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Filters:</span>
            </span>

            {/* Search query chip */}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5">
                <span>Keyword: "{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-blue-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Selected brands chips */}
            {selectedBrands.map((b) => (
              <span key={b} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                <span>Brand: {b}</span>
                <button type="button" onClick={() => toggleBrandFilter(b)} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Price range chip */}
            {(priceMin !== '' || priceMax !== '') && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                <span>Price: ₹{priceMin || 0} - ₹{priceMax || 'Max'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                  }}
                  className="hover:text-amber-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Stock status chips */}
            {inStockOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <span>In Stock Only</span>
                <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {onSaleOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
                <span>Discounted</span>
                <button type="button" onClick={() => setOnSaleOnly(false)} className="hover:text-rose-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {hasDatasheetOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5">
                <span>Datasheet Available</span>
                <button type="button" onClick={() => setHasDatasheetOnly(false)} className="hover:text-purple-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {rohsOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5">
                <span>RoHS Compliant</span>
                <button type="button" onClick={() => setRohsOnly(false)} className="hover:text-teal-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Spec value chips */}
            {(Object.entries(specFilters) as [string, string[]][]).map(([specCode, values]) => {
              const specDef = allSpecs.find((s) => s.code === specCode);
              return values.map((val) => (
                <span
                  key={`${specCode}-${val}`}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{specDef ? specDef.name : specCode}: {val}</span>
                  <button type="button" onClick={() => toggleSpecFilterValue(specCode, val)} className="hover:text-blue-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ));
            })}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="ml-auto text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Clear All ({activeFilterCount})
            </button>
          </div>
        )}

        {/* TOP HORIZONTAL PARAMETRIC FILTER MATRIX (IF MATRIX MODE ACTIVE) */}
        {filterLayoutMode === 'matrix' && (
          <div className="hidden lg:block animate-in fade-in duration-200">
            {renderHorizontalFilterMatrix()}
          </div>
        )}

        {/* MAIN E-COMMERCE LAYOUT */}
        <div id="store-catalogue-head" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP STICKY LEFT FILTER SIDEBAR (IF SIDEBAR MODE ACTIVE) */}
          {filterLayoutMode === 'sidebar' && (
            <aside className="hidden lg:block lg:col-span-3 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
              {renderFilterPanel()}
            </aside>
          )}

          {/* MAIN PRODUCT CATALOGUE GRID */}
          <main className={filterLayoutMode === 'sidebar' ? 'lg:col-span-9 space-y-4' : 'lg:col-span-12 space-y-4'}>
            
            {/* Results Active Summary Bar & Sorting & Filter View Mode Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Showing</span>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                  {totalItems === 0 ? 0 : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}`} of {totalItems} components
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    in <strong className="text-blue-600 font-bold">{currentCategoryObj?.label}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Filter Layout Mode Switcher (Desktop) */}
                <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterLayoutMode('matrix')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterLayoutMode === 'matrix' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Top Matrix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterLayoutMode('sidebar')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterLayoutMode === 'sidebar' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Left Sidebar</span>
                  </button>
                </div>

                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <span>Filter Products {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
                </button>

                {/* Sorting Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500 hidden sm:inline">Sort By:</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest Additions</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Rated</option>
                    <option value="brand_asc">Brand (A–Z)</option>
                    <option value="name_asc">Name (A–Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Cards Grid with smooth transition */}
            {isFilteringLoading ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600 font-mono">Applying specification filters...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedProducts.map((product) => {
                  const inCart = cartItemIds.includes(product.id);
                  const isJustAdded = addedItem === product.id;
                  const isCompared = compareIds.includes(product.id);
                  const isWishlisted = wishlistIds.includes(product.id);
                  const brand = getProductBrand(product);

                  // Extract 3 key specifications for highlights
                  const specHighlights: Array<{ name: string; val: string }> = [];
                  if (product.specifications) {
                    (Object.entries(product.specifications) as [string, StoreItemSpecValue][]).slice(0, 3).forEach(([code, valObj]) => {
                      const specDef = allSpecs.find((s) => s.code === code);
                      specHighlights.push({
                        name: specDef ? specDef.name : code,
                        val: `${valObj.value} ${valObj.unit || ''}`.trim(),
                      });
                    });
                  } else if (product.specs && Array.isArray(product.specs)) {
                    product.specs.slice(0, 3).forEach((s) => {
                      specHighlights.push({ name: 'Feature', val: s });
                    });
                  }

                  return (
                    <div
                      id={`store-card-${product.id}`}
                      key={product.id}
                      onClick={() => {
                        setSelectedComponent(product);
                        setQuantity(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`scroll-mt-36 bg-white rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden p-4 cursor-pointer hover:border-blue-400 ${
                        initialComponentId === product.id
                          ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/30'
                          : 'border-slate-200 shadow-2xs hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Image Carousel & Badges & Action Overlay */}
                        <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-4/3 mb-3 border border-slate-100">
                          <ImageCarousel
                            images={product.images}
                            image={product.image}
                            alt={product.name}
                            className="w-full h-full"
                            objectFit="cover"
                          />

                          {/* Badge */}
                          {product.badge && (
                            <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded bg-slate-900/90 backdrop-blur-xs text-[10px] font-bold text-white font-mono uppercase tracking-wider">
                              {product.badge}
                            </span>
                          )}

                          {/* Quick Wishlist & Quick View Hover Buttons */}
                          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => toggleWishlist(product.id, e)}
                              className={`p-1.5 rounded-lg backdrop-blur-xs transition-colors cursor-pointer ${
                                isWishlisted ? 'bg-rose-600 text-white' : 'bg-slate-900/70 text-white hover:bg-slate-900'
                              }`}
                              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewProduct(product);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900/70 text-white hover:bg-slate-900 backdrop-blur-xs transition-colors cursor-pointer"
                              title="Quick View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 font-mono">
                            {product.sku}
                          </span>
                        </div>

                        {/* Brand & MPN Header Row */}
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span className="text-blue-700 truncate max-w-[140px] font-mono uppercase">{brand}</span>
                          {product.mpn && <span className="text-purple-700 font-mono truncate max-w-[120px]">MPN: {product.mpn}</span>}
                        </div>

                        {/* Product Title */}
                        <h3 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 my-1 text-[11px]">
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                            <span>{product.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
                        </div>

                        {/* Stock Availability */}
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                          <span className={`w-2 h-2 rounded-full ${product.stock && product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className={`font-extrabold ${product.stock && product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {product.stock && product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Compare Checkbox, Datasheet & Price/Cart */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                        {/* Compare & Datasheet Toolbar */}
                        <div className="flex items-center justify-between text-[10px]">
                          <label
                            onClick={(e) => toggleCompareProduct(product.id, e)}
                            className="flex items-center gap-1.5 text-slate-600 font-bold cursor-pointer hover:text-blue-600 select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer"
                            />
                            <span>Compare</span>
                          </label>

                          {productHasDatasheet(product) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (product.documents && product.documents.length > 0) {
                                  setViewingDocModal(product.documents[0]);
                                } else if (product.datasheetUrl) {
                                  window.open(product.datasheetUrl, '_blank');
                                }
                              }}
                              className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                              title="Download Datasheet"
                            >
                              <Download className="w-3 h-3 text-purple-600" />
                              <span>Datasheet</span>
                            </button>
                          )}
                        </div>

                        {/* Price & Add To Cart Button */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-sm font-extrabold text-slate-900 font-mono">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] font-medium text-slate-400 line-through font-mono">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600 block">
                              In Stock ({product.stock})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(product);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
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
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <span>Displaying 10 per page</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-800 font-mono">
                    Page {validCurrentPage} of {totalPages}
                  </span>
                  <span className="text-slate-400">({totalItems} components total)</span>
                </div>

                <div className="flex items-center gap-2 select-none">
                  <button
                    type="button"
                    disabled={validCurrentPage === 1}
                    onClick={() => {
                      if (validCurrentPage > 1) {
                        setCurrentPage(validCurrentPage - 1);
                        const elem = document.getElementById('store-catalogue-head');
                        if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      validCurrentPage === 1
                        ? 'opacity-30 cursor-not-allowed text-slate-400'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isActive = page === validCurrentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => {
                          setCurrentPage(page);
                          const elem = document.getElementById('store-catalogue-head');
                          if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`min-w-[36px] h-[36px] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                          isActive
                            ? 'bg-[#38bdf8] text-white shadow-sm shadow-sky-400/30 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={validCurrentPage === totalPages}
                    onClick={() => {
                      if (validCurrentPage < totalPages) {
                        setCurrentPage(validCurrentPage + 1);
                        const elem = document.getElementById('store-catalogue-head');
                        if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      validCurrentPage === totalPages
                        ? 'opacity-30 cursor-not-allowed text-slate-400'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && !isFilteringLoading && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-2 p-8 space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No components matched your filter criteria.</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing some specification filters or broadening your price and brand search.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Active Filters</span>
                </button>
              </div>
            )}

          </main>
        </div>

        {/* MOBILE SLIDE-OUT FILTER DRAWER */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xs h-full flex flex-col justify-between shadow-2xl p-5 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>Filter Catalogue</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {renderFilterPanel()}
              </div>

              <div className="pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md transition-colors cursor-pointer"
                >
                  Apply Filters ({totalItems} Results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING COMPARE BAR */}
        {compareIds.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 max-w-xl w-11/12">
            <div className="flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs font-bold font-mono">Compare ({compareIds.length}/4)</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 flex-1">
              {compareIds.map((id) => {
                const item = activeProductsList.find((p) => p.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="relative shrink-0 w-8 h-8 rounded-lg bg-white overflow-hidden border border-slate-600">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCompareIds((prev) => prev.filter((i) => i !== id))}
                      className="absolute top-0 right-0 bg-slate-900/80 text-white rounded-bl p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Compare Now
              </button>
            </div>
          </div>
        )}

        {/* SPECIFICATION COMPARISON MODAL */}
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Technical Specifications Comparison Matrix
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={highlightCompareDiffs}
                      onChange={(e) => setHighlightCompareDiffs(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Highlight Differences</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* COMPARISON MATRIX TABLE */}
              <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-3 font-bold text-slate-500 min-w-[160px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                        Feature / Parameter
                      </th>
                      {compareIds.map((id) => {
                        const comp = activeProductsList.find((p) => p.id === id);
                        if (!comp) return null;
                        return (
                          <th key={id} className="p-3 font-bold text-slate-900 min-w-[200px] border-r border-slate-200 space-y-1.5 text-center">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 mx-auto border border-slate-200">
                              <img src={comp.image} alt={comp.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="font-extrabold text-xs line-clamp-2">{comp.name}</div>
                            <div className="text-[10px] font-mono font-bold text-blue-600">₹{comp.price.toLocaleString()}</div>
                            <button
                              type="button"
                              onClick={() => handleAdd(comp)}
                              className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 cursor-pointer"
                            >
                              Add to Cart
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Common attributes */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-200">Brand / Manufacturer</td>
                      {compareIds.map((id) => {
                        const comp = activeProductsList.find((p) => p.id === id);
                        return (
                          <td key={id} className="p-3 text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                            {comp ? getProductBrand(comp) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-200">MPN / SKU</td>
                      {compareIds.map((id) => {
                        const comp = activeProductsList.find((p) => p.id === id);
                        return (
                          <td key={id} className="p-3 text-center font-mono text-slate-600 border-r border-slate-200">
                            {comp ? `${comp.mpn || 'N/A'} / ${comp.sku}` : '-'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Dynamic Specifications Rows */}
                    {allSpecs.map((spec) => {
                      const values = compareIds.map((id) => {
                        const comp = activeProductsList.find((p) => p.id === id);
                        if (!comp) return '-';
                        if (comp.specifications && comp.specifications[spec.code]) {
                          const v: StoreItemSpecValue = comp.specifications[spec.code];
                          return `${v.value} ${v.unit || ''}`.trim();
                        }
                        return '-';
                      });

                      const allEqual = values.every((v) => v === values[0]);
                      const isDiff = !allEqual;

                      if (highlightCompareDiffs && !isDiff) return null;

                      return (
                        <tr key={spec.id} className={isDiff && highlightCompareDiffs ? 'bg-amber-50/60' : ''}>
                          <td className="p-3 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-200">
                            {spec.name}
                          </td>
                          {values.map((val, idx) => (
                            <td key={idx} className={`p-3 text-center font-mono text-slate-800 border-r border-slate-200 ${isDiff ? 'font-bold text-blue-900' : ''}`}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK VIEW MODAL */}
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-blue-600 uppercase font-mono">Quick Component Preview</span>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                  <ImageCarousel
                    images={quickViewProduct.images}
                    image={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    SKU: {quickViewProduct.sku}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {quickViewProduct.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {quickViewProduct.shortDesc}
                  </p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      ₹{quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{quickViewProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAdd(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW MODAL */}
        {viewingDocModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm truncate max-w-md">
                    {viewingDocModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDocModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>Type: <strong>{viewingDocModal.fileType}</strong></span>
                <span>•</span>
                <span>Size: <strong>{viewingDocModal.fileSize || 'N/A'}</strong></span>
              </div>

              <div className="flex-1 min-h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                {viewingDocModal.url && viewingDocModal.url !== '#' ? (
                  <iframe
                    src={viewingDocModal.url}
                    title={viewingDocModal.title}
                    className="w-full h-full min-h-[400px] border-none bg-white"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-slate-600" />
                    <p className="text-xs font-bold text-slate-300">Preview not available for this document format.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingDocModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Store Assurance Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center shadow-xs">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">100% Quality Inspected</h4>
            <p className="text-[11px] text-slate-500 font-medium">All components undergo bench voltage and pin continuity testing.</p>
          </div>
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Same-Day Dispatch</h4>
            <p className="text-[11px] text-slate-500 font-medium font-mono">Orders placed before 3 PM dispatched same day.</p>
          </div>
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold mb-2">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Bulk Component Sourcing</h4>
            <p className="text-[11px] text-slate-500 font-medium">Reel-packaged IC procurement & custom PCB assembly.</p>
          </div>
        </div>

      </div>
    </section>
  );
};
