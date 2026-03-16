import { Layout, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

const Header = ({ collapsed, onToggle }) => {
  return (
    <AntHeader style={{ padding: 0, background: '#fff' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64
        }}
      />
    </AntHeader>
  )
}

export default Header
