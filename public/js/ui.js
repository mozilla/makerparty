$(".home .collage-pics").colorbox({
                      rel: "collage-pics"
                   });

$(".history .infographic").colorbox({
                      rel: "infographic"
                   });


// Randomly pick a quote to start

showQuote();

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




// Sign up to Get Maker Party Update

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
