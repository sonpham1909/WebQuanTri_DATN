import React, { useEffect, useState } from 'react';
import { Button, Input, Space, Table, Tag } from 'antd';
import { getAllOrder } from '../../services/OrderService';
import LoadingCo from '../loading/loading';
import { SearchOutlined } from '@ant-design/icons';
import CreateOrderForm from './Create_Order';
import { render } from '@testing-library/react';

const OrderManager = () => {
  const [allOrders, setAllOrders] = useState([]); // lưu toàn bộ danh sách đơn hàng
  const [orders, setOrders] = useState([]); // lưu danh sách đơn hàng hiển thị
  const [loading, setLoading] = useState(false);
  const [isVisitModalCreate, setIsVisitModalCreate] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("pending");

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await getAllOrder();
      setAllOrders(res); // lưu toàn bộ dữ liệu đơn hàng vào allOrders
      const orderFirst = res.filter(order => order.status === "pending");
      console.log('order pending: ',orderFirst);
      
      setOrders(orderFirst);
     
    } catch (error) {
      console.error('Error fetching order', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
   
  }, []);

  const handleCreateOrder = async () => {
    await fetchOrder();
    setIsVisitModalCreate(false);
  };

  const handleClick = (status) => {
    setCurrentStatus(status.label);
    const filteredOrders = allOrders.filter(order => order.status === status.label); // Lọc theo trạng thái
    setOrders(filteredOrders);
    console.log('Selected status:', status.label);
  };

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
      title: 'Email khách hàng',
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
    {
      title:'Xác nhận',
      render: (text, record) => (
        <div>
          <Button>
            Xác nhận
          </Button>
        </div>
      )
    }
  ];

  const handleOnCancelCreate = () => {
    setIsVisitModalCreate(false);
  };

  const statusList = [
    { label: 'pending', color: 'blue' },
    { label: 'Đang chờ lấy hàng', color: 'orange' },
    { label: 'Đang giao hàng', color: 'purple' },
    { label: 'Đã giao hàng', color: 'green' },
    { label: 'canceled', color: 'red' },
    { label: 'Đã thanh toán', color: 'gold' }
  ];

  if (loading) {
    return <LoadingCo />;
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
          style={{ width: 180 }}
          className="buttonAdd"
          onClick={() => setIsVisitModalCreate(true)}
        >
          Tạo đơn hàng mới
        </Button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'left', gap: '10px' }}>
        {statusList.map((status) => (
          <Button
            key={status.label}
            type={currentStatus === status.label ? 'primary' : 'default'}
            onClick={() => handleClick(status)}
            style={{
              backgroundColor: currentStatus === status.label ? status.color : '',
              width: '15%'
            }}
          >
            {status.label}
          </Button>
        ))}
      </div>
      {currentStatus && <p>Trạng thái hiện tại: {currentStatus}</p>}

      <Table dataSource={orders} columns={columns} rowKey="_id" />

      <CreateOrderForm
        isVisitable={isVisitModalCreate}
        onCancle={handleOnCancelCreate}
        onCreate={handleCreateOrder}
      />
    </div>
  );
};

export default OrderManager;
