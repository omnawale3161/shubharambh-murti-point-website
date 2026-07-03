export function deliveryEstimate(pincode: string) {
  if (!/^\d{6}$/.test(pincode)) {
    return null;
  }

  if (pincode.startsWith("411")) {
    return "Pune delivery available in 1-2 days. Store pickup is also available.";
  }

  if (["400", "401", "402", "410", "421"].some((prefix) => pincode.startsWith(prefix))) {
    return "Mumbai and nearby delivery available in 2-4 days with safe packing.";
  }

  if (pincode.startsWith("42") || pincode.startsWith("43")) {
    return "Maharashtra delivery usually takes 3-6 days after packing confirmation.";
  }

  return "Delivery can be arranged after size and courier confirmation on WhatsApp.";
}
