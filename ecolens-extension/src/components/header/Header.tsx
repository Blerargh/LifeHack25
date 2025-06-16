import React, { useState } from 'react'
import '../../styles/header.css'

const Header: React.FC = () => {
  const [productTitle, setProductTitle] = useState<string>('');
  const [showFull, setShowFull] = useState<boolean>(false);
  const [APIMessage, setAPIMessage] = useState<string>('');

  const handleClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });


    if (!tab.id) {
      console.error('Active tab has no id');
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/scripts/siteinfo.js"]
    });

    const title = results && results[0] && typeof results[0].result === 'string' ? results[0].result : '';
    setProductTitle(title);

    // Backend Sending here
    if (title) {
      try {
        const res = await fetch('http://localhost:8080/api/product-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });

        const data = await res.json();

        if (res.ok) {
          const message = data.reply;
          message.trim();
          setAPIMessage(message)
          console.log(APIMessage);

          // TODO: Process the response from OpenRouter and send to Footer
        }

      } catch (err) {
        console.error('Error sending title to backend:', err);
      }
    }
  }

  // If showFull, show only the product name in a large, centered box
  if (showFull && productTitle) {
    return (
      <div className="full-product-name-modal">
        <button className="close-full-btn" onClick={() => setShowFull(false)}>✕</button>
        <div className="full-product-name-text">{productTitle}</div>
      </div>
    );
  }

  return (
    <div className='header-container'>
      <span style={{ marginRight: 8, color: "#222", fontWeight: 500 }}>Product Name:</span>
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
          Show Full Name
        </button>
      )}
      <button onClick={handleClick} style={{ marginLeft: 8 }}>Refresh</button>
    </div>
  )
}

export default Header