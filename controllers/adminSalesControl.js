const Order = require("../models/userOrderModel");
const Product = require('../models/productModel');
const mongoose = require('mongoose')
const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require('path');

module.exports.salesPage_get = async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            {
                $match: {
                    "orderItems": {
                        $elemMatch: { "orderStatus": "delivered" }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userDetails',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productID',
                    foreignField: '_id',
                    as: "productDetails",
                }
            }
        ]);


        if (totalSales) {
            
            totalSales.forEach((detail) => {
                detail.dateFormatted = new Date(detail.orderDate).toLocaleDateString();
            });

            return res.render('admin/salesReport', { totalSales });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.salesInvoice_get = async (req, res) => {
    const orderID = req.query.orderId;
    const productID = req.params.productID;

    try {
        const allDetails = await Order.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderID) }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderPaymentDetails',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productID',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            }
        ]);

        if (allDetails) {
            return res.render('admin/sale-invoice', { allDetails });
        } else {
            return res.status(404).json({ error: "Order not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}




module.exports.salesInvoice_post = async (req, res) => {
    const orderID = req.query.orderId;
    const productID = req.query.productID;

    try {
        const allDetails = await Order.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderID) }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderPaymentDetails',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productID',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            }
        ]);


        const html = fs.readFileSync('./views/pdf/invoice.hbs', "utf8");
        const options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
            header: {
                height: "5mm",
                contents: '<div style="text-align: center;">INVOICE</div>'
            },
        };


        const document = {
            html: html,
            data: {
                allDetails: allDetails,
            },
            path: "./invoice.pdf",
            type: "file",
        };


        pdf.create(document, options).then((data) => {
            const pdfStream = fs.createReadStream("invoice.pdf");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice.pdf`);
            pdfStream.pipe(res);
            console.log("PDF sent as a download");
        }).catch((error) => {
            console.error(error);
            res.status(500).send("Error generating the PDF");
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
