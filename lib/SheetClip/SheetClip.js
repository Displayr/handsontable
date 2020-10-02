/**
 * SheetClip - Spreadsheet Clipboard Parser
 * version 0.2
 *
 * This tiny library transforms JavaScript arrays to strings that are pasteable by LibreOffice, OpenOffice,
 * Google Docs and Microsoft Excel.
 *
 * Copyright 2012, Marcin Warpechowski
 * Licensed under the MIT license.
 * http://github.com/warpech/sheetclip/
 */
/*jslint white: true*/
(function (global) {
  "use strict";

  function countQuotes(str) {//TODO remove if not used
    return str.split('"').length - 1;
  }

  var SheetClip = {
    /**
     * Decode spreadsheet string into array
     *
     * @param {String} str
     * @returns {Array}
     */
    parse: function (str) {
      const row_delimeter = '\n';
      const col_delimeter = '\t';
      const quote = '"';
      var a = [];
      var r = 0;
      var c = 0;
      var in_field = false;
      var in_quotes = false;
      var needed_quotes = false;
      a[r] = [];
    
      for (var i=0; i<str.length; i++) {
        if (in_field) {
          // every other char
          if (in_quotes) {
            // in a quoted field
            if (str[i] == quote) {
              // possible end quote
              if (i === str.length - 1 || str[i+1] === row_delimeter || str[i+1] === col_delimeter) {
                // end quote
                in_quotes = false;
                if (!needed_quotes) {
                  // change quoted string to non-quoted
                  a[r][c] = quote + a[r][c].replace(quote, quote + quote) + quote;
                  let temp = a[r][c].split(row_delimeter).map((line) => line.split(col_delimeter));
                  for (var j=0; j<temp.length; j++) {
                    if (j !== 0) {
                      r++;
                      c = 0;
                      a[r] = [];
                    }
                    for (var k=0; k<temp[j].length; k++) {
                      if (k !== 0) {
                        c++;
                      }
                      a[r][c] = temp[j][k];
                    }
                  }
                }
              } else if (str[i+1] === quote) {
                // escaped quote
                i++;
                a[r][c] += quote;
              } else {
                // shouldn't be a quoted string
                in_quotes = false;
                // change quoted string to non-quoted
                a[r][c] = quote + a[r][c].replace(quote, quote + quote) + quote;
                let temp = a[r][c].split(row_delimeter).map((line) => line.split(col_delimeter));
                for (var j=0; j<temp.length; j++) {
                  if (j !== 0) {
                    r++;
                    c = 0;
                    a[r] = [];
                  }
                  for (var k=0; k<temp[j].length; k++) {
                    if (k !== 0) {
                      c++;
                    }
                    a[r][c] = temp[j][k];
                  }
                }
              }
            } else {
              // add to this field
              a[r][c] += str[i];
              if (str[i] === row_delimeter || str[i] === col_delimeter) {
                // it needed quotes
                needed_quotes = true;
              }
            }
          } else {
            // in a not-quoted field
            if (str[i] === row_delimeter) {
              // new row
              r++;
              c = 0;
              a[r] = [];
              in_field = false;
            } else if (str[i] === col_delimeter) {
              // next column
              c++;
              in_field = false;
            } else {
              // add to this field
              a[r][c] += str[i];
            }
          }
        } else {
          // first char of field
          in_field = true;
          if (str[i] === quote) {
            // start of quoted field
            a[r][c] = '';
            in_quotes = true;
          } else {
            if (str[i] === row_delimeter || str[i] === col_delimeter) {
              // empty field
              a[r][c] = '';
              i--;
            } else {
              // start of non-quoted field
              a[r][c] = str[i];
            }
            in_quotes = false;
          }
          needed_quotes = false;
        }
      }
      if (a[r].length === 0) {
        // remove empty last row (happens when str finishes with a row_delimeter)
        a.pop();
      }
      return a;
    },

    /**
     * Encode array into valid spreadsheet string
     *
     * @param arr
     * @returns {String}
     */
    stringify: function (arr) {
      var r, rLen, c, cLen, str = '', val;

      for (r = 0, rLen = arr.length; r < rLen; r += 1) {
        cLen = arr[r].length;

        for (c = 0; c < cLen; c += 1) {
          if (c > 0) {
            str += '\t';
          }
          val = arr[r][c];

          if (typeof val === 'string') {
            if (val.indexOf('\n') > -1) {
              str += '"' + val.replace(/"/g, '""') + '"';
            }
            else {
              str += val;
            }
          }
          else if (val === null || val === void 0) { // void 0 resolves to undefined
            str += '';
          }
          else {
            str += val;
          }
        }

        if (r !== rLen - 1) {
          str += '\n';
        }
      }

      return str;
    }
  };

  if (typeof exports !== 'undefined') {
    exports.parse = SheetClip.parse;
    exports.stringify = SheetClip.stringify;
  } else {
    global.SheetClip = SheetClip;
  }
}(window));
