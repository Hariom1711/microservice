const express = require("express");
const app = express();
const DB=`mongodb+srv://Hariomojha1711:Hariom1711@cluster0.c0pfwpt.mongodb.net/?retryWrites=true&w=majority`
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
const Product = require("./Product");
const jwt = require("jsonwebtoken");
const cors = require('cors')
const amqp = require("amqplib");
const isAuthenticated = require("../isAuthenticated");
var order;

var channel, connection;
app.use(cors());
app.use(express.json());
mongoose.connect(DB,{
    // useCreateIndex:true,
    // useFindAndModify:false,
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    try{
        console.log("Product-Service  connection start");
    }
    catch(e){
        console.log("error:",e)
    }
})

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}
connect();

// create new Product
// Buy a Product


app.post("/product/create", isAuthenticated, async (req, res) => {
    const { name, description, price } = req.body;
    const newProduct = new Product({
        name,
        description,
        price,
    });
    newProduct.save();
    return res.json(newProduct);
});
app.post("/product/buy", isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    channel.sendToQueue(
        "ORDER",
        Buffer.from(
            JSON.stringify({
                products,
                userEmail: req.user.email,
            })
        )
    );
    channel.consume("PRODUCT", (data) => {
        order = JSON.parse(data.content);
    });
    return res.json(order);
});


app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});
