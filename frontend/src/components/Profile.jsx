import { useEffect } from 'react';
import { Card, Typography, Divider, Space, Tag } from 'antd';
import { 
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  FileOutlined,
  CloudOutlined,
  SafetyOutlined,
  FontSizeOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { formatDate, formatStorage } from '../api/utils';
import { fetchCurrentUser } from '../store/slices/authSlice';
import '../css/profile.css';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch, location.key]);

  return (
    <Card 
      className="profile-card"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          <UserOutlined style={{ marginRight: 12 }} />
          Мой профиль
        </Title>

        <Divider style={{ margin: '16px 0' }} />

        <Card.Grid className="profile-grid">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 16 }}>
              Основная информация
            </Text>
            
            <ProfileItem 
              icon={<UserOutlined />} 
              label="Логин" 
              value={user?.username}
            />
            
            <ProfileItem
              icon={<MailOutlined />}
              label="Email"
              value={user?.email}
            />
            
            {user?.first_name && (
              <ProfileItem 
                icon={<FontSizeOutlined />}
                label="Имя" 
                value={user.first_name}
              />
            )}
            
            {user?.last_name && (
              <ProfileItem 
              icon={<FontSizeOutlined />}
                label="Фамилия" 
                value={user.last_name}
              />
            )}
          </Space>
        </Card.Grid>

        <Card.Grid className="profile-grid">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 16 }}>
              Статистика аккаунта
            </Text>
            
            <ProfileItem
              icon={<CalendarOutlined />}
              label="Дата регистрации"
              value={formatDate(user?.date_joined)}
            />
            
            <ProfileItem
              icon={<FileOutlined />}
              label="Файлов загружено"
              value={user?.files_count || 0}
              unit="шт"
            />
            
            <ProfileItem
              icon={<CloudOutlined />}
              label="Использовано места"
              value={user?.total_file_size ? formatStorage(user.total_file_size) : '0 B'}
            />
            
            <ProfileItem
              icon={<SafetyOutlined />}
              label="Статус аккаунта"
              value={
                <Tag color={user?.is_admin ? 'gold' : 'blue'}>
                  {user?.is_admin ? 'Администратор' : 'Пользователь'}
                </Tag>
              }
            />
          </Space>
        </Card.Grid>
      </Space>
    </Card>
  );
};

// Вспомогательный компонент для отображения строки информации
const ProfileItem = ({ icon, label, value, unit }) => (
  <div style={{ display: 'flex' }}>
    <span style={{ marginRight: 8, width: 24 }}>
      {icon}
    </span>
    <Text strong style={{ width: 180}}>
      {label}:
    </Text>
    <Text>
      {value} {unit && <span style={{ color: '#888' }}>{unit}</span>}
    </Text>
  </div>
);

export default Profile;
