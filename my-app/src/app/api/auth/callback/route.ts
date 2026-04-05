
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const client_id = process.env.MICROSOFT_CLIENT_ID!;
const client_secret = process.env.MICROSOFT_CLIENT_SECRET!;
const redirect_url = process.env.CALLBACK_URL!;
const Scope = process.env.SCOPES!;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_url}&response_mode=query&scope=${encodeURIComponent(Scope)}`;
    return NextResponse.redirect(authUrl);
  }

  try {
    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("code", code);
    params.append("redirect_uri", redirect_url);
    params.append("grant_type", "authorization_code");
    params.append("scope", Scope);

    const tokenResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    console.log(access_token, refresh_token, expires_in);

    const res = NextResponse.redirect("http://localhost:3000/home");

    res.cookies.set("ms_tokens", 
      JSON.stringify({
      access_token,
      // refresh_token,
      expires_at: Date.now() + expires_in * 1000*24
    }),{
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: expires_in,
    });

    return res;

  } catch (err: any) {
    console.error(err?.response?.data || err);
    return new NextResponse("Token exchange failed", { status: 500 });
  }
}
