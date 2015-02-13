/**
This test was written to ge 100% coverage, 
there is no guarantee that the results are correct (expected)
in every single situation.

Samples are very syntetic, TODO: better samples

TODO: another test to chcek XPaths in document
**/
var xpathExpr=require("../src/index.js");
var assert=require("./assert.js"); //extended node/assert library


describe("xpathExpr.compile", function() {
	it("exists", function() {
		assert.ok("compile" in xpathExpr);
	});
	it("strings without variables are returned as is", function() {
		var strExpr="//*";
		var compiled=xpathExpr.compile(strExpr);
		assert.equal(strExpr, compiled);
	});
	it("string are enclosed in '' ", function(){		
		assert.equal(xpathExpr.compile("/root/test[text()=$param]",{param:"string"}), "/root/test[text()='string']");
	});
	it("numbers are not enclosed in '' ", function(){		
		assert.equal(xpathExpr.compile("/root/test[text()=$param]",{param:10}), "/root/test[text()=10]");
	});
	it("handles single quite", function(){		
		assert.equal(xpathExpr.compile("/root/test[text()=$param]",{param:"\""}), "/root/test[text()='\"']");
	});
	it("handles single apos", function(){		
		assert.equal(xpathExpr.compile("/root/test[text()=$param]",{param:"'"}), "/root/test[text()=\"'\"]");
	});
	it("handles quotes and apos combined and produces concat xpath", function(){	
		var expression="/root/test[text()=$param]";
		var param="\"quotes\" and 'apos' ";
		var expected="/root/test[text()=concat('\"quotes\" and ',\"'apos' \")]"
		assert.equal(xpathExpr.compile(expression,{param:param}),expected);
	});
	it("handles apos in quite", function(){	
		var expression="/root/test[text()=$param]";
		var param='"\'"';
		var expected="/root/test[text()=concat('\"',\"'\",'\"')]"
		assert.equal(xpathExpr.compile(expression,{param:param}),expected);
	});
	it("handles quote in apos", function(){	
		var expression="/root/test[text()=$param]";
		var param="'\"'";
		var expected="/root/test[text()=concat(\"'\",'\"',\"'\")]"
		assert.equal(xpathExpr.compile(expression,{param:param}),expected);
	});
	it("escaped $ is not expanded", function(){	
		var expression="/[text()='100$'][@role=$role]";
		var param="'\"'";
		var expected="/[text()='100$'][@role='textbox']"
		assert.equal(xpathExpr.compile(expression,{role:"textbox"}),expected);
	});
	it("quoted $ is not param", function(){	
		var expression='//*[text()="$param"]';
		var param="param";
		var expected="//*[text()=\"$param\"]"
		assert.equal(xpathExpr.compile(expression,{}),expected);
	});
	it("quote quote $param quote - is param (counting pairs)", function(){	
		var expression='//*[text()="\"$param"]';
		var param="param";
		var expected="//*[text()=\"\"'param'\"]" // TODO: not a valid xpath ?
		assert.equal(xpathExpr.compile(expression,{param:"param"}),expected);
	});
	it("apos apos $param apos - is param (counting pairs)", function(){	
		var expression="//*[text()='\'$param']";
		var param="param";
		var expected="//*[text()='''param'']"; // TODO: not a valid xpath ?
		assert.equal(xpathExpr.compile(expression,{param:"param"}),expected);
	});
	it("fails if variable not found in second param", function() {
		try{
			xpathExpr.compile("$x",{});
			assert(0,"unexpected success");
		}
		catch(ex){
			assert.equal("Missing variable:x", ex.message);	
			
		}	
	});
	it("fails if variable is not of supported type", function() {
		try{
			xpathExpr.compile("$x",{x:new Date()});
			assert(0,"unexpected success");
		}
		catch(ex){
			assert.equal("Unsupported data type:x,object", ex.message);	
			
		}	
	});
	
	
});



