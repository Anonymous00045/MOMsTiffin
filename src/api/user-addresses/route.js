async function handler({ method, addressId, address, userId: requestUserId }) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const userId = requestUserId || session.user.id;

  if (userId !== session.user.id) {
    return { error: "Unauthorized access" };
  }

  try {
    switch (method) {
      case "GET":
        const addresses = await sql`
          SELECT * FROM customer_addresses 
          WHERE user_id = ${userId} 
          ORDER BY is_default DESC, created_at DESC
        `;
        return { addresses };

      case "POST":
        if (
          !address?.address_line1 ||
          !address?.city ||
          !address?.state ||
          !address?.pin_code
        ) {
          return {
            error: "Required fields: address_line1, city, state, pin_code",
          };
        }

        let insertQuery = `
          INSERT INTO customer_addresses 
          (user_id, address_line1, address_line2, city, state, pin_code, address_type, label, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;

        const insertValues = [
          userId,
          address.address_line1,
          address.address_line2 || null,
          address.city,
          address.state,
          address.pin_code,
          address.address_type || "home",
          address.label || null,
          address.latitude || null,
          address.longitude || null,
        ];

        const [newAddress] = await sql(insertQuery, insertValues);
        return { address: newAddress };

      case "PUT":
        if (!addressId) {
          return { error: "Address ID required for update" };
        }

        const existingAddress = await sql`
          SELECT * FROM customer_addresses 
          WHERE id = ${addressId} AND user_id = ${userId}
        `;

        if (existingAddress.length === 0) {
          return { error: "Address not found" };
        }

        const setClauses = [];
        const updateValues = [];
        let paramCount = 1;

        if (address.address_line1) {
          setClauses.push(`address_line1 = $${paramCount}`);
          updateValues.push(address.address_line1);
          paramCount++;
        }
        if (address.address_line2 !== undefined) {
          setClauses.push(`address_line2 = $${paramCount}`);
          updateValues.push(address.address_line2);
          paramCount++;
        }
        if (address.city) {
          setClauses.push(`city = $${paramCount}`);
          updateValues.push(address.city);
          paramCount++;
        }
        if (address.state) {
          setClauses.push(`state = $${paramCount}`);
          updateValues.push(address.state);
          paramCount++;
        }
        if (address.pin_code) {
          setClauses.push(`pin_code = $${paramCount}`);
          updateValues.push(address.pin_code);
          paramCount++;
        }
        if (address.address_type) {
          setClauses.push(`address_type = $${paramCount}`);
          updateValues.push(address.address_type);
          paramCount++;
        }
        if (address.label !== undefined) {
          setClauses.push(`label = $${paramCount}`);
          updateValues.push(address.label);
          paramCount++;
        }
        if (address.latitude !== undefined) {
          setClauses.push(`latitude = $${paramCount}`);
          updateValues.push(address.latitude);
          paramCount++;
        }
        if (address.longitude !== undefined) {
          setClauses.push(`longitude = $${paramCount}`);
          updateValues.push(address.longitude);
          paramCount++;
        }

        if (setClauses.length === 0) {
          return { error: "No fields to update" };
        }

        const updateQuery = `
          UPDATE customer_addresses 
          SET ${setClauses.join(", ")} 
          WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
          RETURNING *
        `;

        updateValues.push(addressId, userId);
        const [updatedAddress] = await sql(updateQuery, updateValues);
        return { address: updatedAddress };

      case "DELETE":
        if (!addressId) {
          return { error: "Address ID required for deletion" };
        }

        const deleteResult = await sql`
          DELETE FROM customer_addresses 
          WHERE id = ${addressId} AND user_id = ${userId}
          RETURNING *
        `;

        if (deleteResult.length === 0) {
          return { error: "Address not found" };
        }

        return { message: "Address deleted successfully" };

      case "SET_DEFAULT":
        if (!addressId) {
          return { error: "Address ID required to set default" };
        }

        const addressToSetDefault = await sql`
          SELECT * FROM customer_addresses 
          WHERE id = ${addressId} AND user_id = ${userId}
        `;

        if (addressToSetDefault.length === 0) {
          return { error: "Address not found" };
        }

        await sql.transaction([
          sql`UPDATE customer_addresses SET is_default = false WHERE user_id = ${userId}`,
          sql`UPDATE customer_addresses SET is_default = true WHERE id = ${addressId} AND user_id = ${userId}`,
        ]);

        return { message: "Default address updated successfully" };

      default:
        return {
          error:
            "Invalid method. Supported: GET, POST, PUT, DELETE, SET_DEFAULT",
        };
    }
  } catch (error) {
    return { error: "Database operation failed: " + error.message };
  }
}
export async function POST(request) {
  return handler(await request.json());
}