"use client";
import React from "react";

function MainComponent() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: user, loading: userLoading } = useUser();

  // Load orders on mount
  useEffect(() => {
    if (user) {
      loadOrders();
      // Set up polling for real-time updates
      const interval = setInterval(loadOrders, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("momsTiffinTheme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an API
      // For now, we'll use sample data
      const sampleOrders = [
        {
          id: 1,
          orderId: "MT001234",
          status: "preparing",
          paymentStatus: "paid",
          totalAmount: 390,
          orderDate: "2025-01-21T10:30:00Z",
          estimatedDelivery: "2025-01-21T12:30:00Z",
          deliveryTimeSlot: "12:00 PM - 1:00 PM",
          specialInstructions: "Please ring the doorbell twice",
          foodMaker: {
            id: 1,
            businessName: "Sunita's Kitchen",
            phone: "+91 98765 43210",
            rating: 4.5,
            image:
              "https://images.unsplash.com/photo-1494790108755-2616c9c0b8d4?w=100&h=100&fit=crop&crop=face",
          },
          deliveryAddress: {
            street: "123 MG Road, Apartment 4B",
            city: "Mumbai",
            state: "Maharashtra",
            pinCode: "400001",
          },
          items: [
            {
              id: 1,
              name: "Home-style Dal Rice",
              quantity: 2,
              price: 120,
              image:
                "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
            },
            {
              id: 2,
              name: "South Indian Thali",
              quantity: 1,
              price: 150,
              image:
                "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
            },
          ],
          statusHistory: [
            {
              status: "placed",
              timestamp: "2025-01-21T10:30:00Z",
              message: "Order placed successfully",
            },
            {
              status: "confirmed",
              timestamp: "2025-01-21T10:35:00Z",
              message: "Order confirmed by Sunita's Kitchen",
            },
            {
              status: "preparing",
              timestamp: "2025-01-21T10:45:00Z",
              message: "Food preparation started",
            },
          ],
        },
        {
          id: 2,
          orderId: "MT001235",
          status: "delivered",
          paymentStatus: "paid",
          totalAmount: 275,
          orderDate: "2025-01-20T18:00:00Z",
          deliveredAt: "2025-01-20T19:30:00Z",
          deliveryTimeSlot: "7:00 PM - 8:00 PM",
          foodMaker: {
            id: 2,
            businessName: "Lakshmi's Home Food",
            phone: "+91 98765 43211",
            rating: 4.8,
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          },
          deliveryAddress: {
            street: "456 Park Street, Floor 2",
            city: "Mumbai",
            state: "Maharashtra",
            pinCode: "400002",
          },
          items: [
            {
              id: 3,
              name: "Chicken Curry with Roti",
              quantity: 1,
              price: 180,
              image:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
            },
          ],
          statusHistory: [
            {
              status: "placed",
              timestamp: "2025-01-20T18:00:00Z",
              message: "Order placed successfully",
            },
            {
              status: "confirmed",
              timestamp: "2025-01-20T18:05:00Z",
              message: "Order confirmed by Lakshmi's Home Food",
            },
            {
              status: "preparing",
              timestamp: "2025-01-20T18:15:00Z",
              message: "Food preparation started",
            },
            {
              status: "ready",
              timestamp: "2025-01-20T19:00:00Z",
              message: "Food is ready for pickup",
            },
            {
              status: "out_for_delivery",
              timestamp: "2025-01-20T19:10:00Z",
              message: "Out for delivery",
            },
            {
              status: "delivered",
              timestamp: "2025-01-20T19:30:00Z",
              message: "Order delivered successfully",
            },
          ],
        },
      ];

      setOrders(sampleOrders);
      if (!selectedOrder && sampleOrders.length > 0) {
        setSelectedOrder(sampleOrders[0]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Status configuration
  const statusConfig = {
    placed: {
      label: "Order Placed",
      icon: "fa-receipt",
      color: "blue",
      description: "Your order has been placed successfully",
    },
    confirmed: {
      label: "Confirmed",
      icon: "fa-check-circle",
      color: "green",
      description: "Food maker has confirmed your order",
    },
    preparing: {
      label: "Preparing",
      icon: "fa-utensils",
      color: "orange",
      description: "Your delicious meal is being prepared",
    },
    ready: {
      label: "Ready",
      icon: "fa-clock",
      color: "purple",
      description: "Food is ready for pickup",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      icon: "fa-truck",
      color: "blue",
      description: "Your order is on the way",
    },
    delivered: {
      label: "Delivered",
      icon: "fa-check-double",
      color: "green",
      description: "Order delivered successfully",
    },
    cancelled: {
      label: "Cancelled",
      icon: "fa-times-circle",
      color: "red",
      description: "Order has been cancelled",
    },
  };

  const statusOrder = [
    "placed",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
  ];

  // Get current status index
  const getCurrentStatusIndex = (status) => {
    return statusOrder.indexOf(status);
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate estimated delivery time
  const getEstimatedDelivery = (order) => {
    if (order.status === "delivered") {
      return `Delivered at ${formatTime(order.deliveredAt)}`;
    }
    if (order.estimatedDelivery) {
      const now = new Date();
      const estimated = new Date(order.estimatedDelivery);
      const diffMinutes = Math.ceil((estimated - now) / (1000 * 60));

      if (diffMinutes <= 0) {
        return "Arriving soon";
      } else if (diffMinutes <= 60) {
        return `${diffMinutes} mins`;
      } else {
        return formatTime(order.estimatedDelivery);
      }
    }
    return "Calculating...";
  };

  // Add notification
  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  // Simulate push notifications
  useEffect(() => {
    if (selectedOrder && selectedOrder.status === "preparing") {
      const timer = setTimeout(() => {
        addNotification(
          `Your order from ${selectedOrder.foodMaker.businessName} is being prepared!`,
          "success"
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedOrder]);

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
            Please Sign In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to track your orders
          </p>
          <a
            href="/account/signin?callbackUrl=/order-tracking"
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
              <a
                href="/"
                className={`p-2 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-arrow-left ${
                    darkMode ? "text-white" : "text-gray-600"
                  }`}
                ></i>
              </a>
              <div>
                <h1
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Order Tracking
                </h1>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Track your delicious meals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-600"
                  } relative`}
                >
                  <i className="fas fa-bell"></i>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className={`absolute right-0 top-12 w-80 rounded-lg shadow-lg border ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } z-50`}
                  >
                    <div
                      className={`p-4 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div
                          className={`p-4 text-center ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b ${
                              darkMode ? "border-gray-700" : "border-gray-200"
                            } last:border-b-0`}
                          >
                            <p
                              className={`text-sm ${
                                darkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  localStorage.setItem(
                    "momsTiffinTheme",
                    darkMode ? "light" : "dark"
                  );
                }}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-yellow-400"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div
            className={`text-center py-12 ${
              darkMode ? "text-red-400" : "text-red-600"
            }`}
          >
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div
            className={`text-center py-12 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <i className="fas fa-shopping-bag text-4xl mb-4"></i>
            <p className="text-lg mb-2">No orders found</p>
            <p className="mb-6">Start ordering delicious homemade food!</p>
            <a
              href="/"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
            >
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1">
              <h2
                className={`text-lg font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Your Orders ({orders.length})
              </h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedOrder?.id === order.id
                        ? "border-2 border-orange-500 bg-orange-50"
                        : darkMode
                        ? "bg-gray-800 border border-gray-700 hover:bg-gray-750"
                        : "bg-white border border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          #{order.orderId}
                        </h3>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {order.foodMaker.businessName}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusConfig[order.status]?.color === "green"
                            ? "bg-green-100 text-green-800"
                            : statusConfig[order.status]?.color === "orange"
                            ? "bg-orange-100 text-orange-800"
                            : statusConfig[order.status]?.color === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : statusConfig[order.status]?.color === "purple"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusConfig[order.status]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        ₹{order.totalAmount}
                      </span>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-2">
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Status Progress */}
                  <div
                    className={`rounded-2xl p-6 ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } shadow-lg`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2
                        className={`text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Order #{selectedOrder.orderId}
                      </h2>
                      <div className="text-right">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Estimated Delivery
                        </p>
                        <p
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {getEstimatedDelivery(selectedOrder)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between">
                        {statusOrder.slice(0, -1).map((status, index) => {
                          const isActive =
                            getCurrentStatusIndex(selectedOrder.status) >=
                            index;
                          const isCurrent = selectedOrder.status === status;
                          const config = statusConfig[status];

                          return (
                            <div key={status} className="flex items-center">
                              <div
                                className={`relative flex flex-col items-center ${
                                  index < statusOrder.length - 2 ? "flex-1" : ""
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isActive
                                      ? `bg-${config.color}-500 border-${config.color}-500 text-white`
                                      : darkMode
                                      ? "bg-gray-700 border-gray-600 text-gray-400"
                                      : "bg-gray-100 border-gray-300 text-gray-400"
                                  } ${
                                    isCurrent ? "ring-4 ring-orange-200" : ""
                                  }`}
                                >
                                  <i
                                    className={`fas ${config.icon} text-sm`}
                                  ></i>
                                </div>
                                <span
                                  className={`text-xs mt-2 text-center max-w-16 ${
                                    isActive
                                      ? darkMode
                                        ? "text-white"
                                        : "text-gray-800"
                                      : darkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {config.label}
                                </span>
                              </div>
                              {index < statusOrder.length - 2 && (
                                <div
                                  className={`flex-1 h-0.5 mx-2 ${
                                    getCurrentStatusIndex(
                                      selectedOrder.status
                                    ) > index
                                      ? "bg-green-500"
                                      : darkMode
                                      ? "bg-gray-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Status */}
                    <div
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-${
                            statusConfig[selectedOrder.status]?.color
                          }-500 flex items-center justify-center`}
                        >
                          <i
                            className={`fas ${
                              statusConfig[selectedOrder.status]?.icon
                            } text-white text-sm`}
                          ></i>
                        </div>
                        <div>
                          <h3
                            className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {statusConfig[selectedOrder.status]?.label}
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {statusConfig[selectedOrder.status]?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food Maker Info */}
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
                      Food Maker
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={selectedOrder.foodMaker.image}
                        alt={selectedOrder.foodMaker.businessName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {selectedOrder.foodMaker.businessName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-star text-yellow-500 text-sm"></i>
                            <span
                              className={`text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {selectedOrder.foodMaker.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={`tel:${selectedOrder.foodMaker.phone}`}
                        className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-phone"></i>
                        Call
                      </a>
                      <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                        <i className="fas fa-comment"></i>
                        Message
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
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
                      Order Items ({selectedOrder.items.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex gap-4 p-4 rounded-lg ${
                            darkMode ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                darkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {item.name}
                            </h4>
                            <div className="flex justify-between items-center mt-2">
                              <span
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                Qty: {item.quantity}
                              </span>
                              <span
                                className={`font-medium ${
                                  darkMode ? "text-white" : "text-gray-800"
                                }`}
                              >
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Details */}
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
                      Delivery Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4
                          className={`font-medium mb-2 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Delivery Address
                        </h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedOrder.deliveryAddress.street}
                          <br />
                          {selectedOrder.deliveryAddress.city},{" "}
                          {selectedOrder.deliveryAddress.state} -{" "}
                          {selectedOrder.deliveryAddress.pinCode}
                        </p>
                      </div>
                      <div>
                        <h4
                          className={`font-medium mb-2 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Time Slot
                        </h4>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedOrder.deliveryTimeSlot}
                        </p>
                      </div>
                      {selectedOrder.specialInstructions && (
                        <div>
                          <h4
                            className={`font-medium mb-2 ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            Special Instructions
                          </h4>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {selectedOrder.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Timeline */}
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
                      Order Timeline
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.statusHistory.map((history, index) => (
                        <div key={index} className="flex gap-4">
                          <div
                            className={`w-8 h-8 rounded-full bg-${
                              statusConfig[history.status]?.color
                            }-500 flex items-center justify-center flex-shrink-0`}
                          >
                            <i
                              className={`fas ${
                                statusConfig[history.status]?.icon
                              } text-white text-xs`}
                            ></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4
                                  className={`font-medium ${
                                    darkMode ? "text-white" : "text-gray-800"
                                  }`}
                                >
                                  {statusConfig[history.status]?.label}
                                </h4>
                                <p
                                  className={`text-sm ${
                                    darkMode ? "text-gray-300" : "text-gray-600"
                                  }`}
                                >
                                  {history.message}
                                </p>
                              </div>
                              <span
                                className={`text-xs ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {formatTime(history.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bill Summary */}
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
                      Bill Summary
                    </h3>
                    <div className="space-y-3">
                      <div
                        className={`flex justify-between ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Subtotal</span>
                        <span>
                          ₹
                          {(
                            selectedOrder.totalAmount -
                            50 -
                            selectedOrder.totalAmount * 0.05
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Delivery Fee</span>
                        <span>₹50.00</span>
                      </div>
                      <div
                        className={`flex justify-between ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Taxes & Fees</span>
                        <span>
                          ₹{(selectedOrder.totalAmount * 0.05).toFixed(2)}
                        </span>
                      </div>
                      <div
                        className={`border-t pt-3 ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex justify-between text-lg font-bold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          <span>Total Amount</span>
                          <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Payment Status:{" "}
                        <span className="text-green-600 font-medium">Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
}

export default MainComponent;