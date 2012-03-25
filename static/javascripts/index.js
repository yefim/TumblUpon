$(document).ready(function() {
  $('.dialog').hide().not($('a')).click(function() {
      $(this).fadeOut();
  });
  $('#logo img').click(function() {
    window.location = '/';
  });
  $('.btn').click(function() {
    //window.location = $(this).attr('href');
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
});
