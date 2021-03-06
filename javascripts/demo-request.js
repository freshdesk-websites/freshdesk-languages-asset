$(document).ready(function() {

  var currentLocation;

  initialTrigger = function(locations) {
    var data = {};
    data['ipAddress'] = locations.message.traits.ip_address;
    data['countryCode'] = locations.message.country.iso_code;
    data['countryName'] = locations.message.country.names.en;
    data['cityName'] = locations.message.city.names.en;
    data['regionName'] = locations.message.subdivisions[0].names.en;
    data['zipCode'] = locations.message.postal.code;
    data['latitude'] = locations.message.location.latitude;
    data['longitude'] = locations.message.location.longitude;
    data['timeZone'] = locations.message.location.time_zone;
    data['source'] = 'maxmind';

    return data;
  }

  if (!localStorage.getItem('maxmind_location')) {
    $(document).on('maxmind_locationSet', function(locations) {
      currentLocation = initialTrigger(locations);
      $('#cont_name').val(currentLocation.countryName);
    })
  } else {
    currentLocation = JSON.parse(localStorage.getItem("maxmind_location"));
    $('#cont_name').val(currentLocation.countryName)
  }

  $("#demo-form .demo_form , #form_validate.demo_form").validate({
    highlight: function(element) {
      $(element).parents(".textfield").addClass("error");
    },
    unhighlight: function(element) {
      $(element).parents(".textfield").removeClass("error");
    },
    errorPlacement: function(error, element) {
      $(element).parents(".textfield").append(error);
    },
    errorElement: "em",
    onkeyup: false,
    // Specify the validation rules
    rules: {
      "Name": {
        "required": true
      },
      "Email": {
        "required": true,
        "email": true
      },
      "Phone": {
        "required": true,
        "number": true,
        "minlength": 6
      },
      "Number_of_Agents": {
        "number": true
      }
    },

    // Specify the validation error messages
    messages: {

      "Name": "Please enter your name",
      "Email": {
        required: "Please enter a valid email",
        email: "Please enter a valid email"
      },
      "Phone": {
        required: "Please enter your phone number",
        minlength: 'Please enter at least 6 digits.',
        number: "Please enter a valid number."
      },
      "Number_of_Agents": {
        number: "Please enter a valid number."
      }
    },

    submitHandler: function(form) {
      var demo_request = {
        "Last name": $('#LastName').val(),
        "Email": $('.sc-email, .wb-email').val(),
        "Work": $('#Phone').val(),
        "Number of Agents": $('#Number_of_Agents').val(),
        "Country": $('#cont_name').val(),
        "Sales Campaign": "Demo Request from Website",
        "First Referrer": ($.cookie("fd_fr") || window.parent.location.href),
        "Signup Referrer": ($.cookie("fd_flu") || win.location.href),
        "company": {
          "Name": $("#demo-company_name").val()
        }
      };

      var identifier = $("#Email, #emailfield").val();
      freshsales.identify(identifier, demo_request);

      var autopilotData = {
				'autopilotObject': {
				  'contact': {
					'FirstName': $(form).find('input[name^="Name"]').val(),
					'LastName': "",
					'Email': $(form).find('input[name^="Email"]').val(),
					'Phone': $(form).find('input[name^="Phone"]').val() || '',
					// Please dont forget the !
					'unsubscribed': !($('.demo_form input[name="send_promotions"]').is(':checked')),
					'custom': {
            'string--Agents': $(form).find('input[name^="Number_of_Agents"]').val(),
					  'string--Mailing--Country': currentLocation.countryName
					},
					'Type': 'fdesk',
					'_autopilot_list': 'contactlist_' + 'E50472CC-E573-42AD-BE61-C78FDF870D00',
					'_autopilot_session_id': window.AutopilotAnywhere.sessionId
				  }
				}
			  };

			  $.ajax({
				data: JSON.stringify(autopilotData),
				type: 'POST',
				url: 'https://alfred.freshworks.com/v1/autopilot-post',
				crossDomain: true,
				dataType: 'json',
				contentType: 'application/json',
				complete: function (event, xhr, settings){
				  $('body').trigger('autopilotPostCompleted');
				}
			  });
    }
  });


  $("#demo-form .demo_form, #form_validate.demo_form").on("submit", function(e) {
    e.preventDefault();
    if ($("#demo-form .demo_form, #form_validate.demo_form").valid()) {
      setTimeout(function() {
        $('body').on('autopilotPostCompleted', function() {
          window.location.href = '/demo-completion/';
        });
      }, 500);
    }
      return false;
  });

  // Input Hidden Fields in Demo form

  var demoHiddenInput = {
    "items": "<noscript> <input type='hidden' name='noscript' id='no_script' value='No Script Support'> </noscript><input type='hidden' name='first_referrer' id='first_referrer' value='' /><input type='hidden' name='first_landing_url' id='first_landing_url' value='' />"
  };

  var demoHiddenFields = demoHiddenInput['items'];

  $('#demo-form form .lastInput').after(demoHiddenFields);

});
