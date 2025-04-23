import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use ipgeolocation.io API
    const API_KEY = process.env.IPGEOLOCATION_API_KEY || "YOUR_API_KEY";
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&fields=geo,zipcode`, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return NextResponse.json({ error: "Failed to fetch geolocation" }, { status: 500 });
  }
}
