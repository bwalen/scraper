var request = require("request");
var cheerio = require("cheerio");
var _ = require("./underscore.js");
var _string = require("./underscore.string.min.js");

var url = "http://www.foxnews.com";

getLinks(url);

function getText(url){
  var text = [];
  request(url, function(error, response, body){
    if(!error){
      var $ = cheerio.load(body);
      $("p, li, ul, ol, span, article, blockquote, h1, h2, h3, h4, h5, h6").each(function(i, element){
        if($(this).text().length > 12){
          text[i] = $(this).text();
        }
      })
    }
    console.log(_string.clean(_.uniq(text).join(" ")));
  })
  //return text;
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
        linkElements = _.uniq(linkElements);
      });
    }
  });
}
