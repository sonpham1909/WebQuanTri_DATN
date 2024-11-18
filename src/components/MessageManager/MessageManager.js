import React, { useEffect, useState } from 'react';
import { Input, Button, List, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../services/UserService';
import { getAllMessagesByUserId, sendMessage, deleteMessage, replyMessage } from '../../services/MessageServices';

const MessageManager = () => {
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [selectedUser, setSelectedUser] = useState(null); // Người dùng được chọn
  const [messageContent, setMessageContent] = useState(''); // Nội dung tin nhắn
  const [searchTerm, setSearchTerm] = useState(''); // Thuật ngữ tìm kiếm

  // Hàm để lấy danh sách người dùng có tin nhắn
  const fetchUsersWithMessages = async () => {
    try {
      const allUsers = await getAllUsers(); // Lấy tất cả người dùng
      const usersWithMessages = await Promise.all(
        allUsers.map(async (user) => {
          const messages = await getAllMessagesByUserId(user._id);
          // Kiểm tra xem người dùng có gửi bất kỳ tin nhắn nào không
          const userMessages = messages.filter(message => message.user_id === user._id);
          return userMessages.length > 0 ? user : null;
        })
      );
      setUsers(usersWithMessages.filter(user => user !== null)); // Lưu danh sách người dùng có tin nhắn
    } catch (error) {
      console.error('Không thể lấy danh sách người dùng', error);
    } finally {
      setLoading(false); // Đặt trạng thái loading thành false
    }
  };

  // Hàm để lấy tin nhắn cho người dùng đã chọn
  const fetchMessages = async (userId) => {
    try {
      const data = await getAllMessagesByUserId(userId);
      // Lọc tin nhắn chỉ bao gồm những tin nhắn do người dùng đã chọn gửi
      const userMessages = data.filter(message => message.user_id === userId);
      setMessages(userMessages);
    } catch (error) {
      console.error('Không thể lấy danh sách tin nhắn', error);
    }
  };

  useEffect(() => {
    fetchUsersWithMessages(); // Gọi hàm lấy danh sách người dùng khi component được mount
  }, []);

  // Hàm để phản hồi tin nhắn
const handleReplyMessage = async (messageId) => {
    if (messageContent && selectedUser) {
        try {
            // Thêm user_id vào dữ liệu phản hồi
            await replyMessage({
                content: messageContent,
                message_id: messageId,
                user_id: selectedUser._id  // Thêm trường user_id
            });
            setMessageContent('');
            fetchMessages(selectedUser._id); // Cập nhật danh sách tin nhắn
        } catch (error) {
            console.error('Không thể gửi phản hồi', error);
        }
    } else {
        console.warn('Nội dung tin nhắn hoặc người dùng chưa được chọn');
    }
};

  // Hàm để xóa tin nhắn
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId); // Xóa tin nhắn
      fetchMessages(selectedUser._id); // Lấy lại tin nhắn sau khi xóa
    } catch (error) {
      console.error('Không thể xóa tin nhắn', error);
    }
  };

  // Hàm để tìm kiếm người dùng
  const handleSearch = (e) => {
    setSearchTerm(e.target.value); // Cập nhật thuật ngữ tìm kiếm
  };

  // Lọc danh sách người dùng theo thuật ngữ tìm kiếm
  const filteredUsers = users.filter(user => user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <p>Loading...</p>; // Hiển thị khi đang tải
  }

  return (
    <div className="container">
      <Input
        placeholder="Tìm kiếm người dùng..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, width: 300 }}
        onChange={handleSearch}
      />

      <div style={{ display: 'flex' }}>
        <List
          style={{ width: '30%', marginRight: '20px' }}
          bordered
          dataSource={filteredUsers}
          renderItem={(user) => (
            <List.Item onClick={() => { setSelectedUser(user); fetchMessages(user._id); }}>
              <List.Item.Meta
                avatar={<Avatar src={user.avatar || 'https://via.placeholder.com/40'} />}
                title={user.full_name}
                description={user.email}
              />
            </List.Item>
          )}
        />

        <div style={{ width: '70%' }}>
          <h3>Tin nhắn với {selectedUser ? selectedUser.full_name : 'Người dùng'}</h3>

          <div style={{ height: '400px', overflowY: 'scroll', marginBottom: '10px' }}>
            {messages.map((message) => (
              <div key={message._id} style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                  <div style={{
                    maxWidth: '60%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#e6f7ff',
                    color: 'black',
                    wordBreak: 'break-word',
                  }}>
                    {message.content}
                  </div>
                  <Button onClick={() => handleDeleteMessage(message._id)} style={{ marginLeft: '10px' }}>
                    Xóa
                  </Button>
                </div>

                {message.replies && message.replies.map(reply => (
                  <div key={reply._id} style={{
                    display: 'flex',
                    justifyContent: 'flex-end', // Canh chỉnh phản hồi sang bên phải
                    marginTop: '5px',
                  }}>
                    <div style={{
                      maxWidth: '60%',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      wordBreak: 'break-word',
                    }}>
                      {reply.content}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Input
            placeholder="Nhập phản hồi của bạn..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onPressEnter={() => handleReplyMessage(messages.length > 0 ? messages[messages.length - 1]._id : null)}
            style={{ marginBottom: '10px' }}
          />
          <Button type="primary" onClick={() => handleReplyMessage(messages.length > 0 ? messages[messages.length - 1]._id : null)}>
            Phản hồi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageManager;