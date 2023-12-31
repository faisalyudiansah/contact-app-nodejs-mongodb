const express = require('express')
const router = express.Router()
const {
    allContacts,
    findContactByName,
    addContact,
    checkValidationName,
    checkValidationEmail,
    checkValidationPhoneNumber,
    deleteContact,
    validationPasswordEmail,
    updateContact,
} = require('../utils/contacts');
const { body, validationResult, check } = require('express-validator')

router.get('/', (req, res) => {
    res.render('home', { layout: 'layouts/main-layout' })
})

router.get('/contacts', (req, res) => {
    let contacts = allContacts()
    res.render('contacts', {
        layout: 'layouts/main-layout',
        contacts,
        msgSuccess: req.flash('msgSuccess'),
        msgError: req.flash('msgError')
    })
})

router.get('/detail-contact', (req, res) => {
    const { name } = req.query
    let contact = findContactByName(name)
    res.render('detail-contact', { layout: 'layouts/main-layout', contact })
})

router.get('/add-contact', (req, res) => {
    let { errors } = req.query
    res.render('add-contact', { layout: 'layouts/main-layout', errors })
})

router.post(
    '/add-contact',
    body('name', 'Name is required').notEmpty(),
    body('phoneNumber', 'Phone Number is required').notEmpty(),
    body('email', 'E-mail is required').notEmpty(),
    body('name').custom((value) => {
        const validationName = checkValidationName(value)
        if (validationName) {
            throw new Error('Name already exists')
        }
        return true
    }),
    body('phoneNumber').custom((value) => {
        const validationPhoneNumber = checkValidationPhoneNumber(value)
        if (validationPhoneNumber) {
            throw new Error('Phone Number already exists')
        }
        return true
    }),
    body('email').custom((value) => {
        const validationEmail = checkValidationEmail(value)
        if (validationEmail) {
            throw new Error('E-mail already exists')
        }
        return true
    }),
    check('email', 'Email Invalid').isEmail(),
    check('phoneNumber', 'Phone Number Invalid').isMobilePhone('id-ID'),
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            let errorMsg = errors.array().map(el => {
                return el.msg
            })
            return res.redirect(`/add-contact?errors=${errorMsg}`)
        }
        let { name, phoneNumber, email } = req.body
        addContact({ name, phoneNumber, email })
        req.flash('msgSuccess', 'Contact added successfully!')
        res.redirect('/contacts')
    })

router.get('/delete-contact', (req, res) => {
    const { name } = req.query
    let findContact = findContactByName(name)
    if (!findContact) {
        req.flash('msgError', 'Request Invalid')
        return res.redirect('/contacts')
    }
    deleteContact(name)
    req.flash('msgSuccess', 'Contact successfully deleted')
    return res.redirect('/contacts')
})

router.get('/edit-contact', (req, res) => {
    const { name, errors } = req.query
    let findContact = findContactByName(name)
    if (!findContact) {
        req.flash('msgError', 'Request Invalid')
        return res.redirect('/contacts')
    }
    res.render('edit-contact', { layout: 'layouts/main-layout', findContact, errors })
})

router.post(
    '/edit-contact',
    body('name', 'Name is required').notEmpty(),
    body('phoneNumber', 'Phone Number is required').notEmpty(),
    body('email', 'E-mail is required').notEmpty(),
    body('name').custom((value, {req}) => {
        const validationName = checkValidationName(value)
        if (value !== req.query.nameToUpdate && validationName) {
            throw new Error('Name already exists')
        }
        return true
    }),
    check('email', 'Email Invalid').isEmail(),
    check('phoneNumber', 'Phone Number Invalid').isMobilePhone('id-ID'),
    (req, res) => {
        const { nameToUpdate } = req.query
        let findContact = findContactByName(nameToUpdate)
        if (!findContact) {
            req.flash('msgError', 'Request Invalid')
            return res.redirect('/contacts')
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            let errorMsg = errors.array().map(el => {
                return el.msg
            })
            return res.redirect(`/edit-contact?name=${nameToUpdate}&errors=${errorMsg}`)
        }

        let { name, phoneNumber, email } = req.body
        let checkValidation = validationPasswordEmail({ name, phoneNumber, email })
        if(checkValidation){
            return res.redirect(`/edit-contact?name=${nameToUpdate}&errors=${checkValidation}`)
        }
        updateContact({ name, phoneNumber, email }, nameToUpdate)
        req.flash('msgSuccess', 'Contact has been updated')
        return res.redirect('/contacts')
    })

router.get('/about', (req, res) => {
    res.render('about', { layout: 'layouts/main-layout' })
})

module.exports = router