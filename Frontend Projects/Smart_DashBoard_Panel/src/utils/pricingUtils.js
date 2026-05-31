export const calculateChainedPrices = (
  mrp, 
  retailerDivisor = 1.25, 
  dbDivisor = 1.12, 
  ssDivisor = 1.05, 
  buyQty = 1, 
  freeQty = 0, 
  pricingMode = "divisor", 
  retailerMargin = 20, 
  dbMargin = 10, 
  ssMargin = 8
) => {
  const safeMrp = Number(mrp) || 0;
  const safeBuyQty = Number(buyQty) || 1;
  const safeFreeQty = Number(freeQty) || 0;
  const totalQty = safeBuyQty + safeFreeQty;

  let retailerCost, dbCost, ssCost;
  let retailerMarginPercent, dbMarginPercent, ssMarginPercent;
  let safeRetailerDiv, safeDbDiv, safeSsDiv;

  if (pricingMode === "marketing") {
    // Marketing mode: Percentage margin deductions
    retailerMarginPercent = Number(retailerMargin) || 0;
    dbMarginPercent = Number(dbMargin) || 0;
    ssMarginPercent = Number(ssMargin) || 0;

    retailerCost = safeMrp * (1 - retailerMarginPercent / 100) * (safeBuyQty / totalQty);
    dbCost = retailerCost * (1 - dbMarginPercent / 100);
    ssCost = dbCost * (1 - ssMarginPercent / 100);

    // Compute equivalent divisors for backward compatibility
    const safeRetailerCostFactor = safeBuyQty / totalQty;
    safeRetailerDiv = retailerCost > 0 ? (safeMrp * safeRetailerCostFactor) / retailerCost : 1.25;
    safeDbDiv = dbCost > 0 ? retailerCost / dbCost : 1.12;
    safeSsDiv = ssCost > 0 ? dbCost / ssCost : 1.05;
  } else {
    // Divisor mode (Default)
    safeRetailerDiv = Number(retailerDivisor) || 1.25;
    safeDbDiv = Number(dbDivisor) || 1.12;
    safeSsDiv = Number(ssDivisor) || 1.05;

    retailerCost = (safeMrp / safeRetailerDiv) * (safeBuyQty / totalQty);
    dbCost = retailerCost / safeDbDiv;
    ssCost = dbCost / safeSsDiv;

    retailerMarginPercent = safeMrp > 0 ? ((safeMrp - retailerCost) / safeMrp) * 100 : 0;
    dbMarginPercent = retailerCost > 0 ? ((retailerCost - dbCost) / retailerCost) * 100 : 0;
    ssMarginPercent = dbCost > 0 ? ((dbCost - ssCost) / dbCost) * 100 : 0;
  }

  const formulaStrip = pricingMode === "marketing"
    ? `₹${safeMrp.toFixed(2)} MRP → Less ${retailerMarginPercent.toFixed(1)}% Retailer Margin × ${safeBuyQty}/${totalQty} = ₹${retailerCost.toFixed(2)} → Less ${dbMarginPercent.toFixed(1)}% DB Margin = ₹${dbCost.toFixed(2)} DB → Less ${ssMarginPercent.toFixed(1)}% SS Margin = ₹${ssCost.toFixed(2)} SS`
    : `₹${safeMrp.toFixed(2)} MRP → ÷ ${safeRetailerDiv.toFixed(2)} × ${safeBuyQty}/${totalQty} = ₹${retailerCost.toFixed(2)} → ÷ ${safeDbDiv.toFixed(2)} = ₹${dbCost.toFixed(2)} DB → ÷ ${safeSsDiv.toFixed(2)} = ₹${ssCost.toFixed(2)} SS`;

  return {
    mrp: safeMrp,
    retailerCost,
    dbCost,
    ssCost,
    retailerMarginPercent,
    dbMarginPercent,
    ssMarginPercent,
    retailerDivisor: safeRetailerDiv,
    dbDivisor: safeDbDiv,
    ssDivisor: safeSsDiv,
    formulaStrip
  };
};
