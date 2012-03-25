$(document).ready(function() {
  var $container = $("#container");

  $container.isotope({
    itemSelector : '.post',
    layoutMode : 'masonry',
    getSortData : {
        timestamp : function ($elem) {
            return parseInt($elem.attr('data-timestamp'));
        }
    },
    sortBy : 'timestamp',
    sortAscending : false
  });

  $("#sort-by a").click(function(e) {
      var sortName = $(this).attr('href').slice(1);
      
      if (sortName === 'newest') {
          $container.isotope({ sortAscending : false });
      }
      if (sortName === 'oldest') {
          $container.isotope({ sortAscending : true });
      }

      e.preventDefault();
      return true;
  });

  $.ajax({
    type: 'GET',
    url:'/api/v1/popular'
  }).done(function(response) {
    response = $.parseJSON(response);
    $.each(response, function(index, post) {
      $post = $(render_entry(post));
      $post.mosaic();
      $container.isotope('insert', $post);
      //$('#container').append(render_entry(post));
      console.log(post);
      $post.click(function() {
        var link_url = post.link_url.replace(/http:\/\//i,'');
        window.location = '/api/v1/blog/' + link_url + '/post/' + post.id;
      });
    });
  });
});
