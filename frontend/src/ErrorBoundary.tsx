import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('🔥 ErrorBoundary 捕获到错误:', error);
    console.error('错误详情:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '40px auto',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          fontFamily: 'monospace',
        }}>
          <h2 style={{ color: '#856404' }}>🔥 页面出错了！</h2>
          <p>抱歉，页面遇到了错误。请尝试以下操作：</p>
          <ul>
            <li>刷新页面</li>
            <li>清除浏览器缓存</li>
            <li>联系管理员</li>
          </ul>
          {this.state.error && (
            <div style={{ marginTop: '20px' }}>
              <strong>错误信息:</strong>
              <pre style={{
                backgroundColor: '#f8d7da',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
              }}>
                {this.state.error.toString()}
              </pre>
            </div>
          )}
          {this.state.errorInfo && (
            <div style={{ marginTop: '20px' }}>
              <strong>错误堆栈:</strong>
              <pre style={{
                backgroundColor: '#f8d7da',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
