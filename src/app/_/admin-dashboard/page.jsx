"use client";
import React from "react";

function MainComponent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  const { data: user, loading: userLoading } = useUser();

  // Mock data - in real app, this would come from APIs
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 1247,
      totalOrders: 3456,
      totalRevenue: 125000,
      activeFoodMakers: 89,
      pendingVerifications: 12,
      activeOrders: 45,
    },
    pendingVerifications: [
      {
        id: 1,
        name: "Priya Sharma",
        email: "priya@example.com",
        type: "food_maker",
        businessName: "Priya's Kitchen",
        submittedAt: "2025-01-20T10:30:00Z",
        documents: ["fssai_license.pdf", "kitchen_photos.jpg"],
        status: "pending",
      },
      {
        id: 2,
        name: "Raj Kumar",
        email: "raj@example.com",
        type: "distributor",
        vehicleType: "Motorcycle",
        submittedAt: "2025-01-19T15:45:00Z",
        documents: ["driving_license.pdf", "vehicle_rc.pdf"],
        status: "pending",
      },
    ],
    users: [
      {
        id: 1,
        name: "Sunita Devi",
        email: "sunita@example.com",
        type: "food_maker",
        status: "active",
        joinedAt: "2025-01-15",
        totalOrders: 156,
        rating: 4.8,
      },
      {
        id: 2,
        name: "Amit Singh",
        email: "amit@example.com",
        type: "customer",
        status: "active",
        joinedAt: "2025-01-10",
        totalOrders: 23,
        rating: null,
      },
    ],
    orders: [
      {
        id: "ORD001",
        customer: "Rahul Verma",
        foodMaker: "Sunita's Kitchen",
        amount: 250,
        status: "delivered",
        createdAt: "2025-01-21T12:00:00Z",
        deliveryTime: "2025-01-21T13:30:00Z",
      },
      {
        id: "ORD002",
        customer: "Neha Gupta",
        foodMaker: "Lakshmi's Home Food",
        amount: 180,
        status: "preparing",
        createdAt: "2025-01-21T11:45:00Z",
        deliveryTime: "2025-01-21T13:00:00Z",
      },
    ],
  });

  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("adminTheme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("adminTheme", newTheme ? "dark" : "light");
  };

  // Handle verification approval/rejection
  const handleVerificationAction = async (
    verificationId,
    action,
    reason = ""
  ) => {
    setLoading(true);
    try {
      // In real app, make API call here
      console.log(`${action} verification ${verificationId}`, reason);

      // Update local state
      setDashboardData((prev) => ({
        ...prev,
        pendingVerifications: prev.pendingVerifications.map((v) =>
          v.id === verificationId
            ? {
                ...v,
                status: action,
                reviewedAt: new Date().toISOString(),
                reason,
              }
            : v
        ),
      }));

      setShowVerificationModal(false);
      setSelectedVerification(null);
    } catch (error) {
      setError("Failed to process verification");
    } finally {
      setLoading(false);
    }
  };

  // Handle user status change
  const handleUserStatusChange = async (userId, newStatus) => {
    setLoading(true);
    try {
      // In real app, make API call here
      console.log(`Change user ${userId} status to ${newStatus}`);

      setDashboardData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        ),
      }));
    } catch (error) {
      setError("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const filteredVerifications = dashboardData.pendingVerifications.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = dashboardData.users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = dashboardData.orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.foodMaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">Admin access required</p>
          <a
            href="/account/signin"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <div>
                <h1
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Admin Dashboard
                </h1>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Moms' Tiffin Platform Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-64 pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
                <i
                  className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                ></i>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-yellow-400"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center`}
                >
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <span
                  className={`text-sm ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div
        className={`sticky top-[73px] z-30 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: "fa-chart-line" },
              {
                id: "verifications",
                label: "Verifications",
                icon: "fa-check-circle",
              },
              { id: "users", label: "Users", icon: "fa-users" },
              { id: "orders", label: "Orders", icon: "fa-shopping-bag" },
              { id: "analytics", label: "Analytics", icon: "fa-chart-bar" },
              { id: "settings", label: "Settings", icon: "fa-cog" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-500"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-white"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Users
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {dashboardData.overview.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-blue-600"></i>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Orders
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {dashboardData.overview.totalOrders.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-shopping-bag text-green-600"></i>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Revenue
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      ₹{dashboardData.overview.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-rupee-sign text-orange-600"></i>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Active Food Makers
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {dashboardData.overview.activeFoodMakers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-utensils text-purple-600"></i>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Pending Verifications
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {dashboardData.overview.pendingVerifications}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-yellow-600"></i>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Active Orders
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {dashboardData.overview.activeOrders}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-fire text-red-600"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className={`rounded-2xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600 text-sm"></i>
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      New food maker verified: Sunita's Kitchen
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-plus text-blue-600 text-sm"></i>
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      15 new users registered today
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      4 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-shopping-bag text-orange-600 text-sm"></i>
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Order volume increased by 25% this week
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === "verifications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Pending Verifications
              </h2>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredVerifications.length} pending
              </span>
            </div>

            <div className="grid gap-6">
              {filteredVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className={`rounded-2xl p-6 ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className={`text-lg font-bold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {verification.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            verification.type === "food_maker"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {verification.type === "food_maker"
                            ? "Food Maker"
                            : "Distributor"}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        } mb-2`}
                      >
                        {verification.email}
                      </p>
                      {verification.businessName && (
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-2`}
                        >
                          Business: {verification.businessName}
                        </p>
                      )}
                      {verification.vehicleType && (
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-2`}
                        >
                          Vehicle: {verification.vehicleType}
                        </p>
                      )}
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Submitted:{" "}
                        {new Date(
                          verification.submittedAt
                        ).toLocaleDateString()}
                      </p>
                      <div className="mt-3">
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-2`}
                        >
                          Documents:
                        </p>
                        <div className="flex gap-2">
                          {verification.documents.map((doc, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedVerification(verification);
                          setShowVerificationModal(true);
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVerifications.length === 0 && (
              <div
                className={`text-center py-12 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <i className="fas fa-check-circle text-4xl mb-4"></i>
                <p>No pending verifications</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                User Management
              </h2>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredUsers.length} users
              </span>
            </div>

            <div
              className={`rounded-2xl overflow-hidden ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        User
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Type
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Orders
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Rating
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      darkMode ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-white text-sm"></i>
                            </div>
                            <div className="ml-4">
                              <div
                                className={`text-sm font-medium ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {user.name}
                              </div>
                              <div
                                className={`text-sm ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.type === "food_maker"
                                ? "bg-green-100 text-green-800"
                                : user.type === "distributor"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : user.status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {user.totalOrders}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {user.rating ? (
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-500 mr-1"></i>
                              {user.rating}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={user.status}
                            onChange={(e) =>
                              handleUserStatusChange(user.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Order Management
              </h2>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredOrders.length} orders
              </span>
            </div>

            <div
              className={`rounded-2xl overflow-hidden ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Order ID
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Customer
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Food Maker
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Amount
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      darkMode ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {order.id}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {order.customer}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {order.foodMaker}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          ₹{order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Platform Analytics
              </h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Revenue Trends
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <div
                    className={`text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <i className="fas fa-chart-line text-4xl mb-2"></i>
                    <p>Revenue chart would be displayed here</p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Order Volume
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <div
                    className={`text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <i className="fas fa-chart-bar text-4xl mb-2"></i>
                    <p>Order volume chart would be displayed here</p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  User Growth
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <div
                    className={`text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <i className="fas fa-users text-4xl mb-2"></i>
                    <p>User growth chart would be displayed here</p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Top Performing Food Makers
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Sunita's Kitchen", orders: 156, revenue: 23400 },
                    {
                      name: "Lakshmi's Home Food",
                      orders: 134,
                      revenue: 20100,
                    },
                    { name: "Priya's Kitchen", orders: 98, revenue: 14700 },
                  ].map((maker, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {maker.name}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {maker.orders} orders
                        </p>
                      </div>
                      <p
                        className={`font-bold ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        ₹{maker.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              System Settings
            </h2>

            <div className="grid gap-6">
              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Platform Configuration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Auto-approve verified food makers
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Automatically approve food makers with valid documents
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Email notifications for new orders
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Send email alerts for new order notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Maintenance mode
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Put the platform in maintenance mode
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Commission Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Food Maker Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Distributor Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  System Actions
                </h3>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
                    Export Data
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
                    Backup Database
                  </button>
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600">
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Verification Modal */}
      {showVerificationModal && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className={`w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Review Verification
              </h3>
              <button
                onClick={() => setShowVerificationModal(false)}
                className={`p-2 rounded-full ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-times ${
                    darkMode ? "text-white" : "text-gray-600"
                  }`}
                ></i>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {selectedVerification.name}
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {selectedVerification.email}
                </p>
              </div>

              {selectedVerification.businessName && (
                <div>
                  <h5
                    className={`font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Business Name
                  </h5>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {selectedVerification.businessName}
                  </p>
                </div>
              )}

              <div>
                <h5
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Documents
                </h5>
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {doc}
                      </span>
                      <button className="px-3 py-1 bg-orange-500 text-white rounded text-sm">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleVerificationAction(selectedVerification.id, "rejected")
                }
                disabled={loading}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={() =>
                  handleVerificationAction(selectedVerification.id, "approved")
                }
                disabled={loading}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;