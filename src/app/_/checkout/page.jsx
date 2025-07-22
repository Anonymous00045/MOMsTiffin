"use client";
import React from "react";

function MainComponent() {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const { data: user, loading: userLoading } = useUser();

  // New address form state
  const [newAddress, setNewAddress] = useState({
    type: "home",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
    isDefault: false,
  });

  // Sample cart items (in real app, this would come from props or context)
  useEffect(() => {
    const sampleCart = [
      {
        id: 1,
        menuItemId: 1,
        name: "Home-style Dal Rice",
        description: "Traditional dal with steamed rice, pickle, and papad",
        price: 120,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
        foodMaker: "Sunita's Kitchen",
      },
      {
        id: 2,
        menuItemId: 2,
        name: "South Indian Thali",
        description: "Rice, sambar, rasam, vegetables, and curd",
        price: 150,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
        foodMaker: "Lakshmi's Home Food",
      },
    ];
    setCartItems(sampleCart);
  }, []);

  // Load addresses
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          addressData: {
            address_line1: newAddress.street,
            address_line2: newAddress.landmark,
            city: newAddress.city,
            state: newAddress.state,
            pin_code: newAddress.pinCode,
            address_type: newAddress.type,
            label: newAddress.type,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add address: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await loadAddresses();
        setShowAddressForm(false);
        setNewAddress({
          type: "home",
          street: "",
          city: "",
          state: "",
          pinCode: "",
          landmark: "",
          isDefault: false,
        });
        if (data.address) {
          setSelectedAddressId(data.address.id);
        }
      } else {
        setError(data.error || "Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      setError("Failed to add address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await fetch("/api/user-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get" }),
      });
      if (!response.ok) {
        throw new Error(`Failed to load addresses: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        const defaultAddress = data.addresses.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }
    if (!selectedTimeSlot) {
      setError("Please select a delivery time slot");
      return;
    }
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        cartItems: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        deliveryAddressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        deliveryTimeSlot: selectedTimeSlot,
        specialInstructions: specialInstructions,
      };

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Order creation failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setOrderDetails(data);
        setOrderPlaced(true);
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const taxRate = 0.05;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + deliveryFee + taxAmount;

  // Time slots
  const timeSlots = [
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "7:00 PM - 8:00 PM",
    "8:00 PM - 9:00 PM",
  ];

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
            You need to be signed in to place an order
          </p>
          <a
            href="/account/signin?callbackUrl=/checkout"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div
            className={`rounded-2xl p-8 text-center ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-green-500 text-2xl"></i>
            </div>
            <h1
              className={`text-3xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Order Placed Successfully!
            </h1>
            <p
              className={`text-lg mb-6 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your order #{orderDetails?.orderId} has been confirmed
            </p>
            <div
              className={`bg-gray-50 rounded-lg p-4 mb-6 ${
                darkMode ? "bg-gray-700" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Total Amount:
                </span>
                <span className={`text-xl font-bold text-orange-500`}>
                  ₹{orderDetails?.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <a
                href="/"
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium text-center"
              >
                Continue Shopping
              </a>
              <button
                className={`flex-1 py-3 rounded-lg font-medium ${
                  darkMode
                    ? "bg-gray-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Track Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
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
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Checkout
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
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
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Summary */}
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
                Order Summary ({cartItems.length} items)
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
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
                      <h3
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        by {item.foodMaker}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
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

            {/* Delivery Address */}
            <div
              className={`rounded-2xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
                >
                  Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div
                  className={`text-center py-8 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <i className="fas fa-map-marker-alt text-4xl mb-4"></i>
                  <p>No addresses found. Please add a delivery address.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAddressId === address.id
                          ? "border-orange-500 bg-orange-50"
                          : darkMode
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-medium capitalize ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {address.type}
                          </span>
                          {address.is_default && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {address.address_line1}, {address.city},{" "}
                          {address.state} - {address.pin_code}
                        </p>
                        {address.address_line2 && (
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Near {address.address_line2}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add Address Form */}
              {showAddressForm && (
                <div
                  className={`mt-6 p-4 rounded-lg border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3
                    className={`font-medium mb-4 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Add New Address
                  </h3>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Address Type
                        </label>
                        <select
                          name="type"
                          value={newAddress.type}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              type: e.target.value,
                            })
                          }
                          className={`w-full p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300"
                          }`}
                          required
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          PIN Code
                        </label>
                        <input
                          type="text"
                          name="pinCode"
                          value={newAddress.pinCode}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              pinCode: e.target.value,
                            })
                          }
                          className={`w-full p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300"
                          }`}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            street: e.target.value,
                          })
                        }
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              city: e.target.value,
                            })
                          }
                          className={`w-full p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              state: e.target.value,
                            })
                          }
                          className={`w-full p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300"
                          }`}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={newAddress.landmark}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            landmark: e.target.value,
                          })
                        }
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            isDefault: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <label
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Set as default address
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
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
                        disabled={loading}
                        className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        {loading ? "Adding..." : "Add Address"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Delivery Time Slot */}
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
                Delivery Time Slot
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedTimeSlot === slot
                        ? "border-orange-500 bg-orange-50"
                        : darkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={slot}
                      checked={selectedTimeSlot === slot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    />
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {slot}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
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
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "upi", name: "UPI", icon: "fa-mobile-alt" },
                  {
                    id: "card",
                    name: "Credit/Debit Card",
                    icon: "fa-credit-card",
                  },
                  {
                    id: "cod",
                    name: "Cash on Delivery",
                    icon: "fa-money-bill-wave",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? "border-orange-500 bg-orange-50"
                        : darkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <i className={`fas ${method.icon} text-orange-500`}></i>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {method.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
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
                Special Instructions (Optional)
              </h2>
              <textarea
                name="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests for your order..."
                rows="3"
                className={`w-full p-3 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              ></textarea>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`rounded-2xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg sticky top-24`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Bill Details
              </h2>

              <div className="space-y-3 mb-4">
                <div
                  className={`flex justify-between ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div
                  className={`flex justify-between ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div
                  className={`flex justify-between ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span>Taxes & Fees</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                {deliveryFee === 0 && (
                  <div
                    className={`text-sm ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    🎉 Free delivery on orders above ₹500
                  </div>
                )}
              </div>

              <div
                className={`border-t pt-4 mb-6 ${
                  darkMode ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <div
                  className={`flex justify-between text-lg font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={
                  loading ||
                  !selectedAddressId ||
                  !selectedTimeSlot ||
                  !selectedPaymentMethod
                }
                className="w-full py-4 bg-orange-500 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order • ₹${totalAmount.toFixed(2)}`
                )}
              </button>

              <p
                className={`text-xs text-center mt-3 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;