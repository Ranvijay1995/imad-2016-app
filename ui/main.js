
var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    
    var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('Logged in successfully');
              } else if (request.status === 403) {
                  alert('username/password is invalid');
              } else if (request.status === 500) {
                  alert('Something went wrong on the server');
              } else {
                  alert('Something went wrong on the server');
              }
          }  
          // Not done yet
        };
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST', '/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));
};