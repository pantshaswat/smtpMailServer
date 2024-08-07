const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dns = require('dns').promises;
const UserModel = require('./models/user.model');
const DomainModel = require('./models/domain.model');
const { sendEmailWithDKIM } = require('./services/email.service');
const { authenticateToken, generateDKIMKeys } = require('./helpers');
const { verifyDKIM, verifySPF, verifyMX, verifyARecord } = require('./verify.dns');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const apiKey = crypto.randomBytes(16).toString('hex');
        const apiSecret = crypto.randomBytes(32).toString('hex');

        const user = new UserModel({
            name,
            email,
            password: hashedPassword,
            apiKey,
            apiSecret
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/domain/add', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const existingDomain = await DomainModel.findOne({ name });
        if (existingDomain) {
            return res.status(400).json({ error: "Domain already exists" });
        }
        const { privateKey, publicKey } = generateDKIMKeys();
        const domain = new DomainModel({
            name,
            user: req.user.id,
            verificationToken: crypto.randomBytes(16).toString('hex'),
            dkimSelector: 'default',
            dkimPrivateKey: privateKey,
            dkimPublicKey: publicKey,
            spfRecord: `v=spf1 include:_spf.yourdomain.com -all`,
            mxRecord: `10 mx.yourdomain.com`,
            aRecord: `your-ip-address`,
        });

        await domain.save();
        res.status(201).json({
            message: "Domain added successfully",
            verificationToken: domain.verificationToken
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/domain/verify/:id', authenticateToken, async (req, res) => {
    try {
        const domain = await DomainModel.findOne({ _id: req.params.id, user: req.user.id });
        if (!domain) {
            return res.status(404).json({ error: "Domain not found" });
        }

        const [dkimVerified, spfVerified, mxVerified, aVerified] = await Promise.all([
            verifyDKIM(domain.name, domain.dkimSelector),
            verifySPF(domain.name),
            verifyMX(domain.name),
            verifyARecord(domain.name)
        ]);

        domain.dkimVerified = dkimVerified;
        domain.spfVerified = spfVerified;
        domain.mxVerified = mxVerified;
        domain.aVerified = aVerified;
        domain.isVerified = dkimVerified && spfVerified && mxVerified && aVerified;

        await domain.save();

        res.json({
            isVerified: domain.isVerified,
            dkimVerified,
            spfVerified,
            mxVerified,
            aVerified
        });
    } catch (error) {
        console.error('Domain verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/smtp/credentials', authenticateToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            host: 'smtp.yourdomain.com',
            port: 587,
            username: user.apiKey,
            password: user.apiSecret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/send-email', authenticateToken, async (req, res) => {
    try {
        const { to, subject, text } = req.body;
        const user = await UserModel.findById(req.user.id);
        const domain = await DomainModel.findOne({ user: req.user.id, isVerified: true });

        if (!domain) {
            return res.status(400).json({ error: "No verified domain found" });
        }

        const info = await sendEmailWithDKIM(
            `noreply@${domain.name}`,
            to,
            subject,
            text,
            domain.name,
            domain.dkimPrivateKey,
            domain.dkimSelector
        );

        res.json({ message: "Email sent successfully", messageId: info.messageId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
