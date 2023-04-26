const express = require("express");
const app = express();
const DB=`mongodb+srv://Hariomojha1711:Hariom1711@cluster0.c0pfwpt.mongodb.net/?retryWrites=true&w=majority`


const PORT = process.env.PORT_ONE || 9090;
const mongoose = require("mongoose");
const cors = require('cors')
const Order = require("./Order");
const amqp = require("amqplib");
const isAuthenticated = require("../isAuthenticated");

var channel, connection;

mongoose.connect(DB,{
    // useCreateIndex:true,
    // useFindAndModify:false,
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    try{
        console.log("Order-Service connection start");
    }
    catch(e){
        console.log("error:",e)
    }
})

app.use(cors());
app.use(express.json());

function createOrder(products, userEmail) {
    let total = 0;
    for (let t = 0; t < products.length; ++t) {
        total += products[t].price;
    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price: total,
    });
    newOrder.save();
    return newOrder;
}

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
}
connect().then(() => {
    channel.consume("ORDER", (data) => {
        console.log("Consuming ORDER service");
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = createOrder(products, userEmail);
        channel.ack(data);
        channel.sendToQueue(
            "PRODUCT",
            Buffer.from(JSON.stringify({ newOrder }))
        );
    });
});

app.listen(PORT, () => {
    console.log(`Order-Service at ${PORT}`);
});