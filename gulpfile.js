global._r_		= __dirname;
const gulp		= require('gulp');
const path		= require('path');
const rename	= require('gulp-rename');
const replace	= require('gulp-replace');
const include	= require('gulp-file-include');

const reg_import = /import(?:[\s.*]([\w*{}\n\r\t, ]+)[\s*]from)?[\s*](?:["'](.*[\w]+)["'])?/g;
const reg_export = /export(?:[\s.*]([\w*{\n\r\t, )]+[\}]))/g;
const reg_curlyb = /\{([^}]+)\}/;

var args = process.argv[2];

function handle(t,m,a,b) {
	var get_array = function(a){
		var arr;
		if (a.includes('{')) {
			var matches = a.match(reg_curlyb);
			arr = matches[1].split(",").map(function(item) {
				return item.trim();
			});
		} else {
			arr = a;
		}
		return arr
	}
	var arrb = get_array(a)                 
	if (arrb.length > 1) {
		a = `{${arrb.join(', ')}}`;
	} else {
		a = arrb[0];
	}
	if (t == 'import') {
		if (b.indexOf('esm.js') != -1) {
			b = b.replace(/\.esm\.js/g, '.cjs.js');
		}
		if (a == 'wordlist') {
			return `const {${a}} = require("${b}")`;
		} else {
			return `const ${a} = require("${b}")`;
		}
	}else {
		return `module.exports = ${a}`;
	}
}

async function systemreplace() { 
	await new Promise((resolve, reject) => {
		gulp.src([
			'src/mnemstrong/*.esm.js',
			'src/mnemstrong/deps/*.esm.js',
		], { base: '.' })
		.pipe(replace( reg_import, function handleReplace(m, a, b) {
			return handle('import',m,a,b)
		}))
		.pipe(replace( reg_export, function handleReplace(m, a, b) {
			return handle('export',m,a,b)
		}))
		.pipe(rename(function(file) {
			file.basename = file.basename.replace(/esm/g, "cjs");
			return file
		}))
		.pipe(gulp.dest('.'));
		//.on("end", browserifier);
	});
};

gulp.task('sysrep_mnemstrong', async() => {
	systemreplace()
});

if (args == '--build') {
	gulp.task('default', gulp.series('sysrep_mnemstrong'));
} else if (args == '--watch'){
	gulp.task('watch', async() => {
		gulp.watch([
			'gulpfile.js', 
			'src/*/*.*',
			'src/*/deps/*.*',
		], {usePolling: true}, gulp.series('sysrep_mnemstrong'));
	})
	gulp.task('default', gulp.series('watch'));
}

gulp.task('default', gulp.series('sysrep_mnemstrong'));