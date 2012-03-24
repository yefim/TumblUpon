$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url:'/api/v1/popular'
  }).done(function(response) {
    response = $.parseJSON(response);
    console.log('pre-each loop');
    $.each(response, function(index, post) {
      processPost(index, post);
    });
    console.log(response);
    console.log(response.length);
  });
  
  var processPost= function(index, post) {
    var url = post.post_url;
    $('#container').append('<div class="element"><a href="'+url+'">'+url+'</a></div>');
  }

  /*$('#container').isotope({
    itemSelector : '.element',
    layoutMode : 'fitRows'
  });
  */
});
