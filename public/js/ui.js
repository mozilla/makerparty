/* *******************************************************
*  Colorbox (for photos hosted on our site)
*/
$(".history .collage-pics").colorbox({ rel: "collage-pics" });
$(".history .infographic").colorbox({ rel: "infographic" });


/* ****************************************
*  Sign up to Get Maker Party Update
*/

$("#form-get-updates").submit(function(event){
  event.preventDefault();
  var form = $(this);
  var validForm = validateSignUpForm();
  console.log( "=== VALID FORM = " + validForm );
  if (validForm) {

    $.ajax({
      url: form.attr("action"),
      data: form.serialize(),
      type: "POST",
      crossDomain: true,
      dataType: "json",
      complete: function(jqXHR,textStatus){
        // redirect to thank you page
        window.location.href = "https://sendto.mozilla.org/page/st/maker-party-2014-save-the-date?action_code=FgxRWxYUOVIKQV0YAFcDTFM&td=TVHLTsMwEPwVKyeQmmD3FRouHBCIQwUSFyRA1sbZJBaOHflRURD_zoZWFMsH78x4Zz3-ynAAbbIqi70OOkQMUdtucd1NcKHckM2ymsBcORtBxTzqAUlOsMdGe1RRJm8OiOySbo5HWYMxLh4rN0a5mzibjJllwSWvjm1Cqv-XY-8s_umiIxfZaoMhq17eCNGdTaNsnR_kr5eYc7qlPEJE2Ux-cy6WOV_mYs34vFqVFV-fFHqU0DSeZOvLQpSbYl0WZXniU0AvoUM7ddq6T20MvF6sCs7OtqC0jS70V-zeRjSMAPbwxJ6Z4MXmivldNb8s-Dm7Q_XuXi9oDk5bsFuKqXUfhBA9WfUwRrKZ5hcUr0k0OeiwJ0Lbw7NWbb2EElSuVrzOhcBFvmmgzfm_Ra2mHCz8_sgW3tGzR_Bxz6YI2BPskMUe2Q09jLSDa5LBo_qQY_b9Aw";
      }
    });
  }
});

function validateSignUpForm() {
  var form = $("#form-get-updates");
  var email = form.find("input[name=email]");
  var checkbox = form.find("input[name=custom-2517]");
  console.log(email.val());
  var validEmail = validateEmail( email.val() );
  console.log("valid email = " + validEmail);
  console.log("valid checkbox = " + checkbox.is(":checked"));
  if ( !validEmail ) {
    displayError(email);
  } else {
    hideError(email);
  }

  if ( !checkbox.is(":checked") ) {
    displayError(checkbox);
  } else {
    hideError(checkbox);
  }
  return form.find(".has-error").length == 0;
}


function validateEmail(email) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

function displayError(elem) {
  elem.parents(".form-field").addClass("has-error").find(".help-block").show();
}

function hideError(elem) {
  elem.parents(".form-field").removeClass("has-error").find(".help-block").hide();
}


/* *******************************************************
*  "Landing" page
*/

if ( $("body").hasClass("home") ){

  /* ****************************************
  *  Auto-rotating quotes
  */
  function showQuote() {
    var totalNum = $(".quote-text").length;
    var indexShown = Math.floor( Math.random()*totalNum );
    $(".quote-text").eq(indexShown).addClass("current");
    $(".quote-source").eq(indexShown).addClass("current");
    setInterval(autoRotatingQuotes, 13000);
  }
  // Auto rotates quotes
  function rotate(elemClass) {
    var current = $("." + elemClass + ".current");
    current.delay(10000).fadeOut(1000,function(){
      $(this).toggleClass("current");
      var nextQuote = ( $(this).next("."+elemClass).length > 0 ) ?
                            $(this).next("."+elemClass) : $(this).siblings("."+elemClass).eq(0);
      nextQuote.fadeIn(1000).toggleClass("current");
    });
  }
  function autoRotatingQuotes(){
    rotate("quote-text");
    rotate("quote-source");
  }
  // Randomly pick a quote to start
  showQuote();


  /* ****************************************
  *  Display Maker Party 2014 Flickr photos
  */
  $.ajax({
    url: "/flickr-photos",
    type: "GET",
    crossDomain: true,
    dataType: "json",
    success: function(data, textStatus, jqXHR) {
      var photoset = data.photoset;
      var photos = photoset.photo;
      $.each(photos, function(idx, photo) {
        var photoURLs = flickrPhotoUrl(photo);
        var big = photoURLs[0];
        var thumb = photoURLs[1];
        var listItem = $("<li></li>");
        var anchor = $("<a></a>").attr("href", big)
                                 .attr("class", "flickr-pics");
        var img = $("<img />").attr("src", thumb);
        $("#flickr-carousel ul").append( listItem.append( anchor.append(img) ) );
      });
      $(".home .flickr-pics").colorbox({ rel: "flickr-pics" });
      $("#flickr-carousel ul").elastislide({
      // minItems: 2
    });
    }
  });

  // https://www.flickr.com/services/api/misc.urls.html
  function flickrPhotoUrl(photo) {
    // in the format of
    // farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
    var urlBase = "//farm" +
            photo.farm +
            ".staticflickr.com" +
            "/" +
            photo.server +
            "/" +
            photo.id +
            "_" +
            photo.secret;
    var originalSize = urlBase + "_b.jpg";
    var thumbnail = urlBase + "_n.jpg";
    return [ originalSize, thumbnail ];
  }

}




/* *******************************************************
*  "Live Updates" page
*/

if ( $("body").hasClass("live-updates") ){
  /* ****************************************
  *  Get & show heatmap on the /live-updates page
  */
  $.ajax({
    url: "/heatmap.svg",
    type: "GET",
    crossDomain: true,
    dataType: "html",
    error: function(jqXHR, textStatus, errorThrown) {
      $("#the-heatmap").html("Sorry, the heatmap cannot be loaded at this moment.");
    },
    success: function(heatmap, textStatus, jqXHR) {
      $("#the-heatmap").html(heatmap);
      showTotalNumberParties();
    },
    complete: function(jqXHR,textStatus){
      console.log("AJAX call to /heatmap.svg is done.");
    }
  });

  /* ****************************************
  *  Get & show total # parties on the /live-updates page IF
  *  the heatmap loads
  */
  function showTotalNumberParties() {
    $.ajax({
      url: "/event-stats",
      type: "GET",
      crossDomain: true,
      dataType: "json",
      error: function(jqXHR, textStatus, errorThrown) {
        $("#total-parties").html("Sorry, the total number of parties cannot be loaded at this moment.");
        $("#total-parties").show();
      },
      success: function(eventStats, textStatus, jqXHR) {
        $("#total-parties > #the-total").html(eventStats.events);
        $("#total-parties").show();
      },
      complete: function(jqXHR,textStatus){
        console.log("AJAX call to /heatmap.svg is done.");
      }
    });
  }


  /* ****************************************
  *  Load latest Webmaker blog post
  */
  var webmakerBlogURL = "https://blog.webmaker.org/feed";

  $.ajax({
    url: document.location.protocol + "//ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=" + encodeURIComponent(webmakerBlogURL),
    type: "GET",
    data: {
      num: 1,
      output: "json"
    },
    dataType: "jsonp",
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Cannot load Webmaker blog feed.");
    },
    success: function(data, textStatus, jqXHR) {
      var latestPost = data.responseData.feed.entries[0];
      var elem = $("#blog-feed");
      // display title
      elem.find("h3").html(latestPost.title);
      // display publish date
      var publishedDate = new Date(latestPost.publishedDate);
      var month = ["January","February","March","April","May","June","July","August","September","October","November","December"][ publishedDate.getMonth() ];
      elem.find("p.blog-date").html( month + " " + publishedDate.getDate() + ", " + publishedDate.getFullYear() );
      // display a 150-word excerpt (and strip off html tags from the original post)
      var blogExcerpt = elem.find("p.blog-excerpt");
      blogExcerpt.html(latestPost.content);
      blogExcerpt.text( blogExcerpt.text().split(" ").slice(0,150).join(" ") + "..." );
      // display "Read more" link
      elem.find("p.read-more-links a").attr("href", latestPost.link);
    }
  });

}
