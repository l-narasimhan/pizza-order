// Library 

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// container of the module 

var lib = {}

// base directory 

lib.baseDir = path.join(__dirname,'/../.data/')

// write data 

lib.create = function(dir, file, data,callback )  {

    // open the file for write

    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err, fileDescriptor) {
        if (!err && fileDescriptor) {

            // convert data to string

            var stringData = JSON.stringify(data);

            // write to file

            fs.write(fileDescriptor,stringData,function(err){
                if(!err) {
                    fs.close(fileDescriptor,function(err) {
                        if(!err) {
                            callback(false);

                        } else {
                            callback('Error while closing the file');
                        }
                   });
                } else {
                    callback('Error writing to the file');
                }

            });

        }else {
            callback('Could not create new file');
        }
    });
};


lib.read = function(dir, file, callback) {

    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8', function(err, data){
        if(!err && data) {
            var prasedData = helpers.parseJsonToObject(data);
            callback(false,prasedData);
        }else {
            callback(err, data);

        }
     });

};


lib.static_read = function(dir, callback) {
    fs.readFile(lib.baseDir+dir+'/orderid.json','utf8', function(err, data){
        if(!err && data) {
            var prasedData = helpers.parseJsonToObject(data);
            callback(false,prasedData);
        }else {
            callback(err, data);

        }
     });

};

lib.static_update = function(dir, data, callback) {
    
    fs.open(lib.baseDir+dir+'/orderid.json','r+',function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            //console.log('helo', fileDescriptor.toString());
            var stringData = JSON.stringify(data); 
            fs.ftruncate(fileDescriptor,function(err){
                if(!err) {
                   // console.log('helo11');
                    fs.writeFile(fileDescriptor,stringData,function(err) {
                        if(!err ) {
                            //console.log('helo22222');
                            fs.close(fileDescriptor,function(err) {

                                if (!err) {
                                    callback(false);
                                }else {

                                    callback('There was an error 500');
                                }
                            });
                        }else {
                            callback('Error 300 writing to the file');

                        }
                    });
                } else {
                    callback('error 700');
                }  
            });
          
        } else {
            callback('Could not open the file for update');
        }
    });

 };



lib.update = function(dir, file, data, callback) {
    
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            //console.log('helo', fileDescriptor.toString());
            var stringData = JSON.stringify(data); 
            fs.ftruncate(fileDescriptor,function(err){
                if(!err) {
                   // console.log('helo11');
                    fs.writeFile(fileDescriptor,stringData,function(err) {
                        if(!err ) {
                            //console.log('helo22222');
                            fs.close(fileDescriptor,function(err) {

                                if (!err) {
                                    callback(false);
                                }else {

                                    callback('There was an error 500');
                                }
                            });
                        }else {
                            callback('Error 300 writing to the file');

                        }
                    });
                } else {
                    callback('error 700');
                }  
            });
          
        } else {
            callback('Could not open the file for update');
        }
    });

 };

 lib.delete = function(dir, file, callback){

    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err) {

        if(!err) {

            callback(false);
        
        }else {
            callback('error deleting the file');
        }

    });
 };

// List all the items in a directory
lib.list = function(dir,callback){
    fs.readdir(lib.baseDir+dir+'/', function(err,data){
      if(!err && data && data.length > 0){
        var trimmedFileNames = [];
        data.forEach(function(fileName){
          trimmedFileNames.push(fileName.replace('.json',''));
        });
        callback(false,trimmedFileNames);
      } else {
        callback(err,data);
      }
    });
  };




// export this 
module.exports = lib;
