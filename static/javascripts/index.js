$(document).ready(function() {
  $('.dialog').hide();
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
              caption_color: 'black',
              caption_bgcolor: '#E6E79C',
              overlay_bgcolor: '#E6E79C',
              border: '',
              showcaption: true
          });
      }

      console.log(post);
      var text = "<div id='mosaic'>" +
                    "<div>Testing1</div>" +
                    "<div>Testing2</div>" +
                    "<div>Testing3</div>" +
                  "</div>";
      $post.click(function() {
        $('.dialog #content').html('HELLO THERE');
        //$('.dialog').css('visibility','visible');
        if ($('.dialog').is(':visible')) {
          $('.dialog').show();
        } else {
          $('.dialog').hide();
        }
        //var link_url = post.post_url.match("http://(.*)\/post\/.*")[1];
        //window.location = '/api/v1/blog/' + link_url + '/post/' + post.id;
      });
    });
  });
});
