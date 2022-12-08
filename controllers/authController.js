const User = require("../schema/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // path: '/'
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("qr_gen_user", token, cookieOptions);
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.getUser = async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: "data",
  });
};

exports.signUp = async (req, res, next) => {
  const { firstname, lastname, mobile, username, password, passwordConfirm } =
    req.body;

  if (
    !firstname ||
    !lastname ||
    !mobile ||
    !username ||
    !password ||
    !passwordConfirm
  ) {
    return res
      .status(400)
      .json({ status: "Error", message: "Please provide all fields" });
  }

  const duplicateUser = await User.findOne({
    $or: [{ username }, { mobile }],
  });
  if (duplicateUser) {
    return res.status(403).json({
      status: "Error",
      message: "User already exists",
    });
  }

  if (username.length < 5) {
    return res.status(400).json({
      status: "Error",
      message: "username is too short",
    });
  }

  const newUser = await User.create({
    username,
    password,
    passwordConfirm,
    firstname,
    lastname,
    mobile,
  });

  createSendToken(newUser, 201, res);
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // 1) Check if email and password exist
  if (!username || !password) {
    return res.status(400).json({
      status: "Error",
      message: "Incomplete credentials",
    });
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({
    username,
  }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(400).json({
      status: "Error",
      message: "Username or Password is incorrect",
    });
  }

  if (user.active === false) {
    return res.status(401).json({
      status: "Error",
      message: "Your account has been suspended",
    });
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
};

exports.authenticated = async (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ status: "Error", message: "Unauthenticated" });

  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
      isAuthenticated: true,
    },
  });
};

exports.protect = async (req, res, next) => {
  // 1) Getting token and check if it's there
  //   console.log(req);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("qr_gen_user")
  ) {
    token = req.headers.authorization.split("=")[1].split(",")[0];
  } else if (req.cookies && req.cookies.qr_gen_user) {
    token = req.cookies.qr_gen_user;
  }

  if (!token) {
    return res.status(401).json({
      status: "Error",
      message: "Session expired, please log in again",
    });
  }
  if (token === null) {
    return res
      .status(401)
      .json({ status: "Error", message: "Cookie / Token Error" });
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .json({ status: "Error", message: "Account deleted!" });
  }

  if (currentUser.active === false) {
    return res
      .status(401)
      .json({ status: "Error", message: "Account has been suspended" });
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
};

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // roles ['admin', 'mod or sec']. role='user'
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You do not have permission to perform this action", 403)
//       );
//     }

//     next();
//   };
// };
