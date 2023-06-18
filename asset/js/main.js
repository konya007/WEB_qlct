var KEYAPI=""
$(document).ready(()=> {
    $("#overlay-login").css({
        display:"flex",
        zIndex:"999"
    })
    if (localStorage.getItem("unqlct")) {
        $("#unLogin").val(localStorage.getItem("unqlct"))
    }
    $(".signInBox").hide()
    $("#creAccBtn").click(()=>{
        $(".loginBox").hide()
        $(".signInBox").fadeIn();
    })

    $("#backCreAccBtn").click(()=>{
        $(".loginBox").fadeIn();
        $(".signInBox").hide()
    })

var cdLogin=false
var cdSignIn=false

$(document).mousemove(function (e) { 
        $("#bgImg").css({
            translate : ((e.pageX / ($(document).width()/2))*50-100)+"px "+ ((e.pageY /($(document).height()/2))*50-100)+"px",
        })

        $("#creAccBtn").click(()=>{

        })

        $("#loginBtn").click(async()=>{
            if (cdLogin) return
            cdLogin=true
            var temp = {
                username: $("#unLogin").val().trim(),
                pass: $("#pwLogin").val(),
            }
            if (!temp.username) {
                $(".noiceLogin").eq(0).text("Có vấn đề ở phần tên đăng nhập")
                $("#unLogin").addClass("err");
            }else{
                $("#unLogin").removeClass("err");
                if (!temp.pass) {
                    $("#pwLogin").addClass("err");
                    $(".noiceLogin").eq(0).text("Có vấn đề ở phần mật khẩu")

                }else{
                    $("#pwLogin").removeClass("err");
                    $(".noiceLogin").eq(0).text("")
                    await fetch("https://6489866a5fa58521caafc163.mockapi.io/account",{
                        method: 'GET',
                        headers: {'content-type':'application/json'},
                      }).then(res => {
                        if (res.ok) {
                            return res.json();
                        }
                      }).then(async tasks => {
                        var check=false
                        for (let i=0;i<tasks.length;i++) {
                            if (tasks[i]["username"] == temp.username && tasks[i]["pass"] == temp.pass) {
                                KEYAPI=tasks[i]["api"]
                                data = await fetchData("GET")
                                initWeekGraph(data,dayNow.m,dayNow.fdow)
                                initStatistic(data,dayNow.m)
                                initDetailInMonth(dayNow.d,dayNow.m,dayNow.y,data)
                                localStorage.setItem("unqlct",temp.username)
                                check=true
                                break;
                            }
                        }
                        if (!check) {
                            $(".noiceLogin").eq(0).text("Tên đăng nhập hoặc mật khẩu sai!")
                        }else{
                            $("#overlay-login").hide()
                        }
                      }).catch(error => {
                        alert("Mạng nghẽn hãy thử lại!")
                        console.log(error)
                      })
                }
            }
            cdLogin=false
        })
        $("#signInBtn").click(async ()=>{
            if (cdSignIn) return
            cdSignIn=true
            var temp = {
                username: $("#unSignIn").val().trim(),
                pass: $("#pwSignIn").val(),
                api:$("#apiSignIn").val().trim(),
            }
            var checkSame = false
            await fetch("https://6489866a5fa58521caafc163.mockapi.io/account",{
                method: 'GET',
                headers: {'content-type':'application/json'},
            }).then(res => {
                if (res.ok) {
                    var task = res.json()
                    for (let i=0;i<task.length;i++) {
                        if (task[i]["username"] == temp.username) {
                            checkSame = true
                            break;
                        }
                    }
                }
            }).catch(err =>{
                alert("Lỗi tra thông tin #001")
                checkSame = true
                return
            })
            if ((!temp.username || checkSame)) {
                $(".noiceLogin").eq(1).text("Tên đăng nhập chưa nhập hoặc bị trùng lặp")
                $("#unSignIn").addClass("err");
                cdSignIn=false  
            }else{
                $("#unSignIn").removeClass("err");
                if ((!$("#pwSignIn").val()) || !($("#pwSignIn").val() == $("#pwSignIn2").val()) ) {
                    $("#pwSignIn").addClass("err");
                    $("#pwSignIn2").addClass("err");
                    $(".noiceLogin").eq(1).text("Mật khẩu không khớp")
                    cdSignIn=false  
                }else{
                    $("#pwSignIn").removeClass("err");
                    $("#pwSignIn2").removeClass("err");
                    if (temp.api.includes(".mockapi.io/")){
                        await fetch(temp.api).then(async(res)=>{
                            $(".noiceLogin").eq(1).text("Đang cập nhật dữ liệu!")
                            await fetch("https://6489866a5fa58521caafc163.mockapi.io/account",{
                                method: 'POST',
                                headers: {'content-type':'application/json'},
                                body: JSON.stringify(temp)
                            }).then(res => {
                                if (res.ok) {
                                $(".noiceLogin").eq(1).text("Tạo thành công đang làm mới trang!")
                                $(".noiceLogin").css({
                                    color:"green"
                                })
                                setTimeout(()=>{
                                    location.reload();
                                },1000)
                                    return res.json();
                                }
                            }).then(async (task) =>{
                                cdSignIn=false  
                            }).catch((err)=>{
                                alert("Lỗi tạo tài khoản!")
                                cdSignIn=false  
                            })
                           
                    }).catch((err)=>{
                        cdSignIn=false
                        alert("Lỗi kiểm tra API!")
                    })
                }else{
                    $(".noiceLogin").eq(1).text("API không hỗ trợ")
                    cdSignIn=false  
                }
            }
            }
        })
    });  
});
