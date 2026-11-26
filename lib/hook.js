import fetch from "node-fetch";

export async function sendHook(message, to, reqHeaders, hook, fields, _sent, _response) {
  const { url, headers } = hook;
  if(!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  // Post the form to the web hook
  // fields is sent as a JSON string: NocoDB stores an object as "[object Object]" in a text column
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...fields,
      fields: JSON.stringify(fields),
      message,
      to,
      headers: reqHeaders,
      _sent,
      _response,
    }),
  });
  if (!response.ok) {
    console.error("Failed to send hook", response.statusText, await response.text());
  }
}
