
const User = require("../models/UserModel");
const Transaction = require("../models/TransactionModel");
const express = require('express');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const formidable = require("formidable");
const bcrypt = require("bcrypt");
const {template} = require("../email-template");
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

const router = express.Router();

/* GET users listing. */
router.post('/register', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse( req, async ( err, fields, files ) => {
    if ( err ){
      return res.status( 404 ).json( {
        error: "Image could not be uploaded"
      } )
    }
    console.log(fields);

    if (!fields){
      return res.status( 404 ).json( {
        error: "Fill in the form to register"
      } )
    }
    
    let confirmPassword = fields.confirmPassword;

    let user = new User( fields );

    /*if ( files.passport ){
      user.passport.data = fs.readFileSync( files.passport.filepath );
      user.passport.contentType = files.passport.mimetype;
    } 
    
    if (files.proofOfAddress){
      user.proofOfAddress.data = fs.readFileSync(files.proofOfAddress.filepath);
      user.proofOfAddress.contentType = files.proofOfAddress.mimetype;
    }

    if (files.bankStatement){
      user.bankStatement.data = fs.readFileSync(files.bankStatement.filepath);
      user.bankStatement.contentType = files.bankStatement.mimetype;
    }

    if (files.photo){
      user.photo.data = fs.readFileSync(files.photo.filepath);
      user.photo.contentType = files.photo.mimetype;
    }*/
    /* bcrypt.compare(user.password, "$2b$10$Zb0JjO8vfs0nxG/48m4zieXj37lAG5JHgh1H4iNG8hDE6q2OguTfm", function(err, rs){
      console.log(rs);
    })*/

    try{
      if (user.password === confirmPassword){
        bcrypt.hash(user.password, 10, async function(err, hash){
          user.password = hash;
          if (user.email === "info@escrow-block.com"){
            user.role = "admin";
          } else {
            user.role = "user";
          }

          if (user.email || user.userName){
            let tempUsers = await User.find({$or: [{email: user.email}, {userName: user.userName}]});

            if (tempUsers.length !== 0){

              let usrname = null;
              let usremail = null;

              tempUsers.forEach(val => {
                if (val.userName === user.userName){
                  usrname = val.userName;
                } else if (val.email === user.email){
                  usremail = val.email;
                }
              })

              if (usrname && usremail){
                return res.json({
                  errors: {
                    userName: {message: "User Name already exist"},
                    email: {message: "Email Address already exist"},
                    exists: true
                  },
                  "_message": "User Name and Email already exist"
                });
              } else if (usremail){
                return res.json({
                  errors: {
                    email: {message: "Email Address already exist"},
                    exists: true
                  },
                  "_message": "Email Address already exist"
                });
              } else if (usrname){
                return res.json({
                  errors: {
                    userName: {message: "Username already exist"},
                    exists: true
                  },
                  "_message": "User Name already exist"
                });
              }
            }
          }
          
          user.firstForm = true;
          await user.save((e, d) => {
            if (e){
              return res.status(404).json(e);
            }else{

              let transporter = nodemailer.createTransport({
                host: "mail.escrow-block.com",
                port: 465,
                secure: true,
                auth: {
                  user: "info@escrow-block.com",
                  pass: "DeepSky24!"
                }
              });

              let mailOptions = {
                from : '"Welcome to Escrow Block" <info@escrow-block.com>',
                to: d.email,
                subject: "Welcome To Escrow Block",
                Text: "That was easy!",
                html: template(d.firstName),
                attachments: [{
                  filename: "logo.png",
                  path: "./assets/logo.png",
                  cid: "uniquelogo"
                },{
                  filename: "logincontainer.png",
                  path: "./assets/logincontainer.png",
                  cid: "logo-container"
                },{
                  filename: "facebook2x.png",
                  path: "./assets/facebook2x.png",
                  cid: "facebook2x"
                },{
                  filename: "twitter2x.png",
                  path: "./assets/twitter2x.png",
                  cid: "twitter2x"
                },{
                  filename: "instagram2x.png",
                  path: "./assets/instagram2x.png",
                  cid: "instagram2x"
                },{
                  filename: "telegram.png",
                  path: "./assets/telegram.png",
                  cid: "telegram"
                },{
                  filename: "mobile.png",
                  path: "./assets/mobile.png",
                  cid: "mobile"
                },{
                  filename: "email.png",
                  path: "./assets/email.png",
                  cid: "email"
                }]
              };

              transporter.sendMail(mailOptions, function(err, info){
                if (err){
                  console.log(err);
                } else {
                  console.log(info);
                }
              })

              let data = {...d, password: null};
              res.json({success: "User successfully created", data: data})
            }
          });
        })
      } else {
        return res.status(404).json({
          errors: {
            password: {message: "passwords do not match"}, 
            confirmPassword: {message: "passwords do not match"}
          },
          "_message": "Passwords do not match"
        })
      }
    } catch ( err ){
      return res.status( 404 ).json( {
        error: err.message
      } )
    }
  } )
});

router.post('/update-user', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse( req, async ( err, fields, files ) => {
    if ( err ){
      return res.status( 404 ).json( {
        error: "Image could not be uploaded"
      } )
    }

    if (!fields){
      return res.status( 404 ).json( {
        error: "Fill in the form to register"
      } )
    }
    
    let confirmPassword = fields.confirmPassword;

    try{
      if (fields.password === confirmPassword){
        bcrypt.hash(fields.password, 10, async function(err, hash){
      
          let user = await User.findById(fields.id);

          if (fields.email || fields.userName){
            let tempUsers = await User.find({$or: [{email: user.email}, {userName: user.userName}]});

            if (tempUsers.length !== 0){

              let usrname = null;
              let usremail = null;

              tempUsers.forEach(val => {
                if (val.userName === user.userName){
                  if (fields.userName !== user.userName){
                    usrname = val.userName;
                  }
                } else if (val.email === user.email){
                  if (fields.email !== user.email){
                    usremail = val.email;
                  }
                }
              })

              if (fields.userName === user.userName){
                if (usrname && usremail){
                  return res.json({
                    errors: {
                      userName: {message: "User Name already exist"},
                      email: {message: "Email Address already exist"},
                      exists: true
                    },
                    "_message": "User Name and Email already exist"
                  });
                } else if (usremail){
                  return res.json({
                    errors: {
                      email: {message: "Email Address already exist"},
                      exists: true
                    },
                    "_message": "Email Address already exist"
                  });
                } else if (usrname){
                  return res.json({
                    errors: {
                      userName: {message: "Username already exist"},
                      exists: true
                    },
                    "_message": "User Name already exist"
                  });
                }
              }
            }
          } 
          
          user.userName = fields.userName;
          user.firstName = fields.firstName;
          user.lastName = fields.lastName;
          user.middleName = fields.middleName;
          user.email = fields.email;
          user.gender = fields.gender;
          user.country = fields.country;
          user.phoneNumber = fields.phoneNumber;
          user.dateOfBirth = fields.dateOfBirth;
          user.password = hash;
          user.firstForm = true;

          await user.save((e, d) => {
            if (e){
              return res.status(404).json(e);
            }else{
              let data = {...d, password: null};
              res.json({success: "User Updated", data: data})
            }
          });
        })
      } else {
        return res.status(404).json({
          errors: {
            password: {message: "passwords do not match"}, 
            confirmPassword: {message: "passwords do not match"}
          },
          "_message": "Passwords do not match"
        })
      }
    } catch ( err ){
      return res.status( 404 ).json( {
        error: err.message
      } )
    }
  } )
});

router.post("/signin", async function(req, res){
  let body = req.body;
  
  try{
    let user = await User.findOne({email: body.email});
    console.log(user);
    
    if (!user){
      return res.status(404).json({error: "User not found"});
    }
 
    bcrypt.compare(body.password, user.password, function(err, rs){
      if (rs){
        let {userName, firstName, lastName, email, role} = user;
        let token = jwt.sign({email}, process.env.TOKEN_KEY || "wole-escrow-block");

        return res.status(200).json({userName, firstName, lastName, email, token, role});
      } else {
        return res.status(404).json({error: "Incorrect Password"});
      }
    })

  } catch(err){
    return res.status( 400 ).json( {
      error: err.message
    } )
  }
})

router.post("/getUser", async function(req, res){
  let body = req.body;
  console.log(body.id);
  
  try{
    let user = await User.findById({_id: body.id});
    
    if (!user){
      return res.status(404).json({error: "User not found"});
    } else {
      return res.status(200).json({success: "success", user});
    }    

  } catch(err){
    return res.status( 400 ).json( {
      error: err.message
    } )
  }
} )

router.post("/second-register", async function(req, res){
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse( req, async ( err, fields, files ) => {
    if ( err ){
      return res.status( 404 ).json( {
        error: "Image could not be uploaded"
      } )
    }

    if (!fields){
      return res.status( 404 ).json( {
        error: "Fill in the form to register"
      } )
    }

    try{
      let user = await User.findById(fields.id);
      
      if (!user){
        return res.status(404).json({error: "User not found"});
      } else {

        if (files.identification){
          user.identification.data = fs.readFileSync(files.identification.filepath);
          user.identification.contentType = files.identification.mimetype;
        } 
        
        if (files.proofOfAddress){
          user.proofOfAddress.data = fs.readFileSync(files.proofOfAddress.filepath);
          user.proofOfAddress.contentType = files.proofOfAddress.mimetype;
        }

        if (files.bankStatement){
          user.bankStatement.data = fs.readFileSync(files.bankStatement.filepath);
          user.bankStatement.contentType = files.bankStatement.mimetype;
        }

        user.preferredCommunication = fields.preferredCommunication;
        user.employmentStatus = fields.employmentStatus;
        user.occupation = fields.occupation;
        user.purposeOfEscrowAccount = fields.purposeOfEscrowAccount;
        user.sourceOfFunds = fields.sourceOfFunds;
        user.expectedTransactionSizePerTrade = fields.expectedTransactionSizePerTrade;
        user.address = fields.address;

        if (fields.telegram){
          user.telegram = fields.telegram;
        } else {
          user.whatsApp = fields.whatsApp;
        }

        await user.save((e, d) => {
          if (e){
            return res.status( 404 ).json( e )
          }else{
            let data = {...d, password: null};
            return res.status(200).json({success: "success", user: data});
          }
        })
      }    
  
    } catch(err){
      return res.status( 400 ).json( {
        error: err.message
      } )
    }
  })
} )

const isAuthenticated = (req, res, next) => {
  if (req.headers["authorization"]){
    let token = req.headers["authorization"];

    jwt.verify(token, process.env.TOKEN_KEY || "wole-escrow-block", function(err, decoded){
      if (err){
        return res.status("404").json({
          error: "Invalid Authorization token"
        })
      } else {
        User.findOne({email: decoded.email}).then(usr => {
          req.profile = usr;
          next();
        })
      }
    });
  } else {
    return res.status("400").json({
      error: "You have to be logged in to perform this operation"
    })
  }
}

const isAdmin = (req, res, next) => {
  if (req.profile.role === "admin"){
    next();
  } else {
    return res.status("404").json({
      error: "Not authorized to make this request"
    })
  }
}

router.get("/allUsers", isAuthenticated, isAdmin, async function(req, res){
  try{
    let users = await User.find({}).select("-passportIdCopy -password -identification.data -proofOfAddress.data -bankStatement.data");

    res.json(users);
  } catch(err){
    return res.status("400").json({
      error: err.message
    })
  }
})

router.post("/forgotPassword", function(req, res){

  let {email} = req.body;

  User.findOne({email: email}).then(user => {

    let token = Math.floor(100000 + Math.random() * 900000);
    if (user){
      user.forgotPasswordToken = token;
      user.save((err, usr) => {
        if (err){
          return res.status("400").json({
            error: err.message
          })
        } else {

          let transporter = nodemailer.createTransport({
            service: "yahoo",
            auth: {
              user: "escrowblock@yahoo.com",
              pass: "sidtgldqkcnjtjoc"
            }
          });

          let mailOptions = {
            from : "escrowblock@yahoo.com",
            to: email,
            subject: "Password Token",
            Text: "That was easy!",
            html: `<b>${token}</b>`
          };

          transporter.sendMail(mailOptions, function(err, info){
            if (err){
              console.log(err);
            } else {
              let user = {email: usr.email, id: usr._id};
              res.json({success: "Email sent successfully", user})
            }
          })

          let user = {email: usr.email, id: usr._id};
          res.json({success: "Email sent successfully", user})
        }
      })
    }else{
      return res.status("400").json({
        error: {
          error: true,
          errorMessage: "Invalid Email Address"
        }
      })
    }
  })
})

router.post("/verifyToken", function(req, res){
  let {email, token} = req.body;

  User.findOne({email: email}).then(user => {
    if (Number(token) === user.forgotPasswordToken){
      res.json({success: "token verified", email, token})
    } else {
      return res.status("400").json({
        error: "invalid token"
      })
    }
  })
})

router.post("/changePassword", function(req, res){
  
  let {email, password, confirmPassword, token} = req.body;

  User.findOne({email}).then(usr => {
    bcrypt.hash(password, 10, async function(err, hash){
      if (err){
        console.log(err.message);
      } else {
        usr.password = hash;
        usr.forgotPasswordToken = "";
        await usr.save();

        res.json({success: "successfully changed password"});
      }
    })
  }) 
})

router.get("/get-file/:type/:id", async (req, res) => {
  let id = req.params.id;
  let type = req.params.type;

  try{
    let user = await User.findById(id).select(type);
    res.send(user[type].data);
  } catch(err){
    res.json(err);
  }
});

router.get("/demo", function(req, res){
  res.json({demo: "demo"})
})

module.exports = router;
