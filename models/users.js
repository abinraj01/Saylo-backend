const mongoose = require("mongoose");
const moment = require("moment");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    user_type: { type: Number, required: true, default: 3 },
    profile_pic: { type: String, default: null },
    cover_pic: { type: String, default: null },
    status: { type: Number, required: true, default: 1 },
    timestamp: { type: Number, default: () => moment().unix() },
    added_by: { type: Number, default: 1 },
    updated_on: { type: Number, default: () => moment().unix() },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Users = mongoose.models.users || mongoose.model("users", userSchema);

const formatUser = (userDoc) => {
  if (!userDoc) return false;
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const addUser = async (data) => {
  try {
    const user = await Users.create(data);
    return user._id.toString();
  } catch (error) {
    console.error("Error adding user - ", error);
    return false;
  }
};

const updateUser = async (userId, data) => {
  try {
    const result = await Users.updateOne({ _id: userId }, { $set: data });
    return result.modifiedCount > 0 || result.matchedCount > 0;
  } catch (error) {
    console.error("error updateUser - ", error);
    return false;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({ email, status: 1 });
    return !!user;
  } catch (error) {
    console.error("Error getUserByEmail admin - ", error);
    return false;
  }
};

const getUserById = async (id) => {
  try {
    const user = await Users.findOne({ _id: id, status: { $ne: 0 } }).select("-password");
    return user ? formatUser(user) : false;
  } catch (error) {
    console.error("Error getUserById - ", error);
    return false;
  }
};

const getUserProfile = async (user_id) => {
  try {
    const user = await Users.findOne({ _id: user_id, status: 1 });
    return user ? formatUser(user) : false;
  } catch (error) {
    console.error("Error getUserProfile - ", error);
    return false;
  }
};

const getAllUsers = async () => {
  try {
    const users = await Users.find({ status: { $ne: 0 } }).select("-password");
    return users.map((u) => formatUser(u));
  } catch (error) {
    console.error("Error getAllUsers:", error);
    return false;
  }
};

const deleteUserModel = async (user_id) => {
  try {
    const result = await Users.updateOne(
      { _id: user_id },
      { $set: { status: 0 } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error deleteUser - ", error);
    return false;
  }
};

const userEmailExist = async (email, id = 0) => {
  try {
    const query = { email, status: 1 };
    if (id && id !== 0) {
      query._id = { $ne: id };
    }
    const user = await Users.findOne(query);
    return !!user;
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};

module.exports = {
  Users,
  addUser,
  updateUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  deleteUserModel,
  getUserProfile,
  userEmailExist,
};

