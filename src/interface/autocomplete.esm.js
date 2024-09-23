// Interface / AutoComplete ∞ 1.0.2
import { unique_id, create_el } from "./utils.esm.js";
class AutoComplete {
	constructor(ndlst, cfg) {
		var self = this;
		self.namespace = "AutoComplete";
		self.search_timeout;
		cfg.id = unique_id();
		var search_multi = create_el('div', {
			'class': 'multi multisearch',
			'data-hash': cfg.id
		});
		cfg.multi_container.append(search_multi);
		self._def = {
			stout: 			100,
			isShown: 		false,
			isActive: 		false,
			keep_pool: 		true,
			built_pool: 	false,
			multsearch: 	search_multi,
			mlts_cntr: 		search_multi.parentNode,
			arrow_listener: self.arrow_evt_handler(),
			escpe_listener: self.escpe_evt_handler(),
			exter_listener: self.exter_evt_handler(),
			ev_arrow_added: false,
			ev_escpe_added: false,
			ev_exter_added: false,
		};
		null==cfg&&(cfg={}),self._cfg={...self._def,...cfg};
		if ((ndlst instanceof NodeList) || (ndlst instanceof HTMLCollection) || Array.isArray(ndlst) ) {
			for (var i = 0; i < ndlst.length; i++) {
				self.build(ndlst[i]);
				self.interact(ndlst[i]);
			}
		} else {
			self.build(ndlst);
			self.interact(ndlst);
		}
	}
	// external events
	/**
	 * Setup external events
	 * */
	external_events(){
		var self = this;
		var extevts = {'arrow':'keydown', 'escpe':'keyup', 'exter':'click'};
		var actinp = self._cfg.active_input;
		for(var key in extevts){
			var ea = self._cfg[`ev_${key}_added`];
			if (actinp && actinp.isShown && ea == false) {
				document.addEventListener(extevts[key], actinp[`${key}_listener`]);
				ea = true;
			}
		}
	}
	// element events
	selct_evt(self, ac) { ac.addEventListener("click", ac[self.namespace].selct_listener) }
	input_evt(self, ac) { ac.addEventListener("keydown", ac[self.namespace].input_listener) }
	click_evt(self, ac) { ac[self.namespace].isShown && ac.nextElementSibling.addEventListener('click', ac[self.namespace].click_listener) }
	// handlers
	/**
	 * Close the autocomplete on escape key press.
	 * */
	escpe_evt_handler = () => (e) => { 
		var self = this;
		if (e && e.which == 27) {
			var actinp = self._cfg.active_input;
			if ( actinp.isShown ) {
				actinp.hide();
				self.clear_hl();
			}
		}
	}
	/**
	 * Close the autocomplete on click outside the autocomplete.
	 * */
	exter_evt_handler = () => (e) => {
		var self = this;
		var actinp = self._cfg.active_input;
		if ( actinp.isShown && !actinp.nav.contains(e.target) ) {
			actinp.hide();
			self.clear_hl();
			e.stopPropagation();
		}
	}
	/**
	 * Navigate the autocomplete results with up and down arrow.
	 * */
	arrow_evt_handler = () => (e) => {
		var self = this;
		var dest = self._cfg.keep_pool ? self._cfg.multsearch : e.target.nextElementSibling;
		if (dest) {
			var actinp = self._cfg.active_input;
			var lst = dest.querySelectorAll(".itm.show");
			var inx = actinp.curritm;
			Array.from(lst).filter( el => el.classList.remove("highlight"));
			if (lst[inx]) {
				if(e.keyCode == 38){ inx = inx > 0 ? --inx : 0; };
				if(e.keyCode == 40){ inx = inx < lst.length-1 ? ++inx : lst.length-1; };
				if(e.keyCode == 13 || e.keyCode == 9){ 
					e.target.value = lst[inx].dataset.title;
					actinp.curritm = 0;
					actinp.hide();
					return
				};
				lst[inx].classList.add("highlight");
				actinp.curritm = inx;
				const eleRect = lst[inx].getBoundingClientRect();
				dest.parentNode.scrollTop = inx * eleRect.height;
			}
		}
	}
	/**
	 * Pick item in autocomplete dropdown on click.
	 * */
	click_evt_handler = (ac) => (e) => { 
		var self = this;
		if(Array.from(e.target.classList).includes('itm')) {
			e.target.classList.add("highlight");
			ac.value = e.target.dataset.title;
			ac[self.namespace].hide();
			ac[self.namespace].curritm = 0;
			self.term_in_pool(ac, ac.value);
		}
	}
	/**
	 * Select autocomplete input text on click.
	 * */
	selct_evt_handler = (ac) => (e) => { ac.select() }
	/**
	 * Initiate search pool filtering on input event.
	 * */
	input_evt_handler = (ac) => (e) => {
		var self = this;
		clearTimeout(self.search_timeout);
		self.show(ac);
		self.search_timeout = setTimeout(function() { self.input_reflection(e, ac); }, ac[self.namespace].stout);
		var sp_el = Array.from( document.querySelectorAll(".search-results.fade_in") );
	}
	// actions
	/**
	 * Activate external events and click event for autocomplete.
	 * */
	activate = (ac) => { 
		var self = this;
		self.clear_hl();
		self.external_events();
		self.click_evt(self, ac);
	}
	/**
	 * Toggle show / hide of autocomplete dropdown.
	 * */
	toggle(ac) { return this[!ac[this.namespace].isShown ? 'show' : 'hide'](ac); }
	/**
	 * Show autocomplete dropdown.
	 * */
	show = (ac) => { this._cfg.onshow && this._cfg.onshow();
		var self = this;
		if (ac[self.namespace].isShown) return;
		self._cfg.active_input = ac[self.namespace];
		ac[self.namespace].isShown = true;
		self.activate(ac);
		ac.nextElementSibling.classList.add('fade_in');
	}
	/**
	 * Hide autocomplete dropdown.
	 * */
	hide = (ac, emit=false) => {
		var self = this;
		self._cfg.onhide && self._cfg.onhide();
		if (ac[self.namespace]) {
			ac[self.namespace].curritm = 0;
			ac[self.namespace].isShown = false;
		}
		self.term_in_pool(ac, ac.value);
		var active_results = self._cfg.multsearch.querySelectorAll('.search-results .itm');
		Array.from(active_results).filter( (el) => { el.classList.remove("highlight", "show") });
		if (self._cfg.active_input) {
			var sres = self._cfg.active_input.nav.querySelector('.search-results');
			sres.removeEventListener('click', self._cfg.active_input.click_listener);	
			sres.classList.remove('fade_in');
			self._cfg.multsearch.classList.remove('fade_in');
			var destination_box = self._cfg.mlts_cntr;
			destination_box.append(self._cfg.multsearch);
		}
		if (emit == true && ac[self.namespace].isShown == true) {
			self._cfg.onhide();	
		} 
	}
	// representation 
	/**
	 * Results pool filtering
	 * */
	filter_res(ac, marker, term) {
		var title = marker.getAttribute('data-title').toLowerCase();
		var val = term.toLowerCase();
		if (title.indexOf(val) === -1) {
			marker.classList.remove('show', 'highlight');
		} else {
			if (val.length > 0) {
				marker.classList.add('show');
				marker.innerHTML = title.replace(val, val.bold());
			} else {
				marker.classList.remove('show', 'highlight');
			}
		}
	}
	// validations
	/**
	 * Input of words not currently in the search pool results in error.
	 * 1. Search term exists but is not in the search pool.
	 * */
	term_in_pool(ac, term){
		var self = this;
		var func = ( term.length >= 1 && !(ac[self.namespace].pool.indexOf(term) != -1) ) ? 'add' : 'remove'; // 1
		ac[self.namespace].nav.classList[func]('error');
	}
	/**
	 * Manage the way the autocomplete reacts to input value.
	 * 1. There is only one result and is matching the input value.
	 * 2. Reset highlight by setting curritm to zero.
	 * 3. There are no highlighted elements, highlight first and reset curritm.
	 */
	input_reflection(e, ac) {
		var self = this;
		var dest = self._cfg.keep_pool ? self._cfg.multsearch : ac.nextElementSibling;
		self._cfg.keep_pool && ac.nextElementSibling.append(dest);
		var _results = dest.querySelectorAll('.itm');
		var term = e.target.value.toLowerCase();
		_results.forEach(function(itm) { self.filter_res(ac, itm, term) });
		var active_results = dest.querySelectorAll('.itm.show');
		self.term_in_pool(ac, term);
		if (active_results.length == 0) {
			dest.classList.remove('fade_in');
			self.clear_hl();
		} else {
			if (active_results.length == 1 && term == active_results[0].dataset.title) { // 1
				ac[self.namespace].curritm = 0; // 2
				dest.classList.remove('fade_in');
				self.clear_hl();
			} else {
				dest.classList.add('fade_in');
			}
			if (dest.querySelectorAll(".itm.highlight").length == 0) { // 3
				ac[self.namespace].curritm = 0;
				active_results[0].classList.add("highlight");
			}
		}
	}
	/**
	 * Create autocomplete element pool from provided array.
	 */
	fill_search_pool(ac, serv_array) {
		var self = this;
		var dest = self._cfg.keep_pool ? self._cfg.multsearch : ac.nextElementSibling;
		if (serv_array) {
			ac[self.namespace].pool = serv_array;
			dest.innerHTML = "";
			for (var i = 0; i < serv_array.length; i++) {
				var search_item = create_el('div', {
					'class': 'itm',
					'data-title': serv_array[i]
				});
				search_item.textContent = serv_array[i];
				dest.append(search_item);
			}
		}
	}
	/**
	 * Clear highlight from arrow navigation.
	 */
	clear_hl(){
		var lst = document.querySelectorAll(".search-results .itm");
		Array.from(lst).filter( el => { el.classList.remove("highlight", "show"); });
	}
	/**
	 * Build autocomplete.
	 */
	build(ac) {
		var self = this;
		ac[self.namespace] = {
			curritm: 0,
			nav: ac.parentNode.parentNode,
			hide: 		() => { self.hide(ac) },
			show: 		() => { self.show(ac) },
			toggle: 	() => { self.toggle(ac) },
			setpool: 	(data) => { self.fill_search_pool(ac, data) },
			destroy: 	(remove) => { self.destroy(self, ac, remove) },
			click_listener: self.click_evt_handler(ac),
			input_listener: self.input_evt_handler(ac),
			selct_listener: self.selct_evt_handler(ac),
			...self._cfg
		};
		self._cfg.keep_pool && ac[self.namespace].nav.classList.add('multi_share');
		if (self._cfg.built_pool == false) {
			self.fill_search_pool(ac, ac[self.namespace].pool);
			self._cfg.built_pool = true;
		};
	}
	/**
	 * Set up autocomplete input element events.
	 */
	interact(ac) {
		var self = this;
		self.selct_evt(self, ac);
		self.input_evt(self, ac);
	}
	/**
	 * Reattach input to autocomplete class
	 */
	reattach = (ac) => {
		var self = this;
		self.build(ac);
		self.interact(ac);
	}
	/**
	 * Destroy autocomplete and remove events from input.
	 */
	destroy(self, ac, remove=true) {
		ac[self.namespace].nav.querySelector('input.inp').removeEventListener('keydown', ac[self.namespace].input_listener);
		ac[self.namespace].nav.querySelector('input.inp').removeEventListener('click', ac[self.namespace].selct_listener);
		remove && ac.remove();
	}
}
export {
	AutoComplete
}