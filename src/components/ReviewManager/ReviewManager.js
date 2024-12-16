import React, { useEffect, useState } from 'react';
import { Table, Input, Modal, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAllProducts } from '../../services/ProductService';
import { getAllReviews, deleteReview } from '../../services/ReviewServices';
import { getAllUsers, updateUser } from '../../services/UserService';
import { addResponse, getAllResponses, deleteResponse, updateResponse } from '../../services/ResponseReviewServices';
import LoadingCo from '../loading/loading';
import { useNavigate } from 'react-router-dom';

const ReviewManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [newResponseText, setNewResponseText] = useState('');
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmDeleteReviewVisible, setIsConfirmDeleteReviewVisible] = useState(false);
  const [currentReviewToDelete, setCurrentReviewToDelete] = useState(null);
  const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 5;

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Không thể lấy danh sách sản phẩm', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Không thể lấy danh sách người dùng', error);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const allReviews = await getAllReviews();
      const filteredReviews = allReviews.filter(review => review.product_id === productId);
      const reviewsWithUserInfo = await Promise.all(filteredReviews.map(async (review) => {
        const user = users.find(user => user._id === review.user_id);
        const reviewResponses = await getAllResponses(review._id);
        return {
          ...review,
          userName: user ? user.full_name : 'Không rõ',
          avatarUrl: user ? user.avatar : '',
          responses: reviewResponses.filter(response => response.review_id === review._id)
        };
      }));
      setReviews(reviewsWithUserInfo);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Không thể lấy đánh giá', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const handleResponseSubmit = async () => {
    const userId = localStorage.getItem('userId');
    if (currentReviewId && responseText && userId) {
      try {
        await addResponse({ review_id: currentReviewId, user_id: userId, comment: responseText });
        setResponseText('');
        setCurrentReviewId(null);
        fetchReviews(reviews.find(review => review._id === currentReviewId).product_id);
      } catch (error) {
        console.error('Không thể thêm phản hồi', error);
      }
    } else {
      alert('Bạn cần đăng nhập để gửi phản hồi.');
    }
  };

  const handleResponseLongPress = (response) => {
    setSelectedResponse(response);
    setNewResponseText(response.comment);
    setIsResponseModalVisible(true);
  };

  const openConfirmDeleteModal = () => {
    setIsConfirmDeleteVisible(true);
  };

  const handleDeleteResponse = async () => {
    if (selectedResponse) {
      try {
        await deleteResponse(selectedResponse._id);
        fetchReviews(reviews.find(review => review._id === selectedResponse.review_id).product_id);
      } catch (error) {
        console.error('Không thể xóa phản hồi', error);
      }
      setIsResponseModalVisible(false);
      setSelectedResponse(null);
      setIsConfirmDeleteVisible(false);
    }
  };

  const handleConfirmDelete = () => {
    handleDeleteResponse();
  };

  const handleUpdateResponse = async () => {
    if (selectedResponse) {
      try {
        await updateResponse(selectedResponse._id, { comment: newResponseText });
        fetchReviews(reviews.find(review => review._id === selectedResponse.review_id).product_id);
      } catch (error) {
        console.error('Không thể cập nhật phản hồi', error);
      }
      setIsResponseModalVisible(false);
      setSelectedResponse(null);
      setNewResponseText('');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openConfirmDeleteReviewModal = (reviewId) => {
    setCurrentReviewToDelete(reviewId);
    setIsConfirmDeleteReviewVisible(true);
  };

  const handleDeleteReview = async () => {
    if (currentReviewToDelete) {
      try {
        await deleteReview(currentReviewToDelete);
        fetchReviews(reviews.find(review => review._id === currentReviewToDelete).product_id);
      } catch (error) {
        console.error('Không thể xóa đánh giá', error);
      }
      setIsConfirmDeleteReviewVisible(false);
      setCurrentReviewToDelete(null);
    }
  };

  const handleAvatarClick = (user) => {
    setSelectedUser(user);
    setIsUserInfoVisible(true);
  };

  const handleBlockUser = async (userId) => {
    if (selectedUser && selectedUser.block === false) {
        try {
            await updateUser(userId, { block: true }); // Chặn người dùng
            message.success('Người dùng đã bị chặn thành công.'); // Thông báo thành công
        } catch (error) {
            console.error('Không thể chặn người dùng', error);
            message.error('Có lỗi xảy ra khi chặn người dùng.'); // Thông báo lỗi
        } finally {
            fetchUsers(); // Cập nhật danh sách người dùng
            setSelectedUser(prev => ({ ...prev, block: true })); // Cập nhật trạng thái chặn trong modal
        }
    }
};

const handleUnblockUser = async (userId) => {
    if (selectedUser && selectedUser.block === true) {
        try {
            await updateUser(userId, { block: false }); // Bỏ chặn người dùng
            message.success('Người dùng đã được bỏ chặn thành công.'); // Thông báo thành công
        } catch (error) {
            console.error('Không thể bỏ chặn người dùng', error);
            message.error('Có lỗi xảy ra khi bỏ chặn người dùng.'); // Thông báo lỗi
        } finally {
            fetchUsers(); // Cập nhật danh sách người dùng
            setSelectedUser(prev => ({ ...prev, block: false })); // Cập nhật trạng thái bỏ chặn trong modal
        }
    }
};



  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrls',
      render: (imageUrls) => {
        const imageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : '';
        return imageUrl ? <img src={imageUrl} alt="Ảnh sản phẩm" style={{ width: '50px' }} /> : 'Không có hình ảnh';
      },
    },
    {
      title: 'Đánh giá',
      render: (text, record) => (
        <Button type="primary" onClick={() => fetchReviews(record._id)}>
          Xem đánh giá
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingCo />;
  }

  return (
    <div className="container">
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, width: 300 }}
        onChange={handleSearch}
      />

      <div className="headerPage">
        <h3 className="titlepage">Quản lý đánh giá
        </h3>
        <p>Tổng: {products.length} sản phẩm</p>
      </div>

      <Table
        className="table"
        dataSource={products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      <Modal
        title="Đánh giá sản phẩm"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {reviews.length > 0 ? (
          <ul>
            {reviews.map(review => (
              <li key={review._id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                {review.avatarUrl && (
                  <img
                    src={review.avatarUrl}
                    alt="Avatar người dùng"
                    style={{ width: '30px', borderRadius: '50%', marginRight: '8px', cursor: 'pointer' }}
                    onClick={() => handleAvatarClick(users.find(user => user._id === review.user_id))}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{review.userName}</strong>
                  <div>{review.comment}</div>
                  <div><em>{review.rating}/5⭐</em></div>
                  {Array.isArray(review.img) && review.img.map(img => (
                    <img
                      src={img}
                      alt="Hình ảnh đánh giá"
                      style={{ width: '100px', marginTop: '5px', borderRadius: '5px' }}
                    />
                  ))}
                  {review.responses.length > 0 && (
                    <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #f0f0f0' }}>
                      <strong>Phản hồi:</strong>
                      <ul>
                        {review.responses.map((response) => (
                          <li
                            key={response._id}
                            onMouseDown={() => handleResponseLongPress(response)}
                            style={{ cursor: 'pointer' }}
                          >
                            <strong>{users.find(user => user._id === response.user_id)?.full_name || 'Người dùng'}:</strong> {response.comment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  type="default"
                  onClick={() => {
                    setCurrentReviewId(review._id);
                    setResponseText('');
                  }}
                  style={{ marginTop: '10px' }}
                >
                  Phản hồi
                </Button>
                <Button
                  type="danger"
                  onClick={() => openConfirmDeleteReviewModal(review._id)}
                  style={{ marginTop: '10px', marginLeft: '8px' }}
                >
                  Xóa
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có đánh giá nào cho sản phẩm này.</p>
        )}
        <Modal
          title="Phản hồi cho đánh giá"
          visible={currentReviewId !== null}
          onCancel={() => setCurrentReviewId(null)}
          footer={[
            <Button key="cancel" onClick={() => setCurrentReviewId(null)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleResponseSubmit}>
              Gửi phản hồi
            </Button>,
          ]}
        >
          <Input.TextArea
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Nhập phản hồi của bạn..."
          />
        </Modal>
      </Modal>

      <Modal
        title="Chọn hành động"
        visible={isResponseModalVisible}
        onCancel={() => setIsResponseModalVisible(false)}
        footer={[
          <Button key="delete" danger onClick={openConfirmDeleteModal}>
            Xóa
          </Button>,
          <Button key="update" onClick={handleUpdateResponse}>
            Sửa
          </Button>,
          <Button key="cancel" onClick={() => setIsResponseModalVisible(false)}>
            Hủy
          </Button>
        ]}
      >
        <p>Bạn có muốn sửa hoặc xóa phản hồi này?</p>
        <Input.TextArea
          rows={4}
          value={newResponseText}
          onChange={(e) => setNewResponseText(e.target.value)}
          placeholder="Nhập nội dung mới cho phản hồi..."
        />
      </Modal>

      <Modal
        title="Xác nhận xóa"
        visible={isConfirmDeleteVisible}
        onCancel={() => setIsConfirmDeleteVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfirmDeleteVisible(false)}>
            Hủy
          </Button>,
          <Button key="confirm" danger onClick={handleConfirmDelete}>
            Xóa
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn xóa phản hồi này không?</p>
      </Modal>

      <Modal
        title="Xác nhận xóa đánh giá"
        visible={isConfirmDeleteReviewVisible}
        onCancel={() => setIsConfirmDeleteReviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfirmDeleteReviewVisible(false)}>
            Hủy
          </Button>,
          <Button key="confirm" danger onClick={handleDeleteReview}>
            Xóa
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
      </Modal>

      <Modal
    title="Thông tin người dùng"
    visible={isUserInfoVisible}
    onCancel={() => setIsUserInfoVisible(false)}
    footer={[
        
        <Button key="close" onClick={() => setIsUserInfoVisible(false)}>
            Đóng
        </Button>
    ]}
>
    {selectedUser && (
        <div><p><strong>ID:</strong> {selectedUser._id}</p>
        <p><strong>Username</strong> {selectedUser.username}</p>
            <p><strong>Tên:</strong> {selectedUser.full_name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Số điện thoại:</strong> {selectedUser.phone_number}</p>
            {selectedUser.block && <p style={{ color: 'red' }}>Tài khoản đã bị chặn.</p>}
            {!selectedUser.block ? (
                <Button key="block" onClick={() => handleBlockUser(selectedUser._id)}>
                    Chặn
                </Button>
            ) : null}
            {selectedUser.block ? (
                <Button key="unblock" onClick={() => handleUnblockUser(selectedUser._id)}>
                    Bỏ chặn
                </Button>
            ) : null}
        </div>
    )}
</Modal>
    </div>
  );
};

export default ReviewManager;