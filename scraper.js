var request = require("request");
var cheerio = require("cheerio");
var _ = require("./underscore.js");
var _string = require("./underscore.string.min.js");
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'user3',
  password : 'MySQL',
  database : 'url_data'
});

var url = "http://www.cnn.com";

getLinks(url);

function cleanWords(inputWord){
  var word = inputWord.toLowerCase();
  var charactersToRemove = [".",":",",","+","(",")","'"," ","|","•"];
  for(var i = 0; i < word.length; i++){
    for(var j = 0; j < charactersToRemove.length; j++){
      if (word[i] == charactersToRemove[j] ){
        word = _string.splice(word,i,1,"");
      }
    }
  }
  return word;
}

function toWords(pageTitle, pageUrl){
  var filterWords = ["to", "the", "a", "an", "or","are","of","in","that","on","is","and","for","our","at","is"];
  var wordsArray = _string.words(pageTitle, " ");
  for(var i = 0; i < wordsArray.length; i++){
    wordsArray[i] = cleanWords(wordsArray[i]);
    for(var j = 0; j < filterWords.length; j++){
      if(wordsArray[i] == filterWords[j]){
        wordsArray.splice(i,1);
        i--;
        j=0;
      }
    }
  }
  for(var i = 0; i < wordsArray.length; i++){
    var databaseWord = {word: wordsArray[i], url:pageUrl};
    connection.query("insert into word set ?", databaseWord, function(error, result){
      if(error){
        console.log(error);
      }
    });
  }
}

function getTitle(newLink){
  var articleTitle;
  var articleDescription;
  return new Promise(function(resolve, reject){
    request(newLink, function(error, response, body){
      if(!error && response.statusCode == 200){
        var $ = cheerio.load(body);
        if($("title").text()){
          articleTitle = $("title").text();
        }
        $("meta").each(function(i, element){
          if( $(this).attr("name") == "description" ){
            articleDescription = $(this).attr("content");
          }
        });
        if(articleTitle != undefined && articleDescription != undefined){
            resolve({url: newLink, title: articleTitle, description: articleDescription});
        }
        else{
          reject("not enough data retrieved");
        }
      }
      else{
        reject("404");
      }
    })
  })
}

function getLinks(url){
  var linkElements = [];
  var articleData = [];
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
    connection.connect(function(err){
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
      console.log('connected as id ' + connection.threadId);
    });
    for(var i = 0; i < linkElements.length; i++){
      getTitle(linkElements[i]).then(function(data, err){
        var article = {url: data.url, title: data.title, description: data.description};
        connection.query("insert into url set ?", article, function(error, result){
          if(error){
            console.log(error);
          }
        })
        toWords(data.title, data.url);
        toWords(data.description, data.url);
      });
    }
  })
  setTimeout(function(){
    connection.end(function(err){
      console.log("connection closed");
    });
  }, 60000);
}
