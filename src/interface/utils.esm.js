// Interface / Utils ∞ 1.0.0
function class_ops(ndlst, rem_classes, add_classes, prefix = ''){
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
function unique_id(length=8){ return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))}
function create_el(type, props) {
	var $e = document.createElement(type);
	for (var prop in props) { $e.setAttribute(prop, props[prop]) };
	return $e;
}
function has_some(arr, val){ return arr.some(x => x.indexOf(val) != -1) }
export {
	class_ops,
	unique_id,
	create_el,
	has_some
}