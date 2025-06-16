import React, { useState } from 'react'
import '../../styles/header.css'

const Header: React.FC = () => {
  const [ productTitle, setProductTitle ] = useState<string>('');
  const handleClick = async () => {
    const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      console.error('Active tab has no id');
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/scripts/siteinfo.js"]
    });

    console.log(results);

    // Assuming the script returns a string as its result
    const title = results && results[0] && typeof results[0].result === 'string' ? results[0].result : '';
    setProductTitle(title);
  }

  return (
    <>
      <div className='header-container'>
        <div className='product-details'>
          Product Name: {productTitle}
        </div>
        <button onClick={handleClick}>Refresh</button>
      </div>
    </>
  )
}

export default Header