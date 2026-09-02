try {
  const res = await fetch("https://upload.wikimedia.org/wikipedia/commons/b/bc/Socrate_du_Louvre.jpg", {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  console.log("Status:", res.status);
} catch (e) {
  console.error("Fetch error details:", e);
}
