require=function r(e,o,n){function t(i,f){if(!o[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var a=o[i]={exports:{}};e[i][0].call(a.exports,function(r){var o=e[i][1][r];return t(o?o:r)},a,a.exports,r,e,o,n)}return o[i].exports}for(var u="function"==typeof require&&require,i=0;i<n.length;i++)t(n[i]);return t}({2:[function(r,e,o){var n=r("colors"),t=r("./blue/blue");e.exports=t+n.red},{"./blue/blue":3,colors:5}]},{},[2]);