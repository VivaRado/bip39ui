// Interface / MnemonicInterface ∞ 1.0.10
import { AutoComplete } from './autocomplete.esm.js'
import { mnemstrong } from '../mnemstrong/index.esm.js';
import * as bip39 from '../bip39/index.clt.esm.js';
import { wordlist } from "../bip39/wordlists/wordlist.esm.js";
import { sha } from '../bip39/deps/crypto.clt.esm.js';
import { chunk } from "../bip39/deps/utils.esm.js";
import { checksumWords } from "../bip39/index.clt.esm.js";
import { classOps, createEl, hasSome } from "./utils.esm.js";
import { displayAlert, strengthCheck } from "./reports.esm.js";
// Phrase Length Dropdown Control
class MnemonicInterface {
	constructor(cfg){
		var self = this;
		self._def = {
			_ml: 12, 													// mnemonic length
			_ic: document.querySelector('.passphrase_inputs'), 			// input container
			_rb: document.querySelector(".btn_refresh"), 				// refresh button
			_sn: document.querySelector('.strength_select #s_con_b'), 	// selected none
			_sa: document.querySelector('.strength_select .lst'), 		// selected active
			_sc: document.querySelector('.percentage-strength'), 		// strength calculation
			_ab: document.querySelector('.alert.mnemonic-alert'), 		// alert box
			_ns: 'nav[role="search"] input', 							// search element selector
			_ce: 'checksum_elm', 										// checksum element selector
			_vc: [], 													// valid checksums
			_cm: [],  													// current mnemonic
			mnemstrong: true,
			populate: true
		};
		null==cfg&&(cfg={}),self._cfg={...self._def,...cfg};
		self.initAutocompleteGroups();
		self.initDraggable();
		self._cfg._rb.addEventListener('click', async(e) => {  await self.reflectActive( self.getActiveVal() ) });
		self._cfg._sn.addEventListener('change', async(e) => { await self.reflectActive( 0 ) });
		self._cfg._sa.addEventListener('change', async(e) => { await self.reflectActive( e.target.value ) });
		self.reflectActive( self.getActiveVal() );
	}
	/**
	 * Defines the states and groups of checksum elements 
	 * according to Autocomplete groups sans or avec checksum.
	 * 1.  Selected mnemonic length.
	 * 2.  Select all inputs to array.
	 * 3.  Get relevant elements according to mnemonic length.
	 * 4.  Gather current mnemonic.
	 * 5.  Get opposite checksum index: 12 = 24, 24 = 12.
	 * 6.  Make element a checksum and undraggable.
	 * 7.  Make element a regular input and draggable.
	 * 8.  Destroy Autocomplete but not element.
	 * 9.  Reattach autcom_sc (sans checksum) to ante checksum (opposite).
	 * 10. Reattach autcom_ac (avec checksum) to current checksum.
	 * 11. Update the results pool of current checksum with valid checksums gathered in mnemEvaluate.
	 */
	reflectChecksumElm(){
		var self = this;
		var nelm = self._cfg._ml; // 1
		var inpelmar = Array.from( self._cfg._ic.querySelectorAll(self._cfg._ns) ); // 2
		var currelms = inpelmar.slice(0, nelm); // 3
		self._cfg._cm = self.gatherMnem(currelms); // 4
		var clear_inx = nelm == 12 ? 24 : 12; // 5
		var crnt_chksm = currelms[currelms.length - 1];
		var ante_chksm = inpelmar[clear_inx - 1];
		self.setChsumState(crnt_chksm, false); // 6
		self.setChsumState(ante_chksm, true); // 7
		crnt_chksm.AutoComplete.destroy(false); // 8
		ante_chksm.AutoComplete.destroy(false); // 8
		self.autcom_sc.reattach(ante_chksm); // 9
		self.autcom_ac.reattach(crnt_chksm); // 10
		crnt_chksm.AutoComplete.setpool(self._cfg._vc); // 11
	}
	/**
	 * Generate mnemonic and set to input fields.
	 * 1. Select all inputs.
	 * 2. Generate mnemonic.
	 * 3. Split mnemonic to array.
	 * 4. Distribute values to input fields.
	 * */
	async reflectMnemonic(strength){
		var self = this;
		if (self._cfg.populate) {
			var elm = self._cfg._ic.querySelectorAll(self._cfg._ns) // 1
			var mg = await bip39.generateMnemonic(strength, true); // 2
			var mg_split = mg.mnemonic.split(' '); // 3
			for (var i = 0; i < elm.length; i++) { // 4
				elm[i].value = mg_split[i];
			}
		}
	}
	/**
	 * Sets the mnemonic length according to the active selection of the dropdown.
	 * 1. Sets mnemonic length according to strength.
	 * 2. CSS class management.
	 * 3. Mnemonic generation.
	 * 4. Mnemonic evaluation.
	 * 5. Manage checksum states and groups.
	 * 6. Update data-index
	 * */
	async reflectActive(strength, reflchs=false){
		var self = this;
		var _p = self._cfg._ic; 
		if(strength == 128){
			self._cfg._ml = 12; // 1 
			classOps(_p, ['256', 'none'], '128', 'show'); // 2
			await self.reflectMnemonic(128); // 3
			await self.mnemEvaluate(true, reflchs, function(){ // 4
				self.reflectChecksumElm(); // 5
			});
			self._cfg._rb.parentNode.classList.remove('hide');
		}else if(strength == 256){
			self._cfg._ml = 24;
			classOps(_p, 'none', ['128', '256'], 'show');
			await self.reflectMnemonic(256);
			await self.mnemEvaluate(true, reflchs, function(){
				self.reflectChecksumElm();
			});
			self._cfg._rb.parentNode.classList.remove('hide');
		}else if(strength == 0) {
			classOps(_p, ['128', '256'], 'none', 'show');
			strengthCheck(self._cfg._sc,0);
			self._cfg._ab.innerHTML = '';
			self._cfg._rb.parentNode.classList.add('hide');
			displayAlert('warning_select_mnemonic_length', self._cfg._ab, true )
		}
		self.clearClass('error');
		self.setOrderAttr(); // 6
	}
	/**
	 * 
	 * 1. Select all relevant inputs to array based on mnemonic length.
	 * 2. Gather current mnemonic.
	 * 3. Generate valid checksum words.
	 * 4. If updchs is set Update current mnemonic with with first word from valid checksum words array.
	 * 5. Mnemonic validation with bip39, notice the report parameter is set to true.
	 * 6. Mnemonic evaluation.
	 * 7. Pass feedback for reflection.
	 * 8. Remove error from checksum in case it was edited and left.
	 */
	async mnemEvaluate(updchs, reflchs, cb){
		var self = this;
		var elm = Array.from(self._cfg._ic.querySelectorAll(self._cfg._ns)).slice(0, self._cfg._ml); // 1
		self._cfg._cm = self.gatherMnem(elm); // 2
		if (updchs) { // 4
			self._cfg._vc = await checksumWords(self._cfg._cm, wordlist.bip39_eng); // 3
			self._cfg._cm = self._cfg._cm.slice(0, -1);
			self._cfg._cm.push(self._cfg._vc[0]);
		}
		var mnem_str = self._cfg._cm.join(' ');
		var mv = await bip39.validateMnemonic(mnem_str, true); // 5
		if (!self._cfg.populate){
			var mva_ignore_empty = mv.assertions.filter(x => x.indexOf('empty_input') == -1);
			mv.assertions = mva_ignore_empty;
		}
		var ms = {};
		if (self._cfg.mnemstrong) {
			ms = mnemstrong(mnem_str); // 6
		}
		var is_valid = self.reflectFeedback(mv, ms); // 7
		if (is_valid) {
			var chsum_inp = elm[elm.length - 1];
			reflchs && (chsum_inp.value = self._cfg._vc[0]);
			updchs && chsum_inp.closest('nav').classList.remove("error"); // 8
		}
		cb && cb(self._cfg._vc);
	}
	/**
	 * Displays feedback visually, on alerts and the strength bar.
	 * 1. Gather all assertions and feedback from all channels (validateMnemonic, mnemstrong).
	 *    Treat validateMnemonic as errors, and mnemstrong as warnings.
	 * 2. Display alerts if there are any, fade out only the success message, leave error and warning messages visible until fixed.
	 * 3. Show strength bar if there are no errors, warnings are fair game.
	 * */
	reflectFeedback(mv, ms){
		var self = this;
		var mva = [ // 1
			...(mv.assertions.length == 0 && self._cfg.populate) ? ['success_valid_mnemonic'] : mv.assertions,
			...(ms.feedback && ms.feedback.length >= 0 ) ? ms.feedback.map((e)=> `${e.warning}: ${e.match}` ) : [], 
		];
		var mva_success = hasSome(mva, 'success');
		var anim = (mva.length == 1 && mva_success) ? true : false;
		(mva.length >= 0) && displayAlert(mva, self._cfg._ab, anim ); // 2
		strengthCheck(self._cfg._sc, hasSome(mva, 'error') ? 0 : ms.percentage); // 3
		mva_success && self.clearClass('error');
		return mva_success;
	}
	/**
	 * Initiate the Autocomplete groups
	 * 1. Gather all input fields to array.
	 * 2. Initiate the ```self.autcom_sc``` sans checksum, the inputs that are not checksums.
	 * 3. Initiate the ```self.autcom_ac``` avec checksum, the inputs that are checksums.
	 * 4. Evaluate every time the autocomplete dropdown gets hidden, due to selecting new value.
	 * */
	initAutocompleteGroups(){
		var self = this;
		var inp_arr = Array.from(self._cfg._ic.querySelectorAll(self._cfg._ns)); // 1
		self.autcom_sc = new AutoComplete(inp_arr.filter( (e, i) => (i != 11 && i != 23) ), { // 2
			multi_container: self._cfg._ic,
			pool: wordlist.bip39_eng,
			onhide: async function() {
				await self.mnemEvaluate(true, true, function(){ // 4
					self.reflectChecksumElm();
				});
			}
		});
		self.autcom_ac = new AutoComplete(inp_arr.filter( (e, i) => (i == 11 || i == 23) ), { // 3
			pool: [],
			multi_container: self._cfg._ic,
			onhide: async function() {
				await self.mnemEvaluate(false, false);
			}
		});
	}
	/**
	 * Initiate Drag and Drop on input elements.
	 * 1.  Set dropEffect based on element being checksum or not.
	 * 2.  If it is checksum element don't drop.
	 * 3.  Dropping element on itself.
	 * 4.  Get drag source potion element.
	 * 5.  Reattach drag source element to sans checksum group.
	 * 6.  Reset data-index indexes.
	 * 7.  Mnemonic evaluation.
	 * 8.  Manage checksum states and groups.
	 * 9.  Set draggable state to sans checksum and avec checksum input parent elements.
	 * 10. Set Events.
	 * */
	initDraggable(){
		var self = this;
		var isChsum = function(citm){ return (Array.from(citm.classList).indexOf(self._cfg._ce) != -1) }
		var events = {
			dragstart(ev) { 
				self.elDrag = this; 
				self.elDrag.classList.add('dragging');
			},
			dragover(ev) { 
				ev.preventDefault();
				self.clearClass('dragover');
				var citm = ev.target.closest(".item");
				citm.classList.add('dragover');
				ev.dataTransfer.dropEffect = isChsum(citm) ? 'none' : 'move'; // 1
			},
			async drop(ev) {
				self.clearClass('dragover');
				var citm = ev.target.closest(".item");
				if ( isChsum(citm) ) { // 2
					return
				} else {
					if (self.elDrag === this) return; // 3
					self.elDrag.replaceWith(this.cloneNode(true));
					this.replaceWith(self.elDrag);
					self.elDrag.classList.remove('dragging');
					var elSource = self._cfg._ic.querySelectorAll(self._cfg._ns)[self.elDrag.dataset.index - 1]; // 4
					self.autcom_sc.reattach(elSource); // 5
					self.setOrderAttr(); // 6
					await self.mnemEvaluate(true, true, function(){ // 7
						self.reflectChecksumElm(); // 8
					});
				}
			},
			dragend(ev) {
				self.clearClass('dragover');
				self.clearClass('dragging');
			}
		};
		Array.from(self._cfg._ic.children).forEach((el, i) => { // 9
			el.draggable = (!Array.from(el.classList).indexOf(self._cfg._ce) != -1) ? true : false;
		});
		["dragstart", "dragover", "drop", "dragend"].forEach(evName => { // 10
			self._cfg._ic.addEventListener(evName, (ev) => {
				var elItem = ev.target.closest(".item");
				if (!elItem) return;
				events[evName].call(elItem, ev);
			});
		});
	}
	clearClass(c){classOps(this._cfg._ic.querySelectorAll(`.${c}`), c)}
	setOrderAttr(){ var self = this; for (var i = 0; i < self._cfg._ic.children.length; i++) { self._cfg._ic.children[i].dataset.index = i + 1; } }
	gatherMnem(elms){ return elms.map((itm)=>itm.value) };
	setChsumState(elm, draggable){
		var clelm = elm.closest(".item");
		clelm.classList[draggable ? 'remove' : 'add'](this._cfg._ce);
		clelm.setAttribute('draggable',draggable);
	}
	getActiveVal(){
		var si = this._cfg._sa.querySelector('input:checked');
		return si ? si.value : 0;
	}
}

window['MnemonicInterface'] = MnemonicInterface;
window['bip39'] = bip39;

window.addEventListener('load', () => {
	var mnemui = new MnemonicInterface();
});
