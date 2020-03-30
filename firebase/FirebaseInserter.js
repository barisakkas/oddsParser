const con = require("../db/MySqlConnection")
var firebase = require("firebase-admin");
var jsonObj = require("../assets/valuetracker-c9f73-firebase-adminsdk-d4ary-943d9bd00c.json");
firebase.initializeApp({
  credential: firebase.credential.cert(jsonObj),
  databaseURL: "https://valuetracker-c9f73.firebaseio.com/"
});

const prepareOddsAndInsertToFirebase = () => {
    
  con.query('SELECT * FROM dropping_match', (err,rows) => {
    if(err) throw err;
  
    console.log('Data received from Db:');
    
    var ref = firebase.database().ref('result');
    ref.set("")

    rows.map(row => {
      row.startTime = row.startTime.toString().substring(0,row.startTime.toString().indexOf(" G"))
      row.first_droptime = row.first_droptime.toString().substring(0,row.first_droptime.toString().indexOf(" G"))
      row.last_droptime = row.last_droptime.toString().substring(0,row.last_droptime.toString().indexOf(" G"))
    })

    for (var i = 0; i < rows.length; i++){
      let match = rows[i]
      con.query(`SELECT * FROM counts_per_cycle WHERE matchName = "${match.matchName}"`, (err2,rowsDetail) => {
        if(err2) throw err2;

        match.matchDetail = rowsDetail
        console.log(match)
        ref.push(match)
      });
    }
    //ref.set(matchArray);
  });
}

module.exports = prepareOddsAndInsertToFirebase