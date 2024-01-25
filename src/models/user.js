import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrpyt';

const UserSchema = new Schema({
    username: String,
    hashedpassword: String,
});

UserSchema.methods.setPassword = async function(password) {
    const hash = await bcrypt.hash(password, 10);
    this.hashedpassword = hash;
};

UserSchema.methods.checkPassword = async function(password) {
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
};

UserSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);
export default User;