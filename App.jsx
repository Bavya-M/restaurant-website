import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Specialties from './components/Specialties';
import MenuSection from './components/MenuSection';
import AboutSection from './components/AboutSection';
import ReservationSection from './components/ReservationSection';
import TestimonialsSection from './components/TestimonialsSection';
import LocationHoursSection from './components/LocationHoursSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';
import { MENU_ITEMS } from './data/menuData';
import { ArrowUp } from 'lucide-react';
import './App.css';

export default function App() {
  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('laura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [toasts, setToasts] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('laura_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Track scroll position for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toast System
  const addToast = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Operations
  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    addToast({
      type: 'success',
      title: 'Added to Order',
      message: `${item.name} has been added to your cart.`,
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const handleRemoveItem = (itemId) => {
    const removedItem = cartItems.find((i) => i.id === itemId);
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));

    if (removedItem) {
      addToast({
        type: 'info',
        title: 'Item Removed',
        message: `${removedItem.name} removed from your cart.`,
      });
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
  };

  // Reservation smooth scroll and pulse
  const handleOpenReservation = () => {
    const el = document.getElementById('reservations');
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Highlight reservation card briefly
      const card = el.querySelector('.reservation-card-wrapper');
      if (card) {
        card.classList.add('pulse-highlight');
        setTimeout(() => card.classList.remove('pulse-highlight'), 1800);
      }
    }
  };

  // Proceed from Cart Drawer to Checkout Modal
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Sticky Header Navbar */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={handleOpenReservation}
      />

      <main id="main-content">
        {/* 1. Hero Landing Section */}
        <Hero
          onOpenMenu={() => {
            const el = document.getElementById('menu');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenReservation={handleOpenReservation}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* 2. Chef's Signature Specialties */}
        <Specialties
          items={MENU_ITEMS}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />

        {/* 3. Comprehensive Food Menu Section */}
        <MenuSection
          items={MENU_ITEMS}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          cartItems={cartItems}
        />

        {/* 4. About Restaurant Section */}
        <AboutSection />

        {/* 5. Table Reservations Section */}
        <ReservationSection onAddToast={addToast} />

        {/* 6. Guest Reviews & Press Testimonials */}
        <TestimonialsSection />

        {/* 7. Opening Hours, Contact & Interactive Location Map */}
        <LocationHoursSection onOpenReservation={handleOpenReservation} />
      </main>

      {/* Footer */}
      <Footer
        onOpenReservation={handleOpenReservation}
        onAddToast={addToast}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        orderType={orderType}
        setOrderType={setOrderType}
        appliedPromo={appliedPromo}
        setAppliedPromo={setAppliedPromo}
        tipPercent={tipPercent}
        setTipPercent={setTipPercent}
        customTip={customTip}
        setCustomTip={setCustomTip}
        onAddToast={addToast}
      />

      {/* Online Ordering Checkout & Confirmation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        orderType={orderType}
        appliedPromo={appliedPromo}
        tipPercent={tipPercent}
        customTip={customTip}
        onClearCart={handleClearCart}
        onAddToast={addToast}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          className="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll back to top of page"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
