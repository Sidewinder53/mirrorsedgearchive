$(document).ready(function() {
  $.get('https://archive.mirrorsedgearchive.de/api.php', function(data) {
    var total_size = Math.floor(data['total_size'] / 1000000);
    animateValue('total_size', 0, total_size, 2000);
    animateValue('total_files', 0, data['total_files'], 2000);
    // $('#total_size').html(data['total_size']);
    // $('#total_files').html(data['total_files']);
  });

  Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {
      s = '0' + s;
    }
    return s;
  };

  function animateValue(id, start, end, duration) {
    var obj = document.getElementById(id);
    obj.classList.remove('preBlurIt');
    obj.classList.add('blurIt');
    var lpad = end.toString().length;
    var range = end - start;
    var minTimer = 50;
    var stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;

    function run() {
      var now = new Date().getTime();
      var remaining = Math.max((endTime - now) / duration, 0);
      var value = Math.round(end - remaining * range);
      obj.innerHTML = value.pad(lpad);
      if (value == end) {
        clearInterval(timer);
        obj.classList.remove('blurIt');
      }
    }

    var timer = setInterval(run, stepTime);
    run();
  }
});
