/*
factor.js
*/


function primeFactors(n){
	var result = [];
	while(n > 1){
		var factor = getFactor(n);
		result.push(factor);
		n /= factor;
	}
	return result;
}

function getFactor(n){
	if (n%4 == 0) return 4;
	if (n%2 == 0) return 2;
	for (var i=3; i<=Math.floor(Math.sqrt(n)); i+=2){
		if (n%i == 0) return i;
	}
	return n;
}

function printFactors(factors){
	var string = "";
	factors.forEach(function(factor) {
		string += factor == 4? "2 x 2 x " : factor + " x ";
	});
	return string.slice(0, -2);
}