const express=require('express');
const  bodyParser=require('body-parser');
const { default: mongoose } = require('mongoose');
const _ =require("lodash");
const dotenv = require("dotenv").config();


const app=express();
// var items=["Buy Food","Cook Food","Eat Food"];
// var workItems=[];               //?retryWrites=true&w=majority/
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const mongodbCluster = process.env.mongData;
mongoose.connect(mongodbCluster);

const itemSchema = {
    name:String
};

const Item =mongoose.model("Item",itemSchema);

const item1=new Item({
    name:"Welcome to your todolist."
});

const item2=new Item({
    name:"Hit the + to add a new item."
});

const item3=new Item({
    name:"<--Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemSchema]
}

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){
    // // res.send("Hello World");
    // var today=new Date();
    // var currentDay=today.getDay();
    // var day="";
    // if( currentDay === 0){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Sunday";
    // }
    // if(currentDay === 1){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Monday";
    // }
    // if( currentDay === 2){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Tuesday";
    // }if( currentDay === 3){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Wednesday";
    // }
    // if( currentDay === 4){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Thrusday";
    // }
    // if( currentDay === 5){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Friday";
    // }
    // if( currentDay === 6){
    //     //res.sendFile(__dirname+"weekend.html");
    //     day="Saturday";
    // }
    
    // var today= new Date(); 
    // var options={
    //     weekday:"long",
    //     day:"numeric",
    //     month:"long"
    // };
    // var day=today.toLocaleDateString("en-us",options);
       
    Item.find({},function (err,foundItems) {

        if(foundItems.length === 0){
                Item.insertMany(defaultItems,function (err) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Sucessfull!");
                    }
                });
                res.redirect("/");
        }
        else{
            res.render("list",{listTitle:"Today",newListItems:foundItems});
        }
    })   
});


app.post("/",function (req,res) {
    const itemName=req.body.newItem;  //taking input from the user
    const listName=req.body.list;
    const item= new Item({
        name:itemName
    })
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function (err,foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
});


app.post("/delete",function (req,res) {
    const checkedItemId=req.body.checkbox;
    const listname=req.body.listName;
    if(listname === "Today"){
        Item.findByIdAndRemove(checkedItemId,function (err) {
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully deleted!");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedItemId}}},function (err,foundList) {
            if(!err){
                res.redirect("/"+listname);
            }
        })
    }
   
})


// app.get("/work",function (req,res) {
//     res.render("list",{listTitle:"Work",newListItems:workItems}); 
// });
 
app.get("/:customListName",function (req,res) {    //express dynamic route parameters
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function (err,foundList) {
        if(err){
            console.log(err);
        }
        else{
            if(!foundList){
                //creating a new list
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
               //show an existing list
               res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
            }
        }      
    });

    const list=new List({
        name:customListName,
        items:defaultItems
    });

    list.save();
});


app.get("/about",function (req,res) {
    res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server is running at port number 3000.");
});

 

