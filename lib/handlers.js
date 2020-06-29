//Request Handlers 

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

var handlers = {};


handlers.users = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback);
    }else {
        callback(405);
    }
};

//Container for the users submethod
handlers._users = {};

handlers._users.post = function(data, callback) {

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 5 ? data.payload.email.trim() : false;
    var streetAddress = typeof(data.payload.streetAddress) == 'string' || 'number' && data.payload.streetAddress.trim().length > 10 ? data.payload.streetAddress.trim() : false;

    // Password should contain atleast 1 Number,Capital letter and Minimum 7 characters in length
    var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    var password = (typeof(data.payload.password) == 'string' || typeof(data.payload.password) == 'number') && data.payload.password.trim().length > 7 &&
            regularExpression.test(data.payload.password.trim()) ? data.payload.password.trim() : false;

    console.log(password);
    if (!password) {
        callback(500, {'Error' : 'Password should contain atleast 1 Uppercase, 1 Number and 1 Special Character'});
        return;
    }
        
    if(firstName && lastName && email && streetAddress) {
        _data.read('users',email,function(err, data) {
            if(err){

                var hashedPassword = helpers.hash(password);
                if(hashedPassword) {

                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'email' : email,
                        'streetAddress' : streetAddress,
                        'hashedPassword': hashedPassword,
                }

                // Persist the data to disk 
                    _data.create('users',email,userObject, function(err){
                        if(!err) {
                            callback(200);
                        }else {
                            callback(500, {'Error' : 'Could not create the user'});
                        }
                    }); // end of _data.create

                }else{ // of if(hashedPassword)
                    callback(400, {'Error' : 'Could not hash the password'});
                }
            }else { //of if if(err)
                callback(400, {'Error' : 'User already exists'});
            }
        });
    }else {
        callback(400, {'Error' : 'Missing required Fields'});
    }

};

handlers._users.get = function(data, callback) {

    // users - get
    // Required - email id 
    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;
    if(email) {
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token,email,function(tokenIsValid){
            if(tokenIsValid) {
                _data.read('users',email,function(err, data) {
                    if(!err && data) {      
                        //remove the password
                        delete data.hashedPassword;
                        callback(200, data);
                    }else {
                        callback(400, {'Error' : 'User: ' +email+ ' Not found. Want to Signup ?'});
                    }
                })
            } else{
                callback (401, {'Error' : 'User authentication erorr'});
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required fields in GET Call'});
        }
    }

handlers._users.put = function(data,callback) {

// required email - rest optional

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 5 ? data.payload.email.trim() : false;
    var streetAddress = typeof(data.payload.streetAddress) == 'string' || 'number' && data.payload.streetAddress.trim().length > 10 ? data.payload.streetAddress.trim() : false;
    // Password should contain atleast 1 Number,Capital letter and Minimum 7 characters in length
    var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    var password = (typeof(data.payload.password) == 'string' || typeof(data.payload.password) == 'number') && data.payload.password.trim().length > 7 &&
            regularExpression.test(data.payload.password.trim()) ? data.payload.password.trim() : false;
            console.log(password);
    if(email) {
        if(firstName || lastName || streetAddress || password) {
            var token = typeof(data.headers.token) == 'string' ? data.headers.token :false;
            handlers._tokens.verifyToken(token,email,function(tokenIsValid){
                if(tokenIsValid){
                    _data.read('users',email,function(err, userData){
                        if(!err && email){
                            if(firstName) {
                                userData.firstName = firstName;
                            }
                            if(lastName) {
                                userData.lastName = lastName;
                            }
                            if(password) {
                                userData.password = helpers.hash(password);
                            }
                            if(streetAddress) {
                                userData.streetAddress = streetAddress;
                            }
                            _data.update('users',email,userData,function(err){
                                if(!err) {
                                    callback(200);
                                }else {
                                    callback(500, {'Error' :'Could not update the user data'});
                                }
                            });
                        }else {
                            callback(400, {'Error' : 'User: ' +email+ ' Not found. Want to Signup ?'});
                        }
                    });
                }else{
                    callback (401, {'Error' : 'User authentication erorr'}); 
                }
            })
        }else{
            callback(400, {'Error' : 'Missing required fields for updation'});

        }
    }
}

handlers._users.delete = function(data,callback) {

    // Required data is email id
    // Optional data is none
    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 5 ? data.queryStringObject.email.trim() : false;
    console.log(email);

    if(email) {
        _data.read('users',email,function(err, data) {
    
            if(!err && data) {
                _data.delete('users',email,function(err){
                    if(!err) {
                        callback(200);
                    }else {
                        callback(400, {'Error': 'Delete not successful'});
                    }
               });
            }else {
                callback(400, {'Error' : 'User: ' +email+ ' Not found.'});
            }
        });
    }else {
        callback(400, {'Error' : 'Missing required fields, delete PROC'});
    }
};

handlers.tokens = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data,callback);
    }else {
        callback(405);
    }
};

//Container for the users submethod
handlers._tokens = {};

// create the _token methods

handlers._tokens.post = function(data,callback) {
    //Required data - email and password 
    //optional data - None
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 5 ? data.payload.email.trim() : false;
    var password = (typeof(data.payload.password) == 'string' || typeof(data.payload.password) == 'number') && data.payload.password.trim().length > 0 ?  data.payload.password.trim() : false;
    
    if(email && password) {
        _data.read('users', email,function(err,userData) {
            if(!err && userData) {
             //hash the sent passowrd, and compare to the password in the file(stored)
             var hashedPassword = helpers.hash(password);
             if(hashedPassword == userData.hashedPassword) {
                 // if valide create a token , set expiration 1 hour in the future
                 var tokenId = helpers.createRandomString(20);
                 var expires = Date.now() + 1000 * 60 * 60;
                 var tokenObject = {
                    'email' : email,
                    'id': tokenId,
                    'expires' : expires
                 }
                 _data.create('tokens',tokenId,tokenObject,function(err){
                    if(!err) {
                        callback(200, tokenObject);
                    }else {
                        callback(500, {'Error' : 'Could not create the new token'})
                    }
                 });
             }else {
                 callback(400, {'Error': 'Password did not match the specified user'})
             }
           }else {
                callback(400, {'Error' : 'Email id of the user is Missing'});

            }
        });
    }else {
        callback(400, {'Error' : 'Missing Required Fields'});
    }
};


handlers._tokens.get = function(data,callback) {
    //required data = id 
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ?  data.queryStringObject.id.trim() : false;
    if(id) {
        //read the token
        _data.read('tokens',id,function(err, tokenData) {
         if(!err && tokenData) {
            callback(200, tokenData);
        }else {
            callback(400, {'Error' : 'Not Found'});
        }
    });
    }else {
        callback(400, {'Error' : 'Missing required fields'});

    }
};

handlers._tokens.put = function(data,callback){
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend){
        // Lookup the existing token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
            // Check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new updates
                    _data.update('tokens',id,tokenData,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500,{'Error' : 'Could not update the token\'s expiration.'});
                    }
                    });
                } else {
                    callback(400,{"Error" : "The token has already expired, and cannot be extended."});
                }
            } else {
            callback(400,{'Error' : 'Specified user does not exist.'});
            }
        });
    } else {
      callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
    }
  };
  

handlers._tokens.delete = function(data,callback) {

    // Required data is ID 
    // Optional data is none

var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
console.log(id);
    if(id) {
        _data.read('tokens',id,function(err, data) {
            if(!err && data) {
                //remove the password
                _data.delete('tokens',id,function(err){
                    if(!err) {
                        callback(200);
                    }else {
                        callback(400, {'Error': 'Delete not successful'});
                    }
               });
            }else {
                callback(400, {'Error' : 'Not Found'});
            }
        });
    }else {
        callback(400, {'Error' : 'Missing required fields, delete PROC'});
    }
};



handlers.menu = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._menu[data.method](data,callback);
    }else {
        callback(405);
    }
};

//Container for the users submethod
handlers._menu = {};

handlers._menu.get = function(data,callback) {
    //required data = id 
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ?  data.queryStringObject.id.trim() : false;
    if(id) {
        //read the token
        _data.read('menu',id,function(err, menuData) {
         if(!err && menuData) {
            callback(200, menuData);
        }else {
            callback(400, {'Error' : 'Not Found'});
        }
    });
    }else {
        callback(400, {'Error' : 'Missing required fields'});

    }
};


handlers.order = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._order[data.method](data,callback);
    }else {
        callback(405);
    }
};

//Container for the users submethod
handlers._order = {};


handlers._order.post = function(data, callback) {
    
    var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ?  data.headers.token.trim() : false;
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 5 ? data.payload.email.trim() : false;
    var amount = typeof(data.payload.amount) == 'number' ? data.payload.amount : false;

    var items = typeof(data.payload.items) == 'object' && items !== null ? data.payload.items : {};
    var paymentStatus = typeof(data.payload.paymentStatus) == 'string' && data.payload.paymentStatus == 'PENDING' ? data.payload.paymentStatus.trim() : false;
    var sentNotification = typeof(data.payload.sentNotification) == 'string' && data.payload.sentNotification == 'NO' ? data.payload.sentNotification.trim() : false;
    var orderId;
    
    // console.log("comeere here");
    // console.log(email);
    // console.log(token);
    // console.log(data.payload);

    if (email && amount && items){
        handlers._tokens.verifyToken(token,email,function(tokenIsValid){
            if(tokenIsValid) { // need not verify email again - as only on successful login a token will be assigned
    
                //console.log("hello" +tokenIsValid);
                // generate an order id 
                _data.static_read('orders',function(err,orderNum){
                    if(!err && orderNum){
                         orderId = 'Order' + ((orderNum.orderId - 0)+  5);
 
                         handlers.processPayment(amount,function(isPaymentStatus){
                             if(isPaymentStatus) {
                                paymentStatus = "SUCCESS";
                                var orderObject = {
                                    'orderId' : orderId,
                                    'email' : email,
                                    'amount' : amount,
                                    'items' : items,
                                    'paymentStatus' : paymentStatus,
                                    'sentNotification': sentNotification
                                }
                                _data.create('orders',orderId,orderObject,function(err){
                                    if(!err) {
                                        handlers.sendNotification(email, function(sendStatus){
                                            if(sendStatus){
                                                orderObject.sentNotification = "YES";
                                                _data.update('orders',orderId,orderObject,function(err){
                                                    if(!err){
                                                        orderNum.orderId = ((orderNum.orderId - 0)  + 5);
                                                        _data.static_update('orders',orderNum,function(err){
                                                            if(!err) {
                                                                console.log("Processing of " +orderId+ " completed");
                                                                callback(200);
                                                            } else{
                                                                callback(400,  {'Error' : "While processing the request"})
                                                            }
                                                        });
                                                        return;
                                                    }else{
                                                        callback(400);
                                                    }
                                                });
                                            }else{
                                                callback(400, {'Error' : "Some issue with processing the request"})
                                            }
                                        });
                                    }else {
                                        callback(400, {'Error': 'Unable to create your order'});
                                    }
                                });
                             } else {
                                callback(500, {'Error' : 'Payment Failed'})
                             }

                         })
                    }else {
                        callback(500, {'Error' : 'Unable to generate order id'});
                        return;
                    }
                });
        }else {
            callback(401, {'Error' : 'Unauthorized access, please login again'})
        }
    
        });

    } else{
        callback(500, {'Error' : 'Missing data / incorrect data; Request not processeed'})
    }
};

handlers._tokens.verifyToken = function(id,email,callback) {
    //lookup token 
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData) {
            if(tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true);
            }else {
                callback(false);
            }
        }else {
            callback(false);
        }
    });
};


handlers.notFound = function(data, callback){
    callback(404);
};



handlers.sendNotification = function(email,callback) {
    helpers.sendEmailNotification(email,function(err){
        if(!err){
            console.log("Success: Email notification sent ");
            callback(true);
        } else {
        console.log("Error: Email notification failure");
        callback(false);
        } 

    });
};
handlers.processPayment = function(amount,callback) {
    helpers.genPaymentRequest(amount,function(err){
        if(!err){
            console.log("Success: Payment was successful ");
            callback(true);
        } else {
        console.log("Error: Payment failure");
        callback(false);
        } 
    });
};
//Export handlers 

module.exports = handlers;

