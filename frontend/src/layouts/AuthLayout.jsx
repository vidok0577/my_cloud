import { Layout, Space } from 'antd';
import '../css/auth.css';

const { Content } = Layout;

const AuthLayout = ({ children }) => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <div className="auth-container">
          <Space direction="vertical" size="large" style={{ width: '60%' }}>
            {children}
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
