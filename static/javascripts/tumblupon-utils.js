/**********************************************************************
 * This file provides utility methods useful for turning each post into
 * Isotope tiles.
 **********************************************************************/

var UTILS = {
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP',
        'OCT', 'NOV', 'DEC'],
    MAX_WIDTH: 100,
    PHOTO_INDEX: 0,
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
                                content_args.blog_name,
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
  for (j in photos) {
    text += "<div class='pic'><img src='"+photos[j].alt_sizes[0].url+"'/>";
  }
  text += "</div>";
  return text;
}

var processPhoto = function(photo, blog_name, timestamp) {
  var alt = getOptimalPhoto(photo.alt_sizes);
  var url = alt.url;
  var height = alt.height;
  var width = alt.width;
  console.log(height + ', ' + width);

  /*var html = "<div class='post photo ic_container' " + 
        "data-category='photo' data-timestamp='" + timestamp + "'>";
  
  html += "<img class='pic' style='height:" + height + "px; width:" + width + " px;' " +
      "src='" + url + "' />";
  html += "<div class='overlay' style='display:none;'></div>";
  html += "<div class='ic_caption'>";
  html += "<p class='ic_text'>from: " + blog_name + "</p>";
  html += "</div>";
  
  html += "</div>";
  return html;*/
  return "<div class='post photo' data-category='photo' data-timestamp='" + timestamp + "'>" +
          "<div class='pic ic_container' style='height: " + height + "px;" + 
          "width: " + width + "px;" +
          "background:url(" + url + ") no-repeat center center'>" +
          "<div class='overlay' style='display:none;'></div>" +
          "<div class='ic_caption'>" +
          "<h3>from: &nbsp;&nbsp;" + blog_name + "</h3>" +
          "<p class='ic_text'>" + make_datestamp(timestamp) + "</p>" +
          "</div></div></div>";
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

var make_datestamp = function(timestamp) {
    var d = new Date(timestamp);
    return UTILS.months[d.getMonth()] + " " + d.getDate();
}
