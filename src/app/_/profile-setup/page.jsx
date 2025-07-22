"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [upload, { loading: uploading }] = useUpload();
  const { data: user, loading: userLoading } = useUser();

  const [formData, setFormData] = useState({
    // Common fields
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",

    // Food maker specific
    businessName: "",
    businessDescription: "",
    cuisineTypes: [],
    serviceAreas: [],
    kitchenLicense: "",

    // Distributor specific
    vehicleType: "",
    vehicleNumber: "",
    drivingLicense: "",
    vehicleCapacity: "",
    deliveryRadius: "",
  });

  const cuisineOptions = [
    "North Indian",
    "South Indian",
    "Bengali",
    "Gujarati",
    "Punjabi",
    "Maharashtrian",
    "Rajasthani",
    "Tamil",
    "Kerala",
    "Chinese",
    "Continental",
    "Italian",
    "Mexican",
    "Thai",
    "Other",
  ];

  const vehicleTypes = [
    "Bicycle",
    "Motorcycle",
    "Scooter",
    "Car",
    "Van",
    "Truck",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCuisineToggle = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const handleServiceAreaAdd = (area) => {
    if (area && !formData.serviceAreas.includes(area)) {
      setFormData((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, area],
      }));
    }
  };

  const handleServiceAreaRemove = (area) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((a) => a !== area),
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      setLoading(true);
      const { url, error } = await upload({ file });
      if (error) {
        setError("Failed to upload image");
        return;
      }
      setProfileImage(url);
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate required fields
      if (
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.pinCode
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (
        userType === "food_maker" &&
        (!formData.businessName || formData.cuisineTypes.length === 0)
      ) {
        setError("Please complete business information");
        return;
      }

      if (
        userType === "distributor" &&
        (!formData.vehicleType ||
          !formData.vehicleNumber ||
          !formData.drivingLicense)
      ) {
        setError("Please complete vehicle information");
        return;
      }

      // Here you would typically make an API call to save the profile
      console.log("Profile data:", { userType, ...formData, profileImage });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to appropriate dashboard
      window.location.href = "/moms-tiffin";
    } catch (err) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !userType) {
      setError("Please select your user type");
      return;
    }
    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Let's set up your account to get started
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 3 ? "bg-orange-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>User Type</span>
            <span>Basic Info</span>
            <span>Role Details</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: User Type Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                What describes you best?
              </h2>
              <div className="space-y-4">
                <div
                  onClick={() => setUserType("customer")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    userType === "customer"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-user text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Customer</h3>
                      <p className="text-gray-600 text-sm">
                        I want to order homemade food
                      </p>
                    </div>
                    {userType === "customer" && (
                      <i className="fas fa-check-circle text-orange-500 ml-auto text-xl"></i>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setUserType("food_maker")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    userType === "food_maker"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-utensils text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Food Maker
                      </h3>
                      <p className="text-gray-600 text-sm">
                        I want to sell homemade food
                      </p>
                    </div>
                    {userType === "food_maker" && (
                      <i className="fas fa-check-circle text-orange-500 ml-auto text-xl"></i>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setUserType("distributor")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    userType === "distributor"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-truck text-purple-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Distributor
                      </h3>
                      <p className="text-gray-600 text-sm">
                        I want to deliver food orders
                      </p>
                    </div>
                    {userType === "distributor" && (
                      <i className="fas fa-check-circle text-orange-500 ml-auto text-xl"></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Basic Information
              </h2>

              {/* Profile Image Upload */}
              <div className="mb-6 text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-camera text-gray-400 text-2xl"></i>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProfileImageFile(e.target.files[0]);
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-plus text-white text-sm"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Upload profile picture
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={(e) =>
                      handleInputChange("pinCode", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="PIN Code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Role-specific Information */}
          {currentStep === 3 && (
            <div>
              {userType === "customer" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    You're all set!
                  </h2>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <p className="text-gray-600">
                      Your customer profile is ready. You can now start ordering
                      delicious homemade food!
                    </p>
                  </div>
                </div>
              )}

              {userType === "food_maker" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Business Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={(e) =>
                          handleInputChange("businessName", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Sunita's Kitchen"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        name="businessDescription"
                        value={formData.businessDescription}
                        onChange={(e) =>
                          handleInputChange(
                            "businessDescription",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Tell customers about your cooking style and specialties"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine Types *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cuisineOptions.map((cuisine) => (
                          <button
                            key={cuisine}
                            type="button"
                            onClick={() => handleCuisineToggle(cuisine)}
                            className={`p-2 text-sm rounded-lg border transition-all ${
                              formData.cuisineTypes.includes(cuisine)
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white text-gray-700 border-gray-300 hover:border-orange-300"
                            }`}
                          >
                            {cuisine}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Areas (PIN Codes)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Enter PIN code"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleServiceAreaAdd(e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            handleServiceAreaAdd(input.value);
                            input.value = "";
                          }}
                          className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.serviceAreas.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                          >
                            {area}
                            <button
                              type="button"
                              onClick={() => handleServiceAreaRemove(area)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kitchen License Number
                      </label>
                      <input
                        type="text"
                        name="kitchenLicense"
                        value={formData.kitchenLicense}
                        onChange={(e) =>
                          handleInputChange("kitchenLicense", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="FSSAI License Number (if available)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {userType === "distributor" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Vehicle Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type *
                      </label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={(e) =>
                          handleInputChange("vehicleType", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select vehicle type</option>
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={(e) =>
                          handleInputChange("vehicleNumber", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., MH01AB1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driving License Number *
                      </label>
                      <input
                        type="text"
                        name="drivingLicense"
                        value={formData.drivingLicense}
                        onChange={(e) =>
                          handleInputChange("drivingLicense", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Driving License Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Capacity
                      </label>
                      <input
                        type="text"
                        name="vehicleCapacity"
                        value={formData.vehicleCapacity}
                        onChange={(e) =>
                          handleInputChange("vehicleCapacity", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., 50 kg or 20 orders"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Radius (km)
                      </label>
                      <input
                        type="number"
                        name="deliveryRadius"
                        value={formData.deliveryRadius}
                        onChange={(e) =>
                          handleInputChange("deliveryRadius", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Maximum delivery distance"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </div>
                ) : (
                  "Complete Setup"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;