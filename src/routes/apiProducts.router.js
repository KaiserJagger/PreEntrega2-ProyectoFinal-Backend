import { Router } from "express";
import { ProductManagerDB } from "../managers/ProductManagerDB.js";

const router = Router();
const prod = new ProductManagerDB();

router.get("/", async (req, res) => {
    let { limit = 10, page = 1, query, sort } = req.query;
    try {
        const productos = await prod.getProducts(limit, page, query, sort);
        res.status(200).send(productos);
    } catch (err) {
        res.status(400).send(err);
    }
});
router.get("/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const foundprod = await prod.getProductById(id);
        res.status(200).send(foundprod);
    } catch (error) {
        res.status(404).send({
            error: "Producto no encontrado",
            servererror: error,
        });
    }
});
router.post("/", async (req, res) => {
    const producto = req.body;
    try {
        const result = await prod.addProduct(producto);
        if (result.error) {
            res.status(400).send(result);
        } else {
            res.status(201).send(result);
        }
    } catch (err) {
        res.status(400).send(err);
    }
});
router.put("/", async (req, res) => {
    const producto = req.body;
    try {
        const result = await prod.updateProduct(producto);
        if (result.error) {
            res.status(400).send(result);
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(400).send(err);
    }
});
router.delete("/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const result = await prod.deleteProduct(id);
        if (result.error) {
            res.status(400).send(result);
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

export default router;
