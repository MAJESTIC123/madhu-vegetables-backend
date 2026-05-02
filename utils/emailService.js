const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const formatQuantity = (quantity, unit) => {
  if (unit === 'kg') {
    if (quantity < 1) return `${(quantity * 1000).toFixed(0)} g`;
    return `${quantity} kg`;
  }
  if (unit === 'piece') return quantity === 1 ? '1 piece' : `${quantity} pieces`;
  if (unit === 'bundle') return quantity === 1 ? '1 bundle' : `${quantity} bundles`;
  return `${quantity} ${unit}`;
};

const sendOrderEmailToOwner = async (order) => {
  try {
    const itemsList = order.items.map(item => 
      `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatQuantity(item.quantity, item.unit)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${item.pricePerUnit}/${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${item.subtotal}</td>
      </tr>`
    ).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2e7d32;">🥬 New Order Received!</h2>
        <h3>Order ID: ${order.orderId}</h3>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN')}</p>
        
        <h3 style="color: #2e7d32;">Customer Details</h3>
        <p><strong>Name:</strong> ${order.customer.name}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Address:</strong> ${order.customer.address}</p>
        <p><strong>Pincode:</strong> ${order.customer.pincode}</p>
        ${order.customer.landmark ? `<p><strong>Landmark:</strong> ${order.customer.landmark}</p>` : ''}
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        
        <h3 style="color: #2e7d32;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
          </tr>
          ${itemsList}
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
          <p><strong>Items Total:</strong> ₹${order.itemsTotal}</p>
          <p><strong>Delivery Charge:</strong> ₹${order.deliveryCharge}</p>
          <h3 style="color: #2e7d32;">Total Amount: ₹${order.totalAmount}</h3>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>
      </div>
    `;

    const sendSmtpEmail = {
      subject: `🥬 New Order #${order.orderId} - ${order.customer.name}`,
      htmlContent: htmlContent,
      sender: { name: 'Madhu Vegetables', email: process.env.EMAIL_USER },
      to: [{ email: process.env.OWNER_EMAIL, name: 'Madhu Vegetables Owner' }]
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Order email sent to owner');
  } catch (error) {
    console.error('Email sending error:', error.message || error);
  }
};

const sendOrderConfirmationToCustomer = async (order, customerEmail) => {
  if (!customerEmail) return;
  
  try {
    const itemsList = order.items.map(item => 
      `<li>${item.productName} - ${formatQuantity(item.quantity, item.unit)} - ₹${item.subtotal}</li>`
    ).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2e7d32;">Thank you for your order!</h2>
        <p>Dear ${order.customer.name},</p>
        <p>Your order has been received and will be delivered soon.</p>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <h3>Items:</h3>
        <ul>${itemsList}</ul>
        <p><strong>Total: ₹${order.totalAmount}</strong> (Cash on Delivery)</p>
        <p>For any queries, contact: 9976988285</p>
        <p>Thank you,<br/>Madhu Vegetables</p>
      </div>
    `;

    const sendSmtpEmail = {
      subject: `Order Confirmation - Madhu Vegetables #${order.orderId}`,
      htmlContent: htmlContent,
      sender: { name: 'Madhu Vegetables', email: process.env.EMAIL_USER },
      to: [{ email: customerEmail, name: order.customer.name }]
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Customer confirmation email sent');
  } catch (error) {
    console.error('Customer email error:', error.message || error);
  }
};

module.exports = { sendOrderEmailToOwner, sendOrderConfirmationToCustomer };