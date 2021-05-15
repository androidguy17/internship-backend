const express = require('express')
const multer = require('multer')
const logger = require('morgan')

const fs = require("fs");
const textractScan = require("./textractUtils");



const app = express();
app.use(express.json());

const fileStorageEngine = multer.diskStorage({
    
    destination:(req,file,cb) =>{
        cb(null,'./images')

    },

    filename: (req, file, cb)=>{
        cb(null,Date.now() + '--' + file.originalname)
    }

})

const upload = multer({storage: fileStorageEngine})
app.use(logger("dev"));

app.post("/testupload",upload.single('image'),async(req,res)=>{
    console.log(req.file.filename);
    var name = req.file.filename
    

    var filePath = `./images/${name}`;

    console.log(filePath);
    console.log(`size is ${bytesToSize(req.file.size)}`)

    try{
        fs.unlinkSync(filePath, (err)=>{
          console.log('deleted ' + filePath)
        })

    }catch(e){console.log(e)
        res.send({msg:"error"})
    }


    res.send({
        
            company: 'Oriental',
            keyValues: {
              Relation: 'Self',
              'Valid Fror': '24 Nov 2012',
              'Pol Hldr': 'qejpoej pq',
              Name: 'qweqwe qweqwe',
              'MA-ID': '5006142348',
              'Emp. No.': 'OBqowiepqiwe11',
              'Pol. No.': '22301/22/2323/23232'
            },
            template: {
             firstname: 'aisjdi',
              lastname: 'dffgfdg',
              policy: '232323/23/2323/2323',
              valid_from: '24 Nov 2012'
            }
    });
})




app.get("/",(req,res)=>{

    res.send({
        "test":"success"
    })
})

app.post("/single",upload.single('image'), async(req,res)=>  {
    console.log(req.file.filename);
    var name = req.file.filename

    var filePath = `./images/${name}`;
    
     var data = fs.readFileSync(filePath);
     const results = await textractScan(data);
     console.log(results);

    try{
        fs.unlinkSync(filePath, (err)=>{
          console.log('deleted ' + filePath)
        })

    }catch(e){console.log(e)
        res.send({msg:"error"})
    }


     res.send(results)

})

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }










app.post('/delete',(req,res)=>{
   var name = req.body.name

   console.log(name);
  

    res.send({
        msg: "successful deletion"
    })
})


module.exports =app;