var request = require("request");
var cheerio = require("cheerio");
var _ = require("./underscore.js");

var url = "http://www.reddit.com";

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
        linkElements[i] = $(this).attr("href");
      });
    }
  })
  return linkElements;
}
