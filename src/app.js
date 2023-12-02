require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const register = require("./models/registers");
require("./db/conn");
const port = process.env.PORT || 8000;
const publicFolder = path.join(__dirname, "../public");
const templatesFolder = path.join(__dirname, "../templates/views");
const partialsFolder = path.join(__dirname, "../templates/partials");


app.use(express.static(publicFolder));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set("view engine", "hbs")
app.set("views", templatesFolder);
hbs.registerPartials(partialsFolder);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){
            const registerEmployee = new register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            });

            const token = await registerEmployee.generateAuthToken();

            const empReg = await registerEmployee.save();
            res.status(201).render("index");
        }else{
            res.send("Password are not matching");
        }

    } catch (error) {
        res.status(400).send(error)
    }
});

app.post("/login", async (req, res) => {
      
    try {
        
        const email = req.body.login_email;
        const password = req.body.login_password;

        const empDetails = await register.findOne({email});
        const isMatch = await bcrypt.compare(password, empDetails.password);

        const token = await empDetails.generateAuthToken();

        if(isMatch){
            res.status(201).render("index");
        }else{
            res.status(400).send("Invalid credentials");
        }

    } catch (error) {
        res.status(400).send("Invalid credentials");
    }

});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})