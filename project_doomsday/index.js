$( document ).ready(function() {

	$('#readonlyalert').on('closed.bs.alert', function () {
		$('#readonlynotice').css({'margin-top' : '0' });
	})
});