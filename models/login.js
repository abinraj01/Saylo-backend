const { Users } = require("./users");

const userLogin = async (email) => {
  try {
    const user = await Users.findOne({ email, status: 1 });
    if (!user) return false;
    
    return {
      user_id: user._id.toString(),
      name: user.name,
      password: user.password,
      user_type: user.user_type,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("User Login Error:", error);
    return { error: "Server error" };
  }
};

const checkOldPassword = async (userId) => {
  try {
    const user = await Users.findOne({ _id: userId, status: 1 });
    if (!user) return false;

    return {
      user_id: user._id.toString(),
      name: user.name,
      password: user.password,
      user_type: user.user_type,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("Error occurred during database query:", error);
    return false;
  }
};

module.exports = { userLogin, checkOldPassword };