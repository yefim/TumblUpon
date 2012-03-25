$(document).ready(function() {
  $("#container").isotope({
    itemSelector : '.post',
    layoutMode : 'fitRows'
  });
  $.ajax({
    type: 'GET',
    url:'/api/v1/popular'
  }).done(function(response) {
    response = $.parseJSON(response);
    $.each(response, function(index, post) {
      $post = $(render_entry(post));
      $('#container').isotope('insert', $post);
      //$('#container').append(render_entry(post));
      console.log(response);
    });
  });
});
