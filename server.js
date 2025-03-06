const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

mongoose.connect("mongodb://localhost:27017/MongoDB Database Name", { // MongoDB Database Name : MoneyList or Users or Data etc.
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Error in connecting to the Database"));
db.once("open", () => console.log("Connected to Database"));

const expenseSchema = new mongoose.Schema({
    Category: String,
    Amount: Number,
    Info: String,
    Date: String,
});

const Expense = mongoose.model("Expense", expenseSchema);

app.post("/add", async (req, res) => {
    try {
        const { category_select, amount_input, info, date_input } = req.body;

        const existingExpense = await Expense.findOne({
            Category: category_select,
            Amount: parseFloat(amount_input),
            Info: info,
            Date: date_input
        });

        if (existingExpense) {
            return res.status(400).send("Duplicate Entry! Expense already exists.");
        }


        const newExpense = new Expense({
            Category: category_select,
            Amount: parseFloat(amount_input),
            Info: info,
            Date: date_input,
        });

        await newExpense.save();
        console.log("Record Inserted Successfully");

        res.status(201).send("Expense Added Successfully");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Error inserting data");
    }
});


app.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        console.error("Error retrieving data:", err);
        res.status(500).send("Error retrieving data");
    }
});

app.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await Expense.findByIdAndDelete(id);
        res.status(200).send("Expense deleted successfully");
    } catch (err) {
        console.error("Error deleting expense:", err);
        res.status(500).send("Error deleting expense");
    }
});

app.get("/", (req, res) => {
    res.set({ "Allow-access-Allow-Origin": "*" });
    return res.redirect("index.html");
});

app.listen(5000, () => {
    console.log("Listening on port 5000");
});
