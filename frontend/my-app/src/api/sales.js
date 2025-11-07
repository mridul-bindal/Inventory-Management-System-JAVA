import { fetchOrders } from './orders';
import { fetchProducts } from './products';

/**
 * Get comprehensive sales statistics and analytics
 */
export const getSalesData = async () => {
  try {
    // Fetch all orders and products
    const [orders, products] = await Promise.all([
      fetchOrders({ q: '', status: 'All', payment: 'All' }),
      fetchProducts('')
    ]);

    // Helper to parse date
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        // Handle MM/DD/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }
      return new Date(dateStr);
    };

    // Helper to check if dates are on the same day
    const sameDay = (a, b) => {
      if (!a || !b) return false;
      const dateA = a instanceof Date ? a : parseDate(a);
      const dateB = b instanceof Date ? b : parseDate(b);
      if (!dateA || !dateB || isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return false;
      return dateA.getFullYear() === dateB.getFullYear() &&
             dateA.getMonth() === dateB.getMonth() &&
             dateA.getDate() === dateB.getDate();
    };

    // Calculate revenue for an order
    const getOrderRevenue = (order) => {
      if (order.costPer && order.items) {
        return Number(order.costPer) * Number(order.items);
      }
      return Number(order.totalAmount || 0);
    };

    const now = new Date();

    // Today's metrics
    const todayOrders = orders.filter(o => {
      const orderDate = parseDate(o.date);
      return orderDate && sameDay(orderDate, now);
    });

    const todaysSalesCount = todayOrders.reduce((sum, o) => sum + (Number(o.items) || 0), 0);
    const todaysOrdersCount = todayOrders.length;
    const todaysRevenue = todayOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
    const todaysProfit = todayOrders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
    const todaysCustomers = new Set(todayOrders.map(o => (o.customer || '').trim()).filter(Boolean)).size;

    // Last 7 days data
    const dayRange = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dayRange.push(d);
    }

    const dayAgg = dayRange.map(d => {
      const label = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      const dayOrders = orders.filter(o => {
        const orderDate = parseDate(o.date);
        return orderDate && sameDay(orderDate, d);
      });
      const ordersCount = dayOrders.length;
      const revenue = dayOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
      const profit = dayOrders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
      return { date: d, label, ordersCount, revenue, profit };
    });

    // Payment method breakdown
    const paymentMap = orders.reduce((acc, o) => {
      const method = (o.payment || 'Unknown').toString();
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    const paymentEntries = Object.entries(paymentMap)
      .map(([key, count]) => ({
        method: key,
        count,
        percentage: Math.round((count / Math.max(1, orders.length)) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Channel breakdown
    const channelMap = orders.reduce((acc, o) => {
      const channel = (o.channel || 'Unknown').toString();
      if (!acc[channel]) {
        acc[channel] = { count: 0, revenue: 0, profit: 0 };
      }
      acc[channel].count += 1;
      acc[channel].revenue += getOrderRevenue(o);
      acc[channel].profit += Number(o.profit) || 0;
      return acc;
    }, {});
    const channelEntries = Object.entries(channelMap)
      .map(([key, data]) => ({
        channel: key,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Top revenue days (last 7 days)
    const topDays = [...dayAgg]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales by product
    const productSalesMap = {};
    orders.forEach(order => {
      if (order.productId && order.items) {
        const productId = order.productId;
        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId,
            productName: order.productName || productId,
            totalQty: 0,
            totalRevenue: 0,
            totalProfit: 0,
            orderCount: 0
          };
        }
        productSalesMap[productId].totalQty += Number(order.items) || 0;
        productSalesMap[productId].totalRevenue += getOrderRevenue(order);
        productSalesMap[productId].totalProfit += Number(order.profit) || 0;
        productSalesMap[productId].orderCount += 1;
      }
    });
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Status breakdown
    const statusMap = orders.reduce((acc, o) => {
      const status = (o.status || 'Unknown').toString();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const statusEntries = Object.entries(statusMap)
      .map(([key, count]) => ({
        status: key,
        count,
        percentage: Math.round((count / Math.max(1, orders.length)) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Total metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
    const totalProfit = orders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
    const totalCustomers = new Set(orders.map(o => (o.customer || '').trim()).filter(Boolean)).size;
    const totalItemsSold = orders.reduce((sum, o) => sum + (Number(o.items) || 0), 0);

    // Monthly overview (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = orders.filter(o => {
        const orderDate = parseDate(o.date);
        if (!orderDate || isNaN(orderDate.getTime())) return false;
        return orderDate.getFullYear() === date.getFullYear() &&
               orderDate.getMonth() === date.getMonth();
      });
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0),
        profit: monthOrders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0)
      });
    }

    return {
      today: {
        salesCount: todaysSalesCount,
        ordersCount: todaysOrdersCount,
        revenue: todaysRevenue,
        profit: todaysProfit,
        customers: todaysCustomers
      },
      totals: {
        orders: totalOrders,
        revenue: totalRevenue,
        profit: totalProfit,
        customers: totalCustomers,
        itemsSold: totalItemsSold
      },
      last7Days: dayAgg,
      topDays,
      paymentMethods: paymentEntries,
      channels: channelEntries,
      topProducts,
      statusBreakdown: statusEntries,
      monthlyData
    };
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

