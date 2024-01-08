const User = require('../models/userModel');

module.exports.customers_get = async (req,res) => {
    try {
        const allCustomers = await User.find();
        
        if (allCustomers.length === 0) {
            return res.status(404).send("No customers found");
          }

        if (!allCustomers) {
          return res.status(404).send("Couldn't complete the request");
        }
    
        res.render('admin/customers', { message: "Fetch Successful", allCustomers: allCustomers });
        
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
      }
}

//customer block
module.exports.customer_block = async (req,res) => {
    const customerId = req.params.customerId;
    console.log(customerId);
     try {
        const updateStatus = await User.findByIdAndUpdate({_id: customerId}, {$set: {status: false}});
        if(!updateStatus) {
            return res.status(400).send("Status update failed");
        }
        
        res.redirect('/admin/customers');
     } catch (error) {
        console.log(error.message);
        res.status(401).send("Blocking Failed");
    }
}

module.exports.customer_unblock = async (req,res) => {
    const customerId = req.params.customerId;
    
    console.log(customerId);
     try {
        const updateStatus = await User.findByIdAndUpdate({_id: customerId}, {$set: {status: true}});
        if(!updateStatus) {
            return res.status(400).send("Status update failed");
        } 
        res.redirect('/admin/customers');
     } catch (error) {
        console.log(error.message);
        res.status(401).send("Blocking Failed");
    }

}