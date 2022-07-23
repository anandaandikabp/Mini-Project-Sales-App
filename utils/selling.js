const fs = require('fs');
const pool = require('./db');

const { body, validationResult, check } = require('express-validator');

// load data selling produk
const loadListProduct = async (req, res) => {
    const query = await pool.query('SELECT * FROM part')
    const product = query.rows;
    res.render('sales/list-product', {
        title: 'Laman Product',
        layout: 'layout/main-layout',
        product,
        msg: req.flash('msg'),
        msg2: req.flash('msg2'),
    });
    return product;
};

// menampilkan detail produk yang dicari
const detailSalesProduct = async (req, res) => {
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
        res.render('sales/detail-selling-product', {
            title: 'Laman Detail',
            layout: 'layout/main-layout',
            product,
        })    
    }
    return product;
}

// menampilkan cart detail produk yang dicari
const cartProduct = async (req, res) => {
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
        res.render('sales/cart-product', {
            title: 'Laman Detail',
            layout: 'layout/main-layout',
            product,
        })    
    }
    return product;
}

// // tambah data produk
// const addProduct = async (req, res) => {
//     const errors = validationResult(req);
//     console.log(errors); 
//     if (!errors.isEmpty()) {
//         res.render('product/add-product', {
//             title: 'Laman Tambah Product',
//             layout: 'layout/main-layout',
//             errors: errors.array(),
//         })
//     } else {
//         const { part_id, brand, part_for, price } = req.body 
//         const img = req.files[0].filename
//         await pool.query(`INSERT INTO part(
// 	    part_id, brand, part_for, price, image)
// 	    VALUES ('${part_id}', '${brand}', '${part_for}', '${price}', '${img}');`)
//         req.flash('msg', 'Data berhasil ditambahkan!')
//         res.redirect('/product/list-product')
//         console.log(errors)
//     }
// }

// // edit produk yang dicari
// const editProduct = async (req, res) => {
//     const query = await pool.query(`SELECT * FROM part WHERE part_id = '${req.params.part_id}'`)
//     const product = query.rows[0];
//     res.render('product/edit-product', {
//         title: 'Laman Edit product',
//         layout: 'layout/main-layout',
//         product,
//     });
// }

// // update produk yang dicari
// const updateProduct = async (req, res) => {
//     const errors = validationResult(req);
//     console.log(errors); 
//     const { part_id, brand, part_for, price } = req.body
//     if (!errors.isEmpty()) {
//         res.render('product/edit-product', {
//             title: 'Edit Product',
//             layout: 'layout/main-layout',
//             errors: errors.array(),
//             product: req.body
//         })
//     } else {
//         console.log(req.body);
//         // updateContact(req.body)
//         await pool.query(`UPDATE part
//         SET brand='${brand}', part_for='${part_for}', price=${price}
//         WHERE part_id=${part_id}`)
//         req.flash('msg', 'Data berhasil diupdate!')
//         res.redirect('/product/list-product')
//     }
// }

// // hapus data
// const hapusProduct = async (req, res) => {
//     const query = await pool.query(`SELECT * FROM part WHERE part_id = '${req.params.part_id}'`)
//     const product = query.rows[0];
//     if (!product) {
//         res.status(404);
//         res.send('<h1>404</h1>')
//     } else {
//         fs.unlinkSync(`./public/img/${product.image}`)
//         const query = await pool.query(`DELETE FROM part WHERE part_id = '${req.params.part_id}'`)
//         req.flash('msg', 'Data berhasil dihapus!')
//         res.redirect('/product/list-product');
//     }
    
// };

module.exports = { loadListProduct, detailSalesProduct, cartProduct };
//, , addProduct, hapusProduct, editProduct, updateProduct