const express = require("express");
const app = express.Router();
const { check, validationResult } = require("express-validator");
const db = require("../config/connectDB");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(express.urlencoded());

const loginValidator = [
  check("email")
    .exists()
    .withMessage("Vui lòng nhập email người dùng")
    .notEmpty()
    .withMessage("Không được để trống email người dùng")
    .isEmail()
    .withMessage("Đây không phải là email hợp lệ"),

  check("password")
    .exists()
    .withMessage("Vui lòng nhập mật khẩu người dùng")
    .notEmpty()
    .withMessage("Không được để trống mật khẩu người dùng")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu người dùng phải từ 6 kí tự"),
];

const registerValidator = [
  check("name")
    .exists()
    .withMessage("Vui lòng nhập tên người dùng")
    .notEmpty()
    .withMessage("Không được để trống tên người dùng")
    .isLength({ min: 6 })
    .withMessage("Tên người dùng phải từ 6 kí tự"),

  check("email")
    .exists()
    .withMessage("Vui lòng nhập email người dùng")
    .notEmpty()
    .withMessage("Không được để trống email người dùng")
    .isEmail()
    .withMessage("Đây không phải là email hợp lệ"),

  check("password")
    .exists()
    .withMessage("Vui lòng nhập mật khẩu người dùng")
    .notEmpty()
    .withMessage("Không được để trống mật khẩu người dùng")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu người dùng phải từ 6 kí tự"),

  check("confirmPassword")
    .exists()
    .withMessage("Vui lòng xác nhận mật khẩu")
    .notEmpty()
    .withMessage("Vui lòng nhập xác nhận mật khẩu")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu không khớp");
      }
      return true;
    }),
];

let getLogout = (req, res) => {
  //req.session.user = null;
  req.session.destroy();
  res.redirect("/account/login");
};

let getLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  const error = req.flash("error") || "";
  const password = req.flash("password") || "";
  const email = req.flash("email") || "";

  res.render("login", { error, password, email });
};

let postLogin =
  (loginValidator,
  (req, res) => {
    let result = validationResult(req);
    if (result.errors.length === 0) {
      const { email, password } = req.body;

      const sql = "SELECT * FROM account WHERE email = ?";
      const params = [email];

      db.query(sql, params, (err, results, fields) => {
        if (err) {
          req.flash("error", err.message);
          req.flash("password", password);
          req.flash("email", email);
          res.redirect("/account/login");
        } else if (results.length === 0) {
          req.flash("error", "Email không tồn tại");
          req.flash("password", password);
          req.flash("email", email);
          res.redirect("/account/login");
        } else {
          const hashed = results[0].password;
          const match = bcrypt.compareSync(password, hashed);
          if (!match) {
            req.flash("error", "Mật khẩu không chính xác");
            req.flash("password", password);
            req.flash("email", email);
            res.redirect("/account/login");
          } else {
            //delete results[0].password
            req.session.user = results[0];
            return res.redirect("/");
          }
        }
      });
    } else {
      result = result.mapped();
      console.log(result);

      let message;
      for (fields in result) {
        message = result[fields].msg;
        break;
      }
      const { email, password } = req.body;

      req.flash("error", message);
      req.flash("password", password);
      req.flash("email", email);

      res.redirect("/account/login");
    }
  });

let getRegister = (req, res) => {
  const error = req.flash("error") || "";
  const name = req.flash("name") || "";
  const email = req.flash("email") || "";

  res.render("register", { error: error, name: name, email: email });
};
let postRegister =
  (registerValidator,
  (req, res) => {
    let result = validationResult(req);

    if (result.errors.length === 0) {
      const { name, email, password } = req.body;

      const hashed = bcrypt.hashSync(password, 10);

      const sql = "insert into account(name, email, password) values(?,?,?)";
      const params = [name, email, hashed];

      db.query(sql, params, (err, result, fields) => {
        if (err) {
          req.flash("error", err.message);
          req.flash("name", name);
          req.flash("email", email);

          return res.redirect("/account/register");
        } else if (result.affectedRows === 1) {
          req.flash("success", "Đăng kí thành công");
          return res.redirect("/account/login");
        } else {
          req.flash("error", "Đăng kí thất bại");
          req.flash("name", name);
          req.flash("email", email);

          return res.redirect("/account/register");
        }
      });
    } else {
      result = result.mapped();
      console.log(result);

      let message;
      for (fields in result) {
        message = result[fields].msg;
        break;
      }
      const { name, email, password } = req.body;

      req.flash("error", message);
      req.flash("name", name);
      req.flash("email", email);
      res.redirect("/account/register");
    }
  });

module.exports = {
  getLogin: getLogin,
  getLogout: getLogout,
  postLogin: postLogin,
  getRegister: getRegister,
  postRegister: postRegister,
 
};
