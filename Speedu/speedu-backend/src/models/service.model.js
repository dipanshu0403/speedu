const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        categoryName: String, ///electrician
            // required: true,
        variants: [
            {
                variantName: String,
                // description: String,
                variantPrice: Number 
            }

        ]

        
    },
    { timestamps: true}
);
serviceSchema.post('init',(doc) => {
    if (doc.categoryName){
        doc.categoryName = doc.categoryName.charAt(0).toUpperCase() + doc.categoryName.slice(1);
    }
});
const serviceModel = mongoose.model("service",serviceSchema)

module.exports = serviceModel; 