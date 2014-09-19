// Add thousands separators to number. eg. 10,000,000
function addCommasToNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* *******************************************************
 *  Colorbox (for photos hosted on our site)
 */
$(".history .collage-pics").colorbox({
  rel: "collage-pics"
});

/* ****************************************
 *  Sign up to Get Maker Party Update
 */

$("#form-get-updates").submit(function (event) {
  event.preventDefault();
  var form = $(this);
  var validForm = validateSignUpForm();
  console.log("=== VALID FORM = " + validForm);
  if (validForm) {

    $.ajax({
      url: form.attr("action"),
      data: form.serialize(),
      type: "POST",
      crossDomain: true,
      dataType: "json",
      complete: function (jqXHR, textStatus) {
        // redirect to thank you page
        window.location.href = "https://sendto.mozilla.org/page/st/maker-party-signup";
      }
    });
  }
});

function validateSignUpForm() {
  var form = $("#form-get-updates");
  var email = form.find("input[name=email]");
  var checkbox = form.find("input[name=custom-2517]");
  console.log(email.val());
  var validEmail = validateEmail(email.val());
  console.log("valid email = " + validEmail);
  console.log("valid checkbox = " + checkbox.is(":checked"));
  if (!validEmail) {
    displayError(email);
  } else {
    hideError(email);
  }

  if (!checkbox.is(":checked")) {
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

if ($("body").hasClass("home")) {

  /* ****************************************
   *  Auto-rotating quotes
   */
  function showQuote() {
    var totalNum = $(".quote-text").length;
    var indexShown = Math.floor(Math.random() * totalNum);
    $(".quote-text").eq(indexShown).addClass("current");
    $(".quote-source").eq(indexShown).addClass("current");
    setInterval(autoRotatingQuotes, 13000);
  }
  // Auto rotates quotes
  function rotate(elemClass) {
    var current = $("." + elemClass + ".current");
    current.delay(10000).fadeOut(1000, function () {
      $(this).toggleClass("current");
      var nextQuote = ($(this).next("." + elemClass).length > 0) ?
        $(this).next("." + elemClass) : $(this).siblings("." + elemClass).eq(0);
      nextQuote.fadeIn(1000).toggleClass("current");
    });
  }

  function autoRotatingQuotes() {
    rotate("quote-text");
    rotate("quote-source");
  }
  // Randomly pick a quote to start
  showQuote();

  // load photo carousel
  $(document).ready(function() {
    $(".home .flickr-pics").colorbox({
      rel: "flickr-pics"
    });
    $("#flickr-carousel ul").elastislide({});
  });

}

/* *******************************************************
 *  "Live Updates" page
 */

if ($("body").hasClass("live-updates")) {
  /* ****************************************
   *  Get & show heatmap on the /live-updates page
   */
  $.ajax({
    url: "/heatmap.svg",
    type: "GET",
    crossDomain: true,
    dataType: "html",
    error: function (jqXHR, textStatus, errorThrown) {
      $("#the-heatmap").html("Sorry, the heatmap cannot be loaded at this moment.");
    },
    success: function (heatmap, textStatus, jqXHR) {
      $("#the-heatmap").html(heatmap);
      showTotalNumberParties();
    },
    complete: function (jqXHR, textStatus) {
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
      error: function (jqXHR, textStatus, errorThrown) {
        $("#total-parties").html("Sorry, the total number of parties cannot be loaded at this moment.");
        $("#total-parties").show();
      },
      success: function (eventStats, textStatus, jqXHR) {
        $("#total-parties > #the-total").html(addCommasToNumber(eventStats.events));
        $("#total-parties").show();
      },
      complete: function (jqXHR, textStatus) {
        console.log("AJAX call to /heatmap.svg is done.");
      }
    });
  }

  /* ****************************************
   *  Load latest Webmaker blog post
   */
  var webmakerBlogURL = "https://blog.webmaker.org/tag/maker-party/feed";

  $.ajax({
    url: document.location.protocol + "//ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=" + encodeURIComponent(webmakerBlogURL),
    type: "GET",
    data: {
      num: 1,
      output: "json"
    },
    dataType: "jsonp",
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Cannot load Webmaker blog feed.");
    },
    success: function (data, textStatus, jqXHR) {
      var latestPost = data.responseData.feed.entries[0];
      var elem = $("#blog-feed");
      // display title
      elem.find("h3").html(latestPost.title);
      // display publish date
      var publishedDate = new Date(latestPost.publishedDate);
      var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][publishedDate.getMonth()];
      elem.find("p.blog-date").html(month + " " + publishedDate.getDate() + ", " + publishedDate.getFullYear());
      // display a 150-word excerpt (and strip off html tags from the original post)
      var blogExcerpt = elem.find("p.blog-excerpt");
      blogExcerpt.html(latestPost.content);
      blogExcerpt.text(blogExcerpt.text().split(" ").slice(0, 150).join(" ") + "...");
      // display "Read more" link
      elem.find("p.read-more-links a").attr("href", latestPost.link);
    }
  });

}
