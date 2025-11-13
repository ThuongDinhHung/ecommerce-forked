import React, { useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  FaGift,
  FaPercent,
  FaDollarSign,
  FaCalendarAlt,
  FaUsers,
  FaImage,
} from "react-icons/fa";

const Promotion = () => {
  const [mode, setMode] = useState("discount"); // 'discount' | 'gift'
  const [discountType, setDiscountType] = useState("percent"); // 'percent' | 'flat'
  const [form, setForm] = useState({
    name: "",
    percent: "",
    flat: "",
    giftName: "",
    giftQty: 1,
    giftDesc: "",
    startDate: "",
    endDate: "",
    minPurchase: "",
    userGroup: "",
    imageUrl: "",
  });

  const handleChange = (key) => (e) => {
    const value = e?.target?.value ?? e;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const onSave = () => {
    // simple output - in a real app send to server
    console.log("Saving promotion", { mode, discountType, ...form });
    alert("Promotion saved (mock). Check console for data.");
  };

  const onPreview = () => {
    // could open modal; for simplicity show alert
    alert(
      `Preview:\n${
        form.name || "Untitled Promotion"
      } - ${mode === "discount" ? (discountType === "percent" ? `${form.percent || 0}% Off` : `$${form.flat || 0} Off`) : `Gift: ${form.giftName || "Unnamed Gift"}`}`
    );
  };

  const renderDiscountInputs = () => (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setDiscountType("percent")}
          className={`flex-1 py-2 text-sm font-semibold rounded border ${discountType === "percent" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"}`}
        >
          <FaPercent className="inline mr-2" />
          Percentage
        </button>
        <button
          onClick={() => setDiscountType("flat")}
          className={`flex-1 py-2 text-sm font-semibold rounded border ${discountType === "flat" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"}`}
        >
          <FaDollarSign className="inline mr-2" />
          Flat Amount
        </button>
      </div>

      {discountType === "percent" ? (
        <div>
          <label className="text-xs text-gray-600">Discount Value (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.percent}
            onChange={handleChange("percent")}
            placeholder="e.g., 20"
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div>
          <label className="text-xs text-gray-600">Discount Value ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.flat}
            onChange={handleChange("flat")}
            placeholder="e.g., 10.00"
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );

  const renderGiftInputs = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-600">Gift Name</label>
        <input
          value={form.giftName}
          onChange={handleChange("giftName")}
          placeholder="e.g., Free Mug"
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600">Gift Description</label>
        <textarea
          value={form.giftDesc}
          onChange={handleChange("giftDesc")}
          placeholder="Short description of the gift"
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Quantity</label>
          <input
            type="number"
            min="1"
            value={form.giftQty}
            onChange={handleChange("giftQty")}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Gift Image</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={form.imageUrl}
              onChange={handleChange("imageUrl")}
              placeholder="Paste image URL or leave blank"
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => alert("Upload not implemented in mock")}
              className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm"
              title="Upload image"
            >
              <FaImage />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const previewTitle = form.name || "Untitled Promotion";
  const previewSubtitle =
    mode === "discount"
      ? discountType === "percent"
        ? `${form.percent || 0}% Off`
        : `$${form.flat || 0} Off`
      : `Gift: ${form.giftName || "No Gift"}`;

  return (
    <div className="">
      <Header />
      <div className="font-sans text-gray-900 bg-white p-8 max-w-7xl mx-auto">
        {/* Top Hero */}
        <section className="bg-blue-50 rounded-lg p-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Create New Promotion</h1>
            <p className="text-sm text-gray-600 max-w-xl">
              Design and launch impactful promotions to boost sales and engage your customers. Configure discounts, gifts, validity periods, and eligibility criteria with ease.
            </p>
          </div>
          <div className="w-40 h-28 bg-white rounded shadow flex items-center justify-center">
            {/* illustration placeholder */}
            <div className="text-gray-300 text-xs">Image</div>
          </div>
        </section>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Details */}
            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Basic Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Promotion Name</label>
                  <input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="e.g., Summer Sale 2025"
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Promotion Type</label>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setMode("discount")}
                      className={`px-4 py-2 text-sm font-semibold rounded-l border ${mode === "discount" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"}`}
                    >
                      <span className="inline mr-2"><FaPercent /></span>
                      Discount
                    </button>
                    <button
                      onClick={() => setMode("gift")}
                      className={`px-4 py-2 text-sm font-semibold rounded-r border ${mode === "gift" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"}`}
                    >
                      <span className="inline mr-2"><FaGift /></span>
                      Gift
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount / Gift Details */}
            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">{
                mode === "discount" ? "Discount Details" : "Gift Details"
              }</h3>

              {mode === "discount" ? renderDiscountInputs() : renderGiftInputs()}
            </div>

            {/* Validity Period */}
            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Validity Period</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={handleChange("startDate")}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={handleChange("endDate")}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Eligibility Criteria</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Minimum Purchase Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minPurchase}
                    onChange={handleChange("minPurchase")}
                    placeholder="e.g., 50.00"
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">User Group</label>
                  <select
                    value={form.userGroup}
                    onChange={handleChange("userGroup")}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select user group</option>
                    <option value="all">All Customers</option>
                    <option value="new">New Customers</option>
                    <option value="vip">VIP Members</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-start pt-2">
              <button
                onClick={() => { /* reset or navigate away in real app */ alert("Cancelled (mock)"); }}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={onPreview}
                className="px-4 py-2 text-sm font-medium bg-gray-100 border border-gray-200 rounded"
              >
                Preview
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded"
              >
                Save Promotion
              </button>
            </div>
          </div>

          {/* Right: Visual Preview */}
          <aside className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3">Promotion Visual Preview</h4>
              <div className="border rounded overflow-hidden">
                <div className="h-36 bg-gray-50 flex items-center justify-center">
                  {form.imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={form.imageUrl} alt="promotion visual" className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-gray-300">Image preview</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold">{previewTitle} - <span className="font-normal text-sm text-gray-600">{previewSubtitle}</span></div>
                  <p className="text-xs text-gray-500 mt-2">
                    This is a preview of how the promotion might appear to customers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-4 text-sm text-gray-500">
              <div className="flex items-center gap-2 mb-2">
                <FaCalendarAlt />
                <span>{form.startDate || "Start date"} — {form.endDate || "End date"}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaUsers />
                <span>{form.userGroup || "Target: All customers"}</span>
              </div>
              {mode === "gift" && (
                <div className="flex items-center gap-2">
                  <FaGift />
                  <span>{form.giftName || "Gift: none"} • Qty: {form.giftQty}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Promotion;