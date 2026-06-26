import { subDays, addDays, format } from 'date-fns';

const today = new Date();

// Constants
const STATUSES = ['delivered', 'dispatched', 'processing', 'cancelled', 'returned', 'rto'];
const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'COD', 'Net Banking', 'Wallet'];
const PAYMENT_GATEWAYS = ['Razorpay', 'PayU', 'Cashfree', 'PhonePe', 'Paytm'];
const ORDER_SOURCES = ['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Direct'];
const SALES_CHANNELS = ['Shopdeck', 'Amazon', 'Flipkart', 'Meesho', 'Direct'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Nagpur', 'Kochi', 'Chandigarh', 'Surat'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Maharashtra', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Kerala', 'Punjab', 'Gujarat'];
const DISTRICTS = ['Mumbai Suburban', 'New Delhi', 'Bangalore Urban', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Nagpur', 'Ernakulam', 'Chandigarh', 'Surat'];
const AREAS = ['Andheri', 'Connaught Place', 'Koramangala', 'Hitech City', 'T Nagar', 'Kothrud', 'Salt Lake', 'CG Road', 'Malviya Nagar', 'Gomti Nagar', 'Vijay Nagar', 'Dharampeth', 'MG Road', 'Sector 17', 'Adajan'];
const LANDMARKS = ['Near Mall', 'Opp Bus Stand', 'Near Hospital', 'Behind School', 'Near Park', 'Near Temple', 'Opp Bank', 'Near Metro', 'Near Market', 'Main Road'];

const CARRIERS = ['Delhivery', 'BlueDart', 'DTDC', 'Ekart', 'Shadowfax', 'Xpressbees', 'Shiprocket', 'Ecom Express'];
const WAREHOUSES = ['Mumbai Hub', 'Delhi Hub', 'Bangalore Hub', 'Hyderabad Hub', 'Pune Hub'];
const ZONES = ['Local', 'Zonal', 'Metro', 'National', 'Special'];
const NDR_STATUSES = ['None', 'Address Issue', 'Customer Not Available', 'Refused', 'Phone Unreachable'];
const RTO_STATUSES = ['None', 'RTO Initiated', 'RTO In Transit', 'RTO Delivered'];
const DELIVERY_STATUSES = ['Delivered', 'In Transit', 'Out for Delivery', 'Failed', 'RTO'];
const CATEGORIES = ['Organic Food', 'Natural Skincare', 'Herbal Tea', 'Essential Oils', 'Honey & Spreads', 'Dry Fruits', 'Health Supplements'];
const BRANDS = ["Nature's Crates", 'Organic Valley', 'Pure Earth', 'Green Essence', 'Herbal Life'];
const COUPONS = ['FIRST10', 'SAVE20', 'FLAT50', 'NC100', 'WELCOME15', 'REPEAT10', 'FESTIVE25', ''];

const PRODUCTS = [
  { name: 'Organic Honey Raw 500g', sku: 'NC-HON-001', category: 'Honey & Spreads', price: 599, cost: 220, variant: '500g' },
  { name: 'Green Tea Assam Premium', sku: 'NC-TEA-001', category: 'Herbal Tea', price: 449, cost: 150, variant: '100g' },
  { name: 'Almond Butter Natural', sku: 'NC-SPR-001', category: 'Honey & Spreads', price: 699, cost: 280, variant: '200g' },
  { name: 'Vitamin C Face Serum', sku: 'NC-SKN-001', category: 'Natural Skincare', price: 899, cost: 250, variant: '30ml' },
  { name: 'Lavender Essential Oil', sku: 'NC-OIL-001', category: 'Essential Oils', price: 549, cost: 180, variant: '15ml' },
  { name: 'Organic Quinoa', sku: 'NC-FD-001', category: 'Organic Food', price: 399, cost: 160, variant: '500g' },
  { name: 'Mixed Dry Fruits Premium', sku: 'NC-DRY-001', category: 'Dry Fruits', price: 1299, cost: 550, variant: '500g' },
  { name: 'Ashwagandha Capsules', sku: 'NC-SUP-001', category: 'Health Supplements', price: 799, cost: 250, variant: '60 caps' },
  { name: 'Rose Water Toner', sku: 'NC-SKN-002', category: 'Natural Skincare', price: 349, cost: 100, variant: '100ml' },
  { name: 'Peppermint Tea Bags', sku: 'NC-TEA-002', category: 'Herbal Tea', price: 299, cost: 90, variant: '25 bags' },
  { name: 'Coconut Oil Cold Pressed', sku: 'NC-OIL-002', category: 'Essential Oils', price: 499, cost: 180, variant: '500ml' },
  { name: 'Organic Chia Seeds', sku: 'NC-FD-002', category: 'Organic Food', price: 349, cost: 120, variant: '250g' },
  { name: 'Cashew Nuts Premium', sku: 'NC-DRY-002', category: 'Dry Fruits', price: 899, cost: 400, variant: '500g' },
  { name: 'Turmeric Latte Mix', sku: 'NC-TEA-003', category: 'Herbal Tea', price: 399, cost: 130, variant: '200g' },
  { name: 'Shea Butter Moisturizer', sku: 'NC-SKN-003', category: 'Natural Skincare', price: 649, cost: 200, variant: '100g' },
  { name: 'Moringa Powder Organic', sku: 'NC-SUP-002', category: 'Health Supplements', price: 449, cost: 140, variant: '200g' },
  { name: 'Walnut Kernels', sku: 'NC-DRY-003', category: 'Dry Fruits', price: 749, cost: 320, variant: '250g' },
  { name: 'Tea Tree Essential Oil', sku: 'NC-OIL-003', category: 'Essential Oils', price: 449, cost: 150, variant: '15ml' },
  { name: 'Organic Flax Seeds', sku: 'NC-FD-003', category: 'Organic Food', price: 249, cost: 80, variant: '250g' },
  { name: 'Multivitamin Gummies', sku: 'NC-SUP-003', category: 'Health Supplements', price: 599, cost: 200, variant: '30 gummies' },
];

const CUSTOMER_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Vikram Mehta',
  'Sneha Reddy', 'Arjun Nair', 'Kavya Iyer', 'Rahul Verma', 'Pooja Desai',
  'Amit Kumar', 'Divya Joshi', 'Karan Malhotra', 'Riya Chopra', 'Siddharth Das',
  'Neha Agarwal', 'Mohit Saxena', 'Ishita Banerjee', 'Varun Tiwari', 'Meera Pillai',
  'Aditya Rao', 'Shruti Mishra', 'Deepak Pandey', 'Nisha Kulkarni', 'Rajesh Menon',
];

const WHATSAPP_TEMPLATES = [
  { name: 'Flash Sale Alert', category: 'Marketing' },
  { name: 'New Arrivals', category: 'Marketing' },
  { name: 'Cart Abandonment', category: 'Utility' },
  { name: 'Back in Stock', category: 'Utility' },
  { name: 'Festival Offer', category: 'Marketing' },
  { name: 'Loyalty Reward', category: 'Marketing' },
  { name: 'Product Launch', category: 'Marketing' },
  { name: 'Win-back Campaign', category: 'Marketing' },
  { name: 'Birthday Special', category: 'Utility' },
  { name: 'Exclusive Preview', category: 'Marketing' },
  { name: 'Order Confirmation', category: 'Utility' },
  { name: 'Shipping Update', category: 'Utility' },
  { name: 'Delivery Confirmation', category: 'Utility' },
  { name: 'Review Request', category: 'Utility' },
  { name: 'Referral Bonus', category: 'Marketing' },
];

// Helper functions
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function randDate(daysBack) { return subDays(today, rand(0, daysBack)); }
function randTime() { return `${String(rand(0, 23)).padStart(2, '0')}:${String(rand(0, 59)).padStart(2, '0')}:${String(rand(0, 59)).padStart(2, '0')}`; }


// REPORT 1: Generate Orders with ALL fields from specification
export function generateOrders(count = 800) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    const cityIdx = rand(0, CITIES.length - 1);
    const product = pick(PRODUCTS);
    const qty = rand(1, 4);
    const unitPrice = product.price;
    const grossAmount = unitPrice * qty;
    const discount = Math.random() > 0.6 ? rand(50, 300) : 0;
    const coupon = discount > 0 ? pick(COUPONS.filter(c => c)) : '';
    const tax = Math.round(grossAmount * 0.18);
    const shippingCharge = grossAmount > 999 ? 0 : rand(40, 99);
    const netAmount = grossAmount - discount + tax + shippingCharge;
    const status = pick(STATUSES);
    const date = randDate(90);
    const paymentMethod = pick(PAYMENT_METHODS);
    const paymentGateway = paymentMethod === 'COD' ? 'COD' : pick(PAYMENT_GATEWAYS);
    const platformCharges = Math.round(netAmount * 0.02);
    const pgCharges = paymentMethod === 'COD' ? 0 : Math.round(netAmount * 0.02);
    const settlementAmount = netAmount - platformCharges - pgCharges - shippingCharge;
    const carrier = pick(CARRIERS);
    const dispatchDate = ['delivered', 'dispatched', 'rto'].includes(status) ? addDays(date, rand(0, 2)) : null;
    const deliveryDate = status === 'delivered' ? addDays(date, rand(3, 8)) : null;
    const deliverySLA = rand(3, 7);
    const customerName = pick(CUSTOMER_NAMES);

    orders.push({
      // Order Information
      orderId: `ORD${String(10000 + i).padStart(6, '0')}`,
      orderNumber: `NC-${String(20000 + i)}`,
      externalOrderId: `EXT-${rand(100000, 999999)}`,
      date,
      orderTime: randTime(),
      status,
      paymentStatus: status === 'cancelled' ? 'refunded' : status === 'returned' ? 'refunded' : 'paid',
      paymentMethod,
      paymentGateway,
      orderSource: pick(ORDER_SOURCES),
      salesChannel: pick(SALES_CHANNELS),
      // Customer
      customerName,
      customerPhone: `9${rand(100000000, 999999999)}`,
      customerEmail: `${customerName.toLowerCase().replace(' ', '.')}${rand(1, 99)}@email.com`,
      address: `${rand(1, 500)}, ${pick(AREAS)} Road`,
      area: AREAS[cityIdx],
      landmark: pick(LANDMARKS),
      city: CITIES[cityIdx],
      district: DISTRICTS[cityIdx],
      state: STATES[cityIdx],
      country: 'India',
      pincode: String(rand(100000, 999999)),
      // Product
      productName: product.name,
      sku: product.sku,
      variant: product.variant,
      productCategory: product.category,
      quantity: qty,
      unitPrice,
      discount,
      coupon,
      tax,
      shippingCharge,
      // Financial
      grossAmount,
      discountAmount: discount,
      netAmount,
      platformCharges,
      paymentGatewayCharges: pgCharges,
      shippingCharges: shippingCharge,
      settlementAmount,
      // Fulfillment
      warehouse: pick(WAREHOUSES),
      courier: carrier,
      awbNumber: `AWB${rand(1000000000, 9999999999)}`,
      dispatchDate,
      deliveryDate,
      deliverySLA,
      deliveryStatus: status === 'delivered' ? 'Delivered' : status === 'dispatched' ? 'In Transit' : status === 'rto' ? 'RTO' : 'Pending',
    });
  }
  return orders.sort((a, b) => b.date - a.date);
}


// REPORT 2: Shipping Performance Report
export function generateShippingData(orders) {
  return orders
    .filter(o => ['delivered', 'dispatched', 'rto'].includes(o.status))
    .map(order => {
      const pickupDate = addDays(order.date, rand(0, 1));
      const dispatchDate = addDays(pickupDate, rand(0, 1));
      const transitDays = rand(2, 10);
      const deliveryDate = order.status === 'delivered' ? addDays(dispatchDate, transitDays) : null;
      const deliveryAttempts = order.status === 'delivered' ? rand(1, 3) : rand(1, 5);
      return {
        awb: order.awbNumber,
        courier: order.courier,
        pickupDate,
        dispatchDate,
        deliveryDate,
        transitDays: order.status === 'delivered' ? transitDays : null,
        zone: pick(ZONES),
        shippingCost: rand(30, 200),
        deliveryStatus: order.deliveryStatus,
        ndrStatus: order.status !== 'delivered' ? pick(NDR_STATUSES) : 'None',
        rtoStatus: order.status === 'rto' ? pick(RTO_STATUSES.slice(1)) : 'None',
        deliveryAttempts,
        orderId: order.orderId,
        city: order.city,
        state: order.state,
        weight: (rand(1, 50) / 10).toFixed(1),
      };
    });
}

// REPORT 3: Dispatch Report
export function generateDispatchData(orders) {
  return orders
    .filter(o => ['delivered', 'dispatched', 'rto'].includes(o.status))
    .map(order => {
      const dispatchDate = order.dispatchDate || addDays(order.date, rand(0, 2));
      const packingTime = rand(5, 120); // minutes
      const dispatchDelay = rand(0, 48); // hours
      return {
        orderId: order.orderId,
        awb: order.awbNumber,
        courier: order.courier,
        dispatchDate,
        dispatchTime: randTime(),
        warehouse: order.warehouse,
        picker: pick(CUSTOMER_NAMES),
        packingTime,
        dispatchDelay,
        status: dispatchDelay > 24 ? 'Delayed' : 'On Time',
      };
    });
}


// REPORT 4: Order Reconciliation Report
export function generateReconciliationData(orders) {
  return orders
    .filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'refunded')
    .map(order => {
      const grossRevenue = order.grossAmount;
      const shippingIncome = order.shippingCharge;
      const shippingCost = rand(30, 150);
      const platformFee = Math.round(grossRevenue * 0.025);
      const gatewayFee = order.paymentMethod === 'COD' ? rand(20, 50) : Math.round(grossRevenue * 0.02);
      const commission = Math.round(grossRevenue * 0.05);
      const reverseShipping = (order.status === 'returned' || order.status === 'rto') ? rand(50, 150) : 0;
      const tds = Math.round(grossRevenue * 0.01);
      const tcs = Math.round(grossRevenue * 0.01);
      const netSettlement = grossRevenue + shippingIncome - shippingCost - platformFee - gatewayFee - commission - reverseShipping - tds - tcs;
      return {
        orderId: order.orderId,
        date: order.date,
        grossRevenue,
        shippingIncome,
        shippingCharge: shippingCost,
        platformFee,
        gatewayFee,
        commission,
        reverseShipping,
        tds,
        tcs,
        settlementAmount: Math.max(netSettlement, 0),
        netSettlement,
        settlementStatus: Math.random() > 0.3 ? 'Settled' : 'Pending',
        settlementDate: Math.random() > 0.3 ? addDays(order.date, rand(3, 15)) : null,
      };
    });
}

// REPORT 5: Cashflow Report
export function generateCashflowData(orders) {
  const totalPaidOrders = orders.filter(o => o.paymentStatus === 'paid' && o.status !== 'cancelled');
  const totalRevenue = totalPaidOrders.reduce((s, o) => s + o.netAmount, 0);
  const totalShippingCharge = totalPaidOrders.reduce((s, o) => s + o.shippingCharge, 0);
  const codOrders = totalPaidOrders.filter(o => o.paymentMethod === 'COD');
  const onlineOrders = totalPaidOrders.filter(o => o.paymentMethod !== 'COD');
  const returnedOrders = orders.filter(o => o.status === 'returned' || o.status === 'rto');

  return {
    settledTransaction: {
      shippingCharge: totalShippingCharge,
      pgRemittance: Math.round(onlineOrders.reduce((s, o) => s + o.netAmount, 0) * 0.95),
      shopdeckServiceFees: Math.round(totalRevenue * 0.03),
      returnedOrderAmount: returnedOrders.reduce((s, o) => s + o.netAmount, 0),
      netReceived: Math.round(totalRevenue * 0.88),
    },
    nextPayment: {
      pgPaymentCollectedNotSettled: Math.round(totalRevenue * 0.05),
      codCollectedNotPaid: Math.round(codOrders.reduce((s, o) => s + o.netAmount, 0) * 0.15),
      totalNextPayment: Math.round(totalRevenue * 0.08),
    },
    outstanding: {
      codNonDelivered: Math.round(codOrders.filter(o => o.status !== 'delivered').reduce((s, o) => s + o.netAmount, 0)),
      codRTO: Math.round(codOrders.filter(o => o.status === 'rto').reduce((s, o) => s + o.netAmount, 0)),
      outstandingCOD: Math.round(codOrders.reduce((s, o) => s + o.netAmount, 0) * 0.1),
      totalOutstanding: Math.round(totalRevenue * 0.12),
    },
    dailyCashflow: generateDailyCashflow(orders),
  };
}

function generateDailyCashflow(orders) {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dayOrders = orders.filter(o => {
      const d = o.date instanceof Date ? o.date : new Date(o.date);
      return format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
    const inflow = dayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.netAmount, 0);
    const outflow = dayOrders.filter(o => o.status === 'returned' || o.status === 'cancelled').reduce((s, o) => s + o.netAmount, 0);
    days.push({ date, inflow, outflow, net: inflow - outflow });
  }
  return days.reverse();
}


// REPORT 6: Product Performance Report
export function generateProductPerformance(orders) {
  const productMap = {};
  orders.forEach(order => {
    const key = order.sku;
    if (!productMap[key]) {
      const prod = PRODUCTS.find(p => p.sku === order.sku) || PRODUCTS[0];
      productMap[key] = {
        sku: order.sku,
        productName: order.productName,
        category: order.productCategory,
        brand: pick(BRANDS),
        orders: 0,
        revenue: 0,
        unitsSold: 0,
        cancelled: 0,
        returned: 0,
        rto: 0,
        refundAmount: 0,
        costPrice: prod.cost,
        sellingPrice: prod.price,
      };
    }
    productMap[key].orders += 1;
    productMap[key].unitsSold += order.quantity;
    productMap[key].revenue += order.grossAmount;
    if (order.status === 'cancelled') productMap[key].cancelled += 1;
    if (order.status === 'returned') { productMap[key].returned += 1; productMap[key].refundAmount += order.netAmount; }
    if (order.status === 'rto') productMap[key].rto += 1;
  });

  return Object.values(productMap).map(p => ({
    ...p,
    grossMargin: p.revenue > 0 ? (((p.revenue - (p.costPrice * p.unitsSold)) / p.revenue) * 100).toFixed(1) : 0,
    netMargin: p.revenue > 0 ? (((p.revenue - (p.costPrice * p.unitsSold) - p.refundAmount) / p.revenue) * 100).toFixed(1) : 0,
  }));
}

// REPORT 7: Product Type Report
export function generateProductTypeData(productPerformance) {
  const categoryMap = {};
  productPerformance.forEach(p => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { category: p.category, revenue: 0, orders: 0, units: 0, profit: 0 };
    }
    categoryMap[p.category].revenue += p.revenue;
    categoryMap[p.category].orders += p.orders;
    categoryMap[p.category].units += p.unitsSold;
    categoryMap[p.category].profit += (p.revenue - (p.costPrice * p.unitsSold));
  });
  return Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
}


// REPORT 8: Purchased Customer Report
export function generateCustomers(orders) {
  const customerMap = {};
  orders.forEach(order => {
    const key = order.customerEmail;
    if (!customerMap[key]) {
      customerMap[key] = {
        customerId: `CUST${String(Object.keys(customerMap).length + 1).padStart(5, '0')}`,
        name: order.customerName,
        mobile: order.customerPhone,
        email: order.customerEmail,
        firstOrder: order.date,
        lastOrder: order.date,
        totalOrders: 0,
        totalRevenue: 0,
        city: order.city,
        state: order.state,
      };
    }
    customerMap[key].totalOrders += 1;
    customerMap[key].totalRevenue += order.netAmount;
    if (order.date < customerMap[key].firstOrder) customerMap[key].firstOrder = order.date;
    if (order.date > customerMap[key].lastOrder) customerMap[key].lastOrder = order.date;
  });

  return Object.values(customerMap).map(c => ({
    ...c,
    lifetimeValue: c.totalRevenue,
    averageOrderValue: Math.round(c.totalRevenue / c.totalOrders),
    segment: classifyCustomerSegment(c),
  }));
}

function classifyCustomerSegment(customer) {
  const daysSinceLastOrder = Math.round((today - customer.lastOrder) / (1000 * 60 * 60 * 24));
  if (customer.totalRevenue > 15000 && customer.totalOrders >= 5) return 'VIP';
  if (customer.totalOrders >= 3 && daysSinceLastOrder < 30) return 'Loyal';
  if (customer.totalOrders >= 2) return 'Repeat';
  if (daysSinceLastOrder > 60) return 'Dormant';
  if (daysSinceLastOrder > 90) return 'Lost';
  return 'New';
}

// REPORT 9: Last Buy Now Click Report
export function generateBuyNowClicks(customers) {
  return customers.slice(0, Math.min(customers.length, 200)).map(customer => {
    const clickDate = randDate(30);
    const converted = Math.random() > 0.6;
    const purchaseDate = converted ? addDays(clickDate, rand(0, 5)) : null;
    const daysSinceClick = Math.round((today - clickDate) / (1000 * 60 * 60 * 24));
    return {
      customer: customer.name,
      customerEmail: customer.email,
      product: pick(PRODUCTS).name,
      clickDate,
      purchaseDate,
      conversionStatus: converted ? 'Converted' : 'Not Converted',
      daysSinceClick,
      intent: daysSinceClick < 3 ? 'High' : daysSinceClick < 7 ? 'Medium' : 'Low',
    };
  });
}


// REPORT 10: WhatsApp HSM Report
export function generateWhatsAppHSM() {
  return WHATSAPP_TEMPLATES.map((template, idx) => {
    const sent = rand(500, 5000);
    const delivered = Math.floor(sent * (0.85 + Math.random() * 0.12));
    const read = Math.floor(delivered * (0.4 + Math.random() * 0.35));
    const failed = sent - delivered;
    const clicked = Math.floor(read * (0.1 + Math.random() * 0.2));
    const revenue = clicked * rand(50, 500);
    return {
      templateName: template.name,
      category: template.category,
      sent,
      delivered,
      read,
      failed,
      clicked,
      revenue,
      date: randDate(60),
      deliveryRate: ((delivered / sent) * 100).toFixed(1),
      readRate: ((read / delivered) * 100).toFixed(1),
      ctr: ((clicked / read) * 100).toFixed(1),
    };
  });
}

// Profitability Engine Data
export function generateProfitabilityData(orders) {
  return orders.filter(o => o.status === 'delivered').map(order => {
    const prod = PRODUCTS.find(p => p.sku === order.sku) || PRODUCTS[0];
    const productCost = prod.cost * order.quantity;
    const packagingCost = rand(10, 50);
    const shippingCost = rand(30, 150);
    const platformFees = Math.round(order.netAmount * 0.025);
    const pgFees = order.paymentMethod === 'COD' ? rand(20, 40) : Math.round(order.netAmount * 0.02);
    const marketingSpend = rand(0, 100);
    const returnsCost = 0;
    const netProfit = order.grossAmount - productCost - packagingCost - shippingCost - platformFees - pgFees - marketingSpend - returnsCost;
    return {
      orderId: order.orderId,
      sku: order.sku,
      productName: order.productName,
      category: order.productCategory,
      customerName: order.customerName,
      city: order.city,
      state: order.state,
      revenue: order.grossAmount,
      productCost,
      packagingCost,
      shippingCost,
      platformFees,
      pgFees,
      marketingSpend,
      returnsCost,
      netProfit,
      margin: order.grossAmount > 0 ? ((netProfit / order.grossAmount) * 100).toFixed(1) : 0,
    };
  });
}

// Generate ALL mock data
export function generateAllMockData() {
  const orders = generateOrders(800);
  const shipping = generateShippingData(orders);
  const dispatch = generateDispatchData(orders);
  const reconciliation = generateReconciliationData(orders);
  const cashflowData = generateCashflowData(orders);
  const productPerformance = generateProductPerformance(orders);
  const productTypes = generateProductTypeData(productPerformance);
  const customers = generateCustomers(orders);
  const buyNowClicks = generateBuyNowClicks(customers);
  const whatsapp = generateWhatsAppHSM();
  const profitability = generateProfitabilityData(orders);

  return {
    orders,
    shipping,
    dispatch,
    reconciliation,
    cashflow: cashflowData,
    products: productPerformance,
    productTypes,
    customers,
    buyNowClicks,
    whatsapp,
    profitability,
  };
}
