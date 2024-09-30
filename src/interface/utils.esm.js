// Interface / Utils ∞ 1.0.1
function classOps(ndlst, rem_classes, add_classes, prefix = ''){
	var proc = function(el){
		var oper = function(op, arr) {
			if (Array.isArray(arr)) {
				if (arr) el.classList[op](...arr.map(i => prefix + i));
			} else {
				if (arr) el.classList[op]( prefix+arr);
			}
		}
		oper('add', add_classes);
		oper('remove', rem_classes);
	}
	if ((ndlst instanceof NodeList) || (ndlst instanceof HTMLCollection) || Array.isArray(ndlst) ) {
		Array.from(ndlst).filter( (el) => {
			proc(el);
		});
	} else {
		proc(ndlst);
	}
}
function uniqueId(length=8){ return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))}
function createEl(type, props) {
	var $e = document.createElement(type);
	for (var prop in props) { $e.setAttribute(prop, props[prop]) };
	return $e;
}
function hasSome(arr, val){ return arr.some(x => x.indexOf(val) != -1) }
export {
	classOps,
	uniqueId,
	createEl,
	hasSome
}