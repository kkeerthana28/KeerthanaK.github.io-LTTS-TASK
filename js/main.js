const service_id = "service_mob5xhx";
const emailjsuserid = "DbPuCxCXgGADUjG3N";
const template_id = "template_jcq1vgb";

function frmid(id){
    return document.getElementById(id);
}

function signed_in(){
    if(window.localStorage.getItem("signin")){
        window.location.href="./profile.html";
    }else{
        verifyLink();
    }
}

function is_user(email){
    email = email.trim();
    if(email!=""){
        $.ajax({
            type: 'POST',  
            url: './php/main.php',
            data: { fuc:"is_user", email:email},
            success: function(response) {
                if(response==="found"){
                    verifyEmail(email);
                    return true;
                }
                else if(response==="notfound") {
                    alert("user not found");
                    return false;
                }
            }
        });
    }else(alert("Error:email not found!"))
}

function is_verified(email){
    email = email.trim();
    if(email!=""){
        $.ajax({
            type: 'POST',  
            url: './php/main.php',
            data: { fuc:"is_verified", email:email},
            success: function(response) {
                if(response==="found"){
                    fetch_profile();
                }
                else if(response==="notfound") {
                    verifyLink();
                }
            }
        });
    }else(alert("Error:email not found!"))
}


function signup(){
    var name = frmid("su-name").value;
    var contact = frmid("su-contact").value;
    var email = frmid("su-email").value;
    var password = frmid("su-password").value;
    var re_password = frmid("su-re_password").value;

    if(name!="" && contact!="" && email!="" && password===re_password){
        $.ajax({
            type: 'POST',  
            url: './php/main.php', 
            data: { fuc:"signup", name:name, contact:contact, email:email, password:password },
            success: function(response) {
                if(response=="registered"){
                    window.localStorage.setItem("signin", true);
                    window.localStorage.setItem("email", email);
                    window.location.href="./profile.html";
                }
                else if(response=="exists") {
                    alert("User with this email already Registered");
                }
            }
        });
    }else{
        alert("Provide required details");
    }
}

function signin(){
    var email = frmid("si-email").value;
    var password = frmid("si-password").value;
    
    if(email!="" && password!=""){
        $.ajax({
            type: 'POST',  
            url: './php/main.php',
            data: { fuc:"signin", email:email, password:password },
            success: function(response) {
                if(response=="found"){
                    window.localStorage.setItem("signin", true);
                    window.localStorage.setItem("email", email);
                    window.location.href="./profile.html";
                }
                else if(response=="notfound") {
                    alert("user not found");
                    window.localStorage.setItem("signin", false);
                }
            }
        });
    }else{
        alert("Provide required details");
    }
}


function signout(){
    window.localStorage.clear();
    window.location.href="./index.html";
}

function isVerified(){
    $('#verified').css("display","none");
}

function fetch_profile(){
    verifyLink();
    if(window.localStorage.getItem("signin")){
        $.ajax({
            type: 'POST',  
            url: './php/main.php',
            data: { fuc:"profile", email:window.localStorage.getItem("email") },
            success: function(response) {
                data=response.split("&");
                frmid("name").value=data[0];
                frmid('welcome').innerHTML="Welcome "+data[0];
                frmid("contact").value=data[1];
                frmid("email").value=data[2];
                frmid("password").value=data[3];
                if(data[4]==="verified"){
                    $("#verified").css("display","block");
                    $("#verify").css("display","none");
                }else{
                    $("#verified").css("display","none");
                    $("#verify").css("display","block");
                }
            }
        });
    }else{
        window.location.href = "./index.html";
    }
}

function update(){
    var name = frmid("name").value;
    var contact = frmid("contact").value;
    var email = frmid("email").value;
    var password = frmid("password").value;
    
    if(name!="" && contact!="" && email!="" && password!=""){
        $.ajax({
            type: 'POST',  
            url: './php/main.php', 
            data: { fuc:"update", name:name, contact:contact, email:window.localStorage.getItem("email"), email_c:email, password:password },
            success: function(response) {
                if(response==="updated"){
                    window.localStorage.setItem("signin", true);
                    window.localStorage.setItem("email", email);
                    window.location.href="./profile.html";
                }
                else{
                    alert(response);
                }
            }
        });
    }else{
        alert("Provide required details")
    }
}



emailjs.init(emailjsuserid);

function verifyEmail(email) {
    email = email.trim();
    localStorage.removeItem('verificationCode');
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    const verificationCode = generateVerificationCode();
    window.localStorage.setItem('verificationCode',verificationCode);
    window.localStorage.setItem('email',email);
    const verificationLink = `${window.location.href}?code=${verificationCode}`;

    const templateParams = {
        to_email: email,
        verification_link: verificationLink
    };
    emailjs.send(service_id, template_id, templateParams)
    .then(() => {
        alert('Verification link sent, Check your email. Valid for 2 minutes');
        var timer = setTimeout(function() {
            localStorage.clear();
        }, 120000);
    }, (error) => {
        alert('Error sending verification link, Please try again.');
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateVerificationCode() {
    const length = 32;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#~%*()-_=+[]{}|;.';
    let verificationCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        verificationCode += characters.charAt(randomIndex);
    }
    return verificationCode;
}

function verifyLink() {
    var url = window.location.href;
    if(url.indexOf('code=')>=0){
        url=url.split("code=")[1];
        if (localStorage.getItem("verificationCode")===url) {
            window.localStorage.setItem("signin", true);
            window.localStorage.setItem("email", localStorage.getItem("email"));
            $.ajax({
                type: 'POST',  
                url: './php/main.php', 
                data: { fuc:"verified", verify:"verified", email:window.localStorage.getItem("email") },
                success: function(response) {
                    alert(response);
                    if(response==="Email Verified"){
                        window.location.href="./profile.html";
                    }
                    else{
                        alert(response+" on verify update");
                    }
                }
            });
            window.location.href="./profile.html";
        }else{
            alert('Invalid verify link or link expired');
        }
    }
}
