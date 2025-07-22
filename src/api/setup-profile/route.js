async function handler({
  userType,
  phoneNumber,
  profileImage,
  businessName,
  description,
  speciality,
  serviceAreas,
  preparationTime,
  vehicleType,
  vehicleNumber,
  licenseNumber,
}) {
  const session = getSession();

  if (!session || !session.user?.id) {
    return { error: "Authentication required" };
  }

  if (
    !userType ||
    !["customer", "food_maker", "distributor"].includes(userType)
  ) {
    return { error: "Valid user type is required" };
  }

  try {
    let profileImageUrl = null;
    if (profileImage) {
      const uploadResult = await upload({ base64: profileImage });
      if (uploadResult.error) {
        return { error: "Failed to upload profile image" };
      }
      profileImageUrl = uploadResult.url;
    }

    const existingProfile = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (existingProfile.length > 0) {
      return { error: "Profile already exists" };
    }

    if (userType === "food_maker") {
      const [profileResult, foodMakerResult] = await sql.transaction([
        sql`
          INSERT INTO user_profiles (user_id, user_type, phone_number, profile_image)
          VALUES (${session.user.id}, ${userType}, ${phoneNumber}, ${profileImageUrl})
          RETURNING id
        `,
        sql`
          INSERT INTO food_makers (user_id, business_name, description, speciality, service_areas, preparation_time)
          VALUES (${
            session.user.id
          }, ${businessName}, ${description}, ${speciality}, ${
          serviceAreas || []
        }, ${preparationTime || 60})
          RETURNING id
        `,
      ]);

      return {
        success: true,
        profileId: profileResult[0].id,
        foodMakerId: foodMakerResult[0].id,
        userType,
      };
    }

    if (userType === "distributor") {
      const profileResult = await sql`
        INSERT INTO user_profiles (user_id, user_type, phone_number, profile_image)
        VALUES (${session.user.id}, ${userType}, ${phoneNumber}, ${profileImageUrl})
        RETURNING id
      `;

      return {
        success: true,
        profileId: profileResult[0].id,
        userType,
        vehicleInfo: {
          vehicleType,
          vehicleNumber,
          licenseNumber,
        },
      };
    }

    const profileResult = await sql`
      INSERT INTO user_profiles (user_id, user_type, phone_number, profile_image)
      VALUES (${session.user.id}, ${userType}, ${phoneNumber}, ${profileImageUrl})
      RETURNING id
    `;

    return {
      success: true,
      profileId: profileResult[0].id,
      userType,
    };
  } catch (error) {
    return { error: "Failed to create profile" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}