//// --- Filesystem --- ////

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

function errorHandler(e) {
   var msg = '';
   switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
         msg = 'QUOTA_EXCEEDED_ERR';
         break;
      case FileError.NOT_FOUND_ERR:
         msg = 'NOT_FOUND_ERR';
         break;
      case FileError.SECURITY_ERR:
         msg = 'SECURITY_ERR';
         break;
      case FileError.INVALID_MODIFICATION_ERR:
         msg = 'INVALID_MODIFICATION_ERR';
         break;
      case FileError.INVALID_STATE_ERR:
         msg = 'INVALID_STATE_ERR';
         break;
      default:
         msg = 'Unknown Error';
         break;
   };
   alert('Error: ' + msg);
}

function writeLogFile(dataString,name) {
   window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
      if (fs) {
         
         //Create dir
         fs.root.getDirectory('Logs', {create: true}, function(dirEntry) {
         }, errorHandler);
      
         //Write files
         fs.root.getFile('/Logs/'+name, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
               var blob = new Blob([dataString], {type: 'text/plain'});
               fileWriter.write(blob); 
            }, errorHandler);
         }, errorHandler);
      
      }
   }, errorHandler);
}

function deleteLogFile(logFileName) {
    window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
        fs.root.getFile('Logs/'+logFileName, {create: false}, function(fileEntry) {
          fileEntry.remove(function() {
          }, errorHandler);
        }, errorHandler);
    });
}

//// --- Dynamic Results --- ////

var testNameLookup =    {"scripts/smooth_pursuit.lua": 
                            {   "name": "Smooth Pursuit",
                                "icon": "smoothpursuit-icon"}
                        };

function parseLogXML(logXML,log) {
    
    var parser = new DOMParser();
    var xmldoc = parser.parseFromString(logXML,"text/xml");
    log.testname = xmldoc.getElementsByTagName("testname")[0].childNodes[0].nodeValue;
    log.score = parseFloat(xmldoc.getElementsByTagName("score")[0].childNodes[0].nodeValue);
    log.score = log.score.toFixed(2).toString();
    
};

function Log() {
    
    this.datetime = new Date();
    this.testname = "";
    this.score = 1;
        
};

function Table() {
	
	this.results = [];
	this.table = document.createElement("table");
	this.head = document.createElement("tr");
	this.head.classList.add("table-header");
    // this.head1 = document.createElement("th");
    // this.head1.classList.add("icon-title");
    // this.head1.innerHTML = "Icon";
    // this.head.appendChild(this.head1);
    this.head2 = document.createElement("th");
    this.head2.colSpan = 2;
    this.head2.innerHTML = "Test Name";
    this.head.appendChild(this.head2);
	this.head3 = document.createElement("th");
	this.head3.innerHTML = "Date";
	this.head.appendChild(this.head3);
	this.head4 = document.createElement("th");
	this.head4.innerHTML = "Time";
	this.head.appendChild(this.head4);
	this.head5 = document.createElement("th");
	this.head5.innerHTML = "Score";
	this.head.appendChild(this.head5);
	this.table.appendChild(this.head);
	
};

Table.prototype = {
	
	addItem: function(icon,title,datetime,score) {
        
        var oddeven = "odd"
        if (this.results.length % 2 == 0) {
            oddeven = "even"
        }
		var result = new Result(oddeven,icon,title,datetime,score);
		this.results.push(result);
		this.table.appendChild(result.tr);
		
		return result;
	},
    
    noResult: function() {
        var tr = document.createElement("tr");
        tr.classList.add("even");
        var td = document.createElement("td");
        td.colSpan = 5;
        td.innerHTML = "No Results";
        tr.appendChild(td);
        this.table.appendChild(tr);
    }
	
};

function Result(oddeven,icon,title,datetime,score) {
	
	this.tr = document.createElement("tr");
	this.tr.classList.add(oddeven);
	
	this.td1 = document.createElement("td");
	this.iconspan = document.createElement("span");
	this.iconspan.classList.add("icon");
	this.iconspan.classList.add(icon);
	this.td1.appendChild(this.iconspan);
	this.tr.appendChild(this.td1);
    
	this.td2 = document.createElement("td");
	this.td2.classList.add("test-title");
	this.td2.innerHTML = title;
	this.tr.appendChild(this.td2);
    
	this.td3 = document.createElement("td");
	this.td3.classList.add("test-date");
	this.td3.innerHTML =    (datetime.getMonth() + 1) + "-" + 
                            datetime.getDate() + "-" + 
                            datetime.getFullYear();
	this.tr.appendChild(this.td3);
    
	this.td4 = document.createElement("td");
	this.td4.classList.add("test-time");
	this.td4.innerHTML = datetime.toLocaleTimeString();
	this.tr.appendChild(this.td4);
    
	this.td5 = document.createElement("td");
	this.td5.classList.add("test-score");
	this.td5.innerHTML = score;
	this.tr.appendChild(this.td5);
	
};

function listLogFiles(logFileDirectory) {
    
    window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
        fs.root.getDirectory(logFileDirectory, {}, function(dirEntry){
            var dirReader = dirEntry.createReader();
            dirReader.readEntries(function(entries) {
                for(var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.isDirectory){
                        console.log('Directory: ' + entry.fullPath);
                    }
                    else if (entry.isFile){
                        console.log('File: ' + entry.fullPath);
                    }
                }
            }, errorHandler);
        }, errorHandler);
    });    
    
};

function readLogFile(logFilePath) {
    
    window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
        fs.root.getFile('test.txt', {}, function(fileEntry) {
            fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    alert(this.result);          
                };
                return reader.readAsText(file);     
            }, errorHandler);
        }, errorHandler);
    });
    
};

function generateResultsList(fs) {
    
    //Open Logs directory in FileSystem
    fs.root.getDirectory('Logs', {}, function(dirEntry){
       
        //Read all files in directory
        var dirReader = dirEntry.createReader();
        dirReader.readEntries(function(entries) {
            
            //Construct Results Table
            var resultsTable = new Table();
            
            //Construct Results Table for no logs
            if (entries.length == 0) {
                resultsTable.noResult();
            }
            
            for(var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isFile){
                    
                    //Read file
                    fs.root.getFile(entry.fullPath, {}, function(fileEntry) {
                        fileEntry.file(function(file) {
                            var reader = new FileReader();
                            reader.onloadend = function(e) {
                                
                                //Create Log and parse log file
                                var log = new Log();
                                parseLogXML(this.result,log);
                                log.datetime = new Date(file.lastModifiedDate);
                                
                                //Add Log to Results Table
                                resultsTable.addItem(   testNameLookup[log.testname]["icon"],
                                                        testNameLookup[log.testname]["name"],
                                                        log.datetime,log.score);
                                
                            };
                            return reader.readAsText(file);     
                        }, errorHandler);
                    }, errorHandler);
                    //End read file
                    
                }
            }//End loop entries
            
            //Append Results Table to document element
            var resultsDiv = document.getElementById("dynamic-results");
            resultsDiv.appendChild(resultsTable.table);
            
        }, errorHandler);
        //End read directory
        
    });
    //End open Logs directory
    
};

//// --- Main --- ////

function buildResults() {
    
    window.requestFileSystem(window.TEMPORARY, 1024*1024, generateResultsList, errorHandler);

};
