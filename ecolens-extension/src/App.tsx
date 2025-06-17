import { useState } from 'react';
import Content from './components/content/Content'
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import TitleBar from './components/titlebar/TitleBar';
import './styles/App.css'

interface Product {
  brand: string;
  description: string;
  price: number;
  shipCost: number;
  shipFrom: string;
  shipTo: string;
  title: string;
}

function App() {
  const [resetCounter, setResetCounter] = useState(0);
  const [productInfo, setProductInfo] = useState<Product | null>(null);

  const handleRefresh = (product: Product | null) => {
    setResetCounter(prev => prev + 1);
    setProductInfo(product);
  };

  const footerShouldShow = true; // Replace with your actual condition

  return (
    <div id='app'>
      <TitleBar />
      <Header onRefresh={handleRefresh} />
      <Content resetCounter={resetCounter} productInfo={productInfo} />
      {footerShouldShow ? (
        <Footer />
      ) : (
        <div
          className="footer-placeholder"
          style={{
            height: 120, // Same as .footer-container
            width: '100%',
            background: 'transparent', // or a subtle loading bg
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ color: '#888', fontSize: 16 }}>Loading footer...</span>
        </div>
      )}
    </div>
  )
}

export default App
