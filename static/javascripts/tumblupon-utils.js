/**********************************************************************
 * This file provides utility methods useful for turning each post into
 * Isotope tiles.
 **********************************************************************/

var UTILS = {
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP',
        'OCT', 'NOV', 'DEC'],
    MAX_WIDTH: 107,
    PHOTO_INDEX: 0,
    OPTIMAL_WIDTH: 350,
    WIDTH_TOL: 15
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
    switch (content_args.type) {
        case "photo":
            return processPhoto(content_args.photos[UTILS.PHOTO_INDEX],
                                content_args.blog_name,
                                content_args.timestamp);
        case "text":
            return "<div class='post text' data-category='text'" +
                "data-timestamp='" + content_args.timestamp + "'><h1 class='snippet'>" +
                snip_text(content_args.body) + "</h1></div>";
        default:
            return "<div class='post' style='display:hidden'></div>";
    }
}
var process_full_post = function(post) {
  var blog_name = post.blog_name;
  var caption = post.caption;
  var timestamp = post.timestamp;
  var note_count = post.note_count;
  var photos = post.photos;
  var tags = post.tags;
  var text = "<div id='mosaic'>";
  text += "<div class='blogname'>"+blog_name+"</div>";
  text += "<div class='note'>"+note_count+"</div>";
  text += "<div class='date'>"+make_datestamp(timestamp)+"</div>";
  for (i in tags) {
    text += "<div class='tag'>"+tags[i]+"</div>";
  }
  text += "<div class='pics'>";
  for (j in photos) {
    text += "<img src='"+photos[j].alt_sizes[0].url+"'/><br/>";
  }
  text += "</div>";
  text += "</div>";
  return text;
}

var processPhoto = function(photo, blog_name, timestamp) {
    var alt = getOptimalPhoto(photo.alt_sizes);
    var url = alt.url;
    var height = alt.height;
    var width = alt.width;

    // header div element
    var html = "<div class='post photo' data-category='photo' data-timestamp='" +
        timestamp + "'>";

    // div element that contains the picture
    html += "<div class='pic ic_container' style='height: " + height + "px;" + 
          "width: " + width + "px;" +
          "background:url(" + url + ") no-repeat center center'>";

    // div for the captioning overlay
    html += "<div class='overlay' style='display:none;'></div>";

    // captioning content
    html += "<div class='ic_caption'>" +
          "<h3>from: &nbsp;&nbsp;" + blog_name + "</h3>" +
          "<p class='ic_text'>" + make_datestamp(timestamp) + "</p>" +
          "</div>";

    // close remaining tags
    html += "</div></div>";

    return html;
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
    // Remove the unwanted HTML tags
    var result = string.replace(/<(?:.|\n)*?>/gm, '');

    if (result.length <= UTILS.MAX_WIDTH)
        return result;

    /* Now we cut off the text with respect to the following rules:
     * 
     * First, look at result[UTILS.MAX_WIDTH]. If this character is a space, we
     * are done; cut the string off at that point. If not...
     *
     * - Within a range from -WIDTH_TOL to MAX_WIDTH, find the last space.
     * - If the space does not exist within the tolerance, then we cut off at
     *   MAX_WIDTH.
     * - Otherwise, we take the last occurring space.
     *
     * Don't question these rules. They're as random as a quantum bogosort.
     */
    for (var i = 0; i < UTILS.WIDTH_TOL; i += 1) {
        if (result[UTILS.MAX_WIDTH - i] === ' ') {
            return result.substring(0, UTILS.MAX_WIDTH - i) + "...";
        }
    }

    return result.substring(0, UTILS.MAX_WIDTH) + "...";
}

var make_datestamp = function(timestamp) {
    var d = new Date(timestamp * 1000);
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
          
      if ($post.hasClass('photo')) {
          $post.capslide({
              caption_color: '#fff',
              caption_bgcolor: '#000',
              overlay_bgcolor: '#444',
              border: '1px dashed #000',
              showcaption: true
          }); 
      }   
      var text = process_full_post(post);
      $post.click(function() {
        $('.dialog #content').html(text);
        //$('.dialog').css('visibility','visible');
        $('.dialog').fadeIn();
        //var link_url = post.post_url.match("http://(.*)\/post\/.*")[1];
        //window.location = '/api/v1/blog/' + link_url + '/post/' + post.id;
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
