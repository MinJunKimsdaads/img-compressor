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
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // 이미지를 저장할 폴더 설정
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) { // 확장자를 붙여서 파일명 설정
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

//이미지 업로드할 폴더 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

app.post('/compress',upload.single('image'),async(req,res)=>{
    try{
        console.log(req.body.quality);
        const files = await imagemin([`uploads`],{
            destination:'compressed/',
            plugins:[
                imageminMozjpeg({ quality: req.body.quality }),
                imageminPngquant({ quality: [req.body.quality/10, req.body.quality/10] }),
            ]
        })
        const compressedImagePath = files[0].destinationPath;
        const compressedImageFilename = path.basename(compressedImagePath);
        res.json({ success: true, compressedImagePath: compressedImageFilename });
    }catch(error){
        console.error('이미지 압축 중 오류:', error);
        res.status(500).send('이미지 압축 중 오류 발생');
    }
})

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'compressed', filename);
    //a 태그에서 다운로드 가능하도록 헤더 설정
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(filePath);
});

app.listen(PORT, ()=>{
    console.log('connect');
})