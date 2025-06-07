import multer from "multer"
import fs from "fs"


// Ensure temp directory exists
const tempDir = "../public/temp"
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {  
    cb(null, tempDir)
  },
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  }
});

export const upload = multer({
    storage,
});