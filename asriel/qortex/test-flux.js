var flux = require("./flux");

var W = flux.arg("W", 3, 2), b = flux.arg("b", 3, 1), x = flux.arg("x", 2, 1);

console.log(flux.matmul(W, x).add(b).toString());
