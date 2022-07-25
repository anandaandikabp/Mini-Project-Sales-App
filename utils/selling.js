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

// menampilkan cart detail produk yang dipilih
const cartProduct = async (req, res) => {
    const query = (await pool.query(`SELECT * FROM part`)).rows
    let product = []
    if (Array.isArray(req.body.part_id)) {
        req.body.part_id.forEach(e => {
            product.push(query.find(d => d.part_id == e));
        });

    }else{
        product.push(query.find(e => e.part_id == req.body.part_id));
    }
    console.log('/',product);

    if (!product) {
        console.log((`${part_id} tidak ditemukan`));
        msg3: req.flash('msg'),
        req.flash('msg2', 'Data tidak ditemukan!')
        res.redirect('/product')
        return false;
    } else {
        console.log(product.part_id);
        console.log(product.brand);
        console.log(product.part_for);
        console.log(product.price);
        res.render('sales/cart-product', {
            title: 'Laman Cart',
            layout: 'layout/main-layout',
            product,
        })    
    }
    return product;
}

// tambah data produk
const buyProduct = async (req, res) => {
    console.log(errors); 
    if (!errors.isEmpty()) {
        res.render('sales/list-product', {
            title: 'Laman List Product',
            layout: 'layout/main-layout',
            errors: errors.array(),
        })
    } else {
        const { transc_id, cus_id, part_id, date_trans, total } = req.body 
        await pool.query(`INSERT INTO invoice(
	    transc_id, cus_id, part_id, date_trans, total)
	    VALUES ('${transc_id}', '${cus_id}', '${part_id}', 'dateNow()', '${total}');`)
        req.flash('msg', 'Product berhasil dibeli!')
        res.redirect('/sales/list-product')
        console.log(errors)
    }
}

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

module.exports = { loadListProduct, cartProduct, buyProduct };
//, , addProduct, hapusProduct, editProduct, updateProduct