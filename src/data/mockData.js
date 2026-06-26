import { subDays, addDays, format } from 'date-fns';

const today = new Date();
const STATUSES = ['delivered', 'dispatched', 'processing', 'cancelled', 'returned'];
const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'COD', 'Net Banking', 'Wallet'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Maharashtra', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];
const CARRIERS = ['Delhivery', 'BlueDart', 'DTDC', 'Ekart', 'Shadowfax', 'Xpressbees'];
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Sports', 'Books', 'Toys'];
const PRODUCTS = [
  { name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2499, cost: 1200 },
  { name: 'Cotton T-Shirt Premium', category: 'Clothing', price: 799, cost: 280 },
  { name: 'Stainless Steel Bottle', category: 'Home & Kitchen', price: 599, cost: 180 },
  { name: 'Face Serum Vitamin C', category: 'Beauty', price: 899, cost: 250 },
  { name: 'Yoga Mat Premium', category: 'Sports', price: 1299, cost: 450 },
  { name: 'Bestseller Novel Set', category: 'Books', price: 499, cost: 200 },
  { name: 'Building Blocks Set', category: 'Toys', price: 1599, cost: 600 },
  { name: 'Smart Watch Lite', category: 'Electronics', price: 3999, cost: 1800 },
  { name: 'Denim Jacket Classic', category: 'Clothing', price: 1899, cost: 700 },
  { name: 'Ceramic Dinner Set', category: 'Home & Kitchen', price: 2999, cost: 1100 },
  { name: 'Hair Oil Organic', category: 'Beauty', price: 449, cost: 120 },
  { name: 'Cricket Bat Premium', category: 'Sports', price: 2499, cost: 900 },
  { name: 'Phone Case Leather', category: 'Electronics', price: 699, cost: 150 },
  { name: 'Running Shoes', category: 'Sports', price: 2999, cost: 1200 },
  { name: 'Scented Candle Set', category: 'Home & Kitchen', price: 799, cost: 250 },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 1999, cost: 800 },
  { name: 'Formal Shirt Slim', category: 'Clothing', price: 1299, cost: 450 },
  { name: 'Kitchen Knife Set', category: 'Home & Kitchen', price: 1499, cost: 500 },
  { name: 'Sunscreen SPF50', category: 'Beauty', price: 549, cost: 160 },
  { name: 'Puzzle Board 1000pc', category: 'Toys', price: 699, cost: 220 },
];

const CUSTOMER_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Vikram Mehta',
  'Sneha Reddy', 'Arjun Nair', 'Kavya Iyer', 'Rahul Verma', 'Pooja Desai',
  'Amit Kumar', 'Divya Joshi', 'Karan Malhotra', 'Riya Chopra', 'Siddharth Das',
  'Neha Agarwal', 'Mohit Saxena', 'Ishita Banerjee', 'Varun Tiwari', 'Meera Pillai',
];

// Helper functions
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function randDate(daysBack) { return subDays(today, rand(0, daysBack)); }

// Generate Orders (800 orders over 90 days)
export function generateOrders(count = 800) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    const cityIdx = rand(0, CITIES.length - 1);
    const product = pick(PRODUCTS);
    const qty = rand(1, 3);
    const amount = product.price * qty;
    const discount = Math.random() > 0.7 ? rand(50, 300) : 0;
    const status = pick(STATUSES);
    const date = randDate(90);

    orders.push({
      orderId: `ORD${String(10000 + i).padStart(6, '0')}`,
      date,
      customerName: pick(CUSTOMER_NAMES),
      customerEmail: `customer${rand(1, 200)}@email.com`,
      customerPhone: `9${rand(100000000, 999999999)}`,
      amount: amount - discount,
      status,
      paymentStatus: status === 'cancelled' ? 'refunded' : 'paid',
      paymentMethod: pick(PAYMENT_METHODS),
      city: CITIES[cityIdx],
      state: STATES[cityIdx],
      pincode: String(rand(100000, 999999)),
      items: qty,
      discount,
      shippingCharge: amount > 999 ? 0 : rand(40, 99),
      productName: product.name,
      productCategory: product.category,
    });
  }
  return orders.sort((a, b) => b.date - a.date);
}

// Generate Dispatched Orders
export function generateDispatched(orders) {
  return orders
    .filter(o => ['delivered', 'dispatched'].includes(o.status))
    .map(order => {
      const dispatchDate = addDays(order.date, rand(0, 2));
      const deliveryDays = rand(2, 10);
      const delivered = order.status === 'delivered';
      return {
        orderId: order.orderId,
        dispatchDate,
        deliveryDate: delivered ? addDays(dispatchDate, deliveryDays) : null,
        carrier: pick(CARRIERS),
        trackingId: `TRK${rand(1000000000, 9999999999)}`,
        status: delivered ? 'delivered' : 'in_transit',
        city: order.city,
        state: order.state,
        weight: (rand(1, 50) / 10).toFixed(1),
        shippingCost: rand(30, 150),
      };
    });
}

// Generate Cashflow
export function generateCashflow(orders) {
  const cashflow = [];
  orders.forEach(order => {
    if (order.paymentStatus === 'paid') {
      cashflow.push({
        date: order.date,
        type: 'Order Payment',
        amount: order.amount,
        description: `Payment for ${order.orderId}`,
        orderId: order.orderId,
        category: 'revenue',
      });
    }
    if (order.status === 'cancelled' || order.status === 'returned') {
      cashflow.push({
        date: addDays(order.date, rand(3, 10)),
        type: 'Refund',
        amount: -order.amount,
        description: `Refund for ${order.orderId}`,
        orderId: order.orderId,
        category: 'refund',
      });
    }
    if (order.shippingCharge > 0) {
      cashflow.push({
        date: order.date,
        type: 'Shipping Fee',
        amount: -order.shippingCharge,
        description: `Shipping for ${order.orderId}`,
        orderId: order.orderId,
        category: 'shipping',
      });
    }
  });
  return cashflow.sort((a, b) => b.date - a.date);
}

// Generate Product Performance
export function generateProductPerformance() {
  return PRODUCTS.map((product, idx) => {
    const unitsSold = rand(20, 500);
    const returns = rand(0, Math.floor(unitsSold * 0.08));
    return {
      productId: `SKU${String(idx + 1).padStart(4, '0')}`,
      productName: product.name,
      category: product.category,
      unitsSold,
      revenue: unitsSold * product.price,
      costPrice: product.cost,
      sellingPrice: product.price,
      returns,
      avgRating: (3.5 + Math.random() * 1.5).toFixed(1),
    };
  });
}

// Generate Customer Data
export function generateCustomers(count = 200) {
  const customers = [];
  for (let i = 0; i < count; i++) {
    const totalOrders = Math.random() > 0.6 ? rand(2, 12) : 1;
    const avgOrder = rand(500, 4000);
    const cityIdx = rand(0, CITIES.length - 1);
    const lastPurchaseDays = rand(1, 180);

    customers.push({
      customerId: `CUST${String(i + 1).padStart(5, '0')}`,
      name: pick(CUSTOMER_NAMES),
      email: `customer${i + 1}@email.com`,
      phone: `9${rand(100000000, 999999999)}`,
      totalOrders,
      totalSpent: totalOrders * avgOrder,
      firstPurchase: subDays(today, rand(90, 365)),
      lastPurchase: subDays(today, lastPurchaseDays),
      city: CITIES[cityIdx],
      state: STATES[cityIdx],
    });
  }
  return customers;
}

// Generate WhatsApp Campaigns
export function generateWhatsAppCampaigns(count = 15) {
  const templateNames = [
    'Flash Sale Alert', 'New Arrivals', 'Cart Abandonment', 'Back in Stock',
    'Festival Offer', 'Loyalty Reward', 'Product Launch', 'Win-back Campaign',
    'Birthday Special', 'Exclusive Preview', 'Clearance Sale', 'Season End',
    'Festive Collection', 'Referral Bonus', 'App Download',
  ];

  return templateNames.slice(0, count).map((name, idx) => {
    const sent = rand(500, 5000);
    const delivered = Math.floor(sent * (0.85 + Math.random() * 0.12));
    const read = Math.floor(delivered * (0.4 + Math.random() * 0.35));
    const clicked = Math.floor(read * (0.1 + Math.random() * 0.2));
    const conversions = Math.floor(clicked * (0.05 + Math.random() * 0.15));
    return {
      campaignId: `WA${String(idx + 1).padStart(3, '0')}`,
      campaignName: name,
      date: subDays(today, rand(1, 60)),
      sent,
      delivered,
      read,
      clicked,
      conversions,
      revenue: conversions * rand(500, 3000),
    };
  });
}

// Generate Tax Data
export function generateTaxData(orders) {
  return orders
    .filter(o => o.paymentStatus === 'paid' && o.status !== 'cancelled')
    .map(order => {
      const taxableAmount = order.amount / 1.18; // assuming 18% GST
      const totalTax = order.amount - taxableAmount;
      const isInterstate = Math.random() > 0.6;
      return {
        date: order.date,
        orderId: order.orderId,
        taxableAmount: parseFloat(taxableAmount.toFixed(2)),
        cgst: isInterstate ? 0 : parseFloat((totalTax / 2).toFixed(2)),
        sgst: isInterstate ? 0 : parseFloat((totalTax / 2).toFixed(2)),
        igst: isInterstate ? parseFloat(totalTax.toFixed(2)) : 0,
        totalTax: parseFloat(totalTax.toFixed(2)),
        state: order.state,
      };
    });
}

// Generate all mock data
export function generateAllMockData() {
  const orders = generateOrders(800);
  const dispatched = generateDispatched(orders);
  const cashflow = generateCashflow(orders);
  const products = generateProductPerformance();
  const customers = generateCustomers(200);
  const whatsapp = generateWhatsAppCampaigns(15);
  const tax = generateTaxData(orders);

  return {
    orders,
    dispatched,
    cashflow,
    products,
    customers,
    whatsapp,
    tax,
  };
}
