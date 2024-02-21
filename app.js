const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const notifier = require('node-notifier');
const mongoose = require("mongoose");
const app = express();

const homeContent = "Please make sure that each title is diffrent from another "
const url = "mongodb+srv://9oPmZaMOa0pijMYR:9oPmZaMOa0pijMYR@cluster0.goiiwoi.mongodb.net/Diary"


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(url).then(()=>{
    console.log("Connected")
}).catch(()=>{
    console.log("Not Connected")
})

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true, 
    },
    content: String
})

const Posts = mongoose.model("Post", postSchema);


app.get("/", async (req, res)=>{
    
    const pst = await Posts.find();

    res.render("home" ,{hContent : homeContent, post : pst});
})

app.get("/compose", (req, res)=>{
    res.render("compose");
})
app.post("/compose", async (req, res)=>{
    let inputTitle = req.body.Title;
    let inputPost = req.body.post;
    let flag = 0;
    const distinctTitles = await Posts.find().distinct('title');
    distinctTitles.forEach(async (element) => {
        if(_.lowerCase(element) == _.lowerCase(inputTitle)){
            flag  = 1;
        }
    });
    
    if(flag === 1){
        notifier.notify({
            title: 'Salutations!',
            message: 'This title already exists!!!',
            // icon: path.join(__dirname, 'icon.jpg'),
            sound: true,
            wait: true
        })
    }
    else{

        try {
            // Create a new item using the Mongoose model
            const newitem = new Posts({
                title : inputTitle,
                content: inputPost
            })
    
            // Save the item to the database
            await newitem.save();
    
            res.redirect("/");
        } catch (error) {
            if (error.code === 11000) {
              console.error('Duplicate key error. Title must be unique.');
              notifier.notify({
                    title: 'Salutations!',
                    message: 'This title already exists!!!',
                    // icon: path.join(__dirname, 'icon.jpg'),
                    sound: true,
                    wait: true
                })
            } else {
              console.error('Error saving item:', error);
            } 
        }
    }

})

app.get("/posts/:postName", async (req, res)=>{
    let requredTitle = req.params.postName;

    const distinctTitles = await Posts.find().distinct('title');
    distinctTitles.forEach(async (element) => {
        if(element == requredTitle){
            const p = await Posts.findOne({ title: element });
            res.render("post", {
                title : element,
                content : p.content
            })
        }
    });

    
})

app.listen(3000, ()=>{
    console.log("Server is up and running");
})
