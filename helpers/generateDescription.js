function generateDescription(paymentAmt) {
    let description = "The Amount of " + " " + paymentAmt + " " + "Has been Added to You're CraftX Wallet";
    return description;
}

module.exports = { generateDescription }