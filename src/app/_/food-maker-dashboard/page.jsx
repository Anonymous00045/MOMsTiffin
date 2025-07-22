"use client";
import React from "react";

function MainComponent() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [profile, setProfile] = useState({});

  const { data: user, loading: userLoading } = useUser();

  // Sample data (will be replaced with API calls)
  const sampleMenuItems = [
    {
      id: 1,
      name: "Home-style Dal Rice",
      description: "Traditional dal with steamed rice, pickle, and papad",
      price: 120,
      image_url:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
      dietary_preference: "veg",
      meal_type: "lunch",
      cuisine_type: "North Indian",
      is_available: true,
      preparation_time: 30,
      portion_size: "1 person",
      ingredients: "Dal, Rice, Pickle, Papad",
    },
    {
      id: 2,
      name: "South Indian Thali",
      description: "Rice, sambar, rasam, vegetables, and curd",
      price: 150,
      image_url:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
      dietary_preference: "veg",
      meal_type: "lunch",
      cuisine_type: "South Indian",
      is_available: true,
      preparation_time: 25,
      portion_size: "1 person",
      ingredients: "Rice, Sambar, Rasam, Vegetables, Curd",
    },
  ];

  const sampleOrders = [
    {
      id: 1,
      customer_name: "Rahul Sharma",
      items: ["Home-style Dal Rice x2", "South Indian Thali x1"],
      total_amount: 390,
      order_status: "pending",
      payment_status: "paid",
      delivery_time_slot: "12:00 PM - 1:00 PM",
      created_at: "2025-01-27T10:30:00Z",
      delivery_address: "123 MG Road, Bangalore",
    },
    {
      id: 2,
      customer_name: "Priya Patel",
      items: ["South Indian Thali x2"],
      total_amount: 300,
      order_status: "preparing",
      payment_status: "paid",
      delivery_time_slot: "1:00 PM - 2:00 PM",
      created_at: "2025-01-27T11:00:00Z",
      delivery_address: "456 Brigade Road, Bangalore",
    },
  ];

  const sampleAnalytics = {
    totalOrders: 156,
    totalEarnings: 18750,
    avgRating: 4.6,
    totalCustomers: 89,
    monthlyEarnings: [
      { month: "Jan", earnings: 15000 },
      { month: "Feb", earnings: 18750 },
      { month: "Mar", earnings: 22000 },
    ],
    topItems: [
      { name: "Home-style Dal Rice", orders: 45 },
      { name: "South Indian Thali", orders: 38 },
    ],
  };

  const sampleReviews = [
    {
      id: 1,
      customer_name: "Amit Kumar",
      rating: 5,
      comment: "Absolutely delicious! Tastes just like home-cooked food.",
      item_name: "Home-style Dal Rice",
      created_at: "2025-01-26T14:30:00Z",
    },
    {
      id: 2,
      customer_name: "Sneha Reddy",
      rating: 4,
      comment: "Great taste and portion size. Will order again!",
      item_name: "South Indian Thali",
      created_at: "2025-01-25T19:15:00Z",
    },
  ];

  // Initialize data
  React.useEffect(() => {
    setMenuItems(sampleMenuItems);
    setOrders(sampleOrders);
    setAnalytics(sampleAnalytics);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Handle order status update
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, order_status: newStatus } : order
      )
    );
  };

  // Handle menu item toggle availability
  const toggleMenuItemAvailability = (itemId) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === itemId
          ? { ...item, is_available: !item.is_available }
          : item
      )
    );
  };

  // Handle menu item delete
  const deleteMenuItem = (itemId) => {
    setMenuItems(menuItems.filter((item) => item.id !== itemId));
  };

  // Add Menu Item Modal
  const AddMenuModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      dietary_preference: "veg",
      meal_type: "lunch",
      cuisine_type: "North Indian",
      preparation_time: "",
      portion_size: "",
      ingredients: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newItem = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time),
        is_available: true,
        image_url:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
      };
      setMenuItems([...menuItems, newItem]);
      setShowAddMenuModal(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        dietary_preference: "veg",
        meal_type: "lunch",
        cuisine_type: "North Indian",
        preparation_time: "",
        portion_size: "",
        ingredients: "",
      });
    };

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          darkMode ? "bg-black bg-opacity-50" : "bg-black bg-opacity-50"
        }`}
      >
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
              Add New Menu Item
            </h3>
            <button
              onClick={() => setShowAddMenuModal(false)}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-white" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className={`w-full p-3 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Dietary Preference
                </label>
                <select
                  name="dietary_preference"
                  value={formData.dietary_preference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dietary_preference: e.target.value,
                    })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non_veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Meal Type
                </label>
                <select
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={(e) =>
                    setFormData({ ...formData, meal_type: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Cuisine Type
                </label>
                <select
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={(e) =>
                    setFormData({ ...formData, cuisine_type: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preparation_time: e.target.value,
                    })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Portion Size
                </label>
                <input
                  type="text"
                  name="portion_size"
                  value={formData.portion_size}
                  onChange={(e) =>
                    setFormData({ ...formData, portion_size: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="e.g., 1 person, 2 people"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-white" : "text-gray-700"
                }`}
              >
                Ingredients
              </label>
              <input
                type="text"
                name="ingredients"
                value={formData.ingredients}
                onChange={(e) =>
                  setFormData({ ...formData, ingredients: e.target.value })
                }
                className={`w-full p-3 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                placeholder="e.g., Rice, Dal, Vegetables"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className={`flex-1 py-3 rounded-lg ${
                  darkMode
                    ? "bg-gray-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-orange-500 text-white font-medium"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Dashboard Overview
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`p-6 rounded-2xl ${
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
                {analytics.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-shopping-bag text-blue-500"></i>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl ${
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
                Total Earnings
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                ₹{analytics.totalEarnings?.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-rupee-sign text-green-500"></i>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl ${
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
                Average Rating
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {analytics.avgRating}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-star text-yellow-500"></i>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl ${
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
                Total Customers
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {analytics.totalCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-purple-500"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className={`p-6 rounded-2xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <h3
          className={`text-lg font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Recent Orders
        </h3>
        <div className="space-y-4">
          {orders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? "border-gray-700 bg-gray-700"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {order.customer_name}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {order.items.join(", ")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.order_status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.order_status === "preparing"
                      ? "bg-blue-100 text-blue-800"
                      : order.order_status === "ready"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.order_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  ₹{order.total_amount}
                </span>
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {order.delivery_time_slot}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Menu Management
  const MenuManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Menu Management
        </h2>
        <button
          onClick={() => setShowAddMenuModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl overflow-hidden shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3
                  className={`font-bold text-lg ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {item.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMenuItemAvailability(item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.is_available
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    <i
                      className={`fas ${
                        item.is_available ? "fa-check" : "fa-times"
                      } text-xs`}
                    ></i>
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
              <p
                className={`text-sm mb-3 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.description}
              </p>
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  ₹{item.price}
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    item.dietary_preference === "veg"
                      ? "bg-green-100 text-green-800"
                      : item.dietary_preference === "non_veg"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {item.dietary_preference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {item.meal_type} • {item.cuisine_type}
                </span>
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {item.preparation_time} mins
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Order Management
  const OrderManagement = () => (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Order Management
      </h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`p-6 rounded-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h3
                  className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Order #{order.id}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {order.customer_name} •{" "}
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 md:mt-0">
                <select
                  value={order.order_status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white border-gray-300"
                  } border`}
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.payment_status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4
                  className={`font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Items Ordered
                </h4>
                <ul
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {order.items.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4
                  className={`font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Delivery Details
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {order.delivery_address}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Time: {order.delivery_time_slot}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <span
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Total: ₹{order.total_amount}
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                  Contact Customer
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">
                  Mark Ready
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Analytics & Earnings
  const Analytics = () => (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Analytics & Earnings
      </h2>

      {/* Earnings Chart */}
      <div
        className={`p-6 rounded-2xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <h3
          className={`text-lg font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Monthly Earnings
        </h3>
        <div className="space-y-4">
          {analytics.monthlyEarnings?.map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <span
                className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {month.month}
              </span>
              <div className="flex items-center gap-3 flex-1 mx-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(month.earnings / 25000) * 100}%` }}
                  ></div>
                </div>
                <span
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  ₹{month.earnings.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Items */}
      <div
        className={`p-6 rounded-2xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <h3
          className={`text-lg font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Top Selling Items
        </h3>
        <div className="space-y-4">
          {analytics.topItems?.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                {item.name}
              </span>
              <span
                className={`font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.orders} orders
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reviews Section
  const Reviews = () => (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Customer Reviews
      </h2>

      <div className="space-y-4">
        {sampleReviews.map((review) => (
          <div
            key={review.id}
            className={`p-6 rounded-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {review.customer_name}
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {review.item_name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array.from({ length: 5 })].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star text-sm ${
                      i < review.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  ></i>
                ))}
              </div>
            </div>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {review.comment}
            </p>
            <p
              className={`text-xs mt-2 ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // Profile Settings
  const ProfileSettings = () => (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Profile Settings
      </h2>

      <div
        className={`p-6 rounded-2xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <h3
          className={`text-lg font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Business Name
            </label>
            <input
              type="text"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              placeholder="Your Kitchen Name"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Contact Number
            </label>
            <input
              type="tel"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="md:col-span-2">
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Business Description
            </label>
            <textarea
              rows="3"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              placeholder="Tell customers about your cooking style and specialties"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Service Areas (PIN Codes)
            </label>
            <input
              type="text"
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              placeholder="560001, 560002, 560003"
            />
          </div>
        </div>
        <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium">
          Save Changes
        </button>
      </div>
    </div>
  );

  if (userLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`text-center p-8 rounded-2xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Access Denied
          </h2>
          <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Please sign in to access the food maker dashboard.
          </p>
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
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <i className="fas fa-utensils text-white"></i>
              </div>
              <div>
                <h1
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Food Maker Dashboard
                </h1>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Manage your tiffin business
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
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
                  className={`w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white`}
                >
                  <i className="fas fa-user text-sm"></i>
                </div>
                <span
                  className={`text-sm ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {user.name || user.email}
                </span>
              </div>

              {/* Logout */}
              <a
                href="/account/logout"
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <i className="fas fa-sign-out-alt"></i>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div
            className={`lg:w-64 ${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl p-6 shadow-lg h-fit`}
          >
            <nav className="space-y-2">
              {[
                { id: "dashboard", icon: "fa-chart-line", label: "Dashboard" },
                { id: "menu", icon: "fa-utensils", label: "Menu Management" },
                { id: "orders", icon: "fa-shopping-bag", label: "Orders" },
                { id: "analytics", icon: "fa-chart-bar", label: "Analytics" },
                { id: "reviews", icon: "fa-star", label: "Reviews" },
                {
                  id: "profile",
                  icon: "fa-user-cog",
                  label: "Profile Settings",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "dashboard" && <DashboardOverview />}
            {activeTab === "menu" && <MenuManagement />}
            {activeTab === "orders" && <OrderManagement />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "reviews" && <Reviews />}
            {activeTab === "profile" && <ProfileSettings />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddMenuModal && <AddMenuModal />}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`p-6 rounded-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={`${darkMode ? "text-white" : "text-gray-800"}`}>
              Loading...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;