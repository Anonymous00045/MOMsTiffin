async function handler({
  personalInfo,
  businessDetails,
  documentUrls,
  qualityChecklist,
}) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  if (!personalInfo || !businessDetails || !documentUrls || !qualityChecklist) {
    return { error: "All verification sections are required" };
  }

  if (
    !personalInfo.fullName ||
    !personalInfo.phoneNumber ||
    !personalInfo.address
  ) {
    return { error: "Personal information is incomplete" };
  }

  if (
    !businessDetails.businessName ||
    !businessDetails.businessType ||
    !businessDetails.serviceAreas
  ) {
    return { error: "Business details are incomplete" };
  }

  if (
    !documentUrls.identityProof ||
    !documentUrls.addressProof ||
    !documentUrls.businessLicense
  ) {
    return { error: "Required documents are missing" };
  }

  try {
    const userId = session.user.id;

    const existingProfile = await sql`
      SELECT up.*, fm.id as food_maker_id 
      FROM user_profiles up
      LEFT JOIN food_makers fm ON up.user_id = fm.user_id
      WHERE up.user_id = ${userId} AND up.user_type = 'food_maker'
    `;

    if (existingProfile.length === 0) {
      return {
        error:
          "Food maker profile not found. Please complete profile setup first.",
      };
    }

    const foodMakerId = existingProfile[0].food_maker_id;
    if (!foodMakerId) {
      return { error: "Food maker record not found" };
    }

    const existingVerification = await sql`
      SELECT id, status FROM food_maker_verifications 
      WHERE food_maker_id = ${foodMakerId}
    `;

    if (existingVerification.length > 0) {
      const status = existingVerification[0].status;
      if (status === "approved") {
        return { error: "You are already verified" };
      }
      if (status === "pending") {
        return { error: "Your verification is already under review" };
      }
    }

    const verificationData = {
      food_maker_id: foodMakerId,
      personal_info: JSON.stringify(personalInfo),
      business_details: JSON.stringify(businessDetails),
      document_urls: JSON.stringify(documentUrls),
      quality_checklist: JSON.stringify(qualityChecklist),
      status: "pending",
      submitted_at: new Date().toISOString(),
    };

    let verificationResult;

    if (existingVerification.length > 0) {
      verificationResult = await sql`
        UPDATE food_maker_verifications 
        SET personal_info = ${verificationData.personal_info},
            business_details = ${verificationData.business_details},
            document_urls = ${verificationData.document_urls},
            quality_checklist = ${verificationData.quality_checklist},
            status = ${verificationData.status},
            submitted_at = ${verificationData.submitted_at},
            reviewed_at = NULL,
            admin_notes = NULL
        WHERE food_maker_id = ${foodMakerId}
        RETURNING *
      `;
    } else {
      verificationResult = await sql`
        INSERT INTO food_maker_verifications (
          food_maker_id, personal_info, business_details, 
          document_urls, quality_checklist, status, submitted_at
        ) VALUES (
          ${verificationData.food_maker_id}, ${verificationData.personal_info}, 
          ${verificationData.business_details}, ${verificationData.document_urls}, 
          ${verificationData.quality_checklist}, ${verificationData.status}, 
          ${verificationData.submitted_at}
        ) RETURNING *
      `;
    }

    await sql`
      UPDATE food_makers 
      SET is_verified = false 
      WHERE id = ${foodMakerId}
    `;

    const adminNotification = {
      type: "verification_submission",
      food_maker_id: foodMakerId,
      business_name: businessDetails.businessName,
      submitted_by: session.user.name || session.user.email,
      submitted_at: verificationData.submitted_at,
    };

    try {
      await sql`
        INSERT INTO admin_notifications (
          type, data, created_at, is_read
        ) VALUES (
          ${adminNotification.type}, ${JSON.stringify(adminNotification)}, 
          ${verificationData.submitted_at}, false
        )
      `;
    } catch (notificationError) {
      console.error("Failed to create admin notification:", notificationError);
    }

    return {
      success: true,
      verificationId: verificationResult[0].id,
      status: "pending",
      message:
        "Verification submitted successfully. You will be notified once reviewed.",
      submittedAt: verificationData.submitted_at,
    };
  } catch (error) {
    console.error("Verification submission error:", error);
    return { error: "Failed to submit verification. Please try again." };
  }
}
export async function POST(request) {
  return handler(await request.json());
}