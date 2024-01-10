function walletPurchaseTitle(paymentAmt) {
    let title = "RS." + " " + paymentAmt + " " + "has Been Debited";
    return title;
}

module.exports = { walletPurchaseTitle }