//const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

'use strict';
const {
  dialogflow,
  BasicCard,
  BrowseCarousel,
  BrowseCarouselItem,
  Button,
  Carousel,
  Image,
  LinkOutSuggestion,
  List,
  MediaObject,
  Suggestions,
  SimpleResponse,
  Table,
 } = require('actions-on-google');

 const functions = require('firebase-functions');
const admin = require('firebase-admin');

const path = "/luces/states/";

var serviceAccount = require('./firestoreKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://myhouse-3a942.firebaseio.com/"
});

const lucesDB = {
    "sala": 1,
    "cocina": 2,
    "dormitorio": 3,
    "comedor": 2,
    "cuarto": 3
};


const app = dialogflow({debug: true});

const activarLuces = function (destinoLuz, estadoSolicitado, conv){
    console.log("Estado solicitado: " +  estadoSolicitado);
    var estadoSolicitadoConvertido = estadoSolicitado === 'encender' ? true : (estadoSolicitado === 'apagar' ? false: null);
    console.log("Estado convertido: " +  estadoSolicitadoConvertido);
    

    if(destinoLuz === 'todas'){
        //
        //	Visit non-inherited enumerable keys
        //
        Object.keys(lucesDB).forEach(function(key) {
            admin.database().ref(path + lucesDB[key]).set(estadoSolicitadoConvertido);
        });
        
    }else{
        console.info("Identificador de luz: " +  lucesDB[destinoLuz]);
        admin.database().ref(path + lucesDB[destinoLuz]).set(estadoSolicitadoConvertido);
    }
    
    
    if(estadoSolicitadoConvertido){
        conv.ask(new SimpleResponse({
            speech:"Encendiendo luz de " + destinoLuz,
            text:"Encendiendo luz de " + destinoLuz + " [" + estadoSolicitado + "]" + "😬",
        }));
    }else{
        conv.ask(new SimpleResponse({
            speech:"Apagando luz de " + destinoLuz,
            text:"Apagando luz de " + destinoLuz + " [" + estadoSolicitado + "]" + "😬",
        }));
    }
}
/*
app.intent('Luces[Incompleta]', (conv) => {
	conv.ask(new SimpleResponse({
		speech:"¿De qué lugar de la casa?",
        text:"¿De qué lugar de la casa?",
    }));
	conv.ask(new Suggestions(['sala', 'comedor', 'dormitorio']));
});*/


//Firestore integación
app.intent('Luces[Incompleta]-correcta', (conv) => {
    var destinoLuz = conv.parameters["DestinoLuz"];
    const contexto = conv.contexts.get('lucesincompleta-followup');
    var estadoSolicitado = contexto.parameters["LuzEstado"];

    activarLuces(destinoLuz, estadoSolicitado, conv);
    
    return console.log("Done!");
});

app.intent('luces[Completa]', (conv) => {
    var destinoLuz = conv.parameters["DestinoLuz"];
    var estadoSolicitado = conv.parameters["LuzEstado"];

    activarLuces(destinoLuz, estadoSolicitado, conv);
    
    return console.log("Done!");
});


/*
app.intent('Precios[Completa]', (conv) => {
    var modelo = conv.parameters["Bicicletas"];
    var referencia = db.collection("Bicicletas").doc(modelo);
        return referencia.get().then( snap => {
            if (snap.exists) {
                const allData = snap.data();
                const precio = allData.precio;
                conv.ask(new SimpleResponse({
            		speech:"El precio de" + modelo + "es de :" + precio,
                    text:"El precio de" + modelo + "es de :" + precio + "😬",
                }));
                 return console.log("Done!");
             }else{
                 conv.ask(new SimpleResponse({
                     speech:"Lo siento, este modelo no existe",
                     text:"Lo siento, este modelo no existe",
                 }));
             return console.log("Done!");
         }
     })
});
*/

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);