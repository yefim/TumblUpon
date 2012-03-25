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
    if (content_args.type === "photo") {
        return processPhoto(content_args.photos[UTILS.PHOTO_INDEX],
                            content_args.blog_name,
                            content_args.timestamp);
    } else {
        return null;
    }
    /*
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
    */
}
var process_full_post = function(post) {
  var blog_name = post.blog_name;
  var post_url = post.post_url;
  var blog_url = post_url.match("http://(.*)\/post\/.*")[1];
  var caption = post.caption;
  var timestamp = post.timestamp;
  var note_count = post.note_count;
  var photos = post.photos;
  var tags = post.tags;
  var caption = post.caption;
  var text = "<div class='blogname'>Posted by "+linkify('http://'+blog_url,blog_name)+" on "+linkify(make_datestamp(timestamp),post_url)+"</div><div class='note'>"+note_count+" notes</div>";
  text += "<div class='pics'>";
  for (j in photos) {
    //text += "<div style='background:url("+photos[j].alt_sizes[0].url+") no-repeat center center'></div>";
    text += linkify("<img src='"+photos[j].alt_sizes[0].url+"'/>",post_url);
    //text += "<div>"+photos[j].alt_sizes[0].url+"</div>";
  }
  text += "</div>";
  text += "<div class='caption'>"+caption+"</div>";
  text += "<div class='tags'>tags: " + tags.join(', ') + "</div>";
  text += "</div>";
  return text;
}

var linkify = function(text, url) {
  return "<a href='"+url+"'>"+text+"</a>";
}

var processPhoto = function(photo, blog_name, timestamp) {
    var alt = getOptimalPhoto(photo.alt_sizes);
    var url = alt.url;
    var height = alt.height;
    var width = alt.width;

    // header div element
    var html = "<div class='post photo' data-category='photo' data-timestamp='" +
        timestamp + "' data-name='" + blog_name + "'>";

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
    for(index in response) {
      var post = response[index];
      var entry = render_entry(post);
      if (entry == null) continue;
      $post = $(entry);
      
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
      $post.click(function() {
        var text = process_full_post(post);
        //console.log('clicked');
        $('.dialog #content').html(text);
        $('.dialog').css('top',$('.dialog').offset().top);
        //var l = $(document).width()/2 - $(text).width()/2;
        //$('.dialog #content').css('left', l);
        //$('.dialog').css('visibility','visible');
        $('.dialog').fadeIn();
        //var link_url = post.post_url.match("http://(.*)\/post\/.*")[1];
        //window.location = '/api/v1/blog/' + link_url + '/post/' + post.id;
      }); 
    }
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
