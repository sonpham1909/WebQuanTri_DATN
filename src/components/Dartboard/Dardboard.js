import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { getTopSellingProducts } from '../../services/order_iteamServices';
import { getAllProducts } from '../../services/ProductService';
import { getAllOrder } from '../../services/OrderService';
import { getAllUsers } from '../../services/UserService';
import './index.css';

import io from 'socket.io-client';

// Thay đổi URL này để phù hợp với server của bạn
const socket = io('http://localhost:3000', {
  transports: ['websocket'], // Sử dụng websocket để giảm độ trễ
  jsonp: false,
});

Chart.register(...registerables);

export default function Dashboard() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState({});
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("revenue");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenueAllTime, setTotalRevenueAllTime] = useState(0);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [hourlyRevenueData, setHourlyRevenueData] = useState(Array(25).fill(0));
  const [dailyRevenueData, setDailyRevenueData] = useState(Array(7).fill(0));
  const [cancellationRateData, setCancellationRateData] = useState([0, 0]);
  const [topCancelUsers, setTopCancelUsers] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [fetchedRevenue, setFetchedRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDeliveredOrders, setTotalDeliveredOrders] = useState(0);
  
  // New state variables for order statistics
  const [totalOrdersToday, setTotalOrdersToday] = useState(0);
  const [totalOrdersThisMonth, setTotalOrdersThisMonth] = useState(0);
  const [totalOrdersThisYear, setTotalOrdersThisYear] = useState(0);
  const [customFetchedRevenue, setCustomFetchedRevenue] = useState(0);
  const [customTotalOrders, setCustomTotalOrders] = useState(0);
  
  const fetchTopSellingProducts = async () => {
    try {
      const products = await getTopSellingProducts();
      setTopSellingProducts(products);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
    }
  };

  const fetchTotalRevenueForToday = async () => {
    const orders = await getAllOrder();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt);
      return orderDate >= startOfToday && orderDate < endOfToday && order.status === "delivered";
    });

    fetchTotalRevenue(todayOrders);
  };

  const fetchOrdersForStatistics = async () => {
    const orders = await getAllOrder();
    const today = new Date();
  
    // Tổng số đơn hàng hôm nay
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt);
      return orderDate >= startOfToday && orderDate < endOfToday && order.status === "delivered"; // Lọc đơn hàng giao thành công
    });
    setTotalOrdersToday(todayOrders.length);
  
    // Tổng số đơn hàng trong tháng
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt);
      return orderDate >= startOfMonth && orderDate < new Date(today.getFullYear(), today.getMonth() + 1, 1) && order.status === "delivered"; // Lọc đơn hàng giao thành công
    });
    setTotalOrdersThisMonth(monthlyOrders.length);
  
    // Tổng số đơn hàng trong năm
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const yearlyOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt);
      return orderDate >= startOfYear && orderDate < new Date(today.getFullYear() + 1, 0, 1) && order.status === "delivered"; // Lọc đơn hàng giao thành công
    });
    setTotalOrdersThisYear(yearlyOrders.length);
  };

  const fetchRevenueForCustomPeriod = async () => {
    const orders = await getAllOrder();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt);
      return orderDate >= new Date(startDate + "T00:00:00") 
          && orderDate <= new Date(endDate + "T23:59:59") 
          && order.status === "delivered";
    });

    const revenue = filteredOrders.reduce((total, order) => total + Number(order.total_amount), 0);
    
    setCustomFetchedRevenue(revenue);
    setCustomTotalOrders(filteredOrders.length);
  };

  const fetchAllProducts = async () => {
    try {
      const products = await getAllProducts();
      const productMap = {};
      products.forEach(product => {
        productMap[product._id] = product.name;
      });
      setAllProducts(productMap);
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  };

  const fetchTotalRevenue = (orders) => {
    const deliveredOrders = orders.filter(order => order.status === "delivered");
    const revenue = deliveredOrders.reduce((total, order) => total + Number(order.total_amount), 0);
    
    setTotalOrders(deliveredOrders.length);
    setTotalRevenue(revenue);
  };

  const fetchAllUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const fetchTotalRevenueAllTime = async () => {
    const orders = await getAllOrder();
    const deliveredOrders = orders.filter(order => order.status === "delivered");
    const revenue = deliveredOrders.reduce((total, order) => total + Number(order.total_amount), 0);

    setTotalOrders(deliveredOrders.length);
    setTotalRevenueAllTime(revenue);
  };

  const fetchTotalDeliveredOrders = async () => {
    const orders = await getAllOrder();
    const deliveredOrdersCount = orders.filter(order => order.status === "delivered").length;
    setTotalDeliveredOrders(deliveredOrdersCount);
  };

  const fetchHourlyRevenueForToday = async () => {
    const orders = await getAllOrder();
    const today = new Date();
    const hourlyRevenue = Array(24).fill(0);

    orders.forEach(order => {
      const orderDate = new Date(order.updatedAt);
      if (orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear() &&
          order.status === "delivered") {
        const hour = orderDate.getHours();
        hourlyRevenue[hour] += Number(order.total_amount) || 0;
      }
    });

    const totalRevenue = hourlyRevenue.reduce((acc, curr) => acc + curr, 0);
    setHourlyRevenueData([...hourlyRevenue, totalRevenue]);
  };

  const fetchMonthlyRevenueData = async () => {
    const orders = await getAllOrder();
    const monthlyRevenue = Array(12).fill(0);

    orders.forEach(order => {
      const orderDate = new Date(order.updatedAt);
      if (order.status === "delivered") {
        const month = orderDate.getMonth();
        monthlyRevenue[month] += Number(order.total_amount);
      }
    });

    const totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr, 0);
    setMonthlyRevenueData([...monthlyRevenue, totalRevenue]);
  };

  const fetchCancellationRateData = async () => {
    const orders = await getAllOrder();
    const deliveredOrdersCount = orders.filter(order => order.status === "delivered").length;
    const canceledOrdersCount = orders.filter(order => order.status === "canceled").length;

    setCancellationRateData([deliveredOrdersCount, canceledOrdersCount]);

    const userCancellationCounts = {};
    orders.forEach(order => {
      if (order.status === "canceled" && order.user_id) {
        const userId = order.user_id._id.toString();
        userCancellationCounts[userId] = (userCancellationCounts[userId] || 0) + 1;
      }
    });

    const sortedUsers = Object.entries(userCancellationCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);

    const topUsersWithNames = sortedUsers.map(([userId, count]) => {
      const user = users.find(u => u._id.toString() === userId);
      return {
        userId,
        userName: user ? user.username : 'Unknown',
        canceledCount: count,
      };
    });

    setTopCancelUsers(topUsersWithNames);
  };

  const fetchDailyRevenueForWeek = (orders) => {
    const dailyRevenue = Array(7).fill(0);
    const today = new Date();
    const todayDay = today.getDay();

    orders.forEach(order => {
      const orderDate = new Date(order.updatedAt);
      const orderDay = orderDate.getDay();

      if (orderDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDay) && order.status === "delivered") {
        dailyRevenue[orderDay] += Number(order.total_amount);
      }
    });

    const totalRevenue = dailyRevenue.reduce((acc, curr) => acc + curr, 0);
    setDailyRevenueData([...dailyRevenue, totalRevenue]);
  };

  const fetchRevenueForWeek = async () => {
    const orders = await getAllOrder();
    fetchDailyRevenueForWeek(orders);
  };

  useEffect(() => {
    fetchAllProducts();
    fetchAllUsers();
    fetchTotalRevenueAllTime();
    fetchTotalDeliveredOrders(); // New line
    fetchOrdersForStatistics(); // New line

    if (activeTab === "topProducts") {
      fetchTopSellingProducts();
    }
    if (activeTab === "revenue") {
      fetchTotalRevenueForToday();
      fetchMonthlyRevenueData();
      fetchHourlyRevenueForToday();
      fetchRevenueForWeek();
    }
    if (activeTab === "cancellationRate") {
      fetchCancellationRateData();
    }
  }, [activeTab]);

  return (
    <div>
      <h1>Thống kê</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab("revenue")}>Doanh thu</button>
        <button onClick={() => setActiveTab("topProducts")}>Sản phẩm bán chạy</button>
        <button onClick={() => setActiveTab("cancellationRate")}>Tỉ lệ hủy nhận hàng</button>
      </div>

      <div className="tab-content">
        {activeTab === "revenue" && (
          <div>
            <h2>Doanh thu</h2>
            <div>
              <label>
                Ngày bắt đầu:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                Ngày kết thúc:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <button onClick={fetchRevenueForCustomPeriod}>Lấy doanh thu</button>
              <br />
              <label>Doanh thu lấy được:</label>
              <h3>{customFetchedRevenue.toLocaleString()} VND/{customTotalOrders} Đơn hàng</h3>
            </div>
            <h3>Tổng doanh thu: {totalRevenueAllTime > 0 ? totalRevenueAllTime.toLocaleString() : "Chưa có dữ liệu"} VND</h3>
            <h3>Tổng số đơn hàng đã giao thành công: {totalDeliveredOrders}</h3>
            <h3>Tổng số đơn hàng hôm nay: {totalOrdersToday}</h3> {/* New line */}
            <h3>Tổng số đơn hàng trong tháng: {totalOrdersThisMonth}</h3> {/* New line */}
            <h3>Tổng số đơn hàng trong năm: {totalOrdersThisYear}</h3> {/* New line */}
            <br />
            <h3>DOANH THU NGÀY HÔM NAY</h3>
            <Bar
              data={{
                labels: [...Array(24).fill().map((_, i) => `${i}h`), 'Tổng'],
                datasets: [
                  {
                    label: 'Doanh thu theo giờ',
                    data: [...hourlyRevenueData, hourlyRevenueData.reduce((acc, curr) => acc + curr, 0)],
                    backgroundColor: hourlyRevenueData.map((_, index) => index === 24 ? 'rgba(0, 128, 0, 0.6)' : 'rgba(153, 102, 255, 0.6)'),
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
            <br />
            <h3>DOANH THU TUẦN NAY</h3>
            <Bar
              data={{
                labels: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Tổng'],
                datasets: [
                  {
                    label: 'Doanh thu theo ngày',
                    data: dailyRevenueData,
                    backgroundColor: dailyRevenueData.map((_, index) => index === 7 ? 'rgba(0, 128, 0, 0.6)' : 'rgba(255, 99, 132, 0.6)'),
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
            <h3>DOANH THU NĂM NAY</h3>
            <Bar
              data={{
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tổng'],
                datasets: [
                  {
                    label: 'Doanh thu hàng tháng',
                    data: monthlyRevenueData,
                    backgroundColor: monthlyRevenueData.map((_, index) => index === 12 ? 'rgba(0, 128, 0, 0.6)' : 'rgba(75, 192, 192, 0.6)'),
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        )}

        {activeTab === "topProducts" && (
          <div>
            <h2>Sản phẩm bán chạy nhất</h2>
            <ul className="top-products-list">
              {topSellingProducts.map((product, index) => {
                const productName = allProducts[product._id];
                return (
                  <li key={product._id}>
                    {index === 0 && (
                      <img
                        src="https://img.icons8.com/color/480/trophy.png"
                        alt="Cúp vàng"
                        className={`trophy-icon trophy-gold`}
                      />
                    )}
                    {index === 1 && (
                      <img
                        src="https://img.pikbest.com/png-images/20240606/silver-trophy-cup_10600171.png!w700wp"
                        alt="Cúp bạc"
                        className={`trophy-icon trophy-silver`}
                      />
                    )}
                    {index === 2 && (
                      <img
                        src="https://img.lovepik.com/free-png/20220120/lovepik-silver-trophy-png-image_401543541_wh860.png"
                        alt="Cúp đồng"
                        className={`trophy-icon trophy-bronze`}
                      />
                    )}
                    <span style={{ marginRight: '5px' }}>{index > 2 ? index + 1 : ''}.</span>
                    {productName || "Sản phẩm không xác định"} -
                    Tổng số lượng bán: {product.totalQuantity || 0} -
                    Tổng doanh thu: {product.totalAmount ? product.totalAmount.toLocaleString() : '0'} VND
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeTab === "cancellationRate" && (
          <div style={{ width: '600px', margin: '0 auto' }}>
            <h2>Tỉ lệ hủy nhận hàng</h2>
            <Pie
              data={{
                labels: ['Đơn hàng giao thành công', 'Đơn hàng bị hủy'],
                datasets: [{
                  data: cancellationRateData,
                  backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />

            <h3>Người dùng có tỷ lệ hủy hàng nhiều nhất</h3>
            <ul>
              {topCancelUsers.length === 0 ? (
                <li>Không có người dùng nào hủy đơn hàng.</li>
              ) : (
                topCancelUsers.map(({ userId, userName, canceledCount }) => (
                  <li key={userId}>
                    Người dùng ID: {userId} - Tên: {userName} - Số lượng đơn hàng bị hủy: {canceledCount}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}