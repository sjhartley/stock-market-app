function line_generator(line_char, line_length){
  var line=line_char;
  for(var i=0; i<line_length; i++) {
    line = line + line_char;
  }
  return line;
}

function bracket_remover(str){
  if(str.search(/\]/i) !== -1){
    while(str.search(/\]/i) !== -1){
      var bracket_pos_1 = str.search(/\[/i);
        var bracket_pos_2 = str.search(/\]/i);
        var str_remove = str.slice(bracket_pos_1, bracket_pos_2+1);
        str = str.replace(str_remove, '');
    }
  }
  return str;
}

exports.line_generator = line_generator;
exports.bracket_remover = bracket_remover;
