const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check } = require('express-validator');
const app = express();
const path = require('path');
const port = 3000;
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session');
const multer = require('multer'); 3
const passport = require('passport');
const initializePassport = require("./utils/passportConfig");

initializePassport(passport);

const { loadProduct, detailProduct, hapusProduct, addProduct, editProduct, updateProduct } = require('./utils/product');
const { loadCustomer, detailCustomer, addCustomer, hapusCustomer, editCustomer, updateCustomer, addCustomerAdmin } = require('./utils/customer');
const { loadListProduct, cartProduct, buyProduct, invoice, loadSelling } = require('./utils/selling');
const { resourceLimits } = require('worker_threads');

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

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());


// built in middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// 3rd party middleware
const log = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' })
app.use(morgan('combined', { stream: log }));

app.use(cookieParser('secret'))
app.use(flash());

app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// login
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index', {
        title: 'Laman login',
        layout: 'layout/login-layout',
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
})
);

// logout
app.get('/logout', (req, res) => {
    req.logOut(
        function (err) {
            if (err) {
                return next(err)
            }
            req.flash('success_msg', "telah keluar");
            res.redirect('/');
        }
    );

});

// home
app.get('/home', checkNotAuthenticated, (req, res) => {
    console.log(req.user);
    res.render('home',
        {
            title: 'Sales App Auto Car',
            layout: 'layout/main-layout',
            role: req.user.role
        });
});

// get register
app.get('/register', checkAuthenticated, (req, res) => {
    res.render('register', {
        title: 'Laman register',
        layout: 'layout/login-layout',
    });
});

// register
app.post('/register', [
    check('email', 'Email tidak valid').isEmail(),
    check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
], addCustomer);

//                                                      ADMIN
// get register by admin
app.get('/register-admin', (req, res) => {
    res.render('register-admin', {
        title: 'Laman register',
        layout: 'layout/login-layout',
    });
});

// register by admin
app.post('/register-admin', [
    check('email', 'Email tidak valid').isEmail(),
    check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
], addCustomerAdmin);

//                                                      AKHIR ADMIN

//                                                      PRODUK

// list semua produk
app.get('/product/list-product', checkNotAuthenticated, adminRole, loadProduct);

// tambah data produk
app.get('/product/add-product', (req, res) => {
    res.render('product/add-product', {
        title: 'Laman Tambah Product',
        layout: 'layout/main-layout',
        role: req.user.role
    });
})

// detail produk
app.get('/product/detail-product/:part_id', checkNotAuthenticated, detailProduct);

// proses input data dengan validator produk
app.post('/product', upload.array('image', 1), adminRole, addProduct)

// get data produk yg mau diedit
app.get('/product/edit/:part_id', checkNotAuthenticated, editProduct);

// proses edit produk
app.post('/product/update', adminRole, updateProduct);

// hapus produk
app.get('/product/delete/:part_id', checkNotAuthenticated, hapusProduct);

//                                                      AKHIR PRODUK

//                                                      CUSTOMER

// list semua customer
app.get('/customer/list-customer', checkNotAuthenticated, superAdminRole, loadCustomer);

// detail customer
app.get('/customer/detail-customer/:cus_id', checkNotAuthenticated, detailCustomer);

// get data customer yg mau diedit
app.get('/customer/edit/:cus_id', editCustomer);

//  proses edit customer
app.post('/customer/update', [
    check('email', 'Email tidak valid').isEmail(),
    check('mobile', 'Nomor tidak valid').isMobilePhone('id-ID')
], updateCustomer)

// hapus customer
app.get('/customer/delete/:cus_id', hapusCustomer);

// //                                                      AKHIR CUSTOMER

//                                                      SELLING

// list semua product
app.get('/sales/list-product', checkNotAuthenticated, userRole, loadListProduct);

// list semua penjualan
app.get('/sales/list-selling', checkNotAuthenticated, adminRole, loadSelling);

// detail produk sales
app.post('/sales/cart-product', checkNotAuthenticated, cartProduct);

// proses pembelian cart produk
app.post('/sales/invoice', checkNotAuthenticated, buyProduct)

// tampil invoice
app.get('/sales/invoice/:id', checkNotAuthenticated, invoice);

// //                                                      AKHIR SELLING


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/home')
    }
    next()
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/');
}

// cek role super admin
function superAdminRole(req, res, next) {
    if (req.user !== undefined) {
        if (req.user.role == 1) {
            return next()
        }
    }
    return res.redirect('/');
}

// cek role admin
function adminRole(req, res, next) {
    if (req.user !== undefined) {
        if (req.user.role == 2) {
            return next()
        }
    }
    return res.redirect('/');
}

// cek role user biasa
function userRole(req, res, next) {
    if (req.user !== undefined) {
        if (req.user.role == 3) {
            return next()
        }
    }
    return res.redirect('/');
}

app.use('/', (req, res) => {
    res.status(404)
    res.send('Not Found 404')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});