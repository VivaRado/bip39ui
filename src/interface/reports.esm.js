// Interface / Reports ∞ 1.0.0
import { class_ops, create_el } from "./utils.esm.js";
function strength_check(strength_bar, value){
	strength_bar.classList.remove('hide');
	strength_bar.style = `--percentage: ${value}%;`;
	var prefx = 'strength_';
	if (value > 0) {
		if (value > 70) {
			class_ops(strength_bar, ['fair', 'weak'], 'strong', prefx);
			strength_bar.dataset.content = `mnemonic is strong: ${value}%`;
		} else if (value < 70 && value > 50) {
			class_ops(strength_bar, ['weak', 'strong'], 'fair', prefx);
			strength_bar.dataset.content = `mnemonic is fair: ${value}%`;
		} else if (value < 50) {
			class_ops(strength_bar, ['fair', 'strong'], 'weak', prefx);
			strength_bar.dataset.content = `mnemonic is weak: ${value}%`;
		}
		return true;
	} else {
		class_ops(strength_bar, ['fair', 'strong', 'weak'], null, prefx);
		strength_bar.dataset.content = `mnemonic strength is zero`;
		strength_bar.classList.add('hide');
		delete strength_bar.dataset.content;
	}
}
function display_alert(alert_data, target_alert, animation){
	var anim_type;
	target_alert.innerHTML = '';
	var ul = target_alert.querySelector('ul');
	var process_alert = function(altex, tul){
		var altex = altex.toString();
		var alert_class = altex.substring(altex.indexOf('_'),0);
		var display_data = altex.substring(altex.indexOf('_')+1).toString().replace(/_/g,' ');
		var li = create_el("li", { class: alert_class });
		li.innerHTML = display_data;
		tul.append(li);
		class_ops(target_alert, 'hide', 'active_alert');
	}
	if( ul == null){
		ul = create_el("ul");
		target_alert.append(ul);
	}
	if (Array.isArray(alert_data)) {
		for (var i = 0; i < alert_data.length; i++) {
			process_alert(alert_data[i], ul);
		}
	} else {
		process_alert(alert_data, ul);
	}
	clearTimeout(anim_type);
	if (animation) {
		anim_type = setTimeout(function(){
			target_alert.classList.add('hide');
			target_alert.innerHTML = '';
			clearTimeout(anim_type);
		},3000);
	} else {
		clearTimeout(anim_type);
	}
}
export {
	strength_check,
	display_alert
}