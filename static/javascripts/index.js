$(document).ready(function() {
  $('#logo img').click(function() {
    window.location = '/';
  });
  var $container = $("#container");
  //$('#options').hide();

  /*
  $('#settings').click(function() {
    $('#options').slideToggle();
  })
  */

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
        },
        name : function ($elem) {
            return $elem.attr('data-name');
        }
    },
    sortBy : 'timestamp',
    sortAscending : false
  });

  $("#sort-by button").click(function(e) {
      var sortName = $(this).attr('href').slice(1);
      $container.isotope({ sortBy : sortName });;

      e.preventDefault();
      return true;
  });
  $("#sort-order button").click(function(e) {
      var sortOrder = $(this).attr('href').slice(1);
      
      if (sortOrder === "ascend") {
          $container.isotope({ sortAscending : true });
      }
      else if (sortOrder === "descend") {
          $container.isotope({ sortAscending : false });
      }

      e.preventDefault();
      return true;
  });


  $("#refresh").click(function(e) {
      $container.isotope('remove', $container.children());
      setTimeout(populate, 500, 0);
      e.preventDefault();
      return true;
  });

  populate(0);
  // setInterval("scroll();", 1000);

  $("#add-form").submit(function(e) {
      console.log("submit");
      addItem();
      e.preventDefault();
      return true;
  });

  var addItem = function () {
      var tag = $("#tag").val();
      $.ajax({
          type: 'GET',
          url: '/tag/create/'+tag+'/'
      }).done(function(response) {
          $('#main').append('<div class="row"><div class="span4"><span>'+tag+'</span></div><div class="app-items-btns span4"><a class="btn"onclick="removeItem(this)"><i class="icon-remove"></i></a></div></div>');
          $("#tag").val('');
          $.ajax({
            type: 'GET',
            url:'/api/v1/tags/'+tag
          }).done(function(response) {
            response = $.parseJSON(response);
            $.each(response, function(index, post) {
              var entry = render_entry(post, tag);
              if (entry == null)
                return true;
              var $post = $(entry);
              
              $container.isotope('insert', $post);
               
              if ($post.hasClass('photo')) {
                  $post.capslide({
                      caption_color: '#fff',
                      caption_bgcolor: '#000',
                      overlay_bgcolor: '#444',
                      border: '1px dashed #000',
                      showcaption: true
                  }); 
              }
              var url = post.post_url;
              $post.bind('click', {url: url}, function(event) {
                  window.open(
                      event.data.url,
                      '_blank'
                 );
              });
            });
          });
      });
  
  }
});
