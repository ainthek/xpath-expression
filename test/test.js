
var xpathExpr=require("../src/index.js");
var assert=require("./assert.js"); //extended node/assert library


describe("xpathExpr.compile", function() {
	it("exists", function() {
		assert.ok("compile" in xpathExpr);
	});
	it("string are enclosed in '' ", function() {
		var compiled=xpathExpr.compile("//*[text()=$x]",{x:"10"});
		assert.equal("//*[text()='10']",compiled);
	});
	it("numbers are not enclosed in quotes", function() {
		var compiled=xpathExpr.compile("//*[text()=$x]",{x:10});
		assert.equal("//*[text()=10]",compiled);
	});
	it("can process multiple params", function() {
		var compiled=xpathExpr.compile("//*[text()=$text][@role=$role]",{role:"grid", text:"funny grid"});
		assert.equal("//*[text()='funny grid'][@role='grid']",compiled);
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
	// line[ 52%]  branch[ 72%]
	it("can handle strings with ' inside ", function() {
		var compiled=xpathExpr.compile("//*[text()=$apos]",{apos:"John's"});
		assert.equal("//*[text()=\"John's\"]",compiled);
	});
	// line[ 52%]  branch[ 72%]
	it('can handle strings with " inside ', function() {
		var compiled=xpathExpr.compile("//*[text()=$apos]",{apos:'John"s'});
		assert.equal("//*[text()='John\"s']",compiled);
	});
	// line[ 52%]  branch[ 72%] !!!! FIXME: see original code, remove JSHints this is suspicious
	it('can handle strings with " inside ', function() {
		var compiled=xpathExpr.compile("//*[text()=$attack]",{attack:"a' or @flag='private"});
		assert.equal("//*[text()=\"a' or @flag='private\"]",compiled);
	});
	
	
	

});


/*
original testcase

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"> 
<html>
<!-- this DOCTYPE SHOULD turn STD or p-STD mode in all browsers -->
<head>
<title>XPathExpr Testcase</title>
<script src="../../../gjaxXB/js/gjax.js"></script>
<script src="../../../gjaxXB/js/Ex.js"></script>
<script src="../../../gjaxXB/js/Ax.js"></script>
<script src="../../../gjaxXB/js/XMLHttpRequest.js"></script>
<script src="../../../gjaxXB/js/XML.js"></script>
<script src="../../../gjaxXB/js/Character.js"></script>
<script src="../../../gjaxXB/js/EscapeUtils.js"></script>
<style>
TEXTAREA
{
	width:100%;
	height:500px;
}
</style>
<script>
// imports
var XML=gjax.XML;
var XPathExpr=gjax.XPathExpr;

window.onload=function()
{
	test01();	
	test02();	
	test03();	
}
function test03()
{
	
	// should !!! not translate to variable
	var expr=XPathExpr.compile("/root/test[text()='  $t  $t   $t ' and lala()=$t2 and lala()='$t2']",{t:"test", t2:"test2"});
	println(expr);
	var expr=XPathExpr.compile("/root/test[text()=$t]",{t:10});
	println(expr);
}
function test02()
{
	var tests=[
		"I'm herro",
		"Happy \"elef'ant\"",
		"This is \"to test \" and 'apos' det'ection",
		"'a'a'a'a'a'",
		"\"b\"b\"b\"b\"b\""
	];
	var d=XML.loadXml("<root/>");
	for(var i=0;i<tests.length;i++)
	{
		var tn1=d.documentElement.appendChild(d.createElement("test"));
		XML.setText(tn1,tests[i]);
		var expr=XPathExpr.compile("/root/test[text()=$t]",{t:tests[i]});
		var tn2=XML.evalNode(d,expr);	
		println((tn1==tn2)+"\t"+tests[i]+"\t"+expr);
	}
	
}
function test01()
{
	println("normal query:");
	var  d = XML.load("xPath01.xml");
	evalBuggy(d, "a");	// normal query
	
	println("normal attack1:");
	d = XML.load("xPath01.xml");
	evalBuggy(d, "a' or @flag='private"); //attack
	
	println("normal attack2:");
	d = XML.load("xPath01.xml");
	evalBuggy(d, 'a" or @flag="private'); //attack
	
	println("fixed normal query:");
	var topic="a";
	d = XML.load("xPath01.xml");
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic=$topic)]",{topic:String(topic)}));
	
	println("escaped variable query:");
	d = XML.load("xPath01.xml");
	topic="a";
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic='$topic')]",{topic:String(topic)}));
	
	println("fixed attack1:");
	d = XML.load("xPath01.xml");
	topic="a' or @flag='private";
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic=$topic)]",{topic:String(topic)}));
	
	println("fixed attack2:");
	d = XML.load("xPath01.xml");
	topic='a" or @flag="private';
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic=$topic)]",{topic:String(topic)}));
	
	println("fixed &apos; search:");
	d = XML.load("xPath01.xml");
	topic="'";
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic=$topic)]",{topic:String(topic)}));
	
	println("fixed &quot; search:");
	d = XML.load("xPath01.xml");
	topic='"';
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic=$topic)]",{topic:String(topic)}));
	
	//This is "to test " and 'apos' det'ection
	topic="This is \"to test \" and 'apos' det'ection";
	println(topic);
	d = XML.load("xPath01.xml");
	
	evalFixed(d,XPathExpr.compile("/root/data[not(@flag='public' and @topic=$topic)]",{topic:String(topic)}));
}

function evalBuggy(d,topic)
{
	var xPathStr = "/root/data[not(@flag='public' and @topic='" + topic + "')]";
	println(xPathStr);
	var toRemove = XML.evalNodes(d,xPathStr);
	println("toRemove #of nodes:" + toRemove.length);
	for (var i = 0; i < toRemove.length; i++)
	{
	    toRemove[i].parentNode.removeChild(toRemove[i]);
	}
	println(XML.getXml(d));
}
function evalFixed(d,xPathStr)
{
	println(xPathStr);
	var toRemove = XML.evalNodes(d,xPathStr);
	println("toRemove #of nodes:" + toRemove.length);
	for (var i = 0; i < toRemove.length; i++)
	{
	    toRemove[i].parentNode.removeChild(toRemove[i]);
	}
	println(XML.getXml(d));
}
function println(str)
{
	gjax.$("log").value+=(str+"\r\n");
}

</script>
</head>
<body>
<textarea id="log">

</textarea>
</body>
</html>
*/
