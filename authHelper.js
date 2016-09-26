/**
 * Created by ekersale on 21/09/2016.
 */


var credentials = {
    client: {
        id: "fca4f99c-a473-43cf-8f39-ea0b19916eda",
        secret: "782B950ED1BE3473A6C0CE05BCC9E49B27A2253C"
    },
    auth: {
        tokenHost: "https://login.microsoftonline.com",
        tokenPath: "/common/oauth2/token",
        authorizePath: "/common/oauth2/authorize"
    }
};

var oauth2 = require("simple-oauth2").create(credentials);


var redirectUri = "http://localhost:3000/authorize";

var scopes = ["openid"];

function getAuthUrl() {
    var returnVal = oauth2.authorizationCode.authorizeURL({
        redirect_uri: redirectUri,
        scope: scopes.join(" ")
    });
    console.log("Generated auth url: " + returnVal);
    return returnVal;
}

function getTokenFromCode(code_user, callback, res, next) {
    var tokenConfig = {
        code: code_user,
        redirect_uri: redirectUri
    };
    oauth2.authorizationCode.getToken(tokenConfig, function(err, result) {
       if (err) {
           console.log(err);
            next(err);
       }
        else {
            console.log("authHelper.js - l.46");
            var token = oauth2.accessToken.create(result);
            callback(res, token.token)
       }
    });
}

exports.getTokenFromCode = getTokenFromCode;
exports.getAuthUrl = getAuthUrl;