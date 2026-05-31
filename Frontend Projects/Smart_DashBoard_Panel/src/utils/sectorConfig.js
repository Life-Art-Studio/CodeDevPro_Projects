// Business Sector Configurations & Fallback Presets

export const SECTORS = [
  {
    id: "FMCG",
    label: "FMCG",
    icon: "Apple",
    color: "hsl(142, 70%, 45%)", // Vibrant green
    subCategories: ["Beverages", "Snacks", "Personal Care", "Household"],
    templates: [
      { name: "Organic Green Tea", category: "Beverages", price: 250, unit: "Pack", tags: ["Organic", "Healthy"] },
      { name: "Premium Coffee Beans", category: "Beverages", price: 450, unit: "Pack", tags: ["Beverage", "Premium"] },
      { name: "Carbonated Cola 500ml", category: "Beverages", price: 40, unit: "Bottle", tags: ["Cold Drink"] },
      { name: "Natural Mineral Water", category: "Beverages", price: 20, unit: "Bottle", tags: ["Water", "Pure"] },
      { name: "Potato Chips Salted", category: "Snacks", price: 30, unit: "Packet", tags: ["Crispy", "Snack"] },
      { name: "Roasted Almonds Mix", category: "Snacks", price: 350, unit: "Pack", tags: ["Healthy", "Nuts"] },
      { name: "Chocolate Chip Cookies", category: "Snacks", price: 80, unit: "Box", tags: ["Sweet", "Bakery"] },
      { name: "Whole Wheat Crackers", category: "Snacks", price: 60, unit: "Packet", tags: ["Fiber", "Light"] },
      { name: "Moisturizing Aloe Soap", category: "Personal Care", price: 45, unit: "Piece", tags: ["Skincare", "Fresh"] },
      { name: "Herbal Toothpaste 150g", category: "Personal Care", price: 95, unit: "Tube", tags: ["Dental", "Organic"] },
      { name: "Anti-Dandruff Shampoo", category: "Personal Care", price: 180, unit: "Bottle", tags: ["Haircare"] },
      { name: "Shea Butter Hand Cream", category: "Personal Care", price: 220, unit: "Tube", tags: ["Moisturizer"] },
      { name: "Liquid Dishwash Lemon", category: "Household", price: 110, unit: "Bottle", tags: ["Cleaning", "Lemon"] },
      { name: "Multi-surface Cleaner Spray", category: "Household", price: 140, unit: "Bottle", tags: ["Hygiene", "Disinfectant"] },
      { name: "Biodegradable Garbage Bags", category: "Household", price: 120, unit: "Roll", tags: ["Eco-friendly"] },
      { name: "Microfiber Cleaning Cloths", category: "Household", price: 199, unit: "Pack", tags: ["Reusable"] }
    ]
  },
  {
    id: "Healthcare",
    label: "Healthcare",
    icon: "Activity",
    color: "hsl(339, 90%, 55%)", // Pinkish crimson
    subCategories: ["Pharmaceuticals", "Medical Devices", "Wellness", "Services"],
    templates: [
      { name: "Vitamin C Chewable Tablets", category: "Wellness", price: 120, unit: "Strip", tags: ["Immunity", "Supplement"] },
      { name: "Multivitamin Gold Capsules", category: "Wellness", price: 450, unit: "Bottle", tags: ["Health", "Daily"] },
      { name: "Digital Blood Pressure Monitor", category: "Medical Devices", price: 2499, unit: "Piece", tags: ["Diagnostic", "Electronic"] },
      { name: "Infrared Forehead Thermometer", category: "Medical Devices", price: 1200, unit: "Piece", tags: ["Quick", "Sensor"] },
      { name: "Disposable Surgical Masks (50x)", category: "Medical Devices", price: 250, unit: "Box", tags: ["Protection", "Hygiene"] },
      { name: "Pain Relief Ointment", category: "Pharmaceuticals", price: 85, unit: "Tube", tags: ["Analgesic", "Fast Action"] },
      { name: "Cough Syrup Non-Drowsy", category: "Pharmaceuticals", price: 75, unit: "Bottle", tags: ["Relief", "Cold"] },
      { name: "Antiseptic Liquid 500ml", category: "Wellness", price: 160, unit: "Bottle", tags: ["First-Aid"] },
      { name: "Telehealth Consultation Slot", category: "Services", price: 500, unit: "Session", tags: ["Online", "Doctor"] },
      { name: "Comprehensive Blood Test Kit", category: "Services", price: 1800, unit: "Kit", tags: ["Lab Checkup"] }
    ]
  },
  {
    id: "Technology",
    label: "Technology",
    icon: "Cpu",
    color: "hsl(217, 91%, 60%)", // High-tech blue
    subCategories: ["Hardware", "Software", "Cloud Services", "IT Support"],
    templates: [
      { name: "Wireless Mechanical Keyboard", category: "Hardware", price: 4999, unit: "Piece", tags: ["Input", "RGB"] },
      { name: "Ergonomic Vertical Mouse", category: "Hardware", price: 2499, unit: "Piece", tags: ["Comfort", "Office"] },
      { name: "Portable SSD 1TB USB-C", category: "Hardware", price: 8999, unit: "Piece", tags: ["Storage", "Fast"] },
      { name: "Office Productivity Suite License", category: "Software", price: 6999, unit: "Annual", tags: ["Enterprise", "Cloud"] },
      { name: "Antivirus Deluxe Plus", category: "Software", price: 1499, unit: "Annual", tags: ["Security", "PC"] },
      { name: "Cloud Server VPS Starter", category: "Cloud Services", price: 1200, unit: "Month", tags: ["Hosting", "Linux"] },
      { name: "Managed Data Backup 500GB", category: "Cloud Services", price: 800, unit: "Month", tags: ["Secure", "Backup"] },
      { name: "IT Network Setup Consult", category: "IT Support", price: 5000, unit: "Service", tags: ["On-site", "Expert"] },
      { name: "Hourly Tech Troubleshooting", category: "IT Support", price: 1500, unit: "Hour", tags: ["Remote", "Quick"] }
    ]
  },
  {
    id: "Retail",
    label: "Retail & E-commerce",
    icon: "ShoppingBag",
    color: "hsl(271, 91%, 65%)", // Royal Purple
    subCategories: ["Apparel", "Electronics", "Home & Kitchen", "Accessories"],
    templates: [
      { name: "Classic Cotton T-Shirt", category: "Apparel", price: 799, unit: "Piece", tags: ["Casual", "Breathable"] },
      { name: "Slim Fit Denim Jeans", category: "Apparel", price: 1899, unit: "Piece", tags: ["Stretch", "Modern"] },
      { name: "Activewear Running Shoes", category: "Apparel", price: 2999, unit: "Pair", tags: ["Athletic", "Comfy"] },
      { name: "Electric Coffee Frother", category: "Home & Kitchen", price: 499, unit: "Piece", tags: ["Kitchen", "Gadget"] },
      { name: "Double-Walled Glass Mug", category: "Home & Kitchen", price: 350, unit: "Piece", tags: ["Stylish", "Drinkware"] },
      { name: "Leather Trifold Wallet", category: "Accessories", price: 1299, unit: "Piece", tags: ["Genuine", "Classic"] },
      { name: "Polarized Aviator Sunglasses", category: "Accessories", price: 1499, unit: "Piece", tags: ["UV Protection"] },
      { name: "Bluetooth True Wireless Earbuds", category: "Electronics", price: 2499, unit: "Set", tags: ["Audio", "Bass"] }
    ]
  },
  {
    id: "Automotive",
    label: "Automotive",
    icon: "Car",
    color: "hsl(32, 95%, 50%)", // Warm Orange
    subCategories: ["Spare Parts", "Accessories", "Maintenance Fluids", "Vehicles"],
    templates: [
      { name: "Premium Synthetic Engine Oil 5L", category: "Maintenance Fluids", price: 3200, unit: "Canister", tags: ["Engine", "Long-lasting"] },
      { name: "All-Weather Rubber Floor Mats", category: "Accessories", price: 1500, unit: "Set", tags: ["Interior", "Durable"] },
      { name: "Performance Brake Pad Set", category: "Spare Parts", price: 2200, unit: "Set", tags: ["Safety", "Braking"] },
      { name: "High-Efficiency Cabin Air Filter", category: "Spare Parts", price: 650, unit: "Piece", tags: ["Filtration", "Clean Air"] },
      { name: "Portable Digital Tyre Inflator", category: "Accessories", price: 2499, unit: "Piece", tags: ["Roadside", "Emergency"] },
      { name: "LED Headlight Bulb Conversion Kit", category: "Spare Parts", price: 3500, unit: "Box", tags: ["Bright", "Upgrade"] }
    ]
  },
  {
    id: "Financial",
    label: "Financial Services",
    icon: "DollarSign",
    color: "hsl(48, 96%, 45%)", // Gold
    subCategories: ["Banking", "Insurance", "Investments", "Financial Advisory"],
    templates: [
      { name: "Small Business Current Account Setup", category: "Banking", price: 2500, unit: "Setup", tags: ["Business", "Commercial"] },
      { name: "Comprehensive Health Cover Plan", category: "Insurance", price: 12000, unit: "Annual", tags: ["Insurance", "Family"] },
      { name: "Motor Third-Party Protection", category: "Insurance", price: 4500, unit: "Annual", tags: ["Auto", "Mandatory"] },
      { name: "Wealth Management Portfolio Audit", category: "Financial Advisory", price: 7500, unit: "Audit", tags: ["Investment", "Expert"] },
      { name: "Tax Return Filing Package (Individual)", category: "Financial Advisory", price: 1500, unit: "Filling", tags: ["Compliance", "Tax"] }
    ]
  },
  {
    id: "Education",
    label: "Education",
    icon: "GraduationCap",
    color: "hsl(199, 89%, 48%)", // Light Blue
    subCategories: ["Courses", "Books", "Stationery", "Coaching"],
    templates: [
      { name: "Full Stack Development Bootcamp", category: "Courses", price: 15000, unit: "Course", tags: ["Programming", "Career"] },
      { name: "Advanced Data Science Study Kit", category: "Books", price: 1200, unit: "Kit", tags: ["AI", "Reference"] },
      { name: "Architect Drawing Stationery Set", category: "Stationery", price: 850, unit: "Pack", tags: ["Design", "Pro"] },
      { name: "1-on-1 IELTS Mock Speaking Prep", category: "Coaching", price: 999, unit: "Hour", tags: ["Language", "Exam"] }
    ]
  },
  {
    id: "B2B",
    label: "B2B / Industrial",
    icon: "Wrench",
    color: "hsl(12, 76%, 50%)", // Rust Red/Brown
    subCategories: ["Raw Materials", "Safety Gear", "Industrial Tools", "Logistics"],
    templates: [
      { name: "Stainless Steel Pipe 304 (6m)", category: "Raw Materials", price: 4200, unit: "Length", tags: ["Metal", "Construction"] },
      { name: "Steel-Toed Leather Safety Shoes", category: "Safety Gear", price: 1850, unit: "Pair", tags: ["Safety", "Heavy-duty"] },
      { name: "Heavy Duty Air Impact Wrench", category: "Industrial Tools", price: 7999, unit: "Piece", tags: ["Pneumatic", "Assembly"] },
      { name: "Express Warehouse Freight (up to 100kg)", category: "Logistics", price: 3500, unit: "Shipment", tags: ["Shipping", "Bulk"] }
    ]
  },
  {
    id: "RealEstate",
    label: "Real Estate",
    icon: "Home",
    color: "hsl(168, 76%, 36%)", // Deep Teal
    subCategories: ["Residential Services", "Commercial Spaces", "Rental Management", "Property Consultation"],
    templates: [
      { name: "Premium 2BHK Apartment Staging", category: "Residential Services", price: 15000, unit: "Service", tags: ["Interior", "Sales Boost"] },
      { name: "Co-working Dedicated Desk Pass", category: "Commercial Spaces", price: 8500, unit: "Month", tags: ["Office", "Flex"] },
      { name: "End-to-End Rental Tenant Verification", category: "Rental Management", price: 2000, unit: "Check", tags: ["Security", "Legal"] },
      { name: "Commercial Property Valuation Report", category: "Property Consultation", price: 12000, unit: "Report", tags: ["Valuation", "Certified"] }
    ]
  },
  {
    id: "Hospitality",
    label: "Travel & Hospitality",
    icon: "Plane",
    color: "hsl(200, 95%, 43%)", // Sky Blue
    subCategories: ["Lodging", "Local Tours", "Custom Packages", "Transportation"],
    templates: [
      { name: "Heritage Deluxe Room (1 Night)", category: "Lodging", price: 5500, unit: "Night", tags: ["Luxury", "Heritage"] },
      { name: "Cinematic City Sunset Walking Tour", category: "Local Tours", price: 800, unit: "Guest", tags: ["Sightseeing", "Guided"] },
      { name: "Private Airport Cabin Transfer", category: "Transportation", price: 1200, unit: "Trip", tags: ["Cab", "Hassle-free"] },
      { name: "Weekend Wellness Escape Package", category: "Custom Packages", price: 18500, unit: "Package", tags: ["Spa", "Full-Board"] }
    ]
  },
  {
    id: "Entertainment",
    label: "Media & Entertainment",
    icon: "Film",
    color: "hsl(340, 82%, 52%)", // Neon Pink
    subCategories: ["Streaming Licenses", "Event Tickets", "Merchandise", "Production Hire"],
    templates: [
      { name: "Corporate Video Background Music License", category: "Streaming Licenses", price: 2999, unit: "License", tags: ["Audio", "Commercial"] },
      { name: "Premium Front-Row Stand-up comedy Pass", category: "Event Tickets", price: 1500, unit: "Ticket", tags: ["Live Show", "Comedy"] },
      { name: "Limited Edition System Fan Hoodie", category: "Merchandise", price: 2200, unit: "Piece", tags: ["Apparel", "Branded"] },
      { name: "Studio DSLR Camera Hire with Lens (12h)", category: "Production Hire", price: 3500, unit: "Hire", tags: ["Camera", "4K"] }
    ]
  },
  {
    id: "Government",
    label: "Non-profit / Government",
    icon: "Building",
    color: "hsl(211, 39%, 40%)", // Cool Slate Blue
    subCategories: ["Licenses & Permits", "Grants & Filing", "Training & Workshops", "Public Utility Help"],
    templates: [
      { name: "FSSAI Food License Filing Assistance", category: "Licenses & Permits", price: 4500, unit: "Application", tags: ["Filing", "Food Biz"] },
      { name: "NGO 80G Tax Exemption Certificate Audit", category: "Grants & Filing", price: 12500, unit: "Service", tags: ["Legal", "Tax-Free"] },
      { name: "Public CSR Grant Application Draft", category: "Grants & Filing", price: 8000, unit: "Proposal", tags: ["Funding", "CSR"] },
      { name: "First-Aid Community Training Certification", category: "Training & Workshops", price: 1200, unit: "Student", tags: ["Safety", "Certified"] }
    ]
  }
];

// Helper function to programmatically guarantee 20 high-quality products per sector
export const getFallbackProducts = (sectorId) => {
  const sector = SECTORS.find(s => s.id === sectorId);
  if (!sector) return [];

  const list = [];
  const baseCount = sector.templates.length;

  // 1. Map existing templates
  sector.templates.forEach((t, i) => {
    list.push(createProductObject(sectorId, t.name, t.category, t.price, t.unit, t.tags, i + 1));
  });

  // 2. Synthesize extra products to ensure at least 20 per sector
  let index = baseCount + 1;
  while (list.length < 20) {
    const subCat = sector.subCategories[(index - 1) % sector.subCategories.length];
    const modifier = `Type-${index}`;
    const name = `${sector.templates[(index - 1) % baseCount]?.name || "Standard Item"} (${modifier})`;
    const price = Math.round((sector.templates[(index - 1) % baseCount]?.price || 100) * (0.8 + Math.random() * 0.4));
    const unit = sector.templates[(index - 1) % baseCount]?.unit || "Piece";
    const tags = [...(sector.templates[(index - 1) % baseCount]?.tags || []), "Secondary"];
    
    list.push(createProductObject(sectorId, name, subCat, price, unit, tags, index));
    index++;
  }

  return list;
};

const createProductObject = (sectorId, name, category, price, unit, tags, index) => {
  const safeIndexStr = String(index).padStart(3, '0');
  const sku = `${sectorId.substring(0, 4).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${safeIndexStr}`;
  const id = `PROD-${sectorId}-${safeIndexStr}`;
  return {
    id,
    name,
    category,
    subCategory: category,
    sector: sectorId,
    unit,
    uom: unit, // for back-compat
    price,
    mrp: price, // for back-compat
    sku,
    description: `Standard professional-grade ${name.toLowerCase()} suitable for commercial B2B operations in the ${sectorId} industry.`,
    tags: tags || [],
    source: "ai",
    retailerDivisor: 1.25,
    dbDivisor: 1.12,
    ssDivisor: 1.05,
    scheme: { buy: 0, free: 0 },
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
