/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ShoppingCart, Menu, X, ChevronRight, ChevronDown, ArrowLeft, Send, CheckCircle2, Building2, Mail, Phone, User, Sparkles, Globe, Shield, Zap, TrendingUp, Cpu, Award, Lock, ExternalLink, Download, FileText, Settings, BarChart3, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { products, Product } from './data/products';
import appIcon from '../image/app/log.png';
import appScreen1 from '../image/app/image.png';
import appScreen2 from '../image/app/image copy.png';
import appScreen3 from '../image/app/image copy 2.png';
import appScreen4 from '../image/app/image copy 3.png';

// Types
interface CartItem {
  product: Product;
  selections: { [key: string]: string };
  quantity: number;
}

type AppView = 'home' | 'products' | 'pdp' | 'cart' | 'success' | 'about' | 'contact' | 'adminLogin' | 'adminDashboard';

interface AdminInquiryItem {
  id: number;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  selections: Record<string, string>;
  createdAt: string;
}

interface AdminInquiry {
  id: number;
  contactName: string;
  companyName: string;
  workEmail: string;
  phoneNumber: string;
  inquiryDetails: string;
  totalItems: number;
  createdAt: string;
  items: AdminInquiryItem[];
}

const ADMIN_ROUTE_BASE = '/ops-vault-7k2m9q';
const ADMIN_LOGIN_PATH = `${ADMIN_ROUTE_BASE}/login`;
const ADMIN_DASHBOARD_PATH = ADMIN_ROUTE_BASE;
const ADMIN_API_OFFLINE_MESSAGE = 'Admin service is offline. Start npm run dev:server first.';

const getInitialView = (): AppView => {
  switch (window.location.pathname) {
    case '/products':
      return 'products';
    case '/cart':
      return 'cart';
    case '/about':
      return 'about';
    case '/contact':
      return 'contact';
    case '/success':
      return 'success';
    case ADMIN_DASHBOARD_PATH:
      return 'adminDashboard';
    case ADMIN_LOGIN_PATH:
      return 'adminLogin';
    default:
      return 'home';
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => getInitialView());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pdpSelections, setPdpSelections] = useState<{ [key: string]: string }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPartnerPortalOpen, setIsPartnerPortalOpen] = useState(false);
  const [isSupportTicketOpen, setIsSupportTicketOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeAppScreenIndex, setActiveAppScreenIndex] = useState(0);
  const [activeProductCategory, setActiveProductCategory] = useState('All');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  const [adminSessionUser, setAdminSessionUser] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminDataError, setAdminDataError] = useState('');
  const [isAdminAuthenticating, setIsAdminAuthenticating] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminInquiries, setAdminInquiries] = useState<AdminInquiry[]>([]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const getGalleryImages = (product: Product) => product.gallery || [product.image];
  const appScreens = [appScreen1, appScreen2, appScreen3, appScreen4];

  const updateHistoryPath = (path: string, replace = false) => {
    if (window.location.pathname === path) {
      return;
    }

    if (replace) {
      window.history.replaceState({}, '', path);
      return;
    }

    window.history.pushState({}, '', path);
  };

  const initializeProductSelection = (product: Product) => {
    const initialSelections: { [key: string]: string } = {};
    product.variants.forEach((variant) => {
      initialSelections[variant.label] = variant.options[0].value;
    });
    setSelectedProductImage(getSelectionImage(product, initialSelections));
    setPdpSelections(initialSelections);
  };

  const getSelectionImage = (product: Product, selections: {[key: string]: string}, changedOptionImage?: string) => {
    if (product.selectionImageMap) {
      const key = Object.keys(selections)
        .sort()
        .map(label => `${label}=${selections[label]}`)
        .join('|');
      if (product.selectionImageMap[key]) {
        return product.selectionImageMap[key];
      }

      let bestPartialMatch: { image: string; score: number } | null = null;

      Object.entries(product.selectionImageMap).forEach(([mapKey, image]) => {
        const score = mapKey.split('|').reduce((matched, pair) => {
          const [label, value] = pair.split('=');
          return selections[label] === value ? matched + 1 : matched;
        }, 0);

        if (score > 0 && (!bestPartialMatch || score > bestPartialMatch.score)) {
          bestPartialMatch = { image, score };
        }
      });

      if (bestPartialMatch) {
        return bestPartialMatch.image;
      }
    }

    if (changedOptionImage) {
      return changedOptionImage;
    }

    return getGalleryImages(product)[0];
  };

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentView !== 'home' || appScreens.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveAppScreenIndex((prev) => (prev + 1) % appScreens.length);
    }, 3200);

    return () => {
      window.clearInterval(timer);
    };
  }, [currentView, appScreens.length]);

  const loadAdminSession = async () => {
    try {
      const response = await fetch('/api/admin/session', {
        credentials: 'include',
      });

      if (!response.ok) {
        setAdminSessionUser('');
        return null;
      }

      const data = await response.json() as { username: string };
      setAdminSessionUser(data.username);
      return data.username;
    } catch (_error) {
      setAdminSessionUser('');
      setAdminAuthError(ADMIN_API_OFFLINE_MESSAGE);
      return null;
    }
  };

  const loadAdminInquiries = async () => {
    setIsAdminLoading(true);
    setAdminDataError('');

    try {
      const response = await fetch('/api/admin/inquiries', {
        credentials: 'include',
      });

      if (response.status === 401) {
        setAdminInquiries([]);
        setAdminSessionUser('');
        setCurrentView('adminLogin');
        updateHistoryPath(ADMIN_LOGIN_PATH, true);
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to load inquiry list');
      }

      const data = await response.json() as { inquiries: AdminInquiry[] };
      setAdminInquiries(data.inquiries || []);
      return true;
    } catch (_error) {
      setAdminDataError(ADMIN_API_OFFLINE_MESSAGE);
      return false;
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    const syncViewFromLocation = async () => {
      const pathname = window.location.pathname;

      if (pathname === ADMIN_DASHBOARD_PATH || pathname === ADMIN_LOGIN_PATH) {
        const username = await loadAdminSession();

        if (!username) {
          setAdminInquiries([]);
          setCurrentView('adminLogin');
          if (pathname !== ADMIN_LOGIN_PATH) {
            updateHistoryPath(ADMIN_LOGIN_PATH, true);
          }
          return;
        }

        setAdminAuthError('');
        setCurrentView('adminDashboard');
        if (pathname !== ADMIN_DASHBOARD_PATH) {
          updateHistoryPath(ADMIN_DASHBOARD_PATH, true);
        }
        await loadAdminInquiries();
        return;
      }

      switch (pathname) {
        case '/products':
          setCurrentView('products');
          break;
        case '/cart':
          setCurrentView('cart');
          break;
        case '/about':
          setCurrentView('about');
          break;
        case '/contact':
          setCurrentView('contact');
          break;
        case '/success':
          setCurrentView('success');
          break;
        default:
          setCurrentView('home');
          break;
      }
    };

    void syncViewFromLocation();

    const handlePopState = () => {
      void syncViewFromLocation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navigation handlers
  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath('/');
    window.scrollTo(0, 0);
  };

  const navigateToAbout = () => {
    setCurrentView('about');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath('/about');
    window.scrollTo(0, 0);
  };

  const navigateToContact = () => {
    setCurrentView('contact');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath('/contact');
    window.scrollTo(0, 0);
  };

  const navigateToProducts = (category = 'All') => {
    setActiveProductCategory(category);
    setCurrentView('products');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath('/products');
    window.scrollTo(0, 0);
  };

  const navigateToPdp = (product: Product) => {
    setSelectedProduct(product);
    initializeProductSelection(product);
    setCurrentView('pdp');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const showAdjacentProductImage = (direction: 'prev' | 'next') => {
    if (!selectedProduct) return;
    const images = getGalleryImages(selectedProduct);
    const currentImage = selectedProductImage || images[0];
    const currentIndex = images.indexOf(currentImage);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = direction === 'next'
      ? (safeIndex + 1) % images.length
      : (safeIndex - 1 + images.length) % images.length;
    setSelectedProductImage(images[nextIndex]);
  };

  const navigateToCart = () => {
    setCurrentView('cart');
    setIsMenuOpen(false);
    updateHistoryPath('/cart');
    window.scrollTo(0, 0);
  };

  const navigateToSuccess = () => {
    setCurrentView('success');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath('/success');
    window.scrollTo(0, 0);
  };

  const navigateToAdminLogin = (replace = false) => {
    setCurrentView('adminLogin');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath(ADMIN_LOGIN_PATH, replace);
    window.scrollTo(0, 0);
  };

  const navigateToAdminDashboard = (replace = false) => {
    setCurrentView('adminDashboard');
    setSelectedProduct(null);
    setIsMenuOpen(false);
    updateHistoryPath(ADMIN_DASHBOARD_PATH, replace);
    window.scrollTo(0, 0);
  };

  // Cart handlers
  const addToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      product: selectedProduct,
      selections: { ...pdpSelections },
      quantity: 1
    };
    setCart([...cart, newItem]);
    navigateToCart();
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const submitInquiry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      setInquiryError('Your inquiry list is empty.');
      return;
    }

    const form = e.currentTarget;
    setIsSubmittingInquiry(true);
    setInquiryError('');

    const formData = new FormData(form);
    const payload = {
      contactName: String(formData.get('contactName') || '').trim(),
      companyName: String(formData.get('companyName') || '').trim(),
      workEmail: String(formData.get('workEmail') || '').trim(),
      phoneNumber: String(formData.get('phoneNumber') || '').trim(),
      inquiryDetails: String(formData.get('inquiryDetails') || '').trim(),
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productCategory: item.product.category,
        quantity: item.quantity,
        selections: item.selections,
      })),
    };

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to submit inquiry right now.' }));
        throw new Error(data.error || 'Unable to submit inquiry right now.');
      }

      form.reset();
      setCart([]);
      navigateToSuccess();
    } catch (error) {
      setInquiryError(error instanceof Error ? error.message : 'Unable to submit inquiry right now.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handlePartnerLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleSupportTicketSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSupportTicketOpen(false);
    setIsPartnerPortalOpen(false);
    navigateToSuccess();
  };

  const handleAdminLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdminAuthenticating(true);
    setAdminAuthError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(adminLoginForm),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Login failed.');
      }

      setAdminSessionUser((data as { username: string }).username);
      setAdminLoginForm((current) => ({ ...current, password: '' }));
      navigateToAdminDashboard();
      await loadAdminInquiries();
    } catch (error) {
      if (error instanceof TypeError) {
        setAdminAuthError(ADMIN_API_OFFLINE_MESSAGE);
      } else {
        setAdminAuthError(error instanceof Error ? error.message : 'Login failed.');
      }
    } finally {
      setIsAdminAuthenticating(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_error) {
      // Logout should still clear local admin state even if the request fails.
    }

    setAdminSessionUser('');
    setAdminInquiries([]);
    setAdminDataError('');
    setAdminAuthError('');
    setAdminLoginForm({ username: '', password: '' });
    navigateToAdminLogin(true);
  };

  const selectedProductGallery = selectedProduct ? getGalleryImages(selectedProduct) : [];
  const activeProductImage = selectedProductGallery.length > 0
    ? selectedProductImage || selectedProductGallery[0]
    : null;
  const productCategories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  const filteredProducts = activeProductCategory === 'All'
    ? products
    : products.filter((product) => product.category === activeProductCategory);
  const homeProductSeries = products.slice(0, 6);
  const relatedProductSeries = selectedProduct
    ? products.filter((product) => product.id !== selectedProduct.id).slice(0, 5)
    : [];
  const isAdminView = currentView === 'adminLogin' || currentView === 'adminDashboard';
  const totalInquiryItems = adminInquiries.reduce((count, inquiry) => count + inquiry.items.length, 0);
  const renderProductCenter = () => (
    <section className={`max-w-7xl mx-auto px-6 py-24 transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10">
        <aside className={`lg:sticky lg:top-24 self-start rounded-[36px] p-8 transition-colors ${isDarkMode ? 'bg-[#111111] border border-white/5' : 'bg-[#F5F6F8] border border-gray-100'}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500 mb-3">Product Center</p>
          <h2 className="text-3xl font-bold tracking-tight mb-4">OEM Product Series</h2>
          <p className={`text-sm leading-6 mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            The series pages present reusable product platforms and configurable modules rather than individual retail SKUs.
          </p>
          <div className="space-y-2">
            {productCategories.map((category) => {
              const count = category === 'All'
                ? products.length
                : products.filter((product) => product.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveProductCategory(category)}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all ${
                    activeProductCategory === category
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : isDarkMode
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-semibold">{category}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    activeProductCategory === category ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Series Approach</p>
            <p className={`text-sm leading-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Each entry includes representative models, standard configuration directions, and the OEM scope typically discussed before sampling.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400 mb-2">Series List</p>
              <h3 className="text-2xl md:text-3xl font-bold">Configurable platforms for OEM and ODM projects</h3>
            </div>
            <p className={`hidden md:block max-w-sm text-sm leading-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Category-first navigation, then series cards with representative models and customization scope.
            </p>
          </div>

          {filteredProducts.map((product) => (
            <motion.article
              key={product.id}
              whileHover={{ y: -6 }}
              className={`group grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] rounded-[36px] overflow-hidden cursor-pointer transition-colors ${isDarkMode ? 'bg-[#141414] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
              onClick={() => navigateToPdp(product)}
            >
              <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                <img
                  src={product.gallery?.[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest rounded-full text-black">
                    {product.category}
                  </span>
                  {product.seriesCode && (
                    <span className="px-3 py-1 bg-black/65 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest rounded-full text-white">
                      {product.seriesCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8 md:p-10 flex flex-col justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors">{product.name}</h3>
                  <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.tagline}</p>
                  <p className={`text-sm leading-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Representative Models</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sampleModels?.map((model) => (
                        <span
                          key={model}
                          className={`px-3 py-2 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">OEM Scope</p>
                    <div className="space-y-2">
                      {product.customizationOptions?.slice(0, 3).map((item) => (
                        <div key={item} className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    View series details and configuration directions
                  </p>
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#F8F9FA] text-[#1A1A1A]'} font-sans selection:bg-blue-500 selection:text-white`}>
      {/* Partner Portal Modal */}
      <AnimatePresence>
        {isPartnerPortalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#1A1A1A] border border-white/10' : 'bg-white'}`}
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Partner Portal</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">Authorized Access Only</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPartnerPortalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {!isLoggedIn ? (
                  <form onSubmit={handlePartnerLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Partner ID</label>
                      <input 
                        required
                        type="text" 
                        placeholder="APP-XXXX-XXXX"
                        className={`w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Access Key</label>
                      <input 
                        required
                        type="password" 
                        placeholder="••••••••"
                        className={`w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-5 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                      Secure Login
                    </button>
                    <p className="text-center text-xs text-gray-400">
                      Forgot your access key? <button type="button" onClick={() => setIsSupportTicketOpen(true)} className="text-blue-500 hover:underline">Contact Support</button>
                    </p>
                  </form>
                ) : (
                  <div className="space-y-8 py-4">
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 text-green-500">
                      <CheckCircle2 size={20} />
                      <p className="text-sm font-bold">Authentication Successful</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all hover:scale-105 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <BarChart3 size={24} className="text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Analytics</span>
                      </button>
                      <button className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all hover:scale-105 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <Download size={24} className="text-purple-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Resources</span>
                      </button>
                      <button className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all hover:scale-105 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <Users size={24} className="text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Team</span>
                      </button>
                      <button className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all hover:scale-105 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <Settings size={24} className="text-gray-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsLoggedIn(false)}
                      className="w-full py-4 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Logout Session
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSupportTicketOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              className={`w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#1A1A1A] border border-white/10' : 'bg-white'}`}
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-500 mb-2">Support Ticket</p>
                    <h3 className="text-2xl font-bold">Partner Access Request</h3>
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Submit your request and our team will follow up with access recovery steps.
                    </p>
                  </div>
                  <button onClick={() => setIsSupportTicketOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSupportTicketSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                      required
                      type="text"
                      placeholder="Partner ID"
                      className={`w-full px-5 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Company name"
                      className={`w-full px-5 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                      required
                      type="email"
                      placeholder="Work email"
                      className={`w-full px-5 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className={`w-full px-5 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the access issue or support request..."
                    className={`w-full px-5 py-4 rounded-2xl border-none resize-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-black'}`}
                  />
                  <button
                    type="submit"
                    className="w-full py-5 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    Submit Ticket
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="text-xl font-bold tracking-tighter cursor-pointer flex items-center gap-2"
            onClick={navigateToHome}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white' : 'bg-[#1A1A1A]'}`}>
              <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`} />
            </div>
            APPOCONN
          </div>

          {/* Desktop Nav */}
          {!isAdminView && (
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <button onClick={navigateToHome} className={`hover:text-blue-500 transition-colors ${currentView === 'home' ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>Home</button>
              <div className="relative group">
                <button
                  onClick={() => navigateToProducts()}
                  className={`flex items-center gap-2 hover:text-blue-500 transition-colors ${currentView === 'products' ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}
                >
                  Products <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-1/2 top-full z-50 hidden w-[320px] -translate-x-1/2 pt-4 group-hover:block">
                  <div className={`rounded-[28px] p-4 shadow-2xl ${isDarkMode ? 'bg-[#111111] border border-white/10' : 'bg-white border border-gray-100'}`}>
                    <button
                      type="button"
                      onClick={() => navigateToProducts()}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                    >
                      <p className="text-sm font-bold">All Product Series</p>
                      <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open the full OEM product center</p>
                    </button>
                    <div className={`my-3 h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`} />
                    <div className="space-y-2">
                      {productCategories.filter((category) => category !== 'All').map((category) => {
                        const count = products.filter((product) => product.category === category).length;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => navigateToProducts(category)}
                            className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                          >
                            <div>
                              <p className="text-sm font-semibold">{category}</p>
                              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View related OEM series</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={navigateToAbout} className={`hover:text-blue-500 transition-colors ${currentView === 'about' ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>About Us</button>
              <button onClick={navigateToContact} className={`hover:text-blue-500 transition-colors ${currentView === 'contact' ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>Contact</button>
            </div>
          )}

          <div className="flex items-center gap-4">
            {isAdminView && (
              <>
                <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-600'}`}>
                  <Lock size={14} />
                  {adminSessionUser ? `Admin ${adminSessionUser}` : 'Admin Console'}
                </div>
                <button
                  onClick={navigateToHome}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#1A1A1A] text-white hover:bg-gray-800'}`}
                >
                  Back to Site
                </button>
              </>
            )}
            {!isAdminView && (
              <button 
                onClick={() => setIsPartnerPortalOpen(true)}
                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
              >
                <Lock size={14} /> Partner Portal
              </button>
            )}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-yellow-400' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              {isDarkMode ? <Zap size={20} fill="currentColor" /> : <Shield size={20} />}
            </button>
            {!isAdminView && (
              <>
                <button 
                  onClick={navigateToCart}
                  className={`relative p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-white text-[10px] flex items-center justify-center rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button 
                  className="md:hidden p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-semibold">
              <button onClick={navigateToHome}>Home</button>
              <button onClick={() => navigateToProducts()}>Products</button>
              <div className="pl-4 flex flex-col gap-3">
                {productCategories.filter((category) => category !== 'All').map((category) => (
                  <button
                    key={category}
                    onClick={() => navigateToProducts(category)}
                    className="text-left text-base font-medium text-gray-500"
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button onClick={navigateToAbout}>About Us</button>
              <button onClick={navigateToContact}>Contact</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          {currentView === 'adminLogin' && (
            <motion.div
              key="adminLogin"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="max-w-md mx-auto px-6 py-24"
            >
              <section className={`rounded-[40px] p-10 border ${isDarkMode ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Admin Login</h2>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Username and password required</p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        required
                        type="text"
                        value={adminLoginForm.username}
                        onChange={(event) => setAdminLoginForm((current) => ({ ...current, username: event.target.value }))}
                        placeholder="Enter admin username"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 text-black border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        required
                        type="password"
                        value={adminLoginForm.password}
                        onChange={(event) => setAdminLoginForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Enter admin password"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 text-black border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                      />
                    </div>
                  </div>
                  {adminAuthError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {adminAuthError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isAdminAuthenticating}
                    className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAdminAuthenticating ? 'Signing In...' : 'Login to Admin'}
                  </button>
                </form>
              </section>
            </motion.div>
          )}

          {currentView === 'adminDashboard' && (
            <motion.div
              key="adminDashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="max-w-7xl mx-auto px-6 py-16"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500 mb-3">Admin Dashboard</p>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Inquiry Records</h1>
                  <p className={`text-base leading-8 max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Review shopping and inquiry submissions captured by the public site. Records are currently stored in the local SQLite database on this environment.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void loadAdminInquiries()}
                    className={`px-5 py-3 rounded-full text-sm font-bold transition-all ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#1A1A1A] text-white hover:bg-gray-800'}`}
                  >
                    Refresh Records
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className={`px-5 py-3 rounded-full text-sm font-bold transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { label: 'Total Inquiries', value: `${adminInquiries.length}` },
                  { label: 'Saved Items', value: `${totalInquiryItems}` },
                  { label: 'Admin User', value: adminSessionUser || 'Authorized' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-[32px] p-6 border ${isDarkMode ? 'bg-[#111111] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {adminDataError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {adminDataError}
                </div>
              )}

              {isAdminLoading ? (
                <div className={`rounded-[40px] p-12 text-center border ${isDarkMode ? 'bg-[#111111] border-white/10 text-gray-400' : 'bg-white border-gray-100 text-gray-500 shadow-sm'}`}>
                  Loading inquiry records...
                </div>
              ) : adminInquiries.length === 0 ? (
                <div className={`rounded-[40px] p-12 text-center border ${isDarkMode ? 'bg-[#111111] border-white/10 text-gray-400' : 'bg-white border-gray-100 text-gray-500 shadow-sm'}`}>
                  No inquiry records saved yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {adminInquiries.map((inquiry) => (
                    <article key={inquiry.id} className={`rounded-[36px] p-8 border ${isDarkMode ? 'bg-[#111111] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                              Inquiry #{inquiry.id}
                            </span>
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(inquiry.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold">{inquiry.companyName}</h2>
                          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {inquiry.contactName} · {inquiry.workEmail} · {inquiry.phoneNumber}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 min-w-[220px]">
                          <div className={`rounded-[24px] px-4 py-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1">Items</p>
                            <p className="text-2xl font-bold">{inquiry.totalItems}</p>
                          </div>
                          <div className={`rounded-[24px] px-4 py-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1">Channel</p>
                            <p className="text-base font-bold">Website</p>
                          </div>
                        </div>
                      </div>

                      {inquiry.inquiryDetails && (
                        <div className={`mt-6 rounded-[28px] p-5 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-2">Inquiry Details</p>
                          <p className={`text-sm leading-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{inquiry.inquiryDetails}</p>
                        </div>
                      )}

                      <div className="mt-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-4">Saved Items</p>
                        <div className="space-y-4">
                          {inquiry.items.map((item) => (
                            <div key={item.id} className={`rounded-[28px] p-5 border ${isDarkMode ? 'bg-[#0B0B0B] border-white/5' : 'bg-white border-gray-100'}`}>
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-bold">{item.productName}</h3>
                                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.productCategory}</p>
                                </div>
                                <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-500'}`}>
                                  Qty {item.quantity}
                                </div>
                              </div>
                              {Object.keys(item.selections).length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {Object.entries(item.selections).map(([key, value]) => (
                                    <span
                                      key={`${item.id}-${key}`}
                                      className={`px-3 py-2 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}
                                    >
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section */}
              <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Tech Grid Background */}
                <div className="absolute inset-0 z-0">
                  <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] ${isDarkMode ? 'opacity-20' : 'opacity-40'}`} />
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#0A0A0A]`} />
                  
                  {/* Hero Background Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: isDarkMode ? 0.3 : 0.1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
                    alt="Connected device manufacturing background"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]' : 'bg-gradient-to-b from-white via-transparent to-white'}`} />
                </div>

                {/* Animated Glows */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                      x: [0, 50, 0],
                      y: [0, -30, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]"
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.4, 0.2],
                      x: [0, -40, 0],
                      y: [0, 60, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px]"
                  />
                </div>
                
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-12 border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-gray-50 border-gray-100 text-blue-600'}`}
                  >
                    <Sparkles size={12} className="animate-pulse" /> OEM & ODM IoT Devices
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.85]"
                  >
                    Built for <br /> 
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-white via-blue-400 to-white/50' : 'from-gray-900 via-blue-600 to-gray-900'}`}>
                      Brands at Scale
                    </span>
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    APPOCONN develops and manufactures practical connected devices including smart watches, blood pressure monitors, smart scales, and home sensors for private label and OEM programs.
                  </motion.p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => navigateToProducts()}
                      className={`px-12 py-6 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-2xl ${isDarkMode ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-[#1A1A1A] text-white hover:bg-gray-800 shadow-black/20'}`}
                    >
                      View Product Lines
                    </motion.button>
                    <motion.a
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      href="https://apps.apple.com/us/app/despacito-life/id6753885213"
                      target="_blank"
                      rel="noreferrer"
                      className={`px-12 py-6 border-2 rounded-full font-bold text-lg transition-all ${isDarkMode ? 'bg-transparent text-white border-white/20 hover:bg-white/10' : 'bg-white text-[#1A1A1A] border-gray-100 hover:bg-gray-50'}`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <ExternalLink size={20} /> Download App
                      </span>
                    </motion.a>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      onClick={navigateToContact}
                      className={`px-12 py-6 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-3 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      <FileText size={20} /> Request Catalog
                    </motion.button>
                  </div>
                </div>
                
                {/* Scroll Indicator */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Scroll to Explore</span>
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent" 
                  />
                </motion.div>
              </section>

              <section className={`py-24 transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500 mb-3">Product Center</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">OEM Product Series</h2>
                    <p className={`max-w-3xl mx-auto text-base md:text-lg leading-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Explore the main product families on the home page, then open the dedicated Products page or go directly into a series detail page.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {homeProductSeries.map((product) => (
                      <motion.article
                        key={product.id}
                        whileHover={{ y: -8 }}
                        className="group cursor-pointer"
                        onClick={() => navigateToPdp(product)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-[32px] mb-5">
                          <img
                            src={product.gallery?.[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="px-1">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-2">{product.category}</p>
                              <h3 className="text-2xl font-bold group-hover:text-blue-500 transition-colors">{product.name}</h3>
                            </div>
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 group-hover:bg-blue-500 group-hover:text-white' : 'bg-gray-100 group-hover:bg-blue-500 group-hover:text-white'}`}>
                              <ChevronRight size={18} />
                            </div>
                          </div>
                          <p className={`text-sm leading-7 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {product.sampleModels?.slice(0, 2).map((model) => (
                              <span
                                key={model}
                                className={`px-3 py-2 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                              >
                                {model}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() => navigateToProducts()}
                      className={`px-8 py-4 rounded-full font-bold transition-all ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#1A1A1A] text-white hover:bg-gray-800'}`}
                    >
                      Open Full Products Page
                    </button>
                  </div>
                </div>
              </section>

              <section className={`pb-10 transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className={`rounded-[40px] overflow-hidden ${isDarkMode ? 'bg-[#0F1720] border border-white/5' : 'bg-[#F4F7FB] border border-gray-100'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-0">
                      <div className="p-10 md:p-14">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500 mb-4">App Spotlight</p>
                        <div className="flex items-center gap-4 mb-8">
                          <img
                            src={appIcon}
                            alt="Despacito Life app icon"
                            className="w-20 h-20 rounded-[24px] object-cover shadow-lg"
                          />
                          <div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Despacito Life</h2>
                            <p className={`mt-2 text-base md:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Nurture Fitness, Sleep & Diet
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-8">
                          {['Free', 'Designed for iPad', 'View in Mac App Store'].map((item) => (
                            <span
                              key={item}
                              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] ${isDarkMode ? 'bg-white/5 text-white/75' : 'bg-white text-gray-600 border border-gray-200'}`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        <p className={`text-base md:text-lg leading-8 max-w-xl mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          A wellness-focused lifestyle app experience covering daily activity, sleep rhythm, diet tracking, and personal habit management in one clean flow.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <a
                            href="https://apps.apple.com/us/app/despacito-life/id6753885213"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all inline-flex items-center justify-center gap-3"
                          >
                            <ExternalLink size={18} /> Download on App Store
                          </a>
                        </div>
                      </div>

                      <div className={`relative min-h-[500px] lg:min-h-full border-t lg:border-t-0 lg:border-l overflow-hidden flex items-center justify-center p-8 md:p-10 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-white/60'}`}>
                        <img
                          src={appScreens[activeAppScreenIndex]}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover object-center scale-110 blur-3xl opacity-25"
                        />
                        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(15,23,32,0.78))]' : 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.14),rgba(255,255,255,0.78))]'}`} />
                        <div className="relative z-10 w-[250px] md:w-[290px] rounded-[42px] bg-[#0B0B0D] p-[10px] shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
                          <div className="relative rounded-[34px] bg-black p-[3px]">
                            <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
                            <div className="absolute left-1/2 top-[18px] z-20 h-2 w-16 -translate-x-1/2 rounded-full bg-[#1f2937]" />
                            <div className="absolute right-[88px] top-[17px] z-20 h-2.5 w-2.5 rounded-full bg-[#111827] ring-1 ring-white/10" />
                            <div className="overflow-hidden rounded-[30px] bg-black">
                              <img
                                src={appScreens[activeAppScreenIndex]}
                                alt={`Despacito Life preview ${activeAppScreenIndex + 1}`}
                                className="h-[500px] md:h-[580px] w-full object-cover object-top"
                              />
                            </div>
                          </div>
                          <div className="pointer-events-none absolute -right-1 top-28 h-16 w-1 rounded-full bg-white/10" />
                          <div className="pointer-events-none absolute -left-1 top-24 h-10 w-1 rounded-full bg-white/10" />
                          <div className="pointer-events-none absolute -left-1 top-40 h-16 w-1 rounded-full bg-white/10" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveAppScreenIndex((prev) => (prev - 1 + appScreens.length) % appScreens.length)}
                          aria-label="Previous app screenshot"
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur-md text-black flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAppScreenIndex((prev) => (prev + 1) % appScreens.length)}
                          aria-label="Next app screenshot"
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur-md text-black flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 rounded-full bg-black/30 px-4 py-3 backdrop-blur-md">
                          {appScreens.map((screen, index) => (
                            <button
                              key={screen}
                              type="button"
                              onClick={() => setActiveAppScreenIndex(index)}
                              aria-label={`Show app screenshot ${index + 1}`}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                activeAppScreenIndex === index
                                  ? 'bg-white scale-125'
                                  : 'bg-white/40 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={`pb-24 transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className={`rounded-[40px] overflow-hidden ${isDarkMode ? 'bg-[#111111] border border-white/5' : 'bg-[#F6F7F9] border border-gray-100'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
                      <div className="p-10 md:p-14">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500 mb-3">Catalog Access</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Need the full list by category?</h2>
                        <p className={`text-base md:text-lg leading-8 max-w-2xl mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          The dedicated Products page gives you category filters and a fuller series view. The top navigation Products menu can also jump directly into a category.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            type="button"
                            onClick={() => navigateToProducts()}
                            className="px-8 py-4 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all"
                          >
                            Open Products Page
                          </button>
                          <button
                            type="button"
                            onClick={navigateToContact}
                            className={`px-8 py-4 rounded-full font-bold transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white text-[#1A1A1A] border border-gray-200 hover:bg-gray-50'}`}
                          >
                            Request Product Catalog
                          </button>
                        </div>
                      </div>
                      <div className={`p-10 md:p-14 border-t lg:border-t-0 lg:border-l ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-white/70'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-5">Quick Category Entry</p>
                        <div className="space-y-3">
                          {productCategories.filter((category) => category !== 'All').map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => navigateToProducts(category)}
                              className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 text-left transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50 border border-gray-100'}`}
                            >
                              <div>
                                <p className="text-sm font-semibold">{category}</p>
                                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Browse matching series</p>
                              </div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Core Technologies Bento Grid */}
              <section className={`py-32 transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="mb-20">
                    <h2 className="text-4xl font-bold mb-6 tracking-tight">Core Technologies</h2>
                    <p className={`text-xl transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>The engineering and manufacturing capabilities behind our everyday connected devices.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
                    {/* Main Tech Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`md:col-span-2 md:row-span-2 rounded-[40px] p-12 relative overflow-hidden flex flex-col justify-between ${isDarkMode ? 'bg-[#1A1A1A] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
                    >
                      <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8">
                          <Cpu size={32} className="text-blue-500" />
                        </div>
                        <h3 className="text-4xl font-bold mb-6">Reference Hardware Platforms</h3>
                        <p className={`text-lg max-w-md leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Reusable smartwatch, health, and smart home platforms help shorten sampling, tooling, and pilot production cycles for OEM customers.
                        </p>
                      </div>
                      <div className="absolute right-[-10%] bottom-[-10%] w-[60%] opacity-20">
                        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" alt="IC" className="w-full h-auto rounded-full" />
                      </div>
                    </motion.div>

                    {/* Secondary Tech Card 1 */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-between ${isDarkMode ? 'bg-[#1A1A1A] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                          <Shield size={24} className="text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Factory Quality Workflow</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Incoming inspection, aging, functional test, and outbound QA are built into each production project.
                        </p>
                      </div>
                    </motion.div>

                    {/* Secondary Tech Card 2 */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-between ${isDarkMode ? 'bg-[#1A1A1A] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                          <Zap size={24} className="text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Low-Power Connectivity</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Bluetooth, Wi-Fi, 4G, and Zigbee integration tuned for stable field performance and battery life.
                        </p>
                      </div>
                    </motion.div>

                    {/* Wide Tech Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`md:col-span-3 rounded-[40px] p-10 relative overflow-hidden flex items-center justify-between ${isDarkMode ? 'bg-[#1A1A1A] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
                    >
                      <div className="max-w-xl">
                        <h3 className="text-3xl font-bold mb-4">OEM Firmware and App Customization</h3>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Branding, UI language, data fields, and companion app adaptation for different regions, channels, and customer requirements.
                        </p>
                      </div>
                      <div className="hidden md:flex gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`w-16 h-1 bg-blue-500/20 rounded-full overflow-hidden`}>
                            <motion.div 
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                              className="w-full h-full bg-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Success Stories 3D Carousel */}
              <section className={`py-32 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-24">
                    <h2 className="text-4xl font-bold mb-6">Program Snapshots</h2>
                    <p className={`text-xl transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Representative OEM and ODM projects for consumer electronics and home health channels.</p>
                  </div>
                  
                  <div className="relative h-[600px] flex items-center justify-center" style={{ perspective: '1200px' }}>
                    <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                      {[
                        {
                          title: "Retail Smartwatch Launch",
                          desc: "Delivered a white-label smartwatch program for a regional consumer electronics brand with custom packaging, watch faces, and first-batch production in under 90 days.",
                          user: "Consumer Electronics Brand",
                          role: "Private Label Program",
                          icon: Globe,
                          color: "blue",
                          img: "https://images.unsplash.com/photo-1593121925328-369cc8459c08?auto=format&fit=crop&q=80&w=800"
                        },
                        {
                          title: "Home Health Monitor Refresh",
                          desc: "Updated cuff design, UI language, and Bluetooth workflow for a blood pressure monitor line sold through pharmacy and marketplace channels.",
                          user: "Home Health Client",
                          role: "OEM Upgrade Project",
                          icon: Sparkles,
                          color: "purple",
                          img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
                        },
                        {
                          title: "Smart Home Bundle Program",
                          desc: "Combined environmental sensors and gateway accessories into a bundled SKU for an installer-focused smart home channel.",
                          user: "Smart Home Distributor",
                          role: "Channel Bundle Program",
                          icon: Cpu,
                          color: "orange",
                          img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
                        }
                      ].map((story, i) => {
                        const storiesCount = 3;
                        const offset = (i - activeStoryIndex + storiesCount) % storiesCount;
                        
                        let x = 0;
                        let rotateY = 0;
                        let z = 0;
                        let opacity = 1;
                        let scale = 1;
                        let zIndex = 0;

                        if (offset === 0) {
                          x = 0;
                          rotateY = 0;
                          z = 0;
                          opacity = 1;
                          scale = 1;
                          zIndex = 10;
                        } else if (offset === 1) {
                          x = 350;
                          rotateY = -45;
                          z = -300;
                          opacity = 0.4;
                          scale = 0.8;
                          zIndex = 5;
                        } else {
                          x = -350;
                          rotateY = 45;
                          z = -300;
                          opacity = 0.4;
                          scale = 0.8;
                          zIndex = 5;
                        }

                        return (
                          <motion.div 
                            key={i}
                            animate={{ x, rotateY, z, opacity, scale, zIndex }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className={`absolute w-[350px] md:w-[450px] p-10 rounded-[60px] flex flex-col justify-between h-[500px] overflow-hidden transition-colors shadow-2xl ${isDarkMode ? 'bg-[#1A1A1A] text-white border border-white/5' : 'bg-gray-50 text-black border border-gray-100'}`}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <div className="relative z-10">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${isDarkMode ? 'bg-white/10' : 'bg-white'}`}>
                                <story.icon size={24} className={`text-${story.color}-500`} />
                              </div>
                              <h3 className="text-2xl md:text-3xl font-bold mb-6">{story.title}</h3>
                              <p className={`leading-relaxed mb-8 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {story.desc}
                              </p>
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                <img src={story.img} alt={story.user} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{story.user}</p>
                                <p className="text-xs text-gray-400">{story.role}</p>
                              </div>
                            </div>
                            <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-20 bg-${story.color}-500`} />
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="absolute -bottom-10 flex gap-4 z-20">
                      <button 
                        onClick={() => setActiveStoryIndex((prev) => (prev - 1 + 3) % 3)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setActiveStoryIndex((prev) => (prev + 1) % 3)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Global Network Section */}
              <section className={`py-32 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 ${isDarkMode ? 'bg-white/10 text-blue-400' : 'bg-gray-100 text-blue-500'}`}>
                        <Globe size={12} /> Operations Footprint
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Manufacturing Based in <br /> <span className="text-blue-500">Chongqing, China</span></h2>
                      <p className={`text-lg mb-12 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        APPOCONN positions its manufacturing base in Chongqing, with supporting sourcing, electronics coordination, and export functions linked across Southwest and South China. That structure fits OEM execution better than a showroom-style footprint.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { city: "Chongqing, China", role: "Manufacturing Base & Final Assembly", active: true },
                          { city: "Chengdu, China", role: "Regional Supply & Project Support", active: true },
                          { city: "Shenzhen, China", role: "Electronics Sourcing & NPI Support", active: true },
                          { city: "Hong Kong", role: "Export & Customer Support", active: true }
                        ].map((loc, i) => (
                          <motion.div 
                            key={i} 
                            whileHover={{ x: 10 }}
                            className={`p-6 rounded-3xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-3 h-3 rounded-full ${loc.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                              <h4 className="font-bold">{loc.city}</h4>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">{loc.role}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <div className={`aspect-square rounded-[60px] relative overflow-hidden p-8 md:p-10 ${isDarkMode ? 'bg-[#06080d] border border-white/10' : 'bg-[#f6f8fc] border border-slate-200 shadow-sm'}`}>
                        <div
                          className="absolute inset-0 opacity-70"
                          style={{
                            backgroundImage: isDarkMode
                              ? 'radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(14,165,233,0.14), transparent 32%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
                              : 'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(14,165,233,0.10), transparent 32%), linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
                            backgroundSize: 'auto, auto, 28px 28px, 28px 28px'
                          }}
                        />

                        <div className="relative z-10 flex h-full flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${isDarkMode ? 'text-blue-400/80' : 'text-blue-600/80'}`}>
                                Operations Overview
                              </p>
                              <h3 className="mt-3 text-2xl font-bold">OEM Operations Grid</h3>
                            </div>
                            <div className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] ${isDarkMode ? 'bg-white/6 text-white/70' : 'bg-white text-slate-500 shadow-sm'}`}>
                              4 linked sites
                            </div>
                          </div>

                          <div className={`relative mt-8 flex-1 rounded-[40px] p-6 md:p-8 ${isDarkMode ? 'border border-white/10 bg-black/20' : 'border border-white bg-white/55'}`}>
                            <div className={`absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/8'}`} />
                            <motion.div
                              animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                              className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/30"
                            />
                            <motion.div
                              animate={{ scale: [0.9, 1.16, 0.9], opacity: [0.12, 0.24, 0.12] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20"
                            />

                            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                              {[
                                'M50 50 C40 30, 28 22, 18 18',
                                'M50 50 C62 30, 72 22, 84 18',
                                'M50 50 C62 58, 72 66, 84 78',
                                'M50 50 C40 62, 30 70, 18 82'
                              ].map((d, i) => (
                                <motion.path
                                  key={i}
                                  d={d}
                                  fill="none"
                                  stroke="rgba(59,130,246,0.42)"
                                  strokeWidth="0.5"
                                  strokeDasharray="2 2"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  whileInView={{ pathLength: 1, opacity: 1 }}
                                  transition={{ duration: 1.4, delay: i * 0.12 }}
                                />
                              ))}
                            </svg>

                            {[
                              { city: 'Hong Kong', role: 'Export Support', position: 'left-[10%] top-[14%]', accent: 'bg-cyan-400' },
                              { city: 'Shenzhen', role: 'Electronics', position: 'right-[10%] top-[10%]', accent: 'bg-blue-500' },
                              { city: 'Chongqing', role: 'Manufacturing', position: 'right-[9%] bottom-[12%]', accent: 'bg-emerald-400' },
                              { city: 'Chengdu', role: 'Supply Support', position: 'left-[9%] bottom-[14%]', accent: 'bg-violet-400' }
                            ].map((node, i) => (
                              <motion.div
                                key={node.city}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={`absolute ${node.position} rounded-[28px] px-4 py-3 ${isDarkMode ? 'bg-black/45 border border-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]' : 'bg-white/90 border border-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.10)]'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className={`h-2.5 w-2.5 rounded-full ${node.accent}`} />
                                    <div className={`absolute inset-0 rounded-full ${node.accent} animate-ping opacity-35`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold leading-none">{node.city}</p>
                                    <p className={`mt-1 text-[10px] uppercase tracking-[0.24em] ${isDarkMode ? 'text-white/45' : 'text-slate-400'}`}>{node.role}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}

                            <motion.div
                              initial={{ opacity: 0, scale: 0.94 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className={`absolute left-1/2 top-1/2 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-4 ${isDarkMode ? 'bg-[#0b1220] border border-blue-500/20 text-white' : 'bg-white border border-slate-200 text-slate-900 shadow-lg'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500 text-white">
                                  <Globe size={18} />
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold">APPOCONN Ops</p>
                                  <p className={`text-[10px] uppercase tracking-[0.24em] ${isDarkMode ? 'text-white/45' : 'text-slate-400'}`}>
                                    engineering to shipment
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                                {[
                                  { label: 'Sites', value: '04' },
                                  { label: 'Pilot', value: '30d' },
                                  { label: 'QC', value: '100%' }
                                ].map((stat) => (
                                  <div key={stat.label} className={`rounded-2xl px-1.5 py-2 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                    <p className="text-[12px] font-bold">{stat.value}</p>
                                    <p className={`mt-1 text-[9px] uppercase tracking-[0.22em] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{stat.label}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Compliance Section */}
              <section className={`py-24 border-y ${isDarkMode ? 'bg-black border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Compliance Support</h2>
                    <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      We focus on practical documentation, testing coordination, and factory records that help customers complete their own market-entry process.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 transition-all duration-700">
                    {[
                      { name: "BOM Control", desc: "Material declaration workflow" },
                      { name: "EMC Pre-Check", desc: "Design review and lab prep" },
                      { name: "Battery Docs", desc: "UN38.3 and MSDS coordination" },
                      { name: "QC Records", desc: "Inspection and test reports" },
                      { name: "Label Review", desc: "Carton and marking support" }
                    ].map((item, i) => (
                      <div key={i} className="text-center group">
                        <div className="text-2xl font-black tracking-tighter mb-1 group-hover:text-blue-500 transition-colors">{item.name}</div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-gray-400">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <section className={`pt-24 pb-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="max-w-4xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500 mb-3">Products</p>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">OEM Product Center</h1>
                    <p className={`text-lg md:text-xl leading-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Browse product series by category, then open each series page for representative models, OEM scope, and configuration directions.
                    </p>
                  </div>
                </div>
              </section>
              {renderProductCenter()}
            </motion.div>
          )}

          {currentView === 'pdp' && selectedProduct && (
            <motion.div 
              key="pdp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-6 py-12"
            >
              <button 
                onClick={() => navigateToProducts()}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-12 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Products
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Left: Image Gallery */}
                <div className="space-y-6">
                  <div className="aspect-square bg-gray-100 rounded-[40px] overflow-hidden relative group">
                    <motion.div 
                      whileHover={{ rotateY: 15, rotateX: -10 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="w-full h-full"
                    >
                      <img 
                        src={activeProductImage || selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                    {selectedProductGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => showAdjacentProductImage('prev')}
                          aria-label="Previous product image"
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur-md text-black flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => showAdjacentProductImage('next')}
                          aria-label="Next product image"
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur-md text-black flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {selectedProductGallery.map((image, i) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedProductImage(image)}
                        aria-label={`Show ${selectedProduct.name} image ${i + 1}`}
                        className={`snap-start shrink-0 w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${activeProductImage === image ? 'border-[#1A1A1A] opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img 
                          src={image} 
                          alt={`${selectedProduct.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Configuration */}
                <div className="flex flex-col">
                  <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">
                        Product Center / {selectedProduct.category}
                      </span>
                      {selectedProduct.seriesCode && (
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                          {selectedProduct.seriesCode}
                        </span>
                      )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{selectedProduct.name}</h1>
                    <p className="text-xl text-gray-600 leading-relaxed mb-4">
                      {selectedProduct.description}
                    </p>
                    <p className={`text-sm leading-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedProduct.longDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className={`rounded-[28px] p-6 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Representative Models</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sampleModels?.map((model) => (
                          <span
                            key={model}
                            className={`px-3 py-2 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700 border border-gray-200'}`}
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`rounded-[28px] p-6 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">OEM Scope</p>
                      <div className="space-y-2">
                        {selectedProduct.customizationOptions?.map((item) => (
                          <div key={item} className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10 mb-12">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-2">Configuration Matrix</p>
                      <h2 className="text-2xl font-bold">Selectable modules within this series</h2>
                    </div>
                    {selectedProduct.variants.map((variant) => (
                      <div key={variant.label}>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                          {variant.label}: <span className="text-gray-400 font-medium">{pdpSelections[variant.label]}</span>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {variant.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                const nextSelections = {...pdpSelections, [variant.label]: option.value};
                                setPdpSelections(nextSelections);
                                setSelectedProductImage(getSelectionImage(selectedProduct, nextSelections, option.image));
                              }}
                              className={`
                                px-6 py-3 rounded-2xl border-2 transition-all text-sm font-medium
                                ${pdpSelections[variant.label] === option.value 
                                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'}
                              `}
                            >
                              {option.color && (
                                <span 
                                  className="inline-block w-3 h-3 rounded-full mr-2 border border-white/20" 
                                  style={{ backgroundColor: option.color }} 
                                />
                              )}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                  </div>

                  <div className="mt-auto pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Series Inquiry</p>
                        <p className="text-lg font-semibold">Request OEM proposal for this series</p>
                      </div>
                    </div>
                    <button 
                      onClick={addToCart}
                      className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                    >
                      Add Series to Inquiry <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Series Details / Specs */}
              <div className="mt-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className={`rounded-[28px] p-6 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Series Positioning</p>
                    <p className={`text-sm leading-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      This page describes a reusable OEM platform family with multiple sellable configurations, not a single fixed retail SKU.
                    </p>
                  </div>
                  <div className={`rounded-[28px] p-6 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Sampling Direction</p>
                    <p className={`text-sm leading-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Use the selection buttons above to discuss the nearest cosmetic and functional combination before formal sample confirmation.
                    </p>
                  </div>
                  <div className={`rounded-[28px] p-6 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Commercial Use</p>
                    <p className={`text-sm leading-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Suitable for catalog discussions, distributor programs, and OEM/ODM inquiries where final configuration is confirmed later.
                    </p>
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-8">Series Specifications</h2>
                <div className={`rounded-[32px] overflow-hidden border ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                  <table className="w-full text-sm">
                    <tbody>
                      {selectedProduct.specs.map((spec, i) => (
                        <tr key={i} className={`border-b last:border-0 ${isDarkMode ? 'border-white/5' : 'border-gray-50'}`}>
                          <td className={`p-4 font-bold uppercase tracking-widest text-[10px] w-1/3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{spec.label}</td>
                          <td className="p-4 font-medium">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-24">
                <div className="flex items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-500 mb-2">More Product Series</p>
                    <h2 className="text-3xl font-bold">Explore 5 more OEM series</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToProducts()}
                    className={`hidden md:inline-flex px-5 py-3 rounded-full text-sm font-bold transition-all ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#1A1A1A] text-white hover:bg-gray-800'}`}
                  >
                    View All Products
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {relatedProductSeries.map((product) => (
                    <motion.article
                      key={product.id}
                      whileHover={{ y: -6 }}
                      className={`group rounded-[32px] overflow-hidden cursor-pointer transition-colors ${isDarkMode ? 'bg-[#141414] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}
                      onClick={() => navigateToPdp(product)}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={product.gallery?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-2">{product.category}</p>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{product.name}</h3>
                        <p className={`text-sm leading-7 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {product.sampleModels?.slice(0, 1).map((model) => (
                              <span
                                key={model}
                                className={`px-3 py-2 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                              >
                                {model}
                              </span>
                            ))}
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 group-hover:bg-blue-500 group-hover:text-white' : 'bg-gray-100 group-hover:bg-blue-500 group-hover:text-white'}`}>
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'cart' && (
            <motion.div 
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-6 py-12"
            >
              <h1 className="text-4xl font-bold mb-12">Inquiry Summary</h1>

              {cart.length === 0 ? (
                <div className={`text-center py-24 rounded-[40px] border border-dashed ${isDarkMode ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
                  <ShoppingCart size={48} className={`mx-auto mb-6 ${isDarkMode ? 'text-white/30' : 'text-gray-300'}`} />
                  <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your inquiry list is empty.</p>
                  <button 
                    onClick={() => navigateToProducts()}
                    className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-medium"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                  <div className="space-y-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className={`p-6 rounded-3xl flex gap-6 items-center border ${isDarkMode ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-2xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{item.product.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            {Object.entries(item.selections).map(([key, val]) => (
                              <span key={key} className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="font-medium">{key}:</span> {val}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <Building2 size={24} /> Company Information
                    </h2>
                    <form onSubmit={submitInquiry} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Contact Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              required
                              name="contactName"
                              type="text" 
                              placeholder="John Doe"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Company Name</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              required
                              name="companyName"
                              type="text" 
                              placeholder="Acme Corp"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Work Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              required
                              name="workEmail"
                              type="email" 
                              placeholder="john@company.com"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              required
                              name="phoneNumber"
                              type="tel" 
                              placeholder="+1 (555) 000-0000"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Inquiry Details</label>
                        <textarea 
                          name="inquiryDetails"
                          rows={4}
                          placeholder="Tell us about your project requirements or estimated order volume..."
                          className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all resize-none"
                        />
                      </div>
                      {inquiryError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {inquiryError}
                        </div>
                      )}
                      <button 
                        type="submit"
                        disabled={isSubmittingInquiry}
                        className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmittingInquiry ? 'Submitting...' : 'Submit Inquiry'} <Send size={20} />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto px-6 py-32 text-center"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-4xl font-bold mb-4">Inquiry Received</h1>
              <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                Thank you for your interest in APPOCONN. Our B2B sales team will review your inquiry and contact you within 24 hours.
              </p>
              <button 
                onClick={navigateToHome}
                className="px-10 py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all"
              >
                Back to Home
              </button>
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full bg-white dark:bg-black text-black dark:text-white selection:bg-blue-500 selection:text-white transition-colors duration-500"
            >
              {/* Section 1: Hero - Immersive & Bold */}
              <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                  <img 
                    src="https://images.unsplash.com/photo-1550741111-c80717d56a6d?auto=format&fit=crop&q=80&w=2000" 
                    alt="Innovation Hero"
                    className="w-full h-full object-cover opacity-60 dark:opacity-40 bg-gray-900"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-black/60 dark:via-transparent dark:to-black" />
                </div>
                <div className="relative z-10 text-center px-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none mb-6 uppercase italic"
                  >
                    SENSE <br />
                    <span className="text-blue-600 dark:text-blue-500">TO EMPOWER.</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl md:text-2xl font-medium tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400"
                  >
                    OEM / ODM FOR EVERYDAY IOT
                  </motion.p>
                </div>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2"
                >
                  <ChevronRight size={32} className="rotate-90 text-blue-600 dark:text-blue-500" />
                </motion.div>
              </section>

              {/* Section 2: Mission - Large Impact Typography */}
              <section className="py-60 px-6 max-w-7xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <h2 className="text-4xl md:text-8xl font-black tracking-tighter mb-16 leading-tight uppercase italic">
                    WE BUILD DEVICES <br />
                    <span className="text-gray-300 dark:text-gray-700">BRANDS CAN SHIP.</span>
                  </h2>
                  <div className="w-32 h-1.5 bg-blue-600 mx-auto mb-16" />
                  <p className="text-xl md:text-4xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-5xl mx-auto font-light tracking-tight">
                    At APPOCONN, we focus on turning proven component choices into market-ready devices for consumer brands and channel sellers. We prioritize DFM, stable supply, and repeatable production over inflated technology claims.
                  </p>
                </motion.div>
              </section>

              {/* Section 3: Innovation - PPG Technology */}
              <section className="relative py-60 overflow-hidden bg-gray-50 dark:bg-[#050505] transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                  <div className="order-2 lg:order-1">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <h3 className="text-blue-600 dark:text-blue-500 font-mono text-sm tracking-[0.5em] uppercase mb-6">Engineering Focus</h3>
                      <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic mb-10 leading-none">
                        STABLE SENSOR <br />INTEGRATION.
                      </h2>
                      <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-16 max-w-xl">
                        We combine off-the-shelf chipsets, validated sensor stacks, and practical firmware tuning to build products that are easier to sample, certify, and scale.
                      </p>
                      <div className="grid grid-cols-2 gap-16">
                        <div>
                          <div className="text-5xl font-black mb-3 italic">30-45d</div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold">Pilot Lead Time</p>
                        </div>
                        <div>
                          <div className="text-5xl font-black mb-3 italic">100%</div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold">Functional Test</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <div className="order-1 lg:order-2 relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1.2 }}
                      className="aspect-square rounded-full bg-blue-600/5 dark:bg-blue-600/10 absolute inset-0 blur-[120px]"
                    />
                    <div className="relative z-10 rounded-[60px] overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl bg-gray-100 dark:bg-gray-900">
                      <img 
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000" 
                        alt="Sensor Tech"
                        className="w-full grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Design - Titanium Craft */}
              <section className="bg-white dark:bg-black py-60 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="rounded-[60px] overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl aspect-[4/3] bg-gray-200 dark:bg-gray-800 relative flex items-center justify-center"
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-gray-400 font-mono text-xs uppercase tracking-widest">Loading...</span>
                      <img 
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000" 
                        alt="Titanium Smart Ring"
                        className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000 relative z-10"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <h3 className="text-blue-600 dark:text-blue-500 font-mono text-sm tracking-[0.5em] uppercase mb-6">Manufacturing</h3>
                      <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic mb-10 leading-none">
                        BUILT FOR <br />DAILY USE.
                      </h2>
                      <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-16 max-w-xl">
                        Our projects focus on housings, cuffs, straps, packaging, and assembly details that matter in real retail environments. The goal is a device customers can use every day and a production process clients can repeat every quarter.
                      </p>
                      <ul className="space-y-8">
                        {['PRIVATE LABEL PACKAGING', 'FUNCTIONAL TEST STATIONS', 'AQL OUTGOING INSPECTION'].map((item, i) => (
                          <li key={i} className="flex items-center gap-6 text-sm font-black tracking-[0.3em] group">
                            <div className="w-3 h-3 bg-blue-600 group-hover:scale-150 transition-transform" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Section 5: Global Presence */}
              <section className="py-60 px-6 text-center border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#050505] transition-colors duration-500">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase italic mb-20 leading-none">
                    CHONGQING <br />MANUFACTURING.
                  </h2>
                  <p className="text-xl md:text-3xl text-gray-500 dark:text-gray-500 max-w-4xl mx-auto mb-32 font-light">
                    The manufacturing base is in Chongqing, while sourcing, electronics support, and export coordination stay linked across Chengdu, Shenzhen, and Hong Kong to keep OEM execution practical.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                    {['CHONGQING', 'SHENZHEN', 'HONG KONG'].map((city, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="text-blue-600 dark:text-blue-500 font-mono text-sm mb-4 tracking-widest">0{i+1}</div>
                        <div className="text-3xl font-black tracking-[0.2em] group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors uppercase italic">{city}</div>
                        <div className="w-0 group-hover:w-full h-1 bg-blue-600 dark:bg-blue-500 mx-auto mt-8 transition-all duration-700 ease-in-out" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Section 6: Call to Action */}
              <section className="py-60 bg-blue-600 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-500" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10"
                >
                  <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase italic mb-20 text-white leading-none">
                    START YOUR <br />NEXT PROGRAM.
                  </h2>
                  <button 
                    onClick={navigateToContact}
                    className="px-16 py-8 bg-white text-blue-600 rounded-full font-black text-2xl uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95"
                  >
                    Request OEM Quote
                  </button>
                </motion.div>
              </section>
            </motion.div>
          )}

          {currentView === 'contact' && (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-6 py-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                <div>
                  <h1 className="text-6xl font-bold mb-8">Let's build your next product line.</h1>
                  <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                    Whether you need OEM development, private label packaging, or mass production support, our team is ready to assist.
                  </p>

                  <div className="space-y-8">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Mail className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Email Us</h4>
                        <p className="text-gray-500">Bob@appcoin.it.com</p>
                        <p className="text-gray-500">Bob@appcoin.it.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Building2 className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Visit Us</h4>
                        <p className="text-gray-500">RM 19C LOCKHART CENTRE</p>
                        <p className="text-gray-500">301-307 LOCKHART RD, WAN CHAI, HK</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl">
                  <h2 className="text-2xl font-bold mb-8">Send a Message</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">First Name</label>
                        <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                        <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
                      <input type="email" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Message</label>
                      <textarea rows={5} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black resize-none" />
                    </div>
                    <button className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!isAdminView && (
        <footer className={`transition-colors duration-500 border-t ${isDarkMode ? 'bg-[#0A0A0A] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'} py-24 mt-32`}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold tracking-tighter mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white' : 'bg-[#1A1A1A]'}`}>
                  <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`} />
                </div>
                APPOCONN
              </div>
              <p className={`max-w-sm leading-relaxed transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                RM 19C LOCKHART CENTRE 301-307 LOCKHART RD WAN CHAI HONG KONG
                <br /><br />
                OEM / ODM manufacturing partner for smart watches, blood pressure monitors, smart scales, kids watches, and home sensors.
              </p>
            </div>
            <div className="hidden md:flex flex-col gap-4">
              <h4 className="font-bold mb-2 uppercase tracking-widest text-xs text-gray-400">Links</h4>
              <button onClick={navigateToHome} className={`text-left transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Home</button>
              <button onClick={() => navigateToProducts()} className={`text-left transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Products</button>
              <button onClick={navigateToAbout} className={`text-left transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>About Us</button>
              <button onClick={navigateToContact} className={`text-left transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Contact</button>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Contact</h4>
              <div className={`space-y-4 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="flex items-center gap-2"><Mail size={16} /> Bob@appcoin.it.com</p>
              </div>
            </div>
          </div>
          <div className={`max-w-7xl mx-auto px-6 mt-24 pt-8 border-t text-sm transition-colors ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-gray-50 text-gray-400'}`}>
            © 2025 APPOCONN LIMITED. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}
