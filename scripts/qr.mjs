import QRCode from "qrcode";

const url = process.argv[2];
if (!url) {
  console.error("Usage: npm run qr -- https://your-domain.com");
  process.exit(1);
}

await QRCode.toFile("rsvp-qr.png", url, {
  width: 1200,
  margin: 2,
  errorCorrectionLevel: "H",
  color: { dark: "#5e2034", light: "#fbf6ec" },
});
await QRCode.toFile("rsvp-qr.svg", url, {
  type: "svg",
  margin: 2,
  errorCorrectionLevel: "H",
  color: { dark: "#5e2034", light: "#fbf6ec" },
});
console.log("Created rsvp-qr.png and rsvp-qr.svg for", url);
