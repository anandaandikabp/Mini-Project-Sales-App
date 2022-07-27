const fs = require('fs');
const pool = require('./db');

const { body, validationResult, check } = require('express-validator');

// load data produk
const loadProduct = async (req, res) => {
    const query = await pool.query('SELECT * FROM part')
    const product = query.rows;
    res.render('product/list-product', {
        title: 'Laman Product',
        layout: 'layout/main-layout',
        product,
        msg: req.flash('msg'),
        msg2: req.flash('msg2'),
        role: req.user.role
    });
    return product;
};

// menampilkan detail produk yang dicari
const detailProduct = async (req, res) => {
    const query = await pool.query(`SELECT * FROM part WHERE part_id = '${req.params.part_id}'`)
    const product = query.rows[0];
    if (!product) {
        console.log((`${part_id} tidak ditemukan`));
        req.flash('msg2', 'Data tidak ditemukan!')
        res.redirect('/product')
        return false;
    } else {
        console.log(product.part_id);
        console.log(product.brand);
        console.log(product.part_for);
        console.log(product.price);
        console.log(product.image);
        console.log(product.stock);
        res.render('product/detail-product', {
            title: 'Laman Detail',
            layout: 'layout/main-layout',
            product,
            role: req.user.role
        })    
    }
    return product;
}

// tambah data produk
const addProduct = async (req, res) => {
    const errors = validationResult(req);
    console.log(errors); 
    if (!errors.isEmpty()) {
        res.render('product/add-product', {
            title: 'Laman Tambah Product',
            layout: 'layout/main-layout',
            errors: errors.array(),
            role: req.user.role
        })
    } else {
        const { brand, part_for, price, stock } = req.body 
        const img = req.files[0].filename
        await pool.query(`INSERT INTO part(
	    brand, part_for, price, image, stock)
	    VALUES ('${brand}', '${part_for}', '${price}', '${img}', '${stock}');`)
        req.flash('msg', 'Data berhasil ditambahkan!')
        res.redirect('/product/list-product')
        console.log(errors)
    }
}

// edit produk yang dicari
const editProduct = async (req, res) => {
    const query = await pool.query(`SELECT * FROM part WHERE part_id = '${req.params.part_id}'`)
    const product = query.rows[0];
    res.render('product/edit-product', {
        title: 'Laman Edit product',
        layout: 'layout/main-layout',
        product,
        role: req.user.role
    });
}

// update produk yang dicari
const updateProduct = async (req, res) => {
    const errors = validationResult(req);
    console.log(errors); 
    const { part_id, brand, part_for, price, stock } = req.body
    if (!errors.isEmpty()) {
        res.render('product/edit-product', {
            title: 'Edit Product',
            layout: 'layout/main-layout',
            errors: errors.array(),
            product: req.body,
            role: req.user.role
        })
    } else {
        console.log(req.body);
        // updateContact(req.body)
        await pool.query(`UPDATE part
        SET brand='${brand}', part_for='${part_for}', price=${price}, stock=${stock}
        WHERE part_id=${part_id}`)
        req.flash('msg', 'Data berhasil diupdate!')
        res.redirect('/product/list-product')
    }
}

// hapus data
const hapusProduct = async (req, res) => {
    const query = await pool.query(`SELECT * FROM part WHERE part_id = '${req.params.part_id}'`)
    const product = query.rows[0];
    if (!product) {
        res.status(404);
        res.send('<h1>404</h1>')
    } else {
        fs.unlinkSync(`./public/img/${product.image}`)
        const query = await pool.query(`DELETE FROM part WHERE part_id = '${req.params.part_id}'`)
        req.flash('msg', 'Data berhasil dihapus!')
        res.redirect('/product/list-product');
    }
    
};

module.exports = { loadProduct, detailProduct, addProduct, hapusProduct, editProduct, updateProduct };