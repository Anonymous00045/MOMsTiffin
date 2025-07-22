async function handler({ action, addressId, addressData }) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const userId = session.user.id;

  try {
    switch (action) {
      case "create":
        return await createAddress(userId, addressData);
      case "get":
        return await getUserAddresses(userId);
      case "update":
        return await updateAddress(userId, addressId, addressData);
      case "delete":
        return await deleteAddress(userId, addressId);
      case "setDefault":
        return await setDefaultAddress(userId, addressId);
      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Address management error:", error);
    return { error: "Database operation failed: " + error.message };
  }
}

async function createAddress(userId, addressData) {
  const {
    address_line1,
    address_line2,
    city,
    state,
    pin_code,
    address_type,
    label,
    latitude,
    longitude,
    // Also support alternative field names
    addressLine1,
    addressLine2,
    pinCode,
    addressType,
  } = addressData;

  // Use alternative field names if primary ones are not provided
  const line1 = address_line1 || addressLine1;
  const line2 = address_line2 || address_line2 || addressLine2;
  const pinCodeValue = pin_code || pinCode;
  const typeValue = address_type || addressType || "home";

  if (!line1 || !city || !state || !pinCodeValue) {
    return {
      error:
        "Required fields missing: address line 1, city, state, and PIN code are required",
    };
  }

  if (
    pinCodeValue.toString().length < 5 ||
    pinCodeValue.toString().length > 10
  ) {
    return { error: "Invalid PIN code - must be between 5-10 digits" };
  }

  const validTypes = ["home", "work", "other"];
  if (typeValue && !validTypes.includes(typeValue)) {
    return { error: "Invalid address type - must be home, work, or other" };
  }

  try {
    // Check if this is the first address for the user
    let isDefault = false;
    const existingAddresses =
      await sql`SELECT COUNT(*) as count FROM customer_addresses WHERE user_id = ${userId}`;
    if (existingAddresses[0].count === 0) {
      isDefault = true;
    }

    const result = await sql`
      INSERT INTO customer_addresses (
        user_id, address_line1, address_line2, city, state, pin_code, 
        address_type, label, is_default, latitude, longitude
      ) VALUES (
        ${userId}, ${line1}, ${
      line2 || null
    }, ${city}, ${state}, ${pinCodeValue.toString()},
        ${typeValue}, ${label || null}, ${isDefault}, ${latitude || null}, ${
      longitude || null
    }
      ) RETURNING *
    `;

    return {
      success: true,
      address: result[0],
      message: "Address added successfully",
    };
  } catch (dbError) {
    console.error("Database error creating address:", dbError);
    return { error: "Failed to save address to database" };
  }
}

async function getUserAddresses(userId) {
  const addresses = await sql`
    SELECT * FROM customer_addresses 
    WHERE user_id = ${userId} 
    ORDER BY is_default DESC, created_at DESC
  `;

  return { success: true, addresses };
}

async function updateAddress(userId, addressId, addressData) {
  if (!addressId) {
    return { error: "Address ID required" };
  }

  const existingAddress = await sql`
    SELECT * FROM customer_addresses 
    WHERE id = ${addressId} AND user_id = ${userId}
  `;

  if (existingAddress.length === 0) {
    return { error: "Address not found" };
  }

  const {
    address_line1,
    address_line2,
    city,
    state,
    pin_code,
    address_type,
    label,
    latitude,
    longitude,
  } = addressData;

  if (pin_code && (pin_code.length < 5 || pin_code.length > 10)) {
    return { error: "Invalid pin code" };
  }

  const validTypes = ["home", "work", "other"];
  if (address_type && !validTypes.includes(address_type)) {
    return { error: "Invalid address type" };
  }

  let updateQuery = "UPDATE customer_addresses SET ";
  const setClauses = [];
  const values = [];
  let paramCount = 0;

  if (address_line1) {
    setClauses.push(`address_line1 = $${++paramCount}`);
    values.push(address_line1);
  }
  if (address_line2 !== undefined) {
    setClauses.push(`address_line2 = $${++paramCount}`);
    values.push(address_line2);
  }
  if (city) {
    setClauses.push(`city = $${++paramCount}`);
    values.push(city);
  }
  if (state) {
    setClauses.push(`state = $${++paramCount}`);
    values.push(state);
  }
  if (pin_code) {
    setClauses.push(`pin_code = $${++paramCount}`);
    values.push(pin_code);
  }
  if (address_type) {
    setClauses.push(`address_type = $${++paramCount}`);
    values.push(address_type);
  }
  if (label !== undefined) {
    setClauses.push(`label = $${++paramCount}`);
    values.push(label);
  }
  if (latitude !== undefined) {
    setClauses.push(`latitude = $${++paramCount}`);
    values.push(latitude);
  }
  if (longitude !== undefined) {
    setClauses.push(`longitude = $${++paramCount}`);
    values.push(longitude);
  }

  if (setClauses.length === 0) {
    return { error: "No fields to update" };
  }

  updateQuery += setClauses.join(", ");
  updateQuery += ` WHERE id = $${++paramCount} AND user_id = $${++paramCount} RETURNING *`;
  values.push(addressId, userId);

  const result = await sql(updateQuery, values);

  return { success: true, address: result[0] };
}

async function deleteAddress(userId, addressId) {
  if (!addressId) {
    return { error: "Address ID required" };
  }

  const existingAddress = await sql`
    SELECT * FROM customer_addresses 
    WHERE id = ${addressId} AND user_id = ${userId}
  `;

  if (existingAddress.length === 0) {
    return { error: "Address not found" };
  }

  const wasDefault = existingAddress[0].is_default;

  await sql`DELETE FROM customer_addresses WHERE id = ${addressId} AND user_id = ${userId}`;

  if (wasDefault) {
    const remainingAddresses = await sql`
      SELECT * FROM customer_addresses 
      WHERE user_id = ${userId} 
      ORDER BY created_at ASC 
      LIMIT 1
    `;

    if (remainingAddresses.length > 0) {
      await sql`
        UPDATE customer_addresses 
        SET is_default = true 
        WHERE id = ${remainingAddresses[0].id}
      `;
    }
  }

  return { success: true, message: "Address deleted successfully" };
}

async function setDefaultAddress(userId, addressId) {
  if (!addressId) {
    return { error: "Address ID required" };
  }

  const existingAddress = await sql`
    SELECT * FROM customer_addresses 
    WHERE id = ${addressId} AND user_id = ${userId}
  `;

  if (existingAddress.length === 0) {
    return { error: "Address not found" };
  }

  const queries = [
    sql`UPDATE customer_addresses SET is_default = false WHERE user_id = ${userId}`,
    sql`UPDATE customer_addresses SET is_default = true WHERE id = ${addressId} AND user_id = ${userId}`,
  ];

  await sql.transaction(queries);

  return { success: true, message: "Default address updated successfully" };
}
export async function POST(request) {
  return handler(await request.json());
}