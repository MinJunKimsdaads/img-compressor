import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import multer from 'multer';
import path from "path";

const app = express();
const PORT = 8000;

app.use(cors());

//파일 위치
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//확장자 체크
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase(); //업로드 파일 확장자 추출

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
    }
};

// Multer 설정
const storage = multer.memoryStorage(); //메모리저장

//이미지 업로드할 폴더 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

app.post('/compress',upload.single('image'),async(req,res)=>{
    try{
        const buffer = req.file.buffer;

        const compressedBuffer = await imagemin.buffer(buffer, {
            plugins: [
                imageminMozjpeg({ quality: req.body.quality }),
                imageminPngquant({ quality: [req.body.quality / 10, req.body.quality / 10] }),
            ],
        });

        res.send(compressedBuffer);
    }catch(error){
        console.error('이미지 압축 중 오류:', error);
        res.status(500).send('이미지 압축 중 오류 발생');
    }
})

app.listen(PORT, ()=>{
    console.log('connect');
})