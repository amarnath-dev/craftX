
//function to genearate referal code

function generateReferralCode(length) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const codeArray = [];

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        codeArray.push(characters[randomIndex]);
    }

    return codeArray.join('');
}

module.exports = { generateReferralCode }