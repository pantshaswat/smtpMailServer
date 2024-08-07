const dns = require('dns').promises;

async function verifyDKIM(domain, selector) {
    try {
        const dkimRecord = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
        return dkimRecord.length > 0 && dkimRecord[0][0].startsWith('v=DKIM1');
    } catch (error) {
        console.error('DKIM verification error:', error);
        return false;
    }
}

async function verifySPF(domain) {
    try {
        const spfRecord = await dns.resolveTxt(domain);
        return spfRecord.some(record => record[0].startsWith('v=spf1'));
    } catch (error) {
        console.error('SPF verification error:', error);
        return false;
    }
}

async function verifyMX(domain) {
    try {
        const records = await dns.resolveMx(domain);
        return records.length > 0;
    } catch (error) {
        console.error('MX verification error:', error);
        return false;
    }
}

async function verifyARecord(domain) {
    try {
        const records = await dns.resolve4(domain);
        return records.length > 0;
    } catch (error) {
        console.error('A record verification error:', error);
        return false;
    }
}

module.exports = { verifyDKIM, verifySPF, verifyMX, verifyARecord };
