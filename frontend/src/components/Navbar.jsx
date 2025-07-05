import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Layout, Menu, Dropdown, Button, Avatar, Space, Typography } from 'antd';
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SolutionOutlined,
  TeamOutlined,
  CloudOutlined,
  HomeOutlined
} from '@ant-design/icons';
import '../css/navbar.css';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch(() => {
        navigate('/login');
      });
  };
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout
    }
  ];

  const navItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Главная</Link>,
    },
    {
      key: 'files',
      icon: <CloudOutlined />,
      label: <Link to="/files">Мои файлы</Link>,
    }
  ];

  if (isAdmin) navItems.push({
      key: 'admin',
      icon: <TeamOutlined />,
      label: <Link to="/admin">Админ</Link>,
  })

  return (
    <Header className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <Space>
            <CloudOutlined />
            <Text strong style={{ color: 'white' }}>MyCloud</Text>
          </Space>
        </Link>
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        items={navItems}
        disabledOverflow={true}
        selectedKeys={[location.pathname.split('/')[1] || 'home']}
      />

      <div className="navbar-actions">
        {user ? (
          <Dropdown 
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space className="navbar-user">
              <Avatar icon={<UserOutlined />} />
              <Text style={{ color: 'white' }}>{user.username}</Text>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="primary" icon={<LoginOutlined />}>
              <Link to="/login">Вход</Link>
            </Button>
            <Button icon={<SolutionOutlined />}>
              <Link to="/register">Регистрация</Link>
            </Button>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
