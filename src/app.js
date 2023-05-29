import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";

import { Server } from "socket.io";

import apiProductsRouter from "./routes/apiProducts.router.js";
import productsRouter from "./routes/products.router.js";
import apiCartsRouter from "./routes/apiCarts.router.js";
import cartsRouter from "./routes/carts.router.js";
import homeRouter from "./routes/home.router.js";
import realTimeProductsRouter from "./routes/realtimeproducts.router.js";
import chatRouter from "./routes/chat.router.js";
import __dirname from "./utils.js";
import { messageModel } from "./managers/models/messageModel.js";

mongoose.set("strictQuery", false);

const app = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", homeRouter);
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use("/realtimeproducts", realTimeProductsRouter);
app.use("/api/products", apiProductsRouter);
app.use("/products", productsRouter);
app.use("/api/carts", apiCartsRouter);
app.use("/carts", cartsRouter);
app.use("/chat", chatRouter);

try {
    await mongoose.connect(
        "mongodb+srv://kaiserjagger10:0cinco0uno@cluster1.iuhzek3.mongodb.net/JaggerStore",
        {
            serverSelectionTimeoutMS: 5000,
        },
    );
    console.log("DB conected");
    const httpServer = app.listen(port, () => {
        console.log("Server corriendo en puerto: " + port);
    });

    const socketServer = new Server(httpServer);

    socketServer.on("connection", (socketClient) => {
        // const prod = new ProductManager("./src/data/products.json");
        console.log("User conected");
        socketClient.on("deleteProd", (prodId) => {
            const result = prod.deleteProduct(prodId);
            if (result.error) {
                socketClient.emit("error", result);
            } else {
                socketServer.emit("products", prod.getProducts());
                socketClient.emit("result", "Producto eliminado");
            }
        });
        socketClient.on("addProd", (product) => {
            const producto = JSON.parse(product);
            const result = productsRouter.addProduct(producto);
            if (result.error) {
                socketClient.emit("error", result);
            } else {
                socketServer.emit("products", prod.getProducts());
                socketClient.emit("result", "Producto agregado");
            }
        });
        socketClient.on("newMessage", async (message) => {
            try {
                console.log(message);
                let newMessage = await messageModel.create({
                    user: message.email.value,
                    message: message.message,
                });
                console.log("app", newMessage);
                socketServer.emit("emitMessage", newMessage);
            } catch (error) {
                console.log(error);
                socketClient.emit("error", error);
            }
        });
    });
} catch (error) {
    console.log(error);
}
