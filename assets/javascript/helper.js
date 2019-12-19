export default {
  distance: function(){
    let d = $('#dist').val();
    if (d > 50) {
      d = 50;
      $('#dist').val('50');
    } else if (d < 0) {
      d = 1;
      $('#dist').val('1');
    } else if (d == '') {
      d = 5;
      $('#dist').val('5');
    }
    return d;
  }
}