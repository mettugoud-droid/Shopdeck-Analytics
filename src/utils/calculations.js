import { format, subDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, isWithinInterval } from 'date-fns';

/**
 * Calculate KPI metrics from order data
 */
export function calculateKPIs(orders, dateRange) {
  const filtered = filterByDateRange(orders, dateRange);
  const prevFiltered = filterByDateRange(orders, getPreviousPeriod(dateRange));

  const totalRevenue = sum(filtered, 'amount');
  const prevRevenue = sum(prevFiltered, 'amount');
  const orderCount = filtered.length;
  const prevOrderCount = prevFiltered.length;
  const aov = orderCount > 0 ? totalRevenue / orderCount : 0;
  const prevAov = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

  const uniqueCustomers = new Set(filtered.map(o => o.customerEmail || o.customerPhone)).size;
  const prevUniqueCustomers = new Set(prevFiltered.map(o => o.customerEmail || o.customerPhone)).size;

  return {
    totalRevenue: { value: totalRevenue, change: percentChange(prevRevenue, totalRevenue) },
    orderCount: { value: orderCount, change: percentChange(prevOrderCount, orderCount) },
    aov: { value: aov, change: percentChange(prevAov, aov) },
    customers: { value: uniqueCustomers, change: percentChange(prevUniqueCustomers, uniqueCustomers) },
  };
}

/**
 * Calculate order trends (daily/weekly/monthly)
 */
export function calculateOrderTrends(orders, dateRange, granularity = 'daily') {
  const filtered = filterByDateRange(orders, dateRange);

  if (granularity === 'daily') {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayOrders = filtered.filter(o => o.date && format(o.date, 'yyyy-MM-dd') === dayStr);
      return {
        date: format(day, 'MMM dd'),
        fullDate: dayStr,
        orders: dayOrders.length,
        revenue: sum(dayOrders, 'amount'),
      };
    });
  }

  if (granularity === 'monthly') {
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthOrders = filtered.filter(o => o.date && format(o.date, 'yyyy-MM') === monthStr);
      return {
        date: format(month, 'MMM yyyy'),
        fullDate: monthStr,
        orders: monthOrders.length,
        revenue: sum(monthOrders, 'amount'),
      };
    });
  }

  return [];
}

/**
 * Calculate order status breakdown
 */
export function calculateStatusBreakdown(orders, dateRange) {
  const filtered = filterByDateRange(orders, dateRange);
  const statusMap = {};

  filtered.forEach(order => {
    const status = order.status || 'unknown';
    statusMap[status] = (statusMap[status] || 0) + 1;
  });

  return Object.entries(statusMap).map(([name, value]) => ({
    name: capitalize(name),
    value,
    percentage: filtered.length > 0 ? ((value / filtered.length) * 100).toFixed(1) : 0,
  }));
}

/**
 * Calculate top products by revenue
 */
export function calculateTopProducts(products, limit = 10) {
  return [...products]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(p => ({
      ...p,
      margin: p.revenue > 0 ? ((p.revenue - (p.costPrice * p.unitsSold)) / p.revenue * 100).toFixed(1) : 0,
    }));
}

/**
 * Calculate category performance
 */
export function calculateCategoryPerformance(products) {
  const categoryMap = {};

  products.forEach(product => {
    const cat = product.category || 'Uncategorized';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, revenue: 0, units: 0, products: 0 };
    }
    categoryMap[cat].revenue += product.revenue;
    categoryMap[cat].units += product.unitsSold;
    categoryMap[cat].products += 1;
  });

  return Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculate fulfillment metrics
 */
export function calculateFulfillmentMetrics(dispatched, orders, dateRange) {
  const filteredDispatched = filterByDateRange(dispatched, dateRange, 'dispatchDate');
  const filteredOrders = filterByDateRange(orders, dateRange);

  const totalDispatched = filteredDispatched.length;
  const totalOrders = filteredOrders.length;
  const dispatchRate = totalOrders > 0 ? (totalDispatched / totalOrders * 100) : 0;

  // On-time delivery (within 7 days)
  const delivered = filteredDispatched.filter(d => d.deliveryDate && d.dispatchDate);
  const onTime = delivered.filter(d => differenceInDays(d.deliveryDate, d.dispatchDate) <= 7);
  const onTimeRate = delivered.length > 0 ? (onTime.length / delivered.length * 100) : 0;

  // Average delivery time
  const deliveryTimes = delivered.map(d => differenceInDays(d.deliveryDate, d.dispatchDate)).filter(t => t >= 0);
  const avgDeliveryTime = deliveryTimes.length > 0 ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length : 0;

  // Shipping costs
  const totalShippingCost = sum(filteredDispatched, 'shippingCost');

  // Carrier breakdown
  const carrierMap = {};
  filteredDispatched.forEach(d => {
    const carrier = d.carrier || 'Unknown';
    if (!carrierMap[carrier]) {
      carrierMap[carrier] = { name: carrier, orders: 0, delivered: 0, totalDays: 0, cost: 0 };
    }
    carrierMap[carrier].orders += 1;
    carrierMap[carrier].cost += d.shippingCost || 0;
    if (d.deliveryDate && d.dispatchDate) {
      carrierMap[carrier].delivered += 1;
      carrierMap[carrier].totalDays += differenceInDays(d.deliveryDate, d.dispatchDate);
    }
  });

  const carriers = Object.values(carrierMap).map(c => ({
    ...c,
    avgDays: c.delivered > 0 ? (c.totalDays / c.delivered).toFixed(1) : 'N/A',
    deliveryRate: c.orders > 0 ? ((c.delivered / c.orders) * 100).toFixed(1) : 0,
  }));

  return {
    dispatchRate: dispatchRate.toFixed(1),
    onTimeRate: onTimeRate.toFixed(1),
    avgDeliveryTime: avgDeliveryTime.toFixed(1),
    totalShippingCost,
    totalDispatched,
    pendingDispatch: totalOrders - totalDispatched,
    carriers: carriers.sort((a, b) => b.orders - a.orders),
  };
}

/**
 * Calculate customer insights
 */
export function calculateCustomerInsights(customers) {
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(c => c.totalOrders > 1);
  const newCustomers = customers.filter(c => c.totalOrders === 1);
  const repeatRate = totalCustomers > 0 ? (repeatCustomers.length / totalCustomers * 100) : 0;

  // LTV segments
  const sorted = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
  const highValue = sorted.filter(c => c.totalSpent >= 5000);
  const mediumValue = sorted.filter(c => c.totalSpent >= 1000 && c.totalSpent < 5000);
  const lowValue = sorted.filter(c => c.totalSpent < 1000);

  // Purchase frequency distribution
  const freqMap = {};
  customers.forEach(c => {
    const freq = Math.min(c.totalOrders, 10); // cap at 10+
    const label = freq >= 10 ? '10+' : `${freq}`;
    freqMap[label] = (freqMap[label] || 0) + 1;
  });
  const frequencyDist = Object.entries(freqMap)
    .map(([orders, count]) => ({ orders, count }))
    .sort((a, b) => parseInt(a.orders) - parseInt(b.orders));

  // Re-engagement (not purchased in 60+ days)
  const now = new Date();
  const reEngagement = customers.filter(c => {
    if (!c.lastPurchase) return false;
    return differenceInDays(now, c.lastPurchase) > 60;
  });

  // Average LTV
  const avgLTV = totalCustomers > 0 ? sum(customers, 'totalSpent') / totalCustomers : 0;

  return {
    totalCustomers,
    newCustomers: newCustomers.length,
    repeatCustomers: repeatCustomers.length,
    repeatRate: repeatRate.toFixed(1),
    avgLTV: avgLTV.toFixed(0),
    segments: {
      high: { count: highValue.length, revenue: sum(highValue, 'totalSpent') },
      medium: { count: mediumValue.length, revenue: sum(mediumValue, 'totalSpent') },
      low: { count: lowValue.length, revenue: sum(lowValue, 'totalSpent') },
    },
    frequencyDist,
    reEngagementCount: reEngagement.length,
    topCustomers: sorted.slice(0, 10),
  };
}

/**
 * Calculate cashflow metrics
 */
export function calculateCashflowMetrics(cashflow, dateRange) {
  const filtered = filterByDateRange(cashflow, dateRange);

  const revenue = filtered.filter(c => c.category === 'revenue');
  const refunds = filtered.filter(c => c.category === 'refund');
  const shipping = filtered.filter(c => c.category === 'shipping');

  const totalRevenue = sum(revenue, 'amount');
  const totalRefunds = Math.abs(sum(refunds, 'amount'));
  const totalShipping = Math.abs(sum(shipping, 'amount'));
  const netCashflow = totalRevenue - totalRefunds - totalShipping;
  const refundRate = totalRevenue > 0 ? (totalRefunds / totalRevenue * 100) : 0;

  // Monthly trend
  const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
  const monthlyTrend = months.map(month => {
    const monthStr = format(month, 'yyyy-MM');
    const monthItems = filtered.filter(c => c.date && format(c.date, 'yyyy-MM') === monthStr);
    const monthRevenue = sum(monthItems.filter(c => c.category === 'revenue'), 'amount');
    const monthRefunds = Math.abs(sum(monthItems.filter(c => c.category === 'refund'), 'amount'));
    const monthShipping = Math.abs(sum(monthItems.filter(c => c.category === 'shipping'), 'amount'));
    return {
      date: format(month, 'MMM yyyy'),
      revenue: monthRevenue,
      refunds: monthRefunds,
      shipping: monthShipping,
      net: monthRevenue - monthRefunds - monthShipping,
    };
  });

  return {
    totalRevenue,
    totalRefunds,
    totalShipping,
    netCashflow,
    refundRate: refundRate.toFixed(1),
    monthlyTrend,
  };
}

/**
 * Calculate WhatsApp campaign metrics
 */
export function calculateWhatsAppMetrics(campaigns) {
  const totalSent = sum(campaigns, 'sent');
  const totalDelivered = sum(campaigns, 'delivered');
  const totalRead = sum(campaigns, 'read');
  const totalClicked = sum(campaigns, 'clicked');
  const totalConversions = sum(campaigns, 'conversions');
  const totalRevenue = sum(campaigns, 'revenue');

  return {
    totalSent,
    totalDelivered,
    totalRead,
    totalClicked,
    totalConversions,
    totalRevenue,
    deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0,
    readRate: totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : 0,
    clickRate: totalRead > 0 ? ((totalClicked / totalRead) * 100).toFixed(1) : 0,
    conversionRate: totalClicked > 0 ? ((totalConversions / totalClicked) * 100).toFixed(1) : 0,
    campaigns: campaigns.sort((a, b) => b.revenue - a.revenue),
  };
}

// --- Helper Functions ---

export function filterByDateRange(data, dateRange, dateField = 'date') {
  if (!dateRange || !dateRange.start || !dateRange.end) return data;
  return data.filter(item => {
    const d = item[dateField];
    if (!d) return false;
    return isWithinInterval(d, { start: dateRange.start, end: dateRange.end });
  });
}

function getPreviousPeriod(dateRange) {
  if (!dateRange) return null;
  const days = differenceInDays(dateRange.end, dateRange.start);
  return {
    start: subDays(dateRange.start, days + 1),
    end: subDays(dateRange.start, 1),
  };
}

function sum(arr, field) {
  return arr.reduce((total, item) => total + (parseFloat(item[field]) || 0), 0);
}

function percentChange(prev, current) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return (((current - prev) / prev) * 100).toFixed(1);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('en-IN');
}
