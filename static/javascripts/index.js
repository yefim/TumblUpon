$(document).ready(function() {
  $('.dialog').hide().click(function() {
      $(this).fadeOut();
  });
  var $container = $("#container");

  $container.isotope({
    itemSelector : '.post',
    layoutMode : 'masonry',
    animationOption: {
      duration: 750,
      easing: 'linear',
      queue: false
    },
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
  populate(0);
  // setInterval("scroll();", 1000);

  $.ajax({
    type: 'GET',
    url:'/api/v1/popular'
  }).done(function(response) {
    response = $.parseJSON(response);
    $.each(response, function(index, post) {
      $post = $(render_entry(post));
      $container.isotope('insert', $post);
      
      if ($post.hasClass('photo')) {
          console.log("has photo");
          $post.capslide({
              caption_color: '#fff',
              caption_bgcolor: '#000',
              overlay_bgcolor: '#444',
              border: '1px dashed #000',
              showcaption: true
          });
      }

      console.log(post);
      var text = process_full_post(post);
      $post.click(function() {
        $('.dialog #content').html(text);
        //$('.dialog').css('visibility','visible');
        $('.dialog').fadeIn();
        //var link_url = post.post_url.match("http://(.*)\/post\/.*")[1];
        //window.location = '/api/v1/blog/' + link_url + '/post/' + post.id;
      });
    });
  });
});
