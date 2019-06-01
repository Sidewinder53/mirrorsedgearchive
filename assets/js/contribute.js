submit = function(event) {
  if (document.getElementById('agreement').checked == true) {
    return true;
  } else {
    document.getElementById('agreement').classList.add('is-invalid');
    return false;
  }
};

mc = function(event) {
  $('#collapse_info').collapse('hide');
  $('#collapse_mc').collapse('show');
};
