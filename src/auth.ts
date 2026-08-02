import NextAuth from "next-auth";
import Auth0 from "next-auth/providers/auth0";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Auth0({
      id: "azure-ad",
      name: "Modon",
      clientId: process.env.AUTH_AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AUTH_AZURE_AD_CLIENT_SECRET,
      issuer: process.env.AUTH_AZURE_AD_ISSUER,
      authorization: {
        params: {
          audience: process.env.AUTH_AZURE_AD_AUDIENCE,
          scope: "openid profile email",
        },
      },
    }),
  ],
  trustHost: true,
  pages: {
    // Locale prefix is applied by the proxy redirect; Auth.js falls back here
    // when it initiates a sign-in itself (e.g. from a server action).
    signIn: "/login",
  },
});
