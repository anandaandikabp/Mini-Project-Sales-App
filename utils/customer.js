const fs = require('fs');
const pool = require('./db');
const bcrypt = require('bcrypt');

const { body, validationResult, check } = require('express-validator');

// load data kostumer
const loadCustomer = async (req, res) => {
    const query = await pool.query('SELECT * FROM customer')
    const customer = query.rows;
    res.render('customer/list-customer', {
        title: 'Laman Customer',
        layout: 'layout/main-layout',
        customer,
        msg: req.flash('msg'),
        msg2: req.flash('msg2'),
    });
    return customer;
};

// menampilkan detail kostumer yang dicari
const detailCustomer = async (req, res) => {
    const query = await pool.query(`SELECT * FROM customer WHERE cus_id = '${req.params.cus_id}'`)
    const customer = query.rows[0];
    if (!customer) {
        console.log((`${cus_id} tidak ditemukan`));
        req.flash('msg2', 'Data tidak ditemukan!')
        res.redirect('/customer')
        return false;
    } else {
        console.log(customer.cus_id);
        console.log(customer.name);
        res.render('customer/detail-customer', {
            title: 'Laman Detail',
            layout: 'layout/main-layout',
            customer,
        })
    }
    return customer;
}

// tambah data costumer
const addCustomer = async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.render('register', {
            title: 'Laman Registrasi Customer',
            layout: 'layout/main-layout',
            errors: errors.array(),
            customer: req.body,
        })
    } else {
        const { email, name, address, mobile, password, role } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log({
                    email,
                    name,
                    address,
                    mobile,
                    password,
                    role
                });
        console.log(hashedPassword);
        await pool.query(`INSERT INTO customer(
    email, name, address, mobile, password, role)
    VALUES ( '${email}', '${name}', '${address}', ${mobile}, '${hashedPassword}', '${role}');`)
        req.flash('msg_success', 'Data berhasil ditambahkan!')
        res.redirect('/')
        console.log(errors)
    }
}

// edit kontak yang dicari
const editCustomer = async (req, res) => {
    const query = await pool.query(`SELECT * FROM customer WHERE cus_id = '${req.params.cus_id}'`)
    const customer = query.rows[0];
    res.render('customer/edit-customer', {
        title: 'Laman Edit customer',
        layout: 'layout/main-layout',
        customer,
    });
}

// update kontak yang dicari
const updateCustomer = async (req, res) => {
    const errors = validationResult(req);
    const { cus_id, email, name, address, mobile, password } = req.body
    if (!errors.isEmpty()) {
        res.render('customer/edit-customer', {
            title: 'Edit customer',
            layout: 'layout/main-layout',
            errors: errors.array(),
            customer: req.body,
        })
    } else {
        await pool.query(`UPDATE customer SET email = '${email}', name = '${name}', address = '${address}', mobile = ${mobile}, password = '${password}' WHERE cus_id = ${cus_id}`)
        req.flash('msg', 'Data berhasil diupdate!')
        res.redirect('/customer/list-customer')
        console.log(errors)
    }
}

// hapus data
const hapusCustomer = async (req, res) => {
    const query = await pool.query(`SELECT * FROM customer WHERE cus_id = '${req.params.cus_id}'`)
    const customer = query.rows[0];
    if (!customer) {
        res.status(404);
        res.send('<h1>404</h1>')
    } else {
        const query = await pool.query(`DELETE FROM customer WHERE cus_id = '${req.params.cus_id}'`)
        req.flash('msg', 'Data berhasil dihapus!')
        res.redirect('/customer/list-customer');
    }

};

module.exports = { loadCustomer, detailCustomer, addCustomer, hapusCustomer, editCustomer, updateCustomer };