var xpathExpr=module.exports={};
/**
replaces VariableReference with values specified in varObj
if VariableReference reference not found throws Error("unresolved VariableReference");
@param strXPath
	$var = represents variavble
	'$var' = DOES NOT represent variable but string (pozor na spaces !!!)
	"$var" = DOES NOT represent variable but string

@param varObj
	{var:number,var1:string}
	if ouher type - Error("unsupported Variable type")
@return string representing escaped expression
@author: zagora
**/
xpathExpr.compile=function(strXPath,varObj)
{
	var m, sb = [];
	do
	{
		m = strXPath.match(/(\$[A-Za-z0-9]*)/);
		if (m === null)
		{
			sb.push(strXPath);
			break;
		}
		var escapePos = 0;
		if (_XPathExpr_isEscaped(m) === null)
		{
			sb.push(strXPath.substring(0,m.index));
			var varName = m[0].substring(1); //without $ char
			if (typeof varObj[varName] == "string")
			{
				var i, l = 0, cd;
				var a = varObj[varName].split("'").length, b = varObj[varName].split('"').length;
				if (a > b) cd = '"'; else cd = "'";
				if (a == 1 || b == 1) 
				{ 
					sb.push(cd + varObj[varName] + cd); 
					strXPath = strXPath.substring(m.index+m[0].length);
					continue; 
				}
				sb.push("concat(" + cd);
				do
				{
					i = varObj[varName].indexOf(cd,l);
					if (i != -1)
					{
						sb.push(varObj[varName].substring(l,i) + cd);
						if (cd == "'") { cd = '"'; } else { cd = "'"; }
						sb.push("," + cd);
						l = i;
					}
					else
					{
						sb.push(varObj[varName].substring(l) + cd + ")");
					}
				}
				while (i != -1);
			}
			else if (typeof varObj[varName] == "number")
			{
				sb.push(varObj[varName]);
			}
			else if (!(varName in varObj))
			{			
				throw new Error("Missing variable:"+varName);
			}
			else
			{			
				throw new Error("Unsupported data type:" + varName + "," + typeof varObj[varName]);
			}
		}
		else //escaped
		{
			var escapeChar = _XPathExpr_isEscaped(m);
			escapePos = m.input.substring(m.index+m[0].length).indexOf(escapeChar)+1;
			sb.push(m.input.substring(0,m.index+m[0].length+escapePos));
		}
		strXPath = m.input.substring(m.index+m[0].length+escapePos);
	}
	while (m !== null);
	return sb.join("");
};
/*
	return escape character (' or ")
	or null if not escaped
	@author: zagora
*/
function _XPathExpr_isEscaped(regExpResult)
{
	
	var partLeft = regExpResult.input.substring(0,regExpResult.index);
	var inSimpleQuotes = false, inDoubleQuotes = false;
	for (var i = 0; i < partLeft.length; i++)
	{
		var c = partLeft.charAt(i);
		if (c === '"' && inSimpleQuotes === false && inDoubleQuotes === false) 
		{
			inDoubleQuotes = true;
			continue;
		}
		if (c === "'" && inSimpleQuotes === false && inDoubleQuotes === false) 
		{
			inSimpleQuotes = true;
			continue;
		}
		if (c === '"' && inDoubleQuotes === true) 
		{
			inDoubleQuotes = false;
			continue;
		}
		if (c === "'" && inSimpleQuotes === true) 
		{
			inSimpleQuotes = false;
			continue;
		}
	}
	if (inSimpleQuotes === true) return "'";
	else if (inDoubleQuotes === true) return '"';
	else return null;
}    

