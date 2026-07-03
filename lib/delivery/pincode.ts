export type IndiaPostOffice = {
  Name?: string;
  District?: string;
  State?: string;
};

export type IndiaPostPincodeResponse = {
  Message?: string;
  Status?: string;
  PostOffice?: IndiaPostOffice[] | null;
};

export type DeliveryAvailability = {
  available: boolean;
  state: string;
  district: string;
  postOffice: string;
};

export const indianPincodePattern = /^[1-9][0-9]{5}$/;

export function parseIndiaPostResponse(value: unknown): DeliveryAvailability | null {
  if (!Array.isArray(value)) return null;

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const response = entry as IndiaPostPincodeResponse;
    if (response.Status?.toLowerCase() !== "success" || !Array.isArray(response.PostOffice)) continue;

    const office = response.PostOffice.find((item) => item?.State && item?.District && item?.Name);
    if (!office?.State || !office.District || !office.Name) continue;

    return {
      available: true,
      state: office.State.trim(),
      district: office.District.trim(),
      postOffice: office.Name.trim()
    };
  }

  return null;
}
