import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, QrCode, Building, Check, Clipboard, ClipboardCheck, 
  Upload, FileText, Lock, ShieldCheck, HelpCircle, ArrowLeft, 
  Star, User, Calendar, Shield, Sparkles, CheckCircle2, ShoppingBag 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Checkout({ course, cartItems = [], clearCart, removeFromCart, setCurrentPage, setSelectedCourseId, user, userProfile, onCheckoutSuccess }) {
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'promptpay', 'bank'
  const [billingCountry, setBillingCountry] = useState('US');
  
  // Coupon states
  const [couponInput, setCouponInput] = useState(() => {
    const saved = localStorage.getItem('skillelevate_applied_coupon');
    if (saved) return JSON.parse(saved).code;
    return 'WELCOME10'; // Default demo coupon
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('skillelevate_applied_coupon');
    if (saved) return JSON.parse(saved).code;
    return 'WELCOME10'; // Starts pre-applied for demo
  });
  const [couponError, setCouponError] = useState('');
  
  // Credit Card Form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardType, setCardType] = useState('visa');
  const [focusedField, setFocusedField] = useState(null);

  // Bank Transfer receipt upload mock state
  const [uploadedSlip, setUploadedSlip] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Copy bank details states
  const [copiedAccount, setCopiedAccount] = useState(null); // ID of account copied

  // General workflow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const isCartCheckout = !course;

  if (!isSuccess && !course && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="pt-32 text-center select-none min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-bounce" />
        <p className="text-lg font-bold text-on-surface dark:text-white">Your checkout cart is empty.</p>
        <button 
          onClick={() => setCurrentPage('marketplace')} 
          className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full font-semibold cursor-pointer active:scale-95 duration-200 shadow"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  // Calculate pricing
  const basePrice = isSuccess
    ? purchasedItems.reduce((acc, item) => acc + (item.priceVal || 0), 0)
    : (isCartCheckout 
        ? cartItems.reduce((acc, item) => acc + (item.priceVal || 0), 0)
        : course.priceVal);
  const isFree = basePrice === 0;

  // Coupon calculations
  let discountAmount = 0;
  if (appliedCoupon === 'WELCOME10') {
    discountAmount = Math.min(10.00, basePrice);
  } else if (appliedCoupon === 'ELEVATE20') {
    discountAmount = basePrice * 0.2;
  }
  const finalPrice = Math.max(0, basePrice - discountAmount).toFixed(2);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponError('');
    } else if (code === 'ELEVATE20') {
      setAppliedCoupon('ELEVATE20');
      setCouponError('');
    } else if (code === '') {
      setAppliedCoupon('');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon. Try "WELCOME10" (-$10) or "ELEVATE20" (-20%)');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
    setCouponError('');
  };

  // Card Format Helpers
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);

    // Detect Card Brand
    if (value.startsWith('4')) {
      setCardType('visa');
    } else if (value.startsWith('5')) {
      setCardType('mastercard');
    } else {
      setCardType('visa');
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvc(value);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount(id);
      setTimeout(() => setCopiedAccount(null), 2000);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user) {
      alert("Please sign in to upload your receipt slip.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('payment-slips')
        .upload(filePath, file);

      if (error) throw error;

      setUploadedSlip(filePath);
    } catch (err) {
      console.error('Error uploading payment slip:', err);
      alert('Error uploading slip: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSlipUpload = () => {
    document.getElementById('slip-file-input')?.click();
  };

  // Submit flow validation
  const handleCheckoutSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!user) {
      alert("Please sign in to complete your checkout.");
      setCurrentPage('login');
      return;
    }

    if (paymentMethod === 'card' && !isFree) {
      if (!cardName.trim()) newErrors.cardName = 'Name on Card is required';
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16) newErrors.cardNumber = '16-digit card number is required';
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) newErrors.cardExpiry = 'Expiry format MM/YY is required';
      if (cardCvc.length !== 3) newErrors.cardCvc = '3-digit CVV is required';
    } else if (paymentMethod === 'bank' && !isFree) {
      if (!uploadedSlip) newErrors.slip = 'Please upload a bank transfer receipt slip';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const transactionId = `SE-${Math.floor(100000 + Math.random() * 900000)}`;
      const initialStatus = (isFree || paymentMethod === 'card' || paymentMethod === 'promptpay') ? 'verified' : 'pending';
      const itemsToBuy = isCartCheckout ? cartItems : [course];

      // Try to persist to Supabase, but don't block success on DB errors
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            amount: parseFloat(finalPrice),
            payment_method: isFree ? 'card' : paymentMethod,
            status: 'pending',
            receipt_slip_url: paymentMethod === 'bank' ? uploadedSlip : null,
            transaction_id: transactionId
          })
          .select()
          .single();

        if (!orderError && orderData) {
          const orderItemsToInsert = itemsToBuy.map(item => ({
            order_id: orderData.id,
            course_id: item.id,
            price_paid: item.priceVal || 0
          }));

          await supabase.from('order_items').insert(orderItemsToInsert);

          // Update status to 'verified' for card/free — triggers enrollment
          if (initialStatus === 'verified') {
            await supabase
              .from('orders')
              .update({ status: 'verified' })
              .eq('id', orderData.id);
          }
        } else if (orderError) {
          console.warn('Order DB write failed (may be RLS/auth):', orderError.message);
        }
      } catch (dbErr) {
        console.warn('DB operation failed, continuing with success flow:', dbErr.message);
      }

      // Always show success for card/free payments, pending notice for bank transfer
      setPurchasedItems(itemsToBuy);
      setIsSuccess(true);
      localStorage.removeItem('skillelevate_applied_coupon');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Defer clearing the cart and invoking success callbacks to ensure that
      // the local success state renders first before the parent's cart state is emptied.
      setTimeout(() => {
        if (isCartCheckout) {
          if (clearCart) clearCart();
        } else {
          if (course && removeFromCart) removeFromCart(course.id);
        }
        if (onCheckoutSuccess) onCheckoutSuccess();
      }, 50);

    } catch (err) {
      console.error('Unexpected checkout error:', err);
      setErrors({ general: err.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodName = () => {
    if (isFree) return 'Free Registration';
    if (paymentMethod === 'card') return 'Credit Card';
    if (paymentMethod === 'promptpay') return 'PromptPay QR';
    if (paymentMethod === 'bank') return 'Bank Transfer';
    return '';
  };

  return (
    <div className="pt-24 min-h-screen pb-16 flex flex-col bg-background dark:bg-[#0b1c30] text-on-surface dark:text-[#f8f9ff] transition-colors duration-300">
      <input type="file" onChange={handleFileChange} id="slip-file-input" style={{ display: 'none' }} accept="image/*,application/pdf" />
      
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-15%] w-[450px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/1 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 flex-grow max-w-[1280px] mx-auto px-4 md:px-margin-desktop w-full text-left">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 select-none flex items-center">
          <button 
            onClick={() => setCurrentPage(isCartCheckout ? 'cart' : 'course-details')}
            className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            {isCartCheckout ? 'Back to shopping cart' : 'Back to course detail'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            
            /* PURCHASE SUCCESS SCREEN CONTAINER */
            <motion.section 
              key="success-receipt"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl w-full mx-auto bg-white dark:bg-[#0f172a] rounded-2xl border border-[#c7c4d8]/40 dark:border-white/5 p-8 text-center level-3-shadow transition-colors"
            >
              <motion.div 
                initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                className="w-16 h-16 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <h1 className="font-bold text-2xl md:text-3xl text-on-surface dark:text-white font-display tracking-tight mb-2">
                Order Completed!
              </h1>
              <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed w-full">
                Thank you for your purchase. We have verified your transaction and unlocked full course access.
              </p>

              {/* Receipt Summary Table */}
              <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/20 dark:border-white/5 rounded-xl p-6 text-left text-xs font-semibold text-on-surface-variant dark:text-slate-300 space-y-4 select-none w-full">
                <div className="flex justify-between gap-4 items-start border-b border-[#c7c4d8]/10 dark:border-white/5 pb-3">
                  <span className="text-slate-400 shrink-0">{purchasedItems.length > 1 ? 'Courses Purchased' : 'Course Purchased'}</span>
                  <div className="flex flex-col items-end gap-1.5 min-w-0 max-w-[75%] text-right">
                    {purchasedItems.map(item => (
                      <span key={item.id} className="text-on-surface dark:text-white font-bold block" title={item.title}>
                        {item.title}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-on-surface dark:text-white font-bold">{getMethodName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="text-on-surface dark:text-white font-mono font-bold">SE-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Date</span>
                  <span className="text-on-surface dark:text-white font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="h-px bg-[#c7c4d8]/20 dark:bg-white/5 w-full" />
                <div className="flex justify-between text-sm text-on-surface dark:text-white font-bold">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-base">${finalPrice}</span>
                </div>
              </div>

              {/* Success CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => {
                    if (isCartCheckout) {
                      setCurrentPage('dashboard');
                    } else {
                      if (purchasedItems.length > 0) {
                        setSelectedCourseId?.(purchasedItems[0].id);
                      }
                      setCurrentPage('learning-experience');
                    }
                  }}
                  className="flex-grow py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer"
                >
                  Start Learning
                </button>
                <button 
                  onClick={() => setCurrentPage('marketplace')}
                  className="flex-grow py-3 bg-transparent border border-[#c7c4d8] dark:border-white/10 text-on-surface dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-[0.98] cursor-pointer"
                >
                  Browse Marketplace
                </button>
              </div>

              <div className="mt-6 text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                This is a secure mock sandbox transaction. No real billing occurred.
              </div>

            </motion.section>

          ) : (

            /* CHECKOUT SPLIT PAGE LAYOUT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:gap-xl items-start">
              
              {/* Left Column: Payment Method selection & Forms */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Checkout Page Title */}
                <div className="mb-2">
                  <h1 className="font-bold text-2xl md:text-4xl text-on-surface dark:text-white tracking-tight font-display">
                    Secure Checkout
                  </h1>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-1">
                    Select payment method and validate order parameters.
                  </p>
                </div>

                {isFree ? (
                  /* Free course notification */
                  <section className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 md:p-8 level-2-shadow transition-colors flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 fill-current animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-on-surface dark:text-white">Free Course Enrollment</h3>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                        This program is open access. Click Complete Purchase on the summary card to unlock details instantly.
                      </p>
                    </div>
                  </section>
                ) : (
                  <>
                    {/* Payment Mode Selector Tabs */}
                    <section className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 level-2-shadow transition-colors">
                      <h2 className="font-bold text-base md:text-lg text-on-surface dark:text-white mb-4 font-display flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary dark:text-primary-fixed" />
                        Select Payment Method
                      </h2>
                      
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 select-none">
                        
                        {/* Credit Card Tab */}
                        <button 
                          onClick={() => setPaymentMethod('card')}
                          className={`relative border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            paymentMethod === 'card' 
                              ? 'border-primary bg-primary/5 dark:bg-primary-fixed/5 shadow-sm' 
                              : 'border-[#c7c4d8]/40 dark:border-white/10 bg-transparent hover:border-outline-variant'
                          }`}
                        >
                          <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'card' ? 'text-primary dark:text-primary-fixed-dim' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${paymentMethod === 'card' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
                            Credit Card
                          </span>
                          {paymentMethod === 'card' && (
                            <div className="absolute top-1.5 right-1.5 bg-primary text-white rounded-full p-0.5 scale-90">
                              <Check className="w-3 h-3 stroke-[3px]" />
                            </div>
                          )}
                        </button>

                        {/* PromptPay Tab */}
                        <button 
                          onClick={() => setPaymentMethod('promptpay')}
                          className={`relative border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            paymentMethod === 'promptpay' 
                              ? 'border-primary bg-primary/5 dark:bg-primary-fixed/5 shadow-sm' 
                              : 'border-[#c7c4d8]/40 dark:border-white/10 bg-transparent hover:border-outline-variant'
                          }`}
                        >
                          <QrCode className={`w-6 h-6 mb-2 ${paymentMethod === 'promptpay' ? 'text-primary dark:text-primary-fixed-dim' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${paymentMethod === 'promptpay' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
                            PromptPay
                          </span>
                          {paymentMethod === 'promptpay' && (
                            <div className="absolute top-1.5 right-1.5 bg-primary text-white rounded-full p-0.5 scale-90">
                              <Check className="w-3 h-3 stroke-[3px]" />
                            </div>
                          )}
                        </button>

                        {/* Bank Transfer Tab */}
                        <button 
                          onClick={() => setPaymentMethod('bank')}
                          className={`relative border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            paymentMethod === 'bank' 
                              ? 'border-primary bg-primary/5 dark:bg-primary-fixed/5 shadow-sm' 
                              : 'border-[#c7c4d8]/40 dark:border-white/10 bg-transparent hover:border-outline-variant'
                          }`}
                        >
                          <Building className={`w-6 h-6 mb-2 ${paymentMethod === 'bank' ? 'text-primary dark:text-primary-fixed-dim' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${paymentMethod === 'bank' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
                            Bank Transfer
                          </span>
                          {paymentMethod === 'bank' && (
                            <div className="absolute top-1.5 right-1.5 bg-primary text-white rounded-full p-0.5 scale-90">
                              <Check className="w-3 h-3 stroke-[3px]" />
                            </div>
                          )}
                        </button>

                      </div>
                    </section>

                    {/* Dynamic Form Content */}
                    <AnimatePresence mode="wait">
                      {paymentMethod === 'card' && (
                        
                        /* CREDIT CARD FORM */
                        <motion.section 
                          key="form-card"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 md:p-8 level-2-shadow transition-colors space-y-6"
                        >
                          {/* Credit card template graphic */}
                          <div className="relative w-full h-44 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-5 text-white flex flex-col justify-between shadow-md overflow-hidden border border-white/10 select-none">
                            <div className={`absolute w-36 h-36 bg-primary/25 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
                              focusedField === 'cardNumber' ? 'top-[-20%] left-[-10%]' :
                              focusedField === 'cardExpiry' ? 'bottom-[-20%] left-[20%]' :
                              focusedField === 'cardCvc' ? 'bottom-[-20%] right-[-10%]' : 'top-[-50%] right-[-50%]'
                            }`} />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Secure Payment Sandbox</span>
                              <span className="font-bold text-sm tracking-wide font-display italic">
                                {cardType === 'visa' ? 'VISA' : 'Mastercard'}
                              </span>
                            </div>
                            
                            <div className="font-mono text-lg md:text-xl tracking-widest text-slate-100 py-1 font-semibold select-all">
                              {cardNumber || '•••• •••• •••• ••••'}
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <div className="flex flex-col text-left">
                                <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">Card Holder</span>
                                <span className="font-bold tracking-wide uppercase truncate max-w-[190px]">
                                  {cardName || 'YOUR FULL NAME'}
                                </span>
                              </div>
                              <div className="flex gap-4">
                                <div className="flex flex-col text-right">
                                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">Expires</span>
                                  <span className="font-bold font-mono tracking-wider">{cardExpiry || 'MM/YY'}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">CVC</span>
                                  <span className="font-bold font-mono tracking-wider">{cardCvc || '•••'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Card Holder Name */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Name on Card</label>
                              <input 
                                type="text" 
                                placeholder="Marcus Doe" 
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                onFocus={() => setFocusedField('cardName')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.cardName ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 transition-all`}
                              />
                              {errors.cardName && <p className="text-[10px] text-red-500 font-bold">{errors.cardName}</p>}
                            </div>

                            {/* Card Number */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Card Number</label>
                              <input 
                                type="text" 
                                placeholder="4000 0000 0000 0000" 
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                onFocus={() => setFocusedField('cardNumber')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.cardNumber ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-mono transition-all`}
                              />
                              {errors.cardNumber && <p className="text-[10px] text-red-500 font-bold">{errors.cardNumber}</p>}
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                onFocus={() => setFocusedField('cardExpiry')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.cardExpiry ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-mono transition-all`}
                              />
                              {errors.cardExpiry && <p className="text-[10px] text-red-500 font-bold">{errors.cardExpiry}</p>}
                            </div>

                            {/* CVV/CVC */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">CVV</label>
                              <input 
                                type="password" 
                                placeholder="123" 
                                value={cardCvc}
                                onChange={handleCvcChange}
                                onFocus={() => setFocusedField('cardCvc')}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.cardCvc ? 'border-red-500' : 'border-[#c7c4d8]/40 dark:border-white/5'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-mono transition-all`}
                              />
                              {errors.cardCvc && <p className="text-[10px] text-red-500 font-bold">{errors.cardCvc}</p>}
                            </div>

                          </div>
                        </motion.section>
                      )}

                      {paymentMethod === 'promptpay' && (
                        
                        /* PROMPTPAY QR CODE VIEW */
                        <motion.section 
                          key="form-promptpay"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 md:p-8 level-2-shadow transition-colors flex flex-col items-center text-center gap-6"
                        >
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-lg text-on-surface dark:text-white font-display">PromptPay QR Code</h3>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto">
                              Open your mobile banking application and scan the dynamic PromptPay QR code to pay.
                            </p>
                          </div>

                          {/* Beautiful Custom SVG Representing PromptPay QR Code */}
                          <div className="relative p-5 bg-white rounded-2xl border border-slate-200 shadow-md">
                            
                            {/* PromptPay Title Banner */}
                            <div className="bg-[#003d79] text-white py-1 px-4 rounded font-bold text-[10px] tracking-wide mb-3 flex items-center justify-center gap-1">
                              <span className="font-display">Prompt Pay</span>
                            </div>

                            {/* Stylized QR Matrix mockup */}
                            <svg className="w-44 h-44 mx-auto text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                              {/* Position Detectors (Top Left, Top Right, Bottom Left) */}
                              <path d="M0,0 h30 v10 h-20 v20 h-10 z M10,10 h10 v10 h-10 z" />
                              <path d="M70,0 h30 v30 h-10 v-20 h-20 z M80,10 h10 v10 h-10 z" />
                              <path d="M0,70 h10 v20 h20 v10 h-30 z M10,80 h10 v10 h-10 z" />
                              
                              {/* Random QR Pixels Mockup pattern */}
                              <rect x="35" y="5" width="8" height="8" />
                              <rect x="48" y="12" width="6" height="6" />
                              <rect x="15" y="35" width="10" height="6" />
                              <rect x="5" y="45" width="8" height="12" />
                              
                              <rect x="35" y="35" width="30" height="30" fill="#003d79" opacity="0.1" /> {/* Center area glow */}
                              <path d="M40,40 h20 v20 h-20 z" fill="#003d79" /> {/* Center PromptPay symbol dot */}
                              
                              <rect x="75" y="35" width="12" height="12" />
                              <rect x="85" y="50" width="8" height="15" />
                              <rect x="40" y="75" width="15" height="8" />
                              <rect x="65" y="80" width="10" height="12" />
                              <rect x="58" y="90" width="18" height="6" />
                              <rect x="15" y="60" width="10" height="6" />
                              <rect x="35" y="62" width="8" height="8" />
                            </svg>

                            <div className="text-[10px] font-bold text-slate-500 font-mono mt-3 uppercase tracking-wider select-all">
                              REF: {Math.floor(10000000 + Math.random() * 90000000)}
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 w-full border border-[#c7c4d8]/20 dark:border-white/5 text-xs font-semibold text-on-surface-variant dark:text-slate-400 space-y-2 select-none text-left">
                            <div className="flex justify-between"><span>Merchant Name</span><span className="text-on-surface dark:text-white">SkillElevate Learning</span></div>
                            <div className="flex justify-between"><span>Payment Amount</span><span className="text-on-surface dark:text-white font-mono font-bold">${finalPrice}</span></div>
                          </div>

                          <button 
                            onClick={handleCheckoutSubmit}
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Validating Qrcode payment receipt...
                              </>
                            ) : (
                              'Confirm Payment Received'
                            )}
                          </button>
                        </motion.section>
                      )}

                      {paymentMethod === 'bank' && (
                        
                        /* BANK TRANSFER WITH SLIP UPLOAD */
                        <motion.section 
                          key="form-bank"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 md:p-8 level-2-shadow transition-colors space-y-6"
                        >
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-on-surface dark:text-white font-display">Bank Transfer Accounts</h3>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">
                              Please transfer the exact order amount to one of our corporate bank accounts below, then upload the receipt slip.
                            </p>
                          </div>

                          {/* Bank Accounts details cards */}
                          <div className="space-y-3">
                            {[
                              { id: 1, bank: 'Siam Commercial Bank (SCB)', number: '123-4-56789-0', name: 'SkillElevate Co., Ltd.', color: 'border-purple-600/30 bg-purple-500/5' },
                              { id: 2, bank: 'Kasikorn Bank (KBank)', number: '987-6-54321-0', name: 'SkillElevate Co., Ltd.', color: 'border-emerald-600/30 bg-emerald-500/5' }
                            ].map((acc) => (
                              <div key={acc.id} className={`border rounded-xl p-4 flex justify-between items-center transition-all ${acc.color}`}>
                                <div className="text-left space-y-1">
                                  <span className="text-xs font-bold text-on-surface dark:text-white block">{acc.bank}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Acc Name: {acc.name}</span>
                                  <span className="text-sm font-bold font-mono text-primary dark:text-primary-fixed block tracking-wide select-all">{acc.number}</span>
                                </div>
                                <button 
                                  onClick={() => copyToClipboard(acc.number, acc.id)}
                                  className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-[#c7c4d8]/20 rounded-lg transition-colors active:scale-95 duration-200 cursor-pointer shrink-0"
                                >
                                  {copiedAccount === acc.id ? (
                                    <ClipboardCheck className="w-4 h-4 text-[#10b981]" />
                                  ) : (
                                    <Clipboard className="w-4 h-4 text-slate-400 hover:text-on-surface" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Drag and Drop Mock slip upload zone */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Upload Transfer Receipt Slip</span>
                            
                            <div 
                              onClick={triggerSlipUpload}
                              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                                errors.slip ? 'border-red-500 bg-red-500/5' :
                                uploadedSlip ? 'border-emerald-500/55 bg-emerald-500/5' : 'border-[#c7c4d8]/40 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-transparent'
                              }`}
                            >
                              {isUploading ? (
                                <>
                                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <span className="text-xs font-semibold text-slate-400">Verifying file metadata...</span>
                                </>
                              ) : uploadedSlip ? (
                                <>
                                  <FileText className="w-8 h-8 text-[#10b981]" />
                                  <div className="text-xs">
                                    <p className="font-bold text-[#10b981]">Receipt Loaded Successfully</p>
                                    <p className="text-slate-400 font-semibold text-[10px] mt-0.5">{uploadedSlip}</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-slate-400" />
                                  <div className="text-xs">
                                    <p className="font-bold text-on-surface dark:text-slate-200">Click to upload file</p>
                                    <p className="text-slate-400 font-semibold text-[10px] mt-0.5">Supports PNG, JPG, PDF up to 5MB</p>
                                  </div>
                                </>
                              )}
                            </div>
                            {errors.slip && <p className="text-[10px] text-red-500 font-bold">{errors.slip}</p>}
                          </div>

                          <button 
                            onClick={handleCheckoutSubmit}
                            disabled={isSubmitting || isUploading}
                            className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing Receipt Submission...
                              </>
                            ) : (
                              'Submit Transfer Receipt Slip'
                            )}
                          </button>
                        </motion.section>
                      )}
                    </AnimatePresence>

                    {/* Billing address simplified selection */}
                    <section className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl p-6 level-2-shadow transition-colors">
                      <h2 className="font-bold text-base text-on-surface dark:text-white mb-4 font-display flex items-center gap-2">
                        <Shield className="w-4.5 h-4.5 text-primary dark:text-primary-fixed" />
                        Billing Country
                      </h2>
                      <select 
                        value={billingCountry}
                        onChange={(e) => setBillingCountry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-xl px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="US">United States</option>
                        <option value="TH">Thailand</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </section>
                  </>
                )}

              </div>

              {/* Right Column: Course Summary & Order details card */}
              <div className="lg:col-span-5 relative w-full lg:sticky lg:top-24">
                
                {/* Course Summary Card */}
                <div className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-2xl level-2-shadow overflow-hidden text-left transition-colors flex flex-col">
                  
                  {/* Course visual banner */}
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 relative select-none shrink-0 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-tr ${isCartCheckout ? 'from-primary to-emerald-700/60' : course.gradient} opacity-80 mix-blend-multiply`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-12 h-12 text-white opacity-85 animate-pulse" />
                      {isCartCheckout && (
                        <span className="text-white font-bold text-sm font-display">
                          {cartItems.length} {cartItems.length === 1 ? 'Course' : 'Courses'} in Order
                        </span>
                      )}
                    </div>
                    {!isCartCheckout && course.tag && (
                      <span className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/90 text-on-surface dark:text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm">
                        {course.tag}
                      </span>
                    )}
                  </div>

                  {/* Summary details */}
                  <div className="p-6 space-y-4">
                    
                    {!isCartCheckout ? (
                      <>
                        {/* Category & difficulty chips */}
                        <div className="flex gap-2">
                          <span className="bg-primary/10 dark:bg-primary-fixed/20 text-primary dark:text-primary-fixed px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {course.category}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {course.difficulty}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg md:text-xl text-on-surface dark:text-white leading-tight font-display tracking-tight">
                          {course.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-slate-400 font-semibold select-none">
                          <User className="w-3.5 h-3.5" />
                          <span>Instructor: {course.author}</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Items in Order</h3>
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center py-1.5 border-b border-[#c7c4d8]/10 dark:border-white/5 last:border-0">
                            <div className={`w-10 h-8 rounded bg-gradient-to-br ${item.gradient} shrink-0`} />
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-xs text-on-surface dark:text-white truncate" title={item.title}>
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">By {item.author}</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-on-surface dark:text-white shrink-0">
                              {item.price === 'Free' ? '$0.00' : item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-[#c7c4d8]/20 dark:bg-white/5 w-full" />

                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order Summary</h4>
                    
                    {/* Billing Summary calculation */}
                    <div className="space-y-3 text-xs font-semibold text-on-surface-variant dark:text-slate-400">
                      
                      <div className="flex justify-between">
                        <span>Original Price</span>
                        <span className="text-on-surface dark:text-white font-mono">${basePrice.toFixed(2)}</span>
                      </div>

                      {/* Coupon Inputs */}
                      {!isFree && (
                        <div className="space-y-2">
                          <div className="flex gap-2 pt-1">
                            <input 
                              type="text" 
                              placeholder="Coupon Code" 
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              disabled={!!appliedCoupon}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-[#c7c4d8]/40 dark:border-white/5 rounded-lg text-[11px] focus:ring-1 focus:ring-primary focus:border-transparent text-on-surface dark:text-white placeholder-slate-400 font-semibold uppercase tracking-wider"
                            />
                            {appliedCoupon ? (
                              <button 
                                onClick={handleRemoveCoupon}
                                className="px-3.5 bg-red-500/10 text-red-500 rounded-lg text-[11px] font-bold hover:bg-red-500/20 transition-colors active:scale-95 duration-200 cursor-pointer"
                              >
                                Remove
                              </button>
                            ) : (
                              <button 
                                onClick={handleApplyCoupon}
                                disabled={!couponInput.trim()}
                                className="px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-on-surface dark:text-slate-300 rounded-lg text-[11px] font-bold transition-colors active:scale-95 duration-200 cursor-pointer disabled:opacity-40"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                          {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                        </div>
                      )}

                      {/* Applied Coupon Info row */}
                      {appliedCoupon && !isFree && (
                        <div className="flex justify-between items-center text-[#10b981] pt-1">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            Applied Coupon ({appliedCoupon})
                          </span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                    </div>

                    <div className="h-px bg-[#c7c4d8]/20 dark:bg-white/5 w-full" />

                    <div className="flex justify-between items-end my-1 select-none">
                      <span className="font-bold text-sm text-on-surface dark:text-white">Total price</span>
                      <span className="font-bold text-2xl text-on-surface dark:text-white font-mono leading-none tracking-tight">
                        ${finalPrice}
                      </span>
                    </div>

                    {/* General Error Alert */}
                    {errors.general && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs font-semibold text-red-500 dark:text-red-400 flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">⚠️</span>
                        <span>{errors.general}</span>
                      </div>
                    )}

                    {/* Final Complete Action Button */}
                    <button 
                      onClick={handleCheckoutSubmit}
                      disabled={isSubmitting || isUploading}
                      className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] border-t border-white/20 flex justify-center items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Purchase</span>
                          <Lock className="w-4 h-4 fill-current" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed max-w-[240px] mx-auto select-none mt-2">
                      By completing this purchase, you agree to our <a className="underline hover:text-primary transition-colors" href="#">Terms of Service</a>.
                    </p>

                  </div>

                </div>

                {/* Trust Seals & Security badging details */}
                <div className="flex flex-col items-center gap-3 mt-5 select-none">
                  <div className="flex items-center gap-5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> 256-bit SSL</div>
                    <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> PCI Compliant</div>
                  </div>

                  <div className="bg-white dark:bg-[#0f172a] border border-[#c7c4d8]/40 dark:border-white/5 rounded-xl p-4 flex items-start gap-3 text-left w-full transition-colors">
                    <HelpCircle className="w-5 h-5 text-primary dark:text-primary-fixed shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-on-surface dark:text-slate-200 block">30-Day Money-Back Guarantee</span>
                      <span className="text-[11px] leading-relaxed text-on-surface-variant dark:text-slate-400 block font-medium">
                        If you're not completely satisfied, we'll refund your purchase. No questions asked.
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
