import { useState } from 'react';
import Content from './components/content/Content'
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
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

  return (
    <div id='app'>
      <Header onRefresh={handleRefresh} />
      <Content resetCounter={resetCounter} productInfo={productInfo} />
      <Footer />
    </div>
  )
}

export default App
