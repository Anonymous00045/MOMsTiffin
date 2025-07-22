async function handler({
  pin_code,
  dietary_preference,
  meal_type,
  cuisine_type,
  search,
}) {
  const session = getSession();

  if (!session) {
    return { error: "Authentication required" };
  }

  let queryString = `
    SELECT 
      mi.id,
      mi.name,
      mi.description,
      mi.price,
      mi.image_url,
      mi.dietary_preference,
      mi.meal_type,
      mi.cuisine_type,
      mi.ingredients,
      mi.portion_size,
      mi.preparation_time,
      mi.is_available,
      fm.id as food_maker_id,
      fm.business_name,
      fm.rating,
      fm.total_orders,
      fm.preparation_time as maker_prep_time,
      u.name as maker_name
    FROM menu_items mi
    JOIN food_makers fm ON mi.food_maker_id = fm.id
    JOIN auth_users u ON fm.user_id = u.id
    WHERE mi.is_available = true
  `;

  const values = [];
  let paramCount = 0;

  if (pin_code) {
    paramCount++;
    queryString += ` AND $${paramCount} = ANY(fm.service_areas)`;
    values.push(pin_code);
  }

  if (dietary_preference) {
    paramCount++;
    queryString += ` AND mi.dietary_preference = $${paramCount}`;
    values.push(dietary_preference);
  }

  if (meal_type) {
    paramCount++;
    queryString += ` AND mi.meal_type = $${paramCount}`;
    values.push(meal_type);
  }

  if (cuisine_type) {
    paramCount++;
    queryString += ` AND mi.cuisine_type = $${paramCount}`;
    values.push(cuisine_type);
  }

  if (search) {
    paramCount++;
    queryString += ` AND (
      LOWER(mi.name) LIKE LOWER($${paramCount}) 
      OR LOWER(mi.description) LIKE LOWER($${paramCount})
      OR LOWER(fm.business_name) LIKE LOWER($${paramCount})
    )`;
    values.push(`%${search}%`);
  }

  queryString += ` ORDER BY fm.rating DESC, mi.name ASC`;

  try {
    const menuItems = await sql(queryString, values);

    return {
      success: true,
      items: menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        image_url: item.image_url,
        dietary_preference: item.dietary_preference,
        meal_type: item.meal_type,
        cuisine_type: item.cuisine_type,
        ingredients: item.ingredients,
        portion_size: item.portion_size,
        preparation_time: item.preparation_time,
        food_maker: {
          id: item.food_maker_id,
          business_name: item.business_name,
          name: item.maker_name,
          rating: parseFloat(item.rating),
          total_orders: item.total_orders,
          preparation_time: item.maker_prep_time,
        },
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch menu items" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}