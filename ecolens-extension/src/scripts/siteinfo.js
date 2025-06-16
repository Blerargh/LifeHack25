(function () {
  let title = '';

  if (location.hostname.includes('amazon.')) {
    const el = document.querySelector('#productTitle');
    title = el ? el.textContent.trim() : '';
  } else if (location.hostname.includes('shopee.')) {
    // Shopee: use stable attribute, then h1, then fallback to document title
    let el = document.querySelector('[data-sqe="name"]')
          || document.querySelector('h1')
          || document.querySelector('title');
    title = el ? el.textContent.trim() : '';
  } else if (location.hostname.includes('lazada.')) {
    // Lazada: try known class, then h1, then fallback to document title
    let el = document.querySelector('.pdp-mod-product-badge-title')
          || document.querySelector('h1')
          || document.querySelector('title');
    title = el ? el.textContent.trim() : '';
  }

  return title || 'No product title found';
})();