const mongoose = require("mongoose");
const URL = 'mongodb+srv://rafiur:u1h4Bh8i3anXUzG4@earcadio.mre5e.mongodb.net/earcadio'


const connectDatabase = () =>{
    mongoose.connect(URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((data) =>{
        console.log(`mongodb is connected with server: ${data.connection.host}`);
    })
}

module.exports = connectDatabase