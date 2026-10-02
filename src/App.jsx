import { useState } from 'react'

import './App.css'



function App() {



  const [loggedIn, setLoggedIn] = useState(false)
  const [currentShop, setCurrentShop] = useState(null)

  const [currentPage, setCurrentPage] = useState('dashboard')



  const [salesType, setSalesType] = useState('levy')



  const [levyItems, setLevyItems] = useState([])

  const [nonLevyItems, setNonLevyItems] = useState([])



  const [levyItem, setLevyItem] = useState('')

  const [levyQty, setLevyQty] = useState('')

  const [levyAmount, setLevyAmount] = useState('')



  const [nonLevyItem, setNonLevyItem] = useState('')

  const [nonLevyQty, setNonLevyQty] = useState('')

  const [nonLevySaleRate, setNonLevySaleRate] = useState('')

  const [nonLevyMrp, setNonLevyMrp] = useState('')



  const [expandedMenu, setExpandedMenu] = useState('')

  // =====================================================
  // ITEM MASTER
  // =====================================================

  const [itemMasterItems, setItemMasterItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('itemMasterItems') || '[]')
    } catch {
      return []
    }
  })

  const [itemMasterForm, setItemMasterForm] = useState({
    name: '',
    type: 'Levy',
    unit: 'Kg',
    saleRate: '',
    mrp: '',
    gst: '',
    status: 'Active'
  })
  const [editingItemId, setEditingItemId] = useState(null)

  const persistItemMaster = (items) => {
    setItemMasterItems(items)
    localStorage.setItem('itemMasterItems', JSON.stringify(items))
  }

  const resetItemMasterForm = () => {
    setItemMasterForm({ name: '', type: 'Levy', unit: 'Kg', saleRate: '', mrp: '', gst: '', status: 'Active' })
    setEditingItemId(null)
  }

  const saveItemMaster = () => {
    const name = itemMasterForm.name.trim()
    if (!name) return alert('Please enter item name.')
    if (itemMasterForm.saleRate === '') return alert('Please enter sale rate.')
    if (itemMasterForm.gst === '') return alert('Please enter GST %.')

    const duplicate = itemMasterItems.some(item =>
      item.id !== editingItemId && String(item.name).trim().toLowerCase() === name.toLowerCase()
    )
    if (duplicate) return alert('This item already exists in Item Master.')

    const item = {
      id: editingItemId || Date.now(),
      name,
      type: itemMasterForm.type,
      unit: itemMasterForm.unit,
      saleRate: Number(itemMasterForm.saleRate) || 0,
      mrp: itemMasterForm.mrp === '' ? '' : Number(itemMasterForm.mrp) || 0,
      gst: Number(itemMasterForm.gst) || 0,
      status: itemMasterForm.status
    }

    if (editingItemId) {
      persistItemMaster(itemMasterItems.map(existing => existing.id === editingItemId ? item : existing))
      alert('Item updated successfully.')
    } else {
      persistItemMaster([...itemMasterItems, item])
      alert('Item added successfully.')
    }
    resetItemMasterForm()
  }

  const editItemMaster = (item) => {
    setEditingItemId(item.id)
    setItemMasterForm({
      name: item.name || '',
      type: item.type || 'Levy',
      unit: item.unit || 'Kg',
      saleRate: item.saleRate ?? '',
      mrp: item.mrp ?? '',
      gst: item.gst ?? '',
      status: item.status || 'Active'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteItemMaster = (id) => {
    const item = itemMasterItems.find(entry => entry.id === id)
    if (!item) return
    if (!window.confirm(`Delete "${item.name}" from Item Master?`)) return
    persistItemMaster(itemMasterItems.filter(entry => entry.id !== id))
    if (editingItemId === id) resetItemMasterForm()
  }

  const activeItemMasterItems = itemMasterItems.filter(item => item.status === 'Active')

  // =====================================================
  // MANUAL STOCK ENTRY
  // =====================================================

  const [manualShop, setManualShop] = useState('')
  const [manualProduct, setManualProduct] = useState('')
  const [manualType, setManualType] = useState('')
  const [manualOpeningStock, setManualOpeningStock] = useState('')

  const [dailySalesDate, setDailySalesDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )

  const [selectedSalesDetail, setSelectedSalesDetail] = useState(null)
  const [salesDetailsFromDate, setSalesDetailsFromDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [salesDetailsToDate, setSalesDetailsToDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [salesDetailsResults, setSalesDetailsResults] = useState([])

  // =====================================================
  // LIABILITY
  // =====================================================

  const [liabilityEntries, setLiabilityEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('liabilityEntries') || '[]')
    } catch {
      return []
    }
  })

  const [liabilityForm, setLiabilityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Levy',
    billNo: '',
    opening: '',
    inward: '',
    sales: ''
  })

  const persistLiability = (entries) => {
    setLiabilityEntries(entries)
    localStorage.setItem('liabilityEntries', JSON.stringify(entries))
  }

  const getLiabilityLastCB = (type) => {
    const rows = liabilityEntries
      .filter(row => row.type === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id)
    return rows.length ? Number(rows[rows.length - 1].cb) || 0 : null
  }

  const saveLiabilityEntry = () => {
    const { date, type, billNo, opening, inward, sales } = liabilityForm
    const lastCB = getLiabilityLastCB(type)
    const openingValue = opening === '' ? lastCB : Number(opening)
    const inwardValue = Number(inward) || 0
    const salesValue = Number(sales) || 0

    if (!date) return alert('Please select date.')
    if (openingValue === null || Number.isNaN(openingValue)) {
      return alert('Please enter Opening Balance for the first entry.')
    }
    if (inwardValue === 0 && salesValue === 0) {
      return alert('Enter Stock Inward or Daily Sales amount.')
    }

    const entry = {
      id: Date.now(),
      date,
      type,
      billNo: billNo.trim(),
      opening: openingValue,
      inward: inwardValue,
      sales: salesValue,
      cb: openingValue + inwardValue - salesValue
    }

    persistLiability([...liabilityEntries, entry])
    setLiabilityForm({
      date,
      type,
      billNo: '',
      opening: String(entry.cb),
      inward: '',
      sales: ''
    })
  }

  const deleteLiabilityEntry = (id) => {
    const row = liabilityEntries.find(entry => entry.id === id)
    if (!row) return
    if (!window.confirm(`Delete this ${row.type} liability entry?`)) return
    persistLiability(liabilityEntries.filter(entry => entry.id !== id))
  }

  const liabilityRowsByType = (type) =>
    liabilityEntries
      .filter(row => row.type === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id)

  const liabilitySummary = (type) => {
    const rows = liabilityRowsByType(type)
    if (!rows.length) return { opening: 0, inward: 0, sales: 0, cb: 0 }
    return {
      opening: Number(rows[0].opening) || 0,
      inward: rows.reduce((sum, row) => sum + (Number(row.inward) || 0), 0),
      sales: rows.reduce((sum, row) => sum + (Number(row.sales) || 0), 0),
      cb: Number(rows[rows.length - 1].cb) || 0
    }
  }

  const formatAmount = (value) =>
    `₹${(Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const saveManualStock = () => {
    const selectedItem = activeItemMasterItems.find(
      item => item.name === manualProduct
    )

    if (!manualShop || !manualProduct || !selectedItem || !manualType || manualOpeningStock === '') {
      alert('Please select a product from Item Master and fill all fields.')
      return
    }

    const stockEntry = {
      id: Date.now(),
      shop: manualShop,
      product: manualProduct,
      type: manualType,
      openingStock: Number(manualOpeningStock),
      createdAt: new Date().toISOString()
    }

    const existingEntries = JSON.parse(
      localStorage.getItem('manualStockEntries') || '[]'
    )

    localStorage.setItem(
      'manualStockEntries',
      JSON.stringify([...existingEntries, stockEntry])
    )

    alert('Manual Stock saved successfully.')

    setManualShop('')
    setManualProduct('')
    setManualType('')
    setManualOpeningStock('')
  }




  /* =====================================================

     LOGIN

  ===================================================== */



  const handleLogin = (e) => {

    e.preventDefault()

    const cmsCode = e.currentTarget.cmsCode.value.trim().toUpperCase()
    const username = e.currentTarget.username.value.trim().toLowerCase()
    const password = e.currentTarget.password.value

    const shopUsers = {
      'admin': {
        cmsCode: 'RAPCMS',
        shopName: 'Admin',
        shopCode: 'ADMIN',
        initialPassword: 'pds123',
        role: 'admin'
      }
    }

    const shop = shopUsers[username]

    if (
      !shop ||
      cmsCode !== shop.cmsCode ||
      password !== shop.initialPassword
    ) {
      alert('Invalid CMS Code, Username or Password.')
      return
    }

    setCurrentShop(shop)
    setCurrentPage('dashboard')
    setLoggedIn(true)

  }



  /* =====================================================

     LOGOUT

  ===================================================== */



  const handleLogout = () => {

    setLoggedIn(false)
    setCurrentShop(null)
    setCurrentPage('dashboard')

  }



  /* =====================================================

     STOCK + ITEM MASTER HELPERS

  ===================================================== */

  const getManualStockEntries = () => {
    try {
      return JSON.parse(localStorage.getItem('manualStockEntries') || '[]')
    } catch {
      return []
    }
  }

  const getAvailableStock = (itemName, stockType) => {
    if (!itemName) return ''

    const entries = getManualStockEntries().filter(entry =>
      entry.product === itemName && entry.type === stockType
    )

    if (entries.length === 0) return 0

    // Use the latest manual opening-stock entry for this item/type.
    const latest = entries[entries.length - 1]
    const opening = Number(latest.openingStock) || 0

    const soldQty = (stockType === 'Levy' ? levyItems : nonLevyItems)
      .filter(sale => sale.item === itemName)
      .reduce((sum, sale) => sum + (Number(sale.qty) || 0), 0)

    return Math.max(0, opening - soldQty)
  }

  const getItemMasterRate = (itemName) => {
    if (!itemName) return 0
    const found = itemMasterItems.find(item =>
      String(item.name || '').trim().toLowerCase() === itemName.trim().toLowerCase()
    )
    return found ? Number(found.saleRate) || 0 : 0
  }

  const getItemMasterDetails = (itemName) => {
    if (!itemName) return null
    return itemMasterItems.find(item =>
      String(item.name || '').trim().toLowerCase() === itemName.trim().toLowerCase()
    ) || null
  }

  const isRiceOrWheat = (itemName) => {
    const name = String(itemName || '').trim().toLowerCase()
    return [
      'boiled rice',
      'aay rice',
      'wheat'
    ].includes(name)
  }

  const getLevyAmount = (itemName, qty) => {
    if (!itemName || isRiceOrWheat(itemName)) return ''

    const rate = getItemMasterRate(itemName)
    const quantity = Number(qty) || 0

    if (!rate || !quantity) return ''

    return (rate * quantity).toFixed(2)
  }


  /* =====================================================

     LEVY SAVE

  ===================================================== */



  const saveLevyItem = () => {



    if (!levyItem || !levyQty) {

      alert('Please select item and enter quantity.')

      return

    }



    const calculatedAmount = getLevyAmount(levyItem, levyQty)

    const newItem = {

      id: Date.now(),

      item: levyItem,

      qty: Number(levyQty),

      amount: Number(calculatedAmount) || 0

    }



    setLevyItems([...levyItems, newItem])



    setLevyItem('')

    setLevyQty('')

    setLevyAmount('')

  }



  /* =====================================================

     NON LEVY SAVE

  ===================================================== */



  const saveNonLevyItem = () => {



    if (!nonLevyItem || !nonLevyQty) {

      alert('Please select item and enter quantity.')

      return

    }



    const saleRate = Number(getItemMasterDetails(nonLevyItem)?.saleRate) || 0

    const qty = Number(nonLevyQty)



    const newItem = {

      id: Date.now(),

      item: nonLevyItem,

      qty: qty,

      saleRate: saleRate,

      mrp: Number(getItemMasterDetails(nonLevyItem)?.mrp) || 0,

      amount: qty * saleRate

    }



    setNonLevyItems([...nonLevyItems, newItem])



    setNonLevyItem('')

    setNonLevyQty('')

    setNonLevySaleRate('')

    setNonLevyMrp('')

  }



  /* =====================================================

     TOTALS

  ===================================================== */



  const levyTotal = levyItems.reduce(

    (total, item) => total + item.amount,

    0

  )



  const nonLevyTotal = nonLevyItems.reduce(

    (total, item) => total + item.amount,

    0

  )



  const grandTotal = levyTotal + nonLevyTotal



  /* =====================================================

     DELETE ITEMS

  ===================================================== */



  const deleteLevyItem = (id) => {

    setLevyItems(

      levyItems.filter(item => item.id !== id)

    )

  }



  const deleteNonLevyItem = (id) => {

    setNonLevyItems(

      nonLevyItems.filter(item => item.id !== id)

    )

  }



  /* =====================================================

     CLEAR

  ===================================================== */



  const clearLevy = () => {

    setLevyItem('')

    setLevyQty('')

    setLevyAmount('')

  }



  const clearNonLevy = () => {

    setNonLevyItem('')

    setNonLevyQty('')

    setNonLevySaleRate('')

    setNonLevyMrp('')

  }



  /* =====================================================

     SIDEBAR MENU

  ===================================================== */



  const toggleMenu = (menu) => {

    setExpandedMenu(

      expandedMenu === menu ? '' : menu

    )

  }



  const getDailySalesRecords = () => {
    try {
      return JSON.parse(localStorage.getItem('dailySalesRecords') || '[]')
    } catch {
      return []
    }
  }

  const saveDailySalesRecord = () => {
    if (levyItems.length === 0 && nonLevyItems.length === 0) {
      alert('Please enter at least one sales item before saving.')
      return
    }

    const existing = getDailySalesRecords()
    const qrTransactions = (() => {
      try {
        return JSON.parse(localStorage.getItem('qrTransactions') || '[]')
      } catch {
        return []
      }
    })()

    const hasSuccessfulQr = qrTransactions.some(tx =>
      tx.date === dailySalesDate &&
      String(tx.status || '').toLowerCase() === 'success'
    )

    const record = {
      id: Date.now(),
      date: dailySalesDate,
      amount: Number(grandTotal.toFixed(2)),
      qrBased: hasSuccessfulQr,
      shopCode: currentShop?.shopCode || 'ADMIN',
      levyItems: levyItems.map(item => ({ ...item })),
      nonLevyItems: nonLevyItems.map(item => ({ ...item }))
    }

    localStorage.setItem('dailySalesRecords', JSON.stringify([...existing, record]))
    alert('Daily sales saved successfully.')

    setLevyItems([])
    setNonLevyItems([])
  }

  const searchDailySalesDetails = () => {
    const all = getDailySalesRecords()
    const filtered = all
      .filter(record => {
        const date = record.date
        return date >= salesDetailsFromDate && date <= salesDetailsToDate &&
          (!record.shopCode || record.shopCode === (currentShop?.shopCode || 'ADMIN'))
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .map((record, index) => ({ ...record, serialNo: index + 1 }))

    setSalesDetailsResults(filtered)
    setSelectedSalesDetail(null)
  }

  const DailySalesDetailsPage = () => {
    return (
      <div className="sales-page">
        <div className="sales-page-header">
          <div>
            <button className="back-button" onClick={() => setCurrentPage('dashboard')}>
              ← Back to Dashboard
            </button>
            <h1>Daily Sales Details</h1>
            <p>Search and view saved daily sales records</p>
          </div>
        </div>

        <section className="sales-card">
          <div className="sales-card-header">
            <div>
              <h2>Search Daily Sales</h2>
              <p>Select a date range and search</p>
            </div>
          </div>

          <div className="sales-form-grid">
            <div className="sales-input-group">
              <label>From Date</label>
              <input type="date" value={salesDetailsFromDate} onChange={e => setSalesDetailsFromDate(e.target.value)} />
            </div>
            <div className="sales-input-group">
              <label>To Date</label>
              <input type="date" value={salesDetailsToDate} onChange={e => setSalesDetailsToDate(e.target.value)} />
            </div>
            <div className="sales-input-group" style={{ justifyContent: 'flex-end' }}>
              <label>&nbsp;</label>
              <button className="save-button" onClick={searchDailySalesDetails}>🔍 Search</button>
            </div>
          </div>
        </section>

        <section className="sales-card">
          <div className="sales-card-header">
            <div>
              <h2>Sales Records</h2>
              <p>{salesDetailsResults.length} record(s) found</p>
            </div>
          </div>

          {salesDetailsResults.length === 0 ? (
            <div className="empty-activity">
              <div>📊</div>
              <h3>No sales records found</h3>
              <p>Save Daily Sales first, then search the required date range.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr>
                    {['S.No', 'Date', 'Amount', 'QR Based', 'View'].map(head => (
                      <th key={head} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salesDetailsResults.map(record => (
                    <tr key={record.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{record.serialNo}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{record.date}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 600 }}>₹ {Number(record.amount).toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontWeight: 600 }}>{record.qrBased ? 'Yes' : 'No'}</span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <button className="save-button" onClick={() => setSelectedSalesDetail(record)}>👁 View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedSalesDetail && (
          <section className="sales-card">
            <div className="sales-card-header">
              <div>
                <h2>Sales Details — {selectedSalesDetail.date}</h2>
                <p>Total Amount: ₹ {Number(selectedSalesDetail.amount).toFixed(2)}</p>
              </div>
              <button className="final-clear-button" onClick={() => setSelectedSalesDetail(null)}>Close</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Type', 'Item', 'Qty/Kg', 'Sale Rate', 'GST %', 'Amount'].map(head => (
                      <th key={head} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...selectedSalesDetail.levyItems.map(item => ({ ...item, type: 'Levy' })),
                    ...selectedSalesDetail.nonLevyItems.map(item => ({ ...item, type: 'Non-Levy' }))
                  ].map((item, index) => {
                    const master = getItemMasterDetails(item.item)
                    return (
                      <tr key={`${item.id || index}-${item.item}`}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.type}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.item}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.qty}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{isRiceOrWheat(item.item) ? '—' : `₹ ${Number(master?.saleRate || item.saleRate || 0).toFixed(2)}`}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{master?.gst ? `${master.gst}%` : '—'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 600 }}>{isRiceOrWheat(item.item) ? '—' : `₹ ${Number(item.amount || 0).toFixed(2)}`}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    )
  }

  /* =====================================================

     DAILY SALES PAGE

  ===================================================== */



  const DailySalesPage = () => {



    return (

      <div className="sales-page">



        {/* HEADER */}



        <div className="sales-page-header">



          <div>

            <button

              className="back-button"

              onClick={() => setCurrentPage('dashboard')}

            >

              ← Back to Dashboard

            </button>



            <h1>Daily Sales Entry</h1>



            <p>

              Enter today's levy and non-levy sales

            </p>

          </div>



          <div className="sales-date-box">

            <label>Date</label>



            <input

              type="date"

              value={dailySalesDate}

              onChange={e => setDailySalesDate(e.target.value)}

            />

          </div>



        </div>





        {/* SALES TYPE TABS */}



        <div className="sales-tabs">



          <button

            className={

              salesType === 'levy'

                ? 'sales-tab active'

                : 'sales-tab'

            }

            onClick={() => setSalesType('levy')}

          >

            📦 Levy Sales

          </button>



          <button

            className={

              salesType === 'nonlevy'

                ? 'sales-tab active'

                : 'sales-tab'

            }

            onClick={() => setSalesType('nonlevy')}

          >

            🛒 Non-Levy Sales

          </button>



        </div>





        {/* =================================================

            LEVY

        ================================================= */}



        {salesType === 'levy' && (



          <section className="sales-card">



            <div className="sales-card-header">



              <div>

                <h2>Levy Sales</h2>

                <p>

                  Enter levy item quantity and amount

                </p>

              </div>



              <div className="sales-badge levy-badge">

                LEVY

              </div>



            </div>





            <div className="sales-form-grid">



              {/* ITEM */}



              <div className="sales-input-group">



                <label>Item Name</label>



                <select

                  value={levyItem}

                  onChange={(e) =>

                    setLevyItem(e.target.value)

                  }

                >



                  <option value="">

                    Select Item

                  </option>
                  {activeItemMasterItems.filter(item => item.type === 'Levy').map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}



                </select>



              </div>





              {/* QUANTITY */}



              <div className="sales-input-group">



                <label>Qty / Kg</label>



                <input

                  type="number"

                  placeholder="Enter quantity"

                  value={levyQty}

                  onChange={(e) =>

                    setLevyQty(e.target.value)

                  }

                />



              </div>





              {/* STOCK */}



              <div className="sales-input-group">



                <label>Available Stock</label>



                <div className="stock-display">

                  {levyItem
                    ? `${getAvailableStock(levyItem, 'Levy')} Kg`
                    : 'Select an item to view stock'}

                </div>



              </div>





              {/* AMOUNT */}



              <div className="sales-input-group">



                <label>Amount</label>



                <div className="calculated-amount">

                  {isRiceOrWheat(levyItem)
                    ? '—'
                    : getLevyAmount(levyItem, levyQty)
                      ? `₹ ${getLevyAmount(levyItem, levyQty)}`
                      : 'Rate will come from Item Master'}

                </div>



              </div>



            </div>





            <div className="sales-actions">



              <button

                className="save-button"

                onClick={saveLevyItem}

              >

                ✓ Save

              </button>



              <button

                className="clear-button"

                onClick={clearLevy}

              >

                Clear

              </button>



            </div>





            {/* LEVY TABLE */}



            {levyItems.length > 0 && (



              <div className="sales-table-wrapper">



                <table className="sales-table">



                  <thead>



                    <tr>

                      <th>#</th>

                      <th>Item Name</th>

                      <th>Qty / Kg</th>

                      <th>Amount</th>

                      <th>Action</th>

                    </tr>



                  </thead>



                  <tbody>



                    {levyItems.map((item, index) => (



                      <tr key={item.id}>



                        <td>{index + 1}</td>



                        <td>{item.item}</td>



                        <td>{item.qty}</td>



                        <td>

                          ₹ {item.amount.toFixed(2)}

                        </td>



                        <td>



                          <button

                            className="delete-button"

                            onClick={() =>

                              deleteLevyItem(item.id)

                            }

                          >

                            Delete

                          </button>



                        </td>



                      </tr>



                    ))}



                  </tbody>



                </table>



              </div>



            )}





            <div className="section-total">



              <span>LEVY TOTAL</span>



              <strong>

                ₹ {levyTotal.toFixed(2)}

              </strong>



            </div>



          </section>



        )}





        {/* =================================================

            NON LEVY

        ================================================= */}



        {salesType === 'nonlevy' && (



          <section className="sales-card">



            <div className="sales-card-header">



              <div>

                <h2>Non-Levy Sales</h2>

                <p>

                  Enter non-levy item sales details

                </p>

              </div>



              <div className="sales-badge nonlevy-badge">

                NON-LEVY

              </div>



            </div>





            <div className="sales-form-grid">





              {/* ITEM */}



              <div className="sales-input-group">



                <label>Item Name</label>



                <select

                  value={nonLevyItem}

                  onChange={(e) =>

                    setNonLevyItem(e.target.value)

                  }

                >



                  <option value="">

                    Select Item

                  </option>
                  {activeItemMasterItems.filter(item => item.type === 'Non-Levy').map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}



                </select>



              </div>





              {/* QTY */}



              <div className="sales-input-group">



                <label>Qty</label>



                <input

                  type="number"

                  placeholder="Enter quantity"

                  value={nonLevyQty}

                  onChange={(e) =>

                    setNonLevyQty(e.target.value)

                  }

                />



              </div>





              {/* STOCK */}



              <div className="sales-input-group">



                <label>Available Stock</label>



                <div className="stock-display">

                  {nonLevyItem
                    ? `${getAvailableStock(nonLevyItem, 'Non-Levy')} Kg`
                    : 'Select an item to view stock'}

                </div>



              </div>





              {/* SALE RATE */}



              <div className="sales-input-group">



                <label>Sale Rate</label>



                <input
                  type="number"
                  placeholder="Item Master rate"
                  value={getItemMasterDetails(nonLevyItem)?.saleRate ?? ''}
                  readOnly
                />



              </div>





              {/* MRP */}



              <div className="sales-input-group">



                <label>MRP Rate</label>



                <input
                  type="number"
                  placeholder="Item Master MRP"
                  value={getItemMasterDetails(nonLevyItem)?.mrp ?? ''}
                  readOnly
                />



              </div>





              {/* AMOUNT */}



              <div className="sales-input-group">



                <label>Amount</label>



                <div className="calculated-amount">



                  ₹ {

                    (

                      Number(nonLevyQty || 0) *

                      Number(nonLevySaleRate || 0)

                    ).toFixed(2)

                  }



                </div>



              </div>



            </div>





            <div className="sales-actions">



              <button

                className="save-button"

                onClick={saveNonLevyItem}

              >

                ✓ Save

              </button>



              <button

                className="clear-button"

                onClick={clearNonLevy}

              >

                Clear

              </button>



            </div>





            {/* NON LEVY TABLE */}



            {nonLevyItems.length > 0 && (



              <div className="sales-table-wrapper">



                <table className="sales-table">



                  <thead>



                    <tr>

                      <th>#</th>

                      <th>Item</th>

                      <th>Qty</th>

                      <th>Sale Rate</th>

                      <th>MRP</th>

                      <th>Amount</th>

                      <th>Action</th>

                    </tr>



                  </thead>



                  <tbody>



                    {nonLevyItems.map((item, index) => (



                      <tr key={item.id}>



                        <td>{index + 1}</td>



                        <td>{item.item}</td>



                        <td>{item.qty}</td>



                        <td>

                          ₹ {item.saleRate.toFixed(2)}

                        </td>



                        <td>

                          ₹ {item.mrp.toFixed(2)}

                        </td>



                        <td>

                          ₹ {item.amount.toFixed(2)}

                        </td>



                        <td>



                          <button

                            className="delete-button"

                            onClick={() =>

                              deleteNonLevyItem(item.id)

                            }

                          >

                            Delete

                          </button>



                        </td>



                      </tr>



                    ))}



                  </tbody>



                </table>



              </div>



            )}





            <div className="section-total">



              <span>NON-LEVY TOTAL</span>



              <strong>

                ₹ {nonLevyTotal.toFixed(2)}

              </strong>



            </div>



          </section>



        )}





        {/* =================================================

            TOTAL SUMMARY

        ================================================= */}



        <section className="sales-summary">



          <div className="summary-row">



            <span>Levy Total</span>



            <strong>

              ₹ {levyTotal.toFixed(2)}

            </strong>



          </div>





          <div className="summary-row">



            <span>Non-Levy Total</span>



            <strong>

              ₹ {nonLevyTotal.toFixed(2)}

            </strong>



          </div>





          <div className="summary-divider"></div>





          <div className="summary-row grand-row">



            <span>GRAND TOTAL</span>



            <strong>

              ₹ {grandTotal.toFixed(2)}

            </strong>



          </div>





          <div className="qr-summary">



            <div>

              <span>QR Collection</span>

              <small>

                Successful QR transactions only

              </small>

            </div>



            <strong>₹ 0.00</strong>



          </div>





          <div className="total-collection">



            <span>TOTAL COLLECTION</span>



            <strong>

              ₹ {grandTotal.toFixed(2)}

            </strong>



          </div>



        </section>





        {/* FINAL SAVE */}



        <div className="final-sales-actions">



          <button

            className="final-save-button"

            onClick={saveDailySalesRecord}

          >

            💾 Save Daily Sales

          </button>



          <button

            className="final-clear-button"

            onClick={() => {

              setLevyItems([])

              setNonLevyItems([])

            }}

          >

            Clear All

          </button>



        </div>



      </div>

    )

  }





  /* =====================================================

     DASHBOARD

  ===================================================== */





  /* =====================================================
     MANUAL STOCK ENTRY PAGE
  ===================================================== */

  const ManualStockPage = () => {
    return (
      <div className="sales-page">
        <div className="sales-page-header">
          <div>
            <button
              className="back-button"
              onClick={() => setCurrentPage('dashboard')}
            >
              ← Back to Dashboard
            </button>
            <h1>Manual Stock Entry</h1>
            <p>Enter opening stock manually</p>
          </div>
        </div>

        <section className="sales-card">
          <div className="sales-card-header">
            <div>
              <h2>Manual Stock Entry</h2>
              <p>Enter shop opening stock details</p>
            </div>
            <div className="sales-badge levy-badge">STOCK</div>
          </div>

          <div className="sales-form-grid">
            <div className="sales-input-group">
              <label>Shop Name</label>
              <select
                value={manualShop}
                onChange={(e) => setManualShop(e.target.value)}
              >
                <option value="">Select Shop</option>
                <option>Shop 01</option>
                <option>Shop 02</option>
                <option>Shop 03</option>
                <option>Shop 04</option>
                <option>Shop 05</option>
                <option>Shop 06</option>
                <option>Shop 07</option>
                <option>Shop 08</option>
                <option>Shop 09</option>
                <option>Shop 10</option>
                <option>Shop 11</option>
                <option>Shop 12</option>
                <option>Shop 13</option>
                <option>Shop 14</option>
              </select>
            </div>

            <div className="sales-input-group">
              <label>Product</label>
              <select
                value={manualProduct}
                onChange={(e) => {
                  const selectedName = e.target.value
                  const selectedItem = activeItemMasterItems.find(
                    item => item.name === selectedName
                  )
                  setManualProduct(selectedName)
                  setManualType(selectedItem ? selectedItem.type : '')
                }}
              >
                <option value="">Select Product</option>
                {activeItemMasterItems.map(item => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              {activeItemMasterItems.length === 0 && (
                <small style={{ color: '#b45309', marginTop: 6, display: 'block' }}>
                  Add an Active item in Item Master first.
                </small>
              )}
            </div>

            <div className="sales-input-group">
              <label>Levy / Non-Levy</label>
              <input
                type="text"
                value={manualType}
                placeholder="Auto from Item Master"
                readOnly
              />
            </div>

            <div className="sales-input-group">
              <label>Opening Stock</label>
              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="Enter opening stock"
                value={manualOpeningStock}
                onChange={(e) => setManualOpeningStock(e.target.value)}
              />
            </div>
          </div>

          <div className="sales-actions">
            <button
              className="save-button"
              onClick={saveManualStock}
            >
              ✓ Save
            </button>
          </div>
        </section>
      </div>
    )
  }

  /* =====================================================
     ITEM MASTER PAGE
  ===================================================== */

  const ItemMasterPage = () => {
    return (
      <div className="sales-page">
        <div className="sales-page-header">
          <div>
            <button
              className="back-button"
              onClick={() => setCurrentPage('dashboard')}
            >
              ← Back to Dashboard
            </button>
            <h1>Item Master</h1>
            <p>Manage item name, levy type, rate and GST</p>
          </div>
        </div>

        <section className="sales-card">
          <div className="sales-card-header">
            <div>
              <h2>{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
              <p>Item Master details used by Daily Sales</p>
            </div>
            <div className="sales-badge levy-badge">ITEM MASTER</div>
          </div>

          <div className="sales-form-grid">
            <div className="sales-input-group">
              <label>Item Name</label>
              <input
                type="text"
                placeholder="Enter item name"
                value={itemMasterForm.name}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, name: e.target.value })
                }
              />
            </div>

            <div className="sales-input-group">
              <label>Levy / Non-Levy</label>
              <select
                value={itemMasterForm.type}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, type: e.target.value })
                }
              >
                <option value="Levy">Levy</option>
                <option value="Non-Levy">Non-Levy</option>
              </select>
            </div>

            <div className="sales-input-group">
              <label>Unit</label>
              <select
                value={itemMasterForm.unit}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, unit: e.target.value })
                }
              >
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Nos">Nos</option>
                <option value="Packet">Packet</option>
              </select>
            </div>

            <div className="sales-input-group">
              <label>Sale Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter sale rate"
                value={itemMasterForm.saleRate}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, saleRate: e.target.value })
                }
              />
            </div>

            <div className="sales-input-group">
              <label>MRP</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter MRP (optional)"
                value={itemMasterForm.mrp}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, mrp: e.target.value })
                }
              />
            </div>

            <div className="sales-input-group">
              <label>GST %</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter GST %"
                value={itemMasterForm.gst}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, gst: e.target.value })
                }
              />
            </div>

            <div className="sales-input-group">
              <label>Status</label>
              <select
                value={itemMasterForm.status}
                onChange={(e) =>
                  setItemMasterForm({ ...itemMasterForm, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="sales-actions">
            <button className="save-button" onClick={saveItemMaster}>
              {editingItemId ? '✓ Update Item' : '✓ Save Item'}
            </button>
            <button className="final-clear-button" onClick={resetItemMasterForm}>
              Clear
            </button>
          </div>
        </section>

        <section className="sales-card" style={{ marginTop: 20 }}>
          <div className="sales-card-header">
            <div>
              <h2>Item List</h2>
              <p>All items available in Item Master</p>
            </div>
            <div className="sales-badge levy-badge">{itemMasterItems.length} ITEMS</div>
          </div>

          {itemMasterItems.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#6b7280' }}>
              No items added yet. Add your first item above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 12, textAlign: 'left' }}>#</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Item Name</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Unit</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>Sale Rate</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>MRP</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>GST %</th>
                    <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
                    <th style={{ padding: 12, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {itemMasterItems.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ padding: 12 }}>{index + 1}</td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: 12 }}>{item.type}</td>
                      <td style={{ padding: 12 }}>{item.unit}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>₹ {Number(item.saleRate || 0).toFixed(2)}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>
                        {item.mrp === '' || item.mrp === null || item.mrp === undefined
                          ? '—'
                          : `₹ ${Number(item.mrp).toFixed(2)}`}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{Number(item.gst || 0).toFixed(2)}%</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>{item.status}</td>
                      <td style={{ padding: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => editItemMaster(item)}
                          style={{ marginRight: 8, padding: '7px 12px', borderRadius: 8, border: '1px solid #0a8f4d', background: '#fff', color: '#0a8f4d', cursor: 'pointer' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItemMaster(item.id)}
                          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #dc2626', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    )
  }

  const LiabilityPage = () => {
    const levy = liabilityRowsByType('Levy')
    const nonLevy = liabilityRowsByType('Non-Levy')
    const levyTotal = liabilitySummary('Levy')
    const nonLevyTotal = liabilitySummary('Non-Levy')
    const grandTotal = {
      opening: levyTotal.opening + nonLevyTotal.opening,
      inward: levyTotal.inward + nonLevyTotal.inward,
      sales: levyTotal.sales + nonLevyTotal.sales,
      cb: levyTotal.cb + nonLevyTotal.cb
    }

    const renderLedger = (title, rows, total) => (
      <section className="dashboard-section" style={{ marginBottom: 24 }}>
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            <p>Running liability ledger</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>DATE</th>
                <th>BILL NO</th>
                <th>OPENING BALANCE</th>
                <th>STOCK INWARD</th>
                <th>DAILY SALES</th>
                <th>CB</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 28 }}>
                    No entries yet. Use the form above to add a test entry.
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row.id}>
                  <td>{new Date(row.date + 'T00:00:00').toLocaleDateString('en-GB')}</td>
                  <td>{row.billNo || '—'}</td>
                  <td>{formatAmount(row.opening)}</td>
                  <td>{row.inward ? formatAmount(row.inward) : '—'}</td>
                  <td>{row.sales ? formatAmount(row.sales) : '—'}</td>
                  <td><strong>{formatAmount(row.cb)}</strong></td>
                  <td>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteLiabilityEntry(row.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: '#f7faf8' }}>
                <td colSpan="2">TOTAL</td>
                <td>{formatAmount(total.opening)}</td>
                <td>{formatAmount(total.inward)}</td>
                <td>{formatAmount(total.sales)}</td>
                <td>{formatAmount(total.cb)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    )

    return (
      <div className="dashboard">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">R</div>
            <div><h2>RAPCMS</h2><p>Ration Shop Management</p></div>
          </div>
          <div className="sidebar-menu">
            <button className="menu-item" onClick={() => setCurrentPage('dashboard')}>🏠 <span>Dashboard</span></button>
            <button className="menu-item active" onClick={() => setCurrentPage('liability')}>💰 <span>Liability</span></button>
            <button className="menu-item" onClick={() => setCurrentPage('daily-sales')}>🧾 <span>Daily Sales</span></button>
            <button className="menu-item" onClick={() => setCurrentPage('item-master')}>📦 <span>Item Master</span></button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div>
              <h1>Liability</h1>
              <p>Levy and Non-Levy running liability</p>
            </div>
            <button className="logout-button" onClick={() => setLoggedIn(false)}>Logout</button>
          </header>

          <section className="dashboard-section" style={{ marginBottom: 24 }}>
            <div className="section-heading">
              <div>
                <h2>Add Liability Entry</h2>
                <p>Use this form for initial testing. Later Stock Inward and Daily Sales will update it automatically.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Date</label>
                <input type="date" value={liabilityForm.date} style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b', border: '1px solid #d5dfdb' }} onChange={e => setLiabilityForm({ ...liabilityForm, date: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select
                  style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b', border: '1px solid #d5dfdb' }}
                  value={liabilityForm.type}
                  onChange={e => {
                    const type = e.target.value
                    const last = getLiabilityLastCB(type)
                    setLiabilityForm({ ...liabilityForm, type, opening: last === null ? '' : String(last) })
                  }}
                >
                  <option value="Levy">Levy</option>
                  <option value="Non-Levy">Non-Levy</option>
                </select>
              </div>
              <div className="input-group">
                <label>Bill No</label>
                <input type="text" value={liabilityForm.billNo} style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b', border: '1px solid #d5dfdb' }} placeholder="L/156 or NL/456" onChange={e => setLiabilityForm({ ...liabilityForm, billNo: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Opening Balance</label>
                <input type="number" value={liabilityForm.opening} style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b', border: '1px solid #d5dfdb' }} placeholder="Opening balance" onChange={e => setLiabilityForm({ ...liabilityForm, opening: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Stock Inward</label>
                <input type="number" value={liabilityForm.inward} style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b', border: '1px solid #d5dfdb' }} placeholder="0" onChange={e => setLiabilityForm({ ...liabilityForm, inward: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Daily Sales</label>
                <input type="number" value={liabilityForm.sales} style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b', border: '1px solid #d5dfdb' }} placeholder="0" onChange={e => setLiabilityForm({ ...liabilityForm, sales: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button className="save-button" onClick={saveLiabilityEntry}>💾 Save Entry</button>
              <button className="final-clear-button" onClick={() => setLiabilityForm({ date: new Date().toISOString().split('T')[0], type: 'Levy', billNo: '', opening: '', inward: '', sales: '' })}>Clear</button>
            </div>
          </section>

          {renderLedger('LEVY', levy, levyTotal)}
          {renderLedger('NON - LEVY', nonLevy, nonLevyTotal)}

          <section className="dashboard-section">
            <div className="section-heading">
              <div><h2>Combined Abstract</h2><p>Levy + Non-Levy</p></div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th></th><th>OPENING BALANCE</th><th>STOCK INWARD</th><th>DAILY SALES</th><th>CB</th></tr></thead>
                <tbody>
                  <tr><td><strong>LEVY</strong></td><td>{formatAmount(levyTotal.opening)}</td><td>{formatAmount(levyTotal.inward)}</td><td>{formatAmount(levyTotal.sales)}</td><td>{formatAmount(levyTotal.cb)}</td></tr>
                  <tr><td><strong>NON-LEVY</strong></td><td>{formatAmount(nonLevyTotal.opening)}</td><td>{formatAmount(nonLevyTotal.inward)}</td><td>{formatAmount(nonLevyTotal.sales)}</td><td>{formatAmount(nonLevyTotal.cb)}</td></tr>
                  <tr style={{ fontWeight: 700, background: '#f7faf8' }}><td>TOTAL</td><td>{formatAmount(grandTotal.opening)}</td><td>{formatAmount(grandTotal.inward)}</td><td>{formatAmount(grandTotal.sales)}</td><td>{formatAmount(grandTotal.cb)}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    )
  }

  const Dashboard = () => {



    return (



      <div className="dashboard">



        {/* SIDEBAR */}



        <aside className="sidebar">



          <div className="sidebar-brand">



            <div className="sidebar-logo">

              R

            </div>



            <div>

              <h2>RAPCMS</h2>

              <p>Ration Shop Management</p>

            </div>



          </div>





          <div className="sidebar-menu">



            <div className="menu-group">



              <button

                className={

                  currentPage === 'dashboard'

                    ? 'menu-item active'

                    : 'menu-item'

                }

                onClick={() =>

                  setCurrentPage('dashboard')

                }

              >

                <span>🏠</span>

                <span>Dashboard</span>

              </button>



            </div>





            {/* LIABILITY */}
            <div className="menu-group">
              <button
                className={currentPage === 'liability' ? 'menu-item active' : 'menu-item'}
                onClick={() => setCurrentPage('liability')}
              >
                <span>💰</span>
                <span>Liability</span>
              </button>
            </div>

            {/* SALES ENTRY */}



            <div className="menu-group">



              <button

                className="menu-item"

                onClick={() =>

                  toggleMenu('sales')

                }

              >



                <span>🧾</span>



                <span>Sales Entry</span>



                <span className="menu-arrow">

                  {expandedMenu === 'sales'

                    ? '⌃'

                    : '›'}

                </span>



              </button>





              {expandedMenu === 'sales' && (



                <div className="submenu">



                  <button

                    className="submenu-item"

                    onClick={() =>

                      setCurrentPage('daily-sales')

                    }

                  >

                    1. Daily Sales

                  </button>



                  <button

                    className="submenu-item"

                    onClick={() => setCurrentPage('daily-sales-details')}

                  >

                    2. Daily Sales Details

                  </button>



                </div>



              )}



            </div>





            {/* ITEM MASTER */}



            <div className="menu-group">



              <button

                className="menu-item"

                onClick={() =>

                  toggleMenu('item')

                }

              >



                <span>📦</span>



                <span>Item Master</span>



                <span className="menu-arrow">

                  {expandedMenu === 'item'

                    ? '⌃'

                    : '›'}

                </span>



              </button>





              {expandedMenu === 'item' && (



                <div className="submenu">



                  <button className="submenu-item" onClick={() => setCurrentPage('item-master')}>
                    1. Add / Edit Item
                  </button>

                  <button className="submenu-item" onClick={() => setCurrentPage('item-master')}>
                    2. Tax Details
                  </button>



                </div>



              )}



            </div>





            {/* STOCK */}



            <div className="menu-group">



              <button

                className="menu-item"

                onClick={() =>

                  toggleMenu('stock')

                }

              >



                <span>📥</span>



                <span>Stock Inward</span>



                <span className="menu-arrow">

                  {expandedMenu === 'stock'

                    ? '⌃'

                    : '›'}

                </span>



              </button>





              {expandedMenu === 'stock' && (



                <div className="submenu">



                  <button className="submenu-item">

                    1. Levy

                  </button>



                  <button className="submenu-item">

                    2. Non-Levy

                  </button>



                  <button className="submenu-item">

                    3. Stock Details

                  </button>



                </div>



              )}



            </div>





            {/* QR TRANSACTIONS */}



            <div className="menu-group">



              <button

                className="menu-item"

                onClick={() =>

                  toggleMenu('qr')

                }

              >



                <span>💳</span>



                <span>QR Transactions</span>



                <span className="menu-arrow">

                  {expandedMenu === 'qr'

                    ? '⌃'

                    : '›'}

                </span>



              </button>





              {expandedMenu === 'qr' && (



                <div className="submenu">



                  <button className="submenu-item">

                    1. QR Entry

                  </button>



                  <button className="submenu-item">

                    2. QR Details

                  </button>



                </div>



              )}



            </div>





            {/* VAT */}



            <div className="menu-group">



              <button className="menu-item">



                <span>🧮</span>



                <span>VAT Entry</span>



              </button>



            </div>





            {/* FINE */}



            <div className="menu-group">



              <button

                className="menu-item"

                onClick={() =>

                  toggleMenu('fine')

                }

              >



                <span>📋</span>



                <span>Fine Challan</span>



                <span className="menu-arrow">

                  {expandedMenu === 'fine'

                    ? '⌃'

                    : '›'}

                </span>



              </button>





              {expandedMenu === 'fine' && (



                <div className="submenu">



                  <button className="submenu-item">

                    1. Date-wise Fine Details

                  </button>



                </div>



              )}



            </div>



          </div>





          {/* SIDEBAR BOTTOM */}



          <div className="sidebar-bottom">



            <button className="menu-item">

              <span>⚙️</span>

              <span>Settings</span>

            </button>



            <button

              className="menu-item logout"

              onClick={handleLogout}

            >

              <span>🚪</span>

              <span>Logout</span>

            </button>



          </div>



        </aside>





        {/* MAIN */}



        <main className="dashboard-main">



          <header className="topbar">



            <div>

              <h1>Dashboard</h1>



              <p>

                Ration Shop Management System

              </p>

            </div>





            <div className="topbar-user">



              <div className="notification">

                🔔

              </div>





              <div className="user-info">



                <div className="user-avatar">

                  GK

                </div>



                <div>

                  <strong>Gokul Kannan</strong>

                  <span>Shop User</span>

                </div>



              </div>



            </div>



          </header>





          <div className="dashboard-content">



            {/* SHOP BANNER */}



            <div className="shop-banner">



              <div>



                <span>

                  LOGGED-IN SHOP

                </span>



                <h2>

                  Ration Shop

                </h2>



              </div>



              <div className="shop-status">

                ● Active

              </div>



            </div>





            {/* SUMMARY */}



            <div className="summary-grid">



              <div className="summary-card">



                <div className="card-icon">

                  🧾

                </div>



                <div>

                  <span>Today's Sales</span>

                  <h2>₹ 0.00</h2>

                </div>



              </div>





              <div className="summary-card">



                <div className="card-icon">

                  📦

                </div>



                <div>

                  <span>Stock Items</span>

                  <h2>0</h2>

                </div>



              </div>





              <div className="summary-card">



                <div className="card-icon">

                  💳

                </div>



                <div>

                  <span>QR Collection</span>

                  <h2>₹ 0.00</h2>

                </div>



              </div>





              <div className="summary-card">



                <div className="card-icon">

                  📊

                </div>



                <div>

                  <span>Transactions</span>

                  <h2>0</h2>

                </div>



              </div>



            </div>





            {/* QUICK ACTIONS */}



            <section className="dashboard-section">



              <div className="section-heading">



                <div>

                  <h2>Quick Actions</h2>



                  <p>

                    Frequently used modules

                  </p>

                </div>



              </div>





              <div className="quick-actions">



                <button

                  onClick={() =>

                    setCurrentPage('daily-sales')

                  }

                >



                  <span>🧾</span>



                  <strong>

                    Daily Sales

                  </strong>



                  <small>

                    Enter today's sales

                  </small>



                </button>

          <button
            onClick={() => setCurrentPage('manual-stock')}
          >
            <span>📝</span>
            <strong>
              Manual Stock Entry
            </strong>
            <small>
              Enter opening stock
            </small>
          </button>





                <button>



                  <span>📥</span>



                  <strong>

                    Stock Inward

                  </strong>



                  <small>

                    Add incoming stock

                  </small>



                </button>





                <button>



                  <span>💳</span>



                  <strong>

                    QR Transactions

                  </strong>



                  <small>

                    Manage QR payments

                  </small>



                </button>





                <button>



                  <span>🧮</span>



                  <strong>

                    VAT Entry

                  </strong>



                  <small>

                    GST-wise sales

                  </small>



                </button>



              </div>



            </section>





            {/* RECENT ACTIVITY */}



            <section className="dashboard-section">



              <div className="section-heading">



                <div>

                  <h2>Recent Activity</h2>



                  <p>

                    Your recent sales and stock activities

                    will appear here.

                  </p>

                </div>



              </div>





              <div className="empty-activity">



                <div>📊</div>



                <h3>

                  No activity yet

                </h3>



                <p>

                  Start by entering today's sales.

                </p>



              </div>



            </section>



          </div>



        </main>



      </div>

    )

  }





  /* =====================================================

     LOGIN PAGE

  ===================================================== */



  if (!loggedIn) {



    return (



      <div className="login-page">



        <div className="login-left">



          <div className="brand">



            <div className="brand-logo">

              R

            </div>



            <div>



              <h2>RAPCMS</h2>



              <p>

                Ration Shop Management System

              </p>



            </div>



          </div>





          <div className="welcome-content">



            <span className="small-title">

              PUBLIC DISTRIBUTION SYSTEM

            </span>





            <h1>



              Food Security



              <br />



              <span>

                For a Better Tomorrow

              </span>



            </h1>





            <p className="description">



              A smart management system for ration shops,

              stock, sales and transparent distribution.



            </p>





            <div className="features">



              <div className="feature">



                <div className="feature-icon">

                  🏪

                </div>



                <div>



                  <h3>

                    14 Ration Shops

                  </h3>



                  <p>

                    Shop Management

                  </p>



                </div>



              </div>





              <div className="feature">



                <div className="feature-icon">

                  📦

                </div>



                <div>



                  <h3>

                    Stock Management

                  </h3>



                  <p>

                    Rice, Wheat & More

                  </p>



                </div>



              </div>





              <div className="feature">



                <div className="feature-icon">

                  📊

                </div>



                <div>



                  <h3>

                    Sales & Reports

                  </h3>



                  <p>

                    Daily / Monthly

                  </p>



                </div>



              </div>



            </div>



          </div>





          <div className="left-footer">



            <span>✓ Secure</span>

            <span>✓ Transparent</span>

            <span>✓ Easy Management</span>



          </div>



        </div>





        {/* LOGIN RIGHT */}



        <div className="login-right">



          <div className="login-card">



            <div className="lock-icon">

              🔐

            </div>





            <h1>

              Login to Continue

            </h1>





            <p className="login-subtitle">



              Access Ration Shop Management System



            </p>





            <form onSubmit={handleLogin}>

              <div className="input-group">

                <label>
                  CMS Code
                </label>

                <div className="input-wrapper" style={{ background: '#ffffff', border: '1px solid #d5dfdb' }}>

                  <span>🏢</span>

                  <input
                    name="cmsCode"
                    type="text"
                    placeholder="Enter CMS code"
                    autoComplete="organization"
                    defaultValue="RAPCMS"
                    style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b' }}
                    required
                  />

                </div>

              </div>



              <div className="input-group">

                <label>
                  Username
                </label>

                <div className="input-wrapper" style={{ background: '#ffffff', border: '1px solid #d5dfdb' }}>

                  <span>👤</span>

                  <input
                    name="username"
                    type="text"
                    placeholder="Enter username"
                    autoComplete="username"
                    style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b' }}
                    required
                  />

                </div>

              </div>



              <div className="input-group">

                <label>
                  Password
                </label>

                <div className="input-wrapper" style={{ background: '#ffffff', border: '1px solid #d5dfdb' }}>

                  <span>🔒</span>

                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ background: '#ffffff', color: '#16352b', WebkitTextFillColor: '#16352b' }}
                    required
                  />

                </div>

              </div>



              <div className="login-options">



                <label>



                  <input type="checkbox" />



                  Remember me



                </label>





                <button

                  type="button"

                  className="forgot"

                >

                  Forgot Password?

                </button>



              </div>





              <button

                type="submit"

                className="login-button"

              >

                🔐 &nbsp; Login

              </button>



            </form>





            <div className="support-box">



              <div className="support-icon">

                👥

              </div>



              <div>



                <strong>

                  Contact Administrator

                </strong>



                <p>

                  For new user access or support

                </p>



              </div>



            </div>





            <div className="copyright">



              <strong>

                RAPCMS

              </strong>



              <p>

                Ration Shop Management System

              </p>



              <p>

                © 2026 All Rights Reserved.

              </p>



            </div>



          </div>



        </div>



      </div>

    )

  }





  /* =====================================================

     PAGE ROUTER

  ===================================================== */



  if (currentPage === 'liability') {
    return LiabilityPage()
  }

  if (currentPage === 'daily-sales') {
    return DailySalesPage()
  }

  if (currentPage === 'daily-sales-details') {
    return DailySalesDetailsPage()
  }

  if (currentPage === 'manual-stock') {
    return ManualStockPage()
  }

  if (currentPage === 'item-master') {
    return ItemMasterPage()
  }

  return Dashboard()

}



export default App