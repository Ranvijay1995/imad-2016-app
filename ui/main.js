
var submit=document.getElementById("submit_btn");
submit.onclick=function(){
    // make a request to the server and send the name
   //create a request object
    var request= new XMLHttpRequest();
    
    //capture response and store it
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            //take some action
            if(request.status===200){
                console.log("user logged in");
                alert("Logged in Succesfully");
            }else if(request.status===403) {
                alert("The Username?password is incorrect");
            }else if(request.status===500) {
                alert("Something Went Wrong on the Server");
            }
        }
        // not done yet
    };
    var username=document.getElementById("username").value;
    var password=document.getElementById("password").value;
    console.log(username);
    console.log(password);
    //Make a request
    request.open("POST","http://ranvijay1995.imad.hasura-app.io/login",true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username,password:password}));
    submit.value = 'Logging in...';
};
