var request = require("request");
var cheerio = require("cheerio");

var url = "http://www.cnn.com";

request(url, function(error, response, body){
  if(!error){
    var $ = cheerio.load(body);
    var linkElements = [];
    $("a").each(function(i, element){
      linkElements[i] = $(this).attr("href");
    });

    console.log(linkElements);
  }
})
