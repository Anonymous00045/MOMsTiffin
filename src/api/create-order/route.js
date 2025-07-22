async function handler({
  cartItems,
  deliveryAddressId,
  paymentMethod,
  deliveryTimeSlot,
  specialInstructions,
}) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: "Cart items are required" };
  }

  if (!deliveryAddressId) {
    return { error: "Delivery address is required" };
  }

  if (!paymentMethod) {
    return { error: "Payment method is required" };
  }

  try {
    const customerId = session.user.id;

    const addressResult = await sql`
      SELECT * FROM customer_addresses 
      WHERE id = ${deliveryAddressId} AND user_id = ${customerId}
    `;

    if (addressResult.length === 0) {
      return { error: "Invalid delivery address" };
    }

    const menuItemIds = cartItems.map((item) => item.menuItemId);
    const menuItems = await sql`
      SELECT mi.*, fm.id as food_maker_id 
      FROM menu_items mi
      JOIN food_makers fm ON mi.food_maker_id = fm.id
      WHERE mi.id = ANY(${menuItemIds}) AND mi.is_available = true
    `;

    if (menuItems.length !== cartItems.length) {
      return { error: "Some menu items are not available" };
    }

    const foodMakerIds = [
      ...new Set(menuItems.map((item) => item.food_maker_id)),
    ];
    if (foodMakerIds.length > 1) {
      return { error: "All items must be from the same food maker" };
    }

    const foodMakerId = foodMakerIds[0];

    let subtotal = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const menuItem = menuItems.find((mi) => mi.id === cartItem.menuItemId);
      const quantity = cartItem.quantity || 1;
      const unitPrice = parseFloat(menuItem.price);
      const totalPrice = unitPrice * quantity;

      subtotal += totalPrice;

      orderItemsData.push({
        menuItemId: cartItem.menuItemId,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
      });
    }

    const deliveryFee = subtotal >= 500 ? 0 : 50;
    const taxRate = 0.05;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + deliveryFee + taxAmount;

    const orderResult = await sql`
      INSERT INTO orders (
        customer_id, food_maker_id, delivery_address_id, 
        total_amount, delivery_fee, tax_amount,
        payment_method, delivery_time_slot, special_instructions,
        order_status, payment_status
      ) VALUES (
        ${customerId}, ${foodMakerId}, ${deliveryAddressId},
        ${totalAmount}, ${deliveryFee}, ${taxAmount},
        ${paymentMethod}, ${deliveryTimeSlot || null}, ${
      specialInstructions || null
    },
        'pending', 'pending'
      ) RETURNING id
    `;

    const orderId = orderResult[0].id;

    const orderItemQueries = orderItemsData.map(
      (item) =>
        sql`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
        VALUES (${orderId}, ${item.menuItemId}, ${item.quantity}, ${item.unitPrice}, ${item.totalPrice})
      `
    );

    await sql.transaction(orderItemQueries);

    await sql`
      UPDATE food_makers 
      SET total_orders = total_orders + 1 
      WHERE id = ${foodMakerId}
    `;

    return {
      success: true,
      orderId: orderId,
      totalAmount: totalAmount,
      deliveryFee: deliveryFee,
      taxAmount: taxAmount,
      subtotal: subtotal,
    };
  } catch (error) {
    console.error("Order creation error:", error);
    return { error: "Failed to create order" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}