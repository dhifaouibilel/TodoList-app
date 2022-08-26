const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');

const app = express();

mongoose.connect('mongodb+srv://admin-bilel:firstmongo1384@cluster0.v6ya627.mongodb.net/todolistDB');
// 'mongodb://localhost:27017/todolistDB'  this to connect to the database locally
console.log('Connection started to mongodb on port 27017');

const itemsSchema = {
  name: String,
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model('Item', itemsSchema);

const List = mongoose.model('List', listSchema);

// const items = ['Buy Food', 'Cook Food', 'Eat Food'];
// const workItems = [];

const item1 = new Item({name: 'Welcome to your todoList!'});
const item2 = new Item({name: 'Hit the + button to add a new item!'});
const item3 = new Item({name: '<-- Hit this to delete the item'});

const defaultItems = [item1, item2, item3];

Item.countDocuments({}, function(err, count){
  if (err) {
    console.error(err);
  } else if (count == 0){
    Item.insertMany(defaultItems, function (err){
      if (err){
        console.log(err);
      } else {
        console.log('Successfully inserted the default items to the todoList Database');
      }
    });
  }
})



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static('public'));

app.get('/', function(req, res) {
  const day = date.getDate();
  Item.find({}, function(err, foundItems){
    if(err){
      console.log(err);
    } else {
      console.log('Successfully found '+foundItems.length+' items');
    }
    res.render('list', {listTitle: day, todoList: foundItems});
  });
});

app.post('/', function(req, res) {
  //var newTodo = JSON.stringify(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  const newItem = new Item({name: itemName});
  if (listName === date.getDate().split(' ')[0]) {
    newItem.save().then(() => console.log('Successfully saved the document'));
    Item.deleteMany({name: {$in: ['Welcome to your todoList!', 'Hit the + button to add a new item!', '<-- Hit this to delete the item']}}, function(err){
      if (!err){
        res.redirect('/');
      }
    })
  } else {
    List.updateOne({name: listName}, {$push: {items: newItem}}, function(err){
    console.log("Successfully updated the "+listName+" document with added new item!");
    res.redirect('/'+listName);
    })
    // Or use findOne then pushin the new item to items array finally save it
  }
})

app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList) {
        const list = new List({name: customListName, items: defaultItems});
        list.save();
        res.redirect('/'+customListName);
      } else {
        res.render('list', {listTitle: customListName, todoList: foundList.items});
      }
    }
  });

})

app.post('/delete', function(req, res) {
  const itemId = req.body.todelete.split(',')[0];
  const listName = req.body.todelete.split(',')[1];

  if(listName === date.getDate().split(',')[0]){
    Item.deleteOne({_id: itemId}, function(err){
      if (!err){
        res.redirect('/');
      }
    })
  } else {
    List.updateOne({name: listName}, {$pull: { items: {_id: itemId}}}, function(err){
      if (!err){
        res.redirect('/'+listName);
      }
    })
  }
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log('the server running on port ' + port);
})
