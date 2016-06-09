var request = require("request");
var cheerio = require("cheerio");
var _ = require("./underscore.js");

var url = "http://www.reddit.com";

getText(url);
getLinks(url);

function getText(url){
  var text = [];
  request(url, function(error, response, body){
    if(!error){
      var $ = cheerio.load(body);
      $("*").each(function(i, element){
        text[i] = $(this).text();
      })
    }
  })
  return text;
}

function getLinks(url){
  var linkElements = [];
  request(url, function(error, response, body){
    if(!error){
      var $ = cheerio.load(body);
      $("a").each(function(i, element){
        if($(this).attr("href") && $(this).attr("href")[0] == "h"){
          linkElements[i] = $(this).attr("href");
        }
        else{
          linkElements[i] = url + $(this).attr("href");
        }
      });
    }
  })
return linkElements;
}
