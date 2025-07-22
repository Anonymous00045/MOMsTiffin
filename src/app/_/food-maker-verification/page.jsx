"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("not_started");
  const [documents, setDocuments] = useState({
    fssaiLicense: null,
    aadhaarCard: null,
    kitchenPhotos: [],
    businessProof: null,
    bankStatement: null,
  });
  const [documentUrls, setDocumentUrls] = useState({
    fssaiLicense: "",
    aadhaarCard: "",
    kitchenPhotos: [],
    businessProof: "",
    bankStatement: "",
  });
  const [qualityChecklist, setQualityChecklist] = useState({
    cleanKitchen: false,
    properStorage: false,
    freshIngredients: false,
    hygieneStandards: false,
    packagingQuality: false,
    temperatureControl: false,
    wasteMgmt: false,
    waterQuality: false,
  });
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    businessType: "",
    yearsOfExperience: "",
    specialties: [],
    servingCapacity: "",
    operatingHours: {
      start: "",
      end: "",
    },
    workingDays: [],
  });
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phoneNumber: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    emergencyContact: "",
  });

  const [upload, { loading: uploading }] = useUpload();
  const { data: user, loading: userLoading } = useUser();

  const totalSteps = 5;
  const stepTitles = [
    "Personal Information",
    "Business Details",
    "Document Upload",
    "Quality Standards",
    "Review & Submit",
  ];

  const specialtyOptions = [
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
    "Desserts",
    "Snacks",
  ];

  const workingDayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Load existing verification status
  useEffect(() => {
    if (user) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      const response = await fetch("/api/verification-status", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.status) {
          setVerificationStatus(data.status);
          if (data.documents) {
            setDocumentUrls(data.documents);
          }
        }
      }
    } catch (error) {
      console.error("Error loading verification status:", error);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    try {
      setLoading(true);
      const { url, error } = await upload({ file });
      if (error) {
        setError(`Failed to upload ${documentType}: ${error}`);
        return;
      }

      setDocumentUrls((prev) => ({
        ...prev,
        [documentType]:
          documentType === "kitchenPhotos" ? [...prev.kitchenPhotos, url] : url,
      }));

      setDocuments((prev) => ({
        ...prev,
        [documentType]:
          documentType === "kitchenPhotos"
            ? [...prev.kitchenPhotos, file]
            : file,
      }));

      setSuccess(`${documentType} uploaded successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to upload ${documentType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setBusinessInfo((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleWorkingDayToggle = (day) => {
    setBusinessInfo((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleQualityChecklistChange = (item) => {
    setQualityChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          personalInfo.fullName &&
          personalInfo.phoneNumber &&
          personalInfo.email &&
          personalInfo.address &&
          personalInfo.city
        );
      case 2:
        return (
          businessInfo.businessName &&
          businessInfo.businessType &&
          businessInfo.specialties.length > 0 &&
          businessInfo.workingDays.length > 0
        );
      case 3:
        return (
          documentUrls.fssaiLicense &&
          documentUrls.aadhaarCard &&
          documentUrls.kitchenPhotos.length >= 3
        );
      case 4:
        return Object.values(qualityChecklist).filter(Boolean).length >= 6;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError("Please complete all required fields before proceeding");
      return;
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitVerification = async () => {
    try {
      setLoading(true);
      setError("");

      const verificationData = {
        personalInfo,
        businessInfo,
        documentUrls,
        qualityChecklist,
        submissionDate: new Date().toISOString(),
      };

      const response = await fetch("/api/submit-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        throw new Error(`Verification submission failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setVerificationStatus("pending");
        setSuccess(
          "Verification submitted successfully! We'll review your application within 2-3 business days."
        );
      } else {
        setError(data.error || "Failed to submit verification");
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      setError("Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access verification
          </p>
          <a
            href="/account/signin?callbackUrl=/food-maker-verification"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Show status if already submitted
  if (
    verificationStatus === "pending" ||
    verificationStatus === "approved" ||
    verificationStatus === "rejected"
  ) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                verificationStatus === "approved"
                  ? "bg-green-100"
                  : verificationStatus === "pending"
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              <i
                className={`fas text-2xl ${
                  verificationStatus === "approved"
                    ? "fa-check text-green-600"
                    : verificationStatus === "pending"
                    ? "fa-clock text-yellow-600"
                    : "fa-times text-red-600"
                }`}
              ></i>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {verificationStatus === "approved"
                ? "Verification Approved!"
                : verificationStatus === "pending"
                ? "Verification Under Review"
                : "Verification Rejected"}
            </h1>

            <p className="text-gray-600 mb-6">
              {verificationStatus === "approved"
                ? "Congratulations! You can now start selling on our platform."
                : verificationStatus === "pending"
                ? "We're reviewing your application. This usually takes 2-3 business days."
                : "Your verification was rejected. Please contact support for more details."}
            </p>

            {verificationStatus === "approved" && (
              <a
                href="/food-maker-dashboard"
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
              >
                Go to Dashboard
              </a>
            )}

            {verificationStatus === "rejected" && (
              <button
                onClick={() => setVerificationStatus("not_started")}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
              >
                Reapply
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Food Maker Verification
          </h1>
          <p className="text-gray-600">
            Complete the verification process to start selling on our platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > i + 1
                      ? "bg-green-500 text-white"
                      : currentStep === i + 1
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > i + 1 ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > i + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {stepTitles.map((title, i) => (
              <span key={i} className="text-center">
                {title}
              </span>
            ))}
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

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phoneNumber}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.alternatePhone}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        alternatePhone: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Alternate phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={personalInfo.address}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your complete address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.city}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={personalInfo.state}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={personalInfo.pinCode}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        pinCode: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="PIN Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.emergencyContact}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Business Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessInfo.businessName}
                      onChange={(e) =>
                        setBusinessInfo((prev) => ({
                          ...prev,
                          businessName: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Sunita's Kitchen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      value={businessInfo.businessType}
                      onChange={(e) =>
                        setBusinessInfo((prev) => ({
                          ...prev,
                          businessType: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      <option value="home_kitchen">Home Kitchen</option>
                      <option value="cloud_kitchen">Cloud Kitchen</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="catering">Catering Service</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={businessInfo.yearsOfExperience}
                      onChange={(e) =>
                        setBusinessInfo((prev) => ({
                          ...prev,
                          yearsOfExperience: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Years of cooking experience"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Serving Capacity
                    </label>
                    <input
                      type="number"
                      value={businessInfo.servingCapacity}
                      onChange={(e) =>
                        setBusinessInfo((prev) => ({
                          ...prev,
                          servingCapacity: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Number of meals per day"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialties *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {specialtyOptions.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => handleSpecialtyToggle(specialty)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          businessInfo.specialties.includes(specialty)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-orange-300"
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={businessInfo.operatingHours.start}
                        onChange={(e) =>
                          setBusinessInfo((prev) => ({
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              start: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={businessInfo.operatingHours.end}
                        onChange={(e) =>
                          setBusinessInfo((prev) => ({
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              end: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days *
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {workingDayOptions.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkingDayToggle(day)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          businessInfo.workingDays.includes(day)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-orange-300"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Document Upload
              </h2>
              <div className="space-y-6">
                {/* FSSAI License */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      FSSAI License *
                    </h3>
                    {documentUrls.fssaiLicense && (
                      <i className="fas fa-check-circle text-green-500"></i>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your Food Safety and Standards Authority license
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload("fssaiLicense", e.target.files[0]);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {documentUrls.fssaiLicense && (
                    <div className="mt-2">
                      <a
                        href={documentUrls.fssaiLicense}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 text-sm hover:underline"
                      >
                        View uploaded document
                      </a>
                    </div>
                  )}
                </div>

                {/* Aadhaar Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Aadhaar Card *
                    </h3>
                    {documentUrls.aadhaarCard && (
                      <i className="fas fa-check-circle text-green-500"></i>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your Aadhaar card for identity verification
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload("aadhaarCard", e.target.files[0]);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {documentUrls.aadhaarCard && (
                    <div className="mt-2">
                      <a
                        href={documentUrls.aadhaarCard}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 text-sm hover:underline"
                      >
                        View uploaded document
                      </a>
                    </div>
                  )}
                </div>

                {/* Kitchen Photos */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Kitchen Photos * (Minimum 3)
                    </h3>
                    <span className="text-sm text-gray-500">
                      {documentUrls.kitchenPhotos.length}/3 uploaded
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload clear photos of your kitchen, cooking area, and
                    storage
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach((file) => {
                          handleFileUpload("kitchenPhotos", file);
                        });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {documentUrls.kitchenPhotos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {documentUrls.kitchenPhotos.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Kitchen photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Business Proof */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Business Proof (Optional)
                    </h3>
                    {documentUrls.businessProof && (
                      <i className="fas fa-check-circle text-green-500"></i>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    GST certificate, shop license, or business registration
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload("businessProof", e.target.files[0]);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Bank Statement */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Bank Statement (Optional)
                    </h3>
                    {documentUrls.bankStatement && (
                      <i className="fas fa-check-circle text-green-500"></i>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Recent bank statement for payment verification
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload("bankStatement", e.target.files[0]);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Quality Standards */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Quality Standards Checklist
              </h2>
              <p className="text-gray-600 mb-6">
                Please confirm that you meet these quality standards (minimum 6
                required):
              </p>

              <div className="space-y-4">
                {[
                  {
                    key: "cleanKitchen",
                    label: "Clean and hygienic kitchen environment",
                    desc: "Kitchen is regularly cleaned and maintained",
                  },
                  {
                    key: "properStorage",
                    label: "Proper food storage facilities",
                    desc: "Adequate refrigeration and dry storage",
                  },
                  {
                    key: "freshIngredients",
                    label: "Use of fresh ingredients",
                    desc: "Only fresh, quality ingredients are used",
                  },
                  {
                    key: "hygieneStandards",
                    label: "Personal hygiene standards",
                    desc: "Proper handwashing and clean cooking attire",
                  },
                  {
                    key: "packagingQuality",
                    label: "Quality packaging materials",
                    desc: "Food-grade, leak-proof packaging",
                  },
                  {
                    key: "temperatureControl",
                    label: "Temperature control during cooking",
                    desc: "Proper cooking and storage temperatures",
                  },
                  {
                    key: "wasteMgmt",
                    label: "Waste management system",
                    desc: "Proper disposal of kitchen waste",
                  },
                  {
                    key: "waterQuality",
                    label: "Clean water for cooking",
                    desc: "Use of filtered or clean water",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qualityChecklist[item.key]}
                        onChange={() => handleQualityChecklistChange(item.key)}
                        className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className="fas fa-info-circle text-orange-500"></i>
                  <span className="text-sm text-orange-800">
                    {Object.values(qualityChecklist).filter(Boolean).length}/8
                    standards confirmed
                    {Object.values(qualityChecklist).filter(Boolean).length <
                      6 && " (minimum 6 required)"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Review & Submit
              </h2>

              <div className="space-y-6">
                {/* Personal Info Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>{" "}
                      {personalInfo.fullName}
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>{" "}
                      {personalInfo.phoneNumber}
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>{" "}
                      {personalInfo.email}
                    </div>
                    <div>
                      <span className="text-gray-600">City:</span>{" "}
                      {personalInfo.city}
                    </div>
                  </div>
                </div>

                {/* Business Info Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Business:</span>{" "}
                      {businessInfo.businessName}
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>{" "}
                      {businessInfo.businessType}
                    </div>
                    <div>
                      <span className="text-gray-600">Specialties:</span>{" "}
                      {businessInfo.specialties.join(", ")}
                    </div>
                    <div>
                      <span className="text-gray-600">Working Days:</span>{" "}
                      {businessInfo.workingDays.join(", ")}
                    </div>
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Documents Uploaded
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <i
                        className={`fas ${
                          documentUrls.fssaiLicense
                            ? "fa-check-circle text-green-500"
                            : "fa-times-circle text-red-500"
                        }`}
                      ></i>
                      <span>FSSAI License</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i
                        className={`fas ${
                          documentUrls.aadhaarCard
                            ? "fa-check-circle text-green-500"
                            : "fa-times-circle text-red-500"
                        }`}
                      ></i>
                      <span>Aadhaar Card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i
                        className={`fas ${
                          documentUrls.kitchenPhotos.length >= 3
                            ? "fa-check-circle text-green-500"
                            : "fa-times-circle text-red-500"
                        }`}
                      ></i>
                      <span>
                        Kitchen Photos ({documentUrls.kitchenPhotos.length})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quality Standards Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Quality Standards
                  </h3>
                  <div className="text-sm">
                    <span className="text-gray-600">Standards confirmed:</span>{" "}
                    {Object.values(qualityChecklist).filter(Boolean).length}/8
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important Notice:</p>
                      <p>
                        By submitting this verification, you confirm that all
                        information provided is accurate and you agree to
                        maintain the quality standards. Our team will review
                        your application within 2-3 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitVerification}
                disabled={loading || !validateStep(currentStep)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Verification"
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