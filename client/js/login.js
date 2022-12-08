const handleSubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formEntries = Object.fromEntries(formData.entries());

  const { username, password } = formEntries;

  //   do some validation here
  fetch("/api/users/login", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ username, password }),
  }).then(async (res) => {
    console.log(await res.json());
  });
};
