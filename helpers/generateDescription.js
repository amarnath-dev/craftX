

function generateDescription(paymentAmt) {
    let description = "The Amount of " + " " + paymentAmt + " " + "has been Added to You're CraftX Wallet";
    return description;
}

module.exports = { generateDescription }