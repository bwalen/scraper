var request = require("request");
var cheerio = require("cheerio");
var _ = require("./underscore.js");
var _string = require("./underscore.string.min.js");

var url = "http://www.imgur.com";

getLinks(url);

function getText(url){
  var text = [];
  request(url, function(error, response, body){
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(body);
      $("p, li, ul, ol, span, article, blockquote, h1, h2, h3, h4, h5, h6").each(function(i, element){
        if($(this).text().length > 12){
          text[i] = $(this).text();
        }
      })
    }
    console.log(_string.words(_string.clean(_.uniq(text).join(" "))));
  })
}

function getLinks(url){
  var linkElements = [];
  var promise = new Promise(function(resolve, reject){
    request(url, function(error, response, body){
      if(!error && response.statusCode == 200){
        var $ = cheerio.load(body);
        $("a").each(function(i, element){
          if($(this).attr("href") && $(this).attr("href")[0] == "h") {
            linkElements[i] = $(this).attr("href");
          }
          else if($(this).attr("href") && $(this).attr("href")[0] == "/" && $(this).attr("href")[1] == "/"){
            linkElements[i] = "http:" + $(this).attr("href");
          }
          else{
            linkElements[i] = url + $(this).attr("href");
          }
          linkElements = _.uniq(linkElements);
          resolve("complete");
        });
      }
    });
  })
  promise.then(function(result){
    for(var i = 0; i < linkElements.length; i++){
      getText(linkElements[i]);
    }
  })
}
