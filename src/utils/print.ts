import type { Sale, ShopSettings } from '../types';

export const printReceipt = (sale: Sale, shopSettings: ShopSettings) => {
  const { printSettings } = shopSettings;
  
  // Create a hidden iframe for printing to avoid popup blockers
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const printWindow = iframe.contentWindow;
  if (!printWindow) return;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCategory = (cat: string) => {
    const categories: Record<string, string> = {
      ESPRESSO: 'Espresso',
      MANUAL_BREW: 'Manual Brew',
      NON_COFFEE: 'Non Coffee',
      FOOD: 'Food',
    };
    return categories[cat] || cat;
  };

  const paperWidthInch = printSettings.paperWidth / 25.4; // convert mm to inch
  const pageWidth = `${paperWidthInch}in`;

  let receiptContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Struk Pembayaran</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            background: #fff;
            padding: 0;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              width: ${pageWidth};
            }
          }
          
          .receipt-container {
            width: ${pageWidth};
            padding: 10px;
            margin: 0 auto;
          }
          
          .receipt-header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .shop-logo {
            font-size: 32px;
            margin: 5px 0;
          }
          
          .shop-name {
            font-weight: bold;
            font-size: 14px;
            margin: 5px 0;
          }
          
          .shop-info {
            font-size: 11px;
            line-height: 1.3;
            color: #333;
          }
          
          .receipt-section {
            margin-bottom: 10px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-top: 10px;
            margin-bottom: 5px;
            border-bottom: 1px dashed #000;
            padding-bottom: 3px;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 3px;
            line-height: 1.2;
          }
          
          .item-name {
            flex: 1;
            max-width: 60%;
            word-wrap: break-word;
          }
          
          .item-qty {
            text-align: center;
            min-width: 20px;
          }
          
          .item-price {
            text-align: right;
            min-width: 50px;
          }
          
          .summary-section {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 10px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 3px;
          }
          
          .summary-row.total {
            font-weight: bold;
            font-size: 12px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            margin-top: 5px;
          }
          
          .payment-info {
            font-size: 11px;
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          
          .payment-method {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
          }
          
          .thank-you {
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
  `;

  if (printSettings.showLogo && shopSettings.shopLogo) {
    const isImage = shopSettings.shopLogo.startsWith('http') || shopSettings.shopLogo.startsWith('data:image');
    if (isImage) {
      receiptContent += `<div class="shop-logo"><img src="${shopSettings.shopLogo}" style="max-width: 100%; max-height: 80px;" alt="Logo" /></div>`;
    } else {
      receiptContent += `<div class="shop-logo">${shopSettings.shopLogo}</div>`;
    }
  }

  receiptContent += `
            <div class="shop-name">${shopSettings.shopName}</div>
  `;

  if (printSettings.showAddress && shopSettings.address) {
    receiptContent += `<div class="shop-info">${shopSettings.address}</div>`;
  }

  if (shopSettings.phone) {
    receiptContent += `<div class="shop-info">${shopSettings.phone}</div>`;
  }

  receiptContent += `
            <div class="shop-info">${formatDate(sale.date)}</div>
          </div>
          
          <div class="receipt-section">
            <div class="section-title">DETAIL PESANAN</div>
  `;

  if (sale.customerName) {
    receiptContent += `<div class="item-row"><strong>Nama:</strong> <strong>${sale.customerName}</strong></div>`;
  }

  receiptContent += `
            <div class="item-row">
              <strong>Tipe:</strong>
              <strong>${sale.orderType === 'DINE_IN' ? 'Makan di Tempat' : 'Take Away'}</strong>
            </div>
          </div>
          
          <div class="receipt-section">
            <div class="section-title">ITEM</div>
  `;

  sale.items.forEach((item) => {
    const itemTotal = (item.product.basePrice) * item.qty;
    receiptContent += `
      <div class="item-row">
        <div class="item-name">${item.product.name}</div>
        <div class="item-qty">${item.qty}x</div>
        <div class="item-price">${formatCurrency(itemTotal)}</div>
      </div>
    `;
  });

  receiptContent += `
          </div>
          
          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${formatCurrency(sale.subtotal)}</span>
            </div>
  `;

  if (sale.discount > 0) {
    receiptContent += `
      <div class="summary-row">
        <span>Diskon</span>
        <span>- ${formatCurrency(sale.discount)}</span>
      </div>
    `;
  }

  if (sale.tax > 0) {
    receiptContent += `
      <div class="summary-row">
        <span>Pajak</span>
        <span>${formatCurrency(sale.tax)}</span>
      </div>
    `;
  }

  receiptContent += `
            <div class="summary-row total">
              <span>TOTAL</span>
              <span>${formatCurrency(sale.total)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="payment-method">
              <span>Pembayaran</span>
              <span>${sale.payment.method}</span>
            </div>
            <div class="payment-method">
              <span>Dibayar</span>
              <span>${formatCurrency(sale.payment.paidAmount)}</span>
            </div>
  `;

  if (sale.payment?.change > 0) {
    receiptContent += `
      <div class="payment-method">
        <span>Kembalian</span>
        <span>${formatCurrency(sale.payment?.change)}</span>
      </div>
    `;
  }

  receiptContent += `
          </div>
          
          <div class="footer">
            <div class="thank-you">Terima Kasih!</div>
            <div>Selamat datang kembali</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(receiptContent);
  printWindow.document.close();

  // Remove the iframe after printing
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000); // Wait for the print dialog to open before removing
};
