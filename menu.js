document.addEventListener('DOMContentLoaded', () => {
  // Collapse toggle logic
  const collapsibles = document.querySelectorAll('.collapsible');
  collapsibles.forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('active');
      const content = header.nextElementSibling;
      if (content.classList.contains('show')) {
        content.classList.remove('show');
      } else {
        content.classList.add('show');
      }
    });
  });

  // Elements for calculating totals
  const form = document.getElementById('orderForm');
  const orderSummary = document.getElementById('orderSummary');

  // Update totals on change events
  form.addEventListener('change', e => {
    const target = e.target;

    // For checkbox with quantity
    if (target.type === 'checkbox') {
      const label = target.closest('label');
      const qtyInput = label.querySelector('input[type="number"]');
      if (qtyInput) {
        qtyInput.disabled = !target.checked;
        if (!target.checked) qtyInput.value = 1;
      }
    }

    // For radio buttons in multi-option items
    if (target.type === 'radio') {
      const container = target.closest('.multi-option-item');
      if (container) {
        const qtyInput = container.querySelector('input[type="number"]');
        qtyInput.disabled = false;
        if (!qtyInput.value || qtyInput.value < 1) qtyInput.value = 1;
      }
    }

    updatePrices();
  });

  // Also listen for quantity changes to update totals immediately
  form.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value < 1) input.value = 1; // Prevent zero or negative
      updatePrices();
    });
  });

  function updatePrices() {
    let totalOrderPrice = 0;

    // Handle checkbox items (Kathi... and others)
    form.querySelectorAll('.content label').forEach(label => {
      const checkbox = label.querySelector('input[type="checkbox"]');
      const qtyInput = label.querySelector('input[type="number"]');
      const priceSpan = label.querySelector('.item-total');

      if (checkbox && qtyInput && priceSpan) {
        if (checkbox.checked) {
          const price = parseFloat(checkbox.dataset.price);
          const qty = parseInt(qtyInput.value) || 1;
          const itemTotal = price * qty;
          priceSpan.textContent = `₹${itemTotal.toFixed(0)}`;
          totalOrderPrice += itemTotal;
        } else {
          priceSpan.textContent = `₹0`;
        }
      }
    });

    // Handle multi-option items (Chula no Kamaal section)
    form.querySelectorAll('.multi-option-item').forEach(item => {
      const checkedRadio = item.querySelector('input[type="radio"]:checked');
      const qtyInput = item.querySelector('input[type="number"]');
      const priceSpan = item.querySelector('.item-total');

      if (checkedRadio && qtyInput && priceSpan) {
        const price = parseFloat(checkedRadio.dataset.price);
        const qty = parseInt(qtyInput.value) || 1;
        const itemTotal = price * qty;
        priceSpan.textContent = `₹${itemTotal.toFixed(0)}`;
        totalOrderPrice += itemTotal;
      } else {
        // No radio selected, reset price and disable qty
        if (qtyInput) {
          qtyInput.disabled = true;
          priceSpan.textContent = `₹0`;
        }
      }
    });

    // Update total in order summary
    orderSummary.textContent = `Total: ₹${totalOrderPrice.toFixed(0)}`;
  }

  // Initial price calculation in case some inputs are pre-filled
  updatePrices();
});

// WhatsApp order function (example)
function sendOrder() {
  const form = document.getElementById('orderForm');
  let orderText = '🛍️ *Bapu no Rotlo* - Take Away Order\n\n';

  // Collect selected items
  const lines = [];

  // Checkbox items
  form.querySelectorAll('.content label').forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    const qtyInput = label.querySelector('input[type="number"]');
    if (checkbox && checkbox.checked) {
      const itemName = label.textContent.trim().replace(/₹\d+/g, '').trim();
      const qty = qtyInput.value || 1;
      lines.push(`${itemName} x ${qty}`);
    }
  });

  // Multi-option items
  form.querySelectorAll('.multi-option-item').forEach(item => {
    const checkedRadio = item.querySelector('input[type="radio"]:checked');
    const qtyInput = item.querySelector('input[type="number"]');
    if (checkedRadio && qtyInput && !qtyInput.disabled) {
      const itemName = item.querySelector('.main-label').textContent.trim();
      const optionName = checkedRadio.parentElement.textContent.trim();
      const qty = qtyInput.value || 1;
      lines.push(`${itemName} (${optionName}) x ${qty}`);
    }
  });

  if (lines.length === 0) {
    alert('Please select at least one item before sending your order.');
    return;
  }

  orderText += lines.join('\n');

  // Append total
  const totalText = document.getElementById('orderSummary').textContent;
  orderText += `\n\n${totalText}`;

  // Encode text for WhatsApp URL
  const encodedText = encodeURIComponent(orderText);

  // WhatsApp URL - change the number to your business number
  const whatsappNumber = '919374128747'; // replace with your WhatsApp number with country code
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

  window.open(whatsappURL, '_blank');
}
