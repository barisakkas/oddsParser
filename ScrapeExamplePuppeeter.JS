const puppeteer = require("puppeteer");
const con = require("./db/MySqlConnection")
const dateUtils = require("./utils/date-utils")
const firebaseInserter = require("./firebase/FirebaseInserter")
const oddsportalCredentials = require("./assets/oddsPortalCredentials")

cycle = 0

parseItem1 = (match, str) => {
  let sign = str.indexOf("»")
  match.category = str.substring(0,sign-1)
  str = str.substring(sign + 3)
  let signEnd = str.indexOf("»")
  match.country = str.substring(1,signEnd-1)
  match.league = str.substring(signEnd+2)
}

parseItem2 = (match, str) => {
  let arr = str.split("\t")
  match.betType = arr[0]
  if (arr.length == 4){
    match.bet = arr[2]
  } else {
    match.bet = ""
  }
}

parseItem3 = (match, str) => {
  let arr = str.split("\t")
  match.startTime = dateUtils.getDate(arr[0])
  match.matchName = arr[1]
  match.dropPerc = arr[2]
  if (arr.length == 5){
    checkBet(match, arr[3])
    suggestedBetCheck(1,1,arr[3],match)
  } else if (arr.length == 6){
    if (checkBet(match, arr[3])){
      suggestedBetCheck(2,1,arr[3],match)
    } else {
      checkBet(match, arr[4])
      suggestedBetCheck(2,2,arr[4],match)
    }
  } else {
    if (checkBet(match, arr[3])){
      suggestedBetCheck(3,1,arr[3],match)
    } else if (checkBet(match, arr[4])){
      suggestedBetCheck(3,2,arr[4],match)
    } else {
      checkBet(match, arr[5])
      suggestedBetCheck(3,3,arr[5],match)
    }
  }
  match.numOfBooks = arr[arr.length-1]
}

const checkBet = (match, str) => {
  //console.log(match)
  //console.log(str)
  if (str.includes("\n")){
    let arr1 = str.split("\n")
    match.startingOdd = arr1[0]
    match.latestOdd = arr1[1]
    return 1;
  } else return 0
}

const suggestedBetCheck = (count, order, str, match) => {
  if (count == 1){
    if (match.bet.includes("1/1") || match.bet.includes("X/1") || match.bet.includes("2/1")){
      match.suggestedBet = "1"
    } else if (match.bet.includes("2/2") || match.bet.includes("X/2") || match.bet.includes("1/2")){
      match.suggestedBet = "2"
    } else {
      match.suggestedBet = "Any"
    }
  } else if (count == 2){
    if (match.betType.includes("O/U")){
      match.suggestedBet = order == 1 ? "Over" : "Under"
    } else {
      match.suggestedBet = order == 1 ? "1" : "2"
    }
  } else {
    if (order == 1){
      match.suggestedBet = "1"
    } else if (order == 2){
      match.suggestedBet = "Any"
    } else {
      match.suggestedBet = "2"
    }
  }
}

setInterval( async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://www.oddsportal.com/login/');
  await page.type('#login-username1', oddsportalCredentials.userName);
  await page.type('#login-password1', oddsportalCredentials.pwd);
  await page.click("div.item button[name='login-submit']");
  await page.waitFor(500);
  await page.goto("https://www.oddsportal.com/dropping-odds/#2/2/0/soccer")
  await page.waitFor(1000);

  const matchNames = await page.evaluate(() =>
    Array.from(document.querySelectorAll('tr.sr1')).map(game => game.innerText)
  )

  let match = {};
  let mcount = 0;
  let currentDate = dateUtils.getCurrentDate()

  for (var i = 0; i < matchNames.length; i=i+3){
    parseItem1(match, matchNames[i])
    parseItem2(match,matchNames[i+1])
    parseItem3(match, matchNames[i+2])
    match.cycle = cycle
    match.dropTime = currentDate
    console.log(match)
    con.query('INSERT INTO dropping_odds SET ?', match, (err, res) => {
      if(err) throw err;
      console.log('Last insert ID:', res.insertId);
    });
    mcount++;
  }
  cycle++;
  console.log(mcount)
  browser.close()

  console.log("inserting to fb..")

  firebaseInserter()

}, 30000)


