$(document).ready(function() {
  $('#logo img').click(function() {
    window.location = '/';
  });
  var $container = $("#container");

  $container.isotope({
    itemSelector : '.post',
    layoutMode : 'masonry',
    animationOption: {
      duration: 750,
      easing: 'linear',
      queue: false
            }).done(function(response) {
                $(e).parents(".row").remove();
            });
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

  $("#tag").submit(function() {
      addItem();
      return true;
  });
  $("#add-button").click(function() {
      addItem();
      return true;
});
