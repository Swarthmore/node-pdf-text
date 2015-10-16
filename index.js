var _ = require('lodash')
var Parser = require('pdf3json')

//clear the pdf logger
require('util')._logN = function() { }

//given a path to a pdf
//turn it into a json structure

// maxpages is optional

module.exports = function(path, maxpages, cb) {
	
	// From https://gist.github.com/klovadis/2549131
	// retrieve arguments as array
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

	path = args.shift();
	cb = args.pop();
	
	if (args.length > 0) maxpages = args.shift(); else maxpages = null;


  var parser = new Parser()
  parser.on('pdfParser_dataReady', function(result) {

    var text = []

	if (maxpages) {
		result.data.Pages = result.data.Pages.slice(0,maxpages);
	}

    //get text on a particular page
    result.data.Pages.forEach(function(page) {
      var chunks = _(page.Texts).map('R').flatten().map('T').map(decodeURIComponent).value()
      text = text.concat(chunks)
    })

    parser.destroy()

    setImmediate(function() {
      cb(null, text)
    })
  })

  parser.on('pdfParser_dataError', function(err) {
    parser.destroy()
    cb(err)
  })
  if(path instanceof Buffer) {
    return parser.parseBuffer(path)
  }
  parser.loadPDF(path)
}
