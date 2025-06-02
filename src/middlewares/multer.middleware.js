import multer from "multer"
import { nanoid } from "nanoid"
import path from "path"

const storage = multer.diskStorage({
  destination(req, file, cb) {  
    cb(null, "./public/temp")
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    const uniqueSuffix = nanoid()
    cb(null, `${base}-${uniqueSuffix}${ext}`)
  }
});

export const upload = multer({
    storage,
});