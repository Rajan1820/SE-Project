// Importing the necesary dependancies 

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const PLM = require("passport-local-mongoose");

const app = express();

// Setting up the work folder to use EJS

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "this is the secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initializing the session for Passport authentication

app.use(passport.initialize());
app.use(passport.session());

// Connecting Mongoose to the Database 

mongoose.connect("mongodb://localhost:27017/USERDATA", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// Initializing the Various schemas to be used in mongoose 

const itemSchema = {
  name: String
}

const Item = mongoose.model("item", itemSchema)

const item1 = new Item({
  name: "Welcome to The Task Schedular"
});

const item2 = new Item({
  name: "Add your tasks below"
});
const item3 = new Item({
  name: "Hit the + to add the tasks"
});
const item4 = new Item({
  name: "Hit the checkbox to remove tasks"
});

const defaultItems = [item1, item2, item3 , item4];

const listSchema = {
  name: String,
  items: [itemSchema]
}
const List = mongoose.model("List", listSchema)

const homeStartingContent =
"This is a space where you can store any of your personal thoughts or sensitive information . This information is password protected so it is safe to open up your heart here 💓 . You are make this as your personal diary where you can store your memories to reminisce later in your life . To begin , click on the 'Add' button in the navbar and pour your heart out"

mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String,
  });
  
  userSchema.plugin(PLM);

  // Making mongoose models based on above defined schemas
  
  const User = new mongoose.model("User", userSchema);
  
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
const postSchema = {
  title: String,
  content: String,
};

const Post = mongoose.model("Post", postSchema);

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Coding the get and post requests for various EJS templates

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
app.get("/home_ps", function (req, res) {
  Post.find({}, function (err, foundPost) {
    console.log(foundPost);

    // Loads the Homepage for Personal Space by embeddin the starting Content into the EJS templates 

    res.render("PS/home_ps", {
      homeContent: homeStartingContent,
      newPost: foundPost,
    });
  });
});

app.get("/about", function (req, res) {
  res.render("PS/about_ps", { AboutContent: aboutContent });
});


app.get("/compose", function (req, res) {
  res.render("PS/compose_ps");
});

app.get("/webpage", function (req, res) {
  res.render("webpage");
});

app.get("/about_task", function (req, res) {
  res.render("task/about_task");
});


app.get("/posts/:topic", function (req, res) {
  // This block of code looks for a particular topic and if it is present in the Database , then it loads the page else it throws an error 
  let topic = req.params.topic;
  Post.findOne({ title: topic }, function (err, foundPost) {
    if (!err) {
      res.render("PS/post_ps", { title: foundPost.title, body: foundPost.content });
    } else {
      res.render("PS/post_ps", {
        title: "Error 404 ",
        body: "File Not Found , Please try another name",
      });
    }
  });
});

app.get("/home_task", function (req, res) {
  Item.find({}, function (err, foundItems) {
      if (foundItems.length == 0) {
        // If there are no more tasks present , then it refreshes the page with the default taks 
          Item.insertMany(defaultItems, function (err) { });
          res.redirect("home_task")

      }
      else {
        // Else it returns the pending tasks             
          res.render('task/list_task', { listTitle: "Today", newListItems: foundItems });
      }
  })

  app.get("/home_task:customListName", function (req, res) {
      const CLname = req.params.customListName;
      List.findOne({ name: CLname }, function (err, foundList) {
          if (!err) {
              if (!foundList) {
                  // Create a new List 
                  const list = new List({
                      name: CLname,
                      items: defaultItems
                  });

                  list.save();
                  res.redirect("home_task" + CLname)

              }
              else {
                  // Show existing list 
                  res.render('task/list_task', { listTitle: CLname, newListItems: foundList.items });
              }
          }
      })




  })
})

// Coding the post requests for various EJS templates


app.post("/home_ps", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  // Saves the post and returns to the homepage
  post.save();
  res.redirect("home_ps");
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  // Look for a user in the database . If found then it allows the user to enter , else it throws an err
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req,res , function() {
        res.redirect("webpage");
      });
    }
  });
});

app.post("/register", function (req, res) {
  // Registers the new users into the Database
  User.register(
    {
      username: req.body.username,
    },
    req.body.password,
    function (err, User) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/login");
        });
      }
    }
  );
});

app.post("/home_task", function (req, res) {

  const itemName = req.body.newItem
  const listName = req.body.list
  console.log(listName)

  const item = new Item({
      name: itemName
  })

  if (listName == "Today") {

      item.save()
      res.redirect('home_task')
  }
  else {
      List.findOne({ name: listName }, function (err, foundList) {
          foundList.items.push(item);
          foundList.save();
          res.redirect("home_task" + listName)
      })
  }
})

app.post("/delete", function (req, res) {

  // Removes and deletes the entry of the selected task from the database and returns to the homepage of task schedular
  const removeId = req.body.checkbox;
  const removeName = req.body.listName;
  if (removeName == "Today") {
      Item.findByIdAndRemove(removeId, function (err) {

          console.log("Delection was a Success")
          res.redirect("home_task")
      })
  }
  else {
      List.findOneandUpdate({ name: removeName }, { $pull: { items: { _id: removeId } } }, function (err, result) {
          if (!err) {
              res.redirect("task/home_task" + removeName)
          }
      })
  }


})

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});