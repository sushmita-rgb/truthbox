const express = require("express");
const router = express.Router();
const Link = require("../models/Link");

router.get("/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const link = await Link.findOne({ linkId, isActive: true });

    if (!link) {
      return res.status(404).send("Link not found");
    }

    // Default branding image if the user didn't upload a picture
    const defaultImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
    
    // Use the uploaded file URL if it's an image, otherwise fallback to default
    let ogImage = defaultImage;
    if (link.fileUrl && (link.fileUrl.includes(".jpg") || link.fileUrl.includes(".png") || link.fileUrl.includes(".jpeg") || link.fileUrl.includes(".webp"))) {
      ogImage = link.fileUrl;
    }

    // Determine the frontend URL (fallback to localhost for local testing)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/feedback/${link.linkId}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Primary Meta Tags -->
          <title>${link.title || "Feedback on TruthBox"}</title>
          <meta name="title" content="${link.title || "Feedback on TruthBox"}">
          <meta name="description" content="${link.description || "Click to leave anonymous feedback!"}">
          <meta name="theme-color" content="${link.accentColor || "#97ce23"}">

          <!-- Open Graph / Facebook / WhatsApp -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="${redirectUrl}">
          <meta property="og:title" content="${link.title || "Feedback on TruthBox"}">
          <meta property="og:description" content="${link.description || "Click to leave anonymous feedback!"}">
          <meta property="og:image" content="${ogImage}">

          <!-- Twitter -->
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:url" content="${redirectUrl}">
          <meta property="twitter:title" content="${link.title || "Feedback on TruthBox"}">
          <meta property="twitter:description" content="${link.description || "Click to leave anonymous feedback!"}">
          <meta property="twitter:image" content="${ogImage}">

          <!-- Redirect human users to the React Frontend -->
          <script>
            window.location.replace("${redirectUrl}");
          </script>
      </head>
      <body>
          <p>Redirecting you to the feedback page...</p>
          <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error("Error generating share preview:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
