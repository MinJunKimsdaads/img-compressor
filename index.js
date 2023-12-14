import express from 'express';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import multer from 'multer';
import path from "path";

const app = express();
const PORT = 8000;

//확장자 체크
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
    }
};

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 이미지를 저장할 폴더 설정
    },
    filename: function (req, file, cb) {
        // 확장자를 붙여서 파일명 설정
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

//이미지 업로드할 폴더 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

app.use(express.static('uploads')); //정적파일 제공
app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.get('/',(req, res)=>{
    res.send('압축 페이지');
})

app.post('/test',(req,res)=>{
    console.log('응답 성공')
})

app.post('/compress',upload.single('image'),async(req,res)=>{
    try{
        const files = await imagemin([`uploads`],{
            destination:'compressed/',
            plugins:[
                imageminMozjpeg({ quality: 30 }),
                imageminPngquant({ quality: [0.3, 0.3] }),
            ]
        })

        const compressedImagePath = files[0].destinationPath;
        // res.json({ compressedImagePath });
        res.redirect(`file:///C:/Users/케이아트코리아/test/imageCompressor/index.html?compressedImagePath=${compressedImagePath}`);
    }catch(error){
        console.error('이미지 압축 중 오류:', error);
        res.status(500).send('이미지 압축 중 오류 발생');
    }
})

app.listen(PORT, ()=>{
    console.log('connect');
})