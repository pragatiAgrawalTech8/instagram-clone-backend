import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // 30 din valid rahega token
  });
};

export default generateToken;