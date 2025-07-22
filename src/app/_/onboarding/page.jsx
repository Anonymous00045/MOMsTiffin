"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [upload, { loading: uploading }] = useUpload();
  const { signUpWithCredentials } = useAuth();

  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    businessName: "",
    businessDescription: "",
    cuisineTypes: [],
    serviceAreas: [],
    kitchenLicense: "",
  });

  const totalSteps = 5;
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

  const tourSteps = [
    {
      title: "Welcome to Moms' Tiffin!",
      description: "Your platform for authentic homemade food",
      icon: "fa-home",
      color: "orange",
    },
    {
      title: "Browse Delicious Meals",
      description: "Discover homemade food from local moms in your area",
      icon: "fa-utensils",
      color: "green",
    },
    {
      title: "Easy Ordering",
      description: "Order with just a few taps and get food delivered fresh",
      icon: "fa-shopping-cart",
      color: "blue",
    },
    {
      title: "Safe & Secure",
      description: "All our food makers are verified for quality and safety",
      icon: "fa-shield-alt",
      color: "purple",
    },
  ];

  const handleAccountChange = (field, value) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCuisineToggle = (cuisine) => {
    setProfileData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const handleServiceAreaAdd = (area) => {
    if (area && !profileData.serviceAreas.includes(area)) {
      setProfileData((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, area],
      }));
    }
  };

  const handleServiceAreaRemove = (area) => {
    setProfileData((prev) => ({
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

  const validateStep = (step) => {
    setError("");

    switch (step) {
      case 2:
        if (!accountData.name || !accountData.email || !accountData.password) {
          setError("Please fill in all required fields");
          return false;
        }
        if (accountData.password !== accountData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        if (accountData.password.length < 6) {
          setError("Password must be at least 6 characters");
          return false;
        }
        break;
      case 3:
        if (!userType) {
          setError("Please select your role");
          return false;
        }
        break;
      case 4:
        if (
          !profileData.phone ||
          !profileData.address ||
          !profileData.city ||
          !profileData.state ||
          !profileData.pinCode
        ) {
          setError("Please fill in all required fields");
          return false;
        }
        if (
          userType === "food_maker" &&
          (!profileData.businessName || profileData.cuisineTypes.length === 0)
        ) {
          setError("Please complete business information");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await signUpWithCredentials({
        email: accountData.email,
        password: accountData.password,
        callbackUrl: "/onboarding",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      nextStep();
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Onboarding completed:", {
        userType,
        profileData,
        profileImage,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowTour(true);
    } catch (err) {
      setError("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeTour = () => {
    window.location.href = "/";
  };

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  if (showTour) {
    const currentTourStep = tourSteps[tourStep];
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div
              className={`w-20 h-20 bg-${currentTourStep.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <i
                className={`fas ${currentTourStep.icon} text-${currentTourStep.color}-600 text-3xl`}
              ></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentTourStep.title}
            </h2>
            <p className="text-gray-600">{currentTourStep.description}</p>
          </div>

          <div className="flex justify-center space-x-2 mb-8">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === tourStep ? "bg-orange-500" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={skipTour}
              className="flex-1 py-3 text-gray-600 font-medium"
            >
              Skip Tour
            </button>
            <button
              onClick={nextTourStep}
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
            >
              {tourStep === tourSteps.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-utensils text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Moms' Tiffin
          </h1>
          <p className="text-gray-600">
            Let's get you started with authentic homemade food
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep > index + 1
                      ? "bg-green-500 text-white"
                      : currentStep === index + 1
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <i className="fas fa-check text-xs"></i>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`w-8 md:w-16 h-1 transition-all ${
                      currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
            <span>Welcome</span>
            <span>Account</span>
            <span>Role</span>
            <span>Profile</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-heart text-orange-500 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Homemade Food, Made with Love
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Connect with local moms who cook authentic, delicious meals just
                like home. Fresh, healthy, and made with care.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-search text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Discover</h3>
                  <p className="text-sm text-gray-600">
                    Find amazing home cooks in your area
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-shopping-bag text-green-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Order</h3>
                  <p className="text-sm text-gray-600">
                    Easy ordering with quick delivery
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-smile text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Enjoy</h3>
                  <p className="text-sm text-gray-600">
                    Taste authentic homemade flavors
                  </p>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 2: Account Creation */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Create Your Account
              </h2>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={accountData.name}
                    onChange={(e) =>
                      handleAccountChange("name", e.target.value)
                    }
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={accountData.email}
                    onChange={(e) =>
                      handleAccountChange("email", e.target.value)
                    }
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={accountData.password}
                    onChange={(e) =>
                      handleAccountChange("password", e.target.value)
                    }
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={accountData.confirmPassword}
                    onChange={(e) =>
                      handleAccountChange("confirmPassword", e.target.value)
                    }
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Role Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                How would you like to use Moms' Tiffin?
              </h2>

              <div className="max-w-2xl mx-auto space-y-4">
                <div
                  onClick={() => setUserType("customer")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    userType === "customer"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                      <i className="fas fa-user text-blue-600 text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        I'm a Customer
                      </h3>
                      <p className="text-gray-600">
                        I want to order delicious homemade food from local moms
                      </p>
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <i className="fas fa-check mr-2"></i>
                        <span>Browse local food makers</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <i className="fas fa-check mr-2"></i>
                        <span>Order fresh homemade meals</span>
                      </div>
                    </div>
                    {userType === "customer" && (
                      <i className="fas fa-check-circle text-orange-500 text-2xl"></i>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setUserType("food_maker")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    userType === "food_maker"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-6">
                      <i className="fas fa-utensils text-green-600 text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        I'm a Food Maker
                      </h3>
                      <p className="text-gray-600">
                        I want to share my homemade food and earn from cooking
                      </p>
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <i className="fas fa-check mr-2"></i>
                        <span>Sell your homemade food</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <i className="fas fa-check mr-2"></i>
                        <span>Manage orders and earnings</span>
                      </div>
                    </div>
                    {userType === "food_maker" && (
                      <i className="fas fa-check-circle text-orange-500 text-2xl"></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Profile Setup */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Complete Your Profile
              </h2>

              {/* Profile Image Upload */}
              <div className="mb-8 text-center">
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

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={profileData.pinCode}
                      onChange={(e) =>
                        handleProfileChange("pinCode", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="PIN Code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={(e) =>
                      handleProfileChange("address", e.target.value)
                    }
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      value={profileData.city}
                      onChange={(e) =>
                        handleProfileChange("city", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      value={profileData.state}
                      onChange={(e) =>
                        handleProfileChange("state", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>

                {/* Food Maker Specific Fields */}
                {userType === "food_maker" && (
                  <>
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Business Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name *
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            value={profileData.businessName}
                            onChange={(e) =>
                              handleProfileChange(
                                "businessName",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., Sunita's Kitchen"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Description
                          </label>
                          <textarea
                            name="businessDescription"
                            value={profileData.businessDescription}
                            onChange={(e) =>
                              handleProfileChange(
                                "businessDescription",
                                e.target.value
                              )
                            }
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Tell customers about your cooking style and specialties"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cuisine Types * (Select at least one)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {cuisineOptions.map((cuisine) => (
                              <button
                                key={cuisine}
                                type="button"
                                onClick={() => handleCuisineToggle(cuisine)}
                                className={`p-2 text-sm rounded-lg border transition-all ${
                                  profileData.cuisineTypes.includes(cuisine)
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
                              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                              className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profileData.serviceAreas.map((area) => (
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
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Completion */}
          {currentStep === 5 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-green-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome to Moms' Tiffin!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your account has been created successfully.
                {userType === "customer"
                  ? " You can now start exploring delicious homemade food in your area."
                  : " You can now start sharing your amazing homemade food with others."}
              </p>

              <div className="bg-orange-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-800 mb-3">
                  What's Next?
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {userType === "customer" ? (
                    <>
                      <div className="flex items-center">
                        <i className="fas fa-search text-orange-500 mr-2"></i>
                        <span>Browse food makers in your area</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-shopping-cart text-orange-500 mr-2"></i>
                        <span>Place your first order</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-star text-orange-500 mr-2"></i>
                        <span>Rate and review your meals</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <i className="fas fa-plus text-orange-500 mr-2"></i>
                        <span>Add your first menu items</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-clock text-orange-500 mr-2"></i>
                        <span>Set your availability hours</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-chart-line text-orange-500 mr-2"></i>
                        <span>Start receiving orders</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={completeOnboarding}
                disabled={loading}
                className="px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Setting up...
                  </div>
                ) : (
                  "Continue to App"
                )}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep > 1 && currentStep < 5 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>

              {currentStep === 2 ? (
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <>
                      Create Account
                      <i className="fas fa-arrow-right ml-2"></i>
                    </>
                  )}
                </button>
              ) : currentStep === 4 ? (
                <button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      Complete Setup
                      <i className="fas fa-arrow-right ml-2"></i>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;