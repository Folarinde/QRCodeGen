const API = "/api/v1";

const userId = window.location.href.split("?user=")[1];

const collections = fetch(`${API}/collection/${userId}`).then(async (res) =>
  console.log(await res.json())
);

console.log(collections);
