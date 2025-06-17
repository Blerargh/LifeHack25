(function () {
  let title = '';
  let shipFrom = '';
  let shipTo = 'Singapore';
  let price = 0;
  let shipCost = 0;
  let brand = '';
  let description = '';

  if (location.hostname.includes('amazon.')) {
    const titleEl = document.querySelector('#productTitle');
    title = titleEl ? titleEl.textContent.trim() : '';

    const shipFromEl = document.querySelector('#fulfillerInfoFeature_feature_div .offer-display-feature-text .offer-display-feature-text-message');
    shipFrom = shipFromEl ? shipFromEl.textContent.trim() : '';

    const priceEl = document.querySelector('.aok-offscreen');
    price = priceEl && priceEl.innerHTML
      ? parseFloat(priceEl.innerHTML.trim().slice(2))
      : parseFloat(document.querySelector('.a-offscreen').innerHTML.trim().slice(2));

    shipCost = document.querySelector('[data-csa-c-delivery-price]')?.getAttribute('data-csa-c-delivery-price') ?? 'FREE';
    shipCost = shipCost === 'FREE' ? 0 : parseFloat(shipCost.slice(2));

    brand = document.getElementById('bylineInfo')?.innerText.slice(7) ?? '';

    description = Array.from(document.getElementById('feature-bullets')?.querySelectorAll('.a-list-item') ?? []).map((e) => e.innerText.trim()).join('\n');

  } else if (location.hostname.includes('shopee.')) {
    // Shopee: use stable attribute, then h1, then fallback to document title
    let titleEl = document.querySelector('[data-sqe="name"]')
      || document.querySelector('h1')
      || document.querySelector('title');
    title = titleEl ? titleEl.textContent.trim() : '';

    const shipFromHeadings = document.querySelectorAll('.VJOnTD');
    for (let heading of shipFromHeadings) {
      if (heading.textContent.trim() === 'Ships From') {
        const shipFromEl = heading.nextElementSibling;
        shipFrom = shipFromEl ? shipFromEl.textContent.trim() : '';
      } else if (heading.textContent.trim() === 'Brand') {
        const brandEl = heading.nextElementSibling;
        brand = brandEl ? brandEl.textContent.trim() : '';
      }
    }

    const priceEl = document.querySelector('.IZPeQz.B67UQ0');
    if (priceEl?.textContent.includes('-')) return 'Please select your product.';
    price = priceEl ? parseFloat(priceEl.textContent.slice(1)) : 0;

    shipCost = 0;

    description = Array.from(document.querySelectorAll('.e8lZp3')).map((e) => e.innerText.trim()).join('\n');

  } else if (location.hostname.includes('lazada.')) {
    // Lazada: try known class, then h1, then fallback to document title pdp-product-brand__brand-link
    let titleEl = document.querySelector('.pdp-mod-product-badge-title')
      || document.querySelector('h1')
      || document.querySelector('title');
    title = titleEl ? titleEl.textContent.trim() : '';

    shipFrom = 'Unknown'; // Non RedMart items have unknown shipping origin
    const shipFromHeadings = document.querySelectorAll('.attr-name');
    for (let heading of shipFromHeadings) {
      if (heading.textContent.trim() === 'Place of Origin') { // RedMart
        shipFrom = 'Singapore';
        break;
      }
    }

    const priceHeadings = document.querySelectorAll('.pdp-price_type_normal');
    for (let heading of priceHeadings) {
      if (heading.textContent.trim().includes('.')) {
        price = heading.textContent.trim().charAt(0) === '$' ? heading.textContent.trim().slice(1) : heading.textContent.trim();
      }
    }

    let shipCostHeadings = document.querySelectorAll('.option-shipping');
    if (shipCostHeadings.length === 0) shipCostHeadings = document.querySelectorAll('.delivery-option-item__shipping-fee');
    if (shipCostHeadings) {
      let minShipCost = Number.MAX_VALUE;
      for (let heading of shipCostHeadings) {
        if (parseFloat(heading.textContent.trim().slice(1)) < minShipCost) minShipCost = parseFloat(heading.textContent.trim().slice(1));
      }
      shipCost = minShipCost;
    }

    const brandEl = document.querySelector('.pdp-product-brand__brand-link');
    brand = brandEl ? brandEl.textContent : '';

    description = Array.from(document.querySelectorAll('.lzd-article')).map((e) => e.innerText.trim()).join('\n');
    if (description === '') description = Array.from(document.querySelectorAll('.pdp-product-desc')).map((e) => e.innerText.trim()).join('\n');
  }

  const result = { title, shipFrom, shipTo, price, shipCost, brand, description }
  console.log(result);
  return result || 'No product found';
})();