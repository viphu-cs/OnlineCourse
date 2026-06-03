import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, ShoppingBag, ArrowLeft, ArrowRight, Lock, 
  ShieldCheck, Sparkles, Tag, Check, X
} from 'lucide-react';

export default function Cart({ cartItems, removeFromCart, setCurrentPage, setSelectedCourseId }) {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Compute pricing
  const subtotal = cartItems.reduce((acc, item) => acc + (item.priceVal || 0), 0);

  // Coupon handling
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const code = couponInput.toUpperCase().trim();
    if (code === 'WELCOME10') {
      setAppliedCoupon(code);
      setCouponDiscount(10.00);
      setCouponError('');
    } else if (code === 'ELEVATE20') {
      setAppliedCoupon(code);
      setCouponDiscount(subtotal * 0.20);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
    setCouponInput('');
  };

  const discountVal = appliedCoupon === 'ELEVATE20' ? subtotal * 0.20 : couponDiscount;
  const total = Math.max(0, subtotal - discountVal);

  const handleCheckout = () => {
    // Save coupon to localStorage if applied, so Checkout.jsx can read it
    if (appliedCoupon) {
      localStorage.setItem('skillelevate_applied_coupon', JSON.stringify({
        code: appliedCoupon,
        discount: discountVal
      }));
    } else {
      localStorage.removeItem('skillelevate_applied_coupon');
    }
    
    // Switch to checkout state
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectItem = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentPage('course-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1c30] text-[#0b1c30] dark:text-[#f8f9ff] pt-28 pb-16 px-4 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
      
      {/* Navigation Breadcrumb */}
      <div className="mb-2 select-none flex items-center">
        <button 
          onClick={() => setCurrentPage('marketplace')}
          className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to marketplace</span>
        </button>
      </div>

      <header className="flex flex-col gap-1 select-none">
        <h1 className="font-display font-bold text-2xl md:text-4xl text-on-surface dark:text-white tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant dark:text-slate-400 font-medium">
          Confirm details and review course parameters before proceeding to secure checkout.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {cartItems.length === 0 ? (
          
          /* EMPTY CART VIEW */
          <motion.section 
            key="empty-cart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-12 text-center level-2-shadow max-w-2xl mx-auto w-full flex flex-col items-center gap-6 select-none mt-4"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary dark:bg-primary-fixed-dim/10 dark:text-primary-fixed-dim flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-on-surface dark:text-white font-display">Your cart is empty</h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 max-w-2xl">
                Explore our catalog of premium courses curated by top tech leaders and accelerate your future career path.
              </p>
            </div>
            <button 
              onClick={() => setCurrentPage('marketplace')}
              className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer text-xs md:text-sm flex items-center gap-1.5 border-t border-white/25 mt-2"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.section>

        ) : (

          /* CART LAYOUT GRID */
          <motion.div 
            key="cart-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-8 items-start mt-2"
          >
            
            {/* Left Column (Cart Items) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <AnimatePresence>
                {cartItems.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, height: 0, padding: 0, marginBottom: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-center level-2-shadow group"
                  >
                    <div 
                      onClick={() => handleSelectItem(course.id)}
                      className={`w-20 h-16 rounded-xl bg-gradient-to-br ${course.gradient} shrink-0 cursor-pointer`}
                    />
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start select-none">
                        <span className="text-[9px] font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider">{course.category}</span>
                      </div>
                      <h4 
                        onClick={() => handleSelectItem(course.id)}
                        className="font-display font-bold text-sm md:text-base text-on-surface dark:text-white truncate cursor-pointer hover:text-primary transition-colors"
                      >
                        {course.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">
                        By {course.author} • {course.duration}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 select-none">
                      <span className="font-mono font-bold text-sm md:text-base text-on-surface dark:text-white shrink-0">
                        {course.price === 'Free' ? '$0.00' : course.price}
                      </span>
                      <button 
                        onClick={() => removeFromCart(course.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer shrink-0 transition-colors"
                        title="Remove Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right Column (Checkout Summary Card) */}
            <div className="lg:col-span-5 flex flex-col gap-6 select-none lg:sticky lg:top-28">
              
              <div className="bg-white dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-5 md:p-6 level-2-shadow flex flex-col gap-5">
                <h3 className="font-display font-bold text-base md:text-lg text-on-surface dark:text-white border-b border-[#c7c4d8]/20 dark:border-white/5 pb-3.5">
                  Order Summary
                </h3>

                {/* Pricing values */}
                <div className="space-y-3.5 text-xs md:text-sm font-semibold text-on-surface-variant dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Subtotal</span>
                    <span className="font-mono text-on-surface dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountVal > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Discount Coupon ({appliedCoupon})</span>
                      </span>
                      <span className="font-mono font-bold">-${discountVal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">VAT (incl. 7%)</span>
                    <span className="font-mono text-on-surface dark:text-white">$0.00</span>
                  </div>

                  <div className="h-px bg-[#c7c4d8]/20 dark:bg-white/5 w-full" />
                  <div className="flex justify-between text-sm md:text-base text-on-surface dark:text-white font-bold">
                    <span>Total Price</span>
                    <span className="font-mono text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-2">
                  <div className="flex-grow relative">
                    <input 
                      type="text"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/30 dark:border-white/5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 uppercase font-mono transition-all disabled:opacity-50"
                    />
                    {couponError && (
                      <p className="absolute left-1 top-full mt-0.5 text-[9px] text-red-500 font-bold">{couponError}</p>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 dark:text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-bold text-xs cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:opacity-90 font-bold text-xs transition-opacity cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {appliedCoupon && (
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-[-6px]">
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    <span>Coupon '{appliedCoupon}' successfully applied!</span>
                  </p>
                )}

                {/* Proceed button */}
                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-t border-white/20 text-xs md:text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Secure Checkout</span>
                </button>
              </div>

              {/* Secure Trust Badges */}
              <div className="text-[10px] md:text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>256-bit Secure SSL checkout • PCI-DSS Compliant</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
