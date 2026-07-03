import { describe, expect, it } from "vitest";
import { indianPincodePattern, parseIndiaPostResponse } from "@/lib/delivery/pincode";

describe("PIN code delivery availability", () => {
  it("accepts only valid Indian six-digit PIN codes", () => {
    expect(indianPincodePattern.test("411001")).toBe(true);
    expect(indianPincodePattern.test("011001")).toBe(false);
    expect(indianPincodePattern.test("41100")).toBe(false);
  });

  it("extracts delivery details for valid Indian PIN codes", () => {
    expect(parseIndiaPostResponse([{ Status: "Success", PostOffice: [{ Name: "Pune H.O", District: "Pune", State: "Maharashtra" }] }])).toEqual({
      available: true,
      state: "Maharashtra",
      district: "Pune",
      postOffice: "Pune H.O"
    });
  });

  it("marks other Indian states available and handles empty responses", () => {
    expect(parseIndiaPostResponse([{ Status: "Success", PostOffice: [{ Name: "Panaji H.O", District: "North Goa", State: "Goa" }] }])?.available).toBe(true);
    expect(parseIndiaPostResponse([{ Status: "Error", PostOffice: null }])).toBeNull();
  });
});
