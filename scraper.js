var request = require("request");
var cheerio = require("cheerio");
var _ = require("./underscore.js");
var _string = require("./underscore.string.min.js");

var url = "http://www.cnn.com";

getLinks(url);

function cleanWords(word){
  word = word.toLowerCase();
  var charactersToRemove = [".",":",",","+","(",")"];
  for(var i = 0; i < word.length; i++){
    for(var j = 0; j < charactersToRemove.length; j++){
      if (word[i] == charactersToRemove[j] ){
        word = _string.splice(word,i,1,"");
      }
    }
  }
  return word;
}

function getText(url){
  var text = [];
  request(url, function(error, response, body){
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(body);
      $("p, li, ul, ol, span, article, blockquote, div").each(function(i, element){
        if($(this).text().length > 12){
          text[i] = $(this).text();
        }
      })
    }
    var wordsArray = _string.words(_string.clean(_.uniq(text).join(" ")));
    for (var i = 0; i < wordsArray.length; i++ ){
      console.log(cleanWords(wordsArray[i]));
    }
  })
}

function getTitle(newLink){
  var title;
  request(newLink, function(error, response, body){
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(body);
      title = $("title").text();
      console.log("----" + title + "----");
      $("meta").each(function(i, element){
        if( $(this).attr("name") == "description" ){
          console.log($(this).attr("content"));
        }
      })
    }
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
            linkElements.push($(this).attr("href"));
          }
          else if($(this).attr("href") && $(this).attr("href")[0] == "/" && $(this).attr("href")[1] == "/"){
            linkElements.push("http:" + $(this).attr("href"));
          }
          else{
            linkElements.push(url + $(this).attr("href"));
          }
          linkElements = _.uniq(linkElements);
          resolve("complete");
        });
      }
    });
  })
  promise.then(function(result){
    for(var i = 0; i < linkElements.length; i++){
      getTitle(linkElements[i]);
    }
  })
}
