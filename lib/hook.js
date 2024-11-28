import fetch from "node-fetch";

export async function sendHook(html, to, reqHeaders, hook) {
  const { url, headers } = hook;
  if(!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  // Post the form to the web hook
  fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: html,
      email: to,
      headers: reqHeaders,
    }),
  });
}
