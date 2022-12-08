const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Firstname is required!"],
    },
    lastname: {
      type: String,
      required: [true, "Lastname is required"],
    },
    mobile: {
      type: Number,
      unique: true,
      required: [true, "Mobile number is required"],
    },
    username: {
      type: String,
      required: [true, "Please provide your username"],
      unique: true,
      lowercase: true,
    },
    logo: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    active: {
      type: Boolean,
      default: true,
      select: true,
    },
    qrImage: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({
    active: {
      $ne: false,
    },
  });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
