const express = require('express');    
const bodyParser = require ('body-parser'); 
const isUrl = require ('is-url');
const fs = require ('fs');

const app = express();  
const porta = 8080;    //Porta onde vai ser aberto o server

var linkEnc = "";
var clicks = clicksF();
var linkfeito;

app.use (bodyParser.urlencoded ({extended: true}));
app.use (express.static('views/public'));

app.set ('view engine','ejs');


app.get ('/', function (req, res)
{
  clicks = clicksF(clicks);
  res.render('index', {linkEnc : linkEnc, clicks : clicks});
});

app.post ('/', function (req, res) 
{     
    var link = req.body.link;
    linkfeito = fazerLink();
    verificar(verificar2, linkfeito, link, res); 
});

app.get("/:linkCurto", function (req, res)  //Chama o linkOriginal com base no linkCurto
{  
    const linkC = req.params.linkCurto;
    pegarLinkCurto(pegarLinkCurto2, linkC, res);
});

function pegarLinkCurto(callback,linkC, res)
{   //Verifica se tem o Link que o usuario esta tentado usar
    fs.readFile('hits.json', 'utf8', function readFileCallback(err, data){
        if (err) throw err;
        else
        {
          var dat = JSON.parse(data);
          var resultado = 0;
          for (var i = 0; i <= dat.length - 1; i++) 
          {
            var shortLink = dat[i].shortUrl;
            if (shortLink.replace("http://enc.lk/", "") == linkC) 
            {
              var resultado = dat[i].url;  //Define o resultado = o linkOriginal
            }
          }
          callback(resultado, res);
        }
    });
}

function pegarLinkCurto2(link, res){
  if (link != 0) {    //Se for 0, ou seja, tem um resultado, ele pega o link , que é o linkOriginal recebido, e direciona para aquele link
    addClicks(clicks);
    res.redirect(link);
  }
  else if(link == 0){   //Se link == 0 ele vai carregar a pagina principal, pois não encotrou resultado
    res.render('index', {linkEnc : linkEnc, clicks : clicks});
  }
  else{    //Se link == 0 ele vai carregar a pagina principal, pois não encotrou resultado
    res.render('index', {linkEnc : linkEnc, clicks : clicks});
  }
}

function fazerLink() 
{   //Cria 5 numero/letras aleatorias
  var link = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";   //Letras e numeros possiveis de ser usados
  
  for (var i = 0; i < 5; i++) link += possible.charAt(Math.floor(Math.random() * possible.length)); //Entra em um loop de for para ficar adicionado uma letra aleatoria até chegar em 5 letras totais

  return link;   //retorna as 5 letras
}

function verificar(callback, linkfeito, link, res)
{   
    fs.readFile('hits.json', 'utf8', function readFileCallback(err, data){
        if (err) throw err;
        else
        {
            var dat = JSON.parse(data);
            var resultado = 0;
            for (var i = 0; i <= dat.length - 1; i++) 
            {
                var shortLink = dat[i].shortUrl;
                if (shortLink.replace("http://enc.lk/", "") == linkfeito) 
                {
                    var resultado = 1;
                }
            }
            callback(resultado, linkfeito, link, res)
        }
    });
}

function verificar2(resultado, linkfeito, link, res)
{    
    if (resultado == 0)
    { // Se não tiver o linkCurto no banco de dado
      if (isUrl(link))
      {   //Verifica se é um link o texto inserido pelo usuario usando o Package is-url
        salvar(linkfeito, link);  //Se for um link ele chama a função de salvar o link
        linkEnc = "Seu link curtinho: http://enc.lk/" + linkfeito;
      }
      else
      {
        linkEnc = "Por favor colocar um link valido";  //Se não for ele responde com uma mensagem de 
      }

      res.render('index', {linkEnc : linkEnc, clicks : clicks}); 
    }
    else{   //Se tiver o linkCurto ja no banco de dado, ele repete o processo de criar um linkCurto ate não ter um repetido
      linkfeito = fazerLink();
      verificar(verificar2, linkfeito, link, res); 
    }
}

function salvar(linkfeito, link) //Salva o linkCurto e linkOriginal no banco de dado
{
  var values = {  
    id: 'Miasde',             
    hits: 0, 
    url: link,
    shortUrl: 'http://enc.lk/' + linkfeito
  };

  fs.readFile('hits.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } 
    else{
        obj = JSON.parse(data); //now it an object
        obj.push(values); //add some data
        json = JSON.stringify(obj, null, 2); //convert it back to json
        fs.writeFile('hits.json', json, 'utf8', function (err) {
            if (err) throw err;
            console.log('Saved!');
          }); // write it back 
    }
  });
}
  
function clicksF()
{
  var clicksS = fs.readFileSync('./clicks.json', 'utf-8', function (err, data) 
  {
    if(err) throw err;
    var clicksS = JSON.stringify(data);
    return clicksS;
  });
  
  console.log(clicksS);
  return clicksS;
} 

function addClicks(clicks)
{
  clicks++;
  fs.writeFile('./clicks.json', clicks, function (err) {
    if (err) throw err;
  });
}

app.listen(porta, function ()  //Abre o server na porta defenida na variavel porta la em cima
{   
  console.log('Online Porta: ' + porta);
});
