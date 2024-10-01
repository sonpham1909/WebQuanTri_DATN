import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar" style={{ width: '200px', background: '#f4f4f4' }}>
            <ul>
                <li>
                    <Link to="/home">Home</Link>
                </li>
                <li>
                    <Link to="/user_manager">User Manager</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
