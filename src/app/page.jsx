"use client";
import React from "react";

function MainComponent() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [foodMakers, setFoodMakers] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    dietary: "",
    mealType: "",
    cuisine: "",
  });

  const { data: user, loading: userLoading } = useUser();

  // Load menu items when location or filters change
  useEffect(() => {
    // Only load menu items if PIN code is exactly 6 digits
    if (selectedLocation && selectedLocation.length === 6) {
      loadMenuItems();
    }
  }, [selectedLocation, selectedFilters]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("momsTiffinCart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("momsTiffinCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin_code: selectedLocation,
          dietary_preference: selectedFilters.dietary || undefined,
          meal_type: selectedFilters.mealType || undefined,
          cuisine_type: selectedFilters.cuisine || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load menu items: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMenuItems(data.items);
      } else {
        console.error("Failed to load menu items:", data.error);
        // Fallback to sample data
        setMenuItems(sampleMenuItems);
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
      // Fallback to sample data
      setMenuItems(sampleMenuItems);
    } finally {
      setLoading(false);
    }
  };

  // Theme toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("momsTiffinTheme", darkMode ? "light" : "dark");
  };

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("momsTiffinTheme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // Add to cart
  const addToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          ...item,
          quantity: 1,
          menuItemId: item.id,
          foodMaker: item.food_maker?.business_name || item.foodMaker,
        },
      ]);
    }
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // Update cart quantity
  const updateCartQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Sample data (fallback)
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
      food_maker: {
        business_name: "Sunita's Kitchen",
        rating: 4.5,
      },
      preparation_time: 30,
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
      food_maker: {
        business_name: "Lakshmi's Home Food",
        rating: 4.8,
      },
      preparation_time: 25,
    },
    {
      id: 3,
      name: "Chicken Curry with Roti",
      description: "Homemade chicken curry with fresh rotis",
      price: 180,
      image_url:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
      dietary_preference: "non_veg",
      meal_type: "dinner",
      cuisine_type: "North Indian",
      food_maker: {
        business_name: "Priya's Kitchen",
        rating: 4.6,
      },
      preparation_time: 45,
    },
  ];

  // Filter menu items
  const filteredMenuItems = (
    menuItems.length > 0 ? menuItems : sampleMenuItems
  ).filter((item) => {
    return (
      (!selectedFilters.dietary ||
        item.dietary_preference === selectedFilters.dietary) &&
      (!selectedFilters.mealType ||
        item.meal_type === selectedFilters.mealType) &&
      (!selectedFilters.cuisine ||
        item.cuisine_type === selectedFilters.cuisine)
    );
  });

  // Location Modal Component
  const LocationModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        darkMode ? "bg-black bg-opacity-50" : "bg-black bg-opacity-50"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Select Your Location
        </h3>
        <input
          type="text"
          placeholder="Enter PIN code or area"
          className={`w-full p-3 rounded-lg border mb-4 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300"
          }`}
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={() => setShowLocationModal(false)}
            className={`flex-1 py-3 rounded-lg ${
              darkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowLocationModal(false);
              if (selectedLocation) {
                localStorage.setItem("momsTiffinLocation", selectedLocation);
              }
            }}
            className="flex-1 py-3 rounded-lg bg-orange-500 text-white font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  // Cart Modal Component
  const CartModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${
        darkMode ? "bg-black bg-opacity-50" : "bg-black bg-opacity-50"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Your Cart ({cartItems.length})
          </h3>
          <button
            onClick={() => setShowCart(false)}
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

        {cartItems.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <i className="fas fa-shopping-cart text-4xl mb-4"></i>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <img
                    src={item.image_url || item.image}
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
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      ₹{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span
                      className={`w-8 text-center ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`border-t pt-4 ${
                darkMode ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div
                className={`flex justify-between items-center mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <span className="text-lg font-bold">Total: ₹{cartTotal}</span>
              </div>
              <a
                href="/checkout"
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium text-center block"
              >
                Proceed to Checkout
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Menu Item Card Component
  const MenuItemCard = ({ item }) => (
    <div
      className={`rounded-2xl overflow-hidden shadow-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <img
        src={item.image_url || item.image}
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
          <div className="flex items-center gap-1">
            <i className="fas fa-star text-yellow-500 text-sm"></i>
            <span
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {item.food_maker?.rating || item.rating || 4.5}
            </span>
          </div>
        </div>
        <p
          className={`text-sm mb-3 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {item.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            by {item.food_maker?.business_name || item.foodMaker}
          </span>
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.preparation_time} mins
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            ₹{item.price}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
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
        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.meal_type} • {item.cuisine_type}
          </span>
          <button
            onClick={() => addToCart(item)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("momsTiffinLocation");
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
  }, []);

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
                  Moms' Tiffin
                </h1>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Homemade with love
                </p>
              </div>
            </div>

            {/* Location & Actions */}
            <div className="flex items-center gap-4">
              {/* Location */}
              <button
                onClick={() => setShowLocationModal(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <i className="fas fa-map-marker-alt text-orange-500"></i>
                <span className="text-sm">
                  {selectedLocation || "Select Location"}
                </span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>

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

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 rounded-lg bg-orange-500 text-white"
              >
                <i className="fas fa-shopping-cart"></i>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center ${
                      darkMode ? "text-white" : "text-white"
                    }`}
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
                  <a
                    href="/food-maker-dashboard"
                    className="ml-2 px-3 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    Dashboard
                  </a>
                </div>
              ) : (
                <a
                  href="/account/signin"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div
        className={`sticky top-[73px] z-30 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-4 overflow-x-auto">
            {/* Dietary Filter */}
            <select
              value={selectedFilters.dietary}
              onChange={(e) =>
                setSelectedFilters({
                  ...selectedFilters,
                  dietary: e.target.value,
                })
              }
              className={`px-3 py-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              } border`}
            >
              <option value="">All Dietary</option>
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
            </select>

            {/* Meal Type Filter */}
            <select
              value={selectedFilters.mealType}
              onChange={(e) =>
                setSelectedFilters({
                  ...selectedFilters,
                  mealType: e.target.value,
                })
              }
              className={`px-3 py-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              } border`}
            >
              <option value="">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
            </select>

            {/* Cuisine Filter */}
            <select
              value={selectedFilters.cuisine}
              onChange={(e) =>
                setSelectedFilters({
                  ...selectedFilters,
                  cuisine: e.target.value,
                })
              }
              className={`px-3 py-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              } border`}
            >
              <option value="">All Cuisines</option>
              <option value="North Indian">North Indian</option>
              <option value="South Indian">South Indian</option>
              <option value="Regional">Regional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        {!selectedLocation && (
          <div
            className={`rounded-2xl p-6 mb-6 text-center ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-map-marker-alt text-orange-500 text-2xl"></i>
            </div>
            <h2
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Welcome to Moms' Tiffin!
            </h2>
            <p
              className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Select your location to discover delicious homemade meals from
              local moms in your area.
            </p>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
            >
              Select Your Location
            </button>
          </div>
        )}

        {/* Menu Items Grid */}
        {selectedLocation && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Available Tiffins
              </h2>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredMenuItems.length} items found
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl overflow-hidden shadow-lg ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <div className="w-full h-48 bg-gray-300 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {!loading && filteredMenuItems.length === 0 && (
              <div
                className={`text-center py-12 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <i className="fas fa-search text-4xl mb-4"></i>
                <p>No tiffins found matching your filters.</p>
                <button
                  onClick={() =>
                    setSelectedFilters({
                      dietary: "",
                      mealType: "",
                      cuisine: "",
                    })
                  }
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showLocationModal && <LocationModal />}
      {showCart && <CartModal />}

      {/* Loading Skeleton */}
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