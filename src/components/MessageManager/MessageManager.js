// src/MessageManager/MessageManager.js
import React, { useEffect, useState } from 'react';
import { Input, Button, List, Avatar, message, Row, Col, Upload } from 'antd';
import { SearchOutlined, UploadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../services/UserService';
import { getAllMessages, updateMessage } from '../../services/MessageServices';
import { getRepliesByMessageId, createReply } from '../../services/ReplyServices';
import moment from 'moment';
import './index.css';
import { socket } from '../../services/socketio';

const MessageManager = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [replies, setReplies] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newReply, setNewReply] = useState('');
    const [newReplyImage, setNewReplyImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsersAndMessages();
    }, []);
    const [notification, setNotification] = useState([]);


    useEffect(() => {
      // Kiểm tra kết nối và lắng nghe sự kiện 'pushnotification' từ server
      socket.on('pushnotification', (data) => {
        // Log dữ liệu từ server
        // Cập nhật state để thêm thông báo mới vào danh sách
        setNotification((prev) => [...prev, data]);
        alert('Updated notification state:', [...notification, data]); // Thêm log để kiểm tra
      });
  
      // Cleanup: Gỡ bỏ các listener khi component bị unmount
      return () => {
        socket.off('pushnotification');
      };
    }, [notification]);


    const fetchUsersAndMessages = async () => {
        setLoadingUsers(true);
        setLoadingMessages(true);
        try {
            const [allUsers, allMessages] = await Promise.all([getAllUsers(), getAllMessages()]);
            
            // Filter users with messages
            const userIdsWithMessages = [...new Set(allMessages.map(message => message.user_id))];
            const usersWithMessages = allUsers.filter(user => userIdsWithMessages.includes(user._id));
    
            // Create a map to get the latest message for each user
            const latestMessagesMap = {};
            allMessages.forEach(message => {
                if (!latestMessagesMap[message.user_id] || new Date(message.createdAt) > new Date(latestMessagesMap[message.user_id].createdAt)) {
                    latestMessagesMap[message.user_id] = message;
                }
            });
    
            // Check for unread messages and sort users
            const usersWithUnreadMessages = usersWithMessages.map(user => {
                const latestMessage = latestMessagesMap[user._id];
                const hasUnreadMessages = latestMessage && !latestMessage.status; // Check the latest message status
                return { ...user, hasUnreadMessages, latestMessageDate: latestMessage ? new Date(latestMessage.createdAt) : null };
            }).filter(user => user.latestMessageDate !== null) // Filter out users with no messages
    
            // Sort users by the date of their latest message, descending
            usersWithUnreadMessages.sort((a, b) => b.latestMessageDate - a.latestMessageDate);
    
            setUsers(usersWithUnreadMessages);
            setMessages(allMessages);
            fetchRepliesForMessages(allMessages);
        } catch (error) {
            message.error('Không thể tải người dùng hoặc tin nhắn');
            console.error('Lỗi khi lấy người dùng hoặc tin nhắn:', error);
        } finally {
            setLoadingUsers(false);
            setLoadingMessages(false);
        }
    };

    const fetchRepliesForMessages = async (messages) => {
        try {
            const repliesMap = {};
            for (const message of messages) {
                const messageReplies = await getRepliesByMessageId(message._id);
                repliesMap[message._id] = messageReplies.map(reply => ({
                    ...reply,
                    isRecalled: reply.isRecalled || false
                }));
            }
            setReplies(repliesMap);
        } catch (error) {
            message.error('Không thể tải phản hồi');
            console.error('Lỗi khi lấy phản hồi:', error);
        }
    };

    const handleUserClick = async (user_id) => {
        setSelectedUserId(user_id);
        try {
            const latestMessage = messages
                .filter(message => message.user_id === user_id)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

            if (!latestMessage) {
                message.error('Không tìm thấy tin nhắn để cập nhật');
                return;
            }

            await updateMessage(latestMessage._id, { status: true });
            fetchUsersAndMessages();
        } catch (error) {
            message.error('Không thể cập nhật trạng thái tin nhắn');
            console.error('Lỗi khi cập nhật trạng thái tin nhắn:', error);
        }
    };

    const handleReplySubmit = async () => {
        if ((!newReply.trim() && !newReplyImage) || !selectedUserId) {
            message.error('Vui lòng đảm bảo tất cả các trường bắt buộc đã được điền');
            return;
        }

        const latestMessage = messages
            .filter(message => message.user_id === selectedUserId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (!latestMessage) {
            message.error('Không tìm thấy tin nhắn để phản hồi');
            return;
        }

        try {
            let imageUrl = newReplyImage ? URL.createObjectURL(newReplyImage) : null;

            const replyData = {
                content: newReply.trim() ? newReply : null,
                user_id: selectedUserId,
                message_id: latestMessage._id,
                img: imageUrl
            };

            await createReply(replyData);
            setNewReply('');
            setNewReplyImage(null);
            fetchUsersAndMessages();
            message.success('Đã gửi');
        } catch (error) {
            message.error('Không thể tạo phản hồi');
            console.error('Lỗi khi tạo phản hồi:', error);
        }
    };

    const handleImageUpload = (file) => {
        if (file && file instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewReplyImage(file);
            };
            reader.readAsDataURL(file);
        }
        return false;
    };

    const handleRemoveImage = () => {
        setNewReplyImage(null);
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Quản lý Tin nhắn</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Input
                        placeholder="Tìm kiếm người dùng"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        prefix={<SearchOutlined />}
                        style={{ marginBottom: '20px', width: '100%', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
                    />
                    {loadingUsers ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Đang tải người dùng...</p>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={filteredUsers}
                            renderItem={user => (
                                <List.Item
                                    onClick={() => handleUserClick(user._id)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        transition: 'background 0.3s',
                                        backgroundColor: selectedUserId === user._id ? '#FFFF66' : 'white',
                                        marginBottom: '10px',
                                        boxShadow: selectedUserId === user._id ? '0 0 5px rgba(0, 0, 0, 0.1)' : 'none',
                                        animation: user.hasUnreadMessages ? 'blink 1s infinite' : 'none'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={user.avatar} />}
                                        title={<span style={{ color: '#1890ff', fontWeight: '500' }}>{user.full_name}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </Col>

                <Col span={16}>
                    {selectedUserId && (
                        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                            <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                                Tin nhắn từ {users.find(user => user._id === selectedUserId)?.full_name || 'Người dùng không xác định'}
                            </h3>
                            <div style={{
                                height: '380px',
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                background: '#fafafa'
                            }}>
                                {loadingMessages ? (
                                    <p style={{ textAlign: 'center', color: '#888' }}>Đang tải tin nhắn...</p>
                                ) : (
                                    messages
                                        .filter(message => message.user_id === selectedUserId)
                                        .map((item) => (
                                            <div key={item._id} style={{ marginBottom: '20px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    marginBottom: '10px'
                                                }}>
                                                    <div style={{
                                                        padding: '15px',
                                                        borderRadius: '8px',
                                                        background: '#f0f0f0',
                                                        maxWidth: '70%',
                                                        textAlign: 'left'
                                                    }}>
                                                        <strong style={{ color: '#333' }}>{item.user_name}</strong>
                                                        <p style={{ margin: '5px 0', color: '#555' }}>{item.content === 'Tin nhắn đã thu hồi' ? 'Tin nhắn đã thu hồi' : item.content}</p>
                                                        {item.img && (
                                                            <img
                                                                src={item.img}
                                                                alt="tin nhắn-img"
                                                                style={{
                                                                    maxWidth: '150px',
                                                                    borderRadius: '8px',
                                                                    marginTop: '10px'
                                                                }}
                                                            />
                                                        )}
                                                        <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>{moment(item.createdAt).format('HH:mm:ss')}</small>
                                                    </div>
                                                </div>

                                                {replies[item._id] && replies[item._id].length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        {replies[item._id].map(reply => (
                                                            <div key={reply._id} style={{
                                                                padding: '15px',
                                                                borderRadius: '8px',
                                                                background: reply.isRecalled ? '#ffcccc' : '#e6f7ff',
                                                                maxWidth: '70%',
                                                                textAlign: 'left',
                                                                marginBottom: '10px'
                                                            }}>
                                                                <strong style={{ color: '#333' }}>Cửa hàng StyleLife:</strong>
                                                                <p style={{ margin: '5px 0', color: reply.isRecalled ? '#d32f2f' : '#555' }}>{reply.isRecalled ? 'Phản hồi này đã được thu hồi' : reply.content}</p>
                                                                {reply.img && (
                                                                    <img
                                                                        src={reply.img}
                                                                        style={{
                                                                            maxWidth: '150px',
                                                                            borderRadius: '8px',
                                                                            marginTop: '10px'
                                                                        }}
                                                                    />
                                                                )}
                                                                <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>{moment(reply.createdAt).format('HH:mm:ss')}</small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                )}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'fixed',
                                bottom: '20px',
                                width: '50%',
                                background: '#fff',
                                padding: '10px',
                                boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                borderRadius: '8px',
                                gap: '10px'
                            }}>
                                <Input
                                    value={newReply}
                                    onChange={e => setNewReply(e.target.value)}
                                    placeholder="Nhập phản hồi của bạn"
                                    style={{ flex: 1, borderRadius: '5px', padding: '8px 12px' }}
                                />
                                {newReplyImage && (
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                            src={URL.createObjectURL(newReplyImage)}
                                            alt="xem trước"
                                            style={{
                                                maxWidth: '50px',
                                                borderRadius: '5px',
                                                marginRight: '5px'
                                            }}
                                        />
                                        <Button
                                            icon={<CloseCircleOutlined />}
                                            onClick={handleRemoveImage}
                                            type="text"
                                            danger
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                )}
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleImageUpload}
                                >
                                    <Button icon={<UploadOutlined />} style={{ borderRadius: '5px' }} />
                                </Upload>
                                <Button
                                    type="primary"
                                    onClick={handleReplySubmit}
                                    style={{ borderRadius: '5px' }}
                                >
                                    Gửi
                                </Button>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default MessageManager;
