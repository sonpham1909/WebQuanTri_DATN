import React, { useEffect, useState } from 'react';
import { Button, Input, Space, Table, Tag } from 'antd';
import { getAllOrder } from '../../services/OrderService';
import LoadingCo from '../loading/loading';
import { SearchOutlined } from '@ant-design/icons';
import CreateOrderForm from './Create_Order';

// Dữ liệu mẫu


const OrderManager = () => {


  const [orders, setorders] = useState([]);
  const [loading, setloading] = useState(false);
  const [IsVisitModalCreate, seTIsVisitModalCreate] = useState(false);

  const fetchOrder = async () => {
    setloading(true);

    try {
      const res = await getAllOrder();
      setorders(res);
      setloading(false);
    } catch (error) {
      console.error('Error fetching order', error);
      setloading(false);

    }

  }

  useEffect(() => {
    fetchOrder();

  }, []);

  const handleCreateOrder = async (newOrder) => {
    // Nếu cần, bạn có thể cập nhật orders trực tiếp
    // Hoặc chỉ cần gọi lại fetchOrder
    await fetchOrder(); // Gọi hàm fetchOrder để lấy lại danh sách đơn hàng mới
    seTIsVisitModalCreate(false);
};



  // Cột cho bảng
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'email khách hàng',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại người nhận',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
    },
    {
      title: 'Tổng giá tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (price) => `${price.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case 'pending':
            color = 'blue';
            break;
          case 'Đang chờ shipper':
            color = 'orange';
            break;
          case 'Đang giao hàng':
            color = 'purple';
            break;
          case 'Đã nhận hàng':
            color = 'green';
            break;
          case 'canceled':
            color = 'red';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const handleOncancleCreate = ()=>{
    seTIsVisitModalCreate(false);
  }
  const statusList = [
    { label: 'Đang chờ xử lý', color: 'blue' },
    { label: 'Đang chờ lấy hàng', color: 'orange' },
    { label: 'Đang giao hàng', color: 'purple' },
    { label: 'Đã giao hàng', color: 'green' },
    { label: 'Đã hủy', color: 'red' },
    { label: 'Đã thanh toán', color: 'gold' }
  ];
  
  
    const [currentStatus, setCurrentStatus] = useState("Đang chờ xử lý");
  
    const handleClick = (status) => {
      setCurrentStatus(status.label);
      // Xử lý logic khi nhấn nút, ví dụ: gọi API để cập nhật trạng thái
      console.log('Selected status:', status.label);
    };
  

  if (loading) {
    return <LoadingCo />
  }

  return (
    <div>
      <Input
        placeholder="Tìm kiếm đơn hàng"

        prefix={<SearchOutlined />}
        style={{ marginBottom: '20px', width: '300px' }}
      />
      <div className="headerPage">
        <h3 className="titlepage">Quản lý đơn hàng</h3>
        <p>Tổng: {orders.length} đơn hàng</p>
        <Button
        style={{width:180}}
         className="buttonAdd"
          onClick={() => seTIsVisitModalCreate(true)}
        >Tạo đơn hàng mới mới</Button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'left', gap: '10px' }}> {/* Flexbox để căn ngang */}
        {statusList.map((status) => (
          <Button
            key={status.label}
            type={currentStatus === status.label ? 'primary' : 'default'}
            onClick={() => handleClick(status)}
            style={{ backgroundColor: currentStatus === status.label ? status.color : '',
              width:'15%'
             }}
          >
            {status.label}
          </Button>
        ))}
      </div>
      {currentStatus && <p>Trạng thái hiện tại: {currentStatus}</p>}
    

      <Table dataSource={orders} columns={columns} rowKey="_id" />

      
      <CreateOrderForm isVisitable={IsVisitModalCreate} onCancle={handleOncancleCreate} onCreate={handleCreateOrder}/>
    </div>
  );
};

export default OrderManager;
