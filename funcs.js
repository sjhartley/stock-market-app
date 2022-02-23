import axios from 'axios';
const cheerio = require('react-native-cheerio');
const app_stuff = require('./App.js');
import { Alert, Modal } from 'react-native';
const misc=require('./misc.js');

function nasdaq_get(keyWord){

  var msg_str="";
  const url = 'https://api.nasdaq.com/api/quote/list-type/nasdaq100';
  const options = {
    url: url,
    headers:{
      'Accept': '/',
      'User-Agent': 'Mozilla/5.0',
      'Connection': 'keep-alive',
    },
    json: true,
  }

  //A custom user agent is used so that requests made to the nasdaq API are not rejected
  //the data to be retrieved is in JSON format

  var signal_Dict = {
    "+": 1,
    "-": 0
  };

  var title_Str="Command guide for accessing NASDAQ100 data";
  var help_Str = `${title_Str}<br>${misc.line_generator('-', title_Str.length-1)}<br><br>
  1. To display the components of NASDAQ100: "t!nasdaq --l"<br>
  2. To display data associated with a specific company: "t!nasdaq --(TICKER OR COMPANY Name)"`;

  if(keyWord === 'l'){
    console.log("listing!!!");
    axios(options).then(function(response){
      var body=response.data;
      console.log(body);
      var date_str=`Time Stamp: ${body.data['date']}`;
      var stock_recs=body.data.data.rows;
      console.log(stock_recs);
      msg_str = msg_str + `Components of NASDAQ100\n${date_str}\n${misc.line_generator('-', date_str.length-1)}\n\n`;
      Object.keys(stock_recs).forEach(function(key) {
        console.log(key);
        var companyName = stock_recs[key].companyName.toString();
        var symbol = stock_recs[key].symbol.toUpperCase();
        msg_str = msg_str + `Symbol: ${symbol}, Name: ${companyName}\n\n`;
      });
      console.log(msg_str);
      alert(msg_str);
    }).catch(function(err){
      console.log(err);
    });
  }
  else if(keyWord.toLowerCase() === 'help'){
    app_stuff.navigation.navigate('Info', {
      text: help_Str,
    });
  }
  else{
    axios(options).then(function(response){
      var body=response.data;
      var date=body.data['date'];
      var stock_recs=body.data.data.rows;
      msg_str = msg_str + `Time Stamp: ${date}\n`;
      Object.keys(stock_recs).forEach(function(key) {
        var companyName = stock_recs[key].companyName.toString();
        var symbol = stock_recs[key].symbol.toUpperCase();
        if(((companyName.toLowerCase().search(keyWord.toLowerCase()) !== -1) || (symbol.toLowerCase().search(keyWord.toLowerCase()) !== -1)) && (typeof keyWord !== 'undefined')){

          var marketCap = stock_recs[key].marketCap;
          var last = stock_recs[key].lastSalePrice;
          var netChange = stock_recs[key].netChange;
          var percenChange = stock_recs[key].percentageChange;
          msg_str=`Source: ${url}<br>Symbol: ${symbol}<br>Name: ${companyName}<br>Market Cap: ${marketCap}<br>Last sale price: ${last}<br>Net change: ${netChange}<br>Percentage change: ${percenChange}`;
          console.log(msg_str);
          var textObj={
            text: msg_str
          };
          wikiSearch("nasdaq-100", symbol, textObj);
          app_stuff.navigation.navigate('Info', {
            text: msg_str
          });
          return false;
        }
      });
    });
  }
}

function wikiSearch(indice_str, ticker, obj){
  var table_link="";
  var ticker_pos="";
  var link_pos="";

  if(indice_str === "nasdaq-100"){
    table_link="https://en.wikipedia.org/wiki/NASDAQ-100";
    ticker_pos=1;
    link_pos=0;
  }
  else if(indice_str === "sp-500"){
    table_link="https://en.wikipedia.org/wiki/List_of_S%26P_500_companies";
    ticker_pos=0;
    link_pos=1;
  }
  else if(indice_str === "ftse-100"){
    table_link="https://en.wikipedia.org/wiki/FTSE_100_Index";
    ticker_pos=1;
    link_pos=0;
  }

  const base_Url="https://en.wikipedia.org/wiki/";

  axios(table_link).then(function(response){
    var body=response.data;
    let constituents=cheerio.load(body);
    constituents('table#constituents tbody tr').each(function(i, el){
      let table_entry=constituents(el);
      var ticker_entry=table_entry.children('td').eq(ticker_pos).text().trim();
      if(ticker == ticker_entry){
        var comp_wiki="https://en.wikipedia.org" + table_entry.children('td').eq(link_pos).children('a').attr('href');
        console.log(comp_wiki);
        companyDataRetr(comp_wiki, obj);
        return false;
      }
    });

  });

}

function companyDataRetr(url, obj){
  axios(url).then(function(response){
    var body=response.data;
    let comp_txt=cheerio.load(body);
    comp_txt('div.mw-parser-output p b').each(function(i, el){
      let indice_txt=comp_txt(el);
      if(i === 0){
        var descr=misc.bracket_remover(indice_txt.parents('p').text());
        console.log(descr);
        var logo="";
        if(typeof comp_txt('table.infobox.vcard .image img').attr('src') !== 'undefined'){
          logo="https:"+comp_txt('table.infobox.vcard .image img').attr('src');
        }
        console.log(logo);
        var hq="";
        var industry="";
        comp_txt('table.infobox.vcard tbody tr th').each(function(i, el){
          var box=comp_txt(el);
          if(box.text() === "Headquarters"){
            hq = box.parent('tr').children('td').text();
          }
          else if(box.text() === "Industry"){
            industry = box.parent('tr').children('td').text();
          }
        });
        descr = `Source: ${url}<br>**Industry:** ${industry}<br>**Headquarters:** ${hq}<br>**Company Overview:** ${descr}`;

        obj.text=obj.text+`<br><br><img src="${logo}"><br>${descr}`;
        console.log(obj.text);
        app_stuff.navigation.navigate('Info', {
          text: obj.text
        });
        return false;
      }
    });
  });
}

exports.nasdaq_get = nasdaq_get;
