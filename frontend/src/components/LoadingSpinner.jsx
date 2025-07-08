import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoadingSpinner = ({ size = 'large', tip = 'Загрузка...', fullPage = false }) => {
  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: fullPage ? '100vh' : '100%',
    width: '100%'
  };

  const icon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 24 : 36 }} spin />;

  return (
    <div style={spinnerStyle}>
      <Space direction="vertical" align="center" size="middle">
        <Spin indicator={icon} size={size} />
        {tip && <Text type="secondary">{tip}</Text>}
      </Space>
    </div>
  );
};

export default LoadingSpinner;
