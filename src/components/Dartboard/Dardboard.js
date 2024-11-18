import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { getTopSellingProducts } from '../../services/order_iteamServices';
import { getAllProducts } from '../../services/ProductService';
import { getAllOrder } from '../../services/OrderService';
import './index.css';

Chart.register(...registerables);

export default function Dashboard() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState({});
  const [activeTab, setActiveTab] = useState("revenue");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenueAllTime, setTotalRevenueAllTime] = useState(0);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [hourlyRevenueData, setHourlyRevenueData] = useState(Array(25).fill(0));
  const [dailyRevenueData, setDailyRevenueData] = useState(Array(8).fill(0));
  const [cancellationRateData, setCancellationRateData] = useState([0, 0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [fetchedRevenue, setFetchedRevenue] = useState(0);

  const fetchTopSellingProducts = async () => {
    try {
      const products = await getTopSellingProducts();
      console.log("Sản phẩm bán chạy:", products);
      setTopSellingProducts(products);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const products = await getAllProducts();
      const productMap = {};
      products.forEach(product => {
        productMap[product._id] = product.name;
      });
      console.log("Tất cả sản phẩm:", productMap);
      setAllProducts(productMap);
    } catch (error) {
      console.error("Lỗi khi lấy tất cả sản phẩm:", error);
    }
  };

  const fetchTotalRevenue = (orders) => {
    try {
      const deliveredOrders = orders.filter(order => order.status === "delivered");
      const revenue = deliveredOrders.reduce((total, order) => total + Number(order.total_amount), 0);
      console.log("Tổng doanh thu:", revenue);
      setTotalRevenue(revenue);
      setFetchedRevenue(revenue); // Cập nhật fetchedRevenue
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu tổng:", error);
    }
  };

  const fetchRevenueForCustomPeriod = async () => {
    const orders = await getAllOrder();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.updateAt);
      console.log(orderDate);

      return orderDate >= new Date(startDate + "T00:00:00") && orderDate <= new Date(endDate + "T23:59:59") && order.status === "delivered";
    });
    fetchTotalRevenue(filteredOrders);
  };


  const fetchTotalRevenueAllTime = async () => {
    const orders = await getAllOrder();
    const deliveredOrders = orders.filter(order => order.status === "delivered");
    const revenue = deliveredOrders.reduce((total, order) => total + Number(order.total_amount), 0);
    setTotalRevenueAllTime(revenue);
  };

  const fetchRevenueForToday = async () => {
    const orders = await getAllOrder();

    const today = new Date();
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear() &&
        order.status === "delivered";
    });
    fetchTotalRevenue(todayOrders);
  };

  const fetchHourlyRevenueForToday = async () => {
    const orders = await getAllOrder();
    const today = new Date();
    const hourlyRevenue = Array(24).fill(0);

    if (!orders || !Array.isArray(orders)) {
      console.error("No orders data available or data format is incorrect.");
      return;
    }

    orders.forEach(order => {
      const orderDate = new Date(order.updatedAt); // Sử dụng createdAt hoặc updatedAt, tùy theo trường hợp
      if (orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear() &&
        order.status === "delivered") {

        const hour = orderDate.getHours();
        hourlyRevenue[hour] += Number(order.total_amount) || 0; // Sử dụng giá trị của total_amount nếu có
      }
    });

    const totalRevenue = hourlyRevenue.reduce((acc, curr) => acc + curr, 0);
    setHourlyRevenueData([...hourlyRevenue, totalRevenue]);
    console.log("Hourly Revenue Data:", hourlyRevenue); // Kiểm tra dữ liệu doanh thu theo giờ
  };

  const fetchRevenueForWeek = async () => {
    const orders = await getAllOrder();
    console.log("Orders:", orders); // Kiểm tra dữ liệu trả về từ API

    const today = new Date();
    const startOfWeek = new Date();

    startOfWeek.setDate(today.getDate() - today.getDay());
    console.log("Start of the week:", startOfWeek, "Today:", today); // Kiểm tra giá trị startOfWeek và today

    if (!orders || !Array.isArray(orders)) {
      console.error("No orders data available or data format is incorrect.");
      return;
    }

    const weekOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt); // Sử dụng đúng trường updatedAt hoặc createdAt
      console.log("Order Date:", orderDate); // Kiểm tra từng ngày đặt hàng

      return orderDate >= startOfWeek && orderDate <= today && order.status === "delivered";
    });

    console.log("Filtered Week Orders:", weekOrders); // Kiểm tra đơn hàng đã được lọc

    fetchTotalRevenue(weekOrders);
    fetchDailyRevenueForWeek(weekOrders);
  };

  const fetchDailyRevenueForWeek = (orders) => {
    const dailyRevenue = Array(7).fill(0);
    const today = new Date();

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayDiff = today.getDay() - orderDate.getDay() + (today.getFullYear() - orderDate.getFullYear()) * 7;

      if (dayDiff >= 0 && dayDiff < 7) {
        dailyRevenue[(today.getDay() - dayDiff + 7) % 7] += Number(order.total_amount);
      }
    });

    const totalRevenue = dailyRevenue.reduce((acc, curr) => acc + curr, 0);
    setDailyRevenueData([...dailyRevenue, totalRevenue]);
  };





  const fetchMonthlyRevenueData = async () => {
    try {
      const orders = await getAllOrder();
      const deliveredOrders = orders.filter(order => order.status === "delivered");
      const monthlyRevenue = Array(12).fill(0);

      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.getMonth();
        monthlyRevenue[month] += Number(order.total_amount);
      });

      const totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr, 0);
      setMonthlyRevenueData([...monthlyRevenue, totalRevenue]);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu hàng tháng:", error);
    }
  };

  const fetchCancellationRateData = async () => {
    try {
      const orders = await getAllOrder();
      const deliveredOrders = orders.filter(order => order.status === "delivered").length;
      const canceledOrders = orders.filter(order => order.status === "canceled").length;

      setCancellationRateData([deliveredOrders, canceledOrders]);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tỉ lệ hủy nhận hàng:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchTotalRevenueAllTime();
    if (activeTab === "topProducts") {
      fetchTopSellingProducts();
    }
    if (activeTab === "revenue") {
      fetchTotalRevenue();
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
              <label>
                Doanh thu lấy được:
              </label>
              <h3>{fetchedRevenue.toLocaleString()} VND</h3> {/* Hiển thị doanh thu lấy được */}
            </div>
            <h3>Tổng doanh thu: {totalRevenueAllTime.toLocaleString()} VND</h3>
            <br></br>
            <h3>DOANH THU NGAY HÔM NAY</h3>
            <Bar
              data={{
                labels: [...Array(24).fill().map((_, i) => `${i}h`), 'Tổng'], // thêm 'Tổng' vào labels
                datasets: [
                  {
                    label: 'Doanh thu theo giờ',
                    data: [...hourlyRevenueData, totalRevenue], // sử dụng mảng có tổng
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
            <br></br>
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
                console.log(`Product ID: ${product._id}, Product Name: ${productName}`);
                return (
                  <li key={product._id}>
                    {/* Hiển thị biểu tượng cúp tương ứng với vị trí và màu sắc */}
                    {index === 0 && (
                      <img
                        src="https://img.icons8.com/color/480/trophy.png" // Cúp vàng
                        alt="Cúp vàng"
                        className={`trophy-icon trophy-gold`}
                      />
                    )}
                    {index === 1 && (
                      <img
                        src="https://img.pikbest.com/png-images/20240606/silver-trophy-cup_10600171.png!w700wp" // Cúp bạc
                        alt="Cúp bạc"
                        className={`trophy-icon trophy-silver`}
                      />
                    )}
                    {index === 2 && (
                      <img
                        src="https://img.lovepik.com/free-png/20220120/lovepik-silver-trophy-png-image_401543541_wh860.png" // Cúp đồng
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
          <div style={{ width: '600px', height: '700px', margin: '0 auto' }}>
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
          </div>
        )}
      </div>
    </div>
  );
}