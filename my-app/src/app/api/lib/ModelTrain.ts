import mongoose from 'mongoose'

const ImageSchema = new mongoose.Schema({
    s3ImageKey :{
        type:String,
    },
    label:{
        type:String
    }
},{_id:false})

const FineTrain = new mongoose.Schema({
    userID:{
        type:String,
    
    },
    productId :{
        type : String,
    },

    image:[ImageSchema]
},{timestamps:true})

// delete mongoose.models.Train;
const Train =  mongoose.models.Train||mongoose.model("Train",FineTrain)

export default Train;