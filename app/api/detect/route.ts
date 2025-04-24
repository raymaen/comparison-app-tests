import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extract IP from x-forwarded-for header
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim();

    if (!ip) {
      return NextResponse.json({ error: "IP address not found" }, { status: 400 });
    }

    // Query ipgeolocation.io
    const API_KEY = process.env.IPGEOLOCATION_API_KEY || "YOUR_API_KEY";
    const geoRes = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ip}&fields=geo,zipcode`, {
      headers: { Accept: "application/json" },
    });

    if (!geoRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from geolocation API" }, { status: 502 });
    }

    const data: GeoLocationResponse = await geoRes.json();

    // Prepare response and set cookies
    const response = NextResponse.json(data);

    if (data.zipcode) {
      response.cookies.set("zipcode", data.zipcode, { path: "/", httpOnly: false });
    }

    if (data.city) {
      response.cookies.set("city", data.city, { path: "/", httpOnly: false });
    }

    if (data.state_code) {
      const state = data.state_code.split("-")[1] || data.state_code;
      response.cookies.set("state", state, { path: "/", httpOnly: false });
    }

    return response;
  } catch (error) {
    console.error("Error during geolocation lookup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: Type for better dev experience
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
