interface InvoiceData {
  invoiceNumber: string
  bookingId: string
  customerName: string
  customerEmail: string
  weekId: string
  startDate: string
  endDate: string
  participants: Array<{
    name: string
    email: string
  }>
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  currency: string
  issueDate: string
  dueDate: string
}

export function generateInvoiceHTML(invoiceData: InvoiceData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceData.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-info { text-align: left; }
        .customer-info { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Heiwa House</h1>
        <h2>Surf Camp Invoice</h2>
      </div>

      <div class="invoice-details">
        <div class="company-info">
          <h3>Heiwa House</h3>
          <p>Mazatlan, Mexico</p>
          <p>support@heiwa.house</p>
        </div>
        <div class="customer-info">
          <h3>Invoice To:</h3>
          <p>${invoiceData.customerName}</p>
          <p>${invoiceData.customerEmail}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}<br>
        <strong>Booking ID:</strong> ${invoiceData.bookingId}<br>
        <strong>Issue Date:</strong> ${invoiceData.issueDate}<br>
        <strong>Due Date:</strong> ${invoiceData.dueDate}
      </div>

      <div style="margin-bottom: 20px;">
        <strong>Surf Week:</strong> ${invoiceData.weekId}<br>
        <strong>Dates:</strong> ${invoiceData.startDate} - ${invoiceData.endDate}
      </div>

      <div style="margin-bottom: 20px;">
        <strong>Participants:</strong>
        <ul>
          ${invoiceData.participants.map(p => `<li>${p.name} (${p.email})</li>`).join('')}
        </ul>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${invoiceData.currency} ${item.unitPrice.toFixed(2)}</td>
              <td>${invoiceData.currency} ${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <p>Subtotal: ${invoiceData.currency} ${invoiceData.subtotal.toFixed(2)}</p>
        <p>Tax (16%): ${invoiceData.currency} ${invoiceData.tax.toFixed(2)}</p>
        <p class="total-row">Total: ${invoiceData.currency} ${invoiceData.total.toFixed(2)}</p>
      </div>

      <div class="footer">
        <p>Thank you for choosing Heiwa House!</p>
        <p>Questions? Contact us at support@heiwa.house</p>
        <p>Payment is due within 7 days of invoice date.</p>
      </div>
    </body>
    </html>
  `
}

export function generateInvoiceData(
  bookingId: string,
  customerName: string,
  customerEmail: string,
  weekId: string,
  participants: Array<{ name: string; email: string }>,
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>,
  subtotal: number,
  tax: number,
  total: number,
  currency: string = 'MXN',
  startDate: string,
  endDate: string
): InvoiceData {
  const invoiceNumber = `INV-${Date.now()}`
  const issueDate = new Date().toLocaleDateString()
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return {
    invoiceNumber,
    bookingId,
    customerName,
    customerEmail,
    weekId,
    startDate,
    endDate,
    participants,
    items,
    subtotal,
    tax,
    total,
    currency,
    issueDate,
    dueDate
  }
}

// Mock function to "send" invoice via email
export async function sendInvoiceEmail(invoiceData: InvoiceData): Promise<boolean> {
  console.log('Mock: Sending invoice email to:', invoiceData.customerEmail)
  console.log('Invoice number:', invoiceData.invoiceNumber)
  console.log('Total amount:', invoiceData.currency, invoiceData.total)

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return true
}
