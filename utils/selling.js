const fs = require('fs');
const pool = require('./db');

const { body, validationResult, check } = require('express-validator');

// load data produk
const loadListProduct = async (req, res) => {
    const query = await pool.query('SELECT * FROM part')
    const product = query.rows;
    res.render('sales/list-product', {
        title: 'Laman Product',
        layout: 'layout/main-layout',
        product,
        msg: req.flash('msg'),
        msg2: req.flash('msg2'),
        role: req.user.role
    });
    return product;
};

// load data penjualan
const loadSelling = async (req, res) => {
    const query = await pool.query('SELECT * FROM invoice')
    const product = query.rows;
    res.render('sales/list-selling', {
        title: 'Laman List Selling',
        layout: 'layout/main-layout',
        product,
        msg: req.flash('msg'),
        msg2: req.flash('msg2'),
        role: req.user.role
    });
    return product;
};

// menampilkan cart detail produk yang dipilih
const cartProduct = async (req, res) => {
    console.log(req.body);
    const query = (await pool.query(`SELECT * FROM part`)).rows
    let product = []
    let quantity = []
    if (Array.isArray(req.body.part_id)) {
        req.body.part_id.forEach((barang,i=0) => {
            product.push(query.find(barang2 => barang2.part_id == barang));
            quantity.push(req.body.stock[i])
            i++
        });

    } else {
        product.push(query.find(barang => barang.part_id == req.body.part_id));
        quantity.push(req.body.stock)
    }
    console.log('/', product);

    if (!product) {
        console.log((`${part_id} tidak ditemukan`));
        req.flash('msg2', 'Data tidak ditemukan!')
        res.redirect('sales/list-product')
        return false;
    } else {
        console.log(product.part_id);
        console.log(product.brand);
        console.log(product.part_for);
        console.log(quantity);
        res.render('sales/cart-product', {
            title: 'Laman Cart',
            layout: 'layout/main-layout',
            product,
            quantity,
            id: JSON.stringify(req.body.part_id),
            stock: JSON.stringify(req.body.stock),
            role: req.user.role
        })
    }
    return product;
}

// beli produk
const buyProduct = async (req, res) => {
    // console.log(errors); 
    const id = JSON.parse(req.body.id)
    const stock = JSON.parse(req.body.stock)


    let product = []
    let newStock = []
    let total = 0
    const query = (await pool.query('SELECT * FROM part')).rows
    if (Array.isArray(id)) {
        id.forEach((barang, i = 0) => {
            total += parseInt(query.find(invoice => invoice.part_id == barang).price) * parseInt(stock[i])
            product.push(query.find(invoice => invoice.part_id == barang))
            newStock.push(stock[i])
            i++
        });
    } else {
        total += parseInt(query.find(invoice => invoice.part_id == id).price) * parseInt(stock)
        product.push(query.find(invoice => invoice.part_id == id))
        newStock.push(stock)
    }
   
    console.log(newStock);

    const lastId = await pool.query(`
    SELECT MAX(trans_id) AS id FROM public.invoice`)

    let link
    if (lastId.rows[0].id == null) {
        link = 0
    } else {
        link = parseInt(lastId.rows[0].id) + 1
    }

    await pool.query(`INSERT INTO invoice(
    part_id, total, quantity)
    VALUES ( '${JSON.stringify(product)}','${total}','${JSON.stringify(newStock)}');`)
    req.flash('msg', 'Product berhasil dibeli!')

    res.redirect(`/sales/invoice/${link}`)
}

// invoice
const invoice =
    async (req, res) => {
        const db = await pool.query(
            `SELECT trans_id, date_trans, part_id, total, quantity
	FROM public.invoice;`
        )
        const result = db.rows.find(barang => barang.trans_id == req.params.id)
        const product = JSON.parse(result.part_id)
        const quantity = JSON.parse(result.quantity)


        res.render('sales/invoice', {
            title: 'Laman Product',
            layout: 'layout/main-layout',
            result,
            product,
            quantity,
            role: req.user.role
        })
    }

module.exports = { loadListProduct, cartProduct, buyProduct, invoice, loadSelling };