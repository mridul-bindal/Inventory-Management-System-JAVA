import { fetchOrders } from './orders';
import { fetchProducts } from './products';

/**
 * Calculate dashboard statistics from orders and products
 */
export const getDashboardStats = async () => {
  try {
    // Fetch all orders and products
    const [orders, products] = await Promise.all([
      fetchOrders({ q: '', status: 'All', payment: 'All' }),
      fetchProducts('')
    ]);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => {
      // Calculate revenue from costPer * items, or use totalAmount if available
      const amount = order.costPer && order.items
        ? Number(order.costPer) * Number(order.items)
        : (typeof order.totalAmount === 'object'
          ? parseFloat(order.totalAmount?.$numberDecimal || order.totalAmount?.toString() || '0')
          : Number(order.totalAmount || 0));
      return sum + amount;
    }, 0);

    const totalProfit = orders.reduce((sum, order) => {
      return sum + (Number(order.profit) || 0);
    }, 0);

    const totalOrders = orders.length;
    const totalProducts = products.length;

    // Calculate completed vs pending orders
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // Low stock products (qty < 10)
    const lowStockProducts = products.filter(p => (p.qty || 0) < 10);

    // Recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Top selling products (by quantity sold)
    const productSales = {};
    orders.forEach(order => {
      if (order.productId && order.items) {
        if (!productSales[order.productId]) {
          productSales[order.productId] = {
            productId: order.productId,
            productName: order.productName || order.productId,
            totalQty: 0,
            totalRevenue: 0
          };
        }
        productSales[order.productId].totalQty += Number(order.items) || 0;
        // Calculate revenue from costPer * items
        const revenue = order.costPer && order.items
          ? Number(order.costPer) * Number(order.items)
          : (typeof order.totalAmount === 'object'
            ? parseFloat(order.totalAmount?.$numberDecimal || order.totalAmount?.toString() || '0')
            : Number(order.totalAmount || 0));
        productSales[order.productId].totalRevenue += revenue;
      }
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    // Monthly overview data (last 6 months)
    const monthlyData = getMonthlyOverview(orders);

    return {
      metrics: {
        totalRevenue,
        totalProfit,
        totalOrders,
        totalProducts,
        completedOrders,
        pendingOrders
      },
      lowStockProducts,
      recentOrders,
      topSellingProducts,
      monthlyData
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Calculate monthly revenue and profit for the last 6 months
 */
function getMonthlyOverview(orders) {
  const months = [];
  const now = new Date();
  
  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
      revenue: 0,
      profit: 0
    });
  }

  // Group orders by month
  orders.forEach(order => {
    if (!order.date) return;
    const orderDate = new Date(order.date);
    if (isNaN(orderDate.getTime())) return; // Skip invalid dates
    
    const monthIndex = orderDate.getMonth();
    const year = orderDate.getFullYear();
    
    const monthData = months.find(m => m.monthIndex === monthIndex && m.year === year);
    if (monthData) {
      // Calculate revenue from costPer * items, or use totalAmount if available
      const revenue = order.costPer && order.items
        ? Number(order.costPer) * Number(order.items)
        : (typeof order.totalAmount === 'object'
          ? parseFloat(order.totalAmount?.$numberDecimal || order.totalAmount?.toString() || '0')
          : Number(order.totalAmount || 0));
      monthData.revenue += revenue;
      monthData.profit += Number(order.profit) || 0;
    }
  });

  return months;
}

