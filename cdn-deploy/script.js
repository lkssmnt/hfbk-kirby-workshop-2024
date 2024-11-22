require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const config = {
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_API_SECRET,
    bucketName: process.env.CLOUDFLARE_MEDIA_BUCKET_NAME,
    publicUrl: process.env.CLOUDFLARE_PUBLIC_URL,
  },
  paths: {
    mediaDir: "../static/media", // Adjust to your media directory
    websiteDir: "../static", // Adjust to your static site directory
    mediaExtensions: [".jpg", ".jpeg", ".png", ".mp4", ".webm", ".pdf", ".gif"],
  },
};

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId, // Leave this empty
    secretAccessKey: config.r2.secretAccessKey, // Use the API token here
  },
});

// Content type helper
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf'
  };
  return types[ext] || 'application/octet-stream';
}

// Upload media files
async function uploadMedia(dir, urlMap = new Map()) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadMedia(fullPath, urlMap);
    } else if (config.paths.mediaExtensions.includes(path.extname(item).toLowerCase())) {
      // Create R2 key that preserves the relative path from media directory
      const r2Key = path.relative(config.paths.mediaDir, fullPath);
      
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: config.r2.bucketName,
          Key: r2Key,
          Body: fs.createReadStream(fullPath),
          ContentType: getContentType(fullPath)
        }));

        // Store the mapping of local path to R2 URL
        const r2Url = `${config.r2.publicUrl}/${r2Key}`;
        urlMap.set(fullPath, r2Url);
        
        console.log(`Uploaded: ${r2Key}`);
      } catch (error) {
        console.error(`Failed to upload ${fullPath}:`, error);
      }
    }
  }

  return urlMap;
}

function updateHtmlFiles(dir, urlMap) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      updateHtmlFiles(fullPath, urlMap);
    } else if (path.extname(item).toLowerCase() === ".html") {
      let content = fs.readFileSync(fullPath, "utf8");

      // Replace all media URLs
      urlMap.forEach((r2Url, localPath) => {
        const relativePath = path.relative(config.paths.websiteDir, localPath).replace(/^\/+/, ""); // Remove leading slashes

        // Match the full path with optional leading slash
        const pattern = new RegExp(`(?:\/)?${relativePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");

        content = content.replace(pattern, r2Url); // Ensure no leading slash in the URL
      });

      // Remove leading slashes from src attributes
      content = content.replace(/src="\/(https:\/\/[^"]+)"/g, 'src="$1"');

      fs.writeFileSync(fullPath, content);
      console.log(`Updated: ${fullPath}`);
    }
  }
}

async function main() {
  console.log("Starting media upload...");
  console.log("Uploading from:", config.paths.mediaDir);
  console.log("Bucket:", config.r2.bucketName);
  console.log("Public URL:", config.r2.publicUrl);

  const urlMap = await uploadMedia(config.paths.mediaDir);

  console.log("Updating HTML files...");
  updateHtmlFiles(config.paths.websiteDir, urlMap);

  console.log("Done!");
}

main().catch(console.error);
