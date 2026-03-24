import {StrictMode, Component} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: any}, {error: any}> {
  constructor(props: any) { super(props); this.state = {error: null}; }
  static getDerivedStateFromError(error: any) { return {error}; }
  render() {
    if (this.state.error) {
      return <pre style={{color:'red',padding:'20px',background:'#fff',position:'fixed',inset:0,zIndex:99999,overflow:'auto'}}>{String(this.state.error?.stack || this.state.error)}</pre>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
