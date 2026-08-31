// Where enquiry forms send.
//
// The forms are the one part of the site that needs a backend. Until the CRM
// is deployed there is nowhere to send to, and the honest thing is to say so
// and offer email — NOT to post at http://localhost:5180 from a visitor's
// browser, which would hit *their* machine and be blocked as mixed content
// on an HTTPS site.
//
// So the localhost fallback applies in development only, where it is correct
// and keeps `npm run dev` + `dotnet run` working with no configuration. In a
// production build the endpoint is whatever NEXT_PUBLIC_API says, and null if
// it says nothing. Both forms check for null before they fetch.

const DEV_API = process.env.NODE_ENV === "development" ? "http://localhost:5180/api/v1" : undefined;

const base = (process.env.NEXT_PUBLIC_API ?? DEV_API)?.replace(/\/+$/, "");

export const LEAD_ENDPOINT = base ? `${base}/public/leads` : null;
