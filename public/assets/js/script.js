var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

function rightPollgames(pollId, option) {
     let baseUrl = document.querySelector('meta[name="base-url"]').getAttribute('content');
     let url = `${baseUrl}/poll/vote`;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'JSON',
            data: {
                pollID: pollId,
                selectedAnswer: option,
                userID:'',
                IPaddress:'',
                _token: $('meta[name="csrf-token"]').attr('content'),
            },
            success: function(data) {
                showMessagevote(data.message,pollId); // Show message received from the server
                setTimeout(function() {
                    $('input[type=radio][class=polloptioncls]').prop('checked', false);
                    $('.poll'+pollId).fadeOut(); // Hide message after 3 seconds
                }, 3000);
            }
        });
}
function showMessagevote(message,pollId) {
    $('.poll'+pollId).text(message).fadeIn(); // Show message and fade in
}

//Feedback
// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('feedbackphone').addEventListener('input', function(event) {
//         // Replace non-numeric characters with an empty string
//         this.value = this.value.replace(/\D/g, '');
//     });
// });
$(document).ready(function() {
        $('#submitfeedbackBtn').click(function() { 
        if (validateFeedbackForm()) {  
            let baseUrl = document.querySelector('meta[name="base-url"]').getAttribute('content');
            //  let url = `/gstv/front/category/${slug}/${subslug}/${page}`;
            let feedurl = `${baseUrl}/feedback`;
            let formData = $('#submitfeedback').serialize(); // Serialize form data
             // Set up AJAX headers with CSRF token
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
            $.ajax({
                type: 'POST',
                url: feedurl,
                data: formData,
                dataType: 'JSON',
                success: function(response) {
                    // Handle success response
                    showFeedbackMessage(response.msg); // Show message received from the server
                    setTimeout(function() {
                        $('.feedbackmsg').fadeOut(); // Hide message after 3 seconds
                    }, 3000);
                    $('.feedbackmsg').addClass('succmsg');
                    $("#submitfeedback input").val('');
                    $("#submitfeedback textarea").val('');
                },
                error: function(xhr, status, error) {
                    // Handle error response
                    let errors = xhr.responseJSON.errors;
                    $.each(errors, function(key, value) {
                        $('#' + key + 'Error').text(value[0]);
                    });
                }
            });
        }
    });
    
});
function showFeedbackMessage(message) {
    $('.feedbackmsg').text(message).fadeIn(); // Show message and fade in
}
function validateFeedbackForm() {  
    let isValid = true;
    $('#submitfeedback .text-danger').html(''); // Clear previous error messages
    
    // Retrieve form data
    let formData = {
        name: $('#submitfeedback #name').val(),
        email: $('#submitfeedback #email').val(),
        phone: $('#submitfeedback #feedbackphone').val(),
        comment: $('#submitfeedback #comment').val()
    };
    
    // Perform validation checks
    let newErrors = {};

    if (!formData.comment.trim()) {
        newErrors.comment = "Comment is required.";
        isValid = false;
    }

    if (!formData.name.trim()) {
        newErrors.name = "Name is required.";
        isValid = false;
    }

    if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Invalid email format.";
        isValid = false;
    }

    if (!formData.phone.trim()) {
        newErrors.phone = "Phone is required.";
        isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        newErrors.phone = "Invalid Mobile No. Must be 10 digits.";
        isValid = false;
    }
 
    $.each(newErrors, function(key, value) {
        $('#submitfeedback #' + key + 'Error').text(value);
    });
    // Repeat this pattern for other form fields
    return isValid;
    
}
 
function openSharePopup(url) {
    var width = 600;
    var height = 400;
    var left = (screen.width / 2) - (width / 2);
    var top = (screen.height / 2) - (height / 2);
    window.open(url, "Share", "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left);
}

function copylink(url) {
    navigator.clipboard.writeText(url).then(function() { 
        const showToast = (message = "Sample Message", toastType = "info", duration = 5000) => {
            let box = document.createElement("div"); 
            box.classList.add("toast", `toast-${toastType}`);
            box.innerHTML = `<div class="toast-content-wrapper">
                                <div class="toast-message">${message}</div> 
                                <div class="toast-progress"></div>
                            </div>`; 
            
            box.querySelector(".toast-progress").style.animationDuration = `${duration / 1000}s`;

            let toastAlready = document.body.querySelector(".toast");
            if (toastAlready) { 
                toastAlready.remove(); 
            } 

            document.body.appendChild(box);

            setTimeout(() => {
                box.classList.add('hide');
                setTimeout(() => box.remove(), 500);
            }, duration);
        }; 

        showToast("URL copied to clipboard!", "success", 5000);

    }, function(err) {
        console.error('Could not copy text: ', err);
    });
}
function submenu(id)
{
    //$('#catmenu_'+id).toggle();
    $('.submenucls').not('#catmenu_' + id).removeClass('show-block show-flex').hide();
    var submenu = $('#catmenu_' + id);
    if ($(window).width() <= 768) { // Mobile screen size
        submenu.toggleClass('show-flex').css('display', submenu.hasClass('show-flex') ? 'flex' : 'none');
    } else { // Larger screens
        submenu.toggleClass('show-block').css('display', submenu.hasClass('show-block') ? 'block' : 'none');
    }
    $('.submenucls').not('#catmenu_'+id).hide();
    $('.togglemenucls i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
    var icon = $('#leftmenu_' + id).find('i');
    if ($('#catmenu_' + id).is(':visible')) {
        icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
    } else {
        icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    }
}
function adsclick(linktab, imgValue) {
    let baseUrl = document.querySelector('meta[name="base-url"]').getAttribute('content');
    let adsurl = `${baseUrl}/adsclick`;
    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $.ajax({
        url: adsurl,
        method: 'POST',
        data: {
            link: linktab,
            imgValue: imgValue,
            _token: csrfToken
        },
        success: function(response) {
            // Redirect to the link after processing if needed
            let newTab = window.open(linktab, '_blank');
            // newTab.focus();
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error:', error);
        }
    });
}



 
function getlivematchscore() {
    let baseUrl = document.querySelector('meta[name="base-url"]').getAttribute('content');
    let url = `${baseUrl}/livematchscore`;
    

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'JSON',
        success: function(response) {
            let data = JSON.parse(response.livecricket);
            let formattedSeries = response.series.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');   
            let scoreurl = `${baseUrl}/livematchscoredetail/${response.series_id}/${formattedSeries}/${response.match_id}`;
            $(".liveScrollTable").show();
            // Create HTML dynamically
            let matchHTML = `<a href="${scoreurl}">
                <div class="scorecard">
                    <div class="team">
                        <img src="${data.team_b_img}" alt="Team B">
                        <div class="team_name">${data.team_b}</div>
                        <div class="score">${data.team_b_scores || "--"}</div>
                        <div class="over_numb">${data.team_b_over ? `(${data.team_b_over} Ov)` : ""}</div>
                    </div>

                    <div class="vs">
                        <span class="live-badge">LIVE</span>
                        VS
                    </div>

                    <div class="team">
                        <img src="${data.team_a_img}" alt="Team A">
                        <div class="team_name">${data.team_a}</div>
                        <div class="score">${data.team_a_scores || "--"}</div>
                        <div class="over_numb">${data.team_a_over ? `(${data.team_a_over} Ov)` : ""}</div>
                    </div>

                    
                </div>
                <div class="livestatus">રમત ચાલી રહી છે</div></a>
            `;

            // Replace the existing content with new HTML
            $(".liveScrollTable").html(matchHTML);
        },
        error: function() {
            console.log("Error fetching live score.");
        }
    });
}
//getlivematchscore();

// Run every 5 minutes (300,000 ms)
//setInterval(getlivematchscore, 300000);

const isFirefox = typeof InstallTrigger !== 'undefined';

//Social share
if (isFirefox) {
    document.addEventListener('click', function (e) {
        const shareIcons = document.querySelectorAll('.shareIcon');
        const shareDivs = document.querySelectorAll('.sharesocialcls');
    
        let clickedInsideShareIcon = false;
        let clickedInsideSharePopup = false;
        let clickedID = null;
    
        // Check if click is on any shareIcon
        shareIcons.forEach(icon => {
            if (icon.contains(e.target)) {
                clickedInsideShareIcon = true;
                const classes = [...icon.classList];
                const classWithID = classes.find(c => c.startsWith('shareSocialIcon'));
                if (classWithID) {
                    clickedID = classWithID.replace('shareSocialIcon', '');
                }
            }
        });
    
        // Check if clicked inside any share popup
        shareDivs.forEach(div => {
            if (div.contains(e.target)) {
                clickedInsideSharePopup = true;
            }
        });
    
        if (clickedInsideShareIcon) {
            // Toggle the one clicked
            const targetShareDiv = document.querySelector('.sharenews' + clickedID);
            const isVisible = targetShareDiv.style.display === 'block';
    
            // Hide all first
            shareDivs.forEach(div => div.style.display = 'none');
    
            // Show only if it was not already visible
            if (!isVisible) {
                targetShareDiv.style.display = 'block';
            }
        } else if (!clickedInsideSharePopup) {
            // Clicked outside both icon and popup — hide all
            shareDivs.forEach(div => div.style.display = 'none');
        }
    });
}
function shareSocialIcon(id, title, url) {
    $(".sharenews"+id).hide();
    if (navigator.share) {
        // Use Web Share API for supported browsers
        navigator.share({
            title: title,
            text: `${title}`,
            url: url
        })
        .then(() => console.log(`Content with ID ${id} shared successfully.`))
        .catch((error) => console.error(`Error sharing content with ID ${id}:`, error));
    } else {
        // Fallback for unsupported browsers
        showCustomShareSocialPopup(id,title, url);
    }
}

function showCustomShareSocialPopup(id,title, url) {
    // Create the modal container
     $(".sharenews"+id).show();
}
function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Error copying link: ', err);
    });
}

// Function to close the modal
function closeCustomSharePopup() {
    const modal = document.getElementById('customShareModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// click on category icon
$(document).ready(function () {
    $(".menubox").on("click touchend", function (event) {
        event.preventDefault();
        event.stopPropagation(); // Stop bubbling up if needed

        const menuBox = $(".menuTopBox");
        const navbarContainer = $(".navbar .container-fluid");

        menuBox.toggleClass("active");

        if (menuBox.hasClass("active")) {
            navbarContainer.show(); // Show when menu is open
        } else {
            setTimeout(function () {
                navbarContainer.hide(); // Hide after delay
            }, 500);
        }
    });
});
$("#backmenu").click(function(event) {
    $(".menuTopBox").removeClass("active");
    $("body").removeClass("slide-in");
    event.stopPropagation();
});
$(document).click(function(event) {
    // Check if the clicked element is not the menuTopBox or its descendants
    if (!$(event.target).closest(".menuTopBox").length) {
    }
    setTimeout(function() {
        $(".navbar .container-fluid").show();
    }, 500);
});
 