
import React, { useState, useEffect } from 'react';
import {
  Product,
  Employee,
  PaymentMethod,
} from './types/index';
import { FaTrashAlt } from 'react-icons/fa';
import ErrorPopup from './components/ErrorPopup';

const App: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [productBarcode, setProductBarcode] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [salesPerson, setSalesPerson] = useState('');
  const [discountType, setDiscountType] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);

  // const [customerName, setCustomerName] = useState('N/A');
  // const [customerDiscount, setCustomerDiscount] = useState('Not found');
  const customerName = 'N/A';
  const customerDiscount = 'Not found';

  const [products, setProducts] = useState<Product[]>([]);
  const [mrp, setMrp] = useState(0);
  const [numberOfItems, setNumberOfItems] = useState(0);
  const [totalItemsQuantity, setTotalItemsQuantity] = useState(0);
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);
  const [payableAmountAddition, setPayableAmountAddition] = useState(0);
  const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
  const [change, setChange] = useState(0);

  const [salesPersonOptions, setSalesPersonOptions] = useState<Employee[]>([]);
  // const [loadingSalesPerson, setLoadingSalesPerson] = useState(true);

  const [paymentMethodOptions, setPaymentMethodOptions] = useState<PaymentMethod[]>([]);
  // const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  // const [loadingProductSearch, setLoadingProductSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const [paymentSections, setPaymentSections] = useState([
    { id: 1, paymentMethod: '', paymentAmount: '' }
  ]);

  const [heldInvoices, setHeldInvoices] = useState<any[]>([]);
  const [showHoldListModal, setShowHoldListModal] = useState(false);

  const bearerToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6IkthbXJ1bCIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJhZGRyZXNzIjpudWxsLCJwaG9uZSI6IjAxOTQ1NTE4OTgiLCJyb2xlIjoiTUFOQUdFUiIsImF2YXRhciI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2Ryb3lqaXF3Zi9pbWFnZS91cGxvYWQvdjE2OTY4MDE4MjcvZG93bmxvYWRfZDZzOGJpLmpwZyIsImJyYW5jaCI6MywiYnJhbmNoSW5mbyI6eyJpZCI6MywiYnJhbmNoTmFtZSI6IkhlYWQgT2ZmaWNlIiwiYnJhbmNoTG9jYXRpb24iOiJCYXNodW5kaGFyYSIsImR1ZSI6MCwiYWRkcmVzcyI6IkJhc2h1bmRoYXJhIGNpdHkiLCJwaG9uZSI6IjAxOTQ1NTUxODkyOCIsImhvdGxpbmUiOiIwMTk0NTM2MzU1MiIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJvcGVuSG91cnMiOm51bGwsImNsb3NpbmdIb3VycyI6bnVsbCwiaXNBZGp1c3RtZW50Ijp0cnVlLCJ0eXBlIjoiSGVhZE9mZmljZSJ9LCJpYXQiOjE3NDYwNDE0NzUsImV4cCI6MTc0NzMzNzQ3NX0.PUQfy4Vc2OorR6Yc9JO6lePwiXi20q0MppcIDxGtbsk";


  useEffect(() => {
    // Load held invoices from local storage
    const savedHeldInvoices = localStorage.getItem('heldInvoices');
    if (savedHeldInvoices) {
      setHeldInvoices(JSON.parse(savedHeldInvoices));
    }

    const fetchSalesPerson = async () => {
      try {
        const response = await fetch(
          'https://front-end-task-lake.vercel.app/api/v1/employee/get-employee-all',
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        if (!response.ok) {
          // throw new Error(`Failed to fetch sales people: ${response.status}`);
          handleError(`Failed to fetch sales people: ${response.status}`);
        }
        const data = await response.json();
        // console.log(data);
        setSalesPersonOptions(data.data);
        // setLoadingSalesPerson(false);
      } catch (error: any) {
        handleError(error.message);
        // setLoadingSalesPerson(false);
      }
    };

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(
          'https://front-end-task-lake.vercel.app/api/v1/account/get-accounts?type=All',
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        if (!response.ok) {
          // throw new Error(`Failed to fetch payment methods: ${response.status}`);
          handleError(`Failed to fetch payment methods: ${response.status}`);
        }
        const data = await response.json();
        // console.log(data);
        setPaymentMethodOptions(data.data);
        // setLoadingPaymentMethods(false);
      } catch (error: any) {
        handleError(error.message);
        // setLoadingPaymentMethods(false);
      }
    };

    fetchSalesPerson();
    fetchPaymentMethods();

    setInvoiceNumber(generateInvoiceNumber(sequenceNumber));
  }, []);

  useEffect(() => {
    calculateTotals(products);
  }, [products, discountAmount, vatAmount]);

  const generateInvoiceNumber = (seq: number): string => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const sequence = String(seq).padStart(4, '0');
    return `${day}${month}${year}${sequence}`;
  };

  const fetchProductBySku = async (sku: string) => {
    // setLoadingProductSearch(true);
    try {
      // Check if SKU already exists in any product
      const skuExists = products.some(p =>
        p.sku.split(',').some(s => s.trim() === sku.trim())
      );

      if (skuExists) {
        handleError(`SKU ${sku} already exists in the current sale`);
        return;
      }

      const response = await fetch(
        `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${sku}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (!response.ok) {
        handleError(`Failed to fetch product with SKU ${sku}: ${response.status}`);
        return;
      }
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const newProductData = data.data[0];
        const existingProductIndex = products.findIndex(
          p => p.name === newProductData.productName &&
            p.size === (newProductData.size || 'N/A')
        );

        if (existingProductIndex >= 0) {
          // Product with same name and size exists - update it
          const updatedProducts = [...products];
          const existingProduct = updatedProducts[existingProductIndex];

          // Update SKUs (append new SKU if different)
          if (!existingProduct.sku.includes(newProductData.sku)) {
            existingProduct.sku = `${existingProduct.sku}, ${newProductData.sku}`;
          }

          // Increase quantity and recalculate subtotal
          existingProduct.quantity += 1;
          existingProduct.subtotal = (existingProduct.price - existingProduct.discount) * existingProduct.quantity;

          setProducts(updatedProducts);
          calculateTotals(updatedProducts);
        } else {
          // New product - add to list
          const newProduct: Product = {
            id: newProductData.id,
            name: newProductData.productName,
            size: newProductData.size || 'N/A',
            color: newProductData.color || 'N/A',
            availableStock: newProductData.stock.toString() + ' Units',
            sku: newProductData.sku,
            quantity: 1,
            price: newProductData.sellPrice,
            discount: newProductData.discount,
            discountPrice: newProductData.discountPrice,
            subtotal: newProductData.sellPrice - (newProductData.discount || 0),
          };
          setProducts([...products, newProduct]);
          calculateTotals([...products, newProduct]);
        }
      } else {
        handleError(`Product with SKU ${sku} not found.`);
      }
    } catch (error: any) {
      handleError(error.message);
    } finally {
      // setLoadingProductSearch(false);
      setProductBarcode('');
    }
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductBarcode(e.target.value);
  };

  const handleBarcodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && productBarcode) {
      fetchProductBySku(productBarcode);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this product?');
    if (confirmDelete) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
      calculateTotals(updatedProducts);
    }
  };

  const handleRemoveSku = (productIndex: number, skuToRemove: string) => {
    const confirmDelete = window.confirm(`Remove SKU ${skuToRemove}?`);
    if (!confirmDelete) return;

    const updatedProducts = [...products];
    const product = updatedProducts[productIndex];

    // Split SKUs and filter out the one to remove
    const remainingSkus = product.sku.split(',')
      .map(s => s.trim())
      .filter(s => s !== skuToRemove.trim());

    if (remainingSkus.length === 0) {
      // If no SKUs left, remove the entire product
      handleRemoveProduct(productIndex);
      return;
    }

    // Update the product with remaining SKUs
    product.sku = remainingSkus.join(', ');

    // If this was the last item with this SKU, reduce quantity
    const skuCount = product.sku.split(',').length;
    if (skuCount < product.quantity) {
      product.quantity = skuCount;
      product.subtotal = (product.price - product.discount) * product.quantity;
    }

    setProducts(updatedProducts);
    calculateTotals(updatedProducts);
  };

  const calculateTotals = (currentProducts: Product[]) => {
    const newMrp = currentProducts.reduce(
      (sum, product) => sum + (product.price * product.quantity),
      0
    );

    const totalDiscount = currentProducts.reduce(
      (sum, product) => sum + (product.discount * product.quantity),
      0
    ) + discountAmount;

    const newItemCount = currentProducts.length;
    const newTotalQuantity = currentProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // Calculate VAT amount based on percentage
    const vatValue = (newMrp - totalDiscount) * (vatAmount / 100);
    const newTotalPayableAmount = (newMrp - totalDiscount) + vatValue;

    setMrp(newMrp);
    setNumberOfItems(newItemCount);
    setTotalItemsQuantity(newTotalQuantity);
    setTotalPayableAmount(newTotalPayableAmount);
    setPayableAmountAddition(newTotalPayableAmount);

    // Also update change based on new total
    setChange(totalReceivedAmount - newTotalPayableAmount);
  };

  const handlePaymentAmountChange = (id: number, value: string) => {
    const updatedSections = paymentSections.map(section =>
      section.id === id ? { ...section, paymentAmount: value } : section
    );

    setPaymentSections(updatedSections);

    // Calculate new total received amount
    const newTotalReceived = updatedSections.reduce(
      (sum, section) => sum + (parseFloat(section.paymentAmount) || 0),
      0
    );

    setTotalReceivedAmount(newTotalReceived);
    setChange(newTotalReceived - totalPayableAmount);
  };

  const handleAddSection = () => {
    const newId = paymentSections.length > 0 ? Math.max(...paymentSections.map(s => s.id)) + 1 : 1;
    setPaymentSections([...paymentSections, { id: newId, paymentMethod: '', paymentAmount: '' }]);
  };

  const handleDeleteSection = (id: number) => {
    if (paymentSections.length > 1) {
      const updatedSections = paymentSections.filter(section => section.id !== id);
      setPaymentSections(updatedSections);

      // Recalculate total received amount
      const newTotalReceived = updatedSections.reduce(
        (sum, section) => sum + (parseFloat(section.paymentAmount) || 0),
        0
      );

      setTotalReceivedAmount(newTotalReceived);
      setChange(newTotalReceived - totalPayableAmount);
    }
  };

  const handlePaymentMethodChange = (id: number, value: string) => {
    setPaymentSections(paymentSections.map(section =>
      section.id === id ? { ...section, paymentMethod: value } : section
    ));
  };

  const handleSubmitSell = async () => {
    // Validate required fields
    if (!salesPerson) {
      handleError('Please select a sales person');
      return;
    }

    if (products.length === 0) {
      handleError('Please add at least one product');
      return;
    }

    // Validate payment sections
    const hasEmptyPayments = paymentSections.some(
      section => !section.paymentMethod || !section.paymentAmount
    );

    if (hasEmptyPayments) {
      handleError('Please fill all payment method and amount fields');
      return;
    }

    const totalPaid = paymentSections.reduce(
      (sum, section) => sum + (parseFloat(section.paymentAmount) || 0),
      0
    );

    if (totalPaid < totalPayableAmount) {
      handleError('Total payment amount is less than payable amount');
      return;
    }

    try {
      // Prepare payload exactly as shown in the PDF example
      const payload = {
        invoiceNo: invoiceNumber,
        salesmenId: parseInt(salesPerson),
        discountType: discountType || "Fixed",
        discount: discountAmount || 0,
        phone: customerPhone || null,
        totalPrice: mrp,
        totalPaymentAmount: totalReceivedAmount,
        changeAmount: change,
        vat: vatAmount || 0,
        products: products.map(product => ({
          variationProductId: product.id,
          quantity: product.quantity,
          unitPrice: product.price,
          discount: product.discount,
          subTotal: product.subtotal
        })),
        payments: paymentSections.map(section => ({
          paymentAmount: parseFloat(section.paymentAmount),
          accountId: parseInt(section.paymentMethod)
        })),
        sku: products.flatMap(product =>
          product.sku.split(',').map(s => s.trim())
        )
      };

      const response = await fetch(
        'https://front-end-task-lake.vercel.app/api/v1/sell/create-sell',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        handleError(errorData.message || `Failed to create sell: ${response.status}`);
        return;
      }

      const data = await response.json();

      // Show success message
      alert('Sale created successfully!');
      console.log('Sell created successfully:', data);

      // Increment sequence number for next sale
      setSequenceNumber(prev => prev + 1);
      setInvoiceNumber(generateInvoiceNumber(sequenceNumber + 1));
      handleClear(); // Reset the form

    } catch (error: any) {
      console.error('Error creating sell:', error);
      handleError(error.message || 'An error occurred while creating the sale');
    }
  };

  // const validatePayments = () => {
  //   return paymentSections.every(
  //     section => section.paymentMethod && section.paymentAmount
  //   );
  // };

  const handleClear = () => {
    // Don't reset invoice number here - it should be preserved when retrieving
    setProductBarcode('');
    setCustomerPhone('');
    setMembershipId('');
    setSalesPerson('');
    setDiscountType('');
    setDiscountAmount(0);
    setVatAmount(0);
    setProducts([]);
    setMrp(0);
    setNumberOfItems(0);
    setTotalItemsQuantity(0);
    setTotalPayableAmount(0);
    setPaymentSections([{ id: 1, paymentMethod: '', paymentAmount: '' }]);
    setTotalReceivedAmount(0);
    setChange(0);
  };

  const handleHold = () => {
    // Create a snapshot of current sale
    const currentSale = {
      invoiceNumber, // Make sure we're saving the current invoice number
      products,
      customerPhone,
      membershipId,
      salesPerson,
      discountType,
      discountAmount,
      vatAmount,
      paymentSections,
      totalPayableAmount,
      timestamp: new Date().toISOString()
    };

    // Save to local storage and state
    const updatedHeldInvoices = [...heldInvoices, currentSale];
    setHeldInvoices(updatedHeldInvoices);
    localStorage.setItem('heldInvoices', JSON.stringify(updatedHeldInvoices));

    // Clear current sale and generate new invoice
    handleClear();
    setSequenceNumber(prev => prev + 1); // Increment sequence for next sale
    setInvoiceNumber(generateInvoiceNumber(sequenceNumber + 1)); // Generate new invoice number
  };

  const retrieveHeldInvoice = (index: number) => {
    const invoiceToRetrieve = heldInvoices[index];

    // Set all fields from the held invoice
    setInvoiceNumber(invoiceToRetrieve.invoiceNumber); // Keep the original invoice number
    setProducts(invoiceToRetrieve.products);
    setCustomerPhone(invoiceToRetrieve.customerPhone);
    setMembershipId(invoiceToRetrieve.membershipId);
    setSalesPerson(invoiceToRetrieve.salesPerson);
    setDiscountType(invoiceToRetrieve.discountType);
    setDiscountAmount(invoiceToRetrieve.discountAmount);
    setVatAmount(invoiceToRetrieve.vatAmount);
    setPaymentSections(invoiceToRetrieve.paymentSections);

    // Recalculate totals
    calculateTotals(invoiceToRetrieve.products);

    // Remove from held invoices
    const updatedHeldInvoices = heldInvoices.filter((_, i) => i !== index);
    setHeldInvoices(updatedHeldInvoices);
    localStorage.setItem('heldInvoices', JSON.stringify(updatedHeldInvoices));
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowErrorPopup(true);
  };

  // if (loadingSalesPerson || loadingPaymentMethods || loadingProductSearch) {
  //   return <div className='text-center text-lg'>Loading data...</div>;
  // }

  return (
    <div className="bg-gray-100 p-8 grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-6">
      <div className="col-span-3 flex flex-col gap-4">
        {/* Product & Customer Navigation */}
        <div className="bg-white rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-4 bg-gray-300 px-4">
            Product & Customer Navigation
          </h2>

          <div className="grid grid-cols-4 gap-4 p-4">
            <div>
              <label htmlFor="invoiceNo" className="text-sm">
                Invoice Number
              </label>

              <input
                type="text"
                id="invoiceNo"
                className="mt-1 w-full rounded-md border border-gray-500"
                value={invoiceNumber}
                // onChange={(e) => setInvoiceNumber(e.target.value)}
                readOnly
              />
            </div>

            <div>
              <label htmlFor="productBarcode" className="text-sm">
                Product Barcode <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                id="productBarcode"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={productBarcode}
                onChange={handleBarcodeChange}
                onKeyDown={handleBarcodeSubmit}
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm">
                Phone
              </label>

              <input
                type="text"
                id="phone"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="membershipId" className="text-sm">
                Membership Id
              </label>

              <input
                type="text"
                id="membershipId"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="salesPerson" className="text-sm">
                Select Sales Person <span className="text-red-500">*</span>
              </label>

              <select
                id="salesPerson"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={salesPerson}
                onChange={(e) => setSalesPerson(e.target.value)}
                required
                aria-required="true"
              >
                <option value="">Select Sales Person</option>

                {salesPersonOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="discountType" className="text-sm">
                Select Discount Type
              </label>

              <select
                id="discountType"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option>Fixed</option>
                {/* <option>Percentage</option> */}
              </select>
            </div>

            <div>
              <label htmlFor="discountAmount" className="text-sm">
                Enter The Discount Amount
              </label>

              <input
                type="number"
                id="discountAmount"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label htmlFor="vatAmount" className="text-sm">
                Enter The VAT Amount
              </label>

              <input
                type="number"
                id="vatAmount"
                className="mt-1 w-full rounded-md border border-gray-500 "
                value={vatAmount}
                onChange={(e) => setVatAmount(Number(e.target.value))}
                min={0}
                max={100}
                step={0.01}
              />
            </div>
          </div>
        </div>

        {/* Products Information */}
        <div className="bg-white rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-4 bg-gray-300 px-4">Products Information</h2>

          {
            products.map((product, index) => (
              <div key={index} className="m-2 p-4 border rounded-md">
                <div className="flex justify-between items-center gap-2">
                  <div>
                    <div className='flex items-center'>
                      <p className=" text-sm font-medium text-gray-700">
                        Name
                      </p>
                      <p className="ml-2 text-sm text-gray-500">{product.name}</p>
                    </div>

                    <div className='flex items-center'>
                      <p className=" text-sm font-medium text-gray-700">
                        Size
                      </p>
                      <p className="ml-2 text-sm text-gray-500">{product.size}</p>
                    </div>

                    <div className='flex items-center'>
                      <p className=" text-sm font-medium text-gray-700">
                        Color
                      </p>
                      <p className="ml-2 text-sm text-gray-500">{product.color}</p>
                    </div>

                    <div className='flex items-center'>
                      <p className=" text-sm font-medium text-gray-700">
                        Available Stock
                      </p>
                      <p className="ml-2 text-sm text-gray-500">{product.availableStock}</p>
                    </div>

                    <div className='flex items-center'>
                      <p className="text-sm font-medium text-gray-700">
                        SKU
                      </p>
                      <p className="ml-2 text-sm text-gray-500">
                        {product.sku.split(',').map((sku, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => handleRemoveSku(index, sku)}
                            className="p-0.5 hover:text-white hover:bg-red-700 rounded-md"
                          >
                            {sku.trim()}
                          </button>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 h-8'>
                    {/* Show unit price with discount (if any) */}
                    <p className="text-sm text-gray-900 border border-gray-900 rounded-md px-2 py-1 w-40">
                      Tk. {product.discountPrice.toFixed(2)}
                      {product.discount > 0 && (
                        <span className='ml-1 text-xs line-through'>{product.price.toFixed(2)}</span>
                      )}
                    </p>

                    {/* Show subtotal for all quantities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Subtotal
                      </label>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {(product.discountPrice * product.quantity).toFixed(2)} ৳
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="p-2 bg-red-900 text-white hover:bg-red-700 rounded-md"
                  >
                    <FaTrashAlt className="h-3 w-3" />
                  </button>

                  {/* <div>
                      <label
                        htmlFor={`quantity-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Quantity
                      </label>
                      <div className="flex items-center mt-1">
                        <button
                          type="button"
                          className="bg-gray-200 text-gray-700 rounded-l-md px-2 py-1 focus:outline-none"
                          onClick={() =>
                            handleProductQuantityChange(
                              index,
                              Math.max(1, product.quantity - 1)
                            )
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id={`quantity-${index}`}
                          className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={product.quantity}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10);
                            if (!isNaN(newValue) && newValue > 0) {
                              handleProductQuantityChange(index, newValue);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="bg-gray-200 text-gray-700 rounded-r-md px-2 py-1 focus:outline-none"
                          onClick={() =>
                            handleProductQuantityChange(
                              index,
                              product.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div> */}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        {/* Customer's Information */}
        <div className="bg-white rounded-md ">
          <h2 className="text-lg font-semibold mb-4 bg-gray-300 px-4">
            Customer's Information
          </h2>

          <div className="grid grid-cols-2 gap-2 p-4">
            <div className='flex gap-2 items-center border border-gray-300 rounded-md'>
              <p className="bg-gray-200 p-1">Name</p>
              <p className="text-sm">{customerName}</p>
            </div>

            <div className='flex gap-2 items-center border border-gray-300 rounded-md'>
              <p className="bg-gray-200 p-1">Phone</p>
              <p className="text-sm">{customerPhone}</p>
            </div>

            <div className='flex gap-2 items-center border border-gray-300 rounded-md'>
              <p className="bg-gray-200 p-1">Membership</p>
              <p className="text-sm">{membershipId || 'Not Found'}</p>
            </div>

            <div className='flex gap-2 items-center border border-gray-300 rounded-md'>
              <p className="bg-gray-200 p-1">Discount</p>
              <p className="text-sm">{customerDiscount}</p>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="">
          <div className="gap-2 mb-4">
            <div className="border-b border-gray-900  flex justify-between">
              <p className=" text-sm font-medium text-gray-700">
                Maximum Retail Price (MRP)
              </p>
              <p className=" text-sm ">
                {mrp.toFixed(2)} ৳
              </p>
            </div>

            <div className="border-b border-gray-900  flex justify-between">
              <p className=" text-sm font-medium text-gray-700">
                (+) Vat/Tax
              </p>
              <p className=" text-sm ">
                {(mrp * (vatAmount / 100)).toFixed(2)} ৳
              </p>
            </div>

            <div className="border-b border-gray-900 flex justify-between">
              <p className=" text-sm font-medium text-gray-700">
                (-) Discount
              </p>
              <p className=" text-sm ">
                {discountAmount.toFixed(2)} ৳
              </p>
            </div>

            <div className="border-b border-gray-900 flex justify-between">
              <p className=" text-sm font-medium text-gray-700">
                Number Of Items
              </p>
              <p className=" text-sm ">{numberOfItems}</p>
            </div>

            <div className="border-b border-gray-900 flex justify-between">
              <p className=" text-sm font-medium text-gray-700">
                Total Items Quantity
              </p>
              <p className=" text-sm">
                {totalItemsQuantity}
              </p>
            </div>

            <div className=" flex justify-between">
              <p className="text-sm font-semibold text-gray-900 ">
                Total Payable Amount
              </p>
              <p className=" text-sm">
                {totalPayableAmount.toFixed(2)} ৳
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="">
            {paymentSections.map((section, index) => (
              <div key={section.id} className="flex justify-between gap-4 py-4">
                {
                  index === 0 ?
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="p-2 text-black rounded-md hover:bg-blue-100 text-3xl border border-black"
                    >
                      +
                    </button>
                    :
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 bg-red-900 text-white hover:bg-red-700 rounded-md"
                    >
                      <FaTrashAlt className="h-5 w-5" />
                    </button>
                }

                <div className="flex-1">
                  <label htmlFor={`paymentMethod-${section.id}`} className="text-sm font-medium text-gray-700">
                    Choose the Method
                  </label>
                  <select
                    id={`paymentMethod-${section.id}`}
                    className="mt-1 w-full rounded-md border border-gray-300"
                    value={section.paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(section.id, e.target.value)}
                    required={index === 0}
                  >
                    <option value="">Select Payment Method</option>
                    {paymentMethodOptions.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.accountName} ({method.accountType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor={`paymentAmount-${section.id}`} className="text-sm font-medium text-gray-700">
                    Enter Payment Amount {index === 0 && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    id={`paymentAmount-${section.id}`}
                    className="mt-1 w-full rounded-md border border-gray-300"
                    value={section.paymentAmount}
                    onChange={(e) => handlePaymentAmountChange(section.id, e.target.value)}
                    required={index === 0}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Addition Information */}
          <div className='mt-4'>
            <h2 className="text-lg font-semibold mb-1">Addition Information</h2>

            <div className=" gap-2">
              <div className="border-b border-gray-900  flex justify-between">
                <p className=" text-sm font-medium text-gray-700">
                  Payable Amount
                </p>
                <p className=" text-sm ">
                  {payableAmountAddition.toFixed(2)} ৳
                </p>
              </div>

              <div className="border-b border-gray-900  flex justify-between">
                <p className=" text-sm font-medium text-gray-700">
                  Total Received Amount
                </p>
                <p className=" text-sm ">
                  {totalReceivedAmount.toFixed(2)} ৳
                </p>
              </div>

              <div className="border-b border-gray-900  flex justify-between">
                <p className=" text-sm font-medium text-gray-700">
                  Change
                </p>
                <p className=" text-sm ">
                  {change.toFixed(2)} ৳
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex items-center justify-around">
            <button
              onClick={handleClear}
              className="bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel & Clear
            </button>

            <button
              onClick={handleSubmitSell}
              className="bg-green-900 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add to POS
            </button>
          </div>

          {/* Buttons list */}
          <div className="py-4 grid grid-cols-3 gap-3 items-center">
            <button
              onClick={handleHold}
              className="bg-black hover:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Hold
            </button>

            <button
              className="bg-red-900 hover:bg-red-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setShowHoldListModal(true)}
            >
              Hold List
            </button>

            <button className="bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              SMS
            </button>

            <button className="bg-gray-400 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Quotation
            </button>

            <button className="bg-yellow-700 hover:bg-yellow-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Reattempt
            </button>

            <button className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Reprint
            </button>
          </div>
        </div>
      </div>

      {showErrorPopup && error && (
        <ErrorPopup
          message={error}
          onClose={() => setShowErrorPopup(false)}
        />
      )}

      {showHoldListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Held Invoices</h3>
              <button
                onClick={() => setShowHoldListModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {heldInvoices.length === 0 ? (
              <p className="text-center py-4">No held invoices found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice No
                      </th>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date/Time
                      </th> */}
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th> */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {heldInvoices.map((invoice, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.timestamp).toLocaleString()}
                        </td> */}
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.products.length} items
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {invoice.totalPayableAmount.toFixed(2)} ৳
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-6">
                            <button
                              onClick={() => {
                                retrieveHeldInvoice(index);
                                setShowHoldListModal(false);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Retrieve
                            </button>

                            <button
                              onClick={() => {
                                const confirmDelete = window.confirm('Are you sure you want to delete this held invoice?');
                                if (confirmDelete) {
                                  const updatedHeldInvoices = heldInvoices.filter((_, i) => i !== index);
                                  setHeldInvoices(updatedHeldInvoices);
                                  localStorage.setItem('heldInvoices', JSON.stringify(updatedHeldInvoices));
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div >
  );
};
export default App;