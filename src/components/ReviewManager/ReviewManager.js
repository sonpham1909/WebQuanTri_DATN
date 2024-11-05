import React, { useEffect, useState } from 'react';
import { Table, Input, Modal, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAllProducts } from '../../services/ProductService';
import { getAllReviews } from '../../services/ReviewServices';
import { getAllUsers } from '../../services/UserService';
import { addResponse, getAllResponses, deleteResponse, updateResponse } from '../../services/ResponseReviewServices';
import LoadingCo from '../loading/loading';

const ReviewManager = () => {
  const [products, setProducts] = useState([]); // Dữ liệu sản phẩm
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [reviews, setReviews] = useState([]); // Đánh giá của sản phẩm
  const [users, setUsers] = useState([]); // Dữ liệu người dùng
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal
  const [responseText, setResponseText] = useState(''); // Nội dung phản hồi
  const [currentReviewId, setCurrentReviewId] = useState(null); // ID đánh giá hiện tại
  const [selectedResponse, setSelectedResponse] = useState(null); // Phản hồi được chọn cho sửa/xóa
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false); // Trạng thái modal phản hồi
  const [newResponseText, setNewResponseText] = useState(''); // Nội dung phản hồi mới cho sửa
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false); // Modal xác nhận xóa

  const pageSize = 5; // Số mục trên mỗi trang

  // Hàm lấy danh sách sản phẩm
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

  // Hàm lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Không thể lấy danh sách người dùng', error);
    }
  };

  // Hàm lấy đánh giá cho sản phẩm được chọn
  const fetchReviews = async (productId) => {
    try {
      const allReviews = await getAllReviews();
      const filteredReviews = allReviews.filter(review => review.product_id === productId);
      const reviewsWithUserInfo = await Promise.all(filteredReviews.map(async (review) => {
        const user = users.find(user => user._id === review.user_id);
        
        // Lấy phản hồi cho đánh giá này
        const reviewResponses = await getAllResponses(review._id);
        
        return {
          ...review,
          userName: user ? user.full_name : 'Không rõ',
          avatarUrl: user ? user.avatar : '',
          responses: reviewResponses.filter(response => response.review_id === review._id) // Chỉ lấy phản hồi có review_id trùng khớp
        };
      }));

      setReviews(reviewsWithUserInfo);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Không thể lấy đánh giá', error);
    }
  };

  // Gọi hàm lấy sản phẩm và người dùng khi component mount
  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // Xử lý khi gửi phản hồi
  const handleResponseSubmit = async () => {
    const userId = localStorage.getItem('userId');

    if (currentReviewId && responseText && userId) {
      try {
        await addResponse({ review_id: currentReviewId, user_id: userId, comment: responseText });
        setResponseText('');
        setCurrentReviewId(null);
        
        // Cập nhật lại đánh giá để lấy phản hồi mới
        fetchReviews(reviews.find(review => review._id === currentReviewId).product_id);
      } catch (error) {
        console.error('Không thể thêm phản hồi', error);
      }
    } else {
      alert('Bạn cần đăng nhập để gửi phản hồi.');
    }
  };

  // Hàm xử lý việc nhấn giữ phản hồi
  const handleResponseLongPress = (response) => {
    setSelectedResponse(response);
    setNewResponseText(response.comment); // Đặt nội dung phản hồi hiện tại vào ô nhập
    setIsResponseModalVisible(true);
  };

  // Hàm xử lý mở modal xác nhận xóa
  const openConfirmDeleteModal = () => {
    setIsConfirmDeleteVisible(true);
  };

  // Hàm xử lý xóa phản hồi
  const handleDeleteResponse = async () => {
    if (selectedResponse) {
      try {
        await deleteResponse(selectedResponse._id);
        // Cập nhật lại danh sách phản hồi sau khi xóa
        fetchReviews(reviews.find(review => review._id === selectedResponse.review_id).product_id);
      } catch (error) {
        console.error('Không thể xóa phản hồi', error);
      }
      setIsResponseModalVisible(false);
      setSelectedResponse(null);
      setIsConfirmDeleteVisible(false); // Đóng modal xác nhận sau khi xóa
    }
  };

  // Hàm xử lý xác nhận xóa
  const handleConfirmDelete = () => {
    handleDeleteResponse();
  };

  // Hàm xử lý cập nhật phản hồi
  const handleUpdateResponse = async () => {
    if (selectedResponse) {
      try {
        await updateResponse(selectedResponse._id, { comment: newResponseText });
        // Cập nhật lại danh sách phản hồi sau khi cập nhật
        fetchReviews(reviews.find(review => review._id === selectedResponse.review_id).product_id);
      } catch (error) {
        console.error('Không thể cập nhật phản hồi', error);
      }
      setIsResponseModalVisible(false);
      setSelectedResponse(null);
      setNewResponseText(''); // Reset nội dung phản hồi mới
    }
  };

  // Định nghĩa các cột cho bảng sản phẩm
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

  // Render giao diện chính
  if (loading) {
    return <LoadingCo />;
  }

  return (
    <div className="container">
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, width: 300 }}
      />
      <div className="headerPage">
        <h3 className="titlepage">Quản lý sản phẩm</h3>
        <p>Tổng: {products.length} sản phẩm</p>
      </div>

      <Table
        className="table"
        dataSource={products}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      {/* Modal hiển thị đánh giá */}
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
                    style={{ width: '30px', borderRadius: '50%', marginRight: '8px' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{review.userName}</strong>
                  <div>{review.comment}</div>
                  <div><em>{review.rating}/5⭐</em></div>
                  {review.img?.map(img => (
                    
                      <img
                        src={img}
                        alt="Hình ảnh đánh giá"
                        style={{ width: '100px', marginTop: '5px', borderRadius: '5px' }}
                      />
                   
                  ))}

                  {/* Hiển thị phản hồi dưới đánh giá */}
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
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có đánh giá nào cho sản phẩm này.</p>
        )}

        {/* Modal cho phản hồi */}
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

      {/* Modal cho sửa/xóa phản hồi */}
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

      {/* Modal xác nhận xóa */}
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
    </div>
  );
};

export default ReviewManager;
