import React, { useEffect, useState } from 'react'
import '../../styles/header.css'
import { IoMdCloseCircle } from 'react-icons/io';

interface Product {
  brand: string;
  description: string;
  price: number;
  shipCost: number;
  shipFrom: string;
  shipTo: string;
  title: string;
}

interface HeaderProps {
  onRefresh: (product: Product | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  const [productTitle, setProductTitle] = useState<string>('');
  const [showFull, setShowFull] = useState<boolean>(false);
  const [APIMessage, setAPIMessage] = useState<string>('');

  const handleClick = async () => {
    setProductTitle('');
    setAPIMessage('');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });


    if (!tab.id) {
      console.error('Active tab has no id');
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/scripts/siteinfo.js"]
    });

    const product = results && results[0] ? (results[0].result as Product) : null;
    const title = product?.title || '';
    onRefresh(product);
    setProductTitle(title);

    // Backend Sending here
    if (title) {
      try {
        const res = await fetch('https://lifehack25.onrender.com/api/product-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product }),
        });

        const data = await res.json();

        if (res.ok) {
          const message = data.reply;
          setAPIMessage(message)
          console.log(APIMessage);
        }

      } catch (err) {
        console.error('Error sending title to backend:', err);
      }
    }
  }

  useEffect(() => {
    handleClick();
  }, []);

  // If showFull, show only the product name in a large, centered box
  if (showFull && productTitle) {
    return (
      <div className="full-product-name-modal">
        {/* <button className="close-full-btn" onClick={() => setShowFull(false)}>✕</button> */}
        <IoMdCloseCircle className='close-button' onClick={() => setShowFull(false)} />
        <div className="full-product-name-text">{productTitle}</div>
      </div>
    );
  }

  return (
    <div className='header-container'>
      <span>Product Name:</span>
      <div
        className='product-details product-details-dark'
        title={productTitle.length > 24 ? productTitle : ""}
      >
        {productTitle || <span style={{ color: '#aaa' }}>No product</span>}
      </div>
      {productTitle.length > 24 && (
        <button
          className="show-full-btn"
          onClick={() => setShowFull(true)}
        >
          Full Name
        </button>
      )}
    </div>
  )
}

export default Header