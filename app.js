const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check } = require('express-validator');
const app = express();
const path = require('path');
const port = 3000;
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const multer = require('multer');
const pool = require('./utils/db');
const { loadProduct, detailProduct, hapusProduct, addProduct, editProduct, updateProduct } = require('./utils/product');
const { loadCustomer, detailCustomer, addCustomer, hapusCustomer, editCustomer, updateCustomer } = require('./utils/customer');
const { loadListProduct, detailSalesProduct, cartProduct } = require('./utils/selling');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, `image-${Date.now()}` + path.extname(file.originalname))
        //path.extname get the uploaded file extension
    }
})

const upload = multer({ storage: storage })

app.set('view engine', 'ejs');
app.use(expressLayouts);

// middleware
app.use((req, res, next) => {
    console.log('Time:', Date.now())
    next()
})

// built in middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// 3rd party middleware
app.use(morgan('dev'));
app.use(cookieParser('secret'))
app.use(flash());

app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// index
app.get('/', (req, res, next) => {
    res.render('index',
        {
            title: 'Sales App Auto Car',
            layout: 'layout/main-layout',
        });
});

// login
app.get('/login', (req, res, next) => {
    res.render('login', {
        title: 'Laman login',
        layout: 'layout/main-layout',
    });
});

// about
app.get('/about', (req, res, next) => {
    res.render('about', {
        title: 'Laman About',
        layout: 'layout/main-layout',
    });
});


//                                                      PRODUK

// list semua produk
app.get('/product/list-product', loadProduct);

// tambah data produk
app.get('/product/add-product', (req, res) => {
    res.render('product/add-product', {
        title: 'Laman Tambah Product',
        layout: 'layout/main-layout',
    });
})

// detail produk
app.get('/product/detail-product/:part_id', detailProduct);

// proses input data dengan validator produk
app.post('/product', upload.array('image', 1), addProduct)

// get data produk yg mau diedit
app.get('/product/edit/:part_id', editProduct);

// proses edit produk
app.post('/product/update', updateProduct);

// hapus produk
app.get('/product/delete/:part_id', hapusProduct);

//                                                      AKHIR PRODUK

//                                                      CUSTOMER

// list semua customer
app.get('/customer/list-customer', loadCustomer);

// tambah data customer
app.get('/customer/add-customer', (req, res) => {
    res.render('customer/add-customer', {
        title: 'Laman Tambah Customer',
        layout: 'layout/main-layout',
    });
})

// detail customer
app.get('/customer/detail-customer/:cus_id', detailCustomer);

// proses input data dengan validator customer
app.post('/customer', [check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
], addCustomer)

// get data customer yg mau diedit
app.get('/customer/edit/:cus_id', editCustomer);

//  proses edit customer
app.post('/customer/update', [
    check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
], updateCustomer)

// hapus customer
app.get('/customer/delete/:cus_id', hapusCustomer);

// //                                                      AKHIR CUSTOMER

//                                                      SELLING

// list semua product
app.get('/sales/list-product', loadListProduct);

// // tambah data customer
// app.get('/customer/add-customer', (req, res) => {
//     res.render('customer/add-customer', {
//         title: 'Laman Tambah Customer',
//         layout: 'layout/main-layout',
//     });
// })

// detail produk sales
app.get('/sales/cart-product/:part_id', cartProduct);

// // proses input data dengan validator customer
// app.post('/customer', [
//     body('cus_id').custom(async (value) => {
//         const query = await pool.query(`SELECT * FROM customer WHERE cus_id = ${value}`)
//         const duplikat = query.rows[0];
//         if (duplikat) {
//             throw new Error('ID sudah digunakan!')
//         }
//         return true;
//     }),
//     check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
// ], addCustomer)

// // get data customer yg mau diedit
// app.get('/customer/edit/:cus_id', editCustomer);

// //  proses edit customer
// app.post('/customer/update', [
//     check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
// ], updateCustomer)

// // hapus customer
// app.get('/customer/delete/:cus_id', hapusCustomer);

// //                                                      AKHIR SELLING

app.use('/', (req, res) => {
    res.status(404)
    res.send('Not Found 404')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});