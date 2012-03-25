$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url:'/api/v1/popular'
  }).done(function(response) {
    response = $.parseJSON(response);
    $.each(response, function(index, post) {
      $('#container').append(render_entry(post));
      console.log(response);
    });
    $("#container").isotope({
      itemSelector : '.post',
      layoutMode : 'fitRows'
    });
  });
});
