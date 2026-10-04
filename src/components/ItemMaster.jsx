import React, { useState } from "react";

function ItemMaster() {
  const [itemName, setItemName] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [gstPercent, setGstPercent] = useState("");
  const [unit, setUnit] = useState("Bag");
  const [weightPerBag, setWeightPerBag] = useState("");
  const [ratePerBag, setRatePerBag] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    if (!itemName.trim()) {
      alert("Please enter Item Name");
      return;
    }

    console.log({
      itemName,
      hsnCode,
      gstPercent,
      unit,
      weightPerBag,
      ratePerBag,
    });

    alert("Item Master entry ready");
  };

  const handleClear = () => {
    setItemName("");
    setHsnCode("");
    setGstPercent("");
    setUnit("Bag");
    setWeightPerBag("");
    setRatePerBag("");
  };

  return (
    <div className="item-master">

      <div className="page-header">
        <h2>Item Master</h2>
        <p>Fertilizer Item Management</p>
      </div>

      <form onSubmit={handleSave}>

        <div className="form-grid">

          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>

          <div className="form-group">
            <label>HSN Code</label>
            <input
              type="text"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="Enter HSN code"
            />
          </div>

          <div className="form-group">
            <label>GST %</label>
            <input
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="Bag">Bag</option>
              <option value="Kg">Kg</option>
              <option value="Nos">Nos</option>
            </select>
          </div>

          <div className="form-group">
            <label>Weight Per Bag</label>
            <input
              type="number"
              step="0.001"
              value={weightPerBag}
              onChange={(e) => setWeightPerBag(e.target.value)}
              placeholder="Enter weight"
            />
          </div>

          <div className="form-group">
            <label>Rate Per Bag</label>
            <input
              type="number"
              step="0.01"
              value={ratePerBag}
              onChange={(e) => setRatePerBag(e.target.value)}
              placeholder="Enter rate"
            />
          </div>

        </div>

        <div className="form-actions">
          <button type="submit">
            Save Item
          </button>

          <button type="button" onClick={handleClear}>
            Clear
          </button>
        </div>

      </form>

    </div>
  );
}

export default ItemMaster;