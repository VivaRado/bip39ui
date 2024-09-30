## **Preface**

**BIP39UI** is an Open Source project of **VivaRado**.

<div markdown='1' class="header_logo">


![Screenshot](https://github.com/VivaRado/BIP39UI/raw/main/_README/assets/media/BIP39UI_logo.svg)


</div>


<div markdown='1' class="header_preview">


![Screenshot](https://github.com/VivaRado/BIP39UI/raw/main/_README/assets/media/BIP39UI_preview.svg)


</div>




 
##  **Introduction**

BIP39 editable mnemonic with checksum recalculation, strength evaluation on a vanilla interface with drag/drop and autocomplete.

#### Contributors:

*  VivaRado <support@vivarado.com>
*  Andreas Kalpakidis
*  Madina Akhmatova

---

### **Profile**
<sub>Introduction / Profile</sub>

<br>


*   Company: VivaRado LLP
*   Designer: Andreas Kalpakidis
*   Management: Madina Akhmatova


---


### **Project Overview**
<sub>Introduction / Project Overview</sub>

<br>


*   Project Name: BIP39UI
*   Code Name: 39
*   Proposal Date: 20/09/2024

---

### **Design**


BIP39UI is project ment to be used for access control, as a replacement to email or phone validation. A client creates a 12 or 24 word mnemonic generated on his machine (client side) for efficiency and load reduction of the servers, by choosing the words from the BIP39 standardized wordlist of 2048 words utilizing a user interface that allows for word to be draggable and discoverable with autocomplete. Post submission the vendor then validates the mnemonic (server side) and if valid, only stores the irreversible seed for later comparisson in password recovery routines maintaining anonymity for the client.

The source consists of **BIP39**, **MnemStrong** and the **Interface**.

---

### **BIP39**
<sub>Design / BIP39</sub>

<br>


The **BIP39** is responsible for generating a mnemonic of given length, parsing an existing mnemonic as entropy, turning said entropy back to a mnemonic, generating a seed from a mnemonic, and generating a list of valid checksum words if the last word of the mnemonic is missing or invalid. We go over these in detail further down.

To aleviate unnessessary server side load by issuing BIP39, validating and issuing checksums - every time the client interacts with the interface, we provide the appropriate **ESM** modules, in the file marked as **.clt.esm.js**, for that to happen on the client. When eventually the client submits the mnemonic to the server, you can run the corresponding validation functions once, in the file marked as **.srv.cjs.js**, to make sure what you are handling is a valid mnemonic.

---

### **Composition**
<sub>Design / BIP39 / Composition</sub>

<br>


The ```src/bip39/deps``` contains **ESM** (ECMAScript modules) and **CJS** (Common JavaScript) files.

---

**Assert**

The assertions for the client include an additional **report** parameter that gets carried all the way from the functions in ```bip39/index``` to the functions ```src/bip39/deps/assert```, in order to return the assertion results throughout the code.

---

**Crypto**

The built in NodeJS.crypto module, is used for various functions like ```pbkdf2, getRandomValues, createHash```, this is replaced on the client with widely available Web APIs ```SubtleCrypto and window.crypto``` and the coresponding functions, to avoid creating overhead by using third party implementations.

---

**Checksum Recalculation**

As our BIP39 implementation is interactive, the checksum will be invalid as soon as the client replaces one of the words or drag/drops another one. For that reason we provide the ```checksumWords``` function that given 12-24 words sans the last (checksum), will recalculate and return the words that are valid for the given mnemonic. We then move those to the interface for the client to pick.

---

### **Functions**
<sub>Design / BIP39 / Functions</sub>

<br>


Here is an overview of the **BIP39** function(s):

<br>

**generateMnemonic** ( ```strength```, ```report [opt.clsd]```, ```wordlist [opt.]``` )
> param **strength**: mnemonic strength 128-256 bits. <br>
> param **report**: optional client side only, error report boolean <br>
> param **wordlist**: optional imported wordlist for specific language. <br>
> 
> ---
> 
> returns (_report:false_): 12-24 words.<br>
> returns (_report:true_): Object { mnemonic: 12-24 words, assertions: Array }<br>
> 
> ---
> 
> Generates x random words. Uses Cryptographically-Secure Random Number Generator.  

<br>

**entropyToMnemonic** ( ```entropy```, ```report [opt.clsd]```, ```wordlist [opt.]``` )
> param **entropy**: entropy byte array. <br>
> param **report**: optional client side only, error report boolean <br>
> param **wordlist**: optional imported wordlist for specific language. <br>
> 
> ---
> 
> returns (_report:false_): 12-24 words.<br>
> returns (_report:true_): Object { mnemonic: 12-24 words, assertions: Array }<br>
> 
> ---
> 
> Reversible: Converts raw entropy in form of byte array to mnemonic string.  

<br>

**mnemonicToEntropy** ( ```mnemonic```, ```report [opt.clsd]```, ```wordlist [opt.]``` )
> param **mnemonic**: 12-24 words. <br>
> param **report**: optional client side only, error report boolean <br>
> param **wordlist**: optional imported wordlist for specific language. <br>
> 
> ---
> 
> returns (_report:false_): Buffer / Uint8Array (clsd)<br>
> returns (_report:true_): Object { mnemonic: 12-24 words, assertions: Array }<br>
> 
> ---
> 
> Reversible: Converts mnemonic string to raw entropy in form of byte array.  

<br>

**validateMnemonic** ( ```mnemonic```, ```report [opt.clsd]```, ```wordlist [opt.]``` )
> param **mnemonic**: 12-24 words. <br>
> param **report**: optional client side only, error report boolean <br>
> param **wordlist**: optional imported wordlist for specific language. <br>
> 
> ---
> 
> returns (_report:false_): boolean<br>
> returns (_report:true_): Object { mnemonic: 12-24 words, assertions: Array }<br>
> 
> ---
> 
> Validates mnemonic for being 12-24 words contained in wordlist.  

<br>

**mnemonicToSeed** ( ```mnemonic```, ```passphrase```, ```report [opt.clsd]```, ```wordlist [opt.]``` )
> param **mnemonic**: mnemonic 12-24 words (string | Uint8Array). <br>
> param **passphrase**: optional string that will additionally protect the key. <br>
> param **report**: optional client side only, error report boolean <br>
> param **wordlist**: imported wordlist for specific language. <br>
> 
> ---
> 
> returns (_report:false_): 64 bytes of key data. <br>
> returns (_report:true_): Object { seed: 64 bytes of key data, assertions: Array }<br>
> 
> ---
> 
> Irreversible (Sync/Async): Uses KDF to derive 64 bytes of key data from mnemonic and optional password.  

<br>

**checksumWords** ( ```mnemonic```, ```wordlist [opt.]``` )
> param **mnemonic**: mnemonic 12-24 words (Array). <br>
> param **wordlist**: optional imported wordlist for specific language. <br>
> 
> ---
> 
> returns: Array with valid checksum words. <br>
> 
> ---
> 
> Generates array of valid checksum words given a mnemonic with invalid checksum.  

---

### **MnemStrong**
<sub>Design / MnemStrong</sub>

<br>


The **MnemStrong** is responsible for evaluating given mnemonic, it is based on [zxcvbn](https://github.com/dropbox/zxcvbn) with all the bloat removed as we are not evaluating a password comprised of alphanumeric plus common symbols, but a mnemonic constructed by words from a predefined wordlist. 
The evaluation functions detect **dictionary words** (words in the wordlist), **unbroken repetition** (repeated words) and **dictionary sequences** (words in sequence just as they appear in the wordlist ). 
The percentage estimation is based on average BIP39 scores for 128 that is (92 rounded to 100) and 256 that is (176 rounded to 180) Bit mnemonics.

---

### **Composition**
<sub>Design / MnemStrong / Composition</sub>

<br>

 
The ```src/mnemstrong/deps``` contains **ESM** (ECMAScript modules) and **CJS** (Common JavaScript) files. Even though we provide **ESM** and **CJS** for **Mnemstrong** those are essentially the same files.

---

### **Functions**
<sub>Design / MnemStrong / Functions</sub>

<br>


Here is an overview of the **MnemStrong** function(s):

<br>

**mnemstrong** ( ```mnemonic``` )
> param **mnemonic**: mnemonic 12-24 words (Array). <br>
> 
> ---
> 
> returns: ```Object { sequence: matches Array, report_calc_time: Number, feedback: warning Array, crack_times_seconds: Object, crack_times_display: Object, score: Number, percentage: percent Number }```<br>
> 
> ---
> 
> Evaluates a mnemonic.

---

### **Interface**
<sub>Design / Interface</sub>

<br>


The **Interface** provides the interactivity with the wordlist to the client, specifically there is the ability to select the strength/size of the mnemonic between two options (128/256) using a [dropdown](https://codepen.io/vivarado/pen/xxebLMB) like this.

The input fields are **draggable**, can **autocomplete** and are **arrow navigable**. There also is a **generate** button.


---

### **Composition**
<sub>Design / Interface / Composition</sub>

<br>



The ```src/interface``` contains **ESM** (ECMAScript modules) only, the CSS is located in the ```src/interface/styles``` directory.


---

### **MnemonicUI**
<sub>Design / Interface / MnemonicUI</sub>

<br>


This module is responsible for all the interface interactions, and binds together all the rest of the interface classes. It initiates the MnemStrong class and Autocomplete class and manages their state in relation to the mnemonic and checksum recalculation.

---

### **Functions**
<sub>Design / Interface / MnemonicUI / Functions</sub>

<br>


Here is an overview of the **MnemonicUI** functions:

<br>

**reflectChecksumElm** ()
> 
>  Defines the interactivity of checksum elements by setting the element ```draggable``` attribute to _false_ or _true_ and _adding_ or _removing_ the ```checksum_elm``` class for **current checksum** and **ante checksum** respectively. <br><br>
Distributes the appropriate wordlist array (dictionary or valid checksums) to the elements currently in the checksum positions (index 12 or 24) by retargeting the **Autocomplete** class using ```Autocomplete.destroy()``` on **current** and **ante checksum**, and ```Autocomplete.reattach()``` to ```self.autcom_sc``` and ```self.autcom_ac```. These are the two groups of autocompletes, the ```autcom_sc``` sans checksum (without checksums) and ```autcom_ac``` avec checksum (with checksums).<br><br>
Then updates the results pool ```Autocomplete.setpool()``` of the current checksum element with the **valid checksums** array set to ```self._cfg._vc``` from ```mnem_evaluate()``` . <br><br>
Finally is sets the **current checksum** element's input value to the first value from the **valid checksums** array.

<br>

**reflectMnemonic** ( ```strength``` )
> param **strength**: Number 128 or 256. <br>
> 
> ---
> 
> Generates a mnemonic of strength 128 or 256 and sets the values to the input field elements.

<br>

**reflectActive** ( ```strength```, ```reflchs``` )
> param **strength**: Number 128, 256 or 0. <br>
> param **reflchs**: boolean (reflect checksum), default is false.<br>
> 
> ---
> 
> Sets the ```self._cfg._ml``` (mnemonic length) according to the active selection of the dropdown. Resets the object order stored in ```data-index``` attribute.<br><br>
Calls for mnemonic generation, evaluation and checksum element update and refreshes the data-index attribute.

<br>

**reflectFeedback** ( ```mv```, ```ms``` )
> param **mv**: Array (mnemonic validation).<br>
> param **ms**: Array (mnemonic strength).<br>
> 
> ---
> 
> Visual alerts and strength bar visuals.

<br>

**mnemEvaluate** ( ```updchs```, ```reflchs```, ```cb``` )
> param **updchs**: boolean (update checksum). <br>
> param **reflchs**: boolean (reflect checksum). <br>
> param **cb**: callback function. <br>
> 
> ---
> 
> Runs validations and evaluations of current mnemonic with valid checksum. Forwards the feedback to ```reflect_feedback``` for visual alerts and strength bar visuals on the client. Updates current mnemonic array ```self._cfg._cm``` if ```updchs``` is true. Updates checksum element value if ```reflchs``` is true.

<br>

**initAutocompleteGroups** ()
> 
>  Initiate the **AutoComplete** groups ```self.autcom_sc``` and ```self.autcom_ac```.

<br>

**initDraggable** ()
> 
>  Initiate dragstart, dragover, drop, dragend events on passphrase inputs container. Prevent checksum elements from being draggable. Evaluate mnemonic on drop and generate a new mnemonic. Manage Autocomplete reattachment to input groups.


---

### **AutoComplete**
<sub>Design / Interface / AutoComplete</sub>

<br>


Autocomplete is responsible for displaying the input fields and their adding interactivity by setting events like input search, arrow navigation, click outside and escape press to close the dropdown. Loading the words to the interface and updating valid checksum words.

---

### **Functions**
<sub>Design / Interface / AutoComplete / Functions</sub>

<br>


Here is an overview of the **AutoComplete** functions:

<br>

**externalEvents** ()
> 
>  Setup external events, up and down arrow navigation, escape key press and click outside.

<br>

**selctEvt** ( ```self```, ```ac``` )
> param **self**: passing object context to avoid event ```this``` collision. <br>
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Click on autocomplete dropdown element.

<br>

**inputEvt** ( ```self```, ```ac``` )
> param **self**: passing object context to avoid event ```this``` collision. <br>
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Handle autocomplete field input event.

<br>

**clickEvt** ( ```self```, ```ac``` )
> param **self**: passing object context to avoid event ```this``` collision. <br>
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Handle click event on autocomplete dropdown elements.

<br>

**exterEvtHandler** ()
> 
>  Close the autocomplete on click outside the autocomplete.

<br>

**arrowEvtHandler** ()
> 
>  Navigate the autocomplete results with up and down arrow.

<br>

**clickEvtHandler** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Pick item in autocomplete dropdown on click.

<br>

**selctEvtHandler** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Select autocomplete input text on click.

<br>

**inputEvtHandler** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Initiate search pool filtering on input event.

<br>

**activate** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Activate external events and click event for autocomplete.

<br>

**toggle** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Toggle show / hide of autocomplete dropdown.

<br>

**show** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Show autocomplete dropdown.

<br>

**hide** ( ```ac```, ```emit``` )
> param **ac**: autocomplete input element. <br>
> param **emit**: emit the event, default is false. <br>
> 
> ---
> 
>  Hide autocomplete dropdown.

<br>

**filterRes** ( ```ac```, ```marker```, ```term``` )
> param **ac**: autocomplete input element. <br>
> param **marker**: autocomplete dropdown item element. <br>
> param **term**: search term <br>
> 
> ---
> 
>  Results pool filtering.

<br>

**termInPool** ( ```ac```, ```term``` )
> param **ac**: autocomplete input element. <br>
> param **term**: search term <br>
> 
> ---
> 
>  Input of words not currently in the search pool or input is empty, results in error.

<br>

**inputReflection** ( ```e```, ```ac``` )
> param **e**: event. <br>
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Manage the way the autocomplete reacts to input value.

<br>

**fillSearchPool** ( ```ac```, ```serv_array``` )
> param **ac**: autocomplete input element. <br>
> param **serv_array**: wordlist Array. <br>
> 
> ---
> 
>  Create autocomplete element pool from provided array.

<br>

**clearHiLight** ()
> 
>  Clear highlight from arrow navigation.

<br>

**build** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Build autocomplete.

<br>

**interact** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Set up autocomplete input element events.

<br>

**reattach** ( ```ac``` )
> param **ac**: autocomplete input element. <br>
> 
> ---
> 
>  Reattach input to autocomplete class

<br>

**destroy** ( ```self```, ```ac```, ```remove``` )
> param **self**: passing object context to avoid event ```this``` collision. <br>
> param **ac**: autocomplete input element. <br>
> param **remove**: boolean, remove element from dom. <br>
> 
> ---
> 
>  Destroy autocomplete and remove events from input.

<br>

---

### **Reports**
<sub>Design / Interface / Reports</sub>

<br>


Contains the ```strength_check``` and ```display_alert``` report rendering functions.

---

### **Functions**
<sub>Design / Interface / Reports / Functions</sub>

<br>


Here is an overview of the **Reports** functions:

<br>

**strengthCheck** ( ```strength_bar```, ```value``` )
> param **strength_bar**: strength bar element. <br>
> param **value**: Number. <br>
> 
> ---
> 
>  Display strength value on strength bar as percentage.

<br>

**displayAlert** ( ```alert_data```, ```target_alert```, ```animation``` )
> param **alert_data**: feedback array. <br>
> param **target_alert**: alert element. <br>
> param **animation**: Boolean. <br>
> 
> ---
> 
>  Display feedback as alerts.

---


### **Production**


To work on extending this module a few things are provided:

Run in browser with reload allong with gulp watch:

```
npm run dev
```

<br>

Just build with gulp

```
npm run build
```

<br>

Test the server side functions

```
npm run test
```


---

### **Installation**


**BIP39UI** does not have any dependencies, other than those for development (--save-dev).

To install:

```
npm install
```

---

### **Glossary**


**BIP39**: Bitcoin Improvement Proposal 0039.<br>
**opt.**: Optional.<br>
**clsd**: Client Side.<br>

---


### **Reference**


BIP39 Mediawiki [GitHub](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

---

