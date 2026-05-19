// Speedu Seed Script — CommonJS, no imports needed
  // Node 18+ ka global fetch use karta hai
  // Run: node seed.js

  const API_URL = "http://localhost:5000";
  const ADMIN_EMAIL = "dipanshumalviya9@gmail.com";
  const ADMIN_PASSWORD = "123456";

  const SERVICES = [
    { categoryName: "Electrician", variants: [{ variantName: "Fan Installation", variantPrice: 299 }, { variantName: "Wiring & Rewiring", variantPrice: 799 }, { variantName: "Switchboard Repair", variantPrice: 399 }, { variantName: "MCB Fuse Replacement", variantPrice: 249 }] },
    { categoryName: "Plumber", variants: [{ variantName: "Pipe Leakage Fix", variantPrice: 349 }, { variantName: "Tap Faucet Repair", variantPrice: 199 }, { variantName: "Bathroom Fitting", variantPrice: 999 }, { variantName: "Drainage Unclogging", variantPrice: 499 }] },
    { categoryName: "Carpenter", variants: [{ variantName: "Door Window Repair", variantPrice: 449 }, { variantName: "Furniture Assembly", variantPrice: 599 }, { variantName: "Cupboard Installation", variantPrice: 1299 }, { variantName: "Lock Replacement", variantPrice: 299 }] },
    { categoryName: "Painter", variants: [{ variantName: "Room Painting 1BHK", variantPrice: 3999 }, { variantName: "Room Painting 2BHK", variantPrice: 6999 }, { variantName: "Exterior Painting", variantPrice: 9999 }, { variantName: "Wall Putty", variantPrice: 1999 }] },
    { categoryName: "AC Service", variants: [{ variantName: "AC Servicing 1 ton", variantPrice: 499 }, { variantName: "AC Servicing 1.5 ton", variantPrice: 599 }, { variantName: "Gas Refilling", variantPrice: 1499 }, { variantName: "AC Installation", variantPrice: 999 }] },
    { categoryName: "Cleaning", variants: [{ variantName: "Home Deep Clean 1BHK", variantPrice: 1499 }, { variantName: "Home Deep Clean 2BHK", variantPrice: 2499 }, { variantName: "Sofa Cleaning", variantPrice: 799 }, { variantName: "Carpet Cleaning", variantPrice: 699 }] },
    { categoryName: "Pest Control", variants: [{ variantName: "Cockroach Treatment", variantPrice: 699 }, { variantName: "Bed Bug Treatment", variantPrice: 999 }, { variantName: "Termite Treatment", variantPrice: 1499 }, { variantName: "Full Home Pest Control", variantPrice: 1999 }] },
    { categoryName: "Refrigerator Repair", variants: [{ variantName: "Cooling Problem Fix", variantPrice: 599 }, { variantName: "Compressor Check", variantPrice: 799 }, { variantName: "Gas Refilling", variantPrice: 1299 }, { variantName: "Door Gasket Replacement", variantPrice: 349 }] },
    { categoryName: "Washing Machine Repair", variants: [{ variantName: "Not Spinning Fix", variantPrice: 499 }, { variantName: "Water Leakage Fix", variantPrice: 399 }, { variantName: "PCB Repair", variantPrice: 999 }, { variantName: "Drum Cleaning", variantPrice: 299 }] },
    { categoryName: "TV Repair", variants: [{ variantName: "LED Screen Repair", variantPrice: 1499 }, { variantName: "No Display Fix", variantPrice: 799 }, { variantName: "Sound Issue Fix", variantPrice: 499 }, { variantName: "Smart TV Software Issue", variantPrice: 399 }] },
    { categoryName: "RO Water Purifier", variants: [{ variantName: "Filter Replacement", variantPrice: 699 }, { variantName: "RO Service", variantPrice: 499 }, { variantName: "RO Installation", variantPrice: 899 }, { variantName: "Membrane Replacement", variantPrice: 1199 }] },
    { categoryName: "Geyser Repair", variants: [{ variantName: "Geyser Repair", variantPrice: 399 }, { variantName: "Thermostat Replacement", variantPrice: 549 }, { variantName: "Geyser Installation", variantPrice: 699 }, { variantName: "Heating Element Replacement", variantPrice: 799 }] },
    { categoryName: "CCTV Installation", variants: [{ variantName: "1 Camera Installation", variantPrice: 1499 }, { variantName: "4 Camera Setup", variantPrice: 4999 }, { variantName: "DVR Setup", variantPrice: 999 }, { variantName: "Camera Repair", variantPrice: 599 }] },
    { categoryName: "Chimney Service", variants: [{ variantName: "Chimney Cleaning", variantPrice: 499 }, { variantName: "Motor Repair", variantPrice: 799 }, { variantName: "Filter Replacement", variantPrice: 399 }, { variantName: "Chimney Installation", variantPrice: 1299 }] },
    { categoryName: "Microwave Repair", variants: [{ variantName: "Not Heating Fix", variantPrice: 449 }, { variantName: "Door Latch Repair", variantPrice: 299 }, { variantName: "Control Panel Fix", variantPrice: 699 }] },
    { categoryName: "Inverter Battery", variants: [{ variantName: "Battery Check Service", variantPrice: 399 }, { variantName: "Inverter Repair", variantPrice: 699 }, { variantName: "Battery Replacement", variantPrice: 4999 }] },
    { categoryName: "Movers Packers", variants: [{ variantName: "Within City 1BHK", variantPrice: 3999 }, { variantName: "Within City 2BHK", variantPrice: 5999 }, { variantName: "Loading Unloading Only", variantPrice: 1999 }] },
    { categoryName: "Sofa Furniture Repair", variants: [{ variantName: "Sofa Cushion Repair", variantPrice: 599 }, { variantName: "Wooden Furniture Polish", variantPrice: 799 }, { variantName: "Recliner Fix", variantPrice: 1299 }] },
    { categoryName: "Laptop Computer Repair", variants: [{ variantName: "OS Installation", variantPrice: 499 }, { variantName: "Virus Removal", variantPrice: 399 }, { variantName: "Screen Replacement", variantPrice: 2499 }, { variantName: "Keyboard Repair", variantPrice: 799 }] },
    { categoryName: "Gardening", variants: [{ variantName: "Garden Maintenance", variantPrice: 799 }, { variantName: "Plant Trimming", variantPrice: 499 }, { variantName: "Soil Fertiliser Service", variantPrice: 699 }] },
    { categoryName: "Gas Stove Repair", variants: [{ variantName: "Burner Cleaning", variantPrice: 199 }, { variantName: "Auto Ignition Fix", variantPrice: 349 }, { variantName: "Regulator Replacement", variantPrice: 499 }] },
    { categoryName: "Door Lock Security", variants: [{ variantName: "Lock Repair", variantPrice: 299 }, { variantName: "Smart Lock Installation", variantPrice: 1999 }, { variantName: "Key Duplicate", variantPrice: 149 }] },
  ];

  async function callApi(path, method, body, token) {
    const opts = { method: method, headers: { "Content-Type": "application/json" } };
    if (token) opts.headers["Authorization"] = "Bearer " + token;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_URL + path, opts);
    const data = await res.json().catch(function() { return {}; });
    if (!res.ok || data.success === false) throw new Error(data.message || "HTTP " + res.status);
    return data;
  }

  async function run() {
    console.log("\nSpeedu Seed Script starting...");

    var adminToken;
    try {
      var login = await callApi("/admin/login", "POST", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, null);
      adminToken = login.data && login.data.accessToken;
      console.log("Admin login OK");
    } catch (e) {
      console.error("Login failed:", e.message);
      console.error("Make sure backend is running on", API_URL);
      return;
    }

    var existing = await callApi("/service/getService", "GET", null, adminToken);
    var existingList = (existing.data || []);
    var existingNames = {};
    for (var i = 0; i < existingList.length; i++) {
      existingNames[existingList[i].categoryName.trim().toLowerCase()] = existingList[i]._id;
    }
    console.log("Services already in DB:", Object.keys(existingNames).length);

    var addedSvc = 0;
    var addedVar = 0;

    for (var s = 0; s < SERVICES.length; s++) {
      var svc = SERVICES[s];
      var key = svc.categoryName.trim().toLowerCase();
      var serviceId;

      if (existingNames[key]) {
        serviceId = existingNames[key];
        console.log("Skip (exists):", svc.categoryName);
      } else {
        try {
          var created = await callApi("/service/createService", "POST", { categoryName: svc.categoryName }, adminToken);
          serviceId = created.data && created.data._id;
          existingNames[key] = serviceId;
          addedSvc++;
          console.log("Created:", svc.categoryName);
        } catch (e) {
          console.error("Failed:", svc.categoryName, e.message);
          continue;
        }
      }

      if (!serviceId) continue;

      for (var v = 0; v < svc.variants.length; v++) {
        var variant = svc.variants[v];
        try {
          await callApi("/service/" + serviceId + "/variant", "POST", { variantName: variant.variantName, variantPrice: variant.variantPrice }, adminToken);
          addedVar++;
          console.log("  + " + variant.variantName + " Rs." + variant.variantPrice);
        } catch (e) {
          if (/already|exists|duplicate/i.test(e.message)) {
            console.log("  (skip):", variant.variantName);
          } else {
            console.error("  Error:", variant.variantName, e.message);
          }
        }
      }
    }

    console.log("\nDone! Added", addedSvc, "services and", addedVar, "variants.");
  }

  run().catch(function(e) { console.error("Error:", e.message); });
  