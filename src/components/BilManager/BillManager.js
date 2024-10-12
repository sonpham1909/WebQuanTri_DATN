import React, { useState } from 'react';
import { Table, Tag } from 'antd';

// Dữ liệu mẫu
const sampleOrders = [
  { _id: '1', orderCode: 'DH001', customerName: 'Nguyễn Văn A', totalPrice: 1500000, status: 'Đang chờ xác nhận' },
  { _id: '2', orderCode: 'DH002', customerName: 'Trần Thị B', totalPrice: 2000000, status: 'Đang chờ shipper' },
  { _id: '3', orderCode: 'DH003', customerName: 'Lê Văn C', totalPrice: 3000000, status: 'Đang giao hàng' },
  { _id: '4', orderCode: 'DH004', customerName: 'Phạm Thị D', totalPrice: 5000000, status: 'Đã nhận hàng' },
  { _id: '5', orderCode: 'DH005', customerName: 'Đỗ Văn E', totalPrice: 800000, status: 'Đã hủy' },
  { _id: '6', orderCode: 'DH006', customerName: 'Nguyễn Thị F', totalPrice: 1200000, status: 'Đang chờ xác nhận' },
  { _id: '7', orderCode: 'DH007', customerName: 'Trần Văn G', totalPrice: 900000, status: 'Đang chờ shipper' },
  { _id: '8', orderCode: 'DH008', customerName: 'Hoàng Thị H', totalPrice: 2500000, status: 'Đang giao hàng' },
  { _id: '9', orderCode: 'DH009', customerName: 'Nguyễn Văn I', totalPrice: 1800000, status: 'Đã nhận hàng' },
  { _id: '10', orderCode: 'DH010', customerName: 'Phạm Thị K', totalPrice: 4000000, status: 'Đã hủy' },
];

const OrderManager = () => {
  const [orders] = useState(sampleOrders);

  // Cột cho bảng
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tổng giá tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `${price.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case 'Đang chờ xác nhận':
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
          case 'Đã hủy':
            color = 'red';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <h2>Danh sách đơn hàng</h2>
      <Table dataSource={orders} columns={columns} rowKey="_id" />
    </div>
  );
};

export default OrderManager;
