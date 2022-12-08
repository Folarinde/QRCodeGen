const body = document.getElementById("body");

window.addEventListener("load", async () => {
  //   check if user is authenticated
  const dbUser = await fetch("/api/users/session", {
    credentials: "include",
  });

  const session = await dbUser.json();

  if (session.status === "Error") {
    // redirect to login page
    console.log("redirecting....");
  } else {
    const allCodes = await fetch("/api/qr/getAll");
    const data = await allCodes.json();

    data?.data?.forEach((code) => {
      const imgElement = document.createElement("img");
      imgElement.src = code?.imageUrl;
      imgElement.height = 200;
      imgElement.width = 200;

      body.appendChild(imgElement);
    });
  }
});
