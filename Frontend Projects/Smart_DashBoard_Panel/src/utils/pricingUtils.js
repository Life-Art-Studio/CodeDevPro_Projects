export const calculateChainedPrices = (mrp, retailerDivisor, dbDivisor, ssDivisor, buyQty, freeQty) => {
  const safeMrp = Number(mrp) || 0;
  const safeRetailerDiv = Number(retailerDivisor) || 1;
  const safeDbDiv = Number(dbDivisor) || 1;
  const safeSsDiv = Number(ssDivisor) || 1;
  const safeBuyQty = Number(buyQty) || 1;
  const safeFreeQty = Number(freeQty) || 0;
  const totalQty = safeBuyQty + safeFreeQty;

  const retailerCost = (safeMrp / safeRetailerDiv) * (safeBuyQty / totalQty);
  const dbCost = retailerCost / safeDbDiv;
  const ssCost = dbCost / safeSsDiv;

  const retailerMarginPercent = safeMrp > 0 ? ((safeMrp - retailerCost) / safeMrp) * 100 : 0;
  const dbMarginPercent = retailerCost > 0 ? ((retailerCost - dbCost) / retailerCost) * 100 : 0;
  const ssMarginPercent = dbCost > 0 ? ((dbCost - ssCost) / dbCost) * 100 : 0;

  const formulaStrip = `₹${safeMrp.toFixed(2)} MRP → ÷ ${safeRetailerDiv.toFixed(2)} × ${safeBuyQty}/${totalQty} = ₹${retailerCost.toFixed(2)} → ÷ ${safeDbDiv.toFixed(2)} = ₹${dbCost.toFixed(2)} DB → ÷ ${safeSsDiv.toFixed(2)} = ₹${ssCost.toFixed(2)} SS`;

  return {
    mrp: safeMrp,
    retailerCost,
    dbCost,
    ssCost,
    retailerMarginPercent,
    dbMarginPercent,
    ssMarginPercent,
    formulaStrip
  };
};
