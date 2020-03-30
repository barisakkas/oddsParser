const getMonth = (month) => {

    switch (month) {
      case "Ocak":
      case "Jan":
        return "01";
  
      case "Şubat":
      case "Subat":
      case "Feb":
        return "02";
  
      case "Mart":
      case "Mar":
        return "03";
  
      case "Nisan":
      case "Apr":
        return "04";
  
      case "Mayıs":
      case "Mayis":
      case "May":
        return "05";
  
      case "Haziran":
      case "Jun":
        return "06";
  
      case "Temmuz":
      case "Jul":
        return "07";
  
      case "Ağustos":
      case "Agustos":
      case "Aug":
        return "08";
  
      case "Eylül":
      case "Eylul":
      case "Sep":
        return "09";
  
      case "Ekim":
      case "Oct":
        return "10";
  
      case "Kasım":
      case "Kasim":
      case "Nov":
        return "11";
  
      case "Aralık":
      case "Aralik":
      case "Dec":
        return "12";
  
      default:
        return null;
    }
  }

  const getDate = (date_str)=> {
    //console.log("date_str : ",date_str)
    let arr = date_str.split("\n")
    let day = arr[0].toString()
    let arr2 = arr[1].split(":")
    let hour = arr2[0]
    let min = arr2[1]
    dt = new Date()
    dt.setUTCHours(hour,min,0,0)
    if (day == "Today"){
      //dt.setDate()
    } else if (day == "Tomorr.") {
      dt.setUTCDate(dt.getDate()+1)
    } else {
      let arr3 = day.split(/\s{1}/)
      let dayOfDay = arr3[0]
      let monthOfDay = arr3[1]
      //console.log("dayOfDay :",dayOfDay)
      //console.log("monthOfDay :",monthOfDay)
      monthOfDay = getMonth(monthOfDay)
      //console.log("monthOfDay2 :",monthOfDay)
      dt.setUTCDate(dayOfDay)
      dt.setUTCMonth(monthOfDay-1)
      //dt.setMinutes(min)
    }
    //console.log(dt)
    return dt
  }

  const getCurrentDate = () => {
    dt = new Date()
    dt.setUTCSeconds(0,0)
    return dt
  }

  module.exports = {
    getDate : getDate,
    getCurrentDate : getCurrentDate
  }