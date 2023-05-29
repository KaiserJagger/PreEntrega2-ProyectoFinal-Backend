import { cartModel } from "../managers/models/cart.model.js";
import { productModel } from "../managers/models/product.model.js";

class CartManagerDB {
    getCarts = async (limit = 10, page = 1, query = "{}", sort) => {
        // verifico si query tiene un formato valido
        const isValidJSON = (query) => {
            try {
                JSON.parse(query);
                return true;
            } catch (e) {
                return false;
            }
        };
        const vquery = isValidJSON ? JSON.parse(query) : {};
        // verifico si sort tiene un formato valido
        const carts = cartModel.paginate(vquery, {
            page,
            limit,
            lean: true,
            sort,
        });
        return carts;
    };
    getCartById = async (cid) => {
        // busco el indice del Carro
        try {
            const cartfound = await cartModel.findOne({ _id: cid }).lean().exec();
            if (cartfound === null) {
                return { error: 2, errortxt: "el carro no existe" };
            }
            return cartfound;
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
    addCart = async () => {
        const products = [];
        const cart = {
            products,
        };
        try {
            const newCart = new cartModel(cart);
            newCart.save();
            return newCart;
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
    addProduct = async ({ cid, pid }) => {
        try {
            const cartfound = await cartModel.findOne({ _id: cid });
            if (cartfound === null) {
                return { error: 2, errortxt: "el carro no existe" };
            }
            const prodexists = await productModel.findOne({ _id: pid });
            if (prodexists === null) {
                return { error: 2, errortxt: "el producto no existe" };
            }
            const prodfound = await cartModel.findOne({
                _id: cid,
                "products.product": pid,
            });
            if (prodfound === null) {
                const addedprod = await cartModel.updateOne(
                    { _id: cid },
                    { $addToSet: { products: { product: pid } } },
                );
                return addedprod;
            } else {
                const updatedprod = await cartModel.updateOne(
                    { _id: cid, "products.product": pid },
                    { $inc: { "products.$.quantity": 1 } },
                );
                return updatedprod;
            }
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
    updateAllProducts = async (cid, products) => {
        console.log(cid, products);
        try {
            const cartfound = await cartModel.findOne({ _id: cid });
            if (cartfound === null) {
                return { error: 2, errortxt: "el carro no existe" };
            }
            const prodids = products.products.map((product) => {
                console.log(product.product)
                return product.product;
            });
            const prodexists = await productModel.find({
                _id: { $in: prodids },
            });
            if (prodexists.length === products.products.length) {
                const updatedProducts = await cartModel.updateOne(
                    { _id: cid },
                    { $set: { products: products.products} },
                );
                return updatedProducts;
            } else {
                return {
                    error: 2,
                    errortxt: "alguno de los productos no existe",
                };
            }
            return prodexists;
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
    updateProductQty = async ({ cid, pid, qty }) => {
        try {
            if (isNaN(qty) || !Number.isInteger(parseFloat(qty)) || qty < 1) {
                return {
                    error: 2,
                    errortxt:
                        "quantity tiene que ser un numero entero mayor que 0",
                };
            }
            const cartfound = await cartModel.findOne({ _id: cid });
            if (cartfound === null) {
                return { error: 2, errortxt: "el carro no existe" };
            }
            const prodfound = await cartModel.findOne({
                _id: cid,
                "products.product": pid,
            });
            if (prodfound === null) {
                return {
                    error: 2,
                    errortxt: "el producto no esta en el carro",
                };
            } else {
                const updatedprod = await cartModel.updateOne(
                    { _id: cid, "products.product": pid },
                    { $set: { "products.$.quantity": qty } },
                );
                return updatedprod;
            }
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
    deleteAllProducts = async (cid) => {
        console.log(cid);
        try {
            const cartfound = await cartModel.findOne({ _id: cid });
            if (cartfound === null) {
                return { error: 2, errortxt: "el carro no existe" };
            }
            const deletedProducts = await cartModel.updateOne(
                { _id: cid },
                { $set: { products: [] } },
            );
            return deletedProducts;
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
    deleteProduct = async ({ cid, pid }) => {
        try {
            const cartfound = await cartModel.findOne({ _id: cid });
            if (cartfound === null) {
                return { error: 2, errortxt: "el carro no existe" };
            }
            const prodfound = await cartModel.findOne({
                _id: cid,
                "products.product": pid,
            });
            if (prodfound === null) {
                return {
                    error: 2,
                    errortxt: "el producto no esta en el carro",
                };
            } else {
                const updatedprods = await cartModel.updateOne(
                    { _id: cid },
                    { $pull: { products: { product: pid } } },
                );
                return updatedprods;
            }
        } catch (error) {
            return { error: 3, servererror: error };
        }
    };
}

export { CartManagerDB };
