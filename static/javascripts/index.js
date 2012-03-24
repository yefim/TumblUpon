$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url:'/api/v1/popular'
  }).done(function(response) {
    response = $.parseJSON(response);
    $.each(response, function(index, post) {
      processPost(index, post);
      console.log(response);
    });
    $("#container").isotope({
      itemSelector : '.post',
      layoutMode : 'fitRows'
    });
  });
  var processPost = function(index, post) {
    var url = post.post_url;
    $('#container').append('<div class="post"><a href="'+url+'">'+url+'</a></div>');
  }
});
