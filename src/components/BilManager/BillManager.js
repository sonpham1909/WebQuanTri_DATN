import React, { useEffect, useState } from 'react';
import { Button, Input, message, Modal, Space, Table, Tag } from 'antd';
import { ChangeStatusOrder, getAllOrder, cancelOrder } from '../../services/OrderService';
import LoadingCo from '../loading/loading';
import { SearchOutlined } from '@ant-design/icons';
import CreateOrderForm from './Create_Order';
import { getOrderItemsByOrderId } from '../../services/order_iteamServices';
import './index.css';

const OrderManager = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisitModalCreate, setIsVisitModalCreate] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("pending");
  const [isModalChangeStatus, setIsModalChangeStatus] = useState(false);
  const [selectedOrderChange, setSelectedOrderChange] = useState('');
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [isOrderItemsModalVisible, setIsOrderItemsModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelReasonModalVisible, setIsCancelReasonModalVisible] = useState(false); // New state for cancellation reason modal

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await getAllOrder();
      setAllOrders(res);

      const orderFirst = res.filter(order => order.status === currentStatus);
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
    setIsVisitModalCreate(true);
  };

  const handleClick = (status) => {
    setCurrentStatus(status.label);
    const filteredOrders = allOrders.filter(order => order.status === status.label);
    setOrders(filteredOrders);
  };

  const handleClickOrderChange = (orderId) => {
    setSelectedOrderChange(orderId);
    setIsModalChangeStatus(true);
  };

  const handleSubmitChangeStatus = async () => {
    let statusChange = currentStatus;
    switch (currentStatus) {
      case 'pending':
        statusChange = 'ready_for_shipment';
        break;
      case 'ready_for_shipment':
        statusChange = 'shipping';
        break;
      case 'shipping':
        statusChange = 'delivered';
        break;
      case 'waiting_cancel':
        statusChange = 'canceled'; // Chuyển trực tiếp sang 'canceled'
        break;
      default:
        console.log('Không thấy status');
        return;
    }

    try {
      await ChangeStatusOrder(selectedOrderChange, statusChange);
      message.success('Xác nhận thành công');
      await fetchOrder();
      setIsModalChangeStatus(false);
      setSelectedOrderChange('');
    } catch (error) {
      message.error('Thay đổi không thành công');
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const items = await getOrderItemsByOrderId(orderId);
      const order = allOrders.find(order => order._id === orderId);
      setSelectedOrder(order);
      setSelectedOrderItems(items);
      setCurrentOrderId(orderId);
      setIsOrderItemsModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi lấy Order Items');
    }
  };

  const handleOrderClick = (orderId) => {
    fetchOrderItems(orderId);
  };

  const closeOrderItemsModal = () => {
    setIsOrderItemsModalVisible(false);
    setSelectedOrderItems([]);
    setCurrentOrderId(null);
  };

  const handleOnCancelCreate = () => {
    setIsVisitModalCreate(false);
  };

  // New function to handle order cancellation
  const handleCancelOrder = () => {
    setIsCancelReasonModalVisible(true); // Open modal for cancellation reason input
  };


  const closeCancelReasonModal = () => {
    setIsCancelReasonModalVisible(false);
    setCancelReason(''); // Reset reason
  };
  const handleConfirmCancelOrder = async () => {
    if (!currentOrderId) {
      message.error('Không có ID đơn hàng');
      return;
    }

    const reason = String(cancelReason).trim(); // Chuyển lý do thành chuỗi và loại bỏ khoảng trắng
    console.log("Lý do hủy đơn hàng:", reason); // Log lý do hủy

    if (!reason) {
      message.error('Vui lòng nhập lý do huỷ đơn hàng');
      return;
    }

    try {
      const response = await cancelOrder(currentOrderId, reason); // Gọi hàm cancelOrder
      console.log("Response từ cancelOrder:", response); // Log phản hồi
      message.success('Đơn hàng đã được huỷ thành công');
      await fetchOrder(); // Cập nhật danh sách đơn hàng
      closeOrderItemsModal(); // Đóng modal nếu cần
      closeCancelReasonModal(); // Đóng modal lý do hủy
    } catch (error) {
      console.error("Lỗi khi huỷ đơn hàng:", error);
      const errorMessage = error.response?.data?.error || 'Huỷ đơn hàng không thành công';
      message.error(errorMessage);
    }
  };
  const statusList = [
    { label: 'pending', color: 'blue' },
    { label: 'ready_for_shipment', color: 'orange' },
    { label: 'shipping', color: 'purple' },
    { label: 'delivered', color: 'green' },
    { label: 'canceled', color: 'red' },
    { label: 'waiting_cancel', color: 'red' },
  ];

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
      title: 'Trạng thái thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (payment_status) => (
        <p>
          {payment_status === 'pending'
            ? 'Đang chờ xử lý'
            : payment_status === 'paid'
            ? 'Đã thanh toán'
            : payment_status === 'unpaid'
            ? <>
                Thanh toán khi <br /> nhận hàng
              </>
            : payment_status === 'failed'
            ? 'Thanh toán thất bại'
            : payment_status === 'cancelled'
            ? 'Thanh toán bị từ chối'
            : 'Không xác định'}
        </p>
      )
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
          case 'ready_for_shipment':
            color = 'orange';
            break;
          case 'shipping':
            color = 'purple';
            break;
          case 'delivered':
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
      title: 'Xác nhận',
      render: (text, record) => (
        <Button
          onClick={() => handleClickOrderChange(record._id)}
          disabled={record.status === 'canceled' || record.status === 'delivered'}
        >
          Xác nhận
        </Button>
      )
    },
    {
      title: 'Chi tiết',
      render: (text, record) => (
        <Button onClick={() => handleOrderClick(record._id)}>
          Xem Order Items
        </Button>
      )
    }
  ];

  const orderItemColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (total) => `${total.toLocaleString('vi-VN')} VND`,
    },
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

      <Modal
        visible={isModalChangeStatus}
        closable={false}
        onCancel={() => {
          setIsModalChangeStatus(false);
          setSelectedOrderChange('');
        }}
        onOk={() => handleSubmitChangeStatus()}
      >
        <h3 style={{ textAlign: 'center' }}>
          Xác nhận hoàn thành {currentStatus} cho đơn hàng: {selectedOrderChange || 'null'}
        </h3>
      </Modal>

      <Modal
        title={<div className="modal-title">Chi tiết đơn hàng ID: {currentOrderId}</div>}
        visible={isOrderItemsModalVisible}
        onCancel={closeOrderItemsModal}
        footer={[
          selectedOrder?.status === 'pending' && (
            <button className="cancel-button" key="cancel" onClick={handleCancelOrder}>
              Huỷ đơn hàng
            </button>
          )
        ]}
        className="modal-container"
      >
        <div className="order-details">
          <p><strong>Người nhận:</strong> {selectedOrder?.recipientName}</p>
          <p><strong>SDT:</strong> {selectedOrder?.recipientPhone}</p>
          <p><strong>Địa chỉ:</strong> {`${selectedOrder?.addressDetail?.street}, ${selectedOrder?.addressDetail?.ward}, ${selectedOrder?.addressDetail?.district}, ${selectedOrder?.addressDetail?.city}`}</p>
          <p><strong>Ghi chú:</strong> {selectedOrder?.notes}</p>
          <p><strong>Ngày đặt:</strong> {new Date(selectedOrder?.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>

        {selectedOrderItems?.map(orderItem => (
          <div className="order-item" key={orderItem._id}>
            <img src={orderItem.image_variant} alt={'ảnh sản phẩm'} />
            <div className="order-item-details">
              <p className="order-item-name">{orderItem.name}</p>
              <div className="order-item-specs">
                <p style={{ margin: 10 }}>Màu: {orderItem.color}</p>
                <p style={{ margin: 10 }}>Size: {orderItem.size}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p className="order-item-price">Giá: {orderItem.price.toLocaleString('vi-VN')} VND</p>
                x
                <p style={{ margin: 10 }}>{orderItem.quantity}</p>
                =
                <p style={{ margin: 10 }}>{orderItem.total_amount.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </div>
        ))}

        <p>Phương thức thanh toán: {selectedOrder?.payment_method}</p>
        <p>Phương thức giao hàng: {selectedOrder?.shipping_method}</p>
        <p className="total-amount">Tổng tiền: {selectedOrder?.total_amount.toLocaleString('vi-VN')} VND</p>
      </Modal>

      {/* New modal for cancellation reason */}
      <Modal
        title="Nhập lý do huỷ đơn hàng"
        visible={isCancelReasonModalVisible}
        onCancel={closeCancelReasonModal}
        onOk={handleConfirmCancelOrder}
      >
        <Input
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhập lý do huỷ đơn hàng"
        />
      </Modal>
    </div>
  );
};

export default OrderManager;