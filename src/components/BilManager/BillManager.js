import React, { useEffect, useState } from 'react';
import { Button, Input, message, Modal, Space, Table, Tag } from 'antd';
import { ChangeStatusOrder, getAllOrder } from '../../services/OrderService';
import LoadingCo from '../loading/loading';
import { SearchOutlined } from '@ant-design/icons';
import CreateOrderForm from './Create_Order';
import { getOrderItemsByOrderId } from '../../services/order_iteamServices';

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

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await getAllOrder();
      setAllOrders(res);
      console.log(res);
      
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
      console.log(order);
      
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
        title={`Chi tiết đơn hàng ID: ${currentOrderId}`}
        visible={isOrderItemsModalVisible}
        onCancel={closeOrderItemsModal}
        footer={null}
      >

      <p><strong>Người nhận : </strong>{selectedOrder?.recipientName} </p>
      <p><strong>SDT : </strong>{selectedOrder?.recipientPhone} </p>
      <p><strong>Địa chỉ: </strong>{`${selectedOrder?.addressDetail?.street}, ${selectedOrder?.addressDetail?.ward}, ${selectedOrder?.addressDetail?.district}, ${selectedOrder?.addressDetail?.city}`}</p>

      <p><strong>Ghi chú : </strong>{selectedOrder?.notes} </p>


        {selectedOrderItems?.map(orderItem => (
          <div key={orderItem._id} style={{
            marginBottom: '15px',
            border: '1px solid green',
            display: 'flex',
            alignItems:'center'
          }}>
            <img src={orderItem.image_variant} alt={'ảnh sản phẩm'} style={{ width: '100px', height: '100px' }} />
            <div>
              <p style={{
                fontSize: 16,
                fontWeight: 600,
                marginLeft: 10
              }}>{orderItem.name}</p>
              <div style={{
                display: 'flex'
              }}>
                <p style={{
                  fontFamily: 'cursive',
                  margin: 10
                }}>Màu: {orderItem.color}</p>
                <p style={{
                  fontFamily: 'cursive',
                  margin: 10
                }}>size: {orderItem.size}</p>

                
              </div>
             <div style={{
              display:'flex',
              alignItems:'center'
             }}>
             <p style={{
                  fontFamily: 'fantasy',
                  margin: 10,
                  color:'red'
                }}>Giá: {orderItem.price.toLocaleString('vi-VN')} VND</p> 
                x
                <p style={{
                  fontFamily: 'fantasy',
                  margin: 10,
                  
                }}>{orderItem.quantity}</p> 

                =

                <p style={{
                  fontFamily: 'fantasy',
                  margin: 10,
                  
                }}>{orderItem.total_amount.toLocaleString('vi-VN')} VND</p> 
                
             </div>
            </div>
          </div>
        ))}
      
        <p>Phương thức thanh toán: {selectedOrder?.payment_method}</p>
        <p>Phương thức giao hàng: {selectedOrder?.shipping_method}</p>
        <p style={{
                  fontFamily: 'fantasy',
                  margin: 10,
                  
                }}>Tổng tiền: {selectedOrder?.total_amount.toLocaleString('vi-VN')} VND</p> 
      </Modal>

    </div>
  );
};

export default OrderManager;
