const args = process.argv;
let type = args[2];
let path = args[3];

const request = require("request")
const fs = require('fs');
var beautify = require('js-beautify');

if(type == undefined) {
    type = '-u';
}

if (type == "-u") {
    //url
    if (path == undefined) {
        path = 'http://127.0.0.1:8080/rest/items?recursive=false'
    }
    var options = {
        url: path,
        method: 'GET',
        json: true
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if(Array.isArray(body)) {
                console.log(body.length +" items received from openHAB");
                fileContents = body
                createTDFrom(fileContents)
            }
        }
    })
} else if (type == "-f") {
    //file
    fileContents = JSON.parse(fs.readFileSync(path, 'utf8'));
    createTDFrom(fileContents)
}

function createTDFrom(content) {
    var newCode = new Object();
    addBasics(newCode);
    addProperties(newCode,content);
    addActions(newCode, content);

    //console.log(JSON.stringify(newCode));

    beautifiedCode = beautify(JSON.stringify(newCode), { indent_size: 4, space_in_empty_paren: true });
    fs.writeFile("output.json", beautifiedCode, (err) => {
        if (err) { console.log(err); }
    });
}
function addActions(to, from) {
    from.forEach(function(value){
       addAction(to,value);
    });
}

function addAction(to, action) {
    if(action.hasOwnProperty("stateDescription")) {
        if(action["stateDescription"].hasOwnProperty("readOnly")) {
            if(action["stateDescription"]["readOnly"] == true) {
                return; //can not set this value
            }
        }
    }

    actionsObj = to["actions"];
    actionsObj["setStateFor" + action["name"]] = {};
    newObj =   actionsObj["setStateFor" + action["name"]];
    newObj["description"] = "sets state for " + action["type"] + " named " + action["name"];
    newObj["forms"] = [];

    //createForm
    actionFormObj = {};
    actionFormObj["href"] = action["link"];
    actionFormObj["contentType"] = "text/plain";
    actionFormObj["op"] = ["invokeaction"];
    newObj["forms"].push(actionFormObj);  
}

function addProperties(to, from) {
    from.forEach(function(value){
       addProperty(to,value);
    });
}
function addProperty(to, property) {
    propertiesObj = to["properties"];
    propertiesObj[property["name"]] = {};
    newObj =  propertiesObj[property["name"]];
    newObj["description"] = property["type"] + " object with label " + property["label"];
    newObj["readOnly"] = true;
    newObj["observable"] = true;
    newObj["type"] = "string";
    newObj["forms"] = [];
    
    //add read property
    readFormObj = {};
    readFormObj["op"] = ["readproperty"];
    readFormObj["contentType"] = "text/plain";
    readFormObj["href"] = property["link"] + "/state";
    newObj["forms"].push(readFormObj);  
    
    //add observe property
    subFormObj = {};
    subFormObj["op"] = ["observeproperty"];
    subFormObj["subprotocol"] = "sse";
    subFormObj["contentType"] = "application/json";
    link = property["link"];
    firstPart = (link.split("/items"))[0];
    firstPart += "/events?topics=smarthome/items/";
    subFormObj["href"] = firstPart + property["name"] + "/statechanged";
    newObj["forms"].push(subFormObj);
}

function addBasics(to) {
    to["@context"] = [
        "https://www.w3.org/2019/wot/td/v1",
        {
          "@language": "en"
        }
    ];
    to["title"] = "openHAB_Device";
    to["security"] = [
        "nosec_sc"
    ];
    to["securityDefinitions"] = {
        "nosec_sc": {
          "scheme": "nosec"
        }
    };
    to["description"] = "Auto generated TD from openHAB server";
    to["properties"] = {};
    to["actions"] = {};
}
