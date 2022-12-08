// 3. Generate QR CODE for catalog - POST request to '/api/qr/generate' with data { type, name, catalogId }
window.addEventListener("load", async () => {
  const res = await fetch("/api/qr/generate", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      type: "catalog",
      name: "qrcodeOne",
      catalogId: "1670523247201",
    }),
  });

  const data = await res.json();

  console.log(data);
});
