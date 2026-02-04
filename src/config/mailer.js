// const nodemailer = require('nodemailer')
import nodemailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config();

// console.log("process.env.ADMIN_EMAIL", process.env.ADMIN_EMAIL)
// console.log("process.env.ADMIN_EMAIL_PASSWORD", process.env.ADMIN_EMAIL_PASSWORD)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
    },
})

// module.exports = transporter
export default transporter