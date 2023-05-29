import { Router } from "express";
import { ProductManager } from "../managers/ProductManager.js";

const router = Router();

const prod = new ProductManager("./src/data/products.json");

router.get("/", async (req, res) => {
    try {
        const products = prod.getProducts();
        res.render("realtimeproducts", { products: products });
    } catch (err) {
        res.status(400).send(err);
    }
});

export default router;
