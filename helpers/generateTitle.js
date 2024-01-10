

function generateTitle(paymentAmt) {
    let title = "RS."+ " " + paymentAmt + " " + "Added to the Wallet!!";
    return title;
}

module.exports = { generateTitle }