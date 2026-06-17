const os = require("os");
const otpGenerator = require('otp-generator');

exports.getLocalIP = () => {
  const nets = os.networkInterfaces();
  let localIP = "127.0.0.1";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        localIP = net.address;
      }
    }
  }
  return localIP;
};

exports.generateOtp = (digit) => {
  return otpGenerator.generate(digit, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true
  });
}

exports.normalizeIndianMobile = (mobile) => {
  const cleanMobile = String(mobile || "").trim().replace(/[\s-]/g, "");
  const withoutCountryCode = cleanMobile
    .replace(/^\+91/, "")
    .replace(/^91(?=[6-9]\d{9}$)/, "")
    .replace(/^0(?=[6-9]\d{9}$)/, "");

  if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) {
    return null;
  }

  return {
    local: withoutCountryCode,
    e164: `+91${withoutCountryCode}`,
  };
};


