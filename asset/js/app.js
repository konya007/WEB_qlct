async function fetchData(x,y,z){
    if (x=="GET" && !y && !z) {
        await fetch(KEYAPI,{
            method:"GET",
            headers:{
                'content-type':'application/json'
            }
        }).then(res =>{
            data = res.json()
        })
        return data
    }
    if (x=="POST" && y && !z) {
        await fetch(KEYAPI,{
            method:"POST",
            headers:{
                'content-type':'application/json'
            },body: JSON.stringify(y)
        }).then(res =>{
            data = res.json()
        })
        return data
    }
    if (x=="PUT" && y && z) {
        await fetch(KEYAPI+"/"+y,{
            method:"PUT",
            headers:{
                'content-type':'application/json'
            },body: JSON.stringify(z)
        }).then(res =>{
            data = res.json()
        })
        return data
    }
}

function daysInMonth(x,y) {
    switch(x) {
        case 1:case 3:case 5:case 7:case 8:case 10:case 12:{
            return 31;
            break
        }
        case 2:{
            if ((y%4==0 && y%100!=0)|| (y % 400 == 0)) {
                return 29
            }else {
                return 28
            }
            break;
        }
        case 4:case 6:case 9:case 11:{
            return 30;
            break
        }
        default:{
            return 0
        }
    }
}

const DATENOW = new Date();
var dayNow = {
    "fdow":DATENOW.getDate() - ((DATENOW.getDay()==0)?7:DATENOW.getDay())+1,
    "d":DATENOW.getDate(),
    "m":DATENOW.getMonth()+1,
    "y":DATENOW.getFullYear(),
}

$(document).ready(async()=>{    
    $("#addChiTieu").click(async()=>{
        data = await fetchData("GET")
        $("#overplay-form").css({
            display:"flex"
        });        
        $("#timeChiTieu").val(new Date().toDateInputValue())
        $(".chiTieuBox p").css({
            color:"green"
        })
        $(".chiTieuBox p").text("Hãy nhập đủ thông tin!")
    })
    $(".chiTieuBox button:nth-child(2)").click(()=>{
        $("#overplay-form").css({
            display:"none"
        })
    })
    $(".chiTieuBox button:nth-child(1)").click(async ()=>{
        var tempdata = {
            "type":$("#typeChiTieu").val().trim(),
            "date":$("#timeChiTieu").val(),
            "name":$("#nameChiTieu").val().trim(),
            "value":parseInt($("#valueChiTieu").val().trim()),
        }
        if (!tempdata["name"]) {
            $(".chiTieuBox p").css({
                color:"red"
            })
            $(".chiTieuBox p").text("Bạn chưa nhập tên chi tiêu!")
        }else if (!tempdata["value"]){
            $(".chiTieuBox p").css({
                color:"red"
            })
            $(".chiTieuBox p").text("Số tiền không hợp lệ!")
        }else{
            $(".chiTieuBox p").css({
                color:"green"
            })
            $(".chiTieuBox p").text("Nhập chi tiêu thành công!!!")
            await upData(tempdata)
            
            setTimeout(async ()=>{
                $("#overplay-form").css({
                    display:"none",
                    
                })
                data = await fetchData("GET")
                initWeekGraph(data,dayNow.m,dayNow.fdow)
                initStatistic(data,dayNow.m)
                initDetailInMonth(dayNow.d,dayNow.m,dayNow.y,data)
            },2000)
        }
        
    })
    $("#typeThongKe").change(()=>{
        switch ($("#typeThongKe").val()) {
            case "w":{
                initWeekGraph(data,dayNow.m,dayNow.fdow)
                break;
            }
            case "m":{
                initMonthGraph(data,dayNow.m)
                break;
            }
            case "y":{
                initYearGraph(data)
                break;
            }
        }
    })
})

function initWeekGraph(data,m,fdow) {
    const pMax = [50,100,200,250,500,750,1000,1500,2000,2500,5000,7500,10000,15000,20000];
    var p = [0,0,0,0,0,0,0]
    for (let i=0;i<data.length;i++) {
        if (data[i]["thang"] == m) {
            for (let j=0;j<data[i]["chitiet"].length;j++) {
                if (data[i]["chitiet"][j]["ngay"] >= fdow && data[i]["chitiet"][j]["ngay"]<(fdow+7)) {
                    for (let k=0;k<data[i]["chitiet"][j]["detail"].length;k++) {
                        p[data[i]["chitiet"][j]["ngay"] - fdow]+=data[i]["chitiet"][j]["detail"][k]["gia"]
                    }
                }
            }
            break;
        }
    }
    var maxVal=Math.max(...p)/1000
    for (let i=0;i<pMax.length;i++) {
        if (pMax[i]>=maxVal) {
            maxVal=pMax[i]
            break;
        }
    }
    var temp=""
    for (let i=1;i<=10;i++) {
        temp+=`<p>${(maxVal/10)*i}k</p>`
    }
    $(".thongKeBox .indexScaleBox .indexY").html(temp);
    $(".thongKeBox .graphScaleBox .indexX").html(`<p>T2</p><p>T3</p><p>T4</p><p>T5</p><p>T6</p><p>T7</p><p>CN</p>`);

    var temp=""
    for (let i=1;i<=7;i++) {
        temp+=`<div class="charIndexBox"> <div class="char"></div> </div>`
    }
    $(".thongKeBox .graphScaleBox .graphBox").html(temp);
    setTimeout(()=>{
        for (let i=1;i<=7;i++) {
            $(`.thongKeBox .graphScaleBox .graphBox .charIndexBox:nth-child(${i}) .char`).css({
                height:((p[i-1]/1000)/maxVal)*100+"%"
            })
            $(`.charIndexBox:nth-child(${i}) .char`).mouseover(()=>{
                $("#boxDetailOfChar p").text(p[i-1]/1000 + "k")
                $("#boxDetailOfChar").css({
                    opacity:"1",
                    bottom:($(`.charIndexBox:nth-child(${i}) .char`).height())+"px"
                })
                              

            });
            $(`.charIndexBox:nth-child(${i}) .char`).mouseleave(()=> { 
                $("#boxDetailOfChar").css({opacity:"0"})
            });
        }
    },500)
    $(".graphBox .charIndexBox").css({
        width: "calc(100% / 7)"
    })
    $(".indexX p").css({
        width: "calc(100% / 7)"
    })
}

function initMonthGraph(data,m) {
    const pMax = [50,100,200,250,500,750,1000,1500,2000,2500,5000,7500,10000,15000,20000];
    var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    for (let i=0;i<data.length;i++) {
        if (data[i]["thang"] == m) {
            for (let j=0;j<data[i]["chitiet"].length;j++) {
                if (data[i]["chitiet"][j]["ngay"] >= 1 && data[i]["chitiet"][j]["ngay"] <= daysInMonth(m,dayNow.y)) {
                    for (let k=0;k<data[i]["chitiet"][j]["detail"].length;k++) {
                        p[data[i]["chitiet"][j]["ngay"] - 1]+=data[i]["chitiet"][j]["detail"][k]["gia"]
                    }
                }
            }
            break;
        }
    }
    var maxVal=Math.max(...p)/1000
    for (let i=0;i<pMax.length;i++) {
        if (pMax[i]>=maxVal) {
            maxVal=pMax[i]
            break;
        }
    }
    var temp=""
    for (let i=1;i<=10;i++) {
        temp+=`<p>${(maxVal/10)*i}k</p>`
    }
    $(".thongKeBox .indexScaleBox .indexY").html(temp);
    var temp=""
    for (let i=1;i<=daysInMonth(m,dayNow.y);i++) {
        temp+=`<p>${i}</p>`
    }
    $(".thongKeBox .graphScaleBox .indexX").html(temp);

    var temp=""
    for (let i=1;i<=daysInMonth(m,dayNow.y);i++) {
        temp+=`<div class="charIndexBox"> <div class="char"></div> </div>`
    }
    $(".thongKeBox .graphScaleBox .graphBox").html(temp);
    setTimeout(()=>{
        for (let i=1;i<=daysInMonth(m,dayNow.y);i++) {
            $(`.thongKeBox .graphScaleBox .graphBox .charIndexBox:nth-child(${i}) .char`).css({
                height:((p[i-1]/1000)/maxVal)*100+"%"
            })
            $(`.charIndexBox:nth-child(${i}) .char`).mouseover(()=>{
                $("#boxDetailOfChar p").text(p[i-1]/1000 + "k")
                $("#boxDetailOfChar").css({
                    opacity:"1",
                    bottom:($(`.charIndexBox:nth-child(${i}) .char`).height())+"px"
                })
                              

            });
            $(`.charIndexBox:nth-child(${i}) .char`).mouseleave(()=> { 
                $("#boxDetailOfChar").css({opacity:"0"})
            });
        }
    },500)
    console.log(p + " " + maxVal)
    $(".graphBox .charIndexBox").css({
        width: "calc(100% / 12)"
    })
    $(".indexX p").css({
        width: "calc(100% / 12)"
    })
}

function initStatistic(data,m) {
    $(".statisticBox h1").text("Thông tin chi tiêu Tháng "+m)
    var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    var avgM=0
    var sumM=0
    for (let i=0;i<data.length;i++) {
        if (data[i]["thang"] == m) {
            for (let j=0;j<data[i]["chitiet"].length;j++) {
                if (data[i]["chitiet"][j]["ngay"] >= 1 && data[i]["chitiet"][j]["ngay"] <= daysInMonth(m,dayNow.y)) {
                    for (let k=0;k<data[i]["chitiet"][j]["detail"].length;k++) {
                        p[data[i]["chitiet"][j]["ngay"] - 1]+=data[i]["chitiet"][j]["detail"][k]["gia"]
                        sumM+=data[i]["chitiet"][j]["detail"][k]["gia"]
                    }
                }
            }
            break;
        }
    }
    avgM=sumM / daysInMonth(m,dayNow.y)
        $(".statisticBox .statistic").eq(0).text(sumM + " đ")
        $(".statisticBox .statistic").eq(1).text(Math.round(avgM) + " đ")
        $(".statisticBox .statistic").eq(2).text(p[dayNow.d-1] + " đ")
}

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});



async function upData(x) {
    var d = DateStringtoArr(x.date)
    var pos=-1
    var id=-1
    for (let i=0;i<data.length;i++) {
        if (data[i]["thang"] == d[1] && data[i]["nam"] == d[2]) {
            pos=i
            id=data[i]["id"]
            var temp= data[i]
            var have=false;
            for (let j=0;j<temp["chitiet"].length;j++) {
                if (temp["chitiet"][j]["ngay"] == d[0]) {
                    have=true
                    temp["chitiet"][j]["detail"].push({
                        "loai": x.type,
                        "ten": x.name,
                        "gia": x.value
                    })
                    break
                }
            }
            if(!have) {
                temp["chitiet"].push({
                    "ngay": d[0],
                    "detail": [{
                        "loai": x.type,
                        "ten": x.name,
                        "gia": x.value
                    }]
                })
            }
            await fetchData("PUT",id,temp)
        }
    }
    if (pos==-1) {
        var temp={
            "thang": d[1],
            "nam": d[2],
            "chitiet": [
             {
              "ngay": d[0],
              "detail": [{
                "loai": x.type,
                "ten": x.name,
                "gia": x.value
              }]
             }
            ]
        }
        fetchData("POST",temp)
    }
}

function initDetailInMonth(d,m,y,data) {
    var check=false
    var dataTemp=[{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    },{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    },{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    },{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    },{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    },{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    },{
        "AnUong":[],
        "VuiChoi":[],
        "GiaDung":[],
        "HocTap":[],
        "HoaDon":[],
        "Khac":[],
    }]
    for (let i=0;i<data.length;i++) {
        if (data[i]["thang"]==m && data[i]["nam"] == y) {
            for (let j=0;j<data[i]["chitiet"].length;j++) {
                if (data[i]["chitiet"][j]["ngay"]<= d && data[i]["chitiet"][j]["ngay"]> (d - Math.min(d,7))) {
                    
                    for (let k=0;k<data[i]["chitiet"][j]["detail"].length;k++) {
                        switch(data[i]["chitiet"][j]["detail"][k]["loai"]) {
                            case "AnUong":{
                                dataTemp[d - data[i]["chitiet"][j]["ngay"]]["AnUong"].push(
                                    {
                                        "name":data[i]["chitiet"][j]["detail"][k]["ten"],
                                        "gia":data[i]["chitiet"][j]["detail"][k]["gia"]                        
                                    }
                                )
                                
                                break
                            }
                            case "VuiChoi":{
                                dataTemp[d - data[i]["chitiet"][j]["ngay"]]["VuiChoi"].push(
                                    {
                                        "name":data[i]["chitiet"][j]["detail"][k]["ten"],
                                        "gia":data[i]["chitiet"][j]["detail"][k]["gia"]                        
                                    }
                                )
                                break
                            }
                            case "GiaDung":{
                                dataTemp[d - data[i]["chitiet"][j]["ngay"]]["GiaDung"].push(
                                    {
                                        "name":data[i]["chitiet"][j]["detail"][k]["ten"],
                                        "gia":data[i]["chitiet"][j]["detail"][k]["gia"]                        
                                    }
                                )
                                break
                            }
                            case "HocTap":{                            
                                dataTemp[d - data[i]["chitiet"][j]["ngay"]]["HocTap"].push(
                                    {
                                        "name":data[i]["chitiet"][j]["detail"][k]["ten"],
                                        "gia":data[i]["chitiet"][j]["detail"][k]["gia"]                        
                                    }
                                )
                                break
                            }
                            case "HoaDon":{                                
                                dataTemp[d - data[i]["chitiet"][j]["ngay"]]["HoaDon"].push(
                                    {
                                        "name":data[i]["chitiet"][j]["detail"][k]["ten"],
                                        "gia":data[i]["chitiet"][j]["detail"][k]["gia"]                        
                                    }
                                )
                                break
                            }
                            case "Khac":{                                
                                dataTemp[d - data[i]["chitiet"][j]["ngay"]]["Khac"].push(
                                    {
                                        "name":data[i]["chitiet"][j]["detail"][k]["ten"],
                                        "gia":data[i]["chitiet"][j]["detail"][k]["gia"]                        
                                    }
                                )
                                break
                            }
                        }
                    }                    
                }
            }
            break;
        }
    }

    //if (!check) return
    var temp=""
    for (let i=0;i<Math.min(d,7);i++) {
        var detail=""
        if (dataTemp[i]["AnUong"].length>0) {
            var xx=""
            for (let m=0;m<dataTemp[i]["AnUong"].length;m++) {
                xx+=`
                    <p>+ ${dataTemp[i]["AnUong"][m]["name"]}</p>
                    <p>${dataTemp[i]["AnUong"][m]["gia"]}đ</p>
                `
            }
            detail+=`<li>
                <h2>[Ăn uống]</h2>
                ${xx}
            </li>`
        }
        
        if (dataTemp[i]["HocTap"].length>0) {
            var xx=""
            for (let m=0;m<dataTemp[i]["HocTap"].length;m++) {
                xx+=`
                    <p>+ ${dataTemp[i]["HocTap"][m]["name"]}</p>
                    <p>${dataTemp[i]["HocTap"][m]["gia"]}đ</p>
                `
            }
            detail+=`<li>
                <h2>[Học Tập]</h2>
                ${xx}
            </li>`
        }
        if (dataTemp[i]["GiaDung"].length>0) {
            var xx=""
            for (let m=0;m<dataTemp[i]["GiaDung"].length;m++) {
                xx+=`
                    <p>+ ${dataTemp[i]["GiaDung"][m]["name"]}</p>
                    <p>${dataTemp[i]["GiaDung"][m]["gia"]}đ</p>
                `
            }
            detail+=`<li>
                <h2>[Gia Dụng]</h2>
                ${xx}
            </li>`
        }
        if (dataTemp[i]["HoaDon"].length>0) {
            var xx=""
            for (let m=0;m<dataTemp[i]["HoaDon"].length;m++) {
                xx+=`
                    <p>+ ${dataTemp[i]["HoaDon"][m]["name"]}</p>
                    <p>${dataTemp[i]["HoaDon"][m]["gia"]}đ</p>
                `
            }
            detail+=`<li>
                <h2>[Hóa đơn]</h2>
                ${xx}
            </li>`
        }
        if (dataTemp[i]["VuiChoi"].length>0) {
            var xx=""
            for (let m=0;m<dataTemp[i]["VuiChoi"].length;m++) {
                xx+=`
                    <p>+ ${dataTemp[i]["VuiChoi"][m]["name"]}</p>
                    <p>${dataTemp[i]["VuiChoi"][m]["gia"]}đ</p>
                `
            }
            detail+=`<li>
                <h2>[Vui chơi]</h2>
                ${xx}
            </li>`
        }
        if (dataTemp[i]["Khac"].length>0) {
            var xx=""
            for (let m=0;m<dataTemp[i]["Khac"].length;m++) {
                xx+=`
                    <p>+ ${dataTemp[i]["Khac"][m]["name"]}</p>
                    <p>${dataTemp[i]["Khac"][m]["gia"]}đ</p>
                `
            }
            detail+=`<li>
                <h2>[Khác]</h2>
                ${xx}
            </li>`
        }  
        temp+=`<li class="detailDay">
            <p class="detailDayTitle">Ngày ${d-i}/${m}</p>
            <ul>
            ${detail}
            </ul>
        </li>`
    }
    $(".listDetailOfDay").html(temp)
}

// GPT HELP QUICK
function DateStringtoArr(dateString) {
    const dateParts = dateString.split('-'); // Tách chuỗi thành các phần tử dựa trên dấu '-'
    
    // Chuyển đổi các phần tử thành số
    const day = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[0], 10);
  
    // Trả về mảng có 3 giá trị [day, month, year]
    return [day, month, year];
  }