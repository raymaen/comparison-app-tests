import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =====================
// 🌍 API Handler
// =====================
export async function GET(req: NextRequest) {
  try {
    console.log("📍 Geolocation request received");
    const cookies = getGeoCookies(req);

    // Skip API call if all cookies exist
    if (cookies.zipcode && cookies.city && cookies.state_code && cookies.country_code) {
      console.log("🍪 Using cached geolocation from cookies:", cookies);
      return NextResponse.json({
        message: "Geolocation already cached in cookies",
        ...cookies,
      });
    }

    // Get client IP (or fallback)
    const ip = getClientIp(req);
    if (!ip) {
      console.log("❌ Failed to determine client IP address");
      return NextResponse.json({ error: "IP address not found" }, { status: 400 });
    }
    console.log(`🔍 Detected client IP: ${ip}`);

    // Fetch from ipgeolocation.io
    const geoData = await fetchGeolocation(ip);
    if (!geoData) {
      console.log("❌ Failed to fetch geolocation data from API");
      return NextResponse.json({ error: "Failed to fetch geolocation" }, { status: 502 });
    }

    console.log(
      `✅ Successfully fetched geolocation: ${geoData.city}, ${geoData.state_code}, ${geoData.country_code2}`
    );

    const cleanedData: GeoLocationData = {
      country_code: geoData.country_code2,
      state_code: extractStateCode(geoData.state_code),
      city: geoData.city,
      zipcode: geoData.zipcode,
    };

    // Prepare JSON response with cookies
    const response = new NextResponse(JSON.stringify(cleanedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    setGeoCookies(response, cleanedData);
    console.log("🍪 Geolocation cookies set:", cleanedData);

    return response;
  } catch (error) {
    console.error("❌ Geolocation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Extracts the client IP address from request headers
 * @param req - The Next.js request object
 * @returns The client IP address or null if not found
 */
function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}

/**
 * Fetches geolocation data for the provided IP address
 * @param ip - The IP address to geolocate
 * @returns Geolocation data or null if the request fails
 */
async function fetchGeolocation(ip: string): Promise<GeoLocationResponse | null> {
  const API_KEY = process.env.IPGEOLOCATION_API_KEY;
  if (!API_KEY) {
    console.error("❌ Missing IPGEOLOCATION_API_KEY environment variable");
    return null;
  }

  const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ip}&fields=geo,zipcode`;
  console.log(`🌐 Calling geolocation API: ${apiUrl.replace(API_KEY, "***")}`);

  try {
    const res = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ Geolocation API error: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`❌ Geolocation API fetch error:`, error);
    return null;
  }
}

/**
 * Extracts the state code from the API's state_code format
 * @param stateCode - The state code from the API (may be in format like "US-NY")
 * @returns The cleaned state code
 */
function extractStateCode(stateCode: string): string {
  return stateCode?.split("-")[1] || stateCode;
}

/**
 * Retrieves geolocation data from cookies if available
 * @param req - The Next.js request object
 * @returns Partial geolocation data from cookies
 */
function getGeoCookies(req: NextRequest): Partial<GeoLocationData> {
  return {
    country_code: req.cookies.get("country_code")?.value,
    state_code: req.cookies.get("state")?.value,
    city: req.cookies.get("city")?.value,
    zipcode: req.cookies.get("zipcode")?.value,
  };
}

/**
 * Sets geolocation data as cookies on the response
 * @param res - The Next.js response object
 * @param data - The geolocation data to set as cookies
 */
function setGeoCookies(res: NextResponse, data: GeoLocationData) {
  const options = { path: "/", httpOnly: false, maxAge: 60 * 60 * 24 * 30 }; // 30 days

  res.cookies.set("country_code", data.country_code, options);
  res.cookies.set("state", data.state_code, options);
  res.cookies.set("city", data.city, options);
  res.cookies.set("zipcode", data.zipcode, options);
}

// =====================
// 🧾 Interfaces
// =====================

interface GeoLocationResponse {
  ip: string;
  continent_code: string;
  continent_name: string;
  country_code2: string;
  country_code3: string;
  country_name: string;
  country_name_official: string;
  is_eu: boolean;
  state_prov: string;
  state_code: string;
  district: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
}

interface GeoLocationData {
  country_code: string;
  state_code: string;
  city: string;
  zipcode: string;
}
