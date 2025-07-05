import { Button, Card, Row, Col, Typography, Space, Alert } from 'antd';
import { 
  CloudUploadOutlined, 
  LockOutlined, 
  TeamOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../css/home.css';

const { Title, Paragraph } = Typography;

const HomePage = () => {

  const features = [
    {
      title: 'Безопасное хранение',
      icon: <LockOutlined style={{ fontSize: '24px' }} />,
      description: 'Ваши файлы надежно защищены и доступны только вам'
    },
    {
      title: 'Общий доступ',
      icon: <ShareAltOutlined style={{ fontSize: '24px' }} />,
      description: 'Делитесь файлами с коллегами и друзьями'
    },
    {
      title: 'Доступ везде',
      icon: <CloudUploadOutlined style={{ fontSize: '24px' }} />,
      description: 'Работайте с файлами с любого устройства'
    },
    {
      title: 'Для команд',
      icon: <TeamOutlined style={{ fontSize: '24px' }} />,
      description: 'Администраторы могут управлять всеми файлами'
    }
  ];

  return (
    <div className="home-page">
      <div className="hero-section">
        <Title level={2} className="hero-title">
          Добро пожаловать в MyCloud
        </Title>
        <Paragraph className="hero-subtitle">
          Ваше надежное облачное хранилище для безопасного хранения и обмена файлами
        </Paragraph>
        
          <Space size="large">
            <Button type="primary" size="large">
              <Link to="/">Начать бесплатно</Link>
            </Button>
            <Button size="large">
              <Link to="/">Войти в аккаунт</Link>
            </Button>
          </Space>
          <Button type="primary" size="large" icon={<CloudUploadOutlined />}>
            <Link to="/">Перейти к моим файлам</Link>
          </Button>
      </div>

      <div className="features-section">
        <Title level={3} className="section-title">Возможности MyCloud</Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon">{feature.icon}</div>
                <Title level={4} className="feature-title">{feature.title}</Title>
                <Paragraph className="feature-description">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

        <div className="cta-section">
          <Alert 
            message={
              <Space direction="vertical">
                <Title level={4} style={{ margin: 0 }}>
                  Начните использовать MyCloud прямо сейчас
                </Title>
                <Paragraph style={{ margin: 0 }}>
                  Зарегистрируйтесь и получите доступ ко всем возможностям
                </Paragraph>
              </Space>
            }
            type="info"
            showIcon
            action={
              <Button type="primary">
                <Link to="/">Зарегистрироваться</Link>
              </Button>
            }
          />
        </div>
    </div>
  );
};

export default HomePage;
