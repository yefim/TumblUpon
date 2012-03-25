/**********************************************************************
 * This file provides utility methods useful for turning each post into
 * Isotope tiles.
 **********************************************************************/

var UTILS = {
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP',
        'OCT', 'NOV', 'DEC'],
    MAX_WIDTH: 100,
    PHOTO_INDEX: 0,
    ALT_SIZE_INDEX: 0,
    OPTIMAL_WIDTH: 350
};

/* Renders a post entry via the following specifications:
 * 
 * content_args = 
 * {
 *      blog_name:
 *      post_url:
 *      type:
 *      photos: [ {original_size: { url: } } ]
 *      body:
 * }
 *
 * The content field contains either an image url if type="photo", or 
 * simple text if type="text".
 */
var render_entry = function(content_args) {
    // var str = ""; //"<a href='" + content_args.post_url + "'>";
    //var str += "<div class='post " + content_args.type + "'>";
    switch (content_args.type) {
        case "photo":
            return processPhoto(content_args.photos[UTILS.PHOTO_INDEX], 
                                content_args.timestamp);
        case "text":
            return "<div class='post text' data-category='text'" +
                "data-timestamp='" + content_args.timestamp + "'><h1 class='snippet'>" +
                snip_text(content_args.body) + "</h1></div>";
        default:
            return "<div class='post' style='display:hidden'></div>";
    }
    //str += "\t<h2 class='blog-name'>" + content_args.blog_name + "</h2>\n";
    //str += "\t<h2 class='blog-name'>" + content_args.blog_name + "</h2>\n";
    //str += "\t<p class='datestamp'>" + make_datestamp(content_args.timestamp) + "</p>\n";
    //str += "</a>\n";
    //str += "</div>\n"

}

var processPhoto = function(photo, timestamp) {
  var alt = getOptimalPhoto(photo.alt_sizes);
  var url = alt.url;
  var height = alt.height * 1.2;
  var width = alt.width * 1.2;
  console.log(height + ', ' + width);
  return "<div class='post photo' style='height: " + height + "px;" + 
        "width: " + width + "px;" +
        "background:url(" + url + ") no-repeat center center' " +
        "data-category='photo' data-timestamp='" + timestamp + "'></div>";
}

var getOptimalPhoto = function(alt_sizes) {
    var i;
    for (i = 0; i < alt_sizes.length; i += 1) {
        if (alt_sizes[i].width <= UTILS.OPTIMAL_WIDTH)
            return alt_sizes[i];
    }

    return null;
}

var snip_text = function(string) {
    var result = string.replace(/<(?:.|\n)*?>/gm, '');
    return result.substring(0, Math.min(UTILS.MAX_WIDTH, result.length)) + "...";
}

function make_datestamp (timestamp) {
    var d = new Date(timestamp);
    return UTILS.months[d.getMonth()] + " " + d.getDate();
}

var populate = function (offset) {
  var $container = $("#container");
  $.ajax({
    type: 'GET',
    url:'/api/v1/popular/?offset=' + 20 * offset
  }).done(function(response) {
    response = $.parseJSON(response);
    $.each(response, function(index, post) {
      $post = $(render_entry(post));
      $container.isotope('insert', $post);
      //$('#container').append(render_entry(post));
      console.log(post);
      $post.click(function() {
        var link_url = post.post_url.match("http://(.*)\/post\/.*")[1];
        window.location = '/api/v1/blog/' + link_url + '/post/' + post.id;
      });
    });
    setTimeout(function () { scrollLimit += 1; }, 5000);
  });

}

var scrolls = 0;
var scrollLimit = 1;

var scroll = function () {
    var contentHeight = 800;
    var clientHeight = document.documentElement.clientHeight;
    var scrollPosition;
    var scrollTrigger = 10;
    if (navigator.appName == "Microsoft Internet Explorer") {
        scrollPosition = document.documentElement.scrollTop;
    } else {
        scrollPosition = window.pageYOffset;
    }
    console.log(clientHeight + scrollPosition + scrollTrigger + " " + $(document).height());
    if (clientHeight + scrollPosition + scrollTrigger > $(document).height()) {
        console.log("Trigger" + " " + scrolls + " " + scrollLimit);
        if (scrolls < scrollLimit) {
            scrolls += 1;
            console.log("Scrolls" + scrolls + " " + scrollLimit);
            console.log("populating...");
            populate(scrolls);
        }
    }
}
